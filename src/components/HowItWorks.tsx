"use client";
import { motion } from "framer-motion";
import { Globe, Search, FileBarChart, Download } from "lucide-react";

const STEPS=[
  {num:"01",icon:Globe,title:"Enter Target URL",desc:"Paste any website URL. We support HTTP and HTTPS across all domains."},
  {num:"02",icon:Search,title:"Real-Time Analysis",desc:"Our engine sends live HTTP requests, analyzing headers, SSL, cookies and content."},
  {num:"03",icon:FileBarChart,title:"Vulnerability Detection",desc:"Each response is evaluated against OWASP standards and classified by severity."},
  {num:"04",icon:Download,title:"Download PDF Report",desc:"Get a professional report with your score, all findings and fix recommendations."},
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(255,255,255,0.02),transparent)] pointer-events-none"/>
      <div className="max-w-6xl mx-auto relative">
        <div className="text-center mb-16">
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/3 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-white/50"/><span className="font-mono text-xs text-white/40 tracking-wider uppercase">Process</span>
          </motion.div>
          <motion.h2 initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:0.1}}
            className="font-orbitron text-3xl sm:text-4xl font-bold text-white mb-4">HOW IT WORKS</motion.h2>
          <motion.p initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:0.2}}
            className="text-white/30 max-w-xl mx-auto">From URL input to full security report in under 15 seconds. No signup, no API keys, no limits.</motion.p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"/>
          {STEPS.map(({num,icon:Icon,title,desc},i)=>(
            <motion.div key={num} initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.12}}
              className="relative flex flex-col items-center text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full border border-white/10 bg-white/3 flex items-center justify-center relative transition-all duration-300 group-hover:border-white/25 group-hover:bg-white/6 group-hover:scale-110">
                  <Icon className="w-8 h-8 text-white/50"/>
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center text-[10px] font-mono font-bold text-black">{i+1}</div>
                </div>
              </div>
              <h3 className="font-orbitron text-sm font-bold text-white mb-2 uppercase tracking-wide">{title}</h3>
              <p className="text-xs text-white/30 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
