"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Download, RefreshCw, CheckCircle, XCircle,
  Globe, Cookie, Code, FileText, AlertTriangle, Lock,
  Info, Wifi, Eye, Zap
} from "lucide-react";
import type { ScanResult } from "@/utils/scanner";
import { getSeverityColor, getScoreColor, formatDate, formatDuration, extractDomain } from "@/utils/helpers";
import ScoreGauge from "./ScoreGauge";
import VulnerabilityCard from "./VulnerabilityCard";
import SecurityHeadersTable from "./SecurityHeadersTable";
import { VulnerabilityPieChart, CategoryBarChart, CategoryRadarChart } from "./SecurityCharts";

type Tab = "overview" | "vulnerabilities" | "headers" | "cookies" | "tech" | "details";

export default function ScanResults({ result, onRescan }: { result: ScanResult; onRescan: () => void }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [pdf, setPdf] = useState(false);
  const [filt, setFilt] = useState("all");

  const { summary, vulnerabilities, securityHeaders, cookies, technologies, categoryScores } = result;

  const sevOrd: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
  const sorted = [...vulnerabilities].sort((a, b) => sevOrd[a.severity] - sevOrd[b.severity]);
  const filtered = filt === "all" ? sorted : sorted.filter(v => v.severity === filt);

  async function dlPDF() {
    setPdf(true);
    try {
      const { generatePDFReport } = await import("@/utils/pdfGenerator");
      await generatePDFReport(result);
    } catch {
      alert("PDF generation failed.");
    } finally {
      setPdf(false);
    }
  }

  const tabs = [
    { id: "overview" as Tab, label: "Overview", icon: Shield },
    { id: "vulnerabilities" as Tab, label: `Vulns (${summary.totalVulnerabilities})`, icon: AlertTriangle },
    { id: "headers" as Tab, label: "Headers", icon: Lock },
    { id: "cookies" as Tab, label: `Cookies (${cookies.length})`, icon: Cookie },
    { id: "tech" as Tab, label: "Tech Stack", icon: Code },
    { id: "details" as Tab, label: "Details", icon: Info },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-6xl mx-auto space-y-6"
    >
      {/* Top bar */}
      <div className="glass rounded-xl border border-white/8 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
            <Globe className="w-5 h-5 text-white/60" />
          </div>
          <div>
            <div className="font-mono text-sm text-white font-medium">{extractDomain(result.url)}</div>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs text-white/30 font-mono">{formatDate(result.scannedAt)}</span>
              <span className="text-xs text-white/20">·</span>
              <span className="text-xs text-white/30 font-mono">{formatDuration(result.scanDuration)}</span>
              <span className="text-xs text-white/20">·</span>
              <span className={`text-xs font-mono font-bold ${result.isHttps ? "text-white/60" : "text-white/20"}`}>
                {result.isHttps ? "HTTPS" : "HTTP"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={onRescan} className="btn-bw text-xs py-2 px-4 flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5" />
            New Scan
          </button>
          <button onClick={dlPDF} disabled={pdf} className="btn-bw btn-bw-primary text-xs py-2 px-4 flex items-center gap-2 disabled:opacity-60">
            {pdf ? (
              <div className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            {pdf ? "Generating..." : "Download PDF"}
          </button>
        </div>
      </div>

      {/* Score section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass rounded-xl border border-white/8 p-6 flex flex-col items-center justify-center">
          <div className="text-xs font-mono text-white/25 uppercase tracking-widest mb-6">Security Score</div>
          <ScoreGauge score={result.overallScore} grade={result.grade} riskLevel={result.riskLevel} size={180} />
        </div>
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3">
          {[
            { label: "Critical", count: summary.critical, shade: "bg-white/8 border-white/30" },
            { label: "High", count: summary.high, shade: "bg-white/5 border-white/20" },
            { label: "Medium", count: summary.medium, shade: "bg-white/3 border-white/12" },
            { label: "Low", count: summary.low, shade: "bg-white/2 border-white/8" },
          ].map(({ label, count, shade }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 + 0.3 }}
              className={`rounded-xl border p-4 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all hover:scale-105 ${shade}`}
              onClick={() => { setFilt(label.toLowerCase()); setTab("vulnerabilities"); }}
            >
              <div className="font-orbitron text-3xl font-black text-white">{count}</div>
              <div className="text-xs font-mono uppercase tracking-wider text-white/40">{label}</div>
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="rounded-xl border border-white/10 bg-white/3 p-4 flex flex-col items-center justify-center gap-1 sm:col-span-2 xl:col-span-2"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-white/50" />
              <span className="font-orbitron text-2xl font-black text-white">
                {summary.passedChecks}/{summary.totalChecks}
              </span>
            </div>
            <div className="text-xs font-mono text-white/30 uppercase tracking-wider">Checks Passed</div>
            <div className="w-full h-0.5 bg-white/8 rounded-full mt-1 overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(summary.passedChecks / summary.totalChecks) * 100}%` }}
                transition={{ duration: 1, delay: 0.8 }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Quick status */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "HTTPS", value: result.isHttps, icon: Lock },
          { label: "HSTS", value: result.hasHSTS, icon: Shield },
          { label: "CSP", value: result.hasCSP, icon: Eye },
          { label: "Anti-Clickjack", value: result.clickjackingProtection, icon: Zap },
          { label: "X-Content-Type", value: result.hasXContentTypeOptions, icon: FileText },
          { label: "HTTPS Redirect", value: result.httpRedirectsToHttps, icon: Wifi },
        ].map(({ label, value, icon: Icon }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-lg border p-3 flex flex-col items-center gap-1.5 text-center transition-colors ${
              value ? "border-white/15 bg-white/5" : "border-white/5 bg-white/2"
            }`}
          >
            <Icon className={`w-4 h-4 ${value ? "text-white/70" : "text-white/15"}`} />
            <div className={`text-[10px] font-mono uppercase tracking-wider ${value ? "text-white/60" : "text-white/20"}`}>
              {label}
            </div>
            <div className={`text-[10px] font-bold font-mono ${value ? "text-white/70" : "text-white/20"}`}>
              {value ? "PASS" : "FAIL"}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="glass rounded-xl border border-white/8 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-white/6 scrollbar-none">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-4 py-3.5 text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-all flex-shrink-0 border-b-2 ${
                tab === id
                  ? "border-white text-white bg-white/5"
                  : "border-transparent text-white/25 hover:text-white/60"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">

            {/* OVERVIEW */}
            {tab === "overview" && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-xs font-mono text-white/25 uppercase tracking-widest mb-4">Vulnerability Distribution</h3>
                    <VulnerabilityPieChart summary={summary} />
                  </div>
                  <div>
                    <h3 className="text-xs font-mono text-white/25 uppercase tracking-widest mb-4">Category Scores</h3>
                    <CategoryBarChart categoryScores={categoryScores} />
                  </div>
                  <div>
                    <h3 className="text-xs font-mono text-white/25 uppercase tracking-widest mb-4">Security Radar</h3>
                    <CategoryRadarChart categoryScores={categoryScores} />
                  </div>
                </div>

                <div className="section-divider" />

                <div>
                  <h3 className="text-xs font-mono text-white/25 uppercase tracking-widest mb-5">Category Breakdown</h3>
                  <div className="space-y-4">
                    {[
                      { label: "Security Headers", score: categoryScores.headers, desc: `${securityHeaders.filter(h => h.present).length}/${securityHeaders.length} present` },
                      { label: "SSL/TLS Security", score: categoryScores.ssl, desc: result.isHttps ? "HTTPS enabled" : "No HTTPS" },
                      { label: "Cookie Security", score: categoryScores.cookies, desc: `${cookies.length} cookie(s)` },
                      { label: "Content Security", score: categoryScores.content, desc: result.hasCSP ? "CSP configured" : "No CSP" },
                      { label: "Information Disclosure", score: categoryScores.information, desc: result.serverInfoExposed ? "Server info exposed" : "Minimal exposure" },
                    ].map(({ label, score, desc }, i) => {
                      const col = getScoreColor(score);
                      return (
                        <div key={label}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm text-white/70">{label}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-white/25 font-mono">{desc}</span>
                              <span className="text-sm font-mono font-bold" style={{ color: col }}>{score}%</span>
                            </div>
                          </div>
                          <div className="h-0.5 bg-white/6 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ background: col }}
                              initial={{ width: 0 }}
                              animate={{ width: `${score}%` }}
                              transition={{ duration: 0.8, delay: i * 0.1 + 0.2 }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="section-divider" />

                <div>
                  <h3 className="text-xs font-mono text-white/25 uppercase tracking-widest mb-4">Executive Summary</h3>
                  <div className="bg-white/2 rounded-lg border border-white/6 p-5 space-y-3">
                    {[
                      result.overallScore >= 80
                        ? `✅ ${extractDomain(result.url)} has strong security — score ${result.overallScore}/100 (Grade: ${result.grade}).`
                        : result.overallScore >= 60
                        ? `⚠️ ${extractDomain(result.url)} has moderate security (${result.overallScore}/100, Grade: ${result.grade}) with improvements needed.`
                        : `🚨 ${extractDomain(result.url)} has significant security gaps (${result.overallScore}/100, Grade: ${result.grade}).`,
                      `${summary.totalVulnerabilities} issue(s): ${summary.critical} critical, ${summary.high} high, ${summary.medium} medium, ${summary.low} low, ${summary.info} info.`,
                      result.isHttps
                        ? `Site uses HTTPS${result.hasHSTS ? " with HSTS enforced." : ", but HSTS is not configured."}`
                        : `⚠️ Site does NOT use HTTPS — all data is transmitted in plaintext.`,
                      result.hasCSP
                        ? `CSP is configured${result.cspValue?.includes("unsafe-inline") ? " but contains unsafe-inline." : "."}`
                        : `No Content Security Policy — XSS attacks are not mitigated.`,
                      `${securityHeaders.filter(h => h.present).length} of ${securityHeaders.length} security headers present.`,
                      technologies.length > 0
                        ? `Detected: ${technologies.map(t => t.name).join(", ")}.`
                        : "No specific technologies detected.",
                    ].map((line, i) => (
                      <p key={i} className="text-sm text-white/40 leading-relaxed">{line}</p>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-lg border border-white/8 bg-white/2 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-white/30" />
                      <span className="text-xs font-mono text-white/25 uppercase tracking-wider">robots.txt</span>
                      <span className={`ml-auto text-xs font-mono font-bold ${result.robotsTxt.found ? "text-white/60" : "text-white/20"}`}>
                        {result.robotsTxt.found ? "FOUND" : "NOT FOUND"}
                      </span>
                    </div>
                    {result.robotsTxt.found && (
                      <div className="text-xs text-white/30">
                        {result.robotsTxt.exposesSensitivePaths
                          ? <span className="text-white/50">⚠ Exposes {result.robotsTxt.sensitivePaths.length} sensitive path(s)</span>
                          : <span className="text-white/40">✓ No sensitive paths exposed</span>
                        }
                      </div>
                    )}
                  </div>
                  <div className="rounded-lg border border-white/8 bg-white/2 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="w-4 h-4 text-white/30" />
                      <span className="text-xs font-mono text-white/25 uppercase tracking-wider">sitemap.xml</span>
                      <span className={`ml-auto text-xs font-mono font-bold ${result.sitemap.found ? "text-white/60" : "text-white/30"}`}>
                        {result.sitemap.found ? "FOUND" : "NOT FOUND"}
                      </span>
                    </div>
                    <div className="text-xs text-white/30">
                      {result.sitemap.found ? "✓ Sitemap available" : "Consider adding a sitemap"}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* VULNERABILITIES */}
            {tab === "vulnerabilities" && (
              <motion.div key="vulns" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono text-white/25">Filter:</span>
                  {["all", "critical", "high", "medium", "low", "info"].map(f => {
                    const cnt = f === "all" ? summary.totalVulnerabilities : vulnerabilities.filter(v => v.severity === f).length;
                    return (
                      <button
                        key={f}
                        onClick={() => setFilt(f)}
                        className={`px-3 py-1 rounded border text-xs font-mono uppercase tracking-wider transition-all ${
                          filt === f ? "border-white/30 bg-white/10 text-white" : "border-white/8 text-white/25 hover:text-white/60"
                        }`}
                      >
                        {f} {cnt > 0 ? `(${cnt})` : ""}
                      </button>
                    );
                  })}
                </div>
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <CheckCircle className="w-12 h-12 text-white/20 mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No {filt === "all" ? "" : filt} vulnerabilities!</h3>
                    <p className="text-sm text-white/25">
                      {filt === "all" ? "Excellent! This site passed all security checks." : `No ${filt}-severity issues detected.`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filtered.map((v, i) => <VulnerabilityCard key={v.id} vuln={v} index={i} />)}
                  </div>
                )}
              </motion.div>
            )}

            {/* HEADERS */}
            {tab === "headers" && (
              <motion.div key="headers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <SecurityHeadersTable headers={securityHeaders} />
                {result.hasCSP && result.cspValue && (
                  <div className="mt-6">
                    <h3 className="text-xs font-mono text-white/25 uppercase tracking-widest mb-3">Content-Security-Policy Value</h3>
                    <div className="bg-black/40 border border-white/8 rounded-lg p-4">
                      <code className="text-xs font-mono text-white/50 break-all leading-relaxed">{result.cspValue}</code>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {result.cspValue.includes("unsafe-inline") && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-white/15 bg-white/5 text-white/50">⚠ unsafe-inline</span>
                        )}
                        {result.cspValue.includes("unsafe-eval") && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-white/15 bg-white/5 text-white/50">⚠ unsafe-eval</span>
                        )}
                        {!result.cspValue.includes("unsafe-inline") && !result.cspValue.includes("unsafe-eval") && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-white/15 bg-white/5 text-white/40">✓ No obvious weaknesses</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* COOKIES */}
            {tab === "cookies" && (
              <motion.div key="cookies" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                {cookies.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Cookie className="w-12 h-12 text-white/15 mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Cookies Detected</h3>
                    <p className="text-sm text-white/25">No Set-Cookie headers found in the response.</p>
                  </div>
                ) : (
                  <>
                    <div className="text-xs font-mono text-white/25 mb-4">{cookies.length} cookie(s) analyzed</div>
                    {cookies.map((ck, i) => (
                      <motion.div
                        key={`${ck.name}-${i}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`rounded-lg border p-4 ${ck.hasSecure && ck.hasHttpOnly && ck.hasSameSite ? "border-white/12 bg-white/3" : "border-white/6 bg-white/2"}`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Cookie className="w-4 h-4 text-white/30" />
                            <code className="text-sm font-mono text-white font-medium">{ck.name}</code>
                          </div>
                          <span className={`text-xs font-mono font-bold ${ck.hasSecure && ck.hasHttpOnly && ck.hasSameSite ? "text-white/60" : "text-white/30"}`}>
                            {ck.hasSecure && ck.hasHttpOnly && ck.hasSameSite ? "SECURE" : "ISSUES"}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { label: "Secure", ok: ck.hasSecure, desc: "HTTPS only" },
                            { label: "HttpOnly", ok: ck.hasHttpOnly, desc: "No JS access" },
                            { label: "SameSite", ok: ck.hasSameSite, desc: ck.sameSiteValue || "CSRF protection" },
                          ].map(({ label, ok, desc }) => (
                            <div key={label} className={`rounded border p-2 text-center ${ok ? "border-white/10 bg-white/4" : "border-white/4 bg-white/1"}`}>
                              <div className={`text-xs font-mono font-bold ${ok ? "text-white/60" : "text-white/20"}`}>{ok ? "✓" : "✗"} {label}</div>
                              <div className="text-[10px] text-white/20 mt-0.5">{desc}</div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </>
                )}
              </motion.div>
            )}

            {/* TECH */}
            {tab === "tech" && (
              <motion.div key="tech" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                {technologies.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Code className="w-12 h-12 text-white/15 mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Technologies Detected</h3>
                    <p className="text-sm text-white/25">Could not identify technologies from headers or source.</p>
                  </div>
                ) : (
                  <>
                    <div className="text-xs font-mono text-white/25">{technologies.length} technology/technologies identified</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {technologies.map((t, i) => (
                        <motion.div
                          key={t.name}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.06 }}
                          className="rounded-lg border border-white/8 bg-white/2 p-4 card-hover"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="text-sm font-semibold text-white">
                                {t.name}
                                {t.version && <span className="text-xs text-white/30 ml-1">v{t.version}</span>}
                              </div>
                              <div className="text-xs text-white/30 font-mono mt-0.5">{t.category}</div>
                            </div>
                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border border-white/10 ${
                              t.confidence === "high" ? "text-white/60" : t.confidence === "medium" ? "text-white/40" : "text-white/20"
                            }`}>
                              {t.confidence}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* DETAILS */}
            {tab === "details" && (
              <motion.div key="details" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div>
                  <h3 className="text-xs font-mono text-white/25 uppercase tracking-widest mb-4">HTTP Response Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: "Final URL", value: result.finalUrl },
                      { label: "Status Code", value: result.statusCode.toString() },
                      { label: "Protocol", value: result.isHttps ? "HTTPS (Secure)" : "HTTP (Insecure)" },
                      { label: "Response Time", value: formatDuration(result.responseTime) },
                      { label: "Server", value: result.serverHeader || "Not disclosed" },
                      { label: "X-Powered-By", value: result.poweredByHeader || "Not disclosed" },
                    ].map(({ label, value }) => (
                      <div key={label} className="rounded-lg border border-white/8 bg-white/2 p-3">
                        <div className="text-xs text-white/25 font-mono mb-1 uppercase tracking-wider">{label}</div>
                        <div className="text-sm text-white font-mono break-all">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {result.emailsFound.length > 0 && (
                  <div>
                    <h3 className="text-xs font-mono text-white/25 uppercase tracking-widest mb-3">Exposed Emails</h3>
                    <div className="bg-white/2 border border-white/8 rounded-lg p-4 space-y-2">
                      {result.emailsFound.map(e => (
                        <code key={e} className="block text-xs font-mono text-white/40">{e}</code>
                      ))}
                    </div>
                  </div>
                )}

                {result.sensitivePaths.length > 0 && (
                  <div>
                    <h3 className="text-xs font-mono text-white/25 uppercase tracking-widest mb-3">Sensitive Path Results</h3>
                    <div className="space-y-2">
                      {result.sensitivePaths.map(({ path, accessible, statusCode }) => (
                        <div key={path} className={`flex items-center justify-between rounded-lg border p-3 ${accessible ? "border-white/20 bg-white/5" : "border-white/6 bg-white/2"}`}>
                          <code className="text-xs font-mono text-white">{path}</code>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-white/30">{statusCode}</span>
                            <span className={`text-xs font-mono font-bold ${accessible ? "text-white/70" : "text-white/25"}`}>
                              {accessible ? "ACCESSIBLE ⚠" : "PROTECTED ✓"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-xs font-mono text-white/25 uppercase tracking-widest mb-4">Security Best Practices</h3>
                  <div className="space-y-2">
                    {[
                      { label: "Use HTTPS everywhere", pass: result.isHttps },
                      { label: "Enable HSTS with long max-age", pass: result.hasHSTS },
                      { label: "Implement Content Security Policy", pass: result.hasCSP },
                      { label: "Set X-Frame-Options (clickjacking)", pass: result.hasXFrameOptions },
                      { label: "Add X-Content-Type-Options: nosniff", pass: result.hasXContentTypeOptions },
                      { label: "Configure Referrer-Policy", pass: result.hasReferrerPolicy },
                      { label: "Secure cookies (Secure + HttpOnly + SameSite)", pass: cookies.length === 0 || cookies.every(c => c.hasSecure && c.hasHttpOnly && c.hasSameSite) },
                      { label: "Hide server version information", pass: !result.serverInfoExposed },
                      { label: "Remove X-Powered-By header", pass: !result.poweredByHeader },
                      { label: "Redirect HTTP to HTTPS", pass: result.httpRedirectsToHttps },
                    ].map(({ label, pass }) => (
                      <div key={label} className={`flex items-center gap-3 p-3 rounded-lg border ${pass ? "border-white/10 bg-white/4" : "border-white/4 bg-white/1"}`}>
                        {pass
                          ? <CheckCircle className="w-4 h-4 text-white/50 flex-shrink-0" />
                          : <XCircle className="w-4 h-4 text-white/20 flex-shrink-0" />
                        }
                        <span className={`text-sm ${pass ? "text-white/50" : "text-white/20"}`}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
