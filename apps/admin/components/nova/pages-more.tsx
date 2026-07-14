"use client";
/* ============================================================
   NOVA TYRES — Admin · pages (more): Orders, Settings (ported)
   (ContentPage from the prototype is superseded by WebsitePage)
   ============================================================ */
import * as React from "react";
import { useState } from "react";
import { NOVA } from "../../lib/nova/data";
import { Icon } from "./icons";
import { Avatar, Switch, Tooltip, toast, SearchBox, EmptyState, usePager, Pager } from "./ui";

type Ctx = any;

/* ===================== ORDERS ===================== */
export function OrdersPage({ ctx }: { ctx: Ctx; nav?: any }) {
  const D = (ctx as any)?.D || NOVA;
  const all = ctx.scopeBy(D.orders, "store");
  const webOrders = all.filter((o: any) => o.source === "order");
  const [q, setQ] = useState("");

  const list = webOrders.filter((o: any) => (o.customer + o.items + o.ref).toLowerCase().includes(q.toLowerCase()));
  const pager = usePager(list, 15);
  const oTotal = webOrders.length;
  const oRevenue = webOrders.reduce((s: number, o: any) => s + o.total, 0);

  return (
    <div className="page page-enter">
      <div className="pagehead">
        <div className="ph-txt"><h2>Orders</h2><p>Website orders.</p></div>
        <div className="ph-actions">
          <button className="btn ghost" onClick={() => toast({ kind: "info", title: "Exported", body: "Orders exported to CSV." })}><Icon name="download" />Export</button>
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
              <thead><tr><th>Order</th><th>Customer</th><th>Products</th><th>Store</th><th>Date</th><th>Total</th></tr></thead>
              <tbody>
                {pager.slice.map((o: any) => (
                  <tr key={o.ref}>
                    <td><span className="mono" style={{ fontSize: 12.5, fontWeight: 700 }}>{o.ref}</span></td>
                    <td><div className="cell-main">{o.customer}</div><div className="cell-sub">{o.email}</div></td>
                    <td className="muted" style={{ maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.items}</td>
                    <td className="nowrap muted">{o.store}</td>
                    <td className="muted nowrap">{o.date}</td>
                    <td className="mono cell-main">${o.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Pager pager={pager} unit="orders" />
    </div>
  );
}

/* ===================== SETTINGS ===================== */
const SET_NAV: [string, string, string][] = [
  ["profile", "Profile", "user"], ["appearance", "Appearance", "palette"],
  ["roles", "Roles & access", "shield"], ["notifications", "Notifications", "bell"],
  ["billing", "Billing", "card"],
];
export function SettingsPage({ ctx }: { ctx: Ctx; nav?: any }) {
  const [tab, setTab] = useState("appearance");
  const [notif, setNotif] = useState<Record<string, boolean>>({ bookings: true, reviews: true, stock: true, marketing: false, weekly: true });

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
                <div><div style={{ fontSize: 18, fontWeight: 800 }}>{ctx.name}</div><div className="muted" style={{ fontSize: 13.5 }}>{ctx.role === "admin" ? "Super Administrator" : "Store Manager · " + ctx.store}</div></div>
                <span className="spacer"></span>
                <button className="btn ghost sm" onClick={() => toast({ kind: "info", title: "Upload photo" })}><Icon name="user" />Change</button>
              </div>
              <div className="form-grid">
                <div className="field"><label>Full name</label><input defaultValue={ctx.name} /></div>
                <div className="field"><label>Email</label><input defaultValue={ctx.role === "admin" ? "admin@novatyres.au" : "daniel.m@novatyres.au"} /></div>
              </div>
              <div className="form-grid">
                <div className="field"><label>Phone</label><input defaultValue="0412 000 000" /></div>
                <div className="field"><label>Role</label><input defaultValue={ctx.role === "admin" ? "Super Administrator" : "Store Manager"} disabled /></div>
              </div>
              <div className="hstack" style={{ justifyContent: "flex-end", marginTop: 8 }}><button className="btn" onClick={() => toast({ kind: "ok", title: "Profile saved" })}><Icon name="check" />Save changes</button></div>
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
                  <div className="set-row" key={k}><div className="set-txt"><b>{t}</b><span>{s}</span></div><Switch on={notif[k]} onChange={(v) => { setNotif({ ...notif, [k]: v }); toast({ kind: "ok", title: v ? "Turned on" : "Turned off", body: t }); }} /></div>
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
