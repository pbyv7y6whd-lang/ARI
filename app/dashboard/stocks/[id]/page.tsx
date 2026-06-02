"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle, Plus, FileText, RefreshCw, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { ReportAnalysis } from "@/lib/supabase";
import ReportView from "@/components/report/ReportView";
import UploadDocModal from "@/components/stocks/UploadDocModal";

type Document = {
  id: string;
  file_name: string;
  doc_type: string;
  year: string | null;
  blob_url: string;
  page_count: number | null;
  created_at: string;
};

type StockData = {
  id: string;
  name: string;
  ticker: string | null;
  sector: string | null;
  status: "pending" | "processing" | "complete" | "error";
  progress: number;
  progress_message: string | null;
  analysis: ReportAnalysis | null;
  doc_count: number;
  created_at: string;
  updated_at: string;
  documents: Document[];
};

const DOC_TYPE_LABELS: Record<string, string> = {
  annual_report: "Annual Report",
  interim_report: "Interim Report",
  investor_presentation: "Investor Presentation",
  earnings_call: "Earnings Call",
  prospectus: "Prospectus",
  other: "Document",
};

export default function StockPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [stock, setStock] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [reanalysing, setReanalysing] = useState(false);
  const [activeTab, setActiveTab] = useState<"research" | "documents">("research");

  const fetchStock = async () => {
    const res = await fetch(`/api/stocks/${id}`);
    if (!res.ok) { router.push("/dashboard"); return; }
    setStock(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchStock();
    const interval = setInterval(() => {
      setStock(prev => {
        if (prev?.status === "processing") fetchStock();
        return prev;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const handleReanalyse = async () => {
    setReanalysing(true);
    await fetch(`/api/stocks/${id}/analyse`, { method: "POST" });
    await fetchStock();
    setReanalysing(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Delete ${stock?.name}? This cannot be undone.`)) return;
    await fetch(`/api/stocks/${id}`, { method: "DELETE" });
    router.push("/dashboard");
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><Loader2 className="w-6 h-6 text-white/30 animate-spin" /></div>;
  if (!stock) return null;

  const score = stock.analysis?.overallScore?.total;
  const sector = stock.sector || stock.analysis?.investmentSnapshot?.sector;

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-[#090909]/90 backdrop-blur-md border-b border-white/5 px-8 py-4">
        <div className="flex items-center justify-between max-w-6xl">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-white/30 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                {stock.ticker && (
                  <span className="text-xs font-mono font-bold text-white/50 bg-white/8 px-2 py-0.5 rounded">
                    {stock.ticker}
                  </span>
                )}
                <h1 className="font-bold text-white">{stock.name}</h1>
                {sector && <span className="text-white/30 text-sm">· {sector}</span>}
              </div>
              <p className="text-xs text-white/25 mt-0.5">
                {stock.documents.length} document{stock.documents.length !== 1 ? "s" : ""} · Updated {formatDate(stock.updated_at)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {score !== undefined && (
              <div className={`border rounded-lg px-3 py-1.5 text-sm font-bold ${
                score >= 70 ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                : score >= 50 ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
                : "text-red-400 border-red-500/30 bg-red-500/10"
              }`}>
                {score}/100
              </div>
            )}
            <button
              onClick={() => setUploadOpen(true)}
              className="flex items-center gap-1.5 text-xs bg-white/8 hover:bg-white/15 text-white/70 hover:text-white px-3 py-1.5 rounded-lg transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add document
            </button>
            {stock.documents.length > 0 && stock.status !== "processing" && (
              <button
                onClick={handleReanalyse}
                disabled={reanalysing}
                className="flex items-center gap-1.5 text-xs bg-white/8 hover:bg-white/15 text-white/70 hover:text-white px-3 py-1.5 rounded-lg transition-all disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${reanalysing ? "animate-spin" : ""}`} />
                Re-analyse
              </button>
            )}
            <button
              onClick={handleDelete}
              className="text-white/20 hover:text-red-400 transition-colors p-1.5"
              title="Delete stock"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mt-3 max-w-6xl">
          <button
            onClick={() => setActiveTab("research")}
            className={`text-sm pb-2 border-b-2 transition-colors ${activeTab === "research" ? "border-white text-white" : "border-transparent text-white/35 hover:text-white/60"}`}
          >
            Research report
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={`text-sm pb-2 border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === "documents" ? "border-white text-white" : "border-transparent text-white/35 hover:text-white/60"}`}
          >
            Documents
            <span className="text-xs bg-white/10 text-white/40 px-1.5 py-0.5 rounded-full">{stock.documents.length}</span>
          </button>
        </div>
      </div>

      <div className="px-8 py-8 max-w-6xl">
        {activeTab === "documents" ? (
          <DocumentsTab stock={stock} onUpload={() => setUploadOpen(true)} />
        ) : stock.status === "processing" ? (
          <ProcessingState stock={stock} />
        ) : stock.status === "pending" || stock.documents.length === 0 ? (
          <PendingState onUpload={() => setUploadOpen(true)} />
        ) : stock.status === "error" ? (
          <ErrorState message={stock.progress_message} onRetry={handleReanalyse} />
        ) : stock.analysis ? (
          <ReportView analysis={stock.analysis} />
        ) : null}
      </div>

      <UploadDocModal
        stockId={id}
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={() => { setUploadOpen(false); fetchStock(); }}
      />
    </div>
  );
}

function ProcessingState({ stock }: { stock: StockData }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-6">
      <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      <div className="text-center">
        <h2 className="font-bold text-lg text-white mb-1">Analysing {stock.name}</h2>
        <p className="text-white/40 text-sm animate-pulse">{stock.progress_message || "Processing..."}</p>
      </div>
      <div className="w-64">
        <div className="w-full bg-white/5 rounded-full h-1.5">
          <div className="bg-amber-400 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${stock.progress || 5}%` }} />
        </div>
        <p className="text-xs text-white/20 text-center mt-2">{stock.progress}% — takes 2–4 minutes</p>
      </div>
    </div>
  );
}

function PendingState({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center">
        <FileText className="w-6 h-6 text-white/30" />
      </div>
      <div className="text-center">
        <h3 className="font-semibold text-white mb-1">No documents yet</h3>
        <p className="text-white/40 text-sm max-w-xs">Upload an annual report or other document to generate research for this stock.</p>
      </div>
      <button
        onClick={onUpload}
        className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-white/90 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Upload document
      </button>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string | null; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <AlertCircle className="w-8 h-8 text-red-400" />
      <div className="text-center">
        <h3 className="font-semibold text-white mb-1">Analysis failed</h3>
        <p className="text-white/40 text-sm max-w-sm">{message || "Something went wrong."}</p>
      </div>
      <button onClick={onRetry} className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white px-4 py-2 rounded-lg text-sm transition-colors">
        <RefreshCw className="w-4 h-4" />
        Try again
      </button>
    </div>
  );
}

function DocumentsTab({ stock, onUpload }: { stock: StockData; onUpload: () => void }) {
  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-white">Documents</h2>
        <button
          onClick={onUpload}
          className="flex items-center gap-1.5 text-sm bg-white text-black px-3 py-1.5 rounded-lg font-semibold hover:bg-white/90 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Upload
        </button>
      </div>

      {stock.documents.length === 0 ? (
        <p className="text-white/30 text-sm">No documents uploaded yet.</p>
      ) : (
        <div className="space-y-2">
          {stock.documents.map((doc) => (
            <a key={doc.id} href={doc.blob_url} target="_blank" rel="noopener noreferrer">
              <div className="flex items-center gap-3 bg-white/[0.02] border border-white/8 rounded-xl p-4 hover:bg-white/[0.04] transition-all group">
                <div className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-white/40" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{doc.file_name}</p>
                  <p className="text-xs text-white/30 mt-0.5">
                    {DOC_TYPE_LABELS[doc.doc_type] || doc.doc_type}
                    {doc.year && ` · ${doc.year}`}
                    {doc.page_count && ` · ${doc.page_count} pages`}
                    {` · Added ${formatDate(doc.created_at)}`}
                  </p>
                </div>
                <span className="text-xs text-white/20 group-hover:text-white/50 transition-colors">View ↗</span>
              </div>
            </a>
          ))}
        </div>
      )}

      <p className="text-xs text-white/20 mt-6 leading-relaxed">
        Adding more documents (e.g. multiple years of annual reports, investor presentations) improves analysis quality. Use "Re-analyse" in the header to regenerate research after uploading.
      </p>
    </div>
  );
}
