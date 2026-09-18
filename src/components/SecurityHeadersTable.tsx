"use client";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Info } from "lucide-react";
import type { HeaderCheck } from "@/utils/scanner";
import { getSeverityColor } from "@/utils/helpers";

export default function SecurityHeadersTable({headers}:{headers:HeaderCheck[]}) {
  const present=headers.filter(h=>h.present).length;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-mono mb-4">
        <span className="text-white/30">{present}/{headers.length} headers configured</span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-white"/><span className="text-white/30">Present</span></div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-white/20"/><span className="text-white/30">Missing</span></div>
        </div>
      </div>
      <div className="space-y-2">
        {headers.map((h,i)=>{
          const sc=getSeverityColor(h.severity);
          return (
            <motion.div key={h.name} initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:i*0.04}}
              className={`rounded-lg border overflow-hidden transition-all ${h.present?"border-white/10 bg-white/3":"border-white/6 bg-white/2"}`}>
              <div className="flex items-start gap-3 px-4 py-3">
                <div className="flex-shrink-0 mt-0.5">{h.present?<CheckCircle className="w-4 h-4 text-white/60"/>:<XCircle className="w-4 h-4 text-white/20"/>}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="text-xs font-mono text-white/80">{h.name}</code>
                    {!h.present&&<span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase tracking-wider ${sc.badge}`}>{h.severity}</span>}
                  </div>
                  {h.present&&h.value&&<code className="block text-xs text-white/30 mt-1 font-mono truncate">{h.value.length>80?h.value.slice(0,80)+"...":h.value}</code>}
                  {!h.present&&<p className="text-xs text-white/30 mt-1 flex items-start gap-1"><Info className="w-3 h-3 flex-shrink-0 mt-0.5 text-white/20"/>{h.recommendation}</p>}
                </div>
                <div className="flex-shrink-0"><span className={`text-xs font-mono font-bold ${h.present?"text-white/50":"text-white/20"}`}>{h.present?"PASS":"FAIL"}</span></div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
