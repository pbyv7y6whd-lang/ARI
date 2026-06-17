"use client";

import { useState, useEffect, useRef } from "react";
import { X, Loader2, AlertCircle, Upload, Link } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = { stockId: string; entityType?: string; open: boolean; onClose: () => void; onSuccess: () => void };

const SOVEREIGN_DOC_TYPES = [
  { value: "imf_article_iv",       label: "IMF Article IV" },
  { value: "central_bank_report",  label: "Central Bank Report" },
  { value: "mof_fiscal_framework", label: "MoF Fiscal Framework" },
  { value: "eurobond_prospectus",  label: "Eurobond Prospectus" },
  { value: "rating_agency_report", label: "Rating Agency Report" },
  { value: "other",                label: "Other" },
];

const CORPORATE_DOC_TYPES = [
  { value: "annual_report",         label: "Annual Report" },
  { value: "bond_prospectus",       label: "Bond Prospectus" },
  { value: "investor_presentation", label: "Investor Presentation" },
  { value: "earnings_transcript",   label: "Earnings Transcript" },
  { value: "rating_agency_report",  label: "Rating Agency Report" },
  { value: "other",                 label: "Other" },
];

function detectYear(s: string): string {
  const m = s.match(/20(1[5-9]|2[0-9])/);
  return m ? m[0] : String(new Date().getFullYear());
}

export default function UploadDocModal({ stockId, entityType = "corporate", open, onClose, onSuccess }: Props) {
  const DOC_TYPES = entityType === "sovereign" ? SOVEREIGN_DOC_TYPES : CORPORATE_DOC_TYPES;

  const [mode,        setMode]        = useState<"url" | "upload">("upload");
  const [url,         setUrl]         = useState("");
  const [file,        setFile]        = useState<File | null>(null);
  const [docType,     setDocType]     = useState(DOC_TYPES[0].value);
  const [year,        setYear]        = useState(String(new Date().getFullYear()));
  const [displayName, setDisplayName] = useState("");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [touched,     setTouched]     = useState(false);
  const [dragOver,    setDragOver]    = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!url) return;
    setYear(detectYear(url));
  }, [url]);

  const urlValid = url.trim().startsWith("http") && url.trim().includes(".");
  const canSubmit = !loading && (mode === "url" ? urlValid : !!file);

  const handleClose = () => {
    if (loading) return;
    setUrl(""); setFile(null); setError(""); setTouched(false); setMode("upload");
    setDocType(DOC_TYPES[0].value); setYear(String(new Date().getFullYear())); setDisplayName("");
    onClose();
  };

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (f.type !== "application/pdf" && !f.name.endsWith(".pdf")) { setError("Please select a PDF file"); return; }
    setError("");
    setFile(f);
    setYear(detectYear(f.name));
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError("");

    const fd = new FormData();
    fd.append("doc_type", docType);
    fd.append("year", year);
    if (displayName.trim()) fd.append("display_name", displayName.trim());
    if (mode === "url") fd.append("pdf_url", url.trim());
    else fd.append("file", file!);

    // Save the document — modal closes as soon as this returns (~1s)
    // PDF is parsed in the background via after(). Hit Re-analyse when ready.
    const res = await fetch(`/api/stocks/${stockId}/documents`, { method: "POST", body: fd });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Failed to add document");
      setLoading(false);
      return;
    }

    onSuccess();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a0a2e]/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-sm border border-[#c8bedd] bg-[#fafaf8]"
           style={{ boxShadow: "0 24px 48px rgba(91,33,182,0.12)" }}>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e0d8ee] px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9a7cc0]">
              {entityType === "sovereign" ? "Sovereign Tracker" : "Corporate Tracker"}
            </p>
            <h2 className="mt-0.5 text-[15px] font-semibold text-[#1a0a2e]">Add Document</h2>
          </div>
          <button onClick={handleClose} disabled={loading}
            className="flex h-7 w-7 items-center justify-center rounded-sm text-[#b09dcc] hover:bg-[#ede8f5] hover:text-[#4a2980] disabled:opacity-40 transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">

          {/* Mode toggle */}
          <div className="flex rounded-sm border border-[#e0d8ee] bg-[#f4f0f8] p-0.5">
            {(["upload", "url"] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); }} disabled={loading}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-sm py-1.5 text-[11px] font-medium transition-colors",
                  mode === m ? "bg-white text-[#2d1654] shadow-sm" : "text-[#9a7cc0] hover:text-[#4a2980]"
                )}>
                {m === "upload" ? <><Upload className="h-3 w-3" />Upload PDF</> : <><Link className="h-3 w-3" />Paste URL</>}
              </button>
            ))}
          </div>

          {/* URL input */}
          {mode === "url" && (
            <div>
              <label className="text-[10px] uppercase tracking-widest text-[#9a7cc0] mb-1.5 block">Document URL</label>
              <input
                autoFocus
                value={url}
                onChange={e => { setUrl(e.target.value); setTouched(true); setError(""); }}
                placeholder="https://imf.org/country-report.pdf"
                disabled={loading}
                className={cn(
                  "w-full rounded-sm border bg-white px-3 py-2 text-[13px] text-[#1a0a2e] placeholder-[#b09dcc] outline-none transition-colors disabled:opacity-50",
                  touched && url && !urlValid ? "border-red-300" : "border-[#d0c6e0] focus:border-[#5b21b6]"
                )}
              />
            </div>
          )}

          {/* File upload */}
          {mode === "upload" && (
            <div>
              <label className="text-[10px] uppercase tracking-widest text-[#9a7cc0] mb-1.5 block">PDF File</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0] ?? null); }}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-sm border-2 border-dashed px-4 py-6 transition-colors",
                  dragOver ? "border-[#5b21b6]/60 bg-[#5b21b6]/5"
                  : file ? "border-emerald-400/60 bg-emerald-50"
                  : "border-[#d0c6e0] hover:border-[#5b21b6]/40 hover:bg-[#5b21b6]/[0.03]"
                )}
              >
                <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" className="hidden"
                  disabled={loading} onChange={e => handleFile(e.target.files?.[0] ?? null)} />
                {file ? (
                  <div className="text-center">
                    <p className="text-[12px] font-medium text-[#1a0a2e]">{file.name}</p>
                    <p className="text-[11px] text-[#9a7cc0]">{(file.size / 1024 / 1024).toFixed(1)} MB · click to change</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="h-4 w-4 text-[#b09dcc] mx-auto mb-1" />
                    <p className="text-[12px] text-[#7a5aaa]">Drop PDF here or click to browse</p>
                    <p className="text-[11px] text-[#b09dcc]">Max 50MB</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Document name (optional) */}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-[#9a7cc0] mb-1.5 block">
              Document Name <span className="normal-case tracking-normal text-[#b09dcc]">— optional</span>
            </label>
            <input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="e.g. CBE Statistical Bulletin May 2026"
              disabled={loading}
              className="w-full rounded-sm border border-[#d0c6e0] bg-white px-3 py-2 text-[13px] text-[#1a0a2e] placeholder-[#b09dcc] outline-none focus:border-[#5b21b6] disabled:opacity-50 transition-colors"
            />
          </div>

          {/* Doc type + year */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-[#9a7cc0] mb-1.5 block">Document Type</label>
              <select value={docType} onChange={e => setDocType(e.target.value)} disabled={loading}
                className="w-full rounded-sm border border-[#d0c6e0] bg-white px-3 py-2 text-[13px] text-[#1a0a2e] outline-none focus:border-[#5b21b6] disabled:opacity-50">
                {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-[#9a7cc0] mb-1.5 block">Year</label>
              <input value={year} onChange={e => setYear(e.target.value)} placeholder="2024" disabled={loading}
                className="w-full rounded-sm border border-[#d0c6e0] bg-white px-3 py-2 font-mono text-[13px] text-[#1a0a2e] placeholder-[#b09dcc] outline-none focus:border-[#5b21b6] disabled:opacity-50 transition-colors" />
            </div>
          </div>

          {loading && (
            <div className="flex items-center gap-2 rounded-sm border border-[#e0d8ee] bg-[#f4f0f8] px-4 py-3">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#5b21b6] shrink-0" />
              <span className="text-[12px] text-[#6b4fa0]">
                {mode === "upload" ? "Saving document..." : "Fetching document..."}
              </span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-sm border border-red-200 bg-red-50 px-4 py-3">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
              <p className="text-[12px] text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2.5 border-t border-[#e0d8ee] px-5 py-4">
          <button onClick={handleClose} disabled={loading}
            className="flex-none rounded-sm border border-[#d0c6e0] px-4 py-2 text-[12px] text-[#8b6bb5] hover:border-[#5b21b6]/40 hover:text-[#4a2980] disabled:opacity-40 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={!canSubmit}
            className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-[#5b21b6] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#5b21b6]/90 disabled:cursor-not-allowed disabled:opacity-30 transition-colors">
            {loading
              ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Saving...</>
              : "Add Document"
            }
          </button>
        </div>
      </div>
    </div>
  );
}
