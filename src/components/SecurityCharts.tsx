"use client";
import { PieChart,Pie,Cell,Tooltip,Legend,RadarChart,Radar,PolarGrid,PolarAngleAxis,PolarRadiusAxis,BarChart,Bar,XAxis,YAxis,CartesianGrid,ResponsiveContainer } from "recharts";
import type { ScanResult } from "@/utils/scanner";

const TT = ({active,payload}:any) => active&&payload?.length?(<div className="glass px-3 py-2 rounded border border-white/10 text-xs font-mono"><span style={{color:payload[0].payload.color}}>{payload[0].name}</span><span className="text-white ml-2">{payload[0].value}</span></div>):null;
const BT = ({active,payload,label}:any) => active&&payload?.length?(<div className="glass px-3 py-2 rounded border border-white/10 text-xs font-mono"><div className="text-white">{label}</div><div className="text-white/60">{payload[0].value}%</div></div>):null;

export function VulnerabilityPieChart({summary}:{summary:ScanResult["summary"]}) {
  const data=[
    {name:"Critical",value:summary.critical,color:"#ffffff"},
    {name:"High",value:summary.high,color:"#cccccc"},
    {name:"Medium",value:summary.medium,color:"#888888"},
    {name:"Low",value:summary.low,color:"#555555"},
    {name:"Info",value:summary.info,color:"#333333"},
  ].filter(d=>d.value>0);
  if(!data.length) return <div className="flex items-center justify-center h-48 text-white/30 text-sm font-mono">No vulnerabilities found 🎉</div>;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
          {data.map((e,i)=><Cell key={i} fill={e.color} stroke="transparent"/>)}
        </Pie>
        <Tooltip content={<TT/>}/>
        <Legend iconType="circle" iconSize={8} formatter={(v)=><span style={{color:"#666",fontSize:"11px",fontFamily:"monospace"}}>{v}</span>}/>
      </PieChart>
    </ResponsiveContainer>
  );
}

export function CategoryBarChart({categoryScores}:{categoryScores:ScanResult["categoryScores"]}) {
  const data=[
    {name:"Headers",score:categoryScores.headers},
    {name:"SSL",score:categoryScores.ssl},
    {name:"Cookies",score:categoryScores.cookies},
    {name:"Content",score:categoryScores.content},
    {name:"Info",score:categoryScores.information},
  ];
  const getC=(s:number)=>s>=80?"#ffffff":s>=60?"#aaaaaa":s>=40?"#777777":"#444444";
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{top:5,right:5,left:-20,bottom:5}}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
        <XAxis dataKey="name" tick={{fill:"#444",fontSize:10,fontFamily:"monospace"}} axisLine={{stroke:"rgba(255,255,255,0.06)"}} tickLine={false}/>
        <YAxis domain={[0,100]} tick={{fill:"#444",fontSize:10,fontFamily:"monospace"}} axisLine={false} tickLine={false}/>
        <Tooltip content={<BT/>} cursor={{fill:"rgba(255,255,255,0.03)"}}/>
        <Bar dataKey="score" radius={[3,3,0,0]} maxBarSize={40}>
          {data.map((e,i)=><Cell key={i} fill={getC(e.score)}/>)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CategoryRadarChart({categoryScores}:{categoryScores:ScanResult["categoryScores"]}) {
  const data=[
    {subject:"Headers",score:categoryScores.headers,fullMark:100},
    {subject:"SSL",score:categoryScores.ssl,fullMark:100},
    {subject:"Cookies",score:categoryScores.cookies,fullMark:100},
    {subject:"Content",score:categoryScores.content,fullMark:100},
    {subject:"Info",score:categoryScores.information,fullMark:100},
  ];
  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data} margin={{top:10,right:20,bottom:10,left:20}}>
        <PolarGrid stroke="rgba(255,255,255,0.06)"/>
        <PolarAngleAxis dataKey="subject" tick={{fill:"#444",fontSize:9,fontFamily:"monospace"}}/>
        <PolarRadiusAxis angle={90} domain={[0,100]} tick={{fill:"#333",fontSize:8}} axisLine={false}/>
        <Radar name="Score" dataKey="score" stroke="#ffffff" fill="#ffffff" fillOpacity={0.06} strokeWidth={1}/>
        <Tooltip contentStyle={{background:"rgba(0,0,0,0.95)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"6px",fontFamily:"monospace",fontSize:"11px"}} labelStyle={{color:"#fff"}} itemStyle={{color:"#aaa"}}/>
      </RadarChart>
    </ResponsiveContainer>
  );
}
