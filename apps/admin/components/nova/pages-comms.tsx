"use client";
/* ============================================================
   NOVA TYRES — Admin · Messages (chat) + Roles & Access (ported)
   ============================================================ */
import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { NOVA } from "../../lib/nova/data";
import { adminFetch } from "../../lib/adminFetch";
import { Icon } from "./icons";
import { Avatar, Tooltip, Drawer, ConfirmModal, toast, SearchBox, EmptyState } from "./ui";

type Ctx = any;

/* ===================== MESSAGES ===================== */
export function MessagesPage({ ctx }: { ctx: Ctx; nav?: any }) {
  const D = (ctx as any)?.D || NOVA;
  const [convos, setConvos] = useState<any[]>(() => ctx.scopeBy(D.conversations, "store").map((c: any) => ({ ...c, messages: [...c.messages] })));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [draft, setDraft] = useState("");
  const bodyRef = useRef<any>(null);

  const list = convos.filter((c) =>
    (filter === "all" || (filter === "unread" ? c.unread > 0 : c.status === filter)) &&
    (c.customer + c.topic + c.store).toLowerCase().includes(q.toLowerCase())
  );
  const active = convos.find((c) => c.id === activeId);
  const totalUnread = convos.reduce((s, c) => s + c.unread, 0);

  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; }, [activeId, active && active.messages.length]);

  function open(c: any) { setActiveId(c.id); setConvos((prev) => prev.map((x) => x.id === c.id ? { ...x, unread: 0 } : x)); }
  async function send() {
    if (!draft.trim()) return;
    const text = draft; const convoId = activeId;
    const now = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    // Optimistic — show the outgoing message immediately.
    setConvos((prev) => prev.map((x) => x.id === convoId ? { ...x, agent: ctx.name, status: "open", messages: [...x.messages, { from: "store", text, time: now, agent: ctx.name }] } : x));
    setDraft("");

    if (!convoId) return;
    try {
      await adminFetch("/api/admin/messages", "POST", { conversationId: convoId, body: text });
      ctx.refetch?.();
    } catch (e: any) {
      toast({ kind: "err", title: "Message not sent", body: e?.message || "Please try again." });
    }
  }
  async function closeConvo() {
    const convoId = activeId; const wasOpen = active.status === "open";
    setConvos((prev) => prev.map((x) => x.id === convoId ? { ...x, status: wasOpen ? "closed" : "open" } : x));
    toast({ kind: "ok", title: wasOpen ? "Conversation closed" : "Conversation reopened" });

    if (!convoId) return;
    try {
      await adminFetch(`/api/admin/conversations/${convoId}`, "PATCH", { status: wasOpen ? "closed" : "active" });
      ctx.refetch?.();
    } catch (e: any) {
      setConvos((prev) => prev.map((x) => x.id === convoId ? { ...x, status: wasOpen ? "open" : "closed" } : x));  // rollback
      toast({ kind: "err", title: "Couldn't update conversation", body: e?.message || "Please try again." });
    }
  }

  return (
    <div className="page page-enter">
      <div className="pagehead">
        <div className="ph-txt"><h2>Messages</h2><p>{ctx.role === "manager" ? "Live chat with customers of " + ctx.store + "." : "Customer conversations across every store."}</p></div>
        <div className="ph-actions"><span className="badge brand dotless"><Icon name="chat" style={{ width: 14, height: 14 }} />{totalUnread} unread</span></div>
      </div>

      {ctx.role === "admin" && (
        <div className="monitor-banner"><Icon name="eye" /><span><b>Monitoring mode</b> — you can read and step into any store's conversation. Replies are sent as you.</span></div>
      )}

      <div className={"chat-layout" + (active ? " has-active" : "")}>
        {/* LIST */}
        <div className="panel conv-pane">
          <div className="conv-pane-head">
            <SearchBox value={q} onChange={setQ} placeholder="Search conversations…" />
            <div className="tabs" style={{ marginTop: 10, width: "100%" }}>
              {[["all", "All"], ["unread", "Unread"], ["open", "Open"], ["closed", "Closed"]].map(([k, l]) => (
                <button key={k} className={filter === k ? "on" : ""} onClick={() => setFilter(k)} style={{ flex: 1 }}>{l}{k === "unread" && totalUnread > 0 && <span className="pillcount">{totalUnread}</span>}</button>
              ))}
            </div>
          </div>
          <div className="conv-list scroll">
            {list.length === 0 ? <EmptyState icon="chat" title="No conversations" text="Nothing matches that filter." /> :
              list.map((c) => {
                const last = c.messages[c.messages.length - 1];
                return (
                  <div key={c.id} className={"conv" + (activeId === c.id ? " active" : "")} onClick={() => open(c)}>
                    <Avatar init={c.init} color={c.av} />
                    <div className="conv-main">
                      <div className="conv-top"><b>{c.customer}</b><span className="ctime">{c.time}</span></div>
                      <div className="conv-snip">{last.from === "store" ? "You: " : ""}{last.text}</div>
                      <div className="conv-meta">
                        {ctx.role === "admin" && <span className="conv-store">{c.store}</span>}
                        {c.status === "closed" && <span className="badge dotless" style={{ fontSize: 10, padding: "2px 7px" }}>Closed</span>}
                        {c.unread > 0 && <span className="conv-unread">{c.unread}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* THREAD */}
        <div className="panel thread-pane">
          {!active ? (
            <div className="chat-empty"><EmptyState icon="chat" title="Pick a conversation" text="Select a customer on the left to read and reply to their messages." /></div>
          ) : (
            <React.Fragment>
              <div className="thread-head">
                <Avatar init={active.init} color={active.av} size="lg" />
                <div className="meta">
                  <b>{active.customer}</b>
                  <span>{active.topic} · {active.store}{active.agent ? " · handled by " + active.agent : ""}</span>
                </div>
                <Tooltip label={active.status === "open" ? "Close conversation" : "Reopen"}>
                  <button className="iconbtn" onClick={closeConvo}><Icon name={active.status === "open" ? "checkCircle" : "refresh"} /></button>
                </Tooltip>
                <Tooltip label="Customer profile"><button className="iconbtn" onClick={() => toast({ kind: "info", title: active.customer, body: "Customer profile would open here." })}><Icon name="user" /></button></Tooltip>
              </div>
              <div className="thread-body scroll" ref={bodyRef}>
                {active.messages.map((m: any, i: number) => (
                  <div key={i} className={"bubble-row " + (m.from === "store" ? "out" : "in")}>
                    {m.from === "customer" && <Avatar init={active.init} color={active.av} size="sm" />}
                    <div>
                      <div className="bubble">
                        {m.from === "store" && m.agent && <div className="bubble-agent">{m.agent}</div>}
                        {m.text}
                      </div>
                      <div className="bubble-time">{m.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="composer">
                <textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type your reply…" rows={1}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} />
                <button className="btn icon" onClick={send} disabled={!draft.trim()}><Icon name="send" /></button>
              </div>
            </React.Fragment>
          )}
        </div>
      </div>
    </div>
  );
}

/* ===================== ROLES & ACCESS ===================== */
const LVL = ["None", "View", "Manage"];
const LVL_CLS = ["", "view", "manage"];
const ROLE_COLORS = ["#076330", "#2D6BE0", "#0EA5A5", "#7048E8", "#F76707", "#D6336C", "#E08600", "#0E9F57"];

export function RolesPage({ ctx }: { ctx: Ctx; nav?: any }) {
  const D = (ctx as any)?.D || NOVA;
  const [roles, setRoles] = useState<any[]>(() => D.roles.map((r: any) => ({ ...r, perms: { ...r.perms } })));
  const [edit, setEdit] = useState<any>(null);
  const [del, setDel] = useState<any>(null);
  const blank = () => ({ id: "new" + Date.now(), name: "", desc: "", color: ROLE_COLORS[2], scope: "store", members: 0, locked: false, perms: Object.fromEntries(D.permAreas.map((a: any) => [a[0], 0])) });

  function save() {
    if (!edit.name.trim()) { toast({ kind: "err", title: "Name required" }); return; }
    setRoles((prev) => prev.some((r) => r.id === edit.id) ? prev.map((r) => r.id === edit.id ? edit : r) : [...prev, edit]);
    toast({ kind: "ok", title: "Role saved", body: edit.name + " permissions updated." });
    setEdit(null);
  }
  function doDelete() { setRoles((prev) => prev.filter((r) => r.id !== del.id)); toast({ kind: "ok", title: "Role deleted", body: del.name + " removed." }); setDel(null); }

  return (
    <div className="page page-enter">
      <div className="pagehead">
        <div className="ph-txt"><h2>Roles &amp; Access</h2><p>Build custom roles and choose exactly what each one can see and do.</p></div>
        <div className="ph-actions"><button className="btn" onClick={() => setEdit(blank())}><Icon name="plus" />Create role</button></div>
      </div>

      <div className="role-grid">
        {roles.map((r) => {
          const manage = D.permAreas.filter((a: any) => r.perms[a[0]] === 2);
          const view = D.permAreas.filter((a: any) => r.perms[a[0]] === 1);
          return (
            <div className="panel role-card" key={r.id}>
              <div className="role-stripe" style={{ background: r.color }}></div>
              <div className="role-card-top">
                <h3><span className="bdot" style={{ width: 10, height: 10, borderRadius: 3, background: r.color }}></span>{r.name}
                  {r.locked && <Tooltip label="Built-in role — permissions locked"><Icon name="lock" style={{ width: 14, height: 14, color: "var(--ink-3)" }} /></Tooltip>}
                </h3>
                <div className="rdesc">{r.desc}</div>
                <div className="hstack" style={{ gap: 7, marginTop: 10 }}>
                  <span className="badge dotless brand" style={{ fontSize: 11 }}><Icon name={r.scope === "all" ? "globe" : "store"} style={{ width: 12, height: 12 }} />{r.scope === "all" ? "All stores" : "Own store"}</span>
                </div>
                <div className="role-tags">
                  {manage.slice(0, 5).map((a: any) => <span className="ptag manage" key={a[0]}>{a[1]}</span>)}
                  {view.slice(0, 2).map((a: any) => <span className="ptag" key={a[0]}>{a[1]} (view)</span>)}
                  {manage.length === 0 && view.length === 0 && <span className="ptag">No access yet</span>}
                </div>
              </div>
              <div className="role-card-foot">
                <span className="rmembers"><Icon name="users" />{r.members} {r.members === 1 ? "person" : "people"}</span>
                <span className="spacer"></span>
                <button className="btn ghost sm" onClick={() => setEdit({ ...r, perms: { ...r.perms } })}><Icon name={r.locked ? "eye" : "edit"} />{r.locked ? "View" : "Edit"}</button>
                {!r.locked && <Tooltip label="Delete role"><button className="iconbtn danger" onClick={() => setDel(r)}><Icon name="trash" /></button></Tooltip>}
              </div>
            </div>
          );
        })}
      </div>

      {edit && (
        <Drawer title={edit.locked ? edit.name : (roles.some((r) => r.id === edit.id) ? "Edit role" : "Create role")}
          sub={edit.locked ? "Built-in role · view only" : "Define access for this role"} onClose={() => setEdit(null)}
          foot={edit.locked ? <button className="btn ghost block" onClick={() => setEdit(null)}>Close</button> :
            <React.Fragment><button className="btn ghost" style={{ flex: 1 }} onClick={() => setEdit(null)}>Cancel</button><button className="btn" style={{ flex: 1 }} onClick={save}><Icon name="check" />Save role</button></React.Fragment>}>
          <fieldset disabled={edit.locked} style={{ border: "none" }}>
            <div className="field"><label>Role name</label><input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} placeholder="e.g. Workshop Lead" /></div>
            <div className="field"><label>Description</label><input value={edit.desc} onChange={(e) => setEdit({ ...edit, desc: e.target.value })} placeholder="What this role is for" /></div>
            <div className="form-grid">
              <div className="field"><label>Data scope</label>
                <div className="seg" style={{ width: "100%" }}><button type="button" className={edit.scope === "store" ? "on" : ""} onClick={() => setEdit({ ...edit, scope: "store" })} style={{ flex: 1 }}>Own store</button><button type="button" className={edit.scope === "all" ? "on" : ""} onClick={() => setEdit({ ...edit, scope: "all" })} style={{ flex: 1 }}>All stores</button></div>
              </div>
              <div className="field"><label>Colour</label>
                <div className="hstack" style={{ gap: 7, flexWrap: "wrap" }}>{ROLE_COLORS.map((c) => <button key={c} type="button" onClick={() => setEdit({ ...edit, color: c })} style={{ width: 26, height: 26, borderRadius: 8, background: c, boxShadow: edit.color === c ? "0 0 0 3px var(--glass-solid), 0 0 0 5px " + c : "none", transition: "box-shadow .15s" }} />)}</div>
              </div>
            </div>
          </fieldset>

          <hr className="hr" />
          <label style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-2)", display: "block", marginBottom: 4 }}>Permissions</label>
          <p className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Choose the access level for each area of the console.</p>
          {D.permAreas.map(([k, label, ic]: any) => (
            <div className="perm-row" key={k}>
              <span className="pname"><Icon name={ic} /><b>{label}</b></span>
              <div className="lvl-seg">
                {LVL.map((lv, i) => (
                  <button key={i} type="button" disabled={edit.locked}
                    className={(edit.perms[k] === i ? "on " + LVL_CLS[i] : "")}
                    onClick={() => setEdit({ ...edit, perms: { ...edit.perms, [k]: i } })}>{lv}</button>
                ))}
              </div>
            </div>
          ))}
        </Drawer>
      )}

      {del && <ConfirmModal danger title={"Delete the " + del.name + " role?"} body={del.members > 0 ? del.members + " team member(s) will need a new role assigned." : "This role isn't assigned to anyone."} confirmLabel="Delete role" onConfirm={doDelete} onClose={() => setDel(null)} />}
    </div>
  );
}
