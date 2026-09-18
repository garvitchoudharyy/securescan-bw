"use client";
import { Shield, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/6 bg-white/2 mt-20">
      {/* Top white line */}
      <div className="h-px bg-white w-full"/>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-white/8 border border-white/15 rounded flex items-center justify-center"><Shield className="w-4 h-4 text-white"/></div>
              <span className="font-orbitron font-black text-sm text-white tracking-widest">SECURESCAN<span className="text-white/30 ml-1 text-xs">PRO</span></span>
            </div>
            <p className="text-xs text-white/25 leading-relaxed max-w-xs">Professional website security scanning tool. Detect vulnerabilities, analyze security headers and get actionable fix recommendations — free.</p>
          </div>
          <div>
            <h4 className="text-xs font-mono text-white/25 uppercase tracking-widest mb-4">Security Checks</h4>
            <ul className="space-y-2">
              {["SSL/TLS Certificate","Security Headers (HSTS, CSP, etc.)","Cookie Security Flags","Clickjacking Protection","Technology Detection","Information Disclosure","robots.txt Analysis"].map(item=>(
                <li key={item} className="text-xs text-white/20 flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-white/20"/>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-mono text-white/25 uppercase tracking-widest mb-4">Security Resources</h4>
            <ul className="space-y-2">
              {[["OWASP Top 10","https://owasp.org/www-project-top-ten/"],["Mozilla Security Guidelines","https://infosec.mozilla.org/guidelines/web_security"],["Security Headers Reference","https://securityheaders.com/"],["Content Security Policy","https://content-security-policy.com/"],["HSTS Preload List","https://hstspreload.org/"],["SSL Labs","https://www.ssllabs.com/ssltest/"]].map(([label,href])=>(
                <li key={label}><a href={href} target="_blank" rel="noopener noreferrer" className="text-xs text-white/20 hover:text-white transition-colors flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-white/20"/>{label}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="section-divider mb-6"/>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-white/20 font-mono text-center sm:text-left">© {new Date().getFullYear()} SecureScan Pro. Open source. No data stored. No tracking.</div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-white/30">
            Made with <Heart className="w-3 h-3 text-white fill-white inline"/> by{" "}
            <span className="text-white font-semibold">Garvit Choudhary · Aditya · Radhika · Riddhi</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white/20"><div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"/><span className="font-mono">All systems operational</span></div>
        </div>
        <div className="mt-6 p-4 rounded-lg border border-white/6 bg-white/2">
          <p className="text-[10px] text-white/15 text-center leading-relaxed font-mono">⚠ DISCLAIMER: SecureScan Pro is intended for security research and testing of websites you own or have explicit permission to scan. Unauthorized scanning may violate applicable laws. This tool performs passive analysis only and does not exploit vulnerabilities.</p>
        </div>
      </div>
    </footer>
  );
}
