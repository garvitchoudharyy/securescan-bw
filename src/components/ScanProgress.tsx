"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Terminal, Wifi } from "lucide-react";
import { getScanMessages } from "@/utils/helpers";

export default function ScanProgress({url}:{url:string}) {
  const messages = getScanMessages();
  const [cur,setCur] = useState(0);
  const [done,setDone] = useState<number[]>([]);
  const [progress,setProgress] = useState(0);

  useEffect(()=>{
    const iv = setInterval(()=>{
      setCur(prev=>{
        const next=prev+1;
        if(next<messages.length){setDone(d=>[...d,prev]);setProgress(Math.round((next/messages.length)*95));return next;}
        return prev;
      });
    },12000/messages.length);
    return()=>clearInterval(iv);
  },[messages.length]);

  return (
    <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}} className="w-full max-w-2xl mx-auto">
      <div className="scan-line-animation"/>
      <div className="glass rounded-xl border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/8 bg-white/3">
          <motion.div animate={{rotate:360}} transition={{duration:3,repeat:Infinity,ease:"linear"}} className="w-8 h-8 relative">
            <div className="absolute inset-0 rounded-full border border-white/20"/>
            <Shield className="absolute inset-0 m-auto w-4 h-4 text-white"/>
          </motion.div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-white/60 uppercase tracking-wider">Scanning in progress</span>
              <div className="flex gap-1">{[0,1,2].map(i=>(
                <motion.div key={i} className="w-1 h-1 rounded-full bg-white" animate={{opacity:[0.2,1,0.2]}} transition={{duration:1.2,repeat:Infinity,delay:i*0.2}}/>
              ))}</div>
            </div>
            <div className="text-xs text-white/30 mt-0.5 font-mono truncate">Target: {url}</div>
          </div>
          <div className="flex items-center gap-1.5"><Wifi className="w-3 h-3 text-white/50"/><span className="text-xs font-mono text-white/50">LIVE</span></div>
        </div>

        {/* Progress bar */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-white/30">Progress</span>
            <span className="text-xs font-mono text-white">{progress}%</span>
          </div>
          <div className="h-0.5 bg-white/8 rounded-full overflow-hidden">
            <motion.div className="h-full bg-white rounded-full" initial={{width:"0%"}} animate={{width:`${progress}%`}} transition={{duration:0.5}}/>
          </div>
        </div>

        {/* Terminal */}
        <div className="px-6 py-4">
          <div className="flex items-center gap-2 mb-3"><Terminal className="w-3 h-3 text-white/30"/><span className="text-xs font-mono text-white/30 uppercase tracking-wider">Scan Log</span></div>
          <div className="bg-black/60 rounded-lg border border-white/8 p-4 font-mono text-xs space-y-2 max-h-56 overflow-y-auto">
            <AnimatePresence>
              {messages.map((msg,i)=>{
                if(i>cur+1)return null;
                const isDone=done.includes(i);const isCur=i===cur;
                return(
                  <motion.div key={i} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{duration:0.3}}
                    className={`flex items-center gap-2 ${isDone?"text-white/40":isCur?"text-white":"text-white/15"}`}>
                    <span className="flex-shrink-0 w-3">
                      {isDone?<span className="text-white/40">✓</span>:isCur?<motion.span animate={{opacity:[1,0,1]}} transition={{duration:0.8,repeat:Infinity}} className="text-white">▶</motion.span>:<span className="text-white/15">○</span>}
                    </span>
                    <span className={isCur?"cursor-blink":""}>{msg}</span>
                    {isDone&&<span className="ml-auto text-white/20 text-[10px]">OK</span>}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Check tags */}
        <div className="px-6 pb-5">
          <div className="grid grid-cols-3 gap-2">
            {[["Headers",progress>20],["SSL/TLS",progress>30],["Cookies",progress>45],["CSP",progress>55],["Robots",progress>65],["Tech Stack",progress>80]].map(([label,done2])=>(
              <div key={label as string} className={`flex items-center gap-1.5 px-2 py-1.5 rounded border text-xs font-mono transition-all duration-500 ${done2?"border-white/20 bg-white/5 text-white":"border-white/8 bg-white/2 text-white/20"}`}>
                <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${done2?"bg-white":"bg-white/15"}`}/>{label}
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="text-center text-xs text-white/20 mt-4 font-mono">This may take up to 15 seconds. Please do not close this page.</p>
    </motion.div>
  );
}
