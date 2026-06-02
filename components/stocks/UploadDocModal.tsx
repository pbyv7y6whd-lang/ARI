"use client";

import { useState } from "react";
import { X, Loader2, AlertCircle, Link as LinkIcon } from "lucide-react";

type Props = { stockId: string; open: boolean; onClose: () => void; onSuccess: () => void };

const DOC_TYPES = [
  { value: "annual_report", label: "Annual Report" },
  { value: "interim_report", label: "Interim / Half-Year Report" },
  { value: "investor_presentation", label: "Investor Presentation" },
  { value: "earnings_call", label: "Earnings Call Transcript" },
  { value: "prospectus", label: "Prospectus / IPO Document" },
  { value: "other", label: "Other" },
];

export default function UploadDocModal({ stockId, open, onClose, onSuccess }: Props) {
  const [pdfUrl, setPdfUrl] = useState("");
  const [docType, setDocType] = useState("annual_report");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClose = () => {
    if (loading) return;
    setPdfUrl(""); setError(""); onClose();
  };

  const handleSubmit = async () => {
    if (!pdfUrl.trim()) return;
    setLoading(true);
    setError("");

    const fd = new FormData();
    fd.append("pdf_url", pdfUrl.trim());
    fd.append("doc_type", docType);
    fd.append("year", year);

    const res = await fetch(`/api/stocks/${stockId}/documents`, { method: "POST", body: fd });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Could not fetch that PDF");
      setLoading(false);
      return;
    }
    onSuccess();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5">
          <h2 className="font-bold text-white">Add document</h2>
          <button onClick={handleClose} disabled={loading} className="text-white/30 hover:text-white transition-colors disabled:opacity-40">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="text-xs text-white/40 uppercase tracking-widest block mb-1.5">PDF URL *</label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
              <input
                autoFocus
                value={pdfUrl}
                onChange={e => { setPdfUrl(e.target.value); setError(""); }}
                placeholder="https://company.com/annual-report-2024.pdf"
                disabled={loading}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-white/20 text-sm focus:outline-none focus:border-white/30 disabled:opacity-50 transition-colors"
              />
            </div>
            <p className="text-xs text-white/25 mt-2">
              Right-click the PDF link on the company's investor relations page → Copy link address → paste here.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/40 uppercase tracking-widest block mb-1.5">Document type</label>
              <select value={docType} onChange={e => setDocType(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/30">
                {DOC_TYPES.map(t => <option key={t.value} value={t.value} className="bg-[#111]">{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase tracking-widest block mb-1.5">Year</label>
              <input value={year} onChange={e => setYear(e.target.value)} placeholder="2024" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/20 text-sm focus:outline-none focus:border-white/30" />
            </div>
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-amber-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Fetching PDF and queuing re-analysis...
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button onClick={handleClose} disabled={loading} className="flex-1 py-2.5 rounded-lg text-sm text-white/40 border border-white/10 hover:border-white/20 hover:text-white transition-all disabled:opacity-40">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!pdfUrl.trim() || loading}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-white text-black hover:bg-white/90 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Fetching...</> : "Add & re-analyse"}
          </button>
        </div>
      </div>
    </div>
  );
}
