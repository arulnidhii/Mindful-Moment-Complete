import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import GradientBackground from '@/components/GradientBackground';
import Button from '@/components/Button';
import Card from '@/components/Card';
import MoodOption from '@/components/MoodOption';
import ProgressDots from '@/components/ProgressDots';
import typography from '@/constants/typography';
import colors from '@/constants/colors';
import moods, { MoodType } from '@/constants/moods';
import { getRandomGuidance } from '@/constants/guidance';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import Animated, { 
  FadeIn, 
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  useAnimatedStyle, 
  useSharedValue, 
  withTiming,
  withSpring
} from 'react-native-reanimated';
import { useUserStore } from '@/store/userStore';
import { useMoodStore } from '@/store/moodStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function GuidedTour() {
  const router = useRouter();
  const setOnboarded = useUserStore((state) => state.setOnboarded);
  const saveMoodEntry = useMoodStore((state) => state.saveMoodEntry);
  
  const [step, setStep] = useState<'mood' | 'guidance' | 'journal' | 'saved'>('mood');
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [guidance, setGuidance] = useState<string>('');
  const [journalNote, setJournalNote] = useState<string>('');
  const [bgColor, setBgColor] = useState<string>(colors.background.primary);
  
  const textOpacity = useSharedValue(0);
  const scale = useSharedValue(1);

  const handleBack = () => {
    Haptics.selectionAsync();
    router.back();
  };

  const handleSkip = () => {
    Haptics.selectionAsync();
    setOnboarded(true);
    router.replace('/(tabs)');
  };

  const handleMoodSelect = (mood: MoodType) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    
    // Set background color based on mood
    const moodObj = moods.find(m => m.id === mood);
    if (moodObj) {
      setBgColor(moodObj.color);
    }
    
    setSelectedMood(mood);
    setGuidance(getRandomGuidance(mood));
    setStep('guidance');
    
    // Animate the guidance text
    textOpacity.value = 0;
    setTimeout(() => {
      textOpacity.value = withTiming(1, { duration: 600 });
    }, 200);
  };

  const handleSaveMoment = async () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    scale.value = withSpring(0.95, {}, () => {
      scale.value = withSpring(1);
    });
    
    // Option: Save this as their first real entry
    if (selectedMood) {
      // Set the current mood in the store so it can be saved
      useMoodStore.getState().setCurrentMood(selectedMood);
      useMoodStore.getState().setJournalNote(journalNote);
      
      // Save the entry
      await saveMoodEntry();
    }
    
    setStep('saved');
    
    // After a brief delay, complete onboarding and go to main app
    setTimeout(() => {
      setOnboarded(true);
      router.replace('/(tabs)');
    }, 1500);
  };
  
  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value
  }));

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const renderMoodSelection = () => (
    <Animated.View 
      style={styles.moodContainer}
      entering={FadeIn.duration(400)}
      exiting={FadeOut.duration(200)}
    >
      <Text style={[typography.headlineMedium, styles.question]}>
        How are you feeling right now?
      </Text>
      
      <View style={styles.moodOptions}>
        {moods.map((mood) => (
          <MoodOption
            key={mood.id}
            mood={mood}
            selected={selectedMood === mood.id}
            onSelect={() => handleMoodSelect(mood.id)}
          />
        ))}
      </View>
    </Animated.View>
  );

  const renderGuidance = () => (
    <Animated.View 
      style={styles.guidanceContainer}
      entering={SlideInRight.duration(400)}
      exiting={SlideOutLeft.duration(200)}
    >
      <Card style={styles.guidanceCard}>
        <Animated.Text 
          style={[typography.bodyLarge, styles.guidanceText, animatedTextStyle]}
        >
          {guidance}
        </Animated.Text>
      </Card>
      
      <Animated.View style={[styles.buttonContainer, animatedButtonStyle]}>
        <Button
          title="Add a Note (Optional)"
          onPress={() => setStep('journal')}
          variant="outlined"
          style={styles.actionButton}
        />
        
        <Button
          title="Save Moment"
          onPress={handleSaveMoment}
          style={styles.actionButton}
        />
      </Animated.View>
    </Animated.View>
  );

  const renderJournal = () => (
    <Animated.View 
      style={styles.journalContainer}
      entering={SlideInRight.duration(400)}
      exiting={SlideOutLeft.duration(200)}
    >
      <Text style={[typography.titleLarge, styles.journalTitle]}>
        A quick thought about this moment
      </Text>
      
      <TextInput
        style={styles.journalInput}
        placeholder="e.g., Feeling content after a walk..."
        placeholderTextColor={colors.text.tertiary}
        value={journalNote}
        onChangeText={setJournalNote}
        multiline
        maxLength={150}
      />
      
      <Text style={styles.characterCount}>
        {journalNote.length}/150
      </Text>
      
      <Animated.View style={[styles.buttonContainer, animatedButtonStyle]}>
        <Button
          title="Save Moment"
          onPress={handleSaveMoment}
          style={styles.actionButton}
        />
      </Animated.View>
    </Animated.View>
  );

  const renderSaved = () => (
    <Animated.View 
      style={styles.savedContainer}
      entering={FadeIn.duration(400)}
    >
      <Text style={[typography.headlineMedium, styles.savedTitle]}>
        Moment Saved!
      </Text>
      
      <Text style={[typography.bodyMedium, styles.savedText]}>
        Taking you to your dashboard...
      </Text>
    </Animated.View>
  );

  return (
    <Animated.View 
      style={[styles.backgroundContainer, { backgroundColor: bgColor }]}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.navRow}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.navButton}
            accessibilityLabel="Go back"
            accessible
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="arrow-back" size={28} color={colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSkip}
            style={styles.navButton}
            accessibilityLabel="Skip onboarding"
            accessible
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <Animated.View 
              style={styles.header}
              entering={FadeIn.duration(400)}
            >
              <Text style={[typography.headlineSmall, styles.headerTitle]}>
                Let's Walk Through Your First Mindful Moment
              </Text>
              <Text style={[typography.bodySmall, styles.headerSubtitle]}>
                This guided tour will show you how to check in with your feelings
              </Text>
            </Animated.View>
            
            <View style={styles.content}>
              {step === 'mood' && renderMoodSelection()}
              {step === 'guidance' && renderGuidance()}
              {step === 'journal' && renderJournal()}
              {step === 'saved' && renderSaved()}
            </View>
            
            <Animated.View 
              style={styles.footer}
              entering={FadeIn.duration(400).delay(200)}
            >
              <ProgressDots total={4} current={3} />
            </Animated.View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  headerTitle: {
    marginBottom: 8,
    color: colors.text.primary,
  },
  headerSubtitle: {
    textAlign: 'center',
    opacity: 0.7,
    color: colors.text.secondary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  
  // Mood selection
  moodContainer: {
    alignItems: 'center',
  },
  question: {
    textAlign: 'center',
    marginBottom: 32,
    color: colors.text.primary,
  },
  moodOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  
  // Guidance
  guidanceContainer: {
    alignItems: 'center',
  },
  guidanceCard: {
    marginBottom: 32,
    width: '100%',
  },
  guidanceText: {
    textAlign: 'center',
    fontStyle: 'italic',
    color: colors.text.primary,
  },
  buttonContainer: {
    width: '100%',
  },
  actionButton: {
    marginTop: 16,
    width: '100%',
  },
  
  // Journal
  journalContainer: {
    alignItems: 'center',
  },
  journalTitle: {
    marginBottom: 24,
    textAlign: 'center',
    color: colors.text.primary,
  },
  journalInput: {
    width: '100%',
    minHeight: 120,
    backgroundColor: colors.background.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text.primary,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  characterCount: {
    alignSelf: 'flex-end',
    color: colors.text.tertiary,
    marginBottom: 24,
  },
  
  // Saved
  savedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedTitle: {
    marginBottom: 16,
    color: colors.text.primary,
  },
  savedText: {
    textAlign: 'center',
    opacity: 0.7,
    color: colors.text.secondary,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 8,
    marginTop: 4,
    marginBottom: 8,
    minHeight: 44,
  },
  navButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipText: {
    color: colors.text.secondary,
    fontSize: 16,
    opacity: 0.8,
  },
});