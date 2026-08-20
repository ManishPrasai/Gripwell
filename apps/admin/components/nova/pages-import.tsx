"use client";
/* ============================================================
   NOVA TYRES — Admin · Import Products (ported)
   CSV bulk import + manual single-product entry
   ============================================================ */
import * as React from "react";
import { useState, useRef } from "react";
import { Icon } from "./icons";
import { toast } from "./ui";

const IMPORT_CATS = ["Tyres", "Wheels", "Oils", "Parts"];
const IMPORT_FIELDS: [string, string, boolean][] = [
  ["name", "Product name", true], ["brand", "Brand", false], ["category", "Category", false],
  ["price", "Price", false], ["stock", "Stock quantity", false], ["description", "Description", false], ["sku", "SKU", false],
];

function ImgSlot({ height, placeholder, style }: { height: number; placeholder: string; style?: React.CSSProperties }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height, borderRadius: 12, border: "1px dashed var(--border)", color: "var(--ink-3)", fontSize: 13, background: "var(--chip)", cursor: "pointer", ...style }}>
      {placeholder}
    </div>
  );
}

function parseCSVText(text: string) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers: [] as string[], rows: [] as any[] };
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows = lines.slice(1).map((line) => {
    const vals = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    return headers.reduce((o: any, h, i) => { o[h] = vals[i] || ""; return o; }, {});
  });
  return { headers, rows };
}

function autoMap(headers: string[]) {
  const m: any = { name: "", brand: "", category: "", price: "", stock: "", description: "", sku: "" };
  headers.forEach((h) => {
    const l = h.toLowerCase();
    if (!m.name && (l.includes("name") || l.includes("title"))) m.name = h;
    if (!m.brand && l.includes("brand")) m.brand = h;
    if (!m.category && (l.includes("cat") || l.includes("type"))) m.category = h;
    if (!m.price && l.includes("price")) m.price = h;
    if (!m.stock && (l.includes("stock") || l.includes("qty") || l.includes("quantity"))) m.stock = h;
    if (!m.description && (l.includes("desc"))) m.description = h;
    if (!m.sku && l.includes("sku")) m.sku = h;
  });
  return m;
}

function StepUpload({ onParsed }: { onParsed: (text: string, name?: string) => void }) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => onParsed(String(e.target?.result), file.name);
    reader.readAsText(file);
  }

  function downloadTemplate() {
    const csv = [
      "name,brand,category,price,stock,sku,description",
      'Michelin Pilot Sport 4,Michelin,Tyres,420,12,MCH-PS4-225,"High-performance summer tyre for sport cars"',
      'Pirelli P Zero,Pirelli,Tyres,380,8,PIR-PZ-245,"Ultra-high performance tyre"',
      'Castrol EDGE 5W-30,Castrol,Oils,65,30,CAS-E5W30-5L,"Full synthetic engine oil 5L"',
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "nova-products-template.csv";
    a.click();
    toast({ kind: "ok", title: "Template downloaded", body: "Open in Excel or Google Sheets to fill in." });
  }

  return (
    <div className="panel" style={{ padding: 28 }}>
      <div className={"import-drop" + (drag ? " drag" : "")}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
        onClick={() => inputRef.current && inputRef.current.click()}>
        <div className="import-drop-ico"><Icon name="download" /></div>
        <h3>Drop your CSV file here</h3>
        <p>Accepts .csv — first row must be column headers</p>
        <span className="btn sm" style={{ pointerEvents: "none", marginTop: 6 }}>Browse file</span>
        <input ref={inputRef} type="file" accept=".csv,.tsv,text/csv" style={{ display: "none" }}
          onChange={(e) => handleFile(e.target.files?.[0])} />
      </div>

      <div style={{ marginTop: 22 }}>
        <div className="role-banner"><Icon name="info" /><span>Your CSV needs at least a <b>name</b> column. We'll auto-detect common fields and let you remap the rest.</span></div>
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-2)", marginBottom: 8 }}>Expected columns</div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {["name", "brand", "category", "price", "stock", "sku", "description"].map((c) => (
              <span key={c} className="badge accent dotless" style={{ fontFamily: "var(--mono)", fontSize: 12 }}>{c}</span>
            ))}
          </div>
        </div>
        <button className="btn ghost sm" style={{ marginTop: 14 }} onClick={downloadTemplate}><Icon name="download" />Download template</button>
      </div>
    </div>
  );
}

function StepMap({ headers, rows, mapping, setMapping, onBack, onNext }: any) {
  return (
    <div>
      <div className="role-banner" style={{ marginBottom: 14 }}>
        <Icon name="checkCircle" style={{ color: "var(--ok)" }} />
        <span>Found <b>{rows.length} product{rows.length !== 1 ? "s" : ""}</b> and <b>{headers.length} column{headers.length !== 1 ? "s" : ""}</b>. Map your columns below.</span>
      </div>
      <div className="panel" style={{ padding: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 18 }}>Map columns</div>
        <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
          {IMPORT_FIELDS.map(([key, label, required]) => (
            <div className="field" key={key}>
              <label>{label}{required && <span style={{ color: "var(--accent)", marginLeft: 4 }}>*</span>}</label>
              <select value={mapping[key] || ""} onChange={(e) => setMapping((m: any) => ({ ...m, [key]: e.target.value }))}>
                <option value="">— skip —</option>
                {headers.map((h: string) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-2)", marginBottom: 8 }}>Preview — first 3 rows</div>
          <div className="table-wrap">
            <table className="tbl">
              <thead><tr>{headers.map((h: string) => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {rows.slice(0, 3).map((r: any, i: number) => (
                  <tr key={i}>{headers.map((h: string) => <td key={h} className="muted" style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r[h] || "—"}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 18, justifyContent: "flex-end" }}>
          <button className="btn ghost" onClick={onBack}><Icon name="chevL" />Back</button>
          <button className="btn" disabled={!mapping.name} onClick={onNext}><Icon name="arrowR" />Preview import</button>
        </div>
      </div>
    </div>
  );
}

function StepPreview({ preview, onBack, onConfirm }: any) {
  return (
    <div>
      <div className="role-banner" style={{ marginBottom: 14, background: "color-mix(in oklab, var(--ok) 10%, transparent)", borderColor: "color-mix(in oklab, var(--ok) 25%, transparent)" }}>
        <Icon name="checkCircle" style={{ color: "var(--ok)" }} />
        <span>Ready to import <b>{preview.length} product{preview.length !== 1 ? "s" : ""}</b>. Review and confirm.</span>
        <span className="spacer"></span>
        <button className="btn sm" onClick={onConfirm}><Icon name="check" />Import all</button>
      </div>
      <div className="panel">
        <div className="table-wrap">
          <table className="tbl">
            <thead><tr><th>Product</th><th>Brand</th><th>Category</th><th>Price</th><th>Stock</th><th>SKU</th><th>Description</th></tr></thead>
            <tbody>
              {preview.map((p: any, i: number) => (
                <tr key={i}>
                  <td className="cell-main">{p.name}</td>
                  <td className="muted">{p.brand || "—"}</td>
                  <td><span className="badge accent dotless" style={{ fontSize: 11 }}>{p.cat || "—"}</span></td>
                  <td className="mono">{p.price ? "$" + p.price : "—"}</td>
                  <td className="mono">{p.stock || "—"}</td>
                  <td className="mono muted" style={{ fontSize: 12 }}>{p.sku || "—"}</td>
                  <td className="muted" style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.description || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "flex-end" }}>
        <button className="btn ghost" onClick={onBack}><Icon name="chevL" />Back</button>
        <button className="btn" onClick={onConfirm}><Icon name="check" />Confirm &amp; import</button>
      </div>
    </div>
  );
}

function StepDone({ count, onReset, onNav }: any) {
  return (
    <div className="panel" style={{ padding: 52, textAlign: "center" }}>
      <div style={{ width: 68, height: 68, borderRadius: "50%", background: "color-mix(in oklab, var(--ok) 12%, transparent)", color: "var(--ok)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
        <Icon name="checkCircle" style={{ width: 34, height: 34 }} />
      </div>
      <h3 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em" }}>Import complete</h3>
      <p style={{ color: "var(--ink-2)", marginTop: 6 }}>{count} product{count !== 1 ? "s" : ""} added to your inventory.</p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 24 }}>
        <button className="btn ghost" onClick={onReset}><Icon name="refresh" />Import more</button>
        <button className="btn" onClick={() => onNav("inventory")}><Icon name="box" />View inventory</button>
      </div>
    </div>
  );
}

export function ImportPage({ ctx, nav }: { ctx?: any; nav?: (p: string) => void }) {
  const [tab, setTab] = useState("csv");
  const [step, setStep] = useState("upload");

  const [headers, setHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<any[]>([]);
  const [mapping, setMapping] = useState<any>({});
  const [preview, setPreview] = useState<any[]>([]);
  const [importCount, setImportCount] = useState(0);

  function handleParsed(text: string) {
    const { headers: h, rows: r } = parseCSVText(text);
    if (!h.length) { toast({ kind: "err", title: "Couldn't read file", body: "Make sure the first row has column headers." }); return; }
    setHeaders(h); setCsvRows(r); setMapping(autoMap(h)); setStep("map");
  }

  function buildPreview() {
    const mapped = csvRows.slice(0, 200).map((r, i) => ({
      id: Date.now() + i,
      name: r[mapping.name] || "Unnamed",
      brand: r[mapping.brand] || "",
      cat: r[mapping.category] || "Tyres",
      price: parseFloat(r[mapping.price]) || 0,
      stock: parseInt(r[mapping.stock]) || 0,
      sku: r[mapping.sku] || "",
      description: r[mapping.description] || "",
    }));
    setPreview(mapped); setStep("preview");
  }

  function confirmImport() {
    setImportCount(preview.length);
    toast({ kind: "ok", title: preview.length + " products imported", body: "Added to inventory." });
    setStep("done");
  }

  function resetCsv() { setHeaders([]); setCsvRows([]); setMapping({}); setPreview([]); setStep("upload"); }

  const emptyForm = { name: "", brand: "", category: "Tyres", price: "", stock: "", sku: "", description: "", status: "active" };
  const [form, setForm] = useState<any>(emptyForm);
  const [added, setAdded] = useState<any[]>([]);

  function addProduct() {
    if (!form.name.trim()) { toast({ kind: "err", title: "Name required", body: "Enter a product name to continue." }); return; }
    const product = { ...form, id: Date.now(), price: parseFloat(form.price) || 0, stock: parseInt(form.stock) || 0 };
    setAdded((prev) => [product, ...prev]);
    toast({ kind: "ok", title: "Product added", body: form.name + " saved to inventory." });
    setForm(emptyForm);
  }

  return (
    <div className="page page-enter">
      <div className="pagehead">
        <div className="ph-txt">
          <h2>Import Products</h2>
          <p>Add products to your inventory — upload a spreadsheet or enter them one by one with images.</p>
        </div>
      </div>

      <div className="import-tabs">
        <button className={tab === "csv" ? "on" : ""} onClick={() => setTab("csv")}><Icon name="download" />CSV / Spreadsheet</button>
        <button className={tab === "manual" ? "on" : ""} onClick={() => setTab("manual")}><Icon name="plus" />Add manually</button>
      </div>

      {tab === "csv" && (
        <div>
          {step !== "done" && (
            <div className="import-steps">
              {[["upload", "1", "Upload file"], ["map", "2", "Map columns"], ["preview", "3", "Preview"]].map(([s, n, l]) => (
                <div key={s} className={"import-step" + (step === s ? " active" : "")}>
                  <span className="step-n">{(step === "preview" && s === "map") || (step === "preview" && s === "upload") || (step === "map" && s === "upload") ? <Icon name="check" /> : n}</span>
                  <span className="step-l">{l}</span>
                  {s !== "preview" && <span className="step-line"></span>}
                </div>
              ))}
            </div>
          )}

          {step === "upload" && <StepUpload onParsed={handleParsed} />}
          {step === "map" && <StepMap headers={headers} rows={csvRows} mapping={mapping} setMapping={setMapping} onBack={resetCsv} onNext={buildPreview} />}
          {step === "preview" && <StepPreview preview={preview} onBack={() => setStep("map")} onConfirm={confirmImport} />}
          {step === "done" && <StepDone count={importCount} onReset={resetCsv} onNav={nav} />}
        </div>
      )}

      {tab === "manual" && (
        <div className="import-manual-grid">
          <div className="panel" style={{ padding: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 20 }}>Product details</div>

            <div className="field"><label>Product name <span style={{ color: "var(--accent)" }}>*</span></label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Michelin Pilot Sport 4" />
            </div>

            <div className="form-grid">
              <div className="field"><label>Brand</label><input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Michelin" /></div>
              <div className="field"><label>Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {IMPORT_CATS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="form-grid">
              <div className="field"><label>Price ($)</label><input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" /></div>
              <div className="field"><label>Stock quantity</label><input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="0" /></div>
            </div>

            <div className="field"><label>SKU <span style={{ fontSize: 11.5, color: "var(--ink-3)", fontWeight: 400 }}>optional</span></label>
              <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="e.g. MCH-PS4-225-45R17" />
            </div>

            <div className="field"><label>Description</label>
              <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description shown on the website product page…"></textarea>
            </div>

            <div className="field">
              <label>Status</label>
              <div className="tabs" style={{ marginTop: 4 }}>
                <button className={form.status === "active" ? "on" : ""} onClick={() => setForm({ ...form, status: "active" })}>Active</button>
                <button className={form.status === "draft" ? "on" : ""} onClick={() => setForm({ ...form, status: "draft" })}>Draft</button>
              </div>
            </div>

            <button className="btn block" style={{ marginTop: 10 }} onClick={addProduct}><Icon name="plus" />Add to inventory</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="panel" style={{ padding: 24 }}>
              <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 16 }}>Product image</div>
              <ImgSlot height={230} placeholder="Drop a product photo here" style={{ borderRadius: 14 }} />
              <p style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 10, textAlign: "center" }}>Recommended: 800 × 800 px · PNG or JPEG</p>

              <div style={{ marginTop: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-2)", marginBottom: 10 }}>Additional images</div>
                <div style={{ display: "flex", gap: 10 }}>
                  {[1, 2, 3].map((n) => (<ImgSlot key={n} height={80} placeholder="+" style={{ flex: 1, borderRadius: 10 }} />))}
                </div>
              </div>
            </div>

            {added.length > 0 && (
              <div className="panel">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 8px" }}>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>Added this session</div>
                  <span className="badge accent dotless">{added.length}</span>
                </div>
                <div style={{ paddingBottom: 8 }}>
                  {added.map((p) => (
                    <div className="lrow" key={p.id}>
                      <span className="prod-thumb"><Icon name={p.category === "Tyres" ? "tyre" : p.category === "Wheels" ? "wheel" : p.category === "Oils" ? "oil" : "part"} /></span>
                      <div className="lrow-main">
                        <b>{p.name}</b>
                        <span>{p.brand ? p.brand + " · " : ""}{p.category} · ${p.price}</span>
                      </div>
                      <span className={"badge dotless " + (p.status === "active" ? "ok" : "warn")} style={{ fontSize: 11 }}>{p.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
