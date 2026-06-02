import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function scoreToColour(score: number, max = 10): string {
  const pct = score / max;
  if (pct >= 0.75) return "text-emerald-400";
  if (pct >= 0.5) return "text-amber-400";
  return "text-red-400";
}

export function scoreToRingColour(score: number, max = 10): string {
  const pct = score / max;
  if (pct >= 0.75) return "ring-emerald-500";
  if (pct >= 0.5) return "ring-amber-500";
  return "ring-red-500";
}

export function severityBadge(severity: "High" | "Medium" | "Low"): string {
  switch (severity) {
    case "High":
      return "bg-red-500/15 text-red-400 border border-red-500/30";
    case "Medium":
      return "bg-amber-500/15 text-amber-400 border border-amber-500/30";
    case "Low":
      return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30";
  }
}

export function ratingBadge(rating: string): string {
  switch (rating) {
    case "Excellent":
      return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30";
    case "Good":
      return "bg-sky-500/15 text-sky-400 border border-sky-500/30";
    case "Average":
      return "bg-amber-500/15 text-amber-400 border border-amber-500/30";
    case "Poor":
      return "bg-red-500/15 text-red-400 border border-red-500/30";
    default:
      return "bg-zinc-500/15 text-zinc-400 border border-zinc-500/30";
  }
}
