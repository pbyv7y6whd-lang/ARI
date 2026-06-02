"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { X, Upload, FileText, Loader2, AlertCircle, Link as LinkIcon } from "lucide-react";
import { formatFileSize } from "@/lib/utils";

type Props = { stockId: string; open: boolean; onClose: () => void; onSuccess: () => void };
type InputMode = "upload" | "url";

const DOC_TYPES = [
  { value: "annual_report", label: "Annual Report" },
  { value: "interim_report", label: "Interim / Half-Year Report" },
  { value: "investor_presentation", label: "Investor Presentation" },
  { value: "earnings_call", label: "Earnings Call Transcript" },
  { value: "prospectus", label: "Prospectus / IPO Document" },
  { value: "other", label: "Other" },
];

export default function UploadDocModal({ stockId, open, onClose, onSuccess }: Props) {
  const [mode, setMode] = useState<InputMode>("url");
  const [file, setFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [docType, setDocType] = useState("annual_report");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [uploading, setUploading] = useState(false);
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
    if (uploading) return;
    setFile(null); setPdfUrl(""); setError(""); onClose();
  };

  const handleSubmit = async () => {
    if (mode === "upload" && !file) return;
    if (mode === "url" && !pdfUrl.trim()) return;
    setUploading(true);
    setError("");

    const fd = new FormData();
    fd.append("doc_type", docType);
    fd.append("year", year);
    if (mode === "upload" && file) {
      fd.append("file", file);
    } else {
      fd.append("pdf_url", pdfUrl.trim());
    }

    const res = await fetch(`/api/stocks/${stockId}/documents`, { method: "POST", body: fd });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Failed");
      setUploading(false);
      return;
    }
    onSuccess();
  };

  const canSubmit = mode === "upload" ? !!file : !!pdfUrl.trim();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5">
          <h2 className="font-bold text-white">Add document</h2>
          <button onClick={handleClose} disabled={uploading} className="text-white/30 hover:text-white transition-colors disabled:opacity-40">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Mode toggle */}
          <div className="flex rounded-lg bg-white/5 p-0.5">
            <button
              onClick={() => setMode("url")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-all ${mode === "url" ? "bg-white text-black" : "text-white/40 hover:text-white"}`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              Paste URL
            </button>
            <button
              onClick={() => setMode("upload")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-all ${mode === "upload" ? "bg-white text-black" : "text-white/40 hover:text-white"}`}
            >
              <Upload className="w-3.5 h-3.5" />
              Upload file
            </button>
          </div>

          {/* Doc type + year */}
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

          {/* URL input */}
          {mode === "url" && (
            <div>
              <label className="text-xs text-white/40 uppercase tracking-widest block mb-1.5">PDF URL</label>
              <input
                autoFocus
                value={pdfUrl}
                onChange={e => { setPdfUrl(e.target.value); setError(""); }}
                placeholder="https://company.com/annual-report-2024.pdf"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/20 text-sm focus:outline-none focus:border-white/30 transition-colors"
              />
              <p className="text-xs text-white/25 mt-1.5">Paste the direct link to the PDF from the company's investor relations page.</p>
            </div>
          )}

          {/* File upload */}
          {mode === "upload" && (
            !file ? (
              <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${isDragActive ? "border-white/30 bg-white/5" : "border-white/10 hover:border-white/20"}`}>
                <input {...getInputProps()} />
                <Upload className="w-6 h-6 text-white/25 mx-auto mb-3" />
                <p className="text-white/60 text-sm font-medium">Drop PDF here or click to browse</p>
                <p className="text-white/25 text-xs mt-1">Max 50MB</p>
              </div>
            ) : (
              <div className="border border-white/10 rounded-xl p-4 flex items-center gap-3">
                <div className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-white/40" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{file.name}</p>
                  <p className="text-xs text-white/30">{formatFileSize(file.size)}</p>
                </div>
                <button onClick={() => setFile(null)} disabled={uploading} className="text-white/25 hover:text-white transition-colors disabled:opacity-40">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )
          )}

          {uploading && (
            <div className="flex items-center gap-2 text-amber-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              {mode === "url" ? "Fetching PDF and queuing analysis..." : "Uploading and queuing analysis..."}
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button onClick={handleClose} disabled={uploading} className="flex-1 py-2.5 rounded-lg text-sm text-white/40 border border-white/10 hover:border-white/20 hover:text-white transition-all disabled:opacity-40">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || uploading}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-white text-black hover:bg-white/90 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {uploading ? <><Loader2 className="w-4 h-4 animate-spin" />Working...</> : "Add & re-analyse"}
          </button>
        </div>
      </div>
    </div>
  );
}
