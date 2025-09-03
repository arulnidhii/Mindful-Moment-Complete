import { AdvisorEvent, AdvisorItem, Period } from './advisorTypes'
import { toAdvisorEntries, collectEvents } from './detectors'
import { salienceScore } from './salience'
import { composeItems } from './compose'

export interface AdvisorEngine {
  detect: (rows:any[], period:Period)=>AdvisorEvent[]
  rerank: (events:AdvisorEvent[])=>AdvisorEvent[]
  pickTips: (ctx:{ period:Period, events:AdvisorEvent[] })=>void
  compose: (period:Period, events:AdvisorEvent[])=>AdvisorItem[]
}

export const AdvisorEngineV1: AdvisorEngine = {
  detect(rows:any[], period:Period){
    const entries = toAdvisorEntries(rows)
    return collectEvents(entries, period)
  },
  rerank(events:AdvisorEvent[]){
    return events.map(e=> ({...e, score: salienceScore({ ...e }) })).sort((a,b)=>b.score-a.score)
  },
  pickTips(ctx){ /* v1 uses template-provided tips directly */ },
  compose(period, events){
    const params:any = {}
    return composeItems(period, events, params)
  }
}

