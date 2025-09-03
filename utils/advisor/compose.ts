import { AdvisorEvent, AdvisorItem, Period } from './advisorTypes'
import { ALL_TEMPLATES, EXTENDED_TEMPLATES } from './templates'

import AsyncStorage from '@react-native-async-storage/async-storage'
const COOLDOWN_HOURS = 72
let lastSeen: Record<string, number> = {}
const CD_KEY = 'advisor:cooldown:lastSeen'

async function loadCooldown(){
  try{ const raw = await AsyncStorage.getItem(CD_KEY); if(raw){ lastSeen = JSON.parse(raw) || {} } }catch{}
}
async function saveCooldown(){
  try{ await AsyncStorage.setItem(CD_KEY, JSON.stringify(lastSeen)) }catch{}
}

function allowedByCooldown(tplId:string){
  const last = lastSeen[tplId] || 0
  const now = Date.now()
  return now - last > COOLDOWN_HOURS*3600*1000
}

export async function composeItemsAsync(period:Period, events:AdvisorEvent[], params:any & { context?: 'self'|'partner' }):Promise<AdvisorItem[]>{
  await loadCooldown()
  const { getWeights, getCategoryWeights } = await import('./feedback')
  const weights = await getWeights()
  const categoryWeights = await getCategoryWeights([...ALL_TEMPLATES, ...EXTENDED_TEMPLATES])
  const items:AdvisorItem[]=[]
  const pool=[...ALL_TEMPLATES, ...EXTENDED_TEMPLATES].filter(t=>t.periods.includes(period))
  const picked = new Set<string>()

  // lazy import to avoid cycles
  let generateActionsFor: undefined | ((id:string, payload:any, opts?: { context?: 'self'|'partner' })=>any)
  try{ generateActionsFor = (await import('./actions')).generateActionsFor }catch{}

  for(const ev of events.sort((a,b)=>b.score-a.score)){
    // pick best weighted candidate for this event
    const candidates = pool.filter(t=> (t.id===ev.id || t.kind===ev.kind) && allowedByCooldown(t.id) && !picked.has(t.id))

    // Sort by combined individual and category weights
    candidates.sort((a,b)=>{
      const aWeight = (weights[a.id]||1) * (categoryWeights[a.kind]||1)
      const bWeight = (weights[b.id]||1) * (categoryWeights[b.kind]||1)
      return bWeight - aWeight
    })

    const tpl = candidates[0]
    if(!tpl) continue
    picked.add(tpl.id)
    const id=`${tpl.id}:${Date.now()}:${Math.random()}`
    const p={...params, ...(ev.payload||{})}
    const text=tpl.variants[Math.floor(Math.random()*tpl.variants.length)](p)
    const actions = generateActionsFor ? generateActionsFor(tpl.id, p, { context: params?.context || 'self' }): undefined
    items.push({ id, createdAt:Date.now(), period, title: tpl.title(p), text, tips: tpl.tips(p).slice(0,2), actions })
    if(items.length>=3) break
  }

  // update cooldown memory
  items.forEach(it=>{ const base = it.id.split(':')[0]; lastSeen[base]=Date.now() })
  await saveCooldown()
  return items
}

// keep sync for backwards compatibility
export function composeItems(period:Period, events:AdvisorEvent[], params:any & { context?: 'self'|'partner' }):AdvisorItem[] {
  // Non-persistent cooldown if called sync
  const pool=[...ALL_TEMPLATES, ...EXTENDED_TEMPLATES].filter(t=>t.periods.includes(period))
  const picked = new Set<string>()
  const items:AdvisorItem[]=[]
  // lazy import to avoid cycles
  let generateActionsFor: undefined | ((id:string, payload:any, opts?: { context?: 'self'|'partner' })=>any)
  try{ generateActionsFor = (require('./actions') as any).generateActionsFor }catch{}

  for(const ev of events.sort((a,b)=>b.score-a.score)){
    const tpl = pool.find(t=> (t.id===ev.id || t.kind===ev.kind) && !picked.has(t.id))
    if(!tpl) continue
    picked.add(tpl.id)
    const id=`${tpl.id}:${Date.now()}:${Math.random()}`
    const p={...params, ...(ev.payload||{})}
    const text=tpl.variants[Math.floor(Math.random()*tpl.variants.length)](p)
    const actions = generateActionsFor ? generateActionsFor(tpl.id, p, { context: params?.context || 'self' }): undefined
    items.push({ id, createdAt:Date.now(), period, title: tpl.title(p), text, tips: tpl.tips(p).slice(0,2), actions })
    if(items.length>=3) break
  }
  return items
}

