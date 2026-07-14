"use client";
/* ============================================================
   NOVA TYRES — Admin v2 · bottom-nav app shell (ported from app-v2.jsx)
   ============================================================ */
import * as React from "react";
import { useState, useEffect, useMemo, useRef } from "react";
import useSWR from "swr";
import { NOVA } from "../../lib/nova/data";
import { IDLE_LOGOUT_ENABLED } from "../../lib/config";
import { swrFetcher, adminFetch } from "../../lib/adminFetch";
import { Icon } from "./icons";
import { Avatar, Drawer, Tooltip, toast, ToastHost, useClickAway, PageErrorBoundary, PageSkeleton, DataErrorState } from "./ui";
import { OverviewPage, StoresPage, StaffPage } from "./pages";
import { MessagesPage, RolesPage } from "./pages-comms";
import { InventoryPage, BookingsPage, ReviewsPage } from "./pages-ops";
import { OrdersPage, SettingsPage } from "./pages-more";
import { WebsitePage } from "./pages-website";
import { CallsPage } from "./pages-calls";
import { ImportPage } from "./pages-import";
import { CustomersPage, DiscountsPage, AuditLogPage } from "./pages-admin";

const BB_TABS = [
  { key: "overview", label: "Home", icon: "home" },
  { key: "messages", label: "Messages", icon: "chat" },
  { key: "inventory", label: "Inventory", icon: "box" },
  { key: "reviews", label: "Reviews", icon: "star" },
  { key: "orders", label: "Orders & Sales", icon: "cart" },
  { key: "content", label: "Website", icon: "globe" },
  { key: "import", label: "Import", icon: "download" },
  { key: "settings", label: "Settings", icon: "settings" },
  { key: "roles", label: "Roles & Access", icon: "shield" },
  { key: "customers", label: "Customers", icon: "users" },
  { key: "discounts", label: "Discount Codes", icon: "tag" },
  { key: "audit", label: "Audit Log", icon: "file" },
];

const TITLES_V2: Record<string, [string, string]> = {
  overview: ["Dashboard", "Home"], messages: ["Messages", "Communications"],
  inventory: ["Products & Inventory", "Inventory"], reviews: ["Reviews & Reputation", "Reviews"],
  orders: ["Orders & Sales", "Sales"], content: ["Website & Content", "Website"],
  import: ["Import Products", "Inventory"], roles: ["Roles & Access", "Account"],
  settings: ["Settings", "Account"], bookings: ["Bookings & Service jobs", "Operations"],
  calls: ["Calls & Enquiries", "Operations"], stores: ["Stores", "Operations"], staff: ["Staff & Users", "Operations"],
  customers: ["Customers", "Operations"], discounts: ["Discount Codes", "Sales"],
  audit: ["Audit Log", "Account"],
};

const PAGES_V2: Record<string, any> = {
  overview: OverviewPage, messages: MessagesPage, inventory: InventoryPage, reviews: ReviewsPage,
  orders: OrdersPage, content: WebsitePage, import: ImportPage, roles: RolesPage, settings: SettingsPage,
  bookings: BookingsPage, calls: CallsPage, stores: StoresPage, staff: StaffPage,
  customers: CustomersPage, discounts: DiscountsPage, audit: AuditLogPage,
};

const ROLES_V2: Record<string, any> = {
  admin: { name: "Alex Morgan", initials: "AM", store: null, label: "Super Admin", sub: "All stores · full access" },
  manager: { name: "Daniel Mercer", initials: "DM", store: "Springvale", label: "Store Manager", sub: "Springvale · VIC" },
};

const notifIco: Record<string, [string, string, string]> = {
  stock: ["alert", "var(--danger)", "color-mix(in oklab,var(--danger) 13%,transparent)"],
  booking: ["calendar", "var(--brand-2)", "color-mix(in oklab,var(--brand) 13%,transparent)"],
  review: ["star", "var(--warn)", "color-mix(in oklab,var(--warn) 15%,transparent)"],
  order: ["cart", "var(--info)", "color-mix(in oklab,var(--info) 13%,transparent)"],
  message: ["chat", "var(--brand-2)", "color-mix(in oklab,var(--brand) 13%,transparent)"],
  enquiry: ["phone", "var(--info)", "color-mix(in oklab,var(--info) 13%,transparent)"],
  staff: ["user", "var(--ink-3)", "var(--chip)"],
};

/* Build the live notification feed from dashboard data (scoped to the viewer).
   Each item has a STABLE id so read-state survives 20s polls. */
function buildNotifs(D: any, scopeBy: (arr: any[], key: string) => any[]) {
  const out: { id: string; type: string; title: string; body: string; time: string }[] = [];
  for (const c of scopeBy(D.conversations || [], "store")) {
    if (c.unread > 0) out.push({ id: `msg-${c.id}-${c.unread}`, type: "message", title: `New message from ${c.customer}`, body: c.topic, time: `${c.time} ago` });
  }
  for (const b of scopeBy(D.bookings || [], "store")) {
    if (b.status === "pending") out.push({ id: `bk-${b.id}`, type: "booking", title: `New booking · ${b.customer}`, body: `${b.service} · ${b.time}`, time: b.time });
  }
  for (const r of scopeBy(D.reviews || [], "store")) {
    if (!r.reply) out.push({ id: `rev-${r.id ?? r.author}`, type: "review", title: `${r.rating}★ review from ${r.author}`, body: r.text?.slice(0, 60) ?? "", time: r.time });
  }
  for (const e of scopeBy(D.calls || [], "store")) {
    if (e.outcome === "callback") out.push({ id: `enq-${e.id}`, type: "enquiry", title: `New enquiry · ${e.customer}`, body: e.topic, time: e.time });
  }
  return out;
}

function RoleSwitcherV2({ role, open, setOpen, onSwitch, R }: any) {
  const ref = useClickAway(() => setOpen(false));
  return (
    <div style={{ position: "relative" }} ref={ref}>
      <button className="tb-icon" style={{ width: 36, height: 36, borderRadius: 50 }} onClick={() => setOpen((o: boolean) => !o)}>
        <Avatar init={R.initials} color={role === "admin" ? "var(--brand)" : "#2D6BE0"} size="sm" />
      </button>
      {open && (
        <div className="menu" style={{ right: 0, top: "calc(100% + 8px)" }}>
          <div className="menu-label">Switch view</div>
          {Object.entries(ROLES_V2).map(([k, v]: any) => (
            <button key={k} className={"menu-item" + (role === k ? " on" : "")} onClick={() => onSwitch(k)}>
              <Avatar init={v.initials} color={k === "admin" ? "var(--brand)" : "#2D6BE0"} size="sm" />
              <div style={{ minWidth: 0 }}><div style={{ fontWeight: 700 }}>{v.label}</div><div className="menu-role-sub">{v.sub}</div></div>
              {role === k && <span className="check"><Icon name="check" /></span>}
            </button>
          ))}
          <div className="menu-sep"></div>
          <button className="menu-item danger" onClick={async () => {
            setOpen(false);
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/login';
          }}><Icon name="logout" />Sign out</button>
        </div>
      )}
    </div>
  );
}

const IDLE_WARN_MS   = 25 * 60 * 1000  // warn at 25 min
const IDLE_LOGOUT_MS = 30 * 60 * 1000  // logout at 30 min

async function doLogout() {
  await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  window.location.href = '/login?reason=idle';
}

function ForcePasswordChange({ onDone }: { onDone: () => void }) {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit() {
    if (pw.length < 8) { setErr("Use at least 8 characters."); return; }
    if (pw !== pw2) { setErr("Passwords don't match."); return; }
    setBusy(true); setErr("");
    try {
      await adminFetch("/api/auth/change-password", "POST", { newPassword: pw });
      toast({ kind: "ok", title: "Password updated", body: "Welcome to Nova Tyres Admin." });
      onDone();
    } catch (e: any) {
      setErr(e?.message || "Couldn't update password."); setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg, #0a0a0a)", padding: 20 }}>
      <div className="panel" style={{ width: "100%", maxWidth: 420, padding: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Set a new password</h2>
        <p className="muted" style={{ fontSize: 13.5, marginBottom: 20 }}>Your account was created with a temporary password. Choose a new one to continue.</p>
        <div className="field"><label>New password</label><input type="password" value={pw} autoFocus onChange={(e) => setPw(e.target.value)} placeholder="At least 8 characters" /></div>
        <div className="field"><label>Confirm password</label><input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") submit(); }} placeholder="Re-enter password" /></div>
        {err && <div style={{ color: "var(--danger, #e5484d)", fontSize: 13, marginBottom: 10 }}>{err}</div>}
        <button className="btn block" disabled={busy} onClick={submit} style={{ marginTop: 8 }}><Icon name="check" />{busy ? "Saving…" : "Set password & continue"}</button>
      </div>
    </div>
  );
}

export default function AppV2() {
  const [theme, setTheme] = useState("light");
  const [role, setRole] = useState("admin");
  const [page, setPage] = useState("overview");
  const [roleMenu, setRoleMenu] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  /* Ids of notifications the user has read. Persisted so a poll/refresh doesn't
     resurface things they've already seen. */
  const [readNotifIds, setReadNotifIds] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem("nova-read-notifs") || "[]")); } catch { return new Set(); }
  });
  const [globalQ, setGlobalQ] = useState("");
  const [sessionAdmin, setSessionAdmin] = useState<any>(null);
  const [idleWarning, setIdleWarning] = useState(false);

  /* Load real identity on mount, then let SWR own the dashboard data. */
  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.admin) { window.location.href = '/login'; return; }
        const a = data.admin;
        setSessionAdmin(a);
        setRole(a.role === 'SUPER_ADMIN' ? 'admin' : 'manager');
      })
      .catch(() => { window.location.href = '/login'; });
  }, []);

  /* SWR owns all dashboard data. `refetch()` (exposed on ctx) revalidates after
     any write so the UI reflects server truth and survives a refresh.
     Polls every 20s (and on tab focus / reconnect) so bookings, messages and
     notifications stay live without a manual refresh. */
  const { data: liveData, error: dataError, mutate: refetch } = useSWR(
    sessionAdmin ? '/api/admin/data' : null,
    swrFetcher,
    { refreshInterval: 20000, revalidateOnFocus: true, revalidateOnReconnect: true },
  );

  /* 30-min inactivity logout — resets on any mouse/keyboard/touch event.
     Gated by IDLE_LOGOUT_ENABLED (currently off); flip that flag to re-enable. */
  useEffect(() => {
    if (!IDLE_LOGOUT_ENABLED) return;

    let warnTimer:   ReturnType<typeof setTimeout>;
    let logoutTimer: ReturnType<typeof setTimeout>;

    function reset() {
      setIdleWarning(false);
      clearTimeout(warnTimer);
      clearTimeout(logoutTimer);
      warnTimer   = setTimeout(() => setIdleWarning(true),  IDLE_WARN_MS);
      logoutTimer = setTimeout(() => doLogout(),            IDLE_LOGOUT_MS);
    }

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach(e => window.addEventListener(e, reset, { passive: true }));
    reset(); // start the timer on mount

    return () => {
      events.forEach(e => window.removeEventListener(e, reset));
      clearTimeout(warnTimer);
      clearTimeout(logoutTimer);
    };
  }, []);

  /* Theme + persisted preference (client only) */
  useEffect(() => {
    const saved = localStorage.getItem("nova-theme-v2");
    if (saved) setTheme(saved);
  }, []);
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("nova-theme-v2", theme);
  }, [theme]);

  /* Static glass/radius defaults (replaces the design-tool tweaks panel) */
  useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty("--glass-blur", "22px");
    r.setProperty("--glass-alpha", "0.66");
    r.setProperty("--glass-alpha-2", "0.50");
    r.setProperty("--radius", "20px");
  }, []);

  useEffect(() => { document.querySelector(".content")?.scrollTo(0, 0); }, [page]);

  /* Use real session identity when available, fall back to mock during load */
  const R_mock = ROLES_V2[role];
  const realName = sessionAdmin
    ? `${sessionAdmin.firstName} ${sessionAdmin.lastName}`
    : R_mock.name;
  const realInitials = sessionAdmin
    ? `${sessionAdmin.firstName[0]}${sessionAdmin.lastName[0]}`
    : R_mock.initials;
  const realStore = sessionAdmin?.store?.name || R_mock.store;

  const R = { ...R_mock, name: realName, initials: realInitials, store: realStore };

  /* Merge real data with NOVA mock fallback — pages do `const D = ctx.D || NOVA` */
  const D = liveData
    ? { ...NOVA, ...liveData }
    : NOVA;

  const ctx = {
    role, name: R.name, firstName: R.name.split(" ")[0], initials: R.initials, store: R.store,
    theme, setTheme, mini: false, setMini: () => {}, go: setPage,
    D,  /* real data — pages use ctx.D instead of importing NOVA directly */
    refetch,  /* call after any write to revalidate ctx.D from the server */
    scopeStores: (arr: any[]) => role === "manager" ? arr.filter((s) => s.name === R.store) : arr,
    scopeBy: (arr: any[], key: string) => role === "manager" ? arr.filter((x) => x[key] === R.store) : arr,
  };

  const badges: Record<string, number> = {
    messages: ctx.scopeBy(D.conversations, "store").reduce((s: number, c: any) => s + c.unread, 0),
    reviews: ctx.scopeBy(D.reviews, "store").filter((r: any) => !r.reply).length,
  };

  /* Live notification feed, derived from polled data. Read-state persists. */
  const notifs = useMemo(() => {
    return buildNotifs(D, ctx.scopeBy).map((n) => ({ ...n, unread: !readNotifIds.has(n.id) }));
  }, [D, role, R.store, readNotifIds]);
  const unread = notifs.filter((n) => n.unread).length;

  function markRead(ids: string[]) {
    setReadNotifIds((prev) => {
      const next = new Set(prev); ids.forEach((id) => next.add(id));
      try { localStorage.setItem("nova-read-notifs", JSON.stringify([...next].slice(-200))); } catch {}
      return next;
    });
  }

  /* Toast when genuinely new items arrive between polls (not on first load). */
  const seenIds = useRef<Set<string> | null>(null);
  useEffect(() => {
    const current = new Set(notifs.map((n) => n.id));
    if (seenIds.current === null) { seenIds.current = current; return; }  // skip first render
    const fresh = notifs.filter((n) => !seenIds.current!.has(n.id) && n.unread);
    if (fresh.length === 1) toast({ kind: "info", title: fresh[0].title, body: fresh[0].body });
    else if (fresh.length > 1) toast({ kind: "info", title: `${fresh.length} new notifications`, body: "Bookings, messages and enquiries just came in." });
    seenIds.current = current;
  }, [notifs]);

  const Page = PAGES_V2[page];
  const [title] = TITLES_V2[page] || [page, ""];
  const [, section] = TITLES_V2[page] || ["", ""];

  function switchRole(r: string) { setRole(r); setRoleMenu(false); setPage("overview"); toast({ kind: "info", title: "Switched to " + ROLES_V2[r].label, body: ROLES_V2[r].sub }); }

  /* Force a password change on first login before the dashboard is reachable. */
  if (sessionAdmin?.mustChangePassword) {
    return <ForcePasswordChange onDone={() => setSessionAdmin({ ...sessionAdmin, mustChangePassword: false })} />;
  }

  return (
    <div className="app">
      {/* TOPBAR */}
      <header className="topbar">
        <div className="tb-left">
          <span className="tb-breadcrumb">Nova Tyres › {section || title}</span>
          <div className="tb-title"><h1>{title}</h1></div>
        </div>

        <div className="tb-center">
          <div className="tb-logo-card">
            <svg viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="21" cy="21" r="17" stroke="#D4AF37" strokeWidth="1.5" fill="none" />
              <circle cx="21" cy="21" r="12" stroke="#D4AF37" strokeWidth="1" fill="none" />
              <circle cx="21" cy="21" r="3" fill="#D4AF37" />
              {[0, 60, 120, 180, 240, 300].map((deg, i) => {
                const r = Math.PI * deg / 180;
                const x1 = 21 + 4 * Math.cos(r), y1 = 21 + 4 * Math.sin(r);
                const x2 = 21 + 11 * Math.cos(r), y2 = 21 + 11 * Math.sin(r);
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#D4AF37" strokeWidth="1.2" />;
              })}
              <circle cx="21" cy="8" r="1.5" fill="#D4AF37" />
              <circle cx="21" cy="34" r="1.5" fill="#D4AF37" />
              <circle cx="8" cy="21" r="1.5" fill="#D4AF37" />
              <circle cx="34" cy="21" r="1.5" fill="#D4AF37" />
            </svg>
          </div>
        </div>

        <div className="tb-right">
          <label className="tb-search">
            <Icon name="search" />
            <input value={globalQ} onChange={(e) => setGlobalQ(e.target.value)} placeholder="Search...." />
          </label>
          <div style={{ position: "relative" }}>
            <button className="tb-icon" onClick={() => setNotifOpen(true)}><Icon name="bell" />{unread > 0 && <span className="dot"></span>}</button>
          </div>
          <RoleSwitcherV2 role={role} open={roleMenu} setOpen={setRoleMenu} onSwitch={switchRole} R={R} />
        </div>
      </header>

      {/* IDLE WARNING BANNER — appears at 25 min, dismissed on any activity */}
      {idleWarning && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 99999,
          background: "color-mix(in oklab, var(--warn, #f59e0b) 12%, transparent)",
          borderBottom: "1px solid color-mix(in oklab, var(--warn, #f59e0b) 30%, transparent)",
          backdropFilter: "blur(12px)",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
          padding: "10px 20px", fontSize: 13.5, fontWeight: 600,
          color: "var(--ink, #111)",
        }}>
          <Icon name="clock" style={{ width: 16, height: 16, color: "var(--warn, #f59e0b)", flexShrink: 0 }} />
          <span>You'll be signed out in <b>5 minutes</b> due to inactivity. Move your mouse or press a key to stay signed in.</span>
          <button onClick={() => setIdleWarning(false)}
            style={{ marginLeft: 8, padding: "4px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--glass-solid)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            Stay signed in
          </button>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="content scroll">
        <div className="page-anim" key={page}>
          {dataError && !liveData ? (
            <DataErrorState onRetry={() => refetch()} />
          ) : !liveData ? (
            <PageSkeleton />
          ) : (
            <PageErrorBoundary resetKey={page}>
              <Page ctx={ctx} nav={setPage} />
            </PageErrorBoundary>
          )}
        </div>
      </main>

      {/* BOTTOM DOCK */}
      <nav className="bottombar">
        <button className="bb-user-btn" onClick={() => setRoleMenu((o) => !o)}>
          <Avatar init={R.initials} color={role === "admin" ? "var(--brand)" : "#2D6BE0"} size="sm" />
        </button>

        {BB_TABS.map((tab) => (
          <button key={tab.key} className={"bb-item" + (page === tab.key ? " active" : "")} onClick={() => setPage(tab.key)}>
            <span className="bb-ico"><Icon name={tab.icon} /></span>
            <span className="bb-label">{tab.label}</span>
            {badges[tab.key] > 0 && <span className="bb-badge">{badges[tab.key]}</span>}
          </button>
        ))}

        <span className="bb-sep"></span>
        <Tooltip label={"Switch to " + (role === "admin" ? "Store Manager" : "Super Admin")}>
          <button className="bb-role" onClick={() => switchRole(role === "admin" ? "manager" : "admin")}>
            <Icon name="swap" />
          </button>
        </Tooltip>
      </nav>

      {/* NOTIFICATIONS DRAWER */}
      {notifOpen && (
        <Drawer title="Notifications" sub={unread + " unread"} onClose={() => setNotifOpen(false)}
          foot={<button className="btn ghost block" onClick={() => { markRead(notifs.map((n) => n.id)); toast({ kind: "ok", title: "All caught up" }); }}><Icon name="check" />Mark all as read</button>}>
          {notifs.length === 0 ? (
            <div style={{ padding: "48px 20px", textAlign: "center", color: "var(--ink-3)" }}>
              <Icon name="bell" style={{ width: 30, height: 30, opacity: 0.5 }} />
              <p style={{ marginTop: 10, fontSize: 13.5 }}>You're all caught up.</p>
            </div>
          ) : notifs.map((n) => {
            const [ic, c, bg] = notifIco[n.type] || notifIco.staff;
            return (
              <div key={n.id} className={"notif" + (n.unread ? " unread" : "")} onClick={() => markRead([n.id])}>
                <span className="notif-ico" style={{ background: bg, color: c }}><Icon name={ic} /></span>
                <div className="notif-txt"><b>{n.title}</b><div>{n.body}</div><div className="notif-time">{n.time}</div></div>
                {n.unread && <span className="notif-unreaddot"></span>}
              </div>
            );
          })}
        </Drawer>
      )}

      <ToastHost />
    </div>
  );
}
