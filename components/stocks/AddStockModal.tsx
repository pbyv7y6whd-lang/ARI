"use client";

import { useState } from "react";
import { X, Loader2, AlertCircle, ChevronRight, Link as LinkIcon } from "lucide-react";

type Props = { open: boolean; onClose: () => void; onSuccess: () => void };
type Step = "details" | "url" | "submitting";

const DOC_TYPES = [
  { value: "annual_report", label: "Annual Report" },
  { value: "interim_report", label: "Interim / Half-Year Report" },
  { value: "investor_presentation", label: "Investor Presentation" },
  { value: "earnings_call", label: "Earnings Call Transcript" },
  { value: "prospectus", label: "Prospectus / IPO Document" },
  { value: "other", label: "Other" },
];

export default function AddStockModal({ open, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<Step>("details");
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [sector, setSector] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [docType, setDocType] = useState("annual_report");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [error, setError] = useState("");

  const handleClose = () => {
    if (step === "submitting") return;
    setStep("details");
    setName(""); setTicker(""); setSector("");
    setPdfUrl(""); setDocType("annual_report");
    setYear(String(new Date().getFullYear()));
    setError("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim() || !pdfUrl.trim()) return;
    setStep("submitting");
    setError("");

    try {
      // 1. Create stock
      const stockRes = await fetch("/api/stocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), ticker: ticker.trim() || null, sector: sector.trim() || null }),
      });
      if (!stockRes.ok) throw new Error("Failed to create stock");
      const { id: stockId } = await stockRes.json();

      // 2. Add document via URL
      const fd = new FormData();
      fd.append("pdf_url", pdfUrl.trim());
      fd.append("doc_type", docType);
      fd.append("year", year);

      const docRes = await fetch(`/api/stocks/${stockId}/documents`, { method: "POST", body: fd });
      if (!docRes.ok) {
        const d = await docRes.json();
        throw new Error(d.error || "Failed to fetch PDF from that URL");
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStep("url");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl w-full max-w-lg">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5">
          <div>
            <h2 className="font-bold text-white text-lg">Add stock</h2>
            <p className="text-white/40 text-xs mt-0.5">
              {step === "details" ? "Step 1 of 2 — Company details" : "Step 2 of 2 — Annual report URL"}
            </p>
          </div>
          <button onClick={handleClose} disabled={step === "submitting"} className="text-white/30 hover:text-white transition-colors disabled:opacity-40">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {step === "details" ? (
            <>
              <div>
                <label className="text-xs text-white/40 uppercase tracking-widest block mb-1.5">Company name *</label>
                <input
                  autoFocus
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && name.trim() && setStep("url")}
                  placeholder="e.g. Apple Inc"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/20 text-sm focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-widest block mb-1.5">Ticker</label>
                  <input
                    value={ticker}
                    onChange={e => setTicker(e.target.value.toUpperCase())}
                    placeholder="AAPL"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/20 text-sm focus:outline-none focus:border-white/30 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-widest block mb-1.5">Sector</label>
                  <input
                    value={sector}
                    onChange={e => setSector(e.target.value)}
                    placeholder="Technology"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/20 text-sm focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-xs text-white/40 uppercase tracking-widest block mb-1.5">
                  Annual report URL *
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                  <input
                    autoFocus
                    value={pdfUrl}
                    onChange={e => { setPdfUrl(e.target.value); setError(""); }}
                    placeholder="https://company.com/annual-report-2024.pdf"
                    disabled={step === "submitting"}
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-white/20 text-sm focus:outline-none focus:border-white/30 disabled:opacity-50 transition-colors"
                  />
                </div>
                <p className="text-xs text-white/25 mt-2 leading-relaxed">
                  Go to the company's investor relations page, find the annual report PDF, right-click the link → <span className="text-white/40">Copy link address</span>, then paste it here.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-widest block mb-1.5">Document type</label>
                  <select
                    value={docType}
                    onChange={e => setDocType(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/30"
                  >
                    {DOC_TYPES.map(t => <option key={t.value} value={t.value} className="bg-[#111]">{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-widest block mb-1.5">Year</label>
                  <input
                    value={year}
                    onChange={e => setYear(e.target.value)}
                    placeholder="2024"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/20 text-sm focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              {step === "submitting" && (
                <div className="flex items-center gap-2.5 text-amber-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  Fetching report and queuing analysis...
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                <p className="text-xs text-white/30 leading-relaxed">
                  <span className="text-white/50 font-medium">Analysis takes 2–4 minutes.</span>{" "}
                  You can add more years of reports after. ARI reads all documents together to build a richer picture.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={handleClose}
            disabled={step === "submitting"}
            className="flex-1 py-2.5 rounded-lg text-sm text-white/40 hover:text-white border border-white/10 hover:border-white/20 transition-all disabled:opacity-40"
          >
            Cancel
          </button>

          {step === "details" ? (
            <button
              onClick={() => { if (name.trim()) setStep("url"); }}
              disabled={!name.trim()}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-white text-black hover:bg-white/90 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!pdfUrl.trim() || step === "submitting"}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-white text-black hover:bg-white/90 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {step === "submitting"
                ? <><Loader2 className="w-4 h-4 animate-spin" />Fetching...</>
                : "Add stock & analyse"
              }
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
