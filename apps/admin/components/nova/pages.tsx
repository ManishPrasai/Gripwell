"use client";
/* ============================================================
   NOVA TYRES — Admin · pages
   Real: Overview, Stores, Staff (ported from pages-core.jsx)
   Placeholder: the remaining 10 tabs (ported progressively)
   ============================================================ */
import * as React from "react";
import { useState } from "react";
import { NOVA } from "../../lib/nova/data";
import { adminFetch } from "../../lib/adminFetch";
import { Icon } from "./icons";
import {
  Avatar, StatusBadge, Tooltip, Drawer, Modal, ConfirmModal, toast,
  SearchBox, EmptyState, PanelHead,
} from "./ui";

type Ctx = any;

/* ===================== OVERVIEW ===================== */
export function OverviewPage({ ctx, nav }: { ctx: Ctx; nav: (p: string) => void }) {
  const D = (ctx as any)?.D || NOVA;
  const stores = ctx.scopeStores(D.stores);
  const lowStock = D.products.filter((p: any) => p.stock <= p.low).length;
  const weekRev = stores.reduce((s: number, x: any) => s + x.revenue, 0);
  const totalOrders = D.orders ? D.orders.length : 14;
  const totalRevenue = D.orders ? D.orders.reduce((s: number, o: any) => s + (o.total || 0), 0) : 400;
  const unreadMsgs = ctx.scopeBy(D.conversations, "store").reduce((s: number, c: any) => s + c.unread, 0);

  const maxBar = Math.max(...D.revenue7.map((d: any) => d.a + d.b));
  const fmt = (n: number) => "$" + (n / 1000).toFixed(1) + "K";

  return (
    <div className="page page-enter">
      {ctx.role === "manager" && (
        <div className="role-banner"><Icon name="store" /><span>You're viewing <b>{ctx.store}</b> as Store Manager. Figures are scoped to your store.</span></div>
      )}
      <div className="pagehead">
        <div className="ph-txt">
          <h2>Good morning, {ctx.firstName} 👋</h2>
          <p>Here's what's happening {ctx.role === "manager" ? "at " + ctx.store : "across your stores"} today — {new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" })}.</p>
        </div>
        <div className="ph-actions"></div>
      </div>

      <div className="dash-grid">
        {/* LEFT COLUMN */}
        <div className="dash-col">
          <div className="hero-row">
            <div className="hero-card primary">
              <div className="hc-top"><span className="hc-label">Revenue this week</span><Icon name="dollar" /></div>
              <div className="hc-val">{fmt(weekRev)}</div>
              <div className="hc-foot">
                <span>{ctx.role === "manager" ? ctx.store : stores.length + " stores"}</span>
                <span className="hc-pill"><Icon name="arrowUp" />This week</span>
              </div>
            </div>

            <div className="hero-card balance">
              <span className="hc-label">Total revenue</span>
              <div className="hc-val sm">A${totalRevenue.toFixed(0)}</div>
              <div className="hc-spark">
                <svg viewBox="0 0 120 40" preserveAspectRatio="none">
                  <polyline fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    points={D.revenue7.map((d: any, i: number) => `${(i / (D.revenue7.length - 1)) * 116 + 2},${38 - ((d.a + d.b) / maxBar) * 32}`).join(" ")} />
                </svg>
              </div>
              <div className="hc-foot"><span>{totalOrders} orders</span></div>
            </div>
          </div>

          <div className="dash-label">Account Summary</div>
          <div className="stat3">
            {[
              { label: "Total orders", val: totalOrders, ico: "cart", tint: "orange" },
              { label: "Unread messages", val: unreadMsgs, ico: "chat", tint: "blue" },
              { label: "Low-stock items", val: lowStock, ico: "alert", tint: "amber" },
            ].map((k, i) => (
              <div className="panel stat-card" key={i}>
                <span className={"sc-ico " + k.tint}><Icon name={k.ico} /></span>
                <span className="sc-label">{k.label}</span>
                <div className="sc-val">{k.val}</div>
              </div>
            ))}
          </div>

          <div className="panel">
            <PanelHead title="Revenue — last 7 days" right={<div className="badge accent dotless">{fmt(weekRev)} total</div>} />
            <div className="chart">
              <div className="bars">
                {D.revenue7.map((d: any, i: number) => (
                  <div className="bar-col" key={i}>
                    <div className="bar-stack">
                      <Tooltip label={`${d.d}: $${((d.a + d.b) * 100).toLocaleString()}`}>
                        <div style={{ width: "100%" }}>
                          <div className="bar" style={{ height: ((d.a + d.b) / maxBar) * 160 + "px" }}></div>
                        </div>
                      </Tooltip>
                    </div>
                    <span className="bar-x">{d.d}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="dash-col">
          <div className="panel statbar">
            <div className="sb-cell">
              <div className="sb-head"><div className="sb-num">{totalOrders}</div><div className="sb-cap">Orders</div></div>
              <div className="mini-bars">
                {D.revenue7.map((d: any, i: number) => (<span key={i} style={{ height: ((d.a) / maxBar) * 100 + "%" }}></span>))}
              </div>
            </div>
            <div className="sb-div"></div>
            <div className="sb-cell">
              <div className="sb-head"><div className="sb-num">{fmt(totalRevenue)}</div><div className="sb-cap">Revenue</div></div>
              <div className="mini-bars accent">
                {D.revenue7.map((d: any, i: number) => (<span key={i} style={{ height: ((d.b) / maxBar) * 100 + "%" }}></span>))}
              </div>
            </div>
          </div>

          <div className="panel feed-panel">
            <PanelHead title="Store status"
              right={ctx.role !== "manager" && <button className="btn ghost sm" style={{ color: "var(--accent)", borderColor: "color-mix(in oklab, var(--accent) 30%, transparent)" }} onClick={() => nav("stores")}>View all<Icon name="arrowR" /></button>} />
            <div style={{ padding: "4px 0 12px" }}>
              {stores.map((s: any) => (
                <div className="lrow" key={s.id} onClick={() => nav("stores")}>
                  <Avatar init={s.mgrInit} color={s.mgrAv} />
                  <div className="lrow-main"><b>{s.name}</b><span>{s.manager} · {s.today} Sold today</span></div>
                  <StatusBadge status={s.status} live={s.status === "open"} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== STORES ===================== */
export function StoresPage({ ctx }: { ctx: Ctx; nav?: any }) {
  const D = (ctx as any)?.D || NOVA;
  const all = ctx.scopeStores(D.stores);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [active, setActive] = useState<any>(null);
  const [confirmClose, setConfirmClose] = useState<any>(null);

  const list = all.filter((s: any) =>
    (filter === "all" || s.status === filter) &&
    (s.name + s.manager + s.suburb).toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="page page-enter">
      <div className="pagehead">
        <div className="ph-txt">
          <h2>Stores</h2>
          <p>{ctx.role === "manager" ? "Your store overview and live status." : "Manage all Nova Tyres locations, hours, capacity and managers."}</p>
        </div>
        {ctx.role !== "manager" && (
          <div className="ph-actions">
            <button className="btn" onClick={() => toast({ kind: "info", title: "Add a store", body: "Store onboarding wizard would open here." })}><Icon name="plus" />Add store</button>
          </div>
        )}
      </div>

      <div className="toolbar">
        <SearchBox value={q} onChange={setQ} placeholder="Search stores or managers…" grow />
        <div className="tabs">
          {[["all", "All"], ["open", "Open"], ["closed", "Closed"]].map(([k, l]) => (
            <button key={k} className={filter === k ? "on" : ""} onClick={() => setFilter(k)}>{l}
              <span className="pillcount">{k === "all" ? all.length : all.filter((s: any) => s.status === k).length}</span>
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="panel"><EmptyState icon="store" title="No stores found" text="Try a different search or filter." /></div>
      ) : (
        <div className="store-grid">
          {list.map((s: any) => (
            <div className="panel store-card" key={s.id} onClick={() => setActive(s)}>
              <div className="store-photo">
                <span className="scrim"></span>
                <span className="st-status"><StatusBadge status={s.status} /></span>
                <span className="st-name"><b>{s.name}</b><span>{s.suburb}, {s.state}</span></span>
              </div>
              <div className="store-body">
                <div className="store-mgr">
                  <Avatar init={s.mgrInit} color={s.mgrAv} />
                  <div className="store-mgr-txt"><b>{s.manager}</b><span>Store Manager</span></div>
                  <span className="spacer"></span>
                  <span className="badge accent dotless"><Icon name="star" style={{ width: 13, height: 13 }} />{s.rating}</span>
                </div>
                <div className="store-stats">
                  <div className="store-stat"><b>{s.today}</b><span>Today</span></div>
                  <div className="store-stat"><b>{s.staff}</b><span>Staff</span></div>
                  <div className="store-stat"><b>{s.bays}</b><span>Bays</span></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {active && (
        <Drawer title={active.name} sub={active.suburb + ", " + active.state} onClose={() => setActive(null)}
          foot={<React.Fragment>
            <button className="btn ghost" style={{ flex: 1 }} onClick={() => { toast({ kind: "info", title: "Editing " + active.name }); }}><Icon name="edit" />Edit store</button>
            {active.status === "open"
              ? <button className="btn danger" style={{ flex: 1 }} onClick={() => setConfirmClose(active)}><Icon name="lock" />Close store</button>
              : <button className="btn" style={{ flex: 1 }} onClick={() => { toast({ kind: "ok", title: active.name + " reopened" }); setActive({ ...active, status: "open" }); }}><Icon name="checkCircle" />Reopen</button>}
          </React.Fragment>}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <StatusBadge status={active.status} live={active.status === "open"} />
            <span className="badge accent dotless"><Icon name="star" style={{ width: 13, height: 13 }} />{active.rating} · {active.reviews} reviews</span>
          </div>
          <div className="summary-row" style={{ marginBottom: 18 }}>
            <div className="panel mini-stat"><div className="ms-label"><Icon name="calendar" />Today</div><div className="ms-val">{active.today}</div></div>
            <div className="panel mini-stat"><div className="ms-label"><Icon name="dollar" />Revenue wk</div><div className="ms-val">${(active.revenue / 1000).toFixed(1)}<small>k</small></div></div>
          </div>
          <div className="field"><label>Capacity used today</label>
            <div className="cap-bar"><i className={active.capacity > 80 ? "hot" : ""} style={{ width: active.capacity + "%" }}></i></div>
            <div className="hstack" style={{ justifyContent: "space-between", marginTop: 7, fontSize: 12.5, color: "var(--ink-3)" }}>
              <span>{active.capacity}% booked</span><span>{active.bays} service bays</span>
            </div>
          </div>
          <hr className="hr" />
          <div className="store-mgr" style={{ marginBottom: 16 }}>
            <Avatar init={active.mgrInit} color={active.mgrAv} size="lg" />
            <div className="store-mgr-txt"><b style={{ fontSize: 15 }}>{active.manager}</b><span>Store Manager</span></div>
          </div>
          <div className="vstack" style={{ gap: 2 }}>
            <div className="set-row"><Icon name="phone" style={{ width: 18, color: "var(--ink-3)" }} /><div className="set-txt"><b>{active.phone}</b><span>Store phone</span></div></div>
            <div className="set-row"><Icon name="clock" style={{ width: 18, color: "var(--ink-3)" }} /><div className="set-txt"><b>{active.opens} – {active.closes}</b><span>Opening hours (Mon–Fri)</span></div></div>
            <div className="set-row"><Icon name="users" style={{ width: 18, color: "var(--ink-3)" }} /><div className="set-txt"><b>{active.staff} team members</b><span>{active.bays} bays operating</span></div></div>
          </div>
        </Drawer>
      )}

      {confirmClose && (
        <ConfirmModal danger title={"Close " + confirmClose.name + "?"}
          body="Customers won't be able to book online and the store will show as Closed until reopened."
          confirmLabel="Close store" icon="lock"
          onConfirm={() => { toast({ kind: "ok", title: confirmClose.name + " closed", body: "Store is now offline for bookings." }); setActive((a: any) => a ? { ...a, status: "closed" } : a); setConfirmClose(null); }}
          onClose={() => setConfirmClose(null)} />
      )}
    </div>
  );
}

/* ===================== STAFF ===================== */
export function StaffPage({ ctx }: { ctx: Ctx; nav?: any }) {
  const D = (ctx as any)?.D || NOVA;
  const base = ctx.scopeBy(D.staff, "store");
  const [q, setQ] = useState("");
  const [role, setRole] = useState("all");
  const [rows, setRows] = useState<any[]>(base);
  const [del, setDel] = useState<any>(null);
  const [add, setAdd] = useState(false);
  const [form, setForm] = useState<any>({ name: "", email: "", role: "Mechanic", store: ctx.role === "manager" ? ctx.store : "Springvale", loginId: "", tempPass: "" });
  const [creds, setCreds] = useState<any>(null);

  const slug = (s: string) => s.toLowerCase().replace(/[^a-z]+/g, "");
  const genId = (name: string, store: string) => { const st = (D.stores.find((x: any) => x.name === store) || {}).id || slug(store).slice(0, 6); const fn = slug((name || "").split(" ")[0]) || "user"; return "nova-" + st + "-" + fn; };
  const genPass = () => ["Tyre", "Nova", "Brake", "Wheel", "Torque"][Math.floor(Math.random() * 5)] + "-" + Math.floor(1000 + Math.random() * 9000);
  const openAdd = () => { setForm({ name: "", email: "", role: "Mechanic", store: ctx.role === "manager" ? ctx.store : "Springvale", loginId: "", tempPass: genPass() }); setAdd(true); };
  const copy = (t: string) => { try { navigator.clipboard.writeText(t); } catch (e) {} toast({ kind: "ok", title: "Copied", body: t }); };

  const roles = ["all", "Store Manager", "Senior Mechanic", "Mechanic", "Front Desk"];
  const list = rows.filter((s) =>
    (role === "all" || s.role === role) &&
    (s.name + s.email + s.role).toLowerCase().includes(q.toLowerCase())
  );

  async function doAdd() {
    if (!form.name.trim()) { toast({ kind: "err", title: "Name required", body: "Please enter the team member's name." }); return; }
    if (!form.email.trim()) { toast({ kind: "err", title: "Email required", body: "They'll sign in with this email." }); return; }
    const [firstName, ...rest] = form.name.trim().split(" ");
    const lastName = rest.join(" ") || firstName;
    const storeId = (D.stores.find((x: any) => x.name === form.store) || {}).id;
    const roleObj = (D.roles || []).find((r: any) => r.name === form.role);
    try {
      const res: any = await adminFetch("/api/admin/staff", "POST", {
        firstName, lastName, email: form.email.trim().toLowerCase(),
        ...(storeId ? { storeId } : {}), ...(roleObj?.id ? { roleId: roleObj.id } : {}),
      });
      setAdd(false);
      setCreds({ name: form.name, loginId: res.email, tempPass: res.tempPassword, isNew: true });
      toast({ kind: "ok", title: "Login issued", body: form.name + " can now sign in with their email." });
      ctx.refetch?.();
    } catch (e: any) {
      toast({ kind: "err", title: "Couldn't create staff", body: e?.message || "Please try again." });
    }
  }
  function resetLogin(s: any) { setCreds({ name: s.name, loginId: s.email || genId(s.name, s.store), tempPass: genPass(), isNew: false }); }
  async function doDelete() {
    const target = del; const prevRows = rows;
    setRows((prev) => prev.filter((r) => r.id !== target.id));
    setDel(null);
    if (!target.id || typeof target.id === "number") { toast({ kind: "ok", title: "Removed", body: target.name + " no longer has access." }); return; }
    try {
      await adminFetch(`/api/admin/staff/${target.id}`, "DELETE");
      toast({ kind: "ok", title: "Removed", body: target.name + " no longer has access." });
      ctx.refetch?.();
    } catch (e: any) {
      setRows(prevRows);
      toast({ kind: "err", title: "Couldn't remove", body: e?.message || "Please try again." });
    }
  }

  return (
    <div className="page page-enter">
      <div className="pagehead">
        <div className="ph-txt"><h2>Staff &amp; Users</h2><p>People with access to the console and the team on the floor.</p></div>
        <div className="ph-actions"><button className="btn" onClick={openAdd}><Icon name="plus" />Add team member</button></div>
      </div>

      <div className="toolbar">
        <SearchBox value={q} onChange={setQ} placeholder="Search by name, email or role…" grow />
        <div className="tabs">
          {roles.map((r) => <button key={r} className={role === r ? "on" : ""} onClick={() => setRole(r)}>{r === "all" ? "All roles" : r}</button>)}
        </div>
      </div>

      <div className="panel">
        {list.length === 0 ? <EmptyState icon="users" title="No team members" text="No one matches that search or filter." /> : (
          <div className="table-wrap">
            <table className="tbl">
              <thead><tr><th>Name</th><th>Role</th><th>Store</th><th>Login ID</th><th>Status</th><th>Member since</th><th></th></tr></thead>
              <tbody>
                {list.map((s) => (
                  <tr key={s.id}>
                    <td><div className="cell-flex"><Avatar init={s.init} color={s.av} /><div><div className="cell-main">{s.name}</div><div className="cell-sub">{s.email}</div></div></div></td>
                    <td>{s.role === "Store Manager" ? <span className="badge brand dotless"><Icon name="shield" style={{ width: 13, height: 13 }} />{s.role}</span> : <span className="muted nowrap">{s.role}</span>}</td>
                    <td className="nowrap">{s.store}</td>
                    <td><span className="mono nowrap" style={{ fontSize: 12.5, color: "var(--ink-2)" }}>{s.loginId || genId(s.name, s.store)}</span></td>
                    <td><StatusBadge status={s.status} live={s.status === "online"} /></td>
                    <td className="muted nowrap">{s.since}</td>
                    <td>
                      <div className="row-actions">
                        <Tooltip label="Reset login"><button className="iconbtn" onClick={() => resetLogin(s)}><Icon name="lock" /></button></Tooltip>
                        <Tooltip label="Edit"><button className="iconbtn" onClick={() => toast({ kind: "info", title: "Editing " + s.name })}><Icon name="edit" /></button></Tooltip>
                        <Tooltip label="Remove access"><button className="iconbtn danger" onClick={() => setDel(s)}><Icon name="trash" /></button></Tooltip>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {add && (
        <Modal onClose={() => setAdd(false)}>
          <div className="modal-head">
            <div className="m-ico" style={{ background: "color-mix(in oklab, var(--brand) 14%, transparent)", color: "var(--brand-2)" }}><Icon name="user" /></div>
            <div><h3>Add team member</h3><p>They sign in with a Login ID you issue — not a personal email.</p></div>
            <button className="iconbtn x" onClick={() => setAdd(false)}><Icon name="x" /></button>
          </div>
          <div className="modal-body">
            <div className="field"><label>Full name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Alex Taylor" /></div>
            <div className="field"><label>Contact email <span className="opt">(optional)</span></label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="alex@novatyres.au" /></div>
            <div className="form-grid">
              <div className="field"><label>Role</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option>Store Manager</option><option>Senior Mechanic</option><option>Mechanic</option><option>Front Desk</option>
                </select>
              </div>
              <div className="field"><label>Store</label>
                <select value={form.store} onChange={(e) => setForm({ ...form, store: e.target.value })} disabled={ctx.role === "manager"}>
                  {D.stores.map((s: any) => <option key={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <div style={{ padding: "14px 16px", borderRadius: 14, background: "color-mix(in oklab, var(--brand) 6%, transparent)", border: "1px solid var(--border)", marginTop: 4 }}>
              <div className="hstack" style={{ gap: 8, marginBottom: 12 }}><Icon name="lock" style={{ width: 16, height: 16, color: "var(--brand-2)" }} /><b style={{ fontSize: 13 }}>Sign-in credentials</b></div>
              <div className="field" style={{ marginBottom: 12 }}><label>Login ID</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input className="input mono" style={{ flex: 1 }} value={form.loginId} onChange={(e) => setForm({ ...form, loginId: e.target.value })} placeholder={genId(form.name || "name", form.store)} />
                  <button type="button" className="btn ghost sm" onClick={() => setForm({ ...form, loginId: genId(form.name, form.store) })}><Icon name="refresh" />Suggest</button>
                </div>
              </div>
              <div className="field" style={{ marginBottom: 0 }}><label>Temporary password</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input className="input mono" style={{ flex: 1 }} value={form.tempPass} onChange={(e) => setForm({ ...form, tempPass: e.target.value })} />
                  <button type="button" className="btn ghost sm" onClick={() => setForm({ ...form, tempPass: genPass() })}><Icon name="refresh" />New</button>
                </div>
              </div>
              <div className="field-hint" style={{ display: "flex", gap: 8, fontSize: 12, color: "var(--ink-3)", marginTop: 10 }}><Icon name="info" style={{ width: 14, height: 14, flexShrink: 0, marginTop: 1, color: "var(--brand-2)" }} /><span>You'll get a copyable card to hand over. They change it on first sign-in.</span></div>
            </div>
          </div>
          <div className="modal-foot"><button className="btn ghost" onClick={() => setAdd(false)}>Cancel</button><button className="btn" onClick={doAdd}><Icon name="lock" />Issue login</button></div>
        </Modal>
      )}

      {del && (
        <ConfirmModal danger title={"Remove " + del.name + "?"} body="They'll immediately lose access to the console. This can't be undone."
          confirmLabel="Remove access" onConfirm={doDelete} onClose={() => setDel(null)} />
      )}

      {creds && (
        <Modal onClose={() => setCreds(null)}>
          <div className="modal-head">
            <div className="m-ico" style={{ background: "color-mix(in oklab, var(--brand) 14%, transparent)", color: "var(--brand-2)" }}><Icon name="lock" /></div>
            <div><h3>{creds.isNew ? "Login issued" : "Login reset"}</h3><p>Share these with {creds.name}. They sign in at the staff portal — not with a personal email.</p></div>
            <button className="iconbtn x" onClick={() => setCreds(null)}><Icon name="x" /></button>
          </div>
          <div className="modal-body">
            {[["Login ID", creds.loginId], ["Temporary password", creds.tempPass]].map(([l, v]) => (
              <div className="field" key={l}><label>{l}</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input className="input mono" style={{ flex: 1 }} readOnly value={v} onFocus={(e) => e.target.select()} />
                  <button className="btn ghost sm" onClick={() => copy(v)}><Icon name="file" />Copy</button>
                </div>
              </div>
            ))}
            <div className="role-banner" style={{ marginTop: 6, marginBottom: 0 }}><Icon name="info" /><span>The team member is prompted to set their own password on first sign-in. They <b>cannot</b> register or reset it themselves — only you can.</span></div>
          </div>
          <div className="modal-foot"><button className="btn ghost" onClick={() => copy(creds.loginId + "  /  " + creds.tempPass)}><Icon name="file" />Copy both</button><button className="btn" onClick={() => { toast({ kind: "ok", title: "Done", body: "Credentials ready to share." }); setCreds(null); }}><Icon name="check" />Done</button></div>
        </Modal>
      )}
    </div>
  );
}

/* Remaining pages live in pages-comms/ops/more/website/calls/import.tsx */
