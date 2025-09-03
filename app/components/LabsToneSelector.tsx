import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import typography from '@/constants/typography'
import { useAdvisorTone } from '@/utils/advisor/tone'

export default function LabsToneSelector(){
  const { tone, setTone } = useAdvisorTone()
  const options: Array<{key:'warm'|'crisp'|'coach', label:string}> = [
    { key:'warm', label:'Warm' },
    { key:'crisp', label:'Crisp' },
    { key:'coach', label:'Coach' },
  ]
  return (
    <View style={{ marginTop: 8 }}>
      <Text style={typography.bodyMedium}>Advisor Tone</Text>
      <View style={{ flexDirection:'row', gap:8, marginTop:8 }}>
        {options.map(opt => (
          <TouchableOpacity
            key={opt.key}
            onPress={() => setTone(opt.key)}
            style={{ paddingVertical:6, paddingHorizontal:12, borderRadius:14, backgroundColor: tone===opt.key ? '#4C8BF5' : '#eee' }}
          >
            <Text style={[typography.labelLarge, { color: tone===opt.key ? '#fff' : '#333' }]}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

