import { DailyInsightsDay } from '@/src/lib/partnerService'

export function computeWeeklyForUs(days: DailyInsightsDay[], partnerName: string): string{
  if(!Array.isArray(days)||days.length===0) return ''
  const { getPeriodRange } = require('@/utils/advisor/periodAgg');
  const rCurr = getPeriodRange('week', new Date());
  const prevAnchor = new Date(); prevAnchor.setDate(prevAnchor.getDate()-7)
  const rPrev = getPeriodRange('week', prevAnchor);
  const parseDate = (s: string) => new Date(`${s}T00:00:00Z`).getTime();
  const within = (ts:number, r:any)=> ts>=r.start && ts<=r.end
  const curr = days.filter(d => within(parseDate(d.date), rCurr));
  const prev = days.filter(d => within(parseDate(d.date), rPrev));
  const sum = (set: any[])=> set.reduce((acc, d)=> acc + (Object.values(d.counts||{}).reduce((a:any,b:any)=> a+(b as number),0)), 0)
  const c = sum(curr), p = sum(prev)
  const sign = c-p>=0?'+':'−'
  const delta = Math.abs(c-p)
  return `${partnerName} logged ${c} moments (${sign}${delta} vs last week). Try one shared micro‑action together this weekend.`
}

