"use client";
/* ============================================================
   NOVA TYRES — Admin · pages (more): Orders, Settings (ported)
   (ContentPage from the prototype is superseded by WebsitePage)
   ============================================================ */
import * as React from "react";
import { useState, useEffect } from "react";
import { NOVA } from "../../lib/nova/data";
import { adminFetch } from "../../lib/adminFetch";
import { Icon } from "./icons";
import { Avatar, Switch, Tooltip, toast, SearchBox, EmptyState, usePager, Pager, Drawer, ConfirmModal } from "./ui";
import { downloadCSV } from "../../lib/csv";

type Ctx = any;

/* ===================== ORDERS ===================== */
const ORDER_FLOW = ["pending", "confirmed", "fitted", "cancelled"] as const;
const ORDER_TINT: Record<string, string> = { pending: "warn", confirmed: "info", fitted: "ok", cancelled: "danger", refunded: "danger" };
const PAY_TINT: Record<string, string> = { paid: "ok", unpaid: "warn", refunded: "danger", partially_refunded: "warn" };
const prettyStatus = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export function OrdersPage({ ctx }: { ctx: Ctx; nav?: any }) {
  const D = (ctx as any)?.D || NOVA;
  const all = ctx.scopeBy(D.orders, "store");
  const webOrders = all.filter((o: any) => o.source === "order");
  const [q, setQ] = useState("");
  const [manage, setManage] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [refund, setRefund] = useState<any>(null);   // order pending refund confirm
  const [refundAmt, setRefundAmt] = useState("");
  const [refundReason, setRefundReason] = useState("");

  const list = webOrders.filter((o: any) => (o.customer + o.items + o.ref).toLowerCase().includes(q.toLowerCase()));
  const pager = usePager(list, 15);
  const oTotal = webOrders.length;
  const oRevenue = webOrders.reduce((s: number, o: any) => s + o.total, 0);

  async function changeStatus(order: any, status: string) {
    if (!order.id || busy) return;
    setBusy(true);
    try {
      await adminFetch(`/api/admin/orders/${order.id}`, "PATCH", { status: status.toUpperCase() });
      toast({ kind: "ok", title: "Order updated", body: `${order.ref} is now ${status}.` });
      await ctx.refetch?.();
      setManage({ ...order, status });
    } catch (e: any) {
      toast({ kind: "err", title: "Couldn't update order", body: e?.message || "Please try again." });
    } finally { setBusy(false); }
  }

  async function doRefund() {
    const order = refund; if (!order?.id) return;
    const amt = parseFloat(refundAmt);
    const partial = refundAmt.trim() !== "" && amt < order.total;
    setBusy(true);
    try {
      const res: any = await adminFetch(`/api/admin/orders/${order.id}/refund`, "POST", {
        ...(partial ? { amount: amt } : {}),
        ...(refundReason.trim() ? { reason: refundReason.trim() } : {}),
      });
      toast({ kind: "ok", title: "Refund processed", body: `A$${res.amount.toFixed(2)} refunded${order.hasStripe ? " via Stripe" : " (manual)"}.` });
      await ctx.refetch?.();
      setRefund(null); setRefundAmt(""); setRefundReason(""); setManage(null);
    } catch (e: any) {
      toast({ kind: "err", title: "Refund failed", body: e?.message || "Please try again." });
    } finally { setBusy(false); }
  }

  function exportCSV() {
    if (!webOrders.length) { toast({ kind: "info", title: "Nothing to export", body: "There are no orders yet." }); return; }
    downloadCSV("nova-orders", ["Order", "Customer", "Email", "Products", "Store", "Date", "Total", "Status", "Payment"],
      webOrders.map((o: any) => [o.ref, o.customer, o.email, o.items, o.store, o.date, o.total.toFixed(2), o.status, o.paymentStatus ?? ""]));
    toast({ kind: "ok", title: "Exported", body: `${webOrders.length} orders downloaded as CSV.` });
  }

  return (
    <div className="page page-enter">
      <div className="pagehead">
        <div className="ph-txt"><h2>Orders</h2><p>Website orders — manage fulfilment and refunds.</p></div>
        <div className="ph-actions">
          <button className="btn ghost" onClick={exportCSV}><Icon name="download" />Export</button>
        </div>
      </div>

      <div className="summary-row" style={{ marginBottom: 18 }}>
        <div className="panel mini-stat"><div className="ms-label"><Icon name="cart" />Total orders</div><div className="ms-val">{oTotal}</div></div>
        <div className="panel mini-stat"><div className="ms-label"><Icon name="dollar" />Revenue</div><div className="ms-val">${oRevenue.toLocaleString()}</div></div>
      </div>

      <div className="toolbar">
        <SearchBox value={q} onChange={setQ} placeholder="Search orders…" grow />
      </div>

      <div className="panel">
        {list.length === 0 ? (
          <EmptyState icon="globe" title="No orders" text="Nothing matches your search." />
        ) : (
          <div className="table-wrap">
            <table className="tbl">
              <thead><tr><th>Order</th><th>Customer</th><th>Products</th><th>Store</th><th>Date</th><th>Total</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {pager.slice.map((o: any) => (
                  <tr key={o.id ?? o.ref}>
                    <td><span className="mono" style={{ fontSize: 12.5, fontWeight: 700 }}>{o.ref}</span></td>
                    <td><div className="cell-main">{o.customer}</div><div className="cell-sub">{o.email}</div></td>
                    <td className="muted" style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.items}</td>
                    <td className="nowrap muted">{o.store}</td>
                    <td className="muted nowrap">{o.date}</td>
                    <td className="mono cell-main">${o.total.toLocaleString()}</td>
                    <td><span className={"badge dotless " + (ORDER_TINT[o.status] || "")}>{prettyStatus(o.status)}</span></td>
                    <td>{o.id && <button className="btn ghost sm" onClick={() => setManage(o)}><Icon name="edit" />Manage</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Pager pager={pager} unit="orders" />

      {/* ── Manage order drawer ── */}
      {manage && (
        <Drawer title={manage.ref} sub={`${manage.customer} · ${manage.date}`} onClose={() => setManage(null)}>
          <div className="field"><label>Products</label><div style={{ fontSize: 13.5, color: "var(--ink-2)" }}>{manage.items}</div></div>
          <div className="form-grid">
            <div className="field"><label>Total</label><div className="mono" style={{ fontSize: 16, fontWeight: 800 }}>A${manage.total.toFixed(2)}</div></div>
            <div className="field"><label>Payment</label><div><span className={"badge dotless " + (PAY_TINT[manage.paymentStatus] || "")}>{prettyStatus(manage.paymentStatus || "unpaid")}</span></div></div>
          </div>

          <div className="field" style={{ marginTop: 6 }}>
            <label>Fulfilment status</label>
            {manage.status === "refunded" ? (
              <div className="role-banner" style={{ marginTop: 4 }}><Icon name="info" /><span>This order was refunded and can no longer change status.</span></div>
            ) : (
              <div className="tabs" style={{ marginTop: 4, flexWrap: "wrap" }}>
                {ORDER_FLOW.map((s) => (
                  <button key={s} className={manage.status === s ? "on" : ""} disabled={busy || manage.status === s} onClick={() => changeStatus(manage, s)}>{prettyStatus(s)}</button>
                ))}
              </div>
            )}
          </div>

          {manage.status !== "refunded" && manage.paymentStatus !== "refunded" && (
            <div className="panel" style={{ marginTop: 16, padding: 16, borderColor: "color-mix(in oklab,var(--danger) 25%,transparent)" }}>
              <div style={{ fontSize: 13.5, fontWeight: 800, marginBottom: 4 }}>Refund</div>
              <p className="muted" style={{ fontSize: 12.5, marginBottom: 12 }}>{manage.hasStripe ? "Refunds go back to the customer's card via Stripe." : "No card payment on file — this records a manual (cash/Zip) refund."}</p>
              <div className="form-grid">
                <div className="field"><label>Amount (blank = full A${manage.total.toFixed(2)})</label><input type="number" min="0" step="0.01" max={manage.total} value={refundAmt} onChange={(e) => setRefundAmt(e.target.value)} placeholder={manage.total.toFixed(2)} /></div>
                <div className="field"><label>Reason (optional)</label><input value={refundReason} onChange={(e) => setRefundReason(e.target.value)} placeholder="e.g. Customer changed mind" /></div>
              </div>
              <button className="btn danger block" style={{ marginTop: 6 }} disabled={busy} onClick={() => setRefund(manage)}><Icon name="dollar" />Issue refund</button>
            </div>
          )}
        </Drawer>
      )}

      {refund && (
        <ConfirmModal
          title="Confirm refund"
          body={`Refund A$${(refundAmt.trim() && parseFloat(refundAmt) < refund.total ? parseFloat(refundAmt) : refund.total).toFixed(2)} for ${refund.ref}? ${refund.hasStripe ? "This will refund the customer's card via Stripe and cannot be undone." : "This records a manual refund."}`}
          confirmLabel={busy ? "Processing…" : "Refund"}
          danger icon="dollar"
          onConfirm={doRefund}
          onClose={() => setRefund(null)}
        />
      )}
    </div>
  );
}

/* ===================== SETTINGS ===================== */
const SET_NAV: [string, string, string][] = [
  ["profile", "Profile", "user"], ["appearance", "Appearance", "palette"],
  ["roles", "Roles & access", "shield"], ["notifications", "Notifications", "bell"],
  ["billing", "Billing", "card"],
];
const DEFAULT_NOTIF = { bookings: true, reviews: true, stock: true, marketing: false, weekly: true };

export function SettingsPage({ ctx }: { ctx: Ctx; nav?: any }) {
  const [tab, setTab] = useState("appearance");
  const [notif, setNotif] = useState<Record<string, boolean>>(DEFAULT_NOTIF);
  const [profile, setProfile] = useState<{ firstName: string; lastName: string; phone: string; email: string; role: string }>({ firstName: "", lastName: "", phone: "", email: "", role: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  // Load the real profile + saved notification prefs.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me").then((r) => (r.ok ? r.json() : null)).then((d) => {
      if (cancelled || !d?.admin) return;
      const a = d.admin;
      setProfile({ firstName: a.firstName || "", lastName: a.lastName || "", phone: a.phone || "", email: a.email || "", role: a.role || "" });
      if (a.notificationPrefs && typeof a.notificationPrefs === "object") setNotif({ ...DEFAULT_NOTIF, ...a.notificationPrefs });
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  async function saveProfile() {
    if (savingProfile) return;
    if (!profile.firstName.trim() || !profile.lastName.trim()) { toast({ kind: "err", title: "Name required", body: "Enter your first and last name." }); return; }
    setSavingProfile(true);
    try {
      await adminFetch("/api/admin/profile", "PATCH", { firstName: profile.firstName.trim(), lastName: profile.lastName.trim(), phone: profile.phone.trim() });
      toast({ kind: "ok", title: "Profile saved", body: "Your details have been updated." });
      ctx.refetch?.();
    } catch (e: any) {
      toast({ kind: "err", title: "Couldn't save profile", body: e?.message || "Please try again." });
    } finally { setSavingProfile(false); }
  }

  async function saveNotif(next: Record<string, boolean>) {
    const prev = notif;
    setNotif(next);   // optimistic
    try {
      await adminFetch("/api/admin/profile", "PATCH", { notificationPrefs: next });
    } catch (e: any) {
      setNotif(prev);   // rollback
      toast({ kind: "err", title: "Couldn't save preference", body: e?.message || "Please try again." });
    }
  }

  const roleLabel = profile.role === "SUPER_ADMIN" ? "Super Administrator" : profile.role === "STORE_MANAGER" ? "Store Manager" : ctx.role === "admin" ? "Super Administrator" : "Store Manager";

  return (
    <div className="page page-enter">
      <div className="pagehead"><div className="ph-txt"><h2>Settings</h2><p>Manage your profile, appearance and how the console works.</p></div></div>

      <div className="settings-layout">
        <div className="settings-nav">
          {SET_NAV.map(([k, l, ic]) => <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}><Icon name={ic} />{l}</button>)}
        </div>

        <div>
          {tab === "profile" && (
            <div className="panel" style={{ padding: 24 }}>
              <div className="hstack" style={{ gap: 16, marginBottom: 22 }}>
                <Avatar init={ctx.initials} color="var(--brand)" size="xl" />
                <div><div style={{ fontSize: 18, fontWeight: 800 }}>{(profile.firstName + " " + profile.lastName).trim() || ctx.name}</div><div className="muted" style={{ fontSize: 13.5 }}>{roleLabel}{ctx.role === "manager" ? " · " + ctx.store : ""}</div></div>
              </div>
              <div className="form-grid">
                <div className="field"><label>First name</label><input value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} /></div>
                <div className="field"><label>Last name</label><input value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} /></div>
              </div>
              <div className="form-grid">
                <div className="field"><label>Email</label><input value={profile.email} disabled title="Email is your login — contact an administrator to change it." /></div>
                <div className="field"><label>Phone</label><input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="0412 000 000" /></div>
              </div>
              <div className="form-grid">
                <div className="field"><label>Role</label><input value={roleLabel} disabled /></div>
                <div className="field"></div>
              </div>
              <div className="hstack" style={{ justifyContent: "flex-end", marginTop: 8 }}><button className="btn" disabled={savingProfile} onClick={saveProfile}><Icon name="check" />{savingProfile ? "Saving…" : "Save changes"}</button></div>
            </div>
          )}

          {tab === "appearance" && (
            <div className="panel" style={{ padding: 6 }}>
              <div style={{ padding: "16px 20px 4px" }}><h3 style={{ fontSize: 15.5, fontWeight: 800 }}>Appearance</h3><p className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>Personalise how the console looks.</p></div>
              <div style={{ padding: "8px 20px 18px" }}>
                <div className="set-row"><Icon name={ctx.theme === "dark" ? "moon" : "sun"} style={{ width: 20, color: "var(--ink-3)" }} /><div className="set-txt"><b>Theme</b><span>Switch between light and dark glass.</span></div>
                  <div className="seg"><button className={ctx.theme === "light" ? "on" : ""} onClick={() => ctx.setTheme("light")}>Light</button><button className={ctx.theme === "dark" ? "on" : ""} onClick={() => ctx.setTheme("dark")}>Dark</button></div>
                </div>
                <div className="set-row"><Icon name="layers" style={{ width: 20, color: "var(--ink-3)" }} /><div className="set-txt"><b>Glass intensity</b><span>How frosted the panels appear.</span></div>
                  <input type="range" min="6" max="34" defaultValue="22" style={{ width: 150 }} onChange={(e) => document.documentElement.style.setProperty("--glass-blur", e.target.value + "px")} />
                </div>
                <div className="set-row"><Icon name="info" style={{ width: 20, color: "var(--ink-3)" }} /><div className="set-txt"><b>Corner roundness</b><span>Softer or sharper corners.</span></div>
                  <input type="range" min="6" max="28" defaultValue="20" style={{ width: 150 }} onChange={(e) => document.documentElement.style.setProperty("--radius", e.target.value + "px")} />
                </div>
              </div>
            </div>
          )}

          {tab === "roles" && (
            <div className="panel" style={{ padding: 6 }}>
              <div style={{ padding: "16px 20px 8px", display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ flex: 1 }}><h3 style={{ fontSize: 15.5, fontWeight: 800 }}>Roles &amp; permissions</h3><p className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>A quick summary. Build custom roles on the full page.</p></div>
                <button className="btn sm" onClick={() => ctx.go("roles")}><Icon name="shield" />Manage roles</button>
              </div>
              <div style={{ padding: "4px 20px 16px" }}>
                <table className="perm-grid">
                  <thead><tr><th>Capability</th>
                    <th className="ctr"><Tooltip label="Full access to every store and setting."><span>Super Admin</span></Tooltip></th>
                    <th className="ctr"><Tooltip label="Limited to their own store's data."><span>Store Manager</span></Tooltip></th>
                    <th className="ctr"><Tooltip label="Day-to-day job tasks only."><span>Mechanic</span></Tooltip></th>
                  </tr></thead>
                  <tbody>
                    {[["View all stores", 1, 0, 0], ["Manage bookings", 1, 1, 1], ["Edit inventory", 1, 1, 0], ["Manage staff", 1, 1, 0], ["Reply to reviews", 1, 1, 0], ["Publish website pages", 1, 0, 0], ["View finances", 1, 1, 0], ["Delete stores", 1, 0, 0]].map((r: any, i: number) => (
                      <tr key={i}><td className="cell-main" style={{ fontWeight: 600 }}>{r[0]}</td>
                        {[1, 2, 3].map((c) => <td className="ctr" key={c}>{r[c] ? <span className="perm-check"><Icon name="check" /></span> : <span className="perm-no"><Icon name="x" style={{ width: 16, height: 16 }} /></span>}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "notifications" && (
            <div className="panel" style={{ padding: 6 }}>
              <div style={{ padding: "16px 20px 4px" }}><h3 style={{ fontSize: 15.5, fontWeight: 800 }}>Notifications</h3><p className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>Choose what we ping you about.</p></div>
              <div style={{ padding: "6px 20px 18px" }}>
                {[["bookings", "New bookings & call-backs", "When a customer requests a service."], ["reviews", "New reviews", "Especially anything under 4 stars."], ["stock", "Low-stock alerts", "When a product drops below its threshold."], ["weekly", "Weekly summary", "A Monday digest of last week's numbers."], ["marketing", "Product & marketing tips", "Occasional ideas to grow your stores."]].map(([k, t, s]) => (
                  <div className="set-row" key={k}><div className="set-txt"><b>{t}</b><span>{s}</span></div><Switch on={notif[k as string]} onChange={(v) => saveNotif({ ...notif, [k as string]: v })} /></div>
                ))}
              </div>
            </div>
          )}

          {tab === "billing" && (
            <div className="panel" style={{ padding: 24 }}>
              <div className="role-banner" style={{ marginTop: 0 }}><Icon name="sparkles" /><span>You're on the <b>Nova Business</b> plan — 6 stores, unlimited staff.</span></div>
              <div className="set-row"><Icon name="card" style={{ width: 20, color: "var(--ink-3)" }} /><div className="set-txt"><b>Visa ending 4242</b><span>Next invoice 1 July 2026 · $349/mo</span></div><button className="btn ghost sm" onClick={() => toast({ kind: "info", title: "Update payment method" })}>Update</button></div>
              <div className="set-row"><Icon name="download" style={{ width: 20, color: "var(--ink-3)" }} /><div className="set-txt"><b>Invoices</b><span>Download past statements.</span></div><button className="btn ghost sm" onClick={() => toast({ kind: "ok", title: "Invoice downloaded" })}>Latest</button></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
