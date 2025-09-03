import AsyncStorage from '@react-native-async-storage/async-storage'
import { AdvisorItem } from './advisorTypes'

const KEY_PREFIX = 'advisor:queue:'

export const todayKey = () => new Date().toISOString().split('T')[0]

export async function getTodayItems(): Promise<AdvisorItem[]> {
  return getItemsForDate(todayKey())
}

export async function getItemsForDate(dateKey:string): Promise<AdvisorItem[]> {
  try{
    const raw = await AsyncStorage.getItem(KEY_PREFIX+dateKey)
    if(!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr)? arr as AdvisorItem[] : []
  }catch{
    return []
  }
}

export async function saveTodayItems(items: AdvisorItem[]): Promise<void>{
  try{
    const capped = items.slice(0,3)
    await AsyncStorage.setItem(KEY_PREFIX+todayKey(), JSON.stringify(capped))
  }catch{}
}

export async function clearToday(){
  try{ await AsyncStorage.removeItem(KEY_PREFIX+todayKey()) }catch{}
}

