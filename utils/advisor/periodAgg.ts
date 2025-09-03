import { Entry, Period, PeriodAgg } from './advisorTypes'

export function getPeriodRange(period:Period, anchor=new Date()):{start:number,end:number}{
  const d=new Date(anchor)
  if(period==='day'){
    const s=new Date(d.getFullYear(),d.getMonth(),d.getDate(),0,0,0).getTime()
    const e=s+24*3600*1000-1; return {start:s,end:e}
  }
  if(period==='week'){
    const day=(d.getDay()+6)%7; // Mon=0
    const monday=new Date(d); monday.setDate(d.getDate()-day); monday.setHours(0,0,0,0)
    const s=monday.getTime(); const e=s+7*24*3600*1000-1; return {start:s,end:e}
  }
  // month
  const s=new Date(d.getFullYear(),d.getMonth(),1,0,0,0).getTime()
  const e=new Date(d.getFullYear(),d.getMonth()+1,0,23,59,59,999).getTime(); return {start:s,end:e}
}

export function within(ts:number,{start,end}:{start:number,end:number}){ return ts>=start && ts<=end }

export function mean(xs:number[]){ return xs.length? xs.reduce((a,b)=>a+b,0)/xs.length : 0 }

export function aggregatePeriod(entries:Entry[], period:Period, anchor=new Date()):PeriodAgg{
  const range=getPeriodRange(period,anchor)
  const rows=entries.filter(e=>within(e.t,range))
  const avg=mean(rows.map(r=>r.mood))

  const hourBuckets=new Array(24).fill(null).map(()=>[] as number[])
  rows.forEach(r=>{ const h=new Date(r.t).getHours(); hourBuckets[h].push(r.mood) })
  let bestHour:[number,number]|undefined
  let bestScore=-Infinity
  for(let h=0;h<24;h++){
    const s=mean(hourBuckets[h])
    if(hourBuckets[h].length>=2 && s>bestScore){ bestScore=s; bestHour=[h,h+1] }
  }

  const dowBuckets=new Array(7).fill(null).map(()=>[] as number[])
  rows.forEach(r=>{ const d=(new Date(r.t).getDay()+6)%7; dowBuckets[d].push(r.mood) })
  let bestDOW: number | undefined; let bestDOWScore=-Infinity
  for(let d=0; d<7; d++){
    const s=mean(dowBuckets[d]); if(dowBuckets[d].length>=2 && s>bestDOWScore){ bestDOWScore=s; bestDOW=d }
  }

  const boosterCounts:Record<string,number>={}; const drainerCounts:Record<string,number>={}
  rows.forEach(r=>{
    r.boosters?.forEach(b=>boosterCounts[b]=(boosterCounts[b]||0)+1)
    r.drainers?.forEach(b=>drainerCounts[b]=(drainerCounts[b]||0)+1)
  })
  const topBooster=Object.keys(boosterCounts).sort((a,b)=>boosterCounts[b]-boosterCounts[a])[0]
  const topDrainer=Object.keys(drainerCounts).sort((a,b)=>drainerCounts[b]-drainerCounts[a])[0]

  const prevAnchor=new Date(anchor)
  if(period==='day') prevAnchor.setDate(prevAnchor.getDate()-1)
  if(period==='week') prevAnchor.setDate(prevAnchor.getDate()-7)
  if(period==='month') prevAnchor.setMonth(prevAnchor.getMonth()-1)
  const prev=aggregateOnlyAvgN(entries,period,prevAnchor)

  return { period, ...range, n:rows.length, avg, topBooster, topDrainer, bestHour, bestDOW,
           deltas: { avgDelta: avg - prev.avg, nDelta: rows.length - prev.n }, novelty: emerging(rows, period) }
}

function aggregateOnlyAvgN(entries:Entry[],period:Period,anchor:Date){
  const r=getPeriodRange(period,anchor)
  const rows=entries.filter(e=>within(e.t,r))
  return { n: rows.length, avg: mean(rows.map(r=>r.mood)) }
}

function emerging(rows:Entry[], period:Period){
  // naive novelty: items that appear in this period with count>=2
  const boosters=new Map<string,number>(); const drainers=new Map<string,number>()
  rows.forEach(r=>{ r.boosters?.forEach(b=>boosters.set(b,(boosters.get(b)||0)+1)); r.drainers?.forEach(b=>drainers.set(b,(drainers.get(b)||0)+1)) })
  const emergingBoosters=[...boosters.entries()].filter(([,c])=>c>=2).map(([k])=>k).slice(0,3)
  const emergingDrainers=[...drainers.entries()].filter(([,c])=>c>=2).map(([k])=>k).slice(0,3)
  return { emergingBoosters, emergingDrainers }
}

