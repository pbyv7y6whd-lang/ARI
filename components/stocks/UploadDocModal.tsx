"use client";

import { useState, useEffect } from "react";
import { X, Loader2, AlertCircle } from "lucide-react";
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

function detectYear(url: string): string {
  const m = url.match(/20(1[5-9]|2[0-9])/);
  return m ? m[0] : String(new Date().getFullYear());
}
function detectDocType(url: string): string {
  const u = url.toLowerCase();
  if (u.includes("interim") || u.includes("half")) return "interim_report";
  if (u.includes("presentation") || u.includes("slides")) return "investor_presentation";
  if (u.includes("prospectus") || u.includes("ipo")) return "prospectus";
  return "annual_report";
}

export default function UploadDocModal({ stockId, open, onClose, onSuccess }: Props) {
  const [url,     setUrl]     = useState("");
  const [docType, setDocType] = useState("annual_report");
  const [year,    setYear]    = useState(String(new Date().getFullYear()));
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!url) return;
    setYear(detectYear(url));
    setDocType(detectDocType(url));
  }, [url]);

  const urlValid = url.trim().startsWith("http") && url.trim().includes(".");

  const handleClose = () => {
    if (loading) return;
    setUrl(""); setError(""); setTouched(false);
    setDocType("annual_report"); setYear(String(new Date().getFullYear()));
    onClose();
  };

  const handleSubmit = async () => {
    if (!urlValid || loading) return;
    setLoading(true);
    setError("");

    const fd = new FormData();
    fd.append("pdf_url", url.trim());
    fd.append("doc_type", docType);
    fd.append("year", year);

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
                touched && url && !urlValid
                  ? "border-[#ef4444]/60" : "border-[#242424] focus:border-[#3a3a3a]"
              )}
            />
            <p className="mt-1.5 text-[11px] text-[#444]">
              Right-click the PDF on the company's IR page → Copy link address
            </p>
          </div>

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
              <span className="text-[12px] text-[#9a9a9a]">Downloading filing and queuing re-analysis...</span>
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
          <button onClick={handleSubmit} disabled={!urlValid || loading}
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
