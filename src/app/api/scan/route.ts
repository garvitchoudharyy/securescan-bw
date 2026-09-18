import { NextRequest, NextResponse } from "next/server";
import { scanWebsite } from "@/utils/scanner";
export const maxDuration = 30;
export const runtime = "nodejs";

function validateUrl(url: string) {
  try {
    let n = url.trim();
    if (!n.startsWith("http://") && !n.startsWith("https://")) n = "https://" + n;
    const p = new URL(n);
    if (!["http:","https:"].includes(p.protocol)) return {valid:false,message:"Only HTTP/HTTPS URLs allowed."};
    const h = p.hostname.toLowerCase();
    if (h==="localhost"||h==="127.0.0.1"||h==="::1") return {valid:false,message:"Scanning localhost is not allowed."};
    if (/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(h)) return {valid:false,message:"Scanning private IPs is not allowed."};
    if (h.split(".").length < 2) return {valid:false,message:"Please enter a valid domain."};
    return {valid:true,normalizedUrl:n};
  } catch { return {valid:false,message:"Invalid URL format."}; }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(()=>null);
    if (!body||typeof body.url!=="string") return NextResponse.json({error:"Request must contain a 'url' field."},{status:400});
    const v = validateUrl(body.url);
    if (!v.valid) return NextResponse.json({error:v.message},{status:400});
    const result = await scanWebsite(v.normalizedUrl!);
    return NextResponse.json(result,{status:200,headers:{"Cache-Control":"no-store"}});
  } catch(e) {
    const msg = e instanceof Error ? e.message : "Unexpected error during scanning.";
    return NextResponse.json({error:msg.includes("Unable to reach")?msg:"Failed to scan. Check the URL and try again."},{status:500});
  }
}
export async function OPTIONS() {
  return new NextResponse(null,{status:204,headers:{"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"POST,OPTIONS","Access-Control-Allow-Headers":"Content-Type"}});
}
