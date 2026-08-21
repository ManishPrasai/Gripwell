"use client";
/* ============================================================
   NOVA TYRES — Admin · pages (ops): Inventory, Bookings, Reviews (ported)
   ============================================================ */
import * as React from "react";
import { useState } from "react";
import { NOVA } from "../../lib/nova/data";
import { adminFetch } from "../../lib/adminFetch";
import { Icon } from "./icons";
import {
  Avatar, StatusBadge, StockBadge, Stars, Tooltip, Drawer, Modal, ConfirmModal,
  toast, SearchBox, EmptyState, PanelHead, usePager, Pager,
} from "./ui";
import { downloadCSV } from "../../lib/csv";
import { ProductGallery } from "./image-upload";

type Ctx = any;

/* ===================== INVENTORY ===================== */
export function InventoryPage({ ctx }: { ctx: Ctx; nav?: any }) {
  const D = (ctx as any)?.D || NOVA;
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [lowOnly, setLowOnly] = useState(false);
  const [rows, setRows] = useState<any[]>(D.products);
  const [edit, setEdit] = useState<any>(null);
  const [del, setDel] = useState<any>(null);

  // Server truth wins once a refetch lands, so an image added in the drawer
  // shows up in the table instead of waiting for a full page reload.
  React.useEffect(() => { setRows(D.products); }, [D.products]);

  const cats = ["All", "Tyres", "Wheels", "Oils", "Parts"];
  const lowCount = rows.filter((p) => p.stock <= p.low).length;
  const list = rows.filter((p) =>
    (cat === "All" || p.cat === cat) &&
    (!lowOnly || p.stock <= p.low) &&
    (p.name + p.brand + p.spec).toLowerCase().includes(q.toLowerCase())
  );
  const pager = usePager(list, 12);

  function exportCSV() {
    if (!rows.length) { toast({ kind: "info", title: "Nothing to export", body: "No products in inventory yet." }); return; }
    downloadCSV("nova-inventory", ["Product", "Brand", "Category", "Spec", "Price", "Stock", "Status"],
      rows.map((p) => [p.name, p.brand, p.cat, p.spec ?? "", Number(p.price).toFixed(2), p.stock, p.status]));
    toast({ kind: "ok", title: "Exported", body: `${rows.length} products downloaded as CSV.` });
  }

  async function saveEdit() {
    const target = edit; const prevRows = rows;
    setRows((prev) => prev.map((p) => p.id === target.id ? target : p));  // optimistic
    setEdit(null);
    if (!target.id) { toast({ kind: "ok", title: "Saved", body: target.name + " updated." }); return; }
    try {
      await adminFetch(`/api/admin/products/${target.id}`, "PATCH", {
        price: +target.price, stock: +target.stock, status: target.status,
      });
      toast({ kind: "ok", title: "Saved", body: target.name + " updated." });
      ctx.refetch?.();
    } catch (e: any) {
      setRows(prevRows);  // rollback
      toast({ kind: "err", title: "Couldn't save", body: e?.message || "Please try again." });
    }
  }

  async function deleteProduct(p: any) {
    const prevRows = rows;
    setRows((prev) => prev.filter((x) => x.id !== p.id));  // optimistic
    setDel(null);
    if (!p.id) { toast({ kind: "ok", title: "Deleted", body: p.name + " removed." }); return; }
    try {
      await adminFetch(`/api/admin/products/${p.id}`, "DELETE");
      toast({ kind: "ok", title: "Deleted", body: p.name + " removed." });
      ctx.refetch?.();
    } catch (e: any) {
      setRows(prevRows);  // rollback
      toast({ kind: "err", title: "Couldn't delete", body: e?.message || "Please try again." });
    }
  }

  return (
    <div className="page page-enter">
      <div className="pagehead">
        <div className="ph-txt"><h2>Products &amp; Inventory</h2><p>Tyres, wheels, oils and parts across all stores.</p></div>
        <div className="ph-actions">
          <button className="btn ghost" onClick={exportCSV}><Icon name="download" />Export</button>
          <button className="btn ghost" onClick={() => ctx.go?.("import")}><Icon name="box" />Import</button>
          <button className="btn" onClick={() => ctx.go?.("import")}><Icon name="plus" />Add product</button>
        </div>
      </div>

      {lowCount > 0 && (
        <div className="role-banner" style={{ background: "color-mix(in oklab, var(--warn) 10%, transparent)", borderColor: "color-mix(in oklab, var(--warn) 24%, transparent)" }}>
          <Icon name="alert" style={{ color: "var(--warn)" }} />
          <span><b>{lowCount} products</b> are low or out of stock and may need reordering.</span>
          <span className="spacer"></span>
          <button className="btn sm ghost" onClick={() => setLowOnly(true)}>Show these</button>
        </div>
      )}

      <div className="toolbar">
        <SearchBox value={q} onChange={setQ} placeholder="Search products, brands or sizes…" grow />
        <button className={"filter-chip" + (lowOnly ? " on" : "")} onClick={() => setLowOnly((v) => !v)}><Icon name="alert" />Low stock <span className="count">{lowCount}</span></button>
      </div>
      <div className="toolbar">
        <div className="tabs">
          {cats.map((c) => <button key={c} className={cat === c ? "on" : ""} onClick={() => setCat(c)}>{c}<span className="pillcount">{c === "All" ? rows.length : rows.filter((p) => p.cat === c).length}</span></button>)}
        </div>
      </div>

      <div className="panel">
        {list.length === 0 ? <EmptyState icon="box" title="No products" text="Nothing matches your filters right now." /> : (
          <div className="table-wrap">
            <table className="tbl">
              <thead><tr><th>Product</th><th>Brand</th><th>Price</th><th>Stock</th><th>Availability</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {pager.slice.map((p) => (
                  <tr key={p.id}>
                    <td><div className="cell-flex">
                      <span className="prod-thumb">
                        {p.image
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={p.image} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: 8 }} />
                          : <Icon name={p.icon} />}
                      </span>
                      <div><div className="cell-main">{p.name}</div><div className="cell-sub mono">{p.spec}</div></div>
                    </div></td>
                    <td className="nowrap">{p.brand}</td>
                    <td className="mono">${p.price}</td>
                    <td>
                      <div className="stock-pill">
                        <span className="stock-meter"><i className={p.stock === 0 ? "out" : p.stock <= p.low ? "low" : ""} style={{ width: Math.min(100, (p.stock / (p.low * 4)) * 100) + "%" }}></i></span>
                        <span className="mono nowrap" style={{ fontSize: 12.5 }}>{p.stock}</span>
                      </div>
                    </td>
                    <td><StockBadge stock={p.stock} low={p.low} /></td>
                    <td><span className={"badge dotless " + (p.status === "active" ? "ok" : "warn")}>{p.status === "active" ? "Active" : "Draft"}</span></td>
                    <td><div className="row-actions">
                      <Tooltip label="Edit"><button className="iconbtn" onClick={() => setEdit({ ...p })}><Icon name="edit" /></button></Tooltip>
                      <Tooltip label="Delete"><button className="iconbtn danger" onClick={() => setDel(p)}><Icon name="trash" /></button></Tooltip>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Pager pager={pager} unit="products" />

      {edit && (
        <Drawer title={edit.name} sub={edit.brand + " · " + edit.cat} onClose={() => setEdit(null)}
          foot={<React.Fragment><button className="btn ghost" style={{ flex: 1 }} onClick={() => setEdit(null)}>Cancel</button><button className="btn" style={{ flex: 1 }} onClick={saveEdit}><Icon name="check" />Save changes</button></React.Fragment>}>
          {/* Images save on their own (the product already exists), unlike the
              fields below which apply on "Save changes". */}
          {edit.id && <ProductGallery productId={edit.id} onChanged={() => ctx.refetch?.()} />}
          <div className="field"><label>Product name</label><input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></div>
          <div className="field"><label>Specification</label><input value={edit.spec} onChange={(e) => setEdit({ ...edit, spec: e.target.value })} /></div>
          <div className="form-grid">
            <div className="field"><label>Price ($)</label><input type="number" value={edit.price} onChange={(e) => setEdit({ ...edit, price: +e.target.value })} /></div>
            <div className="field"><label>Stock on hand</label><input type="number" value={edit.stock} onChange={(e) => setEdit({ ...edit, stock: +e.target.value })} /></div>
          </div>
          <div className="form-grid">
            <div className="field"><label>Low-stock alert at</label><input type="number" value={edit.low} onChange={(e) => setEdit({ ...edit, low: +e.target.value })} /></div>
            <div className="field"><label>Status</label><select value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })}><option value="active">Active</option><option value="draft">Draft</option></select></div>
          </div>
          <div className="role-banner" style={{ marginTop: 6, marginBottom: 0 }}><Icon name="info" /><span>This product is visible on the <b>{edit.cat}</b> page of your website when Active.</span></div>
        </Drawer>
      )}

      {del && <ConfirmModal danger title={"Delete " + del.name + "?"} body="This removes the product from inventory and your website. This can't be undone."
        confirmLabel="Delete product" onConfirm={() => deleteProduct(del)} onClose={() => setDel(null)} />}
    </div>
  );
}

/* ===================== BOOKINGS ===================== */
const BK_COLS = [
  { key: "pending", label: "Pending", color: "var(--warn)" },
  { key: "progress", label: "Complete", color: "var(--ok, #30a46c)" },
  { key: "ready", label: "Rescheduled", color: "var(--accent)" },
  { key: "done", label: "Cancelled", color: "var(--danger, #e5484d)" },
];
const BK_NEXT: Record<string, string> = { pending: "progress", progress: "ready" };

export function BookingsPage({ ctx }: { ctx: Ctx; nav?: any }) {
  const D = (ctx as any)?.D || NOVA;
  const storeNames = D.stores.map((s) => s.name);
  const defaultStore = ctx.store || storeNames[0];

  const [rows, setRows] = useState<any[]>(ctx.scopeBy(D.bookings, "store"));
  const [q, setQ] = useState("");
  const [active, setActive] = useState<any>(null);
  const [rdDate, setRdDate] = useState("");
  const [rdTime, setRdTime] = useState("");
  const [newBk, setNewBk] = useState(false);
  const emptyForm = { phone: "", name: "", vehicle: "", service: "", date: "", time: "", store: defaultStore, paid: "", notes: "", mode: "walkin" };
  const [form, setForm] = useState<any>(emptyForm);

  const filtered = rows.filter((b) => (b.customer + b.vehicle + b.service + b.ref).toLowerCase().includes(q.toLowerCase()));

  async function advance(b: any) {
    const nx = BK_NEXT[b.status]; if (!nx) return;
    const prevRows = rows;
    setRows((prev) => prev.map((r) => r.ref === b.ref ? { ...r, status: nx } : r));
    setActive((a: any) => a && a.ref === b.ref ? { ...a, status: nx } : a);
    toast({ kind: "ok", title: b.ref + " moved", body: "Now " + BK_COLS.find((c) => c.key === nx)?.label + "." });
    if (!b.id) return;
    try {
      // The "Complete" column maps to COMPLETED in the DB.
      await adminFetch(`/api/admin/bookings/${b.id}`, "PATCH", { status: "COMPLETED" });
      ctx.refetch?.();
    } catch (e: any) {
      setRows(prevRows);
      toast({ kind: "err", title: "Couldn't update booking", body: e?.message || "Please try again." });
    }
  }

  async function persistReschedule(b: any): Promise<boolean> {
    if (!b.id) return true;   // mock row — nothing to persist
    const body: any = {};
    if (rdDate) body.date = new Date(rdDate).toISOString();
    if (rdTime) body.timeSlot = rdTime;
    try {
      await adminFetch(`/api/admin/bookings/${b.id}`, "PATCH", body);
      ctx.refetch?.();
      return true;
    } catch (e: any) {
      toast({ kind: "err", title: "Couldn't reschedule", body: e?.message || "Please try again." });
      return false;
    }
  }

  async function cancelBooking(b: any) {
    const prevRows = rows;
    // Optimistic — move to the Cancelled column immediately.
    setRows((prev) => prev.map((r) => r.ref === b.ref ? { ...r, status: "done" } : r));
    setActive(null);

    // Mock rows (fallback data) have no real id — nothing to persist.
    if (!b.id) {
      toast({ kind: "warn", title: b.ref + " cancelled", body: b.customer + "'s booking has been cancelled." });
      return;
    }
    try {
      await adminFetch(`/api/admin/bookings/${b.id}`, "PATCH", { status: "CANCELLED" });
      toast({ kind: "warn", title: b.ref + " cancelled", body: b.customer + "'s booking has been cancelled." });
      ctx.refetch?.();  // revalidate ctx.D from the server so it survives refresh
    } catch (e: any) {
      setRows(prevRows);  // rollback on failure
      toast({ kind: "err", title: "Couldn't cancel booking", body: e?.message || "Please try again." });
    }
  }

  function makeLabel() {
    const parts: string[] = [];
    if (rdDate) { const d = new Date(rdDate); parts.push(d.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })); }
    if (rdTime) { const [h, m] = rdTime.split(":"); const ap = +h >= 12 ? "pm" : "am"; parts.push(((+h % 12) || 12) + ":" + m + ap); }
    return parts.join(" · ");
  }
  async function saveReschedule(b: any) {
    if (!rdDate && !rdTime) { toast({ kind: "warn", title: "No date set", body: "Pick a new date or time first." }); return; }
    const label = makeLabel();
    const prevRows = rows;
    setRows((prev) => prev.map((r) => r.ref === b.ref ? { ...r, time: label } : r));
    setActive((a: any) => a && a.ref === b.ref ? { ...a, time: label } : a);
    const ok = await persistReschedule(b);
    if (ok) toast({ kind: "ok", title: "Rescheduled", body: b.ref + " updated to " + label + "." });
    else setRows(prevRows);
  }
  async function rescheduleAndMove(b: any) {
    if (!rdDate && !rdTime) { toast({ kind: "warn", title: "No date set", body: "Pick a new date or time first." }); return; }
    const label = makeLabel();
    const prevRows = rows;
    setRows((prev) => prev.map((r) => r.ref === b.ref ? { ...r, status: "ready", time: label } : r));
    setActive(null);
    const ok = await persistReschedule(b);
    if (ok) toast({ kind: "ok", title: b.ref + " rescheduled", body: "Moved to Rescheduled · " + label + "." });
    else setRows(prevRows);
  }

  function openBooking(b: any) {
    setActive(b);
    if (b.status === "ready" || b.status === "pending") {
      const parts = b.time.split("·");
      setRdDate(""); setRdTime(parts[1] ? parts[1].trim() : "");
    }
  }

  function createBooking() {
    if (!form.phone.trim()) return;
    const ref = "NV-" + (2900 + rows.length + 1);
    let timeLabel = "Walk-in · now";
    if (form.mode === "scheduled") {
      timeLabel = form.date && form.time
        ? new Date(form.date).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" }) + " · " + form.time
        : form.date ? new Date(form.date).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })
        : "Scheduled · TBC";
    }
    const newRow = {
      ref, customer: form.name || "Unknown", vehicle: form.vehicle || "—",
      service: form.service || (form.mode === "walkin" ? "Walk-in" : "Scheduled job"),
      mech: "TBA", mInit: "?", mAv: "#999",
      store: form.store, status: "pending", time: timeLabel,
      price: form.paid ? +form.paid : 0, phone: form.phone, notes: form.notes,
    };
    setRows((prev) => [newRow, ...prev]);
    toast({ kind: "ok", title: "Booking created", body: ref + " added to Pending." });
    setNewBk(false); setForm(emptyForm);
  }

  function drawerFoot(b: any) {
    const dangerStyle = { color: "var(--danger, #e5484d)", borderColor: "color-mix(in oklab, var(--danger, #e5484d) 35%, transparent)" };
    if (b.status === "done" || b.status === "progress") {
      return <button className="btn ghost block" onClick={() => setActive(null)}><Icon name="x" />Close</button>;
    }
    if (b.status === "ready") {
      return (
        <React.Fragment>
          <button className="btn ghost" style={{ ...dangerStyle, flex: 1 }} onClick={() => cancelBooking(b)}><Icon name="x" />Cancel booking</button>
          <button className="btn" style={{ flex: 2 }} onClick={() => saveReschedule(b)}><Icon name="check" />Save new time</button>
        </React.Fragment>
      );
    }
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn ghost" style={{ ...dangerStyle, flex: 1 }} onClick={() => cancelBooking(b)}><Icon name="x" />Cancel booking</button>
          <button className="btn ghost" style={{ flex: 1, color: "var(--ok, #30a46c)", borderColor: "color-mix(in oklab, var(--ok, #30a46c) 35%, transparent)" }} onClick={() => advance(b)}><Icon name="checkCircle" />Completed</button>
        </div>
        {(rdDate || rdTime) && <button className="btn block" onClick={() => rescheduleAndMove(b)}><Icon name="check" />Done · Reschedule</button>}
      </div>
    );
  }

  return (
    <div className="page page-enter">
      <div className="pagehead">
        <div className="ph-txt"><h2>Bookings &amp; Service jobs</h2><p>Track pending jobs, rescheduled appointments and cancellations.</p></div>
        <div className="ph-actions">
          <button className="btn" onClick={() => { setForm(emptyForm); setNewBk(true); }}><Icon name="plus" />New booking</button>
        </div>
      </div>

      <div className="toolbar">
        <SearchBox value={q} onChange={setQ} placeholder="Search customer, vehicle or ref…" grow />
        <span className="badge brand dotless"><Icon name="calendar" style={{ width: 13, height: 13 }} />Today · {filtered.length} jobs</span>
      </div>

      <div className="kanban">
        {BK_COLS.map((col) => {
          const items = filtered.filter((b) => b.status === col.key);
          return (
            <div className="panel kcol" key={col.key}>
              <div className="kcol-head"><span className="kdot" style={{ background: col.color }}></span><b>{col.label}</b><span className="kn">{items.length}</span></div>
              {items.length === 0 ? <p style={{ fontSize: 12.5, color: "var(--ink-3)", padding: "10px 4px" }}>Nothing here.</p> :
                items.map((b) => (
                  <div className="kcard" key={b.ref} onClick={() => openBooking(b)}>
                    <div className="kcard-top"><span className="ref mono">{b.ref}</span>{b.price === 0 && <span className="badge ok dotless" style={{ fontSize: 10 }}>Free</span>}</div>
                    <h4>{b.service}</h4>
                    {b.vehicle && b.vehicle !== "—" && <div className="veh">{b.vehicle}</div>}
                    <div className="kcard-foot">
                      <div className="kcard-name">{b.customer}</div>
                      <div className="kcard-foot-row">
                        <span className="phone">{b.phone || ""}</span>
                        <span className="when">{b.time.split("·")[1]?.trim() || b.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          );
        })}
      </div>

      {active && (
        <Drawer title={active.service} sub={active.ref + " · " + active.store} onClose={() => setActive(null)} foot={drawerFoot(active)}>
          <div style={{ marginBottom: 18 }}><StatusBadge status={active.status} /></div>
          <div className="set-row"><Icon name="user" style={{ width: 18, color: "var(--ink-3)" }} /><div className="set-txt"><b>{active.customer}</b><span>Customer</span></div></div>
          {active.phone && <div className="set-row"><Icon name="phone" style={{ width: 18, color: "var(--ink-3)" }} /><div className="set-txt"><b>{active.phone}</b><span>Phone</span></div></div>}
          <div className="set-row"><Icon name="truck" style={{ width: 18, color: "var(--ink-3)" }} /><div className="set-txt"><b>{active.vehicle}</b><span>Vehicle</span></div></div>
          <div className="set-row"><Icon name="clock" style={{ width: 18, color: "var(--ink-3)" }} /><div className="set-txt"><b>{active.time}</b><span>Scheduled</span></div></div>
          <div className="set-row"><Icon name="dollar" style={{ width: 18, color: "var(--ink-3)" }} /><div className="set-txt"><b>{active.price === 0 ? "Free check" : "$" + active.price}</b><span>Estimated total</span></div></div>
          <hr className="hr" />

          {(active.status === "ready" || active.status === "pending") && (
            <React.Fragment>
              <div className="role-banner" style={{ background: "color-mix(in oklab, var(--accent) 10%, transparent)", borderColor: "color-mix(in oklab, var(--accent) 28%, transparent)", marginBottom: 14 }}>
                <Icon name="clock" style={{ color: "var(--accent)" }} />
                <span>{active.status === "ready" ? "Set a new date and time for this rescheduled booking." : "Set or update the date and time for this booking."}</span>
              </div>
              <div className="form-grid">
                <div className="field"><label>Date</label><input type="date" value={rdDate} onChange={(e) => setRdDate(e.target.value)} /></div>
                <div className="field"><label>Time</label><input type="time" value={rdTime} onChange={(e) => setRdTime(e.target.value)} /></div>
              </div>
              <hr className="hr" />
            </React.Fragment>
          )}

          {active.status === "progress" && active.mech !== "TBA" && (
            <div className="field"><label>Assigned mechanic</label>
              <div className="cell-flex" style={{ padding: "10px 14px", borderRadius: 12, background: "var(--chip)", border: "1px solid var(--border)" }}>
                <Avatar init={active.mInit} color={active.mAv} /><div><div className="cell-main">{active.mech}</div><div className="cell-sub">{active.store}</div></div>
              </div>
            </div>
          )}
          {active.status !== "done" && <div className="field"><label>Notes for the team</label><textarea placeholder="Add a note about this job…"></textarea></div>}
        </Drawer>
      )}

      {newBk && (
        <Drawer title="New booking" sub={form.mode === "walkin" ? "Walk-in customer" : "Scheduled appointment"} onClose={() => setNewBk(false)}
          foot={
            <React.Fragment>
              <button className="btn ghost" style={{ flex: 1 }} onClick={() => setNewBk(false)}>Discard</button>
              <button className="btn" style={{ flex: 2 }} disabled={!form.phone.trim()} onClick={createBooking}><Icon name="plus" />{form.mode === "walkin" ? "Create walk-in" : "Schedule booking"}</button>
            </React.Fragment>
          }>
          <div className="field">
            <label>Booking type</label>
            <div className="tabs" style={{ marginTop: 4 }}>
              <button className={form.mode === "walkin" ? "on" : ""} onClick={() => setForm({ ...form, mode: "walkin" })}>Walk-in</button>
              <button className={form.mode === "scheduled" ? "on" : ""} onClick={() => setForm({ ...form, mode: "scheduled" })}>Schedule</button>
            </div>
          </div>
          <hr className="hr" />
          <div className="field">
            <label>Phone number <span style={{ color: "var(--accent)", fontWeight: 700 }}>*</span></label>
            <input type="tel" placeholder="04xx xxx xxx" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} autoFocus />
          </div>

          {form.mode === "scheduled" && (
            <React.Fragment>
              <div className="field"><label style={{ display: "flex", justifyContent: "space-between" }}>Customer name <span style={{ color: "var(--ink-3)", fontWeight: 400 }}>optional</span></label><input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="field"><label style={{ display: "flex", justifyContent: "space-between" }}>Vehicle <span style={{ color: "var(--ink-3)", fontWeight: 400 }}>optional</span></label><input placeholder="e.g. 2021 Toyota RAV4" value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} /></div>
              <div className="field"><label style={{ display: "flex", justifyContent: "space-between" }}>Job / service <span style={{ color: "var(--ink-3)", fontWeight: 400 }}>optional</span></label><input placeholder="e.g. Log Book Service, Tyre Fit…" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} /></div>
              <div className="form-grid">
                <div className="field"><label style={{ display: "flex", justifyContent: "space-between" }}>Date <span style={{ color: "var(--ink-3)", fontWeight: 400 }}>optional</span></label><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
                <div className="field"><label style={{ display: "flex", justifyContent: "space-between" }}>Time <span style={{ color: "var(--ink-3)", fontWeight: 400 }}>optional</span></label><input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
              </div>
              <div className="field"><label style={{ display: "flex", justifyContent: "space-between" }}>Notes <span style={{ color: "var(--ink-3)", fontWeight: 400 }}>optional</span></label><textarea placeholder="Any details for the team…" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}></textarea></div>
            </React.Fragment>
          )}

          {form.mode === "walkin" && (
            <React.Fragment>
              <div className="field"><label style={{ display: "flex", justifyContent: "space-between" }}>Customer name <span style={{ color: "var(--ink-3)", fontWeight: 400 }}>optional</span></label><input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="field"><label style={{ display: "flex", justifyContent: "space-between" }}>Job / service <span style={{ color: "var(--ink-3)", fontWeight: 400 }}>optional</span></label><input placeholder="e.g. Tyre Fit, Oil Change…" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} /></div>
              <div className="field"><label style={{ display: "flex", justifyContent: "space-between" }}>Vehicle <span style={{ color: "var(--ink-3)", fontWeight: 400 }}>optional</span></label><input placeholder="e.g. 2021 Toyota RAV4" value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} /></div>
              <div className="field"><label style={{ display: "flex", justifyContent: "space-between" }}>Amount paid <span style={{ color: "var(--ink-3)", fontWeight: 400 }}>optional</span></label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--ink-3)", fontWeight: 600, pointerEvents: "none" }}>$</span>
                  <input type="number" min="0" placeholder="0.00" style={{ paddingLeft: 26 }} value={form.paid} onChange={(e) => setForm({ ...form, paid: e.target.value })} />
                </div>
              </div>
              <div className="field"><label style={{ display: "flex", justifyContent: "space-between" }}>Notes <span style={{ color: "var(--ink-3)", fontWeight: 400 }}>optional</span></label><textarea placeholder="Job details, parts used, anything for the record…" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}></textarea></div>
            </React.Fragment>
          )}

          <div className="field">
            <label>Store</label>
            <select value={form.store} onChange={(e) => setForm({ ...form, store: e.target.value })}>
              {storeNames.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </Drawer>
      )}
    </div>
  );
}

/* ===================== REVIEWS ===================== */
export function ReviewsPage({ ctx }: { ctx: Ctx; nav?: any }) {
  const D = (ctx as any)?.D || NOVA;
  const base = ctx.scopeBy(D.reviews, "store");
  const [rows, setRows] = useState<any[]>(base);
  const [q, setQ] = useState("");
  const [rating, setRating] = useState("all");
  const [reply, setReply] = useState<any>(null);
  const [replyText, setReplyText] = useState("");

  const list = rows.filter((r) =>
    (rating === "all" || r.rating === +rating) &&
    (r.author + r.text + r.store).toLowerCase().includes(q.toLowerCase())
  );
  const pager = usePager(list, 8);
  const avg = (rows.reduce((s, r) => s + r.rating, 0) / (rows.length || 1)).toFixed(1);
  const dist = [5, 4, 3, 2, 1].map((n) => ({ n, c: rows.filter((r) => r.rating === n).length }));
  const maxd = Math.max(...dist.map((d) => d.c), 1);
  const unanswered = rows.filter((r) => !r.reply).length;

  async function sendReply() {
    const target = reply; const text = replyText;
    const key = target.id;
    // Optimistic — show the reply immediately.
    setRows((prev) => prev.map((r) => (key ? r.id === key : r === target) ? { ...r, reply: text } : r));
    setReply(null); setReplyText("");

    if (!key) { toast({ kind: "ok", title: "Reply posted", body: "Your response to " + target.author + " is live." }); return; }
    try {
      await adminFetch(`/api/admin/reviews/${key}`, "PATCH", { reply: text });
      toast({ kind: "ok", title: "Reply posted", body: "Your response to " + target.author + " is live." });
      ctx.refetch?.();
    } catch (e: any) {
      setRows((prev) => prev.map((r) => r.id === key ? { ...r, reply: null } : r));  // rollback
      toast({ kind: "err", title: "Couldn't post reply", body: e?.message || "Please try again." });
    }
  }

  return (
    <div className="page page-enter">
      <div className="pagehead">
        <div className="ph-txt"><h2>Reviews &amp; Reputation</h2><p>Verified Google reviews{ctx.role === "manager" ? " for " + ctx.store : " across all stores"}.</p></div>
        <div className="ph-actions"><a className="btn ghost" href="https://www.google.com/search?q=Nova+Tyres+reviews" target="_blank" rel="noopener"><Icon name="external" />Open on Google</a></div>
      </div>

      <div className="grid-3" style={{ marginBottom: 16, gridTemplateColumns: "0.8fr 1.2fr 1fr" }}>
        <div className="panel"><div className="big-rating"><div className="num">{avg}</div><Stars value={Math.round(+avg)} /><div className="cnt">{rows.length} reviews shown</div></div></div>
        <div className="panel">
          <PanelHead title="Rating breakdown" />
          <div className="rdist">
            {dist.map((d) => (
              <div className="rdist-row" key={d.n}><span className="rk">{d.n}<Icon name="star" style={{ width: 12, height: 12 }} /></span>
                <span className="rdist-track"><i style={{ width: (d.c / maxd) * 100 + "%" }}></i></span><span className="rn">{d.c}</span></div>
            ))}
          </div>
        </div>
        <div className="panel" style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: 20 }}>
          <div className="mini-stat" style={{ padding: 0 }}><div className="ms-label"><Icon name="reply" />Awaiting reply</div><div className="ms-val" style={{ color: unanswered ? "var(--accent)" : "var(--ok)" }}>{unanswered}</div></div>
          <p style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 10 }}>Responding quickly boosts your local ranking and customer trust.</p>
        </div>
      </div>

      <div className="toolbar">
        <SearchBox value={q} onChange={setQ} placeholder="Search reviews…" grow />
        <div className="tabs">
          {["all", "5", "4", "3"].map((r) => <button key={r} className={rating === r ? "on" : ""} onClick={() => setRating(r)}>{r === "all" ? "All ratings" : r + "★"}</button>)}
        </div>
      </div>

      {list.length === 0 ? <div className="panel"><EmptyState icon="star" title="No reviews" text="Nothing matches that filter." /></div> : (
        <div className="grid-2" style={{ gridTemplateColumns: "1fr 1fr", alignItems: "start" }}>
          {pager.slice.map((r, i) => (
            <div className="panel rev-card" key={i}>
              <div className="rev-card-top">
                <Avatar init={r.init} color={r.av} />
                <div className="meta"><b>{r.author}{r.verified && <Icon name="checkCircle" style={{ width: 14, height: 14, color: "var(--info)" }} />}</b><span>{r.time} · {r.store}</span></div>
                <Stars value={r.rating} />
              </div>
              <p className="rev-quote">&quot;{r.text}&quot;</p>
              {r.reply ? (
                <div className="rev-reply"><div className="rl-head"><Icon name="reply" />Nova Tyres replied</div><p>{r.reply}</p></div>
              ) : (
                <div className="rev-card-foot"><button className="btn ghost sm" onClick={() => { setReply(r); setReplyText(""); }}><Icon name="reply" />Reply</button><span className="badge warn dotless" style={{ fontSize: 11 }}>Awaiting reply</span></div>
              )}
            </div>
          ))}
        </div>
      )}
      <Pager pager={pager} unit="reviews" />

      {reply && (
        <Modal wide onClose={() => setReply(null)}>
          <div className="modal-head">
            <Avatar init={reply.init} color={reply.av} size="lg" />
            <div><h3>Reply to {reply.author}</h3><p>{reply.store} · {reply.time}</p></div>
            <button className="iconbtn x" onClick={() => setReply(null)}><Icon name="x" /></button>
          </div>
          <div className="modal-body">
            <div className="rev-quote" style={{ padding: "12px 14px", background: "var(--chip)", borderRadius: 12, marginBottom: 14 }}><Stars value={reply.rating} className="sm" /><p style={{ marginTop: 6 }}>&quot;{reply.text}&quot;</p></div>
            <div className="field"><label>Your public reply</label><textarea autoFocus value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Thanks for the feedback…"></textarea></div>
          </div>
          <div className="modal-foot"><button className="btn ghost" onClick={() => setReply(null)}>Cancel</button><button className="btn" disabled={!replyText.trim()} onClick={sendReply}><Icon name="reply" />Post reply</button></div>
        </Modal>
      )}
    </div>
  );
}
