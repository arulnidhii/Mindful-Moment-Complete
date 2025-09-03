import AsyncStorage from '@react-native-async-storage/async-storage'

const TRIAL_START_KEY = 'trial:start'
const MILESTONES_KEY = 'trial:milestones'

export type Milestones = {
  aha:boolean
  partnerPreview:boolean
  weeklyInsight:boolean
}

export async function getTrialStart(): Promise<number>{
  try{ const v = await AsyncStorage.getItem(TRIAL_START_KEY); return v? Number(v): 0 }catch{ return 0 }
}
export async function ensureTrialStart(){
  const existing = await getTrialStart()
  if(!existing){ await AsyncStorage.setItem(TRIAL_START_KEY, String(Date.now())) }
}

export async function isInTrial(days=14): Promise<boolean>{
  const start = await getTrialStart(); if(!start) return true
  const ms = days*24*3600*1000
  return Date.now() - start < ms
}

export async function getMilestones(): Promise<Milestones>{
  try{ const v = await AsyncStorage.getItem(MILESTONES_KEY); if(v) return JSON.parse(v) }catch{}
  return { aha:false, partnerPreview:false, weeklyInsight:false }
}
export async function setMilestone<K extends keyof Milestones>(key:K, val:boolean){
  const m = await getMilestones(); (m as any)[key]=val; await AsyncStorage.setItem(MILESTONES_KEY, JSON.stringify(m))
}

