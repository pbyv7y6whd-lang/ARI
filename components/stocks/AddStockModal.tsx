"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { X, Upload, FileText, Loader2, AlertCircle, ChevronRight } from "lucide-react";
import { formatFileSize } from "@/lib/utils";

type Props = { open: boolean; onClose: () => void; onSuccess: () => void };

type Step = "details" | "upload" | "submitting";

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
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState("annual_report");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [error, setError] = useState("");

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) { setFile(accepted[0]); setError(""); }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
  });

  const handleClose = () => {
    if (step === "submitting") return;
    setStep("details"); setName(""); setTicker(""); setSector("");
    setFile(null); setDocType("annual_report"); setYear(String(new Date().getFullYear()));
    setError(""); onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim() || !file) return;
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

      // 2. Upload document
      const fd = new FormData();
      fd.append("file", file);
      fd.append("doc_type", docType);
      fd.append("year", year);

      const docRes = await fetch(`/api/stocks/${stockId}/documents`, { method: "POST", body: fd });
      if (!docRes.ok) throw new Error("Failed to upload document");

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStep("upload");
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
              {step === "details" ? "Step 1 of 2 — Company details" : "Step 2 of 2 — Upload document"}
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
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/20 text-sm focus:outline-none focus:border-white/30 transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-widest block mb-1.5">Sector</label>
                  <input
                    value={sector}
                    onChange={e => setSector(e.target.value)}
                    placeholder="Technology"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/20 text-sm focus:outline-none focus:border-white/30 transition-colors"
                  />
                </div>
              </div>
            </>
          ) : step === "upload" || step === "submitting" ? (
            <>
              {/* Doc type + year */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-widest block mb-1.5">Document type</label>
                  <select
                    value={docType}
                    onChange={e => setDocType(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/30 transition-colors"
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
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/20 text-sm focus:outline-none focus:border-white/30 transition-colors"
                  />
                </div>
              </div>

              {/* Dropzone */}
              {!file ? (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                    isDragActive ? "border-white/30 bg-white/5" : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-6 h-6 text-white/25 mx-auto mb-3" />
                  <p className="text-white/60 text-sm font-medium mb-1">Drop PDF here</p>
                  <p className="text-white/25 text-xs">or click to browse · max 50MB</p>
                </div>
              ) : (
                <div className="border border-white/10 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-white/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{file.name}</p>
                    <p className="text-xs text-white/30">{formatFileSize(file.size)}</p>
                  </div>
                  <button onClick={() => setFile(null)} disabled={step === "submitting"} className="text-white/25 hover:text-white transition-colors disabled:opacity-40">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {step === "submitting" && (
                <div className="flex items-center gap-2.5 text-amber-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  Uploading and queuing analysis...
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                <p className="text-xs text-white/30 leading-relaxed">
                  <span className="text-white/50 font-medium">Analysis takes 2–4 minutes.</span>{" "}
                  You can upload more documents to this stock later to improve the research.
                </p>
              </div>
            </>
          ) : null}
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
              onClick={() => { if (name.trim()) setStep("upload"); }}
              disabled={!name.trim()}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-white text-black hover:bg-white/90 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            >
              Next — upload document
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!file || step === "submitting"}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-white text-black hover:bg-white/90 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {step === "submitting" ? <><Loader2 className="w-4 h-4 animate-spin" />Uploading...</> : "Add stock & analyse"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
