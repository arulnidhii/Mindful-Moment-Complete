import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import colors from '@/constants/colors'
import typography from '@/constants/typography'
import { useStreakStore } from '@/store/streakStore'
import { aggregatePeriod } from '@/utils/advisor/periodAgg'
import { toAdvisorEntries } from '@/utils/advisor/detectors'

export default function TodayChips({ entries }:{ entries:any[] }){
  const currentStreak = useStreakStore(s=>s.currentStreak)
  const a = React.useMemo(()=> aggregatePeriod(toAdvisorEntries(entries), 'day'), [entries])
  const bestWindow = a.bestHour? `${a.bestHour[0]}:00–${a.bestHour[1]}:00` : null
  return (
    <View style={styles.row}>
      {currentStreak>0 && (
        <View style={[styles.chip, styles.primary]}>
          <Text style={[typography.labelLarge, styles.chipText]}>Streak {currentStreak}d</Text>
        </View>
      )}
      {bestWindow && (
        <View style={[styles.chip, styles.secondary]}>
          <Text style={[typography.labelLarge, styles.chipText]}>Best window {bestWindow}</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  row:{ flexDirection:'row', gap:8, marginBottom: 8 },
  chip:{ paddingVertical:6, paddingHorizontal:12, borderRadius:14 },
  primary:{ backgroundColor: colors.primary[40] },
  secondary:{ backgroundColor: colors.surface.containerHigh },
  chipText:{ color:'#fff' }
})

