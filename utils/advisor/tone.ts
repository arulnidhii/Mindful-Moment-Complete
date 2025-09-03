import AsyncStorage from '@react-native-async-storage/async-storage'

export type Tone = 'warm'|'crisp'|'coach'
const KEY='feature:advisor_tone'

export const PHRASES = {
  warm: {
    nudge: ['A small step is still a step.','You’re doing great—keep it gentle.','Small wins count.'],
    praise: ['Nice work.','Love that.','That helps.'],
  },
  crisp: {
    nudge: ['Keep it short and simple.','One action, now.','Cut the friction.'],
    praise: ['Done.','Good.','Efficient.'],
  },
  coach: {
    nudge: ['Lock in a tiny habit.','Set a trigger and go.','Make it obvious.'],
    praise: ['Well executed.','On track.','That’s momentum.'],
  }
}

export let CURRENT_TONE: Tone = 'warm'
;(async()=>{ try{ const v=await AsyncStorage.getItem(KEY); if(v==='warm'||v==='crisp'||v==='coach') CURRENT_TONE=v }catch{} })()

export async function getAdvisorTone(): Promise<Tone>{
  try{
    const v = await AsyncStorage.getItem(KEY)
    if(v==='warm'||v==='crisp'||v==='coach') return v
  }catch{}
  return 'warm'
}

export function useAdvisorTone(){
  const React = require('react') as typeof import('react')
  const [tone,setTone] = React.useState<Tone>(CURRENT_TONE)
  React.useEffect(()=>{ (async()=> setTone(await getAdvisorTone()))() },[])
  const set = async (t:Tone)=>{ CURRENT_TONE=t; setTone(t); try{ await AsyncStorage.setItem(KEY,t) }catch{} }
  return { tone, setTone: set }
}

export type ToneCategory = keyof (typeof PHRASES)['warm']

export function pickTone(tone:Tone, cat:ToneCategory | string){
  const arr = (PHRASES as any)[tone]?.[cat as ToneCategory] as string[] | undefined
  if(!arr||arr.length===0) return ''
  return arr[Math.floor(Math.random()*arr.length)]
}

export function pickToneCurrent(cat:ToneCategory | string){
  return pickTone(CURRENT_TONE, cat)
}

