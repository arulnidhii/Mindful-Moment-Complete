import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, Platform, Button as RNButton, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '@/components/Button';
import Card from '@/components/Card';
import MoodOption from '@/components/MoodOption';
import MilestonePopup from '@/components/MilestonePopup';
import typography from '@/constants/typography';
import colors from '@/constants/colors';
import moods from '@/constants/moods';
import { useMoodStore } from '@/store/moodStore';
import { useStreakStore } from '@/store/streakStore';
import { useReminderStore } from '@/store/reminderStore';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInRight, 
  SlideOutLeft,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  Easing
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { rescheduleAllNotifications } from '@/utils/notifications';
import { useUserStore } from '@/store/userStore';
import { haptics } from '@/utils/haptics';
import ActivitySelector from '@/components/ActivitySelector';

export default function CheckInScreen() {
  const router = useRouter();
  const { 
    currentMood, 
    currentGuidance, 
    journalNote,
    setCurrentMood,
    setJournalNote,
    saveMoodEntry,
    clearCurrentEntry,
    setBoosters,
    setDrainers
  } = useMoodStore();
  
  const [step, setStep] = useState<'mood' | 'guidance' | 'journal' | 'saved'>(
    currentMood ? 'guidance' : 'mood'
  );
  
  const [bgColor, setBgColor] = useState<string>(colors.surface.bright);
  const [showMilestone, setShowMilestone] = useState<string | null>(null);
  
  // Animation values
  const textOpacity = useSharedValue(0);
  const cardScale = useSharedValue(1);
  
  const reminder = useReminderStore();
  const userName = useUserStore((state) => state.userName);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedActivities, setSelectedActivities] = useState<{ boosters: string[]; drainers: string[] }>({ boosters: [], drainers: [] });
  const [activitySelectorVisible, setActivitySelectorVisible] = useState(false);

  // Helper to determine mood valence
  const getMoodValence = (mood: string | null): 'positive' | 'negative' | 'neutral' => {
    if (!mood) return 'neutral';
    if (mood === 'great' || mood === 'good') return 'positive';
    if (mood === 'challenged' || mood === 'struggling') return 'negative';
    return 'neutral';
  };

  const handleMoodSelect = (mood: string) => {
    haptics.selection();
    
    // Set background color based on mood
    const moodColors = colors.mood[mood as keyof typeof colors.mood];
    setBgColor(moodColors.container);
    
    setCurrentMood(mood);
    setStep('guidance');
    
    // Animate the guidance text
    textOpacity.value = 0;
    setTimeout(() => {
      textOpacity.value = withTiming(1, { duration: 600 });
    }, 200);
  };

  const handleSaveMoment = async () => {
    // Animate card
    cardScale.value = withSequence(
      withTiming(1.05, { duration: 200, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
      withTiming(1, { duration: 200, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
    );
    
    // Set boosters and drainers in the store
    setBoosters(selectedActivities.boosters);
    setDrainers(selectedActivities.drainers);

    // Save the entry and check for milestones
    const milestone = await saveMoodEntry();
    
    setStep('saved');
    
    // If a milestone was achieved, show the popup
    if (milestone) {
      setTimeout(() => {
        setShowMilestone(milestone);
      }, 1000);
    } else {
      // After a brief delay, reset the screen
      setTimeout(() => {
        setStep('mood');
        setBgColor(colors.surface.bright);
      }, 1500);
    }
  };

  const handleAddNote = () => {
    haptics.selection(); // Use selection for note add for consistency
    setStep('journal');
  };

  const handleCancel = () => {
    haptics.selection(); // Use selection for cancel for consistency
    clearCurrentEntry();
    setStep('mood');
    setBgColor(colors.surface.bright);
  };
  
  const handleCloseMilestone = () => {
    setShowMilestone(null);
    setStep('mood');
    setBgColor(colors.surface.bright);
  };

  const handleSaveActivities = () => {
    setActivitySelectorVisible(false);
    setStep('journal');
  };
  
  // Reset background color when returning to mood selection
  useEffect(() => {
    if (step === 'mood') {
      setBgColor(colors.surface.bright);
    }
  }, [step]);
  
  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      opacity: textOpacity.value
    };
  });
  
  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: cardScale.value }]
    };
  });

  // Helper to schedule notification
  const scheduleReminderNotification = async (time: string) => {
    // Cancel all previous notifications
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!reminder.enabled) return;
    const [hour, minute] = time.split(':').map(Number);
    // Schedule for each enabled day
    Object.entries(reminder.days).forEach(async ([day, enabled]) => {
      if (enabled) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Mindful Moment',
            body: 'Ready for a mindful pause? Check in with yourself.',
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          trigger: {
            type: 'weekly',
            weekday: getWeekdayNumber(day),
            hour,
            minute,
          },
        });
      }
    });
  };

  // Helper to map day string to weekday number (1=Sunday, 7=Saturday)
  const getWeekdayNumber = (day: string) => {
    switch (day) {
      case 'sunday': return 1;
      case 'monday': return 2;
      case 'tuesday': return 3;
      case 'wednesday': return 4;
      case 'thursday': return 5;
      case 'friday': return 6;
      case 'saturday': return 7;
      default: return 1;
    }
  };

  // Watch for changes to reminder settings and reschedule notifications
  useEffect(() => {
    const { lastNotificationDate } = useUserStore.getState();
    rescheduleAllNotifications(reminder.enabled, reminder.time, userName || 'friend', lastNotificationDate);
  }, [reminder.enabled, reminder.time, userName]);

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
        {moods.map((mood, index) => (
          <MoodOption
            key={mood.id}
            mood={mood}
            selected={currentMood === mood.id}
            onSelect={() => handleMoodSelect(mood.id)}
            index={index}
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
      <Animated.View style={animatedCardStyle}>
        <Card style={styles.guidanceCard} elevation={3}>
          <Animated.Text 
            style={[typography.bodyLarge, styles.guidanceText, animatedTextStyle]}
          >
            {currentGuidance}
          </Animated.Text>
        </Card>
      </Animated.View>
      {/* ActivitySelector integration */}
      <ActivitySelector
        moodValence={getMoodValence(currentMood)}
        onSelectionChange={setSelectedActivities}
        suggestions={[]}
        onSave={handleSaveActivities}
      />
      {/* Remove Add a Note and Save Moment buttons from here, move to journal step */}
      <Button
        title="Back"
        onPress={handleCancel}
        variant="text"
        style={{ ...styles.actionButton, ...styles.cancelButton }}
        icon={<MaterialIcons name="arrow-back" size={24} color={colors.primary[40]} />}
      />
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
        placeholderTextColor={colors.semantic.onSurfaceVariant}
        value={journalNote}
        onChangeText={setJournalNote}
        multiline
        maxLength={150}
      />
      
      <Text style={styles.characterCount}>
        {journalNote.length}/150
      </Text>
      
      <View style={styles.actionsContainer}>
        <Button
          title="Save Moment"
          onPress={handleSaveMoment}
          style={styles.actionButton}
          icon={<MaterialIcons name="send" size={24} color={colors.neutral[99]} />}
        />
        
        <Button
          title="Back"
          onPress={() => {
            haptics.selection(); // Use selection for back for consistency
            setStep('guidance');
          }}
          variant="text"
          style={styles.actionButton}
          icon={<MaterialIcons name="arrow-back" size={24} color={colors.primary[40]} />}
        />
      </View>
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
        Your mindful moment has been recorded.
      </Text>
    </Animated.View>
  );

  // Add a section at the bottom for reminder settings
  // (REMOVED: now in Settings screen)
  return (
    <Animated.View 
      style={[styles.backgroundContainer, { backgroundColor: bgColor }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.content}>
            {step === 'mood' && renderMoodSelection()}
            {step === 'guidance' && renderGuidance()}
            {step === 'journal' && renderJournal()}
            {step === 'saved' && renderSaved()}
          </View>
        </View>
      </ScrollView>
      {showMilestone && (
        <MilestonePopup 
          milestone={showMilestone} 
          onClose={handleCloseMilestone}
        />
      )}
    </Animated.View>
  );
}

// Helper to parse HH:MM string to Date
function parseTime(time: string) {
  const [hour, minute] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hour);
  date.setMinutes(minute);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
}

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    backgroundColor: colors.surface.bright,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 32, // increased for more white space
    paddingTop: 48,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 32, // add vertical spacing between sections
  },
  
  // Mood selection
  moodContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  question: {
    textAlign: 'center',
    marginBottom: 32,
    color: colors.text.primary,
  },
  moodCarousel: {
    paddingHorizontal: 10, // Add some horizontal padding for the carousel
  },
  moodOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    marginBottom: 32,
    maxWidth: 340, // keep grid centered and compact
    alignSelf: 'center',
  },
  
  // Guidance
  guidanceContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  guidanceCard: {
    marginBottom: 32,
    width: '100%',
    padding: 32, // more padding for card
  },
  guidanceText: {
    textAlign: 'center',
    fontStyle: 'italic',
    color: colors.text.primary,
  },
  actionsContainer: {
    width: '100%',
    gap: 16,
    marginTop: 16,
  },
  actionButton: {
    marginTop: 8,
    width: '100%',
  },
  cancelButton: {
    marginTop: 16,
  },
  
  // Journal
  journalContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  journalTitle: {
    marginBottom: 24,
    textAlign: 'center',
    color: colors.text.primary,
  },
  journalInput: {
    width: '100%',
    minHeight: 120,
    backgroundColor: colors.surface.containerLowest,
    borderRadius: 16,
    padding: 20,
    fontSize: 16,
    color: colors.text.primary,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  characterCount: {
    alignSelf: 'flex-end',
    color: colors.text.secondary,
    marginBottom: 24,
  },
  
  // Saved
  savedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 48,
  },
  savedTitle: {
    marginBottom: 16,
    color: colors.text.primary,
  },
  savedText: {
    textAlign: 'center',
    color: colors.text.secondary,
  },
  reminderSection: {
    marginTop: 32,
    padding: 16,
    backgroundColor: colors.surface.container,
    borderRadius: 16,
    alignItems: 'flex-start',
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 8,
  },
});