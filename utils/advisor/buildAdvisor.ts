import { Period, AdvisorItem } from './advisorTypes'
import { toAdvisorEntries, collectEvents } from './detectors'
import { salienceScore } from './salience'
import { composeItemsAsync } from './compose'

async function buildFallback(period: Period): Promise<AdvisorItem[]>{
  const now = Date.now()
  if(period!=='day') return []
  // Deterministic, safe, generally helpful tips
  return [
    { id:`fallback:walk:${now}`, createdAt: now, period:'day', title:'Quick reset', text:'A 10‑minute daylight walk often flips afternoon dips. Try one before screens.', tips:[{id:'walk10', text:'Take a 10‑minute walk if you feel a slump after 3 pm.'}] },
  ]
}

export async function buildAdvisorItemsAsync(moodEntries: any[], period: Period): Promise<AdvisorItem[]>{
  const entries = toAdvisorEntries(moodEntries)
  const events = collectEvents(entries, period)
  const scored = events.map(e=> ({...e, score: salienceScore({ ...e, magnitudeZ: (e as any).payload?.delta? Math.min(Math.abs((e as any).payload.delta)/0.5,1):0, confidence: 1, novelty: 1, hoursOld: 1 }) }))
  // Params for templating
  const now = new Date()
  const params: any = {
    monthName: period==='month'? now.toLocaleString('en-US', { month: 'long' }) : undefined
  }
  let items = await composeItemsAsync(period, scored, params)

  // Day‑2 “Aha” fallback: if in first 48h of trial or sparse data, guarantee 1 useful item
  try{
    const trial = await import('@/utils/trial')
    await trial.ensureTrialStart()
    const start = await trial.getTrialStart()
    const within48h = (Date.now() - start) < (48*3600*1000)
    const sparse = entries.length < 3
    if((within48h || sparse) && items.length===0){
      const fb = await buildFallback(period)
      if(fb.length>0){ items = fb; await trial.setMilestone('aha', true) }
    } else if(within48h && items.length>0){
      await trial.setMilestone('aha', true)
    }
  }catch{}

  return items
}

