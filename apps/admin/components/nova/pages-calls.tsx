"use client";
/* ============================================================
   NOVA TYRES — Admin · Calls & Enquiries (ported)
   ============================================================ */
import * as React from "react";
import { useState } from "react";
import { NOVA } from "../../lib/nova/data";
import { Icon } from "./icons";
import { Avatar, Tooltip, Drawer, Modal, toast, SearchBox, EmptyState } from "./ui";

type Ctx = any;

const CALL_OUTCOME: Record<string, [string, string]> = {
  booked: ["ok", "Booked"], thinking: ["warn", "Considering"], "will-book": ["info", "Will book"],
  declined: ["danger", "Declined"], callback: ["accent", "Needs call back"], resolved: ["", "Called back"],
};
const MECHS = [
  { name: "Tom Baker", init: "TB", av: "#0EA5A5" },
  { name: "Aisha Rahman", init: "AR", av: "#D6336C" },
  { name: "Jack Whitfield", init: "JW", av: "#7048E8" },
  { name: "Raj Thakur", init: "RT", av: "#0E9F57" },
  { name: "Liam O'Brien", init: "LO", av: "#2F9E44" },
];
const SERVICES = ["Log Book Service", "Free Pre-RWC Check", "Yearly Service", "Brake Replacement", "Ultimate Service", "Tyre Fit + Balance", "Wheel Alignment", "3 Year Service"];

export function CallsPage({ ctx, nav }: { ctx: Ctx; nav?: (p: string) => void }) {
  const D = NOVA;
  const allStores = D.stores.map((s) => s.name);
  const [rows, setRows] = useState<any[]>(() => ctx.scopeBy(D.calls, "store").map((c: any) => ({ ...c })));
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [storeFilter, setStoreFilter] = useState(ctx.role === "manager" ? ctx.store : "all");
  const [log, setLog] = useState<any>(false);
  const [view, setView] = useState<any>(null);
  const [justBooked, setJustBooked] = useState<any>(null);

  const counts: Record<string, number> = {
    all: rows.length,
    booking: rows.filter((c) => c.kind === "booking").length,
    enquiry: rows.filter((c) => c.kind === "enquiry").length,
    missed: rows.filter((c) => c.kind === "missed").length,
  };
  const convRate = counts.all ? Math.round((counts.booking / counts.all) * 100) : 0;

  const list = rows.filter((c) =>
    (filter === "all" || c.kind === filter) &&
    (storeFilter === "all" || c.store === storeFilter) &&
    (c.customer + c.phone + c.topic + (c.service || "")).toLowerCase().includes(q.toLowerCase())
  );

  function addBookingToQueue(b: any) { D.bookings.unshift(b); }

  function saveCall(form: any) {
    const init = form.customer.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase() || "?";
    const av = ["#076330", "#2D6BE0", "#0E9F57", "#E08600", "#D6336C", "#7048E8"][Math.floor(Math.random() * 6)];
    const base = { id: "k" + Date.now(), customer: form.customer, phone: form.phone, init, av, store: form.store, kind: form.kind, topic: form.topic, time: "Today · just now", duration: form.duration || "—", handledBy: ctx.name, note: form.note };

    if (form.kind === "booking") {
      const ref = "NV-" + Math.floor(2845 + Math.random() * 120);
      const mech = MECHS.find((m) => m.name === form.mech) || MECHS[0];
      const booking = { ref, customer: form.customer, vehicle: form.vehicle || "—", service: form.service, mech: mech.name, mInit: mech.init, mAv: mech.av, store: form.store, status: "pending", time: form.when || "Today · TBC", price: +form.price || 0 };
      addBookingToQueue(booking);
      const call = { ...base, vehicle: form.vehicle, service: form.service, price: +form.price || 0, when: form.when, outcome: "booked", ref };
      setRows((prev) => [call, ...prev]);
      setLog(false);
      setJustBooked({ ref, customer: form.customer, service: form.service });
      toast({ kind: "ok", title: "Booking created", body: ref + " added to Bookings · " + form.customer });
    } else if (form.kind === "missed") {
      const call = { ...base, customer: form.customer.trim() || "Unknown caller", init: form.customer.trim() ? init : "?", av: form.customer.trim() ? av : "#8A8F96", topic: "Missed call", duration: "—", handledBy: "—", outcome: "callback" };
      setRows((prev) => [call, ...prev]);
      setLog(false);
      toast({ kind: "ok", title: "Missed call logged", body: (call.customer) + " · flagged for a call back." });
    } else {
      const call = { ...base, quoted: +form.quoted || null, outcome: form.outcome };
      setRows((prev) => [call, ...prev]);
      setLog(false);
      toast({ kind: "ok", title: "Enquiry logged", body: form.customer + " · " + form.topic });
    }
  }

  function markCalledBack(c: any) {
    setRows((prev) => prev.map((x) => x.id === c.id ? { ...x, outcome: "resolved", handledBy: ctx.name } : x));
    setView((v: any) => v && v.id === c.id ? { ...v, outcome: "resolved", handledBy: ctx.name } : v);
    toast({ kind: "ok", title: "Marked as called back", body: c.customer + " · " + c.phone });
  }

  const needCallback = rows.filter((c) => c.outcome === "callback").length;

  return (
    <div className="page page-enter">
      <div className="pagehead">
        <div className="ph-txt"><h2>Calls &amp; Enquiries</h2><p>Log every phone call — quick price enquiries, phone bookings and missed calls, all in one place.</p></div>
        <div className="ph-actions"><button className="btn" onClick={() => setLog(true)}><Icon name="phone" />Log a call</button></div>
      </div>

      {needCallback > 0 && (
        <div className="role-banner"><Icon name="phone" /><span><b>{needCallback} {needCallback === 1 ? "caller needs" : "callers need"} a call back</b> — don't leave them waiting too long.</span><span className="spacer"></span><button className="btn sm ghost" onClick={() => setFilter("missed")}>Show missed</button></div>
      )}

      <div className="summary-row">
        <div className="panel mini-stat"><div className="ms-label"><Icon name="phone" />Calls today</div><div className="ms-val">{rows.filter((c) => c.time.startsWith("Today")).length}</div></div>
        <div className="panel mini-stat"><div className="ms-label"><Icon name="calendar" />Booked</div><div className="ms-val" style={{ color: "var(--ok)" }}>{counts.booking}</div></div>
        <div className="panel mini-stat"><div className="ms-label"><Icon name="chat" />Enquiries</div><div className="ms-val" style={{ color: "var(--info)" }}>{counts.enquiry}</div></div>
        <div className="panel mini-stat"><div className="ms-label"><Icon name="trending" />Conversion</div><div className="ms-val">{convRate}<small>%</small></div></div>
      </div>

      <div className="toolbar">
        <SearchBox value={q} onChange={setQ} placeholder="Search caller, number or topic…" grow />
        {ctx.role !== "manager" && (
          <select value={storeFilter} onChange={(e) => setStoreFilter(e.target.value)}
            style={{ height: 38, borderRadius: 10, border: "1px solid var(--border)", background: "var(--chip)", color: "var(--ink)", fontSize: 13, fontWeight: 600, padding: "0 32px 0 12px", appearance: "none", WebkitAppearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", cursor: "pointer", flexShrink: 0 }}>
            <option value="all">All stores</option>
            {allStores.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
        <div className="tabs">
          {[["all", "All"], ["booking", "Bookings"], ["enquiry", "Enquiries"], ["missed", "Missed"]].map(([k, l]) => (
            <button key={k} className={filter === k ? "on" : ""} onClick={() => setFilter(k)}>{l}<span className="pillcount">{counts[k]}</span></button>
          ))}
        </div>
      </div>

      <div className="panel">
        {list.length === 0 ? <EmptyState icon="phone" title="No calls logged" text="When you take a customer call, log it here so nothing slips through." action={<button className="btn" onClick={() => setLog(true)}><Icon name="phone" />Log a call</button>} /> : (
          <div className="table-wrap">
            <table className="tbl">
              <thead><tr><th>Caller</th><th>Type</th><th>About</th><th>Store</th><th>When</th><th>Outcome</th><th></th></tr></thead>
              <tbody>
                {list.map((c) => {
                  const [oc, ol] = CALL_OUTCOME[c.outcome] || ["", c.outcome];
                  return (
                    <tr key={c.id} onClick={() => setView(c)} style={{ cursor: "pointer" }}>
                      <td><div className="cell-flex"><Avatar init={c.init} color={c.av} /><div><div className="cell-main">{c.customer}</div><div className="cell-sub mono">{c.phone}</div></div></div></td>
                      <td>
                        {c.kind === "booking" ? <span className="badge brand dotless"><Icon name="calendar" style={{ width: 12, height: 12 }} />Booking</span>
                          : c.kind === "missed" ? <span className="badge danger dotless"><Icon name="phone" style={{ width: 12, height: 12 }} />Missed</span>
                          : <span className="badge info dotless"><Icon name="chat" style={{ width: 12, height: 12 }} />Enquiry</span>}
                      </td>
                      <td><div className="cell-main" style={{ fontWeight: 600 }}>{c.service || c.topic}</div>{c.quoted ? <div className="cell-sub">Quoted ${c.quoted}</div> : c.price ? <div className="cell-sub">${c.price} · {c.when}</div> : null}</td>
                      <td className="nowrap">{c.store}</td>
                      <td className="muted nowrap">{c.time}</td>
                      <td><span className={"badge dotless " + oc}>{ol}</span></td>
                      <td><div className="row-actions">
                        {c.outcome === "callback" && <Tooltip label="Mark as called back"><button className="iconbtn" onClick={(e) => { e.stopPropagation(); markCalledBack(c); }}><Icon name="checkCircle" /></button></Tooltip>}
                        {(c.kind === "enquiry" || c.kind === "missed") && <Tooltip label="Convert to booking"><button className="iconbtn" onClick={(e) => { e.stopPropagation(); setLog({ from: c }); }}><Icon name="calendar" /></button></Tooltip>}
                        <Tooltip label="View"><button className="iconbtn" onClick={(e) => { e.stopPropagation(); setView(c); }}><Icon name="eye" /></button></Tooltip>
                      </div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {log && <LogCallModal ctx={ctx} from={log.from} onClose={() => setLog(false)} onSave={saveCall} />}

      {view && (
        <Drawer title={view.customer} sub={view.phone + " · " + view.store} onClose={() => setView(null)}
          foot={view.kind === "enquiry"
            ? <button className="btn block" onClick={() => { setView(null); setLog({ from: view }); }}><Icon name="calendar" />Convert to booking</button>
            : view.ref ? <button className="btn ghost block" onClick={() => { setView(null); nav && nav("bookings"); }}><Icon name="arrowR" />Open in Bookings</button>
            : view.outcome === "callback"
            ? <React.Fragment>
                <button className="btn ghost" style={{ flex: 1 }} onClick={() => { setView(null); setLog({ from: view }); }}><Icon name="calendar" />Log as booking</button>
                <button className="btn" style={{ flex: 1 }} onClick={() => markCalledBack(view)}><Icon name="checkCircle" />Mark called back</button>
              </React.Fragment>
            : <button className="btn block" onClick={() => { toast({ kind: "info", title: "Calling back…", body: view.phone }); }}><Icon name="phone" />Call back</button>}>
          <div style={{ marginBottom: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {view.kind === "booking" ? <span className="badge brand dotless"><Icon name="calendar" style={{ width: 13, height: 13 }} />Phone booking</span>
              : view.kind === "missed" ? <span className="badge danger dotless">Missed call</span>
              : <span className="badge info dotless"><Icon name="chat" style={{ width: 13, height: 13 }} />Price enquiry</span>}
            {(() => { const [oc, ol] = CALL_OUTCOME[view.outcome] || ["", view.outcome]; return <span className={"badge dotless " + oc}>{ol}</span>; })()}
            {view.ref && <span className="badge ok dotless mono">{view.ref}</span>}
          </div>
          <div className="set-row"><Icon name="clock" style={{ width: 18, color: "var(--ink-3)" }} /><div className="set-txt"><b>{view.time}</b><span>Call time · {view.duration} duration</span></div></div>
          <div className="set-row"><Icon name="user" style={{ width: 18, color: "var(--ink-3)" }} /><div className="set-txt"><b>{view.handledBy}</b><span>Handled by</span></div></div>
          {view.vehicle && <div className="set-row"><Icon name="truck" style={{ width: 18, color: "var(--ink-3)" }} /><div className="set-txt"><b>{view.vehicle}</b><span>Vehicle</span></div></div>}
          {view.service && <div className="set-row"><Icon name="wrench" style={{ width: 18, color: "var(--ink-3)" }} /><div className="set-txt"><b>{view.service}</b><span>{view.price ? "$" + view.price + " · " + view.when : "Service requested"}</span></div></div>}
          {view.quoted != null && <div className="set-row"><Icon name="dollar" style={{ width: 18, color: "var(--ink-3)" }} /><div className="set-txt"><b>${view.quoted}</b><span>Price quoted</span></div></div>}
          <hr className="hr" />
          <div className="field"><label>Call notes</label>
            <div style={{ padding: "12px 14px", borderRadius: 12, background: "var(--chip)", border: "1px solid var(--border)", fontSize: 13.5, lineHeight: 1.5, color: "var(--ink-2)" }}>{view.note || "No notes."}</div>
          </div>
        </Drawer>
      )}

      {justBooked && (
        <Modal onClose={() => setJustBooked(null)}>
          <div className="modal-head">
            <div className="m-ico" style={{ background: "color-mix(in oklab, var(--brand) 14%, transparent)", color: "var(--brand-2)" }}><Icon name="checkCircle" /></div>
            <div><h3>Booking sent to Bookings</h3><p>{justBooked.ref} · {justBooked.service} for {justBooked.customer} is now in the pending queue.</p></div>
            <button className="iconbtn x" onClick={() => setJustBooked(null)}><Icon name="x" /></button>
          </div>
          <div className="modal-foot"><button className="btn ghost" onClick={() => setJustBooked(null)}>Stay here</button><button className="btn" onClick={() => { setJustBooked(null); nav && nav("bookings"); }}><Icon name="arrowR" />View in Bookings</button></div>
        </Modal>
      )}
    </div>
  );
}

/* ---------- Log call modal ---------- */
function LogCallModal({ ctx, from, onClose, onSave }: { ctx: Ctx; from?: any; onClose: () => void; onSave: (f: any) => void }) {
  const D = NOVA;
  const [kind, setKind] = useState(from ? "booking" : "enquiry");
  const [f, setF] = useState<any>({
    customer: from ? from.customer : "", phone: from ? from.phone : "",
    store: from ? from.store : (ctx.role === "manager" ? ctx.store : "Springvale"),
    topic: from ? from.topic : "", duration: "", note: from ? from.note : "",
    quoted: from && from.quoted ? from.quoted : "", outcome: "thinking",
    vehicle: from && from.vehicle ? from.vehicle : "", service: SERVICES[0], price: "", when: "", mech: MECHS[0].name,
  });
  const set = (k: string, v: any) => setF((prev: any) => ({ ...prev, [k]: v }));

  function submit() {
    if (kind === "missed") {
      if (!f.phone.trim() && !f.customer.trim()) { toast({ kind: "err", title: "Add a name or number", body: "We need something to call back." }); return; }
      onSave({ ...f, kind }); return;
    }
    if (!f.customer.trim()) { toast({ kind: "err", title: "Caller name needed" }); return; }
    if (kind === "booking" && !f.service) { toast({ kind: "err", title: "Pick a service" }); return; }
    if (kind === "enquiry" && !f.topic.trim()) { toast({ kind: "err", title: "What did they ask about?" }); return; }
    onSave({ ...f, kind });
  }

  return (
    <Modal wide onClose={onClose}>
      <div className="modal-head">
        <div className="m-ico" style={{ background: "color-mix(in oklab, var(--brand) 14%, transparent)", color: "var(--brand-2)" }}><Icon name="phone" /></div>
        <div><h3>{from ? "Convert call to booking" : "Log a call"}</h3><p>Capture the caller and choose what kind of call it was.</p></div>
        <button className="iconbtn x" onClick={onClose}><Icon name="x" /></button>
      </div>
      <div className="modal-body">
        <label style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-2)", display: "block", marginBottom: 8 }}>What kind of call is this?</label>
        <div className="call-type-pick">
          <button type="button" className={"ctype" + (kind === "enquiry" ? " on" : "")} onClick={() => setKind("enquiry")}>
            <span className="ctype-ico" style={{ background: "color-mix(in oklab, var(--info) 14%, transparent)", color: "var(--info)" }}><Icon name="chat" /></span>
            <b>Enquiry</b><span>Just asking — price, hours, advice</span>
            {kind === "enquiry" && <span className="ctype-check"><Icon name="check" /></span>}
          </button>
          <button type="button" className={"ctype" + (kind === "booking" ? " on" : "")} onClick={() => setKind("booking")}>
            <span className="ctype-ico" style={{ background: "color-mix(in oklab, var(--brand) 14%, transparent)", color: "var(--brand-2)" }}><Icon name="calendar" /></span>
            <b>Booking</b><span>Wants a job booked in</span>
            {kind === "booking" && <span className="ctype-check"><Icon name="check" /></span>}
          </button>
          <button type="button" className={"ctype" + (kind === "missed" ? " on" : "")} onClick={() => setKind("missed")}>
            <span className="ctype-ico" style={{ background: "color-mix(in oklab, var(--danger) 13%, transparent)", color: "var(--danger)" }}><Icon name="alert" /></span>
            <b>Missed call</b><span>No one picked up — needs a call back</span>
            {kind === "missed" && <span className="ctype-check"><Icon name="check" /></span>}
          </button>
        </div>

        {kind === "booking" && <div className="role-banner" style={{ marginTop: 14, marginBottom: 0 }}><Icon name="info" /><span>Booking details below are sent straight to the <b>Bookings</b> board as a pending job.</span></div>}
        {kind === "missed" && <div className="role-banner" style={{ marginTop: 14, marginBottom: 0 }}><Icon name="phone" /><span>This will be flagged <b>Needs call back</b> so the team follows up. Name is optional if you only have the number.</span></div>}

        <hr className="hr" />

        <div className="form-grid">
          <div className="field"><label>Caller name {kind === "missed" && <span className="opt">(optional)</span>}</label><input value={f.customer} onChange={(e) => set("customer", e.target.value)} placeholder={kind === "missed" ? "Unknown caller" : "e.g. Sarah Jones"} /></div>
          <div className="field"><label>Phone {kind !== "missed" && <span className="opt">(optional)</span>}</label><input value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="0412 345 678" /></div>
        </div>
        <div className="form-grid">
          <div className="field"><label>Store</label>
            <select value={f.store} onChange={(e) => set("store", e.target.value)} disabled={ctx.role === "manager"}>
              {D.stores.map((s) => <option key={s.id}>{s.name}</option>)}
            </select>
          </div>
          {kind !== "missed" && <div className="field"><label>Call length <span className="opt">(optional)</span></label><input value={f.duration} onChange={(e) => set("duration", e.target.value)} placeholder="e.g. 4m" /></div>}
        </div>

        {kind === "missed" ? null : kind === "enquiry" ? (
          <React.Fragment>
            <div className="field"><label>What did they ask about?</label><input value={f.topic} onChange={(e) => set("topic", e.target.value)} placeholder="e.g. Price for 4 new tyres" /></div>
            <div className="form-grid">
              <div className="field"><label>Price quoted <span className="opt">($, optional)</span></label><input type="number" value={f.quoted} onChange={(e) => set("quoted", e.target.value)} placeholder="0" /></div>
              <div className="field"><label>Where did it land?</label>
                <select value={f.outcome} onChange={(e) => set("outcome", e.target.value)}>
                  <option value="thinking">Considering it</option>
                  <option value="will-book">Will book later</option>
                  <option value="declined">Not proceeding</option>
                  <option value="callback">Needs a call back</option>
                </select>
              </div>
            </div>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <div className="form-grid">
              <div className="field"><label>Service / job type</label>
                <select value={f.service} onChange={(e) => set("service", e.target.value)}>{SERVICES.map((s) => <option key={s}>{s}</option>)}</select>
              </div>
              <div className="field"><label>Vehicle</label><input value={f.vehicle} onChange={(e) => set("vehicle", e.target.value)} placeholder="e.g. 2020 Mazda 3" /></div>
            </div>
            <div className="form-grid">
              <div className="field"><label>Estimated price <span className="opt">($)</span></label><input type="number" value={f.price} onChange={(e) => set("price", e.target.value)} placeholder="0" /></div>
              <div className="field"><label>Preferred time</label><input value={f.when} onChange={(e) => set("when", e.target.value)} placeholder="e.g. Fri · 9:00" /></div>
            </div>
            <div className="field"><label>Assign mechanic</label>
              <select value={f.mech} onChange={(e) => set("mech", e.target.value)}>{MECHS.map((m) => <option key={m.name}>{m.name}</option>)}</select>
            </div>
          </React.Fragment>
        )}

        <div className="field" style={{ marginBottom: 0 }}><label>Notes <span className="opt">(optional)</span></label><textarea value={f.note} onChange={(e) => set("note", e.target.value)} placeholder="Anything worth remembering…"></textarea></div>
      </div>
      <div className="modal-foot">
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        {kind === "booking"
          ? <button className="btn" onClick={submit}><Icon name="calendar" />Create booking</button>
          : kind === "missed"
          ? <button className="btn" onClick={submit}><Icon name="phone" />Log missed call</button>
          : <button className="btn" onClick={submit}><Icon name="check" />Log enquiry</button>}
      </div>
    </Modal>
  );
}
