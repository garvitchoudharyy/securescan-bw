export type Severity = "critical" | "high" | "medium" | "low" | "info";
export interface Vulnerability { id:string;title:string;severity:Severity;category:string;description:string;impact:string;recommendation:string;references:string[];found:boolean;value?:string; }
export interface HeaderCheck { name:string;present:boolean;value?:string;severity:Severity;recommendation:string; }
export interface CookieCheck { name:string;hasSecure:boolean;hasHttpOnly:boolean;hasSameSite:boolean;sameSiteValue?:string; }
export interface TechStack { name:string;version?:string;category:string;confidence:"high"|"medium"|"low"; }
export interface ScanResult {
  url:string;scannedAt:string;scanDuration:number;overallScore:number;
  riskLevel:"Critical"|"High"|"Medium"|"Low"|"Excellent";grade:string;
  finalUrl:string;statusCode:number;responseTime:number;isHttps:boolean;httpRedirectsToHttps:boolean;
  serverHeader?:string;poweredByHeader?:string;securityHeaders:HeaderCheck[];
  ssl:{present:boolean;protocol?:string;error?:string;};cookies:CookieCheck[];
  hasCSP:boolean;cspValue?:string;hasXFrameOptions:boolean;xFrameOptionsValue?:string;
  hasHSTS:boolean;hstsValue?:string;hasXContentTypeOptions:boolean;hasReferrerPolicy:boolean;
  robotsTxt:{found:boolean;content?:string;exposesSensitivePaths:boolean;sensitivePaths:string[];};
  sitemap:{found:boolean;url?:string;};openRedirect:boolean;serverInfoExposed:boolean;
  clickjackingProtection:boolean;mixedContent:boolean;technologies:TechStack[];emailsFound:string[];
  sensitivePaths:{path:string;accessible:boolean;statusCode:number;}[];
  vulnerabilities:Vulnerability[];
  summary:{totalVulnerabilities:number;critical:number;high:number;medium:number;low:number;info:number;passedChecks:number;totalChecks:number;};
  categoryScores:{headers:number;ssl:number;cookies:number;content:number;information:number;};
}

const REQUIRED_SECURITY_HEADERS=[
  {name:"strict-transport-security",severity:"high" as Severity,recommendation:"Add: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload"},
  {name:"content-security-policy",severity:"high" as Severity,recommendation:"Implement a Content Security Policy to prevent XSS attacks."},
  {name:"x-frame-options",severity:"medium" as Severity,recommendation:"Add: X-Frame-Options: DENY or SAMEORIGIN to prevent clickjacking."},
  {name:"x-content-type-options",severity:"medium" as Severity,recommendation:"Add: X-Content-Type-Options: nosniff"},
  {name:"referrer-policy",severity:"low" as Severity,recommendation:"Add: Referrer-Policy: strict-origin-when-cross-origin"},
  {name:"permissions-policy",severity:"low" as Severity,recommendation:"Add Permissions-Policy to control browser features."},
  {name:"x-xss-protection",severity:"low" as Severity,recommendation:"Add: X-XSS-Protection: 1; mode=block"},
  {name:"cross-origin-opener-policy",severity:"low" as Severity,recommendation:"Add: Cross-Origin-Opener-Policy: same-origin"},
];

const TECH_FINGERPRINTS=[
  {name:"WordPress",category:"CMS",bodyPatterns:[/wp-content\/themes/i,/wp-includes/i]},
  {name:"Next.js",category:"Framework",headers:[{key:"x-powered-by",pattern:/next\.js/i}],bodyPatterns:[/__NEXT_DATA__/i]},
  {name:"React",category:"Framework",bodyPatterns:[/__reactFiber/i,/react-root/i]},
  {name:"Vue.js",category:"Framework",bodyPatterns:[/__vue_app__/i]},
  {name:"Angular",category:"Framework",bodyPatterns:[/ng-version/i]},
  {name:"jQuery",category:"Library",bodyPatterns:[/jquery/i]},
  {name:"Bootstrap",category:"CSS Framework",bodyPatterns:[/bootstrap\.min\.css/i]},
  {name:"Nginx",category:"Web Server",headers:[{key:"server",pattern:/nginx/i}]},
  {name:"Apache",category:"Web Server",headers:[{key:"server",pattern:/apache/i}]},
  {name:"PHP",category:"Backend",headers:[{key:"x-powered-by",pattern:/php/i}]},
  {name:"Node.js / Express",category:"Backend",headers:[{key:"x-powered-by",pattern:/express/i}]},
  {name:"Cloudflare",category:"CDN",headers:[{key:"cf-ray",pattern:/.+/}]},
  {name:"Vercel",category:"Hosting",headers:[{key:"x-vercel-id",pattern:/.+/}]},
  {name:"Shopify",category:"E-Commerce",bodyPatterns:[/cdn\.shopify\.com/i]},
];

async function safeFetch(url:string,options:RequestInit={}):Promise<{response:Response;body:string}|null>{
  try{
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),10000);
    const response=await fetch(url,{...options,signal:controller.signal,redirect:"follow",headers:{"User-Agent":"Mozilla/5.0 (compatible; SecureScanPro/1.0)",Accept:"text/html,*/*",...options.headers}});
    clearTimeout(timeout);
    const body=await response.text().catch(()=>"");
    return{response,body};
  }catch{return null;}
}

function parseCookie(h:string):CookieCheck{
  const parts=h.split(";").map(p=>p.trim());
  return{name:parts[0]?.split("=")[0]?.trim()||"unknown",hasSecure:parts.some(p=>p.toLowerCase()==="secure"),hasHttpOnly:parts.some(p=>p.toLowerCase()==="httponly"),hasSameSite:parts.some(p=>p.toLowerCase().startsWith("samesite")),sameSiteValue:parts.find(p=>p.toLowerCase().startsWith("samesite"))?.split("=")[1]?.trim()};
}

function detectTech(headers:Headers,body:string):TechStack[]{
  const out:TechStack[]=[];
  for(const t of TECH_FINGERPRINTS){
    let found=false;let conf:"high"|"medium"|"low"="low";
    if((t as any).headers)for(const h of(t as any).headers){const v=headers.get(h.key);if(v&&h.pattern.test(v)){found=true;conf="high";break;}}
    if((t as any).bodyPatterns&&body)for(const p of(t as any).bodyPatterns){if(p.test(body)){found=true;if(conf!=="high")conf="medium";break;}}
    if(found)out.push({name:t.name,category:t.category,confidence:conf});
  }
  return out.filter((t,i,a)=>a.findIndex(x=>x.name===t.name)===i);
}

function extractEmails(body:string):string[]{
  const found=body.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g)||[];
  return Array.from(new Set(found.filter(e => !e.includes("example.com") && !e.includes("w3.org") && e.endsWith(".png")))).slice(0,10);
}

function analyzeRobots(content:string){
  const kw=["/admin","/wp-admin","/dashboard","/api/","/config","/private","/.git","/backup","/phpmyadmin"];
  const dis=content.split("\n").filter(l=>l.toLowerCase().startsWith("disallow:")).map(l=>l.replace(/^disallow:\s*/i,"").trim());
  const sens=dis.filter(p=>kw.some(k=>p.toLowerCase().includes(k)));
  return{exposesSensitivePaths:sens.length>0,sensitivePaths:sens};
}

function calcScore(d:Partial<ScanResult>){
  let hs=0;
  for(const h of d.securityHeaders||[]){
    if(h.present){
      if(["strict-transport-security","content-security-policy"].includes(h.name))hs+=8;
      else if(["x-frame-options","x-content-type-options"].includes(h.name))hs+=5;
      else hs+=2;
    }
  }
  hs=Math.min(30,hs);
  let ss=0;
  if(d.isHttps)ss+=10;if(d.ssl?.present)ss+=5;if(d.httpRedirectsToHttps)ss+=5;if(d.hasHSTS)ss+=5;
  ss=Math.min(20,ss);
  let cs=20;
  const cks=d.cookies||[];
  if(cks.length>0){const issues=cks.reduce((a,c)=>{if(!c.hasSecure)a++;if(!c.hasHttpOnly)a++;if(!c.hasSameSite)a++;return a;},0);cs=Math.round(20*(1-issues/(cks.length*3)));}
  cs=Math.max(0,Math.min(20,cs));
  let cnt=0;
  if(d.hasCSP)cnt+=8;if(d.hasXFrameOptions)cnt+=5;if(d.clickjackingProtection)cnt+=3;if(!d.mixedContent)cnt+=4;
  cnt=Math.min(20,cnt);
  let inf=10;
  if(d.serverInfoExposed)inf-=3;if(d.poweredByHeader)inf-=3;if((d.emailsFound?.length||0)>0)inf-=2;if(d.robotsTxt?.exposesSensitivePaths)inf-=2;
  inf=Math.max(0,inf);
  const total=hs+ss+cs+cnt+inf;
  let riskLevel:"Critical"|"High"|"Medium"|"Low"|"Excellent";let grade:string;
  if(total>=90){riskLevel="Excellent";grade="A+";}else if(total>=80){riskLevel="Low";grade="A";}
  else if(total>=70){riskLevel="Low";grade="B";}else if(total>=55){riskLevel="Medium";grade="C";}
  else if(total>=40){riskLevel="High";grade="D";}else{riskLevel="Critical";grade="F";}
  return{overallScore:Math.round(total),riskLevel,grade,categoryScores:{headers:Math.round((hs/30)*100),ssl:Math.round((ss/20)*100),cookies:Math.round((cs/20)*100),content:Math.round((cnt/20)*100),information:Math.round((inf/10)*100)}};
}

function compileVulns(d:Partial<ScanResult>):Vulnerability[]{
  const v:Vulnerability[]=[];
  v.push({id:"https",title:"HTTPS Not Enforced",severity:"critical",category:"Transport Security",description:"Site does not use HTTPS — all data is transmitted in plaintext.",impact:"Man-in-the-Middle attacks can intercept all traffic.",recommendation:"1. Get SSL cert (free via Let's Encrypt)\n2. Redirect HTTP to HTTPS\n3. Enable HSTS",references:["https://owasp.org/"],found:!d.isHttps});
  if(d.isHttps)v.push({id:"http-redirect",title:"HTTP Doesn't Redirect to HTTPS",severity:"high",category:"Transport Security",description:"Site supports HTTPS but doesn't redirect HTTP.",impact:"Users on HTTP get unencrypted connections.",recommendation:"Add 301 redirect from HTTP to HTTPS.",references:["https://owasp.org/"],found:!d.httpRedirectsToHttps});
  const sevMap:Record<string,Severity>={"strict-transport-security":"high","content-security-policy":"high","x-frame-options":"medium","x-content-type-options":"medium","referrer-policy":"low","permissions-policy":"low","x-xss-protection":"low","cross-origin-opener-policy":"low"};
  for(const h of d.securityHeaders||[])if(!h.present)v.push({id:`hdr-${h.name}`,title:`Missing: ${h.name}`,severity:sevMap[h.name]||"low",category:"Security Headers",description:`The ${h.name} header is not configured.`,impact:"Reduces browser-level security protections.",recommendation:h.recommendation,references:["https://securityheaders.com/"],found:true});
  if(d.hasCSP&&d.cspValue){
    if(d.cspValue.includes("unsafe-inline"))v.push({id:"csp-inline",title:"Weak CSP: unsafe-inline",severity:"medium",category:"CSP",description:"CSP allows inline scripts.",impact:"XSS protection is significantly weakened.",recommendation:"Replace unsafe-inline with nonces or hashes.",references:["https://content-security-policy.com/"],found:true,value:d.cspValue});
    if(d.cspValue.includes("unsafe-eval"))v.push({id:"csp-eval",title:"Weak CSP: unsafe-eval",severity:"medium",category:"CSP",description:"CSP allows eval().",impact:"Dynamic code execution is permitted.",recommendation:"Remove unsafe-eval from CSP.",references:["https://content-security-policy.com/"],found:true,value:d.cspValue});
  }
  v.push({id:"clickjack",title:"Clickjacking Protection Missing",severity:"medium",category:"Clickjacking",description:"No X-Frame-Options or CSP frame-ancestors configured.",impact:"Page can be embedded in malicious iframes.",recommendation:"Add X-Frame-Options: DENY or CSP frame-ancestors 'none'.",references:["https://owasp.org/"],found:!d.clickjackingProtection});
  for(const ck of d.cookies||[]){
    if(!ck.hasSecure&&d.isHttps)v.push({id:`ck-sec-${ck.name}`,title:`Cookie Missing Secure: ${ck.name}`,severity:"medium",category:"Cookie Security",description:`Cookie '${ck.name}' lacks Secure flag.`,impact:"Cookie can be sent over HTTP.",recommendation:`Add Secure flag to ${ck.name} cookie.`,references:["https://owasp.org/"],found:true,value:ck.name});
    if(!ck.hasHttpOnly)v.push({id:`ck-ho-${ck.name}`,title:`Cookie Missing HttpOnly: ${ck.name}`,severity:"medium",category:"Cookie Security",description:`Cookie '${ck.name}' lacks HttpOnly.`,impact:"JavaScript can steal this cookie via XSS.",recommendation:`Add HttpOnly flag to ${ck.name} cookie.`,references:["https://owasp.org/"],found:true,value:ck.name});
    if(!ck.hasSameSite)v.push({id:`ck-ss-${ck.name}`,title:`Cookie Missing SameSite: ${ck.name}`,severity:"low",category:"Cookie Security",description:`Cookie '${ck.name}' lacks SameSite.`,impact:"CSRF attacks may be possible.",recommendation:"Add SameSite=Strict or Lax.",references:["https://owasp.org/"],found:true,value:ck.name});
  }
  if(d.serverInfoExposed&&d.serverHeader)v.push({id:"server-info",title:"Server Version Disclosed",severity:"low",category:"Information Disclosure",description:`Server header reveals: "${d.serverHeader}"`,impact:"Attackers can find known CVEs for this version.",recommendation:"Hide version info: server_tokens off (Nginx) / ServerTokens Prod (Apache)",references:["https://owasp.org/"],found:true,value:d.serverHeader});
  if(d.poweredByHeader)v.push({id:"powered-by",title:"X-Powered-By Exposes Stack",severity:"low",category:"Information Disclosure",description:`X-Powered-By: "${d.poweredByHeader}"`,impact:"Reveals backend technology to attackers.",recommendation:"Remove X-Powered-By header.",references:["https://owasp.org/"],found:true,value:d.poweredByHeader});
  if((d.emailsFound?.length||0)>0)v.push({id:"emails",title:"Emails Exposed in Source",severity:"low",category:"Information Disclosure",description:`${d.emailsFound?.length} email(s) visible in page source.`,impact:"Emails can be harvested for phishing.",recommendation:"Use contact forms instead of mailto links.",references:["https://owasp.org/"],found:true,value:d.emailsFound?.join(", ")});
  if(d.robotsTxt?.exposesSensitivePaths)v.push({id:"robots",title:"robots.txt Reveals Sensitive Paths",severity:"info",category:"Information Disclosure",description:"Disallow entries reveal sensitive paths.",impact:"Attackers can map hidden admin areas.",recommendation:"Avoid listing specific sensitive paths in robots.txt.",references:["https://owasp.org/"],found:true,value:d.robotsTxt?.sensitivePaths?.join(", ")});
  if(!d.hasHSTS&&d.isHttps)v.push({id:"hsts",title:"HSTS Not Configured",severity:"medium",category:"Transport Security",description:"Site uses HTTPS but no HSTS header.",impact:"First request may be unencrypted.",recommendation:"Add: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload",references:["https://owasp.org/"],found:true});
  return v.filter(x=>x.found);
}

export async function scanWebsite(inputUrl:string):Promise<ScanResult>{
  const t0=Date.now();
  let url=inputUrl.trim();
  if(!url.startsWith("http://")&&!url.startsWith("https://"))url="https://"+url;
  const mf=await safeFetch(url);
  if(!mf)throw new Error(`Unable to reach ${url}. The site may be down or blocking requests.`);
  const{response,body}=mf;
  const headers=response.headers;
  const finalUrl=response.url||url;
  const statusCode=response.status;
  const isHttps=finalUrl.startsWith("https://");
  let httpRedirectsToHttps=false;
  if(isHttps){const hf=await safeFetch(url.replace("https://","http://"));if(hf)httpRedirectsToHttps=hf.response.url.startsWith("https://");}
  const securityHeaders=REQUIRED_SECURITY_HEADERS.map(h=>({name:h.name,present:headers.has(h.name),value:headers.get(h.name)||undefined,severity:h.severity,recommendation:h.recommendation}));
  const serverHeader=headers.get("server")||undefined;
  const poweredByHeader=headers.get("x-powered-by")||undefined;
  const hasHSTS=headers.has("strict-transport-security");
  const hstsValue=headers.get("strict-transport-security")||undefined;
  const hasCSP=headers.has("content-security-policy");
  const cspValue=headers.get("content-security-policy")||undefined;
  const hasXFrameOptions=headers.has("x-frame-options");
  const xFrameOptionsValue=headers.get("x-frame-options")||undefined;
  const hasXContentTypeOptions=headers.has("x-content-type-options");
  const hasReferrerPolicy=headers.has("referrer-policy");
  const clickjackingProtection=hasXFrameOptions||(hasCSP&&(cspValue?.includes("frame-ancestors")||false));
  const serverInfoExposed=serverHeader?/\d+\.\d+/.test(serverHeader):false;
  const rawCookies:string[]=[];
  headers.forEach((v,k)=>{if(k.toLowerCase()==="set-cookie")rawCookies.push(v);});
  const cookies=rawCookies.flatMap(c=>c.includes(",")?c.split(/,(?=[^\s].*?=)/):[c]).map(parseCookie);
  const ssl={present:isHttps,protocol:isHttps?"TLS":undefined,error:!isHttps?"Not served over HTTPS":undefined};
  const technologies=detectTech(headers,body);
  const emailsFound=extractEmails(body);
  const origin=new URL(finalUrl).origin;
  const rf=await safeFetch(`${origin}/robots.txt`);
  const robotsFound=rf?.response.status===200;
  const rc=robotsFound?rf?.body||"":"";
  const ra=rc?analyzeRobots(rc):{exposesSensitivePaths:false,sensitivePaths:[]};
  const robotsTxt={found:robotsFound,content:rc?.slice(0,2000),...ra};
  const sf=await safeFetch(`${origin}/sitemap.xml`);
  const sitemap={found:sf?.response.status===200,url:sf?.response.status===200?`${origin}/sitemap.xml`:undefined};
  const sensitivePaths:ScanResult["sensitivePaths"]=[];
  for(const path of["/.env","/.git/config","/phpinfo.php","/wp-config.php"]){const pf=await safeFetch(`${origin}${path}`);if(pf)sensitivePaths.push({path,accessible:pf.response.status===200,statusCode:pf.response.status});}
  const mixedContent=isHttps&&/http:\/\/[^"'\s]+\.(js|css|png|jpg|gif)/i.test(body);
  const partial:Partial<ScanResult>={isHttps,httpRedirectsToHttps,securityHeaders,ssl,cookies,hasCSP,cspValue,hasXFrameOptions,xFrameOptionsValue,hasHSTS,hstsValue,hasXContentTypeOptions,hasReferrerPolicy,clickjackingProtection,serverInfoExposed,serverHeader,poweredByHeader,emailsFound,robotsTxt,mixedContent,technologies};
  const{overallScore,riskLevel,grade,categoryScores}=calcScore(partial);
  const vulnerabilities=compileVulns(partial);
  const summary={totalVulnerabilities:vulnerabilities.length,critical:vulnerabilities.filter(v=>v.severity==="critical").length,high:vulnerabilities.filter(v=>v.severity==="high").length,medium:vulnerabilities.filter(v=>v.severity==="medium").length,low:vulnerabilities.filter(v=>v.severity==="low").length,info:vulnerabilities.filter(v=>v.severity==="info").length,passedChecks:securityHeaders.filter(h=>h.present).length+(isHttps?2:0)+(hasHSTS?1:0),totalChecks:securityHeaders.length+3};
  return{url:inputUrl,scannedAt:new Date().toISOString(),scanDuration:Date.now()-t0,overallScore,riskLevel,grade,finalUrl,statusCode,responseTime:Date.now()-t0,isHttps,httpRedirectsToHttps,serverHeader,poweredByHeader,securityHeaders,ssl,cookies,hasCSP,cspValue,hasXFrameOptions,xFrameOptionsValue,hasHSTS,hstsValue,hasXContentTypeOptions,hasReferrerPolicy,robotsTxt,sitemap,openRedirect:false,serverInfoExposed,clickjackingProtection,mixedContent,technologies,emailsFound,sensitivePaths,vulnerabilities,summary,categoryScores};
}
