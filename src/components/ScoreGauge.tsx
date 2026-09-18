"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getScoreColor, getRiskLevelColor, gradeInfo } from "@/utils/helpers";

interface Props { score:number; grade:string; riskLevel:string; size?:number; }

export default function ScoreGauge({score,grade,riskLevel,size=180}:Props) {
  const [anim,setAnim] = useState(0);
  useEffect(()=>{
    let start=0; const dur=1500; const t0=performance.now();
    function upd(now:number){ const p=Math.min((now-t0)/dur,1); const e=1-Math.pow(1-p,3); setAnim(Math.round(e*score)); if(p<1)requestAnimationFrame(upd); }
    requestAnimationFrame(upd);
  },[score]);

  const radius=(size-20)/2;
  const circ=2*Math.PI*radius;
  const offset=circ-(anim/100)*circ;
  const color=getScoreColor(score);
  const riskC=getRiskLevelColor(riskLevel);
  const gradeD=gradeInfo(grade);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{width:size,height:size}}>
        <svg width={size} height={size} className="transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <filter id="glow-bw"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={10}/>
          {[...Array(10)].map((_,i)=>{
            const a=(i*36*Math.PI)/180;
            return <line key={i} x1={size/2+(radius-16)*Math.cos(a)} y1={size/2+(radius-16)*Math.sin(a)} x2={size/2+(radius-6)*Math.cos(a)} y2={size/2+(radius-6)*Math.sin(a)} stroke="rgba(255,255,255,0.08)" strokeWidth={1}/>;
          })}
          <motion.circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round"
            strokeDasharray={circ} initial={{strokeDashoffset:circ}} animate={{strokeDashoffset:offset}}
            transition={{duration:1.5,ease:"easeOut"}} filter="url(#glow-bw)"/>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div initial={{opacity:0,scale:0.5}} animate={{opacity:1,scale:1}} transition={{delay:0.5}} className="text-center">
            <div className="font-orbitron font-black leading-none" style={{fontSize:size*0.22,color,textShadow:`0 0 15px ${color}40`}}>{anim}</div>
            <div className="font-mono text-xs mt-1 text-white/30">/ 100</div>
          </motion.div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.8}} className="flex flex-col items-center gap-1">
          <div className="font-orbitron text-3xl font-black" style={{color,textShadow:`0 0 10px ${color}40`}}>{grade}</div>
          <div className="text-xs text-white/30 font-mono uppercase tracking-wider">Grade</div>
        </motion.div>
        <div className="w-px h-12 bg-white/10"/>
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:1}} className="flex flex-col items-center gap-1">
          <div className={`px-3 py-1 rounded border border-white/15 font-mono text-sm font-bold uppercase ${riskC.text} ${riskC.bg}`}>{riskLevel}</div>
          <div className="text-xs text-white/30 font-mono uppercase tracking-wider">Risk Level</div>
        </motion.div>
      </div>
      <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.2}} className="text-xs text-white/30 text-center font-mono max-w-32">{gradeD.description}</motion.p>
    </div>
  );
}
