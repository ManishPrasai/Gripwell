-- ============================================================================
-- Row-Level Security — write policies for admin-managed tables
-- Run in the Supabase SQL editor. Idempotent (safe to re-run).
-- ============================================================================
--
-- IMPORTANT: The admin app talks to Postgres through Prisma using the service
-- role (the `postgres`/service connection in DATABASE_URL), which BYPASSES RLS
-- entirely. So these policies are NOT what makes admin writes work — the write
-- routes are already gated in application code (see lib/mutation.ts: auth +
-- RBAC + store-scope + audit).
--
-- These policies are defense-in-depth: they ensure that IF any table is ever
-- reached by the `anon` or `authenticated` roles (e.g. client-side Supabase
-- access from the customer site), only the service role can write. They mirror
-- the existing read policies so the security posture is consistent across CRUD.
-- ============================================================================

do $$
declare
  t text;
  tables text[] := array[
    'Appointment', 'Tyre', 'Wheel', 'Order', 'OrderItem', 'Review',
    'Store', 'StoreHours', 'StoreInventory', 'AdminUser', 'Discount',
    'DiscountUsage', 'PageSEO', 'Enquiry', 'EnquiryNote'
  ];
begin
  foreach t in array tables loop
    -- Only touch tables that actually exist.
    if to_regclass(format('public.%I', t)) is not null then
      execute format('alter table public.%I enable row level security;', t);

      -- Full CRUD for the service role (what Prisma uses). FOR ALL covers
      -- SELECT/INSERT/UPDATE/DELETE, so it matches the read policy and adds writes.
      execute format('drop policy if exists %I on public.%I;', 'service_role_full_access', t);
      execute format($f$
        create policy %I on public.%I
          for all
          to service_role
          using (true)
          with check (true);
      $f$, 'service_role_full_access', t);
    end if;
  end loop;
end $$;

-- Verify:
--   select tablename, policyname, cmd, roles
--   from pg_policies
--   where schemaname = 'public'
--   order by tablename, policyname;
