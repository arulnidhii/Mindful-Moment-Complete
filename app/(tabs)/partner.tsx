import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { usePartnerStore } from '@/src/state/partnerStore';
import { listenForInsightPostcards, InsightPostcard, listenForDailyInsights, DailyInsightsDay, USE_DAILY_ROLLUP } from '@/src/lib/partnerService';

import GradientBackground from '@/components/GradientBackground';
import typography from '@/constants/typography';
import colors from '@/constants/colors';
import UnconnectedPartnerView from '@/components/partner/UnconnectedPartnerView';
import PostcardItem from '@/components/partner/PostcardItem';

const PartnerTab = () => {
  const { partner } = usePartnerStore();
  const [postcards, setPostcards] = useState<InsightPostcard[]>([]);
  const [days, setDays] = useState<DailyInsightsDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('day');

  useEffect(() => {
    if (partner) {
      const unsubscribe = USE_DAILY_ROLLUP
        ? listenForDailyInsights(setDays)
        : listenForInsightPostcards(setPostcards);
      setIsLoading(false);
      return () => unsubscribe();
    } else {
      setIsLoading(false);
    }
  }, [partner]);



  if (isLoading) {
    return (
      <GradientBackground>
        <ActivityIndicator style={{ flex: 1 }} size="large" color="#FFF" />
      </GradientBackground>
    );
  }

  if (!partner) {
    return <UnconnectedPartnerView />;
  }

  const periods: Array<'day'|'week'|'month'> = ['day','week','month'];
  const aggregated = selectedPeriod !== 'day'
    ? aggregateForPeriod(days, selectedPeriod === 'week' ? 7 : 30, partner.name)
    : [];

  const isEmptyDaily = (!USE_DAILY_ROLLUP ? postcards.length === 0 : days.length === 0);
  let content: React.ReactNode;
  if (selectedPeriod === 'day') {
    content = isEmptyDaily ? (
      <Text style={styles.subtitle}>
        Your connection is active! As {partner.name} uses the app, you'll see new insights here.
      </Text>
    ) : (
      !USE_DAILY_ROLLUP ? (
        <FlatList
          data={postcards}
          renderItem={({ item }) => <PostcardItem postcard={item} />}
          keyExtractor={(item, index) => `${item.timestamp?.seconds}-${index}`}
          style={styles.list}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      ) : (
        <FlatList
          data={days}
          renderItem={({ item }) => (
            <View style={styles.dayGroup}>
              <Text style={styles.dayHeader}>{item.date}</Text>
              {item.items?.map((pc, idx) => (
                <PostcardItem key={`${item.date}-${idx}`} postcard={pc} />
              ))}
            </View>
          )}
          keyExtractor={(item) => item.date}
          style={styles.list}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )
    );
  } else {
    content = (
      <FlatList
        data={aggregated}
        renderItem={({ item }) => <PostcardItem postcard={item} />}
        keyExtractor={(_, idx) => `agg-${selectedPeriod}-${idx}`}
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    );
  }

  return (
    <GradientBackground variant="secondary">
      <View style={styles.container}>
        <Text style={styles.title}>Insights from {partner.name}</Text>
        {/* Period selector mirrors Insights tab for consistency */}
        <View style={styles.periodSelectorRow}>
          {periods.map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.periodButton, selectedPeriod === p && styles.periodButtonSelected]}
              onPress={() => setSelectedPeriod(p)}
              accessibilityRole="button"
              accessibilityLabel={`${p === 'day' ? 'Day' : p === 'week' ? 'Week' : 'Month'} view`}
              accessibilityState={{ selected: selectedPeriod === p }}
            >
              <Text style={[styles.periodButtonText, selectedPeriod === p && styles.periodButtonTextSelected]}>
                {p === 'day' ? 'Day' : p === 'week' ? 'Week' : 'Month'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {content}
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 48,
    paddingHorizontal: 24,
    backgroundColor: colors.surface.bright,
  },
  title: {
    ...typography.headlineMedium,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 12,
  },
  list: {
    marginTop: 20,
  },
  dayGroup: {
    marginBottom: 18,
  },
  dayHeader: {
    color: colors.text.tertiary,
    marginBottom: 8,
    fontWeight: '600',
  },
  periodSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  periodButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: colors.surface.containerLow,
    marginHorizontal: 4,
  },
  periodButtonSelected: {
    backgroundColor: colors.primary[40],
  },
  periodButtonText: {
    ...typography.labelLarge,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  periodButtonTextSelected: {
    color: '#fff',
  },
});

export default PartnerTab;

// Aggregation helper: produce actionable weekly/monthly items from daily rollups
const parseDate = (s: string) => new Date(`${s}T00:00:00Z`).getTime();
const aggregateForPeriod = (
  days: DailyInsightsDay[], windowDays: number, partnerName: string
): { emoji: string; text: string; highlights?: string[] }[] => {
  if (!Array.isArray(days) || days.length === 0) return [];
  const now = Date.now();
  const cutoff = now - windowDays * 24 * 60 * 60 * 1000;
  const within = days.filter(d => parseDate(d.date) >= cutoff);
  if (within.length === 0) return [];

  const totalCounts: Record<string, number> = {};
  within.forEach(d => {
    Object.entries(d.counts || {}).forEach(([k, v]) => {
      totalCounts[k] = (totalCounts[k] || 0) + (v as number);
    });
  });

  const representative: Record<string, any> = {};
  for (const d of within) {
    for (const it of d.items || []) {
      if (!representative[it.type]) representative[it.type] = it;
    }
  }

  const parts: string[] = [];
  if (totalCounts['mood_booster']) parts.push(`${totalCounts['mood_booster']} uplifting moments`);
  if (totalCounts['gentle_nudge']) parts.push(`${totalCounts['gentle_nudge']} gentle check-ins`);
  if (totalCounts['rhythm_note']) parts.push(`a pattern note`);
  const scope = windowDays === 7 ? 'This week' : 'This month';
  const summary = parts.length > 0
    ? `${scope}, ${partnerName} had ${parts.join(', ')}.`
    : `${scope}, ${partnerName} logged mindful moments.`;

  const out: { emoji: string; text: string; highlights?: string[] }[] = [
    { emoji: '📅', text: summary, highlights: [String(totalCounts['mood_booster']||''), String(totalCounts['gentle_nudge']||'')] }
  ];

  (['mood_booster','gentle_nudge','rhythm_note'] as const).forEach(t => {
    if (representative[t]) {
      out.push({ emoji: representative[t].emoji, text: representative[t].text, highlights: representative[t].highlights });
    }
  });

  return out.slice(0, 4);
};
