"use client";
/* ============================================================
   NOVA TYRES — Admin · Customers + Discount Codes
   ============================================================ */
import * as React from "react";
import { useState, useEffect } from "react";
import { NOVA } from "../../lib/nova/data";
import { adminFetch } from "../../lib/adminFetch";
import { Icon } from "./icons";
import { Drawer, ConfirmModal, Switch, toast, SearchBox, EmptyState } from "./ui";

type Ctx = any;

/* ===================== CUSTOMERS ===================== */
export function CustomersPage({ ctx }: { ctx: Ctx; nav?: any }) {
  const [rows, setRows] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const url = `/api/admin/customers?page=${page}${q ? "&q=" + encodeURIComponent(q) : ""}`;
    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((d) => { if (!cancelled) { setRows(d.customers); setPages(d.pagination.totalPages || 1); setTotal(d.pagination.total); } })
      .catch(() => { if (!cancelled) toast({ kind: "err", title: "Couldn't load customers" }); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, q]);

  return (
    <div className="page page-enter">
      <div className="pagehead">
        <div className="ph-txt"><h2>Customers</h2><p>Everyone who has ordered, booked or enquired online.</p></div>
        <div className="ph-actions"><span className="badge brand dotless"><Icon name="users" style={{ width: 14, height: 14 }} />{total} customers</span></div>
      </div>

      <div className="toolbar">
        <SearchBox value={q} onChange={(v: string) => { setPage(1); setQ(v); }} placeholder="Search name, email…" grow />
      </div>

      <div className="panel">
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--ink-3)" }}>Loading…</div>
        ) : rows.length === 0 ? (
          <EmptyState icon="users" title="No customers" text="Nothing matches your search." />
        ) : (
          <div className="table-wrap">
            <table className="tbl">
              <thead><tr><th>Customer</th><th>Phone</th><th>Orders</th><th>Bookings</th><th>Vehicles</th><th>Joined</th><th>Status</th></tr></thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id}>
                    <td><div className="cell-main">{c.name}</div><div className="cell-sub">{c.email}</div></td>
                    <td className="nowrap muted">{c.phone}</td>
                    <td className="mono">{c.orders}</td>
                    <td className="mono">{c.bookings}</td>
                    <td className="mono">{c.vehicles}</td>
                    <td className="muted nowrap">{c.joined}</td>
                    <td><span className={"badge dotless " + (c.active ? "ok" : "warn")}>{c.active ? "Active" : "Inactive"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pages > 1 && (
        <div className="hstack" style={{ justifyContent: "center", gap: 10, marginTop: 16 }}>
          <button className="btn ghost sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><Icon name="chevL" />Prev</button>
          <span className="muted" style={{ fontSize: 13 }}>Page {page} of {pages}</span>
          <button className="btn ghost sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next<Icon name="chevR" /></button>
        </div>
      )}
    </div>
  );
}

/* ===================== DISCOUNT CODES ===================== */
const emptyCode = { code: "", type: "percent", value: "", minOrderAmount: "", maxUses: "", expiresAt: "", active: true };

export function DiscountsPage({ ctx }: { ctx: Ctx; nav?: any }) {
  const D = (ctx as any)?.D || NOVA;
  const [rows, setRows] = useState<any[]>(() => (D.discounts || []).map((d: any) => ({ ...d })));
  const [q, setQ] = useState("");
  const [create, setCreate] = useState(false);
  const [form, setForm] = useState<any>(emptyCode);
  const [del, setDel] = useState<any>(null);

  const list = rows.filter((d) => d.code.toLowerCase().includes(q.toLowerCase()));
  const fmtValue = (d: any) => (d.type === "percent" ? d.value + "% off" : "$" + d.value + " off");

  async function doCreate() {
    if (!form.code.trim() || !form.value) { toast({ kind: "err", title: "Code and value are required" }); return; }
    const payload: any = {
      code: form.code.trim().toUpperCase(), type: form.type, value: +form.value, active: form.active,
      ...(form.minOrderAmount ? { minOrderAmount: +form.minOrderAmount } : {}),
      ...(form.maxUses ? { maxUses: +form.maxUses } : {}),
      ...(form.expiresAt ? { expiresAt: new Date(form.expiresAt).toISOString() } : {}),
    };
    try {
      const res: any = await adminFetch("/api/admin/discounts", "POST", payload);
      setRows((prev) => [{ ...res, active: res.isActive, value: Number(res.value), currentUses: 0 }, ...prev]);
      setCreate(false); setForm(emptyCode);
      toast({ kind: "ok", title: "Code created", body: res.code + " is live." });
      ctx.refetch?.();
    } catch (e: any) {
      toast({ kind: "err", title: "Couldn't create code", body: e?.message || "Please try again." });
    }
  }

  async function toggleActive(d: any) {
    const next = !d.active; const prev = rows;
    setRows((r) => r.map((x) => x.id === d.id ? { ...x, active: next } : x));
    try {
      await adminFetch(`/api/admin/discounts/${d.id}`, "PATCH", { isActive: next });
      ctx.refetch?.();
    } catch (e: any) {
      setRows(prev);
      toast({ kind: "err", title: "Couldn't update", body: e?.message || "Please try again." });
    }
  }

  async function doDelete() {
    const target = del; const prev = rows;
    setRows((r) => r.filter((x) => x.id !== target.id));
    setDel(null);
    try {
      await adminFetch(`/api/admin/discounts/${target.id}`, "DELETE");
      toast({ kind: "ok", title: "Code deleted", body: target.code + " removed." });
      ctx.refetch?.();
    } catch (e: any) {
      setRows(prev);
      toast({ kind: "err", title: "Couldn't delete", body: e?.message || "Please try again." });
    }
  }

  return (
    <div className="page page-enter">
      <div className="pagehead">
        <div className="ph-txt"><h2>Discount Codes</h2><p>Create and manage promo codes that work at online checkout.</p></div>
        <div className="ph-actions"><button className="btn" onClick={() => { setForm(emptyCode); setCreate(true); }}><Icon name="plus" />New code</button></div>
      </div>

      <div className="toolbar"><SearchBox value={q} onChange={setQ} placeholder="Search codes…" grow /></div>

      <div className="panel">
        {list.length === 0 ? (
          <EmptyState icon="tag" title="No discount codes" text="Create your first promo code to get started." />
        ) : (
          <div className="table-wrap">
            <table className="tbl">
              <thead><tr><th>Code</th><th>Discount</th><th>Min order</th><th>Uses</th><th>Expires</th><th>Active</th><th></th></tr></thead>
              <tbody>
                {list.map((d) => (
                  <tr key={d.id}>
                    <td><span className="mono cell-main" style={{ fontWeight: 700 }}>{d.code}</span></td>
                    <td>{fmtValue(d)}</td>
                    <td className="muted">{d.minOrderAmount ? "$" + d.minOrderAmount : "—"}</td>
                    <td className="mono">{d.currentUses}{d.maxUses ? " / " + d.maxUses : ""}</td>
                    <td className="muted nowrap">{d.expiresAt ? new Date(d.expiresAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) : "Never"}</td>
                    <td><Switch on={d.active} onChange={() => toggleActive(d)} /></td>
                    <td><button className="iconbtn danger" onClick={() => setDel(d)}><Icon name="trash" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {create && (
        <Drawer title="New discount code" sub="Works at online checkout" onClose={() => setCreate(false)}
          foot={<React.Fragment><button className="btn ghost" style={{ flex: 1 }} onClick={() => setCreate(false)}>Cancel</button><button className="btn" style={{ flex: 1 }} onClick={doCreate}><Icon name="check" />Create code</button></React.Fragment>}>
          <div className="field"><label>Code</label><input value={form.code} autoFocus onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g. WINTER20" /></div>
          <div className="form-grid">
            <div className="field"><label>Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="percent">Percentage %</option><option value="fixed">Fixed $ amount</option></select>
            </div>
            <div className="field"><label>Value</label><input type="number" min="0" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder={form.type === "percent" ? "20" : "50"} /></div>
          </div>
          <div className="form-grid">
            <div className="field"><label>Min order ($) <span style={{ color: "var(--ink-3)", fontWeight: 400 }}>optional</span></label><input type="number" min="0" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} placeholder="0" /></div>
            <div className="field"><label>Max uses <span style={{ color: "var(--ink-3)", fontWeight: 400 }}>optional</span></label><input type="number" min="1" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} placeholder="Unlimited" /></div>
          </div>
          <div className="field"><label>Expires <span style={{ color: "var(--ink-3)", fontWeight: 400 }}>optional</span></label><input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} /></div>
          <div className="set-row"><div className="set-txt"><b>Active</b><span>Turn the code on immediately.</span></div><Switch on={form.active} onChange={(v: boolean) => setForm({ ...form, active: v })} /></div>
        </Drawer>
      )}

      {del && <ConfirmModal danger title={"Delete " + del.code + "?"} body="This removes the code so it can no longer be used at checkout." confirmLabel="Delete code" onConfirm={doDelete} onClose={() => setDel(null)} />}
    </div>
  );
}

/* ===================== AUDIT LOG VIEWER ===================== */
const ACTION_TINT: Record<string, string> = {
  LOGIN: "ok", LOGOUT: "", LOGIN_FAILED: "danger", PASSWORD_CHANGED: "warn",
  PRODUCT_UPDATED: "info", PRODUCT_DELETED: "danger", BOOKING_STATUS_CHANGED: "info",
  REVIEW_REPLIED: "ok", MESSAGE_SENT: "", ENQUIRY_LOGGED: "", ADMIN_CREATED: "ok",
  STAFF_REMOVED: "danger", ROLE_CREATED: "ok", ROLE_UPDATED: "info", ROLE_DELETED: "danger",
  DISCOUNT_CREATED: "ok", DISCOUNT_UPDATED: "info", DISCOUNT_DELETED: "danger",
  STORE_UPDATED: "info", SEO_UPDATED: "info", CONVERSATION_CLOSED: "",
};

export function AuditLogPage({ ctx }: { ctx: Ctx; nav?: any }) {
  const [rows, setRows] = useState<any[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [action, setAction] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const url = `/api/admin/audit?page=${page}${action ? "&action=" + action : ""}${q ? "&q=" + encodeURIComponent(q) : ""}`;
    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((d) => { if (!cancelled) { setRows(d.entries); setPages(d.pagination.totalPages || 1); setTotal(d.pagination.total); if (d.actions?.length) setActions(d.actions); } })
      .catch(() => { if (!cancelled) toast({ kind: "err", title: "Couldn't load audit log" }); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, q, action]);

  return (
    <div className="page page-enter">
      <div className="pagehead">
        <div className="ph-txt"><h2>Audit Log</h2><p>Every change made in the console — who did what, when and from where.</p></div>
        <div className="ph-actions"><span className="badge brand dotless"><Icon name="shield" style={{ width: 14, height: 14 }} />{total} events</span></div>
      </div>

      <div className="toolbar">
        <SearchBox value={q} onChange={(v: string) => { setPage(1); setQ(v); }} placeholder="Search entity type or id…" grow />
        <select value={action} onChange={(e) => { setPage(1); setAction(e.target.value); }}
          style={{ height: 38, borderRadius: 10, border: "1px solid var(--border)", background: "var(--chip)", color: "var(--ink)", fontSize: 13, fontWeight: 600, padding: "0 12px", flexShrink: 0 }}>
          <option value="">All actions</option>
          {actions.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <div className="panel">
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--ink-3)" }}>Loading…</div>
        ) : rows.length === 0 ? (
          <EmptyState icon="shield" title="No events" text="Nothing matches your filter." />
        ) : (
          <div className="table-wrap">
            <table className="tbl">
              <thead><tr><th>When</th><th>Who</th><th>Action</th><th>Entity</th><th>IP</th><th></th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <React.Fragment key={r.id}>
                    <tr style={{ cursor: (r.before || r.after) ? "pointer" : "default" }} onClick={() => (r.before || r.after) && setOpen(open === r.id ? null : r.id)}>
                      <td className="muted nowrap">{r.when}</td>
                      <td><div className="cell-main">{r.who}</div><div className="cell-sub">{r.email}</div></td>
                      <td><span className={"badge dotless " + (ACTION_TINT[r.action] || "")}>{r.action}</span></td>
                      <td className="muted nowrap">{r.entityType}{r.entityId ? " · " + String(r.entityId).slice(0, 8) : ""}</td>
                      <td className="muted mono" style={{ fontSize: 12 }}>{r.ip}</td>
                      <td>{(r.before || r.after) && <Icon name={open === r.id ? "chevU" : "chevD"} />}</td>
                    </tr>
                    {open === r.id && (r.before || r.after) && (
                      <tr><td colSpan={6} style={{ background: "var(--chip)", padding: "12px 16px" }}>
                        <div className="form-grid">
                          <div><div className="cell-sub" style={{ marginBottom: 4 }}>Before</div><pre style={{ margin: 0, fontSize: 12, whiteSpace: "pre-wrap", color: "var(--ink-2)" }}>{r.before ? JSON.stringify(r.before, null, 2) : "—"}</pre></div>
                          <div><div className="cell-sub" style={{ marginBottom: 4 }}>After</div><pre style={{ margin: 0, fontSize: 12, whiteSpace: "pre-wrap", color: "var(--ink-2)" }}>{r.after ? JSON.stringify(r.after, null, 2) : "—"}</pre></div>
                        </div>
                      </td></tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pages > 1 && (
        <div className="hstack" style={{ justifyContent: "center", gap: 10, marginTop: 16 }}>
          <button className="btn ghost sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><Icon name="chevL" />Prev</button>
          <span className="muted" style={{ fontSize: 13 }}>Page {page} of {pages}</span>
          <button className="btn ghost sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next<Icon name="chevR" /></button>
        </div>
      )}
    </div>
  );
}
