"use client";
/* ============================================================
   NOVA TYRES — Admin v2 · bottom-nav app shell (ported from app-v2.jsx)
   ============================================================ */
import * as React from "react";
import { useState, useEffect } from "react";
import { NOVA } from "../../lib/nova/data";
import { Icon } from "./icons";
import { Avatar, Drawer, Tooltip, toast, ToastHost, useClickAway } from "./ui";
import { OverviewPage, StoresPage, StaffPage } from "./pages";
import { MessagesPage, RolesPage } from "./pages-comms";
import { InventoryPage, BookingsPage, ReviewsPage } from "./pages-ops";
import { OrdersPage, SettingsPage } from "./pages-more";
import { WebsitePage } from "./pages-website";
import { CallsPage } from "./pages-calls";
import { ImportPage } from "./pages-import";

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
];

const TITLES_V2: Record<string, [string, string]> = {
  overview: ["Dashboard", "Home"], messages: ["Messages", "Communications"],
  inventory: ["Products & Inventory", "Inventory"], reviews: ["Reviews & Reputation", "Reviews"],
  orders: ["Orders & Sales", "Sales"], content: ["Website & Content", "Website"],
  import: ["Import Products", "Inventory"], roles: ["Roles & Access", "Account"],
  settings: ["Settings", "Account"], bookings: ["Bookings & Service jobs", "Operations"],
  calls: ["Calls & Enquiries", "Operations"], stores: ["Stores", "Operations"], staff: ["Staff & Users", "Operations"],
};

const PAGES_V2: Record<string, any> = {
  overview: OverviewPage, messages: MessagesPage, inventory: InventoryPage, reviews: ReviewsPage,
  orders: OrdersPage, content: WebsitePage, import: ImportPage, roles: RolesPage, settings: SettingsPage,
  bookings: BookingsPage, calls: CallsPage, stores: StoresPage, staff: StaffPage,
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
  staff: ["user", "var(--ink-3)", "var(--chip)"],
};

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
          <button className="menu-item danger" onClick={() => { setOpen(false); toast({ kind: "info", title: "Signed out" }); }}><Icon name="logout" />Sign out</button>
        </div>
      )}
    </div>
  );
}

export default function AppV2() {
  const [theme, setTheme] = useState("light");
  const [role, setRole] = useState("admin");
  const [page, setPage] = useState("overview");
  const [roleMenu, setRoleMenu] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState<any[]>(NOVA.notifications);
  const [globalQ, setGlobalQ] = useState("");

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

  const R = ROLES_V2[role];
  const D = NOVA;
  const unread = notifs.filter((n) => n.unread).length;

  const ctx = {
    role, name: R.name, firstName: R.name.split(" ")[0], initials: R.initials, store: R.store,
    theme, setTheme, mini: false, setMini: () => {}, go: setPage,
    scopeStores: (arr: any[]) => role === "manager" ? arr.filter((s) => s.name === R.store) : arr,
    scopeBy: (arr: any[], key: string) => role === "manager" ? arr.filter((x) => x[key] === R.store) : arr,
  };

  const badges: Record<string, number> = {
    messages: ctx.scopeBy(D.conversations, "store").reduce((s: number, c: any) => s + c.unread, 0),
    reviews: ctx.scopeBy(D.reviews, "store").filter((r: any) => !r.reply).length,
  };

  const Page = PAGES_V2[page];
  const [title] = TITLES_V2[page] || [page, ""];
  const [, section] = TITLES_V2[page] || ["", ""];

  function switchRole(r: string) { setRole(r); setRoleMenu(false); setPage("overview"); toast({ kind: "info", title: "Switched to " + ROLES_V2[r].label, body: ROLES_V2[r].sub }); }

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

      {/* MAIN CONTENT */}
      <main className="content scroll">
        <div className="page-anim" key={page}>
          <Page ctx={ctx} nav={setPage} />
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
          foot={<button className="btn ghost block" onClick={() => { setNotifs((n) => n.map((x) => ({ ...x, unread: false }))); toast({ kind: "ok", title: "All caught up" }); }}><Icon name="check" />Mark all as read</button>}>
          {notifs.map((n, i) => {
            const [ic, c, bg] = notifIco[n.type] || notifIco.staff;
            return (
              <div key={i} className={"notif" + (n.unread ? " unread" : "")} onClick={() => setNotifs((prev) => prev.map((x, j) => j === i ? { ...x, unread: false } : x))}>
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
