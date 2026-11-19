"use client";
/* ============================================================
   Gripwell — Admin · Import Products (ported)
   CSV bulk import + manual single-product entry
   ============================================================ */
import * as React from "react";
import { useState, useRef } from "react";
import { Icon } from "./icons";
import { toast } from "./ui";
import { adminFetch } from "../../lib/adminFetch";
import { ImageSlot } from "./image-upload";

const IMPORT_CATS = ["Tyres", "Wheels"];
const IMPORT_FIELDS: [string, string, boolean][] = [
  ["name", "Product name / model", true], ["brand", "Brand", false], ["category", "Category", false],
  ["size", "Tyre size (e.g. 225/45R17)", false], ["type", "Tyre type", false],
  ["price", "Price", false], ["stock", "Stock quantity", false], ["description", "Description", false], ["sku", "SKU", false],
];

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
  const m: any = { name: "", brand: "", category: "", size: "", type: "", price: "", stock: "", description: "", sku: "" };
  headers.forEach((h) => {
    const l = h.toLowerCase();
    if (!m.name && (l.includes("name") || l.includes("model") || l.includes("title"))) m.name = h;
    if (!m.brand && l.includes("brand")) m.brand = h;
    if (!m.category && (l.includes("cat") || l === "type" || l.includes("product type"))) m.category = h;
    if (!m.size && (l.includes("size") || l.includes("dimension"))) m.size = h;
    if (!m.type && (l.includes("tyre type") || l.includes("tire type") || l.includes("terrain"))) m.type = h;
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
      "name,brand,category,size,type,price,stock,sku,description",
      'Pilot Sport 4,Veltex,Tyres,225/45R17,Passenger,420,12,MCH-PS4-225,"High-performance summer tyre for sport cars"',
      'P Zero,Corsaro,Tyres,245/40R18,Passenger,380,8,PIR-PZ-245,"Ultra-high performance tyre"',
      'Scorpion ATR,Corsaro,Tyres,265/65R17,SUV,310,10,PIR-SC-265,"All-terrain SUV tyre"',
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
            {["name", "brand", "category", "size", "type", "price", "stock", "sku", "description"].map((c) => (
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

function StepPreview({ preview, onBack, onConfirm, importing }: any) {
  return (
    <div>
      <div className="role-banner" style={{ marginBottom: 14, background: "color-mix(in oklab, var(--ok) 10%, transparent)", borderColor: "color-mix(in oklab, var(--ok) 25%, transparent)" }}>
        <Icon name="checkCircle" style={{ color: "var(--ok)" }} />
        <span>Ready to import <b>{preview.length} product{preview.length !== 1 ? "s" : ""}</b>. Only <b>Tyres</b> and <b>Wheels</b> are written to the catalog; other rows are skipped.</span>
        <span className="spacer"></span>
        <button className="btn sm" disabled={importing} onClick={onConfirm}><Icon name="check" />{importing ? "Importing…" : "Import all"}</button>
      </div>
      <div className="panel">
        <div className="table-wrap">
          <table className="tbl">
            <thead><tr><th>Product</th><th>Brand</th><th>Category</th><th>Size</th><th>Price</th><th>Stock</th><th>SKU</th></tr></thead>
            <tbody>
              {preview.map((p: any, i: number) => (
                <tr key={i}>
                  <td className="cell-main">{p.name}</td>
                  <td className="muted">{p.brand || "—"}</td>
                  <td><span className="badge accent dotless" style={{ fontSize: 11 }}>{p.cat || "—"}</span></td>
                  <td className="mono muted" style={{ fontSize: 12 }}>{p.size || "—"}</td>
                  <td className="mono">{p.price ? "$" + p.price : "—"}</td>
                  <td className="mono">{p.stock || "—"}</td>
                  <td className="mono muted" style={{ fontSize: 12 }}>{p.sku || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "flex-end" }}>
        <button className="btn ghost" disabled={importing} onClick={onBack}><Icon name="chevL" />Back</button>
        <button className="btn" disabled={importing} onClick={onConfirm}><Icon name="check" />{importing ? "Importing…" : "Confirm & import"}</button>
      </div>
    </div>
  );
}

function StepDone({ count, result, onReset, onNav }: any) {
  const skipped = result?.skipped ?? 0;
  const errs = result?.errors ?? [];
  return (
    <div>
      <div className="panel" style={{ padding: 52, textAlign: "center" }}>
        <div style={{ width: 68, height: 68, borderRadius: "50%", background: `color-mix(in oklab, var(--${count > 0 ? "ok" : "accent"}) 12%, transparent)`, color: `var(--${count > 0 ? "ok" : "accent"})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
          <Icon name={count > 0 ? "checkCircle" : "alert"} style={{ width: 34, height: 34 }} />
        </div>
        <h3 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em" }}>{count > 0 ? "Import complete" : "Nothing imported"}</h3>
        <p style={{ color: "var(--ink-2)", marginTop: 6 }}>
          <b>{count}</b> product{count !== 1 ? "s" : ""} added to your inventory{skipped ? <> · <b>{skipped}</b> row{skipped !== 1 ? "s" : ""} skipped</> : null}.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 24 }}>
          <button className="btn ghost" onClick={onReset}><Icon name="refresh" />Import more</button>
          <button className="btn" onClick={() => onNav && onNav("inventory")}><Icon name="box" />View inventory</button>
        </div>
      </div>

      {errs.length > 0 && (
        <div className="panel" style={{ marginTop: 14 }}>
          <div style={{ padding: "14px 18px 4px", fontSize: 14, fontWeight: 800 }}>Skipped rows <span className="badge warn dotless" style={{ marginLeft: 6 }}>{errs.length}</span></div>
          <div className="table-wrap">
            <table className="tbl">
              <thead><tr><th>Row</th><th>Product</th><th>Reason</th></tr></thead>
              <tbody>
                {errs.map((e: any, i: number) => (
                  <tr key={i}><td className="mono muted">{e.row}</td><td className="cell-main">{e.name}</td><td className="muted">{e.reason}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
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
    if (!h.length) { toast({ kind: "err", title: "Couldn’t read file", body: "Make sure the first row has column headers." }); return; }
    setHeaders(h); setCsvRows(r); setMapping(autoMap(h)); setStep("map");
  }

  const [importResult, setImportResult] = useState<any>(null);
  const [importing, setImporting] = useState(false);

  function buildPreview() {
    const mapped = csvRows.slice(0, 500).map((r, i) => ({
      id: Date.now() + i,
      name: r[mapping.name] || "Unnamed",
      brand: r[mapping.brand] || "",
      cat: r[mapping.category] || "Tyres",
      size: r[mapping.size] || "",
      type: r[mapping.type] || "",
      price: parseFloat(r[mapping.price]) || 0,
      stock: parseInt(r[mapping.stock]) || 0,
      sku: r[mapping.sku] || "",
      description: r[mapping.description] || "",
    }));
    setPreview(mapped); setStep("preview");
  }

  async function confirmImport() {
    if (importing) return;
    setImporting(true);
    const products = preview.map((p) => ({
      name: p.name, brand: p.brand, category: p.cat, size: p.size, type: p.type,
      price: p.price, stock: p.stock, sku: p.sku, description: p.description,
    }));
    try {
      const res: any = await adminFetch("/api/admin/products/import", "POST", { products });
      setImportResult(res); setImportCount(res.created);
      if (res.created > 0) toast({ kind: "ok", title: res.created + " product" + (res.created !== 1 ? "s" : "") + " imported", body: res.skipped ? res.skipped + " row(s) skipped — see details." : "Added to inventory." });
      else toast({ kind: "err", title: "Nothing imported", body: res.skipped + " row(s) had errors." });
      ctx?.refetch?.();
      setStep("done");
    } catch (e: any) {
      toast({ kind: "err", title: "Import failed", body: e?.message || "Please try again." });
    } finally {
      setImporting(false);
    }
  }

  function resetCsv() { setHeaders([]); setCsvRows([]); setMapping({}); setPreview([]); setImportResult(null); setStep("upload"); }

  const emptyForm = { name: "", brand: "", category: "Tyres", size: "", type: "Passenger", diameter: "", pcd: "", material: "Alloy", price: "", stock: "", sku: "", description: "", status: "active" };
  const [form, setForm] = useState<any>(emptyForm);
  const [added, setAdded] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  // Images are uploaded as soon as they’re picked; these are the resulting
  // /media/... paths, sent with the product so they’re attached on create.
  // [0] is the main photo, [1..3] the extra angles.
  const [images, setImages] = useState<(string | null)[]>([null, null, null, null]);
  const setImageAt = (n: number, url: string | null) =>
    setImages((prev) => prev.map((u, i) => (i === n ? url : u)));

  async function addProduct() {
    if (!form.name.trim()) { toast({ kind: "err", title: "Name required", body: "Enter a product name to continue." }); return; }
    if (form.category === "Tyres" && !form.size.trim()) { toast({ kind: "err", title: "Tyre size required", body: "e.g. 225/45R17" }); return; }
    if (form.category === "Wheels" && !String(form.diameter).trim()) { toast({ kind: "err", title: "Diameter required", body: "Enter the wheel diameter in inches." }); return; }
    if (saving) return;
    setSaving(true);
    try {
      const res: any = await adminFetch("/api/admin/products/import", "POST", {
        products: [{
          name: form.name, brand: form.brand, category: form.category,
          size: form.size, type: form.type,
          diameter: form.diameter, pcd: form.pcd, material: form.material,
          price: parseFloat(form.price) || 0, stock: parseInt(form.stock) || 0,
          sku: form.sku, description: form.description,
          imageUrls: images.filter(Boolean),
        }],
      });
      if (res.created > 0) {
        setAdded((prev) => [{ ...form, id: Date.now(), image: images[0], price: parseFloat(form.price) || 0, stock: parseInt(form.stock) || 0 }, ...prev]);
        toast({ kind: "ok", title: "Product added", body: form.name + " saved to inventory." });
        ctx?.refetch?.();
        setForm(emptyForm);
        setImages([null, null, null, null]);
      } else {
        toast({ kind: "err", title: "Couldn’t add product", body: res.errors?.[0]?.reason || "Check the details and try again." });
      }
    } catch (e: any) {
      toast({ kind: "err", title: "Couldn’t add product", body: e?.message || "Please try again." });
    } finally {
      setSaving(false);
    }
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
          {step === "preview" && <StepPreview preview={preview} onBack={() => setStep("map")} onConfirm={confirmImport} importing={importing} />}
          {step === "done" && <StepDone count={importCount} result={importResult} onReset={resetCsv} onNav={nav} />}
        </div>
      )}

      {tab === "manual" && (
        <div className="import-manual-grid">
          <div className="panel" style={{ padding: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 20 }}>Product details</div>

            <div className="field"><label>Product name <span style={{ color: "var(--accent)" }}>*</span></label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Veltex Apex 4" />
            </div>

            <div className="form-grid">
              <div className="field"><label>Brand</label><input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Veltex" /></div>
              <div className="field"><label>Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {IMPORT_CATS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {form.category === "Tyres" && (
              <div className="form-grid">
                <div className="field"><label>Tyre size <span style={{ color: "var(--accent)" }}>*</span></label>
                  <input value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} placeholder="225/45R17" />
                </div>
                <div className="field"><label>Tyre type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    {["Passenger", "SUV", "Commercial", "Mud Terrain"].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            )}

            {form.category === "Wheels" && (
              <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                <div className="field"><label>Diameter (in) <span style={{ color: "var(--accent)" }}>*</span></label>
                  <input type="number" min="10" max="30" value={form.diameter} onChange={(e) => setForm({ ...form, diameter: e.target.value })} placeholder="18" />
                </div>
                <div className="field"><label>PCD</label><input value={form.pcd} onChange={(e) => setForm({ ...form, pcd: e.target.value })} placeholder="5x114.3" /></div>
                <div className="field"><label>Material</label>
                  <select value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })}>
                    {["Alloy", "Steel", "Forged", "Carbon"].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            )}

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

            <button className="btn block" style={{ marginTop: 10 }} disabled={saving} onClick={addProduct}><Icon name="plus" />{saving ? "Adding…" : "Add to inventory"}</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="panel" style={{ padding: 24 }}>
              <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 16 }}>Product image</div>
              <ImageSlot
                value={images[0]} onChange={(url) => setImageAt(0, url)}
                height={230} placeholder="Drop a product photo here, or click to browse"
                style={{ borderRadius: 14 }}
              />
              <p style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 10, textAlign: "center" }}>
                Recommended: 800 × 800 px · JPEG, PNG or WebP
              </p>

              <div style={{ marginTop: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-2)", marginBottom: 10 }}>Additional images</div>
                <div style={{ display: "flex", gap: 10 }}>
                  {[1, 2, 3].map((n) => (
                    <ImageSlot
                      key={n} compact value={images[n]} onChange={(url) => setImageAt(n, url)}
                      height={80} placeholder="+" style={{ flex: 1, borderRadius: 10 }}
                    />
                  ))}
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
                      <span className="prod-thumb">
                        {p.image
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={p.image} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: 8 }} />
                          : <Icon name={p.category === "Tyres" ? "tyre" : p.category === "Wheels" ? "wheel" : p.category === "Oils" ? "oil" : "part"} />}
                      </span>
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
