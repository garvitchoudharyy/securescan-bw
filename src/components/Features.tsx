"use client";
import { motion } from "framer-motion";
import { Lock,Shield,Eye,Zap,Cookie,Wifi,Server,Code,FileText,Globe,Mail,AlertTriangle,Database,BarChart3,FileSearch,CheckCircle } from "lucide-react";

const FEATURES=[
  {icon:Lock,title:"SSL/TLS Certificate Check",desc:"Verifies HTTPS is active and analyzes transport layer security."},
  {icon:Shield,title:"Security Headers Analysis",desc:"Checks 8+ critical HTTP security headers against OWASP standards."},
  {icon:Eye,title:"Content Security Policy",desc:"Analyzes CSP directives and flags dangerous values like unsafe-inline."},
  {icon:Zap,title:"Clickjacking Detection",desc:"Tests for X-Frame-Options and frame-ancestors CSP directive."},
  {icon:Cookie,title:"Cookie Security Audit",desc:"Verifies Secure, HttpOnly and SameSite flags on all cookies."},
  {icon:Wifi,title:"HTTPS Enforcement",desc:"Tests HTTP-to-HTTPS redirect and HSTS header configuration."},
  {icon:Server,title:"Server Info Exposure",desc:"Detects version disclosure via Server and X-Powered-By headers."},
  {icon:Code,title:"Technology Detection",desc:"Fingerprints 20+ technologies from headers and page source patterns."},
  {icon:FileText,title:"Robots.txt Analysis",desc:"Scans robots.txt for sensitive path disclosures to crawlers."},
  {icon:Globe,title:"Sitemap Discovery",desc:"Checks for sitemap.xml availability and indexes found URLs."},
  {icon:Mail,title:"Email Exposure Detection",desc:"Extracts email addresses visible in page source code."},
  {icon:AlertTriangle,title:"XSS Risk Assessment",desc:"Evaluates CSP strength and identifies XSS risk vectors."},
  {icon:Database,title:"Sensitive Path Probing",desc:"Tests common sensitive paths like /.env and /.git/config."},
  {icon:BarChart3,title:"Security Score & Grade",desc:"Weighted scoring across 5 categories with A+ to F grading."},
  {icon:FileSearch,title:"PDF Report Generation",desc:"Professional downloadable report with findings and fix steps."},
  {icon:CheckCircle,title:"Best Practices Checklist",desc:"10-point checklist of security best practices with pass/fail status."},
];

export default function Features() {
  return (
    <section id="features" className="py-24 px-4 relative">
      <div className="absolute inset-0 hex-pattern opacity-20 pointer-events-none"/>
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/3 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse"/><span className="font-mono text-xs text-white/40 tracking-wider uppercase">What We Check</span>
          </motion.div>
          <motion.h2 initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:0.1}}
            className="font-orbitron text-3xl sm:text-4xl font-bold text-white mb-4">COMPREHENSIVE SECURITY CHECKS</motion.h2>
          <motion.p initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:0.2}}
            className="text-white/30 max-w-2xl mx-auto">Every scan performs {FEATURES.length} real security checks. No simulated data — actual HTTP requests, actual findings.</motion.p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(({icon:Icon,title,desc},i)=>(
            <motion.div key={title} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:(i%4)*0.08}}
              whileHover={{y:-3,transition:{duration:0.2}}}
              className="glass rounded-xl border border-white/6 p-5 group cursor-default hover:border-white/15 transition-colors duration-300">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-white/5 border border-white/8 transition-all duration-300 group-hover:bg-white/10">
                <Icon className="w-5 h-5 text-white/40 group-hover:text-white/70 transition-colors"/>
              </div>
              <h3 className="text-sm font-semibold text-white/70 mb-2 leading-snug group-hover:text-white transition-colors">{title}</h3>
              <p className="text-xs text-white/25 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="mt-16 text-center">
          <p className="text-white/20 text-sm mb-6">All checks performed in real-time. No API keys. No account required.</p>
          <a href="#scanner" className="btn-bw btn-bw-primary inline-flex"><Shield className="w-4 h-4"/>Start Free Scan</a>
        </motion.div>
      </div>
    </section>
  );
}
