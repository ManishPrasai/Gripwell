"use client";
/* ============================================================
   Gripwell â" Admin · product image upload
   ImageSlot   â" one drop target that uploads and previews
   ProductGallery â" manages the saved gallery of an existing product
   ============================================================ */
import * as React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Icon } from "./icons";
import { toast } from "./ui";
import { uploadProductImage } from "../../lib/imageUpload";
import { adminFetch } from "../../lib/adminFetch";

/* â"€â"€ One upload slot â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */
export function ImageSlot({
  value, onChange, height = 230, placeholder = "Drop a product photo here", style, compact,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  height?: number;
  placeholder?: string;
  style?: React.CSSProperties;
  compact?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file?: File | null) {
    if (!file || busy) return;
    setBusy(true);
    try {
      const { url } = await uploadProductImage(file);
      onChange(url);
      toast({ kind: "ok", title: "Image uploaded", body: "It'll appear on the product once you save." });
    } catch (e: any) {
      toast({ kind: "err", title: "Upload failed", body: e?.message || "Please try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      onClick={() => !busy && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files?.[0]); }}
      style={{
        position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
        width: "100%", height, borderRadius: 12, overflow: "hidden",
        border: `1px ${value ? "solid" : "dashed"} ${drag ? "var(--accent)" : "var(--border)"}`,
        background: drag ? "color-mix(in oklab, var(--accent) 8%, transparent)" : "var(--chip)",
        color: "var(--ink-3)", fontSize: compact ? 20 : 13, textAlign: "center",
        cursor: busy ? "wait" : "pointer", transition: "border-color .15s ease, background .15s ease",
        ...style,
      }}
    >
      <input
        ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/avif" hidden
        onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }}
      />

      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="Product" style={{ width: "100%", height: "100%", objectFit: "contain", background: "#fff" }} />
      ) : busy ? (
        <span style={{ fontSize: 12.5 }}>Uploading…</span>
      ) : (
        <span style={{ padding: "0 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          {!compact && <Icon name="image" style={{ width: 22, height: 22, opacity: .7 }} />}
          {placeholder}
        </span>
      )}

      {busy && value && (
        <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "rgba(0,0,0,.35)", color: "#fff", fontSize: 12.5 }}>
          Uploading…
        </span>
      )}

      {value && !busy && (
        <button
          type="button"
          title="Remove image"
          onClick={(e) => { e.stopPropagation(); onChange(null); }}
          style={{
            position: "absolute", top: 6, right: 6, width: 26, height: 26, borderRadius: 8,
            display: "grid", placeItems: "center", cursor: "pointer",
            background: "rgba(17,20,18,.72)", color: "#fff", border: "none",
          }}
        >
          <Icon name="x" style={{ width: 14, height: 14 }} />
        </button>
      )}
    </div>
  );
}

/* â"€â"€ Gallery for a product that already exists â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */
type GalleryImage = { id: string; url: string; altText: string | null; sortOrder: number };

export function ProductGallery({ productId, onChanged }: { productId: string; onChanged?: () => void }) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/products/${productId}/images`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to load images");
      setImages(json.data ?? []);
    } catch {
      setImages([]);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => { load(); }, [load]);

  async function addFiles(files: FileList | null) {
    if (!files?.length || busy) return;
    setBusy(true);
    try {
      // Sequential on purpose â" keeps sortOrder deterministic and avoids
      // firing several multi-MB uploads at the Worker at once.
      for (const file of Array.from(files)) {
        const { url } = await uploadProductImage(file);
        await adminFetch(`/api/admin/products/${productId}/images`, "POST", { url });
      }
      await load();
      onChanged?.();
      toast({ kind: "ok", title: "Image added", body: "It's live on the website now." });
    } catch (e: any) {
      toast({ kind: "err", title: "Couldn't add image", body: e?.message || "Please try again." });
    } finally {
      setBusy(false);
    }
  }

  async function remove(img: GalleryImage) {
    const prev = images;
    setImages((list) => list.filter((i) => i.id !== img.id));  // optimistic
    try {
      await adminFetch(`/api/admin/products/${productId}/images?imageId=${img.id}`, "DELETE");
      onChanged?.();
    } catch (e: any) {
      setImages(prev);  // rollback
      toast({ kind: "err", title: "Couldn't remove image", body: e?.message || "Please try again." });
    }
  }

  return (
    <div className="field">
      <label>Product images</label>

      {loading ? (
        <div style={{ fontSize: 12.5, color: "var(--ink-3)", padding: "8px 0" }}>Loading images…</div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 4 }}>
          {images.map((img, n) => (
            <div key={img.id} style={{ position: "relative", width: 84, height: 84, borderRadius: 10, overflow: "hidden", border: "1px solid var(--border)", background: "#fff" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.altText || "Product"} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              {n === 0 && (
                <span style={{ position: "absolute", bottom: 0, left: 0, right: 0, fontSize: 9.5, fontWeight: 700, textAlign: "center", background: "rgba(17,20,18,.72)", color: "#fff", padding: "2px 0" }}>
                  MAIN
                </span>
              )}
              <button
                type="button" title="Remove image" onClick={() => remove(img)}
                style={{ position: "absolute", top: 4, right: 4, width: 22, height: 22, borderRadius: 7, display: "grid", placeItems: "center", cursor: "pointer", background: "rgba(17,20,18,.72)", color: "#fff", border: "none" }}
              >
                <Icon name="x" style={{ width: 12, height: 12 }} />
              </button>
            </div>
          ))}

          <button
            type="button" disabled={busy} onClick={() => inputRef.current?.click()}
            style={{
              width: 84, height: 84, borderRadius: 10, border: "1px dashed var(--border)",
              background: "var(--chip)", color: "var(--ink-3)", cursor: busy ? "wait" : "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, fontSize: 11,
            }}
          >
            {busy ? "Uploading…" : <><Icon name="plus" style={{ width: 16, height: 16 }} />Add</>}
          </button>

          <input
            ref={inputRef} type="file" multiple accept="image/png,image/jpeg,image/webp,image/avif" hidden
            onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
          />
        </div>
      )}

      <p style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 8 }}>
        The first image is what shoppers see on the shop grid. Changes save immediately.
      </p>
    </div>
  );
}
