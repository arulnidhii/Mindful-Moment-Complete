import AsyncStorage from '@react-native-async-storage/async-storage'

const KEY = 'advisor:feedback'
const DECAY_KEY = 'advisor:feedback:lastDecay'
const DECAY_INTERVAL = 7 * 24 * 3600 * 1000 // 7 days in milliseconds
const DECAY_FACTOR = 0.8 // Multiply counts by 0.8 each week

export type Feedback = Record<string, { helpful:number; not:number; last:number }>
export type CategoryFeedback = Record<string, { helpful: number; not: number; count: number }>

async function load(): Promise<Feedback>{
  try{ const raw = await AsyncStorage.getItem(KEY); if(raw) return JSON.parse(raw) }catch{}
  return {}
}
async function save(fb: Feedback){ try{ await AsyncStorage.setItem(KEY, JSON.stringify(fb)) }catch{} }

async function checkAndApplyDecay(): Promise<void> {
  try {
    const lastDecay = await AsyncStorage.getItem(DECAY_KEY)
    const now = Date.now()
    
    if (!lastDecay || (now - parseInt(lastDecay)) > DECAY_INTERVAL) {
      const fb = await load()
      let hasChanges = false
      
      for (const tplId of Object.keys(fb)) {
        const rec = fb[tplId]
        if (rec.helpful > 0 || rec.not > 0) {
          rec.helpful = Math.floor(rec.helpful * DECAY_FACTOR)
          rec.not = Math.floor(rec.not * DECAY_FACTOR)
          hasChanges = true
        }
      }
      
      if (hasChanges) {
        await save(fb)
      }
      
      await AsyncStorage.setItem(DECAY_KEY, String(now))
    }
  } catch (error) {
    // Silently handle decay errors to avoid breaking feedback
  }
}

export async function recordHelpful(tplId:string){
  await checkAndApplyDecay()
  const fb = await load(); const rec = fb[tplId] || { helpful:0, not:0, last:0 }
  rec.helpful += 1; rec.last = Date.now(); fb[tplId]=rec; await save(fb)
}
export async function recordNotHelpful(tplId:string){
  await checkAndApplyDecay()
  const fb = await load(); const rec = fb[tplId] || { helpful:0, not:0, last:0 }
  rec.not += 1; rec.last = Date.now(); fb[tplId]=rec; await save(fb)
}

export async function getWeight(tplId:string): Promise<number>{
  const fb = await load(); const rec = fb[tplId]
  if(!rec) return 1
  const w = 1 + 0.2*(rec.helpful) - 0.2*(rec.not)
  return Math.max(0.5, Math.min(2, w))
}

export async function getWeights(): Promise<Record<string, number>>{
  await checkAndApplyDecay()
  const fb = await load(); const out: Record<string, number> = {}
  for(const k of Object.keys(fb)){
    const rec = fb[k]; const w = 1 + 0.2*(rec.helpful) - 0.2*(rec.not)
    out[k] = Math.max(0.5, Math.min(2, w))
  }
  return out
}

export async function getCategoryWeights(templates: Array<{id: string, kind: string}>): Promise<Record<string, number>> {
  await checkAndApplyDecay()
  const fb = await load()
  const categoryFeedback: CategoryFeedback = {}
  
  // Aggregate feedback by category (kind)
  for (const template of templates) {
    const rec = fb[template.id]
    if (rec) {
      const kind = template.kind
      if (!categoryFeedback[kind]) {
        categoryFeedback[kind] = { helpful: 0, not: 0, count: 0 }
      }
      categoryFeedback[kind].helpful += rec.helpful
      categoryFeedback[kind].not += rec.not
      categoryFeedback[kind].count += 1
    }
  }
  
  // Calculate category weights
  const categoryWeights: Record<string, number> = {}
  for (const [kind, feedback] of Object.entries(categoryFeedback)) {
    if (feedback.count > 0) {
      const avgHelpful = feedback.helpful / feedback.count
      const avgNot = feedback.not / feedback.count
      const weight = 1 + 0.15 * avgHelpful - 0.15 * avgNot
      categoryWeights[kind] = Math.max(0.7, Math.min(1.5, weight))
    }
  }
  
  return categoryWeights
}

