"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, AlertCircle, ArrowRight, Upload, Link } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = { open: boolean; onClose: () => void; onSuccess: () => void };

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
  if (u.includes("interim") || u.includes("half") || u.includes("h1") || u.includes("h2")) return "interim_report";
  if (u.includes("presentation") || u.includes("slides") || u.includes("investor-day")) return "investor_presentation";
  if (u.includes("prospectus") || u.includes("ipo") || u.includes("listing")) return "prospectus";
  return "annual_report";
}

export default function InitiateCoverageModal({ open, onClose, onSuccess }: Props) {
  const router = useRouter();

  const [mode,    setMode]    = useState<"url" | "upload">("url");
  const [name,    setName]    = useState("");
  const [ticker,  setTicker]  = useState("");
  const [sector,  setSector]  = useState("");
  const [url,     setUrl]     = useState("");
  const [file,    setFile]    = useState<File | null>(null);
  const [docType, setDocType] = useState("annual_report");
  const [year,    setYear]    = useState(String(new Date().getFullYear()));
  const [urlTouched, setUrlTouched] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const [state,   setState]   = useState<"idle" | "submitting" | "error">("idle");
  const [error,   setError]   = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!url) return;
    setYear(detectYear(url));
    setDocType(detectDocType(url));
  }, [url]);

  const urlValid = url.trim().startsWith("http") && url.trim().includes(".");
  const canSubmit = name.trim() && state !== "submitting" && (
    mode === "url" ? urlValid : !!file
  );

  const handleClose = () => {
    if (state === "submitting") return;
    setName(""); setTicker(""); setSector(""); setUrl(""); setFile(null);
    setDocType("annual_report"); setYear(String(new Date().getFullYear()));
    setState("idle"); setError(""); setUrlTouched(false); setMode("url");
    onClose();
  };

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (f.type !== "application/pdf" && !f.name.endsWith(".pdf")) {
      setError("Please select a PDF file");
      return;
    }
    setError("");
    setFile(f);
    // Auto-detect year from filename
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
    setState("submitting");
    setError("");

    if (mode === "url") {
      const res = await fetch("/api/initiate-coverage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          ticker: ticker.trim().toUpperCase() || null,
          sector: sector.trim() || null,
          url: url.trim(),
          doc_type: docType,
          year,
        }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to initiate coverage"); setState("error"); return; }

      router.push(`/dashboard/stocks/${data.stockId}`);
      fetch(`/api/stocks/${data.stockId}/analyse`, { method: "POST" }).catch(console.error);
    } else {
      // File upload — analysis runs inline in this request
      const fd = new FormData();
      fd.append("name", name.trim());
      if (ticker.trim()) fd.append("ticker", ticker.trim().toUpperCase());
      if (sector.trim()) fd.append("sector", sector.trim());
      fd.append("doc_type", docType);
      fd.append("year", year);
      fd.append("file", file!);

      const res = await fetch("/api/initiate-coverage-upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to initiate coverage"); setState("error"); return; }

      router.push(`/dashboard/stocks/${data.stockId}`);
      fetch(`/api/stocks/${data.stockId}/analyse`, { method: "POST" }).catch(console.error);
    }

    setState("idle");
    onSuccess();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-lg rounded-sm border border-[#282828] bg-[#0f0f0f]"
        style={{ boxShadow: "0 32px 64px rgba(0,0,0,0.6)" }}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-[#1e1e1e] px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#555]">ARI Research</p>
            <h2 className="mt-0.5 text-[15px] font-semibold text-[#f0f0f0]">Initiate Coverage</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={state === "submitting"}
            className="flex h-7 w-7 items-center justify-center rounded-sm text-[#444] transition-colors hover:bg-[#1a1a1a] hover:text-[#aaa] disabled:opacity-40"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* ── Form ───────────────────────────────────────────────────────── */}
        <div className="space-y-4 px-5 py-5">

          {/* Mode toggle */}
          <div className="flex rounded-sm border border-[#242424] bg-[#0a0a0a] p-0.5">
            <button
              onClick={() => { setMode("url"); setError(""); }}
              disabled={state === "submitting"}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-sm py-1.5 text-[11px] font-medium transition-colors",
                mode === "url"
                  ? "bg-[#1e1e1e] text-[#e0e0e0]"
                  : "text-[#555] hover:text-[#888]"
              )}
            >
              <Link className="h-3 w-3" />
              Paste URL
            </button>
            <button
              onClick={() => { setMode("upload"); setError(""); }}
              disabled={state === "submitting"}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-sm py-1.5 text-[11px] font-medium transition-colors",
                mode === "upload"
                  ? "bg-[#1e1e1e] text-[#e0e0e0]"
                  : "text-[#555] hover:text-[#888]"
              )}
            >
              <Upload className="h-3 w-3" />
              Upload PDF
            </button>
          </div>

          {/* URL input */}
          {mode === "url" && (
            <div>
              <label className="text-label mb-1.5 block">Annual Report URL</label>
              <input
                autoFocus
                value={url}
                onChange={e => { setUrl(e.target.value); setUrlTouched(true); setError(""); }}
                onBlur={() => setUrlTouched(true)}
                placeholder="https://ir.company.com/annual-report-2024.pdf"
                disabled={state === "submitting"}
                className={cn(
                  "w-full rounded-sm border bg-[#0a0a0a] px-3 py-2 text-[13px] text-[#e0e0e0] placeholder-[#333] outline-none transition-colors disabled:opacity-50",
                  urlTouched && url && !urlValid
                    ? "border-[#ef4444]/60 focus:border-[#ef4444]"
                    : "border-[#242424] focus:border-[#3a3a3a]"
                )}
              />
              {urlTouched && url && !urlValid && (
                <p className="mt-1 text-[11px] text-[#ef4444]">Enter a valid https:// URL pointing directly to a PDF</p>
              )}
              {!url && (
                <p className="mt-1.5 text-[11px] text-[#444] leading-relaxed">
                  Go to the company's investor relations page → right-click the PDF link → Copy link address
                </p>
              )}
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
                  dragOver
                    ? "border-[#f59e0b]/60 bg-[#f59e0b]/5"
                    : file
                    ? "border-[#22c55e]/40 bg-[#22c55e]/5"
                    : "border-[#242424] hover:border-[#333]"
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  disabled={state === "submitting"}
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

          {/* Company name + ticker row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-label mb-1.5 block">Company Name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Apple Inc"
                disabled={state === "submitting"}
                className="w-full rounded-sm border border-[#242424] bg-[#0a0a0a] px-3 py-2 text-[13px] text-[#e0e0e0] placeholder-[#333] outline-none transition-colors focus:border-[#3a3a3a] disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-label mb-1.5 block">Ticker</label>
              <input
                value={ticker}
                onChange={e => setTicker(e.target.value.toUpperCase())}
                placeholder="AAPL"
                disabled={state === "submitting"}
                className="w-full rounded-sm border border-[#242424] bg-[#0a0a0a] px-3 py-2 font-mono text-[13px] text-[#e0e0e0] placeholder-[#333] outline-none transition-colors focus:border-[#3a3a3a] disabled:opacity-50"
              />
            </div>
          </div>

          {/* Sector + doc type + year row */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-label mb-1.5 block">Sector</label>
              <input
                value={sector}
                onChange={e => setSector(e.target.value)}
                placeholder="Technology"
                disabled={state === "submitting"}
                className="w-full rounded-sm border border-[#242424] bg-[#0a0a0a] px-3 py-2 text-[13px] text-[#e0e0e0] placeholder-[#333] outline-none transition-colors focus:border-[#3a3a3a] disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-label mb-1.5 block">Filing Type</label>
              <select
                value={docType}
                onChange={e => setDocType(e.target.value)}
                disabled={state === "submitting"}
                className="w-full rounded-sm border border-[#242424] bg-[#0a0a0a] px-3 py-2 text-[13px] text-[#e0e0e0] outline-none focus:border-[#3a3a3a] disabled:opacity-50"
              >
                {DOC_TYPES.map(t => (
                  <option key={t.value} value={t.value} className="bg-[#0f0f0f]">{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-label mb-1.5 block">Year</label>
              <input
                value={year}
                onChange={e => setYear(e.target.value)}
                placeholder="2024"
                disabled={state === "submitting"}
                className="w-full rounded-sm border border-[#242424] bg-[#0a0a0a] px-3 py-2 font-mono text-[13px] text-[#e0e0e0] placeholder-[#333] outline-none transition-colors focus:border-[#3a3a3a] disabled:opacity-50"
              />
            </div>
          </div>

          {/* Processing state */}
          {state === "submitting" && (
            <div className="rounded-sm border border-[#242424] bg-[#0a0a0a] px-4 py-3">
              <div className="flex items-center gap-2.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#f59e0b] shrink-0" />
                <span className="text-[12px] text-[#9a9a9a]">
                  {mode === "upload" ? "Parsing and analysing document..." : "Downloading and validating document..."}
                </span>
              </div>
              <div className="mt-2.5 h-px w-full bg-[#1a1a1a]">
                <div className="h-px bg-[#f59e0b] processing-pulse" style={{ width: "60%" }} />
              </div>
            </div>
          )}

          {/* Error */}
          {state === "error" && error && (
            <div className="flex items-start gap-2.5 rounded-sm border border-[#ef4444]/25 bg-[#ef4444]/5 px-4 py-3">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#ef4444]" />
              <div>
                <p className="text-[12px] font-medium text-[#ef4444]">Could not initiate coverage</p>
                <p className="mt-0.5 text-[11px] text-[#9a9a9a]">{error}</p>
              </div>
            </div>
          )}

          {/* What happens next */}
          {state === "idle" && (
            <div className="rounded-sm border border-[#1a1a1a] bg-[#0a0a0a] px-4 py-3">
              <p className="text-label mb-2">Analysis pipeline</p>
              <div className="space-y-1.5">
                {[
                  "Parse document structure and sections",
                  "Analyse financial quality and cash conversion",
                  "Evaluate management, governance and remuneration",
                  "Build bull case, bear case and variant perception",
                  "Generate institutional investment memo",
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px] text-[#444]">
                    <span className="text-mono text-[#333]">{String(i + 1).padStart(2, "0")}</span>
                    {step}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2.5 border-t border-[#1a1a1a] px-5 py-4">
          <button
            onClick={handleClose}
            disabled={state === "submitting"}
            className="flex-none rounded-sm border border-[#242424] px-4 py-2 text-[12px] text-[#666] transition-colors hover:border-[#333] hover:text-[#aaa] disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-white px-4 py-2 text-[12px] font-semibold text-black transition-colors hover:bg-[#e8e8e8] disabled:cursor-not-allowed disabled:opacity-30"
          >
            {state === "submitting" ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" />Initiating coverage...</>
            ) : (
              <>Generate Research <ArrowRight className="h-3.5 w-3.5" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
