"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Menu, X } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <motion.nav initial={{y:-80,opacity:0}} animate={{y:0,opacity:1}} transition={{duration:0.5}}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled?"glass-strong border-b border-bw-border":"bg-transparent"}`}>
      {/* Top white line */}
      <div className="h-0.5 bg-white w-full" />
      <div className="w-full px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <a href="#" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white/10 border border-white/30 rounded flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-orbitron font-black text-sm text-white tracking-widest">SECURESCAN<span className="text-white/40 ml-1 text-xs">PRO</span></span>
          </a>
          <div className="hidden md:flex items-center gap-8">
            {[["#scanner","Scanner"],["#how-it-works","How It Works"],["#features","Features"]].map(([href,label])=>(
              <a key={href} href={href} className="text-xs font-mono text-white/40 hover:text-white transition-colors uppercase tracking-widest">{label}</a>
            ))}
          </div>
          <div className="hidden md:block">
            <a href="#scanner" className="btn-bw btn-bw-primary text-xs py-2 px-5">Scan Now</a>
          </div>
          <button onClick={()=>setOpen(!open)} className="md:hidden p-2 text-white/40 hover:text-white transition-colors">
            {open?<X className="w-5 h-5"/>:<Menu className="w-5 h-5"/>}
          </button>
        </div>
      </div>
      {open&&(
        <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} className="md:hidden glass-strong border-t border-bw-border">
          <div className="px-4 py-4 space-y-1">
            {[["#scanner","Scanner"],["#how-it-works","How It Works"],["#features","Features"]].map(([href,label])=>(
              <a key={href} href={href} onClick={()=>setOpen(false)} className="block py-2.5 text-sm font-mono text-white/40 hover:text-white transition-colors border-b border-bw-border last:border-0">{label}</a>
            ))}
            <a href="#scanner" onClick={()=>setOpen(false)} className="btn-bw btn-bw-primary w-full justify-center mt-3 text-sm">Scan Now — Free</a>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
