import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Severity } from "./scanner";

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function getSeverityColor(severity: Severity) {
  switch (severity) {
    case "critical": return { text:"text-white", bg:"bg-white/10", border:"border-white/40", badge:"bg-white/10 text-white border-white/30", dot:"bg-white" };
    case "high":     return { text:"text-white/80", bg:"bg-white/8", border:"border-white/30", badge:"bg-white/8 text-white/80 border-white/25", dot:"bg-white/80" };
    case "medium":   return { text:"text-white/60", bg:"bg-white/5", border:"border-white/20", badge:"bg-white/5 text-white/60 border-white/15", dot:"bg-white/60" };
    case "low":      return { text:"text-white/40", bg:"bg-white/3", border:"border-white/15", badge:"bg-white/3 text-white/40 border-white/10", dot:"bg-white/40" };
    default:         return { text:"text-white/30", bg:"bg-white/2", border:"border-white/10", badge:"bg-white/2 text-white/30 border-white/8",  dot:"bg-white/30" };
  }
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "#ffffff";
  if (score >= 60) return "#cccccc";
  if (score >= 40) return "#999999";
  if (score >= 20) return "#666666";
  return "#444444";
}

export function getRiskLevelColor(risk: string) {
  switch (risk.toLowerCase()) {
    case "excellent": return { text:"text-white",     bg:"bg-white/15" };
    case "low":       return { text:"text-white/80",  bg:"bg-white/10" };
    case "medium":    return { text:"text-white/60",  bg:"bg-white/8"  };
    case "high":      return { text:"text-white/50",  bg:"bg-white/6"  };
    case "critical":  return { text:"text-white/40",  bg:"bg-white/5"  };
    default:          return { text:"text-white/30",  bg:"bg-white/3"  };
  }
}

export function formatDuration(ms: number): string { return ms < 1000 ? `${ms}ms` : `${(ms/1000).toFixed(1)}s`; }
export function formatDate(iso: string): string { return new Date(iso).toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"}); }
export function truncate(str: string, maxLen: number): string { return str.length<=maxLen?str:str.slice(0,maxLen)+"…"; }
export function extractDomain(url: string): string { try{ return new URL(url).hostname; }catch{ return url; } }
export function isValidUrl(url: string): boolean { try{ const n=url.startsWith("http")?url:"https://"+url; const p=new URL(n); return p.protocol==="http:"||p.protocol==="https:"; }catch{ return false; } }
export function gradeInfo(grade: string) {
  switch(grade){
    case "A+": return {label:"A+",description:"Excellent security"};
    case "A":  return {label:"A", description:"Strong security"};
    case "B":  return {label:"B", description:"Good, minor issues"};
    case "C":  return {label:"C", description:"Average, needs work"};
    case "D":  return {label:"D", description:"Poor, significant risks"};
    case "F":  return {label:"F", description:"Critical vulnerabilities"};
    default:   return {label:"?", description:"Unknown"};
  }
}
export function getScanMessages(): string[] {
  return [
    "Initializing security scanner...","Resolving DNS and connecting...",
    "Checking HTTPS and SSL certificate...","Analyzing HTTP response headers...",
    "Scanning for missing security headers...","Analyzing Content-Security-Policy...",
    "Checking cookie security flags...","Testing clickjacking protections...",
    "Detecting technology stack...","Fetching robots.txt and sitemap...",
    "Probing for sensitive path exposure...","Scanning for information disclosure...",
    "Extracting and analyzing emails...","Calculating security score...",
    "Generating vulnerability report...","Finalizing results...",
  ];
}
