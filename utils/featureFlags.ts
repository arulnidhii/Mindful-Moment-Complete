import { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { featureFlags as defaults } from '@/constants/flags'

const KEY = 'feature:advisor_feed'

export function useAdvisorFlag(){
  const [enabled, setEnabled] = useState<boolean>(defaults.advisor_feed)
  useEffect(()=>{
    (async()=>{
      try{
        const v = await AsyncStorage.getItem(KEY)
        if(v!==null) setEnabled(v==='true')
      }catch{}
    })()
  },[])
  const toggle = async (val:boolean)=>{
    setEnabled(val)
    try{ await AsyncStorage.setItem(KEY, String(val)) }catch{}
  }
  return { enabled, setEnabled: toggle }
}

