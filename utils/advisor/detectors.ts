import { AdvisorEvent, Entry, Period } from './advisorTypes'
import { aggregatePeriod, mean, getPeriodRange, within } from './periodAgg'

// Map existing MoodEntry to Entry
export type MoodEntryLike = { timestamp:string; mood_value:string; boosters?:string[]; drainers?:string[]; journal_note?:string }
const moodToScore: Record<string, number> = { great:5, good:4, okay:3, challenged:2, struggling:1 }

export function toAdvisorEntries(rows: MoodEntryLike[]): Entry[] {
  return rows.map(r=>({
    t: new Date(String(r.timestamp)).getTime(),
    mood: moodToScore[r.mood_value] ?? 3,
    boosters: r.boosters, drainers: r.drainers, note: r.journal_note
  }))
}

const DOW_LABELS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

// Simple detectors
export function detectTrend(entries: Entry[], period: Period): AdvisorEvent[]{
  const a = aggregatePeriod(entries, period)
  const delta = a.deltas?.avgDelta ?? 0
  if(!isFinite(delta) || a.n < 2) return []
  const id = period==='week' ? 'week_summary_delta' : period==='month' ? 'month_summary_delta' : 'day_trend_stress_up'
  const monthName = period==='month' ? new Date().toLocaleString('en-US', { month: 'long' }) : undefined
  return [{ id, kind:'trend', score: 0, payload: {
    avg: (typeof a.avg === 'number') ? a.avg.toFixed(2) : a.avg,
    n: a.n,
    delta,
    deltaSign: delta>=0?'+':'-',
    deltaAbs: Math.abs(delta).toFixed(2),
    bestWindow: a.bestHour? `${a.bestHour[0]}:00–${a.bestHour[1]}:00` : undefined,
    monthName
  } as any } as AdvisorEvent]
}

export function detectCorrelation(entries: Entry[], period: Period): AdvisorEvent[]{
  const a = aggregatePeriod(entries, period)
  const out: AdvisorEvent[] = []
  if(period==='week'){
    if(a.topBooster){ out.push({ id:'week_top_booster', kind:'corr', score:0, payload:{ booster: a.topBooster } }) }
    if(a.novelty?.emergingDrainers?.[0]){ out.push({ id:'week_emerging_drainer', kind:'corr', score:0, payload:{ drainer: a.novelty.emergingDrainers[0] } }) }
  } else if(period==='month'){
    // compute top 2 boosters within month window
    const range = getPeriodRange('month')
    const rows = entries.filter(e=>within(e.t, range))
    const counts: Record<string, number> = {}
    rows.forEach(r=> r.boosters?.forEach(b=> counts[b]=(counts[b]||0)+1))
    const sorted = Object.entries(counts).sort((a,b)=>b[1]-a[1])
    const b1 = sorted[0]?.[0]
    const b2 = sorted[1]?.[0]
    if(b1){ out.push({ id:'month_top2_boosters', kind:'corr', score:0, payload:{ b1, b2 } }) }
    if(a.novelty?.emergingDrainers?.[0]){ out.push({ id:'month_emerging_drainer', kind:'corr', score:0, payload:{ drainer: a.novelty.emergingDrainers[0] } }) }
  }
  return out
}

export function detectRhythm(entries: Entry[], period: Period): AdvisorEvent[]{
  const a = aggregatePeriod(entries, period)
  const bestWindow = a.bestHour? `${a.bestHour[0]}:00–${a.bestHour[1]}:00` : undefined
  const bestDOW = (a.bestDOW!=null) ? DOW_LABELS[a.bestDOW] : undefined
  if(!bestWindow && bestDOW==null) return []
  const id = period==='week'? 'week_rhythm' : period==='month' ? 'month_rhythm' : 'day_rhythm_best_window'
  return [{ id, kind:'rhythm', score:0, payload:{ bestWindow, bestDOW } }]
}

export function detectAdherence(entries: Entry[], period: Period): AdvisorEvent[]{
  if(period!=='day') return []
  const a = aggregatePeriod(entries, period)
  const low = a.deltas ? (a.deltas.nDelta<=0) : a.n<2
  if(!low) return []
  return [{ id:'day_adherence_low', kind:'adherence', score:0, payload:{ n:a.n, nDelta:a.deltas?.nDelta } }]
}

export function collectEvents(entries: Entry[], period: Period): AdvisorEvent[]{
  return [ ...detectTrend(entries, period), ...detectCorrelation(entries, period), ...detectRhythm(entries, period), ...detectAdherence(entries, period) ]
}

