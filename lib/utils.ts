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

export function formatDateShort(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function scoreColour(score: number, max = 100): string {
  const pct = score / max;
  if (pct >= 0.70) return "#22c55e";
  if (pct >= 0.50) return "#f59e0b";
  return "#ef4444";
}

export function scoreClass(score: number, max = 100): string {
  const pct = score / max;
  if (pct >= 0.70) return "score-high";
  if (pct >= 0.50) return "score-mid";
  return "score-low";
}

export function verdictFromScore(score: number): { label: string; className: string } {
  if (score >= 75) return { label: "High Quality",        className: "verdict-high-quality" };
  if (score >= 62) return { label: "Interesting",         className: "verdict-interesting" };
  if (score >= 48) return { label: "Mixed",               className: "verdict-mixed" };
  if (score >= 35) return { label: "Weak",                className: "verdict-weak" };
  return            { label: "Avoid Further Work",        className: "verdict-avoid" };
}

export function severityClass(s: "High" | "Medium" | "Low"): string {
  if (s === "High")   return "tag tag-red";
  if (s === "Medium") return "tag tag-amber";
  return "tag tag-grey";
}

export function ratingClass(r: string): string {
  if (r === "Excellent") return "tag tag-green";
  if (r === "Good")      return "tag tag-blue";
  if (r === "Average")   return "tag tag-amber";
  return "tag tag-red";
}

// Old compat aliases
export function scoreToColour(score: number, max = 10): string {
  return scoreClass(score, max);
}
export function severityBadge(s: "High" | "Medium" | "Low"): string {
  return severityClass(s);
}
export function ratingBadge(r: string): string {
  return ratingClass(r);
}
