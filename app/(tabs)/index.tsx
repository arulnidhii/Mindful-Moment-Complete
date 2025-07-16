import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, Platform, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '@/components/Button';
import Card from '@/components/Card';
import MoodOption from '@/components/MoodOption';
import MilestonePopup from '@/components/MilestonePopup';
import typography from '@/constants/typography';
import colors from '@/constants/colors';
import moods, { MoodType } from '@/constants/moods';
import { useMoodStore } from '@/store/moodStore';
import { useStreakStore } from '@/store/streakStore';
import { haptics } from '@/utils/haptics';
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

export default function CheckInScreen() {
  const router = useRouter();
  const { 
    currentMood, 
    currentGuidance, 
    journalNote,
    setCurrentMood,
    setJournalNote,
    saveMoodEntry,
    clearCurrentEntry
  } = useMoodStore();
  
  const [step, setStep] = useState<'mood' | 'guidance' | 'journal' | 'saved'>(
    currentMood ? 'guidance' : 'mood'
  );
  
  const [bgColor, setBgColor] = useState<string>(colors.surface.bright);
  const [showMilestone, setShowMilestone] = useState<string | null>(null);
  
  // Animation values
  const textOpacity = useSharedValue(0);
  const cardScale = useSharedValue(1);
  
  const handleMoodSelect = (mood: MoodType) => {
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
      
      <View style={styles.actionsContainer}>
        <Button
          title="Add a Note"
          onPress={handleAddNote}
          variant="tonal"
          style={styles.actionButton}
          icon={<MaterialIcons name="edit" size={24} color={colors.accent[40]} />}
        />
        
        <Button
          title="Save Moment"
          onPress={handleSaveMoment}
          style={styles.actionButton}
          icon={<MaterialIcons name="send" size={24} color={colors.neutral[99]} />}
        />
        
        <Button
          title="Back"
          onPress={handleCancel}
          variant="text"
          style={[styles.actionButton, styles.cancelButton]}
          icon={<MaterialIcons name="arrow-back" size={24} color={colors.primary[40]} />}
        />
      </View>
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
});