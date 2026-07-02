"use client";
/* ============================================================
   NOVA TYRES — Admin · shared UI primitives (ported)
   ============================================================ */
import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { Icon } from "./icons";

/* ---------- Avatar ---------- */
export function Avatar({ name, init, color, size, img }: any) {
  const cls = "avatar" + (size ? " " + size : "");
  const label = init || (name ? name.split(" ").map((w: string) => w[0]).slice(0, 2).join("") : "?");
  return (
    <span className={cls} style={{ ["--av" as any]: color || "var(--brand)" }}>
      {img ? <img src={img} alt={name} /> : label}
    </span>
  );
}

/* ---------- Status badge ---------- */
const STATUS_MAP: Record<string, [string, string]> = {
  online: ["ok", "Online"], offline: ["", "Offline"], open: ["ok", "Open"], closed: ["danger", "Closed"],
  active: ["ok", "Active"], pending: ["warn", "Pending"], paid: ["ok", "Paid"], refunded: ["danger", "Refunded"],
  published: ["ok", "Published"], draft: ["warn", "Draft"], progress: ["info", "In progress"],
  ready: ["accent", "Ready for pickup"], done: ["", "Completed"],
  processing: ["info", "Processing"], dispatched: ["accent", "Dispatched"], cancelled: ["danger", "Cancelled"],
};
export function StatusBadge({ status, live }: { status: string; live?: boolean }) {
  const [cls, label] = STATUS_MAP[status] || ["", status];
  return <span className={"badge " + cls + (live ? " live" : "")}><span className="bdot"></span>{label}</span>;
}
export function StockBadge({ stock, low }: { stock: number; low: number }) {
  if (stock === 0) return <span className="badge danger"><span className="bdot"></span>Out of stock</span>;
  if (stock <= low) return <span className="badge warn"><span className="bdot"></span>Low stock</span>;
  return <span className="badge ok"><span className="bdot"></span>In stock</span>;
}

/* ---------- Tooltip ---------- */
export function Tooltip({ label, children }: any) {
  return <span className="tip">{children}<span className="tip-pop">{label}</span></span>;
}

/* ---------- Switch ---------- */
export function Switch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return <button type="button" className={"switch" + (on ? " on" : "")} onClick={() => onChange(!on)} aria-pressed={on}></button>;
}

/* ---------- Stars ---------- */
export function Stars({ value, className }: { value: number; className?: string }) {
  const full = Math.round(value);
  return <span className={"stars " + (className || "")}>{"★★★★★".slice(0, full)}<span style={{ color: "var(--chip-2)" }}>{"★★★★★".slice(full)}</span></span>;
}

/* ---------- Empty state ---------- */
export function EmptyState({ icon, title, text, action }: any) {
  return (
    <div className="empty">
      <div className="empty-ico"><Icon name={icon || "search"} /></div>
      <h4>{title}</h4>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

/* ---------- Modal shell ---------- */
export function Modal({ onClose, wide, children }: any) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={"modal" + (wide ? " wide" : "")} role="dialog" aria-modal="true">{children}</div>
    </div>
  );
}

/* ---------- Confirm modal ---------- */
export function ConfirmModal({ title, body, confirmLabel, danger, icon, onConfirm, onClose }: any) {
  return (
    <Modal onClose={onClose}>
      <div className="modal-head">
        <div className="m-ico" style={{
          background: danger ? "color-mix(in oklab, var(--danger) 14%, transparent)" : "color-mix(in oklab, var(--brand) 14%, transparent)",
          color: danger ? "var(--danger)" : "var(--brand-2)"
        }}><Icon name={icon || (danger ? "alert" : "checkCircle")} /></div>
        <div>
          <h3>{title}</h3>
          <p>{body}</p>
        </div>
        <button className="iconbtn x" onClick={onClose}><Icon name="x" /></button>
      </div>
      <div className="modal-foot">
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className={"btn" + (danger ? " danger" : "")} onClick={onConfirm}>{confirmLabel || "Confirm"}</button>
      </div>
    </Modal>
  );
}

/* ---------- Drawer ---------- */
export function Drawer({ title, sub, onClose, foot, children }: any) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="drawer-wrap">
      <div className="drawer-bg" onClick={onClose}></div>
      <div className="drawer" role="dialog" aria-modal="true">
        <div className="drawer-head">
          <div style={{ minWidth: 0 }}>
            <h3>{title}</h3>
            {sub && <div className="sub">{sub}</div>}
          </div>
          <button className="iconbtn x" onClick={onClose}><Icon name="x" /></button>
        </div>
        <div className="drawer-body scroll">{children}</div>
        {foot && <div className="drawer-foot">{foot}</div>}
      </div>
    </div>
  );
}

/* ---------- Donut (SVG) ---------- */
export function Donut({ segments, centerVal, centerLabel }: any) {
  const total = segments.reduce((s: number, x: any) => s + x.value, 0) || 1;
  const R = 54, C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div className="donut-wrap">
      <div className="donut">
        <svg viewBox="0 0 132 132" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="66" cy="66" r={R} fill="none" stroke="var(--chip-2)" strokeWidth="13" />
          {segments.map((s: any, i: number) => {
            const len = (s.value / total) * C;
            const el = <circle key={i} cx="66" cy="66" r={R} fill="none" stroke={s.color} strokeWidth="13"
              strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset} strokeLinecap="round" />;
            offset += len;
            return el;
          })}
        </svg>
        <div className="donut-center"><b>{centerVal}</b><span>{centerLabel}</span></div>
      </div>
      <div className="donut-legend">
        {segments.map((s: any, i: number) => (
          <div className="dl-row" key={i}>
            <span className="lg-dot" style={{ background: s.color }}></span>{s.label}
            <b>{s.value}<span className="muted" style={{ fontWeight: 600 }}> {s.unit || ""}</span></b>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Sparkline ---------- */
export function Sparkline({ data, color, w = 78, h = 34 }: any) {
  const max = Math.max(...data), min = Math.min(...data);
  const rng = max - min || 1;
  const pts = data.map((v: number, i: number) => [(i / (data.length - 1)) * w, h - ((v - min) / rng) * (h - 6) - 3]);
  const d = pts.map((p: number[], i: number) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const area = d + ` L${w} ${h} L0 ${h} Z`;
  const id = "sg" + Math.random().toString(36).slice(2, 7);
  return (
    <svg className="kpi-spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={color} stopOpacity="0.32" /><stop offset="1" stopColor={color} stopOpacity="0" />
      </linearGradient></defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------- Toast system ---------- */
let _toastPush: ((t: any) => void) | null = null;
export function toast(opts: any) { if (_toastPush) _toastPush(typeof opts === "string" ? { title: opts } : opts); }
export function ToastHost() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    _toastPush = (t: any) => {
      const id = Date.now() + Math.random();
      setItems((prev) => [...prev, { id, kind: "ok", ...t }]);
      setTimeout(() => setItems((prev) => prev.map((x) => x.id === id ? { ...x, out: true } : x)), (t.duration || 3400));
      setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== id)), (t.duration || 3400) + 320);
    };
    return () => { _toastPush = null; };
  }, []);
  const ico: Record<string, string> = { ok: "checkCircle", err: "alert", info: "info" };
  return (
    <div className="toasts">
      {items.map((t) => (
        <div key={t.id} className={"toast " + t.kind + (t.out ? " out" : "")}>
          <div className="toast-ico"><Icon name={ico[t.kind] || "checkCircle"} /></div>
          <div className="toast-txt"><b>{t.title}</b>{t.body && <span>{t.body}</span>}</div>
          <button className="toast-x" onClick={() => setItems((prev) => prev.filter((x) => x.id !== t.id))}><Icon name="x" /></button>
        </div>
      ))}
    </div>
  );
}

/* ---------- Dropdown menu (click-away) ---------- */
export function useClickAway(onAway: () => void) {
  const ref = useRef<any>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target)) onAway(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onAway]);
  return ref;
}

/* ---------- Searchbox ---------- */
export function SearchBox({ value, onChange, placeholder, grow }: any) {
  return (
    <label className={"searchbox" + (grow ? " grow" : "")}>
      <Icon name="search" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || "Search…"} />
    </label>
  );
}

/* ---------- Panel header ---------- */
export function PanelHead({ title, sub, right }: any) {
  return (
    <div className="panel-head">
      <div>
        <h3>{title}</h3>
        {sub && <div className="sub">{sub}</div>}
      </div>
      {right && <div className="right">{right}</div>}
    </div>
  );
}
