import type { ScanResult } from "./scanner";
import { formatDate, formatDuration } from "./helpers";

export async function generatePDFReport(result: ScanResult): Promise<void> {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 15;
  const CW = W - M * 2;

  const C = {
    bg:    [0,0,0] as [number,number,number],
    card:  [14,14,14] as [number,number,number],
    border:[40,40,40] as [number,number,number],
    white: [255,255,255] as [number,number,number],
    gray1: [170,170,170] as [number,number,number],
    gray2: [100,100,100] as [number,number,number],
    gray3: [50,50,50] as [number,number,number],
  };

  function getShade(score:number):[number,number,number]{
    if(score>=80)return[255,255,255];
    if(score>=60)return[190,190,190];
    if(score>=40)return[130,130,130];
    if(score>=20)return[80,80,80];
    return[50,50,50];
  }
  function getSevShade(sev:string):[number,number,number]{
    switch(sev){case"critical":return[255,255,255];case"high":return[200,200,200];case"medium":return[150,150,150];case"low":return[100,100,100];default:return[70,70,70];}
  }

  let y=0;
  function checkPage(need:number){
    if(y+need>H-20){
      doc.addPage();
      doc.setFillColor(...C.bg);doc.rect(0,0,W,H,"F");
      addBars();
      y=M;
    }
  }
  function addBars(){
    doc.setFillColor(...C.white);doc.rect(0,H-3,W,3,"F");
    doc.setFillColor(...C.white);doc.rect(0,0,W,3,"F");
    doc.setFillColor(...C.gray2);doc.setFont("Courier","normal");doc.setFontSize(7);
    doc.text("SecureScan Pro  |  Made with ❤ by Garvit Choudhary · Aditya · Radhika · Riddhi",W/2,H-7,{align:"center"});
  }
  function card(x:number,y:number,w:number,h:number){
    doc.setFillColor(...C.card);doc.roundedRect(x,y,w,h,3,3,"F");
    doc.setDrawColor(...C.border);doc.setLineWidth(0.5);doc.roundedRect(x,y,w,h,3,3,"S");
  }
  function divider(yy:number){doc.setDrawColor(...C.border);doc.setLineWidth(0.3);doc.line(M,yy,W-M,yy);}

  const TOTAL=4;

  // PAGE 1 — COVER
  doc.setFillColor(...C.bg);doc.rect(0,0,W,H,"F");
  doc.setFillColor(...C.white);doc.rect(0,0,W,3,"F");
  doc.setFillColor(...C.gray3);doc.rect(0,3,W,2,"F");
  addBars();

  // Shield
  doc.setFillColor(...C.card);doc.setDrawColor(...C.white);doc.setLineWidth(1);
  doc.roundedRect(W/2-12,22,24,24,3,3,"FD");
  doc.setFont("Helvetica","bold");doc.setFontSize(14);doc.setTextColor(...C.white);
  doc.text("S",W/2,38,{align:"center"});

  doc.setFontSize(28);doc.setTextColor(...C.white);
  doc.setFont("Helvetica","bold");doc.text("SECURESCAN PRO",W/2,65,{align:"center"});
  doc.setFontSize(10);doc.setTextColor(...C.gray1);
  doc.text("WEBSITE SECURITY ASSESSMENT REPORT",W/2,75,{align:"center"});
  doc.setDrawColor(...C.gray3);doc.setLineWidth(0.3);doc.line(M,82,W-M,82);

  // Target info
  card(M,88,CW,38);
  doc.setFont("Courier","bold");doc.setFontSize(7);doc.setTextColor(...C.gray2);
  doc.text("TARGET URL",M+6,96);
  doc.setFont("Helvetica","normal");doc.setFontSize(10);doc.setTextColor(...C.white);
  doc.text(result.url,M+6,103);
  doc.setFont("Courier","bold");doc.setFontSize(7);doc.setTextColor(...C.gray2);
  doc.text("SCANNED",M+6,113);doc.text("DURATION",W/2,113);
  doc.setFont("Helvetica","normal");doc.setFontSize(9);doc.setTextColor(...C.white);
  doc.text(formatDate(result.scannedAt),M+6,120);doc.text(formatDuration(result.scanDuration),W/2,120);

  // Score ring
  const shade=getShade(result.overallScore);
  doc.setDrawColor(...C.gray3);doc.setLineWidth(6);doc.circle(W/2,168,22,"S");
  doc.setDrawColor(...shade);doc.setLineWidth(6);
  const angle=360*result.overallScore/100;
  doc.arc(W/2-22,146,W/2+22,190,90,-angle);
  doc.setFont("Helvetica","bold");doc.setFontSize(20);doc.setTextColor(...shade);
  doc.text(String(result.overallScore),W/2,171,{align:"center"});
  doc.setFont("Courier","normal");doc.setFontSize(7);doc.setTextColor(...C.gray2);
  doc.text("/100",W/2,178,{align:"center"});

  // Grade & risk
  doc.setFont("Helvetica","bold");doc.setFontSize(32);doc.setTextColor(...shade);
  doc.text(result.grade,W/4,170,{align:"center"});
  doc.setFont("Helvetica","bold");doc.setFontSize(18);
  doc.text(result.riskLevel.toUpperCase(),(W*3)/4,167,{align:"center"});
  doc.setFont("Courier","normal");doc.setFontSize(7);doc.setTextColor(...C.gray2);
  doc.text("GRADE",W/4,178,{align:"center"});
  doc.text("RISK LEVEL",(W*3)/4,178,{align:"center"});

  // Vuln summary boxes
  const stats=[{l:"CRITICAL",n:result.summary.critical},{l:"HIGH",n:result.summary.high},{l:"MEDIUM",n:result.summary.medium},{l:"LOW",n:result.summary.low}];
  const bw=(CW-9)/4;
  stats.forEach(({l,n},i)=>{
    const bx=M+i*(bw+3);
    card(bx,193,bw,22);
    doc.setFont("Helvetica","bold");doc.setFontSize(16);doc.setTextColor(...C.white);
    doc.text(String(n),bx+bw/2,207,{align:"center"});
    doc.setFont("Courier","bold");doc.setFontSize(6);doc.setTextColor(...C.gray2);
    doc.text(l,bx+bw/2,212,{align:"center"});
  });

  // Checks passed
  card(M,222,CW,18);
  doc.setFont("Helvetica","bold");doc.setFontSize(9);doc.setTextColor(...C.white);
  doc.text(`${result.summary.passedChecks} / ${result.summary.totalChecks} Security Checks Passed`,W/2,233,{align:"center"});

  // Made with love
  doc.setFont("Helvetica","bold");doc.setFontSize(9);doc.setTextColor(...C.white);
  doc.text("Made with \u2764 by Garvit Choudhary \u00b7 Aditya \u00b7 Radhika \u00b7 Riddhi",W/2,H-18,{align:"center"});
  doc.setFont("Helvetica","normal");doc.setFontSize(7);doc.setTextColor(...C.gray2);
  doc.text(`Page 1 of ${TOTAL}`,W-M,H-10,{align:"right"});

  // PAGE 2 — EXECUTIVE SUMMARY
  doc.addPage();doc.setFillColor(...C.bg);doc.rect(0,0,W,H,"F");addBars();
  y=M;
  doc.setFont("Helvetica","bold");doc.setFontSize(14);doc.setTextColor(...C.white);
  doc.text("EXECUTIVE SUMMARY",M,y+8);divider(y+12);y+=20;

  const sumLines=[
    `Scan completed on ${formatDate(result.scannedAt)} for ${result.url}`,
    `Duration: ${formatDuration(result.scanDuration)} | Status: ${result.statusCode} | Protocol: ${result.isHttps?"HTTPS":"HTTP"}`,
    "",
    `OVERALL SCORE: ${result.overallScore}/100 — Grade: ${result.grade} — Risk: ${result.riskLevel.toUpperCase()}`,
    "",
    `Total issues: ${result.summary.totalVulnerabilities} (${result.summary.critical} critical, ${result.summary.high} high, ${result.summary.medium} medium, ${result.summary.low} low, ${result.summary.info} info)`,
    "",
    "KEY FINDINGS:",
    `• HTTPS: ${result.isHttps?"✓ Enabled":"✗ Not enabled"}`,
    `• HSTS: ${result.hasHSTS?"✓ Configured":"✗ Missing"}`,
    `• CSP: ${result.hasCSP?"✓ Present":"✗ Missing"}`,
    `• Clickjacking: ${result.clickjackingProtection?"✓ Protected":"✗ Vulnerable"}`,
    `• Security Headers: ${result.securityHeaders.filter(h=>h.present).length}/${result.securityHeaders.length} present`,
    `• Cookies: ${result.cookies.length} analyzed`,
    `• Technologies: ${result.technologies.map(t=>t.name).join(", ")||"None detected"}`,
  ];
  sumLines.forEach(line=>{
    checkPage(8);
    if(line===""){y+=4;return;}
    const isHead=line.startsWith("OVERALL")||line.startsWith("KEY FINDINGS");
    doc.setFont("Helvetica",isHead?"bold":"normal");
    doc.setFontSize(isHead?9:8);
    doc.setTextColor(...(isHead?C.white:line.startsWith("•")?C.gray1:C.gray2));
    doc.text(line,M,y);y+=6;
  });

  y+=6;divider(y);y+=10;
  doc.setFont("Helvetica","bold");doc.setFontSize(12);doc.setTextColor(...C.white);
  doc.text("CATEGORY SCORES",M,y);y+=8;

  const cats=[["Security Headers",result.categoryScores.headers],["SSL/TLS",result.categoryScores.ssl],["Cookie Security",result.categoryScores.cookies],["Content Security",result.categoryScores.content],["Info Disclosure",result.categoryScores.information]];
  cats.forEach(([cat,score])=>{
    checkPage(14);
    const sc=getShade(score as number);
    doc.setFont("Helvetica","normal");doc.setFontSize(8);doc.setTextColor(...C.white);doc.text(cat as string,M,y);
    doc.setFont("Courier","bold");doc.setTextColor(...sc);doc.text(`${score}%`,W-M,y,{align:"right"});
    doc.setFillColor(...C.gray3);doc.roundedRect(M,y+2,CW-20,3,1,1,"F");
    doc.setFillColor(...sc);doc.roundedRect(M,y+2,(CW-20)*(score as number)/100,3,1,1,"F");
    y+=12;
  });

  // Best practices checklist
  y+=6;divider(y);y+=10;
  doc.setFont("Helvetica","bold");doc.setFontSize(12);doc.setTextColor(...C.white);doc.text("BEST PRACTICES CHECKLIST",M,y);y+=8;

  const bpChecks=[
    ["Use HTTPS everywhere",result.isHttps],
    ["Enable HSTS",result.hasHSTS],
    ["Content Security Policy",result.hasCSP],
    ["X-Frame-Options (clickjacking)",result.hasXFrameOptions],
    ["X-Content-Type-Options",result.hasXContentTypeOptions],
    ["Configure Referrer-Policy",result.hasReferrerPolicy],
    ["Secure cookies (Secure+HttpOnly+SameSite)",result.cookies.length===0||result.cookies.every(c=>c.hasSecure&&c.hasHttpOnly&&c.hasSameSite)],
    ["Hide server version",!result.serverInfoExposed],
    ["Remove X-Powered-By",!result.poweredByHeader],
    ["HTTP redirects to HTTPS",result.httpRedirectsToHttps],
  ];
  bpChecks.forEach(([label,pass])=>{
    checkPage(10);
    const mark=pass?"+ PASS":"- FAIL";
    doc.setFont("Courier","bold");doc.setFontSize(7);
    doc.setTextColor(...(pass?C.white:C.gray3));
    doc.text(mark,M,y);
    doc.setFont("Helvetica","normal");doc.setFontSize(8);
    doc.setTextColor(...(pass?C.gray1:C.gray2));
    doc.text(label as string,M+18,y);y+=9;
  });

  doc.setFont("Helvetica","normal");doc.setFontSize(7);doc.setTextColor(...C.gray2);doc.text(`Page 2 of ${TOTAL}`,W-M,H-10,{align:"right"});

  // PAGE 3 — VULNERABILITIES
  doc.addPage();doc.setFillColor(...C.bg);doc.rect(0,0,W,H,"F");addBars();
  y=M;
  doc.setFont("Helvetica","bold");doc.setFontSize(14);doc.setTextColor(...C.white);
  doc.text("VULNERABILITY DETAILS",M,y+8);divider(y+12);y+=20;

  const sevOrd:Record<string,number>={critical:0,high:1,medium:2,low:3,info:4};
  const sorted=[...result.vulnerabilities].sort((a,b)=>sevOrd[a.severity]-sevOrd[b.severity]);

  sorted.forEach(v=>{
    checkPage(55);
    const sc=getSevShade(v.severity);
    doc.setFillColor(...C.card);doc.roundedRect(M,y,CW,10,1,1,"F");
    doc.setFillColor(...sc);doc.rect(M,y,3,10,"F");
    doc.setFont("Courier","bold");doc.setFontSize(7);doc.setTextColor(...sc);doc.text(v.severity.toUpperCase(),M+6,y+7);
    doc.setFont("Helvetica","bold");doc.setFontSize(8);doc.setTextColor(...C.white);doc.text(v.title,M+30,y+7);
    doc.setFont("Courier","normal");doc.setFontSize(7);doc.setTextColor(...C.gray2);doc.text(v.category,W-M,y+7,{align:"right"});
    y+=14;
    doc.setFont("Helvetica","bold");doc.setFontSize(7);doc.setTextColor(...C.gray2);doc.text("DESCRIPTION:",M,y);y+=5;
    doc.setFont("Helvetica","normal");doc.setFontSize(8);doc.setTextColor(...C.white);
    const dl=doc.splitTextToSize(v.description,CW);doc.text(dl,M,y);y+=dl.length*4.5+3;
    checkPage(20);
    doc.setFont("Helvetica","bold");doc.setFontSize(7);doc.setTextColor(...C.gray2);doc.text("FIX:",M,y);y+=5;
    doc.setFont("Helvetica","normal");doc.setFontSize(8);doc.setTextColor(...C.white);
    const rl=doc.splitTextToSize(v.recommendation,CW);doc.text(rl,M,y);y+=rl.length*4.5+6;
    doc.setDrawColor(...C.border);doc.setLineWidth(0.2);doc.line(M,y,W-M,y);y+=6;
  });
  doc.setFont("Helvetica","normal");doc.setFontSize(7);doc.setTextColor(...C.gray2);doc.text(`Page 3 of ${TOTAL}`,W-M,H-10,{align:"right"});

  // PAGE 4 — HEADERS + TECH
  doc.addPage();doc.setFillColor(...C.bg);doc.rect(0,0,W,H,"F");addBars();
  y=M;
  doc.setFont("Helvetica","bold");doc.setFontSize(14);doc.setTextColor(...C.white);
  doc.text("SECURITY HEADERS & TECHNOLOGY",M,y+8);divider(y+12);y+=20;

  autoTable(doc,{
    startY:y,
    head:[["Header","Status","Value"]],
    body:result.securityHeaders.map(h=>[h.name,h.present?"✓ PASS":"✗ FAIL",h.value?h.value.slice(0,50):"Not set"]),
    styles:{fillColor:C.card,textColor:C.white,fontSize:7,cellPadding:3},
    headStyles:{fillColor:[20,20,20],textColor:C.white,fontSize:7},
    alternateRowStyles:{fillColor:[10,10,10]},
    didParseCell:(data:any)=>{
      if(data.column.index===1&&data.section==="body"){
        data.cell.styles.textColor=data.cell.text[0]?.includes("PASS")?[200,200,200]:[60,60,60];
      }
    },
    margin:{left:M,right:M},
  });

  y=(doc as any).lastAutoTable.finalY+12;

  if(result.technologies.length>0){
    checkPage(40);
    doc.setFont("Helvetica","bold");doc.setFontSize(12);doc.setTextColor(...C.white);doc.text("DETECTED TECHNOLOGIES",M,y);y+=8;
    autoTable(doc,{
      startY:y,
      head:[["Technology","Category","Confidence"]],
      body:result.technologies.map(t=>[t.name+(t.version?` v${t.version}`:""),t.category,t.confidence.toUpperCase()]),
      styles:{fillColor:C.card,textColor:C.white,fontSize:8,cellPadding:3},
      headStyles:{fillColor:[20,20,20],textColor:C.white},
      margin:{left:M,right:M},
    });
    y=(doc as any).lastAutoTable.finalY+12;
  }

  // Cookie analysis
  if(result.cookies.length>0){
    checkPage(40);
    doc.setFont("Helvetica","bold");doc.setFontSize(12);doc.setTextColor(...C.white);doc.text("COOKIE SECURITY ANALYSIS",M,y);y+=8;
    autoTable(doc,{
      startY:y,
      head:[["Cookie Name","Secure","HttpOnly","SameSite"]],
      body:result.cookies.map(ck=>[ck.name,ck.hasSecure?"✓":"✗",ck.hasHttpOnly?"✓":"✗",ck.hasSameSite?`✓ ${ck.sameSiteValue||""}` : "✗"]),
      styles:{fillColor:C.card,textColor:C.white,fontSize:8,cellPadding:3},
      headStyles:{fillColor:[20,20,20],textColor:C.white},
      didParseCell:(data:any)=>{
        if(data.column.index>0&&data.section==="body"){
          data.cell.styles.textColor=data.cell.text[0]?.startsWith("✓")?[200,200,200]:[60,60,60];
        }
      },
      margin:{left:M,right:M},
    });
  }

  // Page numbers on all pages
  const total=doc.getNumberOfPages();
  for(let i=1;i<=total;i++){
    doc.setPage(i);
    doc.setFont("Helvetica","normal");doc.setFontSize(7);doc.setTextColor(...C.gray2);
    doc.text(`Page ${i} of ${total}`,W-M,H-10,{align:"right"});
  }

  const domain=new URL(result.url.startsWith("http")?result.url:"https://"+result.url).hostname;
  doc.save(`SecureScan-${domain}-${new Date().toISOString().split("T")[0]}.pdf`);
}
