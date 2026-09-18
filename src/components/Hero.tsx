"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Search, AlertTriangle, Lock, Zap, Globe } from "lucide-react";
import { isValidUrl } from "@/utils/helpers";

interface HeroProps { onScan:(url:string)=>void; isScanning:boolean; }

const STATS = [
  {label:"Checks",value:"25+",icon:Shield},
  {label:"Headers",value:"10+",icon:Lock},
  {label:"Speed",value:"<15s",icon:Zap},
  {label:"Free",value:"100%",icon:Globe},
];

export default function Hero({onScan,isScanning}:HeroProps) {
  const [url,setUrl] = useState("");
  const [error,setError] = useState("");

  function handleSubmit(e:React.FormEvent) {
    e.preventDefault();
    const t = url.trim();
    if (!t){setError("Please enter a URL.");return;}
    if (!isValidUrl(t)){setError("Enter a valid URL e.g. example.com");return;}
    setError(""); onScan(t);
  }

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16 px-4">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(255,255,255,0.04),transparent)]" />
      </div>

      {/* Left accent line */}
      <div className="fixed left-0 top-0 bottom-0 w-0.5 bg-white z-40" />

      <div className="relative z-10 w-full max-w-3xl mx-auto text-center">

        {/* Badge */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.5}}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/15 bg-white/5 mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse flex-shrink-0" />
          <span className="font-mono text-[10px] sm:text-xs text-white/60 tracking-widest uppercase">Real-Time Security Analysis Engine</span>
        </motion.div>

        {/* Headline */}
        <motion.h1 initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.6,delay:0.1}}
          className="font-orbitron text-3xl sm:text-5xl lg:text-6xl font-black mb-4 leading-tight">
          <span className="text-white">SCAN YOUR</span><br/>
          <span className="text-white/40">WEBSITE SECURITY</span><br/>
          <span className="text-white">IN SECONDS</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.6,delay:0.2}}
          className="text-white/40 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed px-2">
          Instantly detect vulnerabilities, missing security headers, SSL issues, cookie misconfigurations and more.
          Get a professional security report — completely free.
        </motion.p>

        {/* Scan Form */}
        <motion.div id="scanner" initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.6,delay:0.3}} className="w-full">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <div className="flex items-center flex-1 glass rounded-lg border border-white/10 focus-within:border-white/30 transition-all duration-300 focus-within:shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                <div className="flex-shrink-0 pl-3 pr-2"><Globe className="w-4 h-4 text-white/30" /></div>
                <input type="url" inputMode="url" value={url} onChange={e=>{setUrl(e.target.value);setError("");}}
                  placeholder="example.com" autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false}
                  disabled={isScanning}
                  className="flex-1 bg-transparent py-3.5 pr-3 text-white placeholder-white/20 font-mono text-sm outline-none min-w-0 w-full" />
              </div>
              <button type="submit" disabled={isScanning}
                className="flex items-center justify-center gap-2 bg-white text-black font-mono text-sm font-bold uppercase tracking-wider rounded-lg px-6 py-3.5 hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex-shrink-0">
                {isScanning?(
                  <><div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin flex-shrink-0"/>Scanning...</>
                ):(
                  <><Search className="w-4 h-4 flex-shrink-0"/>Scan Now</>
                )}
              </button>
            </div>
            {error&&(
              <motion.div initial={{opacity:0,y:-5}} animate={{opacity:1,y:0}} className="mt-2 flex items-center gap-1.5 text-xs text-white/50">
                <AlertTriangle className="w-3 h-3 flex-shrink-0"/>{error}
              </motion.div>
            )}
          </form>

          {/* Example URLs */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-white/30 font-mono">Try:</span>
            {["google.com","github.com","wikipedia.org","shopify.com"].map(site=>(
              <button key={site} onClick={()=>{setUrl(site);setError("");}} disabled={isScanning}
                className="px-2 py-1 rounded border border-white/10 text-white/30 hover:text-white hover:border-white/30 transition-colors font-mono disabled:opacity-50">
                {site}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.6,delay:0.5}}
          className="grid grid-cols-4 gap-2 sm:gap-4 mt-10 w-full">
          {STATS.map(({label,value,icon:Icon},i)=>(
            <motion.div key={label} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.5+i*0.1}}
              className="flex flex-col items-center gap-1 p-2 sm:p-3 glass rounded-lg border border-white/8">
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/50"/>
              <span className="font-orbitron text-sm sm:text-lg font-bold text-white">{value}</span>
              <span className="text-[9px] sm:text-xs text-white/30 text-center leading-tight">{label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll hint */}
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.5}} className="mt-10 flex flex-col items-center gap-2">
          <span className="text-xs text-white/20 font-mono uppercase tracking-widest">Scroll to learn more</span>
          <motion.div animate={{y:[0,6,0]}} transition={{duration:1.5,repeat:Infinity}}
            className="w-4 h-6 border border-white/15 rounded-full flex items-start justify-center pt-1">
            <div className="w-1 h-1.5 bg-white/40 rounded-full"/>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
