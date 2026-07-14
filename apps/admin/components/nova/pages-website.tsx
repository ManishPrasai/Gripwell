"use client";
/* ============================================================
   NOVA TYRES — Admin · Website (Pages + Blog) · SEO · Page builder (ported)
   ============================================================ */
import * as React from "react";
import { useState } from "react";
import { NOVA } from "../../lib/nova/data";
import { adminFetch } from "../../lib/adminFetch";
import { Icon } from "./icons";
import { Tooltip, Drawer, ConfirmModal, toast, SearchBox, EmptyState } from "./ui";

function seoBadge(score: number) {
  const cls = score >= 80 ? "good" : score >= 65 ? "mid" : "low";
  return <span className={"seo-badge " + cls}><Icon name="trending" style={{ width: 12, height: 12 }} />SEO {score}</span>;
}

/* ===================== LIVE PREVIEW ===================== */
function PvSection({ type }: { type: string }) {
  const T = (NOVA.sectionTypes as any)[type] || { name: type };
  if (type === "hero") return (
    <div className="pv-sec pv-hero"><span className="pv-kick">Servicing · Melbourne-wide</span><h3>Servicing done right.</h3><p>Qualified mechanics, quality parts and a warranty-safe log-book stamp.</p><span className="pv-btn">Explore services →</span></div>
  );
  if (["services", "tiers", "brands", "gallery"].includes(type)) return (
    <div className="pv-sec"><div className="pv-label"><Icon name={T.icon} />{T.name}</div><div className="pv-row">{[0, 1, 2].map((i) => <div className="pv-card" key={i}><Icon name={T.icon} /></div>)}</div></div>
  );
  if (type === "reviews") return (
    <div className="pv-sec"><div className="pv-label"><Icon name="star" />Reviews</div><div className="pv-row">{[0, 1].map((i) => <div className="pv-card" key={i} style={{ flexDirection: "column", gap: 6, color: "var(--warn)" }}><div className="stars sm">★★★★★</div><i style={{ display: "block", height: 7, width: "70%", borderRadius: 4, background: "var(--chip-2)" }}></i></div>)}</div></div>
  );
  if (type === "booking") return (
    <div className="pv-sec"><div className="pv-label"><Icon name="calendar" />Booking form</div><div className="pv-lines"><i style={{ width: "100%" }}></i><i style={{ width: "100%" }}></i><i style={{ width: "60%" }}></i></div><span className="pv-btn" style={{ background: "var(--brand)", color: "#fff", display: "inline-block", marginTop: 4, padding: "8px 16px", borderRadius: 9, fontSize: 12, fontWeight: 700 }}>Request call-back</span></div>
  );
  if (type === "locations") return (
    <div className="pv-sec"><div className="pv-label"><Icon name="pin" />Locations</div><div className="pv-card" style={{ height: 96, background: "color-mix(in oklab, var(--brand) 8%, var(--chip))" }}><Icon name="pin" /></div></div>
  );
  if (type === "cta") return (
    <div className="pv-sec"><div className="pv-cta"><b>Book your free Pre-RWC check today</b><div className="pv-btn" style={{ background: "var(--accent)", color: "#fff", display: "inline-block", marginTop: 10, padding: "8px 18px", borderRadius: 9, fontSize: 12, fontWeight: 700 }}>Get started</div></div></div>
  );
  return (
    <div className="pv-sec"><div className="pv-label"><Icon name={T.icon || "file"} />{T.name}</div><div className="pv-lines"><i style={{ width: "92%" }}></i><i style={{ width: "100%" }}></i><i style={{ width: "78%" }}></i></div></div>
  );
}

/* ===================== PAGE BUILDER ===================== */
function PageBuilder({ ctx, page, onClose }: { ctx?: any; page: any; onClose: () => void }) {
  const D = (ctx as any)?.D || NOVA;
  const [secs, setSecs] = useState<any[]>(() => ((D.pageSections as any)[page.id] || []).map((s: any) => ({ ...s })));
  const [adding, setAdding] = useState(false);

  const move = (i: number, dir: number) => { const j = i + dir; if (j < 0 || j >= secs.length) return; const a = [...secs]; [a[i], a[j]] = [a[j], a[i]]; setSecs(a); };
  const toggle = (i: number) => setSecs(secs.map((s, k) => k === i ? { ...s, visible: !s.visible } : s));
  const remove = (i: number) => setSecs(secs.filter((_, k) => k !== i));
  const add = (type: string) => { setSecs([...secs, { id: "s" + Date.now(), type, visible: true }]); setAdding(false); toast({ kind: "ok", title: (D.sectionTypes as any)[type].name + " added" }); };

  return (
    <div className="overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="panel" style={{ width: "94vw", maxWidth: 1080, height: "88vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div className="panel-head" style={{ borderBottom: "1px solid var(--border)", padding: "16px 20px" }}>
          <div><h3>Customise — {page.title}</h3><div className="sub">Show, hide, reorder and add sections. Preview updates live.</div></div>
          <div className="right">
            <button className="btn sm" onClick={() => { toast({ kind: "ok", title: "Page published", body: page.title + " is live with your changes." }); onClose(); }}><Icon name="check" />Save &amp; publish</button>
            <button className="iconbtn" onClick={onClose}><Icon name="x" /></button>
          </div>
        </div>
        <div className="builder">
          <div className="build-side">
            <div className="build-side-head"><b style={{ fontSize: 13.5 }}>Sections</b> <span className="muted" style={{ fontSize: 12 }}>· {secs.filter((s) => s.visible).length} visible</span></div>
            <div className="build-list scroll">
              {secs.map((s, i) => {
                const T = (D.sectionTypes as any)[s.type];
                return (
                  <div className={"sec-item" + (s.visible ? "" : " hidden")} key={s.id}>
                    <span className="grip"><Icon name="grip" /></span>
                    <span className="sec-ico"><Icon name={T.icon} /></span>
                    <div className="sec-main"><b>{T.name}</b><span>{T.desc}</span></div>
                    <div className="sec-move">
                      <button onClick={() => move(i, -1)} disabled={i === 0}><Icon name="chevU" /></button>
                      <button onClick={() => move(i, 1)} disabled={i === secs.length - 1}><Icon name="chevD" /></button>
                    </div>
                    <div className="sec-acts">
                      <Tooltip label={s.visible ? "Hide" : "Show"}><button className="iconbtn" onClick={() => toggle(i)}><Icon name={s.visible ? "eye" : "eyeOff"} /></button></Tooltip>
                      <Tooltip label="Remove"><button className="iconbtn danger" onClick={() => remove(i)}><Icon name="trash" /></button></Tooltip>
                    </div>
                  </div>
                );
              })}

              {adding ? (
                <div style={{ marginTop: 10 }}>
                  <div className="hstack" style={{ justifyContent: "space-between", marginBottom: 8 }}><b style={{ fontSize: 12.5 }}>Add a section</b><button className="iconbtn" onClick={() => setAdding(false)}><Icon name="x" /></button></div>
                  <div className="add-sec-palette">
                    {Object.entries(D.sectionTypes).map(([k, t]: any) => (
                      <button className="palette-item" key={k} onClick={() => add(k)}>
                        <span className="sec-ico"><Icon name={t.icon} /></span>
                        <div style={{ minWidth: 0 }}><b>{t.name}</b><span>{t.desc}</span></div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <button className="btn ghost block" style={{ marginTop: 8 }} onClick={() => setAdding(true)}><Icon name="plus" />Add section</button>
              )}
            </div>
          </div>

          <div className="build-preview">
            <div className="build-preview-bar">
              <span className="badge ok dotless" style={{ fontSize: 11 }}><span className="bdot"></span>Live preview</span>
              <span className="fakebar"><Icon name="lock" />novatyres.au{page.url}</span>
            </div>
            <div className="preview-scroll scroll">
              <div className="preview-doc">
                {secs.filter((s) => s.visible).map((s) => <PvSection key={s.id} type={s.type} />)}
                {secs.filter((s) => s.visible).length === 0 && <div className="pv-sec"><EmptyState icon="image" title="No visible sections" text="Turn a section back on or add one." /></div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== SCORE CIRCLE ===================== */
function ScoreCircle({ score }: { score: number }) {
  const R = 30, C = 2 * Math.PI * R, col = score >= 80 ? "var(--ok)" : score >= 65 ? "var(--warn)" : "var(--danger)";
  return (
    <div className="score-circle">
      <svg viewBox="0 0 70 70" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="35" cy="35" r={R} fill="none" stroke="var(--chip-2)" strokeWidth="7" />
        <circle cx="35" cy="35" r={R} fill="none" stroke={col} strokeWidth="7" strokeLinecap="round" strokeDasharray={`${(score / 100) * C} ${C}`} style={{ transition: "stroke-dasharray .5s" }} />
      </svg>
      <div className="sc-val" style={{ color: col }}>{score}</div>
    </div>
  );
}

/* ===================== SEO DRAWER ===================== */
function SeoDrawer({ item, onClose, onSave }: { item: any; kind?: string; onClose: () => void; onSave: (score: number, meta: { metaTitle: string; metaDesc: string }) => void }) {
  const [m, setM] = useState({ metaTitle: item.metaTitle || (item.title + " | Nova Tyres"), metaDesc: item.metaDesc || "", slug: item.slug || item.url || "/", kw: item.kw || "" });
  const titleLen = m.metaTitle.length, descLen = m.metaDesc.length;
  const checks: [string, boolean][] = [
    ["Title length is ideal (50–60)", titleLen >= 40 && titleLen <= 60],
    ["Description length is ideal (120–160)", descLen >= 110 && descLen <= 160],
    ["Focus keyword set", m.kw.trim().length > 0],
    ["Keyword appears in title", !!m.kw && m.metaTitle.toLowerCase().includes(m.kw.toLowerCase())],
    ["URL slug is clean", /^\/[a-z0-9\-\/]*$/.test(m.slug)],
  ];
  const score = Math.round((checks.filter((c) => c[1]).length / checks.length) * 100);
  const counterCls = (len: number, lo: number, hi: number) => len === 0 ? "" : (len >= lo && len <= hi ? "ok" : "warn");

  return (
    <Drawer title="SEO settings" sub={item.title} onClose={onClose}
      foot={<React.Fragment><button className="btn ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button><button className="btn" style={{ flex: 1 }} onClick={() => onSave(score, { metaTitle: m.metaTitle, metaDesc: m.metaDesc })}><Icon name="check" />Save SEO</button></React.Fragment>}>

      <div className="seo-score-ring">
        <ScoreCircle score={score} />
        <div className="seo-checks">
          {checks.map((c, i) => <div className={"seo-check " + (c[1] ? "pass" : "fail")} key={i}><Icon name={c[1] ? "checkCircle" : "x"} />{c[0]}</div>)}
        </div>
      </div>

      <div className="field"><label>Meta title <span className={"char-count " + counterCls(titleLen, 40, 60)}>{titleLen}/60</span></label>
        <input value={m.metaTitle} onChange={(e) => setM({ ...m, metaTitle: e.target.value })} /></div>
      <div className="field"><label>Meta description <span className={"char-count " + counterCls(descLen, 110, 160)}>{descLen}/160</span></label>
        <textarea value={m.metaDesc} onChange={(e) => setM({ ...m, metaDesc: e.target.value })} placeholder="A short, compelling summary for search results…" /></div>
      <div className="form-grid">
        <div className="field"><label>URL slug</label><input value={m.slug} onChange={(e) => setM({ ...m, slug: e.target.value })} /></div>
        <div className="field"><label>Focus keyword</label><input value={m.kw} onChange={(e) => setM({ ...m, kw: e.target.value })} placeholder="e.g. car service melbourne" /></div>
      </div>

      <hr className="hr" />
      <label style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-2)", display: "block", marginBottom: 8 }}>Google preview</label>
      <div className="serp">
        <div className="surl"><Icon name="globe" />novatyres.au{m.slug} <Icon name="chevD" style={{ width: 12, height: 12 }} /></div>
        <div className="stitle">{m.metaTitle || "Page title"}</div>
        <div className="sdesc">{m.metaDesc || "Add a meta description to control how this page appears in search results."}</div>
      </div>

      <label style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-2)", display: "block", margin: "18px 0 8px" }}>Social share image</label>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: 150, borderRadius: 12, border: "1px dashed var(--border)", color: "var(--ink-3)", fontSize: 12.5, background: "var(--chip)" }}>
        Drop a 1200×630 share image
      </div>
    </Drawer>
  );
}

/* ===================== WEBSITE PAGE ===================== */
export function WebsitePage({ ctx }: { ctx?: any; nav?: any }) {
  const D = (ctx as any)?.D || NOVA;
  const [tab, setTab] = useState("pages");
  const [pages, setPages] = useState<any[]>(D.pages);
  const [blogs, setBlogs] = useState<any[]>(D.blogs);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [seo, setSeo] = useState<any>(null);
  const [builder, setBuilder] = useState<any>(null);
  const [del, setDel] = useState<any>(null);

  const rows = tab === "pages" ? pages : blogs;
  const setRows = tab === "pages" ? setPages : setBlogs;
  const list = rows.filter((p) => (filter === "all" || p.status === filter) && (p.title + (p.slug || p.url)).toLowerCase().includes(q.toLowerCase()));

  function togglePub(p: any) {
    const nx = p.status === "published" ? "draft" : "published";
    setRows((prev) => prev.map((x) => x.id === p.id ? { ...x, status: nx } : x));
    toast({ kind: "ok", title: nx === "published" ? "Published" : "Moved to drafts", body: p.title });
  }
  async function saveSeo(score: number, meta: { metaTitle: string; metaDesc: string }) {
    const target = seo;
    setRows((prev) => prev.map((x) => x.id === target.id ? { ...x, seo: score, metaTitle: meta.metaTitle, metaDesc: meta.metaDesc } : x));
    setSeo(null);
    // Only the Pages tab maps to real PageSEO records (blogs are still mock).
    if (tab !== "pages" || !target.id || typeof target.id === "number") {
      toast({ kind: "ok", title: "SEO saved", body: target.title + " · score " + score });
      return;
    }
    try {
      await adminFetch(`/api/admin/seo/${target.id}`, "PATCH", { metaTitle: meta.metaTitle, metaDesc: meta.metaDesc });
      toast({ kind: "ok", title: "SEO saved", body: target.title + " is live on the site." });
      ctx?.refetch?.();
    } catch (e: any) {
      toast({ kind: "err", title: "Couldn't save SEO", body: e?.message || "Please try again." });
    }
  }

  return (
    <div className="page page-enter">
      <div className="pagehead">
        <div className="ph-txt"><h2>Website &amp; Content</h2><p>Pages, blog posts and SEO for your public Nova Tyres site.</p></div>
        <div className="ph-actions">
          <button className="btn" onClick={() => toast({ kind: "info", title: tab === "pages" ? "Pages are fixed routes" : "Blog not enabled yet", body: tab === "pages" ? "Edit any existing page's content and SEO from the list below — new routes are added in code." : "Publishing blog posts needs a content model that isn't set up yet." })}><Icon name="plus" />New {tab === "pages" ? "page" : "post"}</button>
        </div>
      </div>

      <div className="seo-tabs" style={{ maxWidth: 320 }}>
        <button className={tab === "pages" ? "on" : ""} onClick={() => { setTab("pages"); setFilter("all"); }}>Pages <span className="pillcount">{pages.length}</span></button>
        <button className={tab === "blog" ? "on" : ""} onClick={() => { setTab("blog"); setFilter("all"); }}>Blog <span className="pillcount">{blogs.length}</span></button>
      </div>

      <div className="toolbar">
        <SearchBox value={q} onChange={setQ} placeholder={"Search " + tab + "…"} grow />
        <div className="tabs">
          {[["all", "All"], ["published", "Published"], ["draft", "Drafts"]].map(([k, l]) => (
            <button key={k} className={filter === k ? "on" : ""} onClick={() => setFilter(k)}>{l}</button>
          ))}
        </div>
      </div>

      <div className="panel">
        {list.length === 0 ? <EmptyState icon="file" title="Nothing here" text="No content matches your search." /> : list.map((p) => (
          <div className="cpage-row" key={p.id}>
            <span className="cpage-ico"><Icon name={p.icon || "page"} /></span>
            <div className="cpage-main">
              <b>{p.title}</b>
              <span className="cpage-url">{p.slug || p.url}{tab === "blog" ? " · " + p.author + " · " + p.date : ""}</span>
            </div>
            {seoBadge(p.seo)}
            <div className="vstack" style={{ textAlign: "right", margin: "0 6px", minWidth: 70 }}>
              <span style={{ fontSize: 12.5, color: "var(--ink-2)", fontWeight: 600 }}>{p.views || p.reads} {tab === "blog" ? "reads" : "views"}</span>
              <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{p.edited ? "Edited " + p.edited : p.date}</span>
            </div>
            <span className={"badge dotless " + (p.status === "published" ? "ok" : "warn")}>{p.status === "published" ? "Published" : "Draft"}</span>
            <div className="row-actions" style={{ opacity: 1, marginLeft: 6 }}>
              {tab === "pages" && <Tooltip label="Customise sections"><button className="iconbtn" onClick={() => setBuilder(p)}><Icon name="layers" /></button></Tooltip>}
              <Tooltip label="SEO"><button className="iconbtn" onClick={() => setSeo(p)}><Icon name="trending" /></button></Tooltip>
              <Tooltip label={p.status === "published" ? "Unpublish" : "Publish"}><button className="iconbtn" onClick={() => togglePub(p)}><Icon name={p.status === "published" ? "eyeOff" : "globe"} /></button></Tooltip>
              <Tooltip label="Delete"><button className="iconbtn danger" onClick={() => setDel(p)}><Icon name="trash" /></button></Tooltip>
            </div>
          </div>
        ))}
      </div>

      {seo && <SeoDrawer item={seo} kind={tab} onClose={() => setSeo(null)} onSave={saveSeo} />}
      {builder && <PageBuilder ctx={ctx} page={builder} onClose={() => setBuilder(null)} />}
      {del && <ConfirmModal danger title={"Delete \"" + del.title + "\"?"} body="This permanently removes it from your website. This can't be undone." confirmLabel="Delete" onConfirm={() => { setRows((prev) => prev.filter((p) => p.id !== del.id)); toast({ kind: "ok", title: "Deleted", body: del.title }); setDel(null); }} onClose={() => setDel(null)} />}
    </div>
  );
}
