"use client";

import { useState, useEffect, useRef } from "react";
import { X, Loader2, AlertCircle, Upload, Link } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = { stockId: string; open: boolean; onClose: () => void; onSuccess: () => void };

const DOC_TYPES = [
  { value: "annual_report",         label: "Annual Report" },
  { value: "interim_report",        label: "Interim Report" },
  { value: "investor_presentation", label: "Investor Presentation" },
  { value: "earnings_call",         label: "Earnings Transcript" },
  { value: "prospectus",            label: "Prospectus" },
  { value: "other",                 label: "Other Filing" },
];

function detectYear(s: string): string {
  const m = s.match(/20(1[5-9]|2[0-9])/);
  return m ? m[0] : String(new Date().getFullYear());
}
function detectDocType(s: string): string {
  const u = s.toLowerCase();
  if (u.includes("interim") || u.includes("half")) return "interim_report";
  if (u.includes("presentation") || u.includes("slides")) return "investor_presentation";
  if (u.includes("prospectus") || u.includes("ipo")) return "prospectus";
  return "annual_report";
}

export default function UploadDocModal({ stockId, open, onClose, onSuccess }: Props) {
  const [mode,    setMode]    = useState<"url" | "upload">("url");
  const [url,     setUrl]     = useState("");
  const [file,    setFile]    = useState<File | null>(null);
  const [docType, setDocType] = useState("annual_report");
  const [year,    setYear]    = useState(String(new Date().getFullYear()));
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [touched, setTouched] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!url) return;
    setYear(detectYear(url));
    setDocType(detectDocType(url));
  }, [url]);

  const urlValid = url.trim().startsWith("http") && url.trim().includes(".");
  const canSubmit = !loading && (mode === "url" ? urlValid : !!file);

  const handleClose = () => {
    if (loading) return;
    setUrl(""); setFile(null); setError(""); setTouched(false); setMode("url");
    setDocType("annual_report"); setYear(String(new Date().getFullYear()));
    onClose();
  };

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (f.type !== "application/pdf" && !f.name.endsWith(".pdf")) { setError("Please select a PDF file"); return; }
    setError("");
    setFile(f);
    setYear(detectYear(f.name));
    setDocType(detectDocType(f.name));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0] ?? null);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError("");

    const fd = new FormData();
    fd.append("doc_type", docType);
    fd.append("year", year);
    if (mode === "url") fd.append("pdf_url", url.trim());
    else fd.append("file", file!);

    const res = await fetch(`/api/stocks/${stockId}/documents`, { method: "POST", body: fd });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Failed to add filing");
      setLoading(false);
      return;
    }
    onSuccess();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-sm border border-[#282828] bg-[#0f0f0f]"
           style={{ boxShadow: "0 32px 64px rgba(0,0,0,0.6)" }}>

        <div className="flex items-center justify-between border-b border-[#1e1e1e] px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#555]">ARI Research</p>
            <h2 className="mt-0.5 text-[15px] font-semibold text-[#f0f0f0]">Add Filing</h2>
          </div>
          <button onClick={handleClose} disabled={loading}
            className="flex h-7 w-7 items-center justify-center rounded-sm text-[#444] hover:bg-[#1a1a1a] hover:text-[#aaa] disabled:opacity-40 transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">

          {/* Mode toggle */}
          <div className="flex rounded-sm border border-[#242424] bg-[#0a0a0a] p-0.5">
            <button
              onClick={() => { setMode("url"); setError(""); }}
              disabled={loading}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-sm py-1.5 text-[11px] font-medium transition-colors",
                mode === "url" ? "bg-[#1e1e1e] text-[#e0e0e0]" : "text-[#555] hover:text-[#888]"
              )}
            >
              <Link className="h-3 w-3" />
              Paste URL
            </button>
            <button
              onClick={() => { setMode("upload"); setError(""); }}
              disabled={loading}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-sm py-1.5 text-[11px] font-medium transition-colors",
                mode === "upload" ? "bg-[#1e1e1e] text-[#e0e0e0]" : "text-[#555] hover:text-[#888]"
              )}
            >
              <Upload className="h-3 w-3" />
              Upload PDF
            </button>
          </div>

          {/* URL input */}
          {mode === "url" && (
            <div>
              <label className="text-label mb-1.5 block">Filing URL</label>
              <input
                autoFocus
                value={url}
                onChange={e => { setUrl(e.target.value); setTouched(true); setError(""); }}
                placeholder="https://ir.company.com/report-2023.pdf"
                disabled={loading}
                className={cn(
                  "w-full rounded-sm border bg-[#0a0a0a] px-3 py-2 text-[13px] text-[#e0e0e0] placeholder-[#333] outline-none transition-colors disabled:opacity-50",
                  touched && url && !urlValid ? "border-[#ef4444]/60" : "border-[#242424] focus:border-[#3a3a3a]"
                )}
              />
              <p className="mt-1.5 text-[11px] text-[#444]">
                Right-click the PDF on the company's IR page → Copy link address
              </p>
            </div>
          )}

          {/* File upload */}
          {mode === "upload" && (
            <div>
              <label className="text-label mb-1.5 block">PDF File</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-sm border-2 border-dashed px-4 py-6 transition-colors",
                  dragOver ? "border-[#f59e0b]/60 bg-[#f59e0b]/5"
                  : file ? "border-[#22c55e]/40 bg-[#22c55e]/5"
                  : "border-[#242424] hover:border-[#333]"
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  disabled={loading}
                  onChange={e => handleFile(e.target.files?.[0] ?? null)}
                />
                {file ? (
                  <>
                    <div className="h-6 w-6 rounded-sm bg-[#22c55e]/20 flex items-center justify-center">
                      <Upload className="h-3 w-3 text-[#22c55e]" />
                    </div>
                    <div className="text-center">
                      <p className="text-[12px] font-medium text-[#e0e0e0]">{file.name}</p>
                      <p className="text-[11px] text-[#555]">{(file.size / 1024 / 1024).toFixed(1)} MB · click to change</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="h-6 w-6 rounded-sm bg-[#1e1e1e] flex items-center justify-center">
                      <Upload className="h-3 w-3 text-[#555]" />
                    </div>
                    <div className="text-center">
                      <p className="text-[12px] text-[#888]">Drop PDF here or click to browse</p>
                      <p className="text-[11px] text-[#444]">Max 50MB</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-label mb-1.5 block">Filing Type</label>
              <select value={docType} onChange={e => setDocType(e.target.value)} disabled={loading}
                className="w-full rounded-sm border border-[#242424] bg-[#0a0a0a] px-3 py-2 text-[13px] text-[#e0e0e0] outline-none focus:border-[#3a3a3a] disabled:opacity-50">
                {DOC_TYPES.map(t => <option key={t.value} value={t.value} className="bg-[#0f0f0f]">{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-label mb-1.5 block">Year</label>
              <input value={year} onChange={e => setYear(e.target.value)} placeholder="2024" disabled={loading}
                className="w-full rounded-sm border border-[#242424] bg-[#0a0a0a] px-3 py-2 font-mono text-[13px] text-[#e0e0e0] placeholder-[#333] outline-none focus:border-[#3a3a3a] disabled:opacity-50 transition-colors" />
            </div>
          </div>

          {loading && (
            <div className="flex items-center gap-2 rounded-sm border border-[#242424] bg-[#0a0a0a] px-4 py-3">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#f59e0b] shrink-0" />
              <span className="text-[12px] text-[#9a9a9a]">
                {mode === "upload" ? "Uploading and queuing re-analysis..." : "Downloading filing and queuing re-analysis..."}
              </span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-sm border border-[#ef4444]/25 bg-[#ef4444]/5 px-4 py-3">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#ef4444]" />
              <p className="text-[12px] text-[#9a9a9a]">{error}</p>
            </div>
          )}
        </div>

        <div className="flex gap-2.5 border-t border-[#1a1a1a] px-5 py-4">
          <button onClick={handleClose} disabled={loading}
            className="flex-none rounded-sm border border-[#242424] px-4 py-2 text-[12px] text-[#666] hover:border-[#333] hover:text-[#aaa] disabled:opacity-40 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={!canSubmit}
            className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-white px-4 py-2 text-[12px] font-semibold text-black hover:bg-[#e8e8e8] disabled:cursor-not-allowed disabled:opacity-30 transition-colors">
            {loading
              ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Adding filing...</>
              : "Add Filing & Re-analyse"
            }
          </button>
        </div>
      </div>
    </div>
  );
}
