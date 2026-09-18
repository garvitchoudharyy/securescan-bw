"use client";
import { useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ScanResult } from "@/utils/scanner";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ScanProgress from "@/components/ScanProgress";
import ScanResults from "@/components/ScanResults";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import Footer from "@/components/Footer";

type State = "idle" | "scanning" | "results" | "error";

export default function HomePage() {
  const [state, setState] = useState<State>("idle");
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  async function handleScan(u: string) {
    setUrl(u); setState("scanning"); setError("");
    setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: u }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Scan failed."); setState("error"); return; }
      setResult(data); setState("results");
      setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
    } catch {
      setError("Unable to complete the scan. Please check your connection and try again.");
      setState("error");
    }
  }

  function handleRescan() {
    setResult(null); setState("idle"); setUrl("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence>
          {(state === "idle" || state === "scanning" || state === "error") && (
            <motion.div key="hero" initial={false} exit={{ opacity: 0 }}>
              <Hero onScan={handleScan} isScanning={state === "scanning"} />
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={ref} className="px-4 py-8 max-w-6xl mx-auto">
          <AnimatePresence mode="wait">

            {state === "scanning" && (
              <motion.div key="progress" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex justify-center">
                <ScanProgress url={url} />
              </motion.div>
            )}

            {state === "results" && result && (
              <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="mb-8 text-center">
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/3 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                    <span className="font-mono text-xs text-white/40 tracking-wider uppercase">Scan Complete</span>
                  </motion.div>
                  <h2 className="font-orbitron text-2xl sm:text-3xl font-bold text-white">Security Report</h2>
                </div>
                <ScanResults result={result} onRescan={handleRescan} />
              </motion.div>
            )}

            {state === "error" && (
              <motion.div key="error" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex justify-center">
                <div className="w-full max-w-lg glass rounded-xl border border-white/10 p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/15 flex items-center justify-center mx-auto mb-5">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <h3 className="font-orbitron text-lg font-bold text-white mb-3">Scan Failed</h3>
                  <p className="text-sm text-white/30 mb-6 leading-relaxed">{error}</p>
                  <div className="text-left bg-white/2 rounded-lg border border-white/6 p-4 mb-6 space-y-2">
                    <p className="text-xs font-mono text-white/25 uppercase tracking-wider mb-2">Common reasons:</p>
                    {["The website may be blocking automated requests","The domain doesn't exist or has no web server","The scan timed out — server too slow to respond","The URL may be malformed — try adding https://"].map(r => (
                      <div key={r} className="flex items-start gap-2 text-xs text-white/25"><span className="text-white/20 mt-0.5">·</span>{r}</div>
                    ))}
                  </div>
                  <button onClick={handleRescan} className="btn-bw btn-bw-primary w-full justify-center">Try Again</button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        <AnimatePresence>
          {(state === "idle" || state === "error") && (
            <motion.div key="info" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="section-divider max-w-6xl mx-auto" />
              <HowItWorks />
              <div className="section-divider max-w-6xl mx-auto" />
              <Features />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
