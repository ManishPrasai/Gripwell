/**
 * Client-side CSV export. Builds a spreadsheet-safe CSV (quotes fields, escapes
 * embedded quotes, prepends a UTF-8 BOM for Excel) and triggers a download.
 */
function esc(v: unknown): string {
  const s = v == null ? "" : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const body = [headers, ...rows].map((r) => r.map(esc).join(",")).join("\r\n")
  const blob = new Blob(["﻿" + body], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
