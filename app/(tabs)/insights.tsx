import React, { useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Share, Modal, TouchableOpacity, Dimensions } from 'react-native';
import GradientBackground from '@/components/GradientBackground';
import InsightCard from '@/components/InsightCard';
import MoodDistribution from '@/components/MoodDistribution';
import PatternInsight from '@/components/PatternInsight';
import DailyRhythm from '@/components/DailyRhythm';
import typography from '@/constants/typography';
import { useMoodStore } from '@/store/moodStore';
import colors from '@/constants/colors';
import ShareableInsightCard, { LUXURY_GRADIENTS } from '@/components/ShareableInsightCard';
import { captureRef } from 'react-native-view-shot';
import RNShare from 'react-native-share';
import { format } from '@/utils/dateFormatter';
import ShareableDailyRhythmCard from '@/components/ShareableDailyRhythmCard';
import ShareablePatternInsightCard from '@/components/ShareablePatternInsightCard';
import { haptics } from '@/utils/haptics';
import Animated, { FadeIn, useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import { getFreshInsights, InsightCard as DynamicInsightCard } from '@/utils/patternEngine';
import { HighlightedText } from '@/components/HighlightedText';

export default function InsightsScreen() {
  const entries = useMoodStore((state) => state.entries);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareModalDailyRhythmVisible, setShareModalDailyRhythmVisible] = useState(false);
  const [shareModalPatternsVisible, setShareModalPatternsVisible] = useState(false);
  const [selectedGradient, setSelectedGradient] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('week');
  const shareCardRef = useRef(null);
  const shareCardDailyRhythmRef = useRef(null);
  const shareCardPatternsRef = useRef(null);

  // Helper: get today's date string
  const todayKey = useMemo(() => format(new Date().toISOString()), []);

  // Process data for insights
  const processedData = useMemo(() => {
    if (entries.length === 0) return {
      dayData: [],
      weekData: [],
      monthData: [],
    };
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    // Day: only today
    const dayEntries = entries.filter(entry => format(new Date(String(entry.timestamp)).toISOString()) === todayKey);
    // Week: last 7 days
    const weekEntries = entries.filter(entry => new Date(String(entry.timestamp)) >= weekAgo);
    // Month: last 30 days
    const monthEntries = entries.filter(entry => new Date(String(entry.timestamp)) >= monthAgo);
    return {
      dayData: processEntriesByCount(dayEntries),
      weekData: processEntriesByCount(weekEntries),
      monthData: processEntriesByCount(monthEntries),
    };
  }, [entries, todayKey]);

  // Get data for selected period
  const getMoodData = () => {
    if (selectedPeriod === 'day') return processedData.dayData;
    if (selectedPeriod === 'week') return processedData.weekData;
    return processedData.monthData;
  };

  // Modern, short caption for the share card
  const getShareCaption = () => {
    if (selectedPeriod === 'day') return "My Mood Today";
    if (selectedPeriod === 'week') return "My Mood This Week";
    return "My Mood This Month";
  };

  // Helper functions to generate share text for each insight
  const appLink = 'https://play.google.com/store/apps/details?id=com.arulsdk.mindfulmoment7y4ko4c&hl=en-US';

  const getMoodLandscapeShareText = () =>
    `Discovering my mood landscape: Mindful Moment helps me visualize my emotional journey.\n\nExperience your own insights with Mindful Moment.\n\nDownload now: ${appLink}`;

  const getDailyRhythmShareText = () =>
    `My daily rhythm reveals when I feel my best. Mindful Moment uncovers patterns in my well-being.\n\nFind your rhythm with Mindful Moment.\n\nDownload now: ${appLink}`;

  const getPatternsShareText = () =>
    `Unlocking my personal patterns: Mindful Moment shows me when I thrive most.\n\nDiscover your unique patterns with Mindful Moment.\n\nDownload now: ${appLink}`;

  const getJourneyShareText = () =>
    `I've recorded ${entries.length} mindful ${entries.length === 1 ? 'moment' : 'moments'} so far! Consistency is key to self-awareness.\n\nStart your journey with Mindful Moment.\n\nDownload now: ${appLink}`;

  // Share handlers
  const handleShareMoodLandscape = () => {
    setShareModalVisible(true);
  };
  const handleShareDailyRhythm = () => {
    setShareModalDailyRhythmVisible(true);
  };
  const handleSharePatterns = () => {
    setShareModalPatternsVisible(true);
  };
  const handleShareJourney = async () => {
    try {
      await Share.share({ message: getJourneyShareText() });
    } catch (e) {}
  };

  // New: Confirm and share image
  const handleConfirmShare = async () => {
    try {
      if (shareCardRef.current) {
        const uri = await captureRef(shareCardRef, {
          format: 'png',
          quality: 1,
        });
        await RNShare.open({
          url: uri,
          type: 'image/png',
          failOnCancel: false,
          message: `Experience your own insights with Mindful Moment.\n\nDownload now: https://play.google.com/store/apps/details?id=com.arulsdk.mindfulmoment7y4ko4c&hl=en-US`,
        });
      }
    } catch (e) {}
    setShareModalVisible(false);
  };
  const handleConfirmShareDailyRhythm = async () => {
    try {
      if (shareCardDailyRhythmRef.current) {
        const uri = await captureRef(shareCardDailyRhythmRef, {
          format: 'png',
          quality: 1,
        });
        await RNShare.open({
          url: uri,
          type: 'image/png',
          failOnCancel: false,
          message: `Find your rhythm with Mindful Moment.\n\nDownload now: https://play.google.com/store/apps/details?id=com.arulsdk.mindfulmoment7y4ko4c&hl=en-US`,
        });
      }
    } catch (e) {}
    setShareModalDailyRhythmVisible(false);
  };
  const handleConfirmSharePatterns = async () => {
    try {
      if (shareCardPatternsRef.current) {
        const uri = await captureRef(shareCardPatternsRef, {
          format: 'png',
          quality: 1,
        });
        await RNShare.open({
          url: uri,
          type: 'image/png',
          failOnCancel: false,
          message: `Discover your unique patterns with Mindful Moment.\n\nDownload now: https://play.google.com/store/apps/details?id=com.arulsdk.mindfulmoment7y4ko4c&hl=en-US`,
        });
      }
    } catch (e) {}
    setShareModalPatternsVisible(false);
  };

  // Dynamic insights
  const dynamicInsights = useMemo(() => getFreshInsights(entries, 4), [entries]);

  return (
    <GradientBackground variant="secondary">
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={[typography.bodyLarge, styles.introText]}>
            Unlock a deeper understanding of your emotional well-being. Here are some initial observations based on your Mindful Moments:
          </Text>

          {/* Period Selector */}
          <View style={styles.periodSelectorRow}>
            {['day', 'week', 'month'].map((period) => {
              const scale = useSharedValue(1);
              const animatedStyle = useAnimatedStyle(() => ({
                transform: [{ scale: scale.value }],
              }));
              return (
                <Animated.View key={period} style={animatedStyle}>
                  <TouchableOpacity
                    style={[styles.periodButton, selectedPeriod === period && styles.periodButtonSelected]}
                    onPress={() => {
                      haptics.selection();
                      scale.value = withTiming(0.92, { duration: 80 });
                      setTimeout(() => {
                        scale.value = withTiming(1, { duration: 120 });
                      }, 80);
                      setSelectedPeriod(period as 'day' | 'week' | 'month');
                    }}
                  >
                    <Text style={[styles.periodButtonText, selectedPeriod === period && styles.periodButtonTextSelected]}>
                      {period === 'day' ? 'Day' : period === 'week' ? 'Week' : 'Month'}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>

          <Animated.View entering={FadeIn.duration(400)}>
            <InsightCard title="Your Mood Landscape" onShare={() => { haptics.selection(); handleShareMoodLandscape(); }}>
              <MoodDistribution data={getMoodData()} moodEntries={entries} />
            </InsightCard>
          </Animated.View>
          <Animated.View entering={FadeIn.duration(400)}>
            <InsightCard title="Your Daily Rhythm" onShare={() => { haptics.selection(); handleShareDailyRhythm(); }}>
              <DailyRhythm entries={entries} />
            </InsightCard>
          </Animated.View>
          {/* Dynamic Insights Section */}
          {dynamicInsights.length > 0 ? (
            dynamicInsights.map((insight, idx) => (
              <Animated.View key={insight.id} entering={FadeIn.duration(400)}>
                <InsightCard 
                  title={insight.title}
                  icon={insight.icon}
                  onShare={insight.title === 'Your Patterns' ? () => { haptics.selection(); handleSharePatterns(); } : undefined}
                >
                  <HighlightedText
                    text={insight.content}
                    highlight={insight.highlight}
                    highlights={insight.highlights}
                    style={typography.bodyMedium}
                  />
                </InsightCard>
              </Animated.View>
            ))
          ) : (
            <Animated.View entering={FadeIn.duration(400)}>
              <InsightCard title="Keep Logging!">
                <Text style={typography.bodyMedium}>
                  Log a few more moments to unlock personalized insights about your patterns, boosters, and drainers. You'll see cards like "Your Patterns", "Your Personal Energizer", and "An Energy Drainer to Watch".
                </Text>
              </InsightCard>
            </Animated.View>
          )}
          <Animated.View entering={FadeIn.duration(400)}>
            <InsightCard title="Your Journey" onShare={() => { haptics.selection(); handleShareJourney(); }}>
              <Text style={typography.bodyMedium}>
                You've recorded {entries.length} mindful {entries.length === 1 ? 'moment' : 'moments'} so far. Consistency is key to developing deeper self-awareness.
              </Text>
            </InsightCard>
          </Animated.View>

          <Text style={[typography.bodyMedium, styles.futureText]}>
            More insights will unlock as you continue your journey!
          </Text>
        </View>
      </ScrollView>

      {/* Share Modal for Image-based Sharing */}
      <Modal
        visible={shareModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => { haptics.selection(); setShareModalVisible(false); }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Share Your Insight</Text>
            <View style={styles.gradientPickerRow}>
              {LUXURY_GRADIENTS.map((grad, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.gradientCircle, selectedGradient === idx && styles.gradientCircleSelected]}
                  onPress={() => setSelectedGradient(idx)}
                >
                  <View style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: grad[0],
                    borderWidth: 2,
                    borderColor: selectedGradient === idx ? colors.primary[40] : 'transparent',
                  }} />
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.cardPreviewContainer}>
              <View
                ref={shareCardRef}
                style={{ width: 1080, height: 1920, alignItems: 'center', justifyContent: 'center', position: 'absolute', opacity: 0 }}
                collapsable={false}
              >
                <ShareableInsightCard
                  gradientIndex={selectedGradient}
                  caption={getShareCaption()}
                >
                  <MoodDistribution data={getMoodData()} />
                </ShareableInsightCard>
              </View>
              {/* Scaled-down preview for the modal */}
              <View style={{ width: 270, height: 480, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <View style={{ transform: [{ scale: 0.25 }], width: 1080, height: 1920, alignItems: 'center', justifyContent: 'center' }}>
                  <ShareableInsightCard
                    gradientIndex={selectedGradient}
                    caption={getShareCaption()}
                  >
                    <MoodDistribution data={getMoodData()} />
                  </ShareableInsightCard>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.shareButton} onPress={() => { haptics.selection(); handleConfirmShare(); }}>
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => { haptics.selection(); setShareModalVisible(false); }}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Share Modal for Daily Rhythm */}
      <Modal
        visible={shareModalDailyRhythmVisible}
        transparent
        animationType="slide"
        onRequestClose={() => { haptics.selection(); setShareModalDailyRhythmVisible(false); }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Share Your Insight</Text>
            <View style={styles.gradientPickerRow}>
              {LUXURY_GRADIENTS.map((grad, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.gradientCircle, selectedGradient === idx && styles.gradientCircleSelected]}
                  onPress={() => setSelectedGradient(idx)}
                >
                  <View style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: grad[0],
                    borderWidth: 2,
                    borderColor: selectedGradient === idx ? colors.primary[40] : 'transparent',
                  }} />
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.cardPreviewContainer}>
              <View
                ref={shareCardDailyRhythmRef}
                style={{ width: 1080, height: 1920, alignItems: 'center', justifyContent: 'center', position: 'absolute', opacity: 0 }}
                collapsable={false}
              >
                <ShareableInsightCard
                  gradientIndex={selectedGradient}
                  caption={'How My Days Usually Unfold'}
                >
                  <ShareableDailyRhythmCard entries={entries} />
                </ShareableInsightCard>
              </View>
              {/* Scaled-down preview for the modal */}
              <View style={{ width: 270, height: 480, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <View style={{ transform: [{ scale: 0.25 }], width: 1080, height: 1920, alignItems: 'center', justifyContent: 'center' }}>
                  <ShareableInsightCard
                    gradientIndex={selectedGradient}
                    caption={'How My Days Usually Unfold'}
                  >
                    <ShareableDailyRhythmCard entries={entries} />
                  </ShareableInsightCard>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.shareButton} onPress={() => { haptics.selection(); handleConfirmShareDailyRhythm(); }}>
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => { haptics.selection(); setShareModalDailyRhythmVisible(false); }}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Share Modal for Patterns */}
      <Modal
        visible={shareModalPatternsVisible}
        transparent
        animationType="slide"
        onRequestClose={() => { haptics.selection(); setShareModalPatternsVisible(false); }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Share Your Insight</Text>
            <View style={styles.gradientPickerRow}>
              {LUXURY_GRADIENTS.map((grad, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.gradientCircle, selectedGradient === idx && styles.gradientCircleSelected]}
                  onPress={() => setSelectedGradient(idx)}
                >
                  <View style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: grad[0],
                    borderWidth: 2,
                    borderColor: selectedGradient === idx ? colors.primary[40] : 'transparent',
                  }} />
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.cardPreviewContainer}>
              <View
                ref={shareCardPatternsRef}
                style={{ width: 1080, height: 1920, alignItems: 'center', justifyContent: 'center', position: 'absolute', opacity: 0 }}
                collapsable={false}
              >
                <ShareableInsightCard
                  gradientIndex={selectedGradient}
                  caption={"Here’s What I’ve Noticed About Me"}
                >
                  <ShareablePatternInsightCard entries={entries} />
                </ShareableInsightCard>
              </View>
              {/* Scaled-down preview for the modal */}
              <View style={{ width: 270, height: 480, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <View style={{ transform: [{ scale: 0.25 }], width: 1080, height: 1920, alignItems: 'center', justifyContent: 'center' }}>
                  <ShareableInsightCard
                    gradientIndex={selectedGradient}
                    caption={"Here’s What I’ve Noticed About Me"}
                  >
                    <ShareablePatternInsightCard entries={entries} />
                  </ShareableInsightCard>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.shareButton} onPress={() => { haptics.selection(); handleConfirmSharePatterns(); }}>
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => { haptics.selection(); setShareModalPatternsVisible(false); }}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </GradientBackground>
  );
}

// Helper function to process entries by count (each entry counts individually)
const processEntriesByCount = (entries: any[]) => {
  if (entries.length === 0) return [];

  // Count occurrences of each mood
  const moodCounts: Record<string, number> = {};
  entries.forEach(entry => {
    const mood = entry.mood_value;
    moodCounts[mood] = (moodCounts[mood] || 0) + 1;
  });

  // Calculate percentages
  const total = entries.length;
  return Object.entries(moodCounts).map(([mood, count]) => ({
    mood,
    count,
    percentage: Math.round((count / total) * 100)
  }));
};

// Helper function to process entries by day (averaging moods per day)
const processEntriesByDay = (entries: any[]) => {
  if (entries.length === 0) return [];

  // Group entries by day
  const entriesByDay: Record<string, any[]> = {};

  entries.forEach(entry => {
    const date = new Date(entry.timestamp);
    const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

    if (!entriesByDay[dayKey]) {
      entriesByDay[dayKey] = [];
    }

    entriesByDay[dayKey].push(entry);
  });

  // Calculate the dominant mood for each day
  const moodValues: Record<string, number> = {
    'great': 5,
    'good': 4,
    'okay': 3,
    'challenged': 2,
    'struggling': 1
  };

  const dailyMoods: Record<string, number> = {};

  Object.values(entriesByDay).forEach(dayEntries => {
    // Calculate average mood value for the day
    let totalMoodValue = 0;

    dayEntries.forEach(entry => {
      const moodValue = moodValues[entry.mood_value.toLowerCase()] || 3;
      totalMoodValue += moodValue;
    });

    const averageMoodValue = totalMoodValue / dayEntries.length;

    // Determine the closest mood category
    let closestMood = 'okay';
    let smallestDifference = 5;

    Object.entries(moodValues).forEach(([mood, value]) => {
      const difference = Math.abs(value - averageMoodValue);
      if (difference < smallestDifference) {
        smallestDifference = difference;
        closestMood = mood;
      }
    });

    // Count this day's mood
    dailyMoods[closestMood] = (dailyMoods[closestMood] || 0) + 1;
  });

  // Calculate percentages
  const totalDays = Object.keys(entriesByDay).length;
  return Object.entries(dailyMoods).map(([mood, count]) => ({
    mood,
    count,
    percentage: Math.round((count / totalDays) * 100)
  }));
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 32, // more white space
    paddingTop: 48,
    paddingBottom: 48,
    backgroundColor: colors.surface.bright,
    gap: 32, // space between insight cards
  },
  introText: {
    marginBottom: 32,
    color: colors.text.secondary,
    fontSize: 17,
    lineHeight: 25,
  },
  futureText: {
    textAlign: 'center',
    marginTop: 36,
    marginBottom: 36,
    fontStyle: 'italic',
    color: colors.text.tertiary,
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: Math.min(Dimensions.get('window').width - 32, 380),
    alignItems: 'center',
  },
  modalTitle: {
    ...typography.titleLarge,
    marginBottom: 16,
    color: colors.text.primary,
  },
  gradientPickerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  gradientCircle: {
    marginHorizontal: 4,
    padding: 2,
  },
  gradientCircleSelected: {
    borderColor: colors.primary[40],
    borderWidth: 2,
  },
  cardPreviewContainer: {
    marginBottom: 20,
    marginTop: 8,
  },
  shareButton: {
    backgroundColor: colors.primary[40],
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginBottom: 8,
  },
  shareButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 4,
    padding: 8,
  },
  cancelButtonText: {
    color: colors.text.secondary,
    fontSize: 15,
  },
  periodSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
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