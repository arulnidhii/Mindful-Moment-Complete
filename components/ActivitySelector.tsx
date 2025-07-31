import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { BOOSTERS, DRAINERS, Activity } from '@/constants/activities';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ActivitySelectorProps {
  moodValence: 'positive' | 'negative' | 'neutral';
  onSelectionChange: (selection: { boosters: string[]; drainers: string[] }) => void;
  suggestions: string[];
  onSave: () => void;
}

const CUSTOM_TAGS_KEY = 'custom-activity-tags';

const getPrompt = (valence: 'positive' | 'negative' | 'neutral') => {
  if (valence === 'positive') return "What's boosting your mood?";
  if (valence === 'negative') return "What might be draining your energy?";
  return "What's influencing your mood?";
};

const ActivitySelector: React.FC<ActivitySelectorProps> = ({ moodValence, onSelectionChange, suggestions, onSave }) => {
  const [selectedBoosters, setSelectedBoosters] = useState<string[]>([]);
  const [selectedDrainers, setSelectedDrainers] = useState<string[]>([]);
  const [customBoosters, setCustomBoosters] = useState<Activity[]>([]);
  const [customDrainers, setCustomDrainers] = useState<Activity[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newTagType, setNewTagType] = useState<'booster' | 'drainer'>(
    moodValence === 'positive' ? 'booster' : moodValence === 'negative' ? 'drainer' : 'booster'
  );
  const [showAllTags, setShowAllTags] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(CUSTOM_TAGS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setCustomBoosters(parsed.boosters || []);
          setCustomDrainers(parsed.drainers || []);
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    onSelectionChange({ boosters: selectedBoosters, drainers: selectedDrainers });
  }, [selectedBoosters, selectedDrainers]);

  // Update newTagType when moodValence changes
  useEffect(() => {
    setNewTagType(moodValence === 'positive' ? 'booster' : moodValence === 'negative' ? 'drainer' : 'booster');
  }, [moodValence]);

  // Filter activities based on mood valence
  let boosters: Activity[] = [];
  let drainers: Activity[] = [];
  if (moodValence === 'positive') {
    boosters = [...BOOSTERS, ...customBoosters];
  } else if (moodValence === 'negative') {
    drainers = [...DRAINERS, ...customDrainers];
  } else {
    boosters = [...BOOSTERS, ...customBoosters];
    drainers = [...DRAINERS, ...customDrainers];
  }

  // Intelligent tag prioritization algorithm
  const prioritizeTags = (activities: Activity[]): Activity[] => {
    return activities.sort((a, b) => {
      const aIsSuggested = suggestions.includes(a.id);
      const bIsSuggested = suggestions.includes(b.id);
      const aIsCustom = customBoosters.some(cb => cb.id === a.id) || customDrainers.some(cd => cd.id === a.id);
      const bIsCustom = customBoosters.some(cb => cb.id === b.id) || customDrainers.some(cd => cd.id === b.id);
      
      // Priority order: Suggested > Custom > Default
      if (aIsSuggested && !bIsSuggested) return -1;
      if (!aIsSuggested && bIsSuggested) return 1;
      if (aIsCustom && !bIsCustom) return -1;
      if (!aIsCustom && bIsCustom) return 1;
      
      return 0;
    });
  };

  const prioritizedBoosters = prioritizeTags(boosters);
  const prioritizedDrainers = prioritizeTags(drainers);

  // Show initial tags (3x3 grid = 9 tags max)
  const INITIAL_TAG_COUNT = 9;
  const initialBoosters = prioritizedBoosters.slice(0, INITIAL_TAG_COUNT);
  const initialDrainers = prioritizedDrainers.slice(0, INITIAL_TAG_COUNT);
  const remainingBoosters = prioritizedBoosters.slice(INITIAL_TAG_COUNT);
  const remainingDrainers = prioritizedDrainers.slice(INITIAL_TAG_COUNT);

  const handleSelect = (id: string, type: 'booster' | 'drainer') => {
    if (type === 'booster') {
      setSelectedBoosters((prev) =>
        prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
      );
    } else {
      setSelectedDrainers((prev) =>
        prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
      );
    }
  };

  const renderChip = (activity: Activity, type: 'booster' | 'drainer') => {
    const isSelected = type === 'booster' ? selectedBoosters.includes(activity.id) : selectedDrainers.includes(activity.id);
    const isSuggested = suggestions.includes(activity.id);
    const isCustom = customBoosters.some(cb => cb.id === activity.id) || customDrainers.some(cd => cd.id === activity.id);
    
    return (
      <TouchableOpacity
        key={activity.id}
        style={[
          styles.chip,
          isSelected && styles.chipSelected,
          isSuggested && styles.chipSuggested,
          isCustom && styles.chipCustom,
        ]}
        onPress={() => handleSelect(activity.id, type)}
        activeOpacity={0.8}
      >
        <Text style={styles.chipEmoji}>{activity.emoji}</Text>
        <Text style={styles.chipLabel}>{activity.name}</Text>
        {isSuggested && <Text style={styles.suggestedBadge}>✨</Text>}
      </TouchableOpacity>
    );
  };

  // Add custom tag handler
  const handleAddCustomTag = async () => {
    if (!newTag.trim()) return;
    const newActivity: Activity = {
      id: newTag.trim().toLowerCase().replace(/\s+/g, '_'),
      name: newTag.trim(),
      emoji: newTagType === 'booster' ? '✨' : '⚠️',
    };
    if (newTagType === 'booster') {
      const updated = [...customBoosters, newActivity];
      setCustomBoosters(updated);
      // Auto-select the newly added booster
      setSelectedBoosters(prev => [...prev, newActivity.id]);
      await AsyncStorage.setItem(
        CUSTOM_TAGS_KEY,
        JSON.stringify({ boosters: updated, drainers: customDrainers })
      );
    } else {
      const updated = [...customDrainers, newActivity];
      setCustomDrainers(updated);
      // Auto-select the newly added drainer
      setSelectedDrainers(prev => [...prev, newActivity.id]);
      await AsyncStorage.setItem(
        CUSTOM_TAGS_KEY,
        JSON.stringify({ boosters: customBoosters, drainers: updated })
      );
    }
    setShowAdd(false);
    setNewTag('');
  };

  // Determine if Save/Continue should be enabled
  const hasSelection = (moodValence === 'positive' && selectedBoosters.length > 0)
    || (moodValence === 'negative' && selectedDrainers.length > 0)
    || (moodValence === 'neutral' && (selectedBoosters.length > 0 || selectedDrainers.length > 0));

  const totalTags = boosters.length + drainers.length;
  const hasMoreTags = totalTags > INITIAL_TAG_COUNT;

  return (
    <View>
      <Text style={styles.prompt}>{getPrompt(moodValence)}</Text>
      
      {/* Initial Tags Grid */}
      <View style={styles.chipGrid}>
        {moodValence === 'positive' && initialBoosters.map((b) => renderChip(b, 'booster'))}
        {moodValence === 'negative' && initialDrainers.map((d) => renderChip(d, 'drainer'))}
        {moodValence === 'neutral' && (
          <>
            {initialBoosters.map((b) => renderChip(b, 'booster'))}
            {initialDrainers.map((d) => renderChip(d, 'drainer'))}
          </>
        )}
        
        {/* Add custom tag button */}
        <TouchableOpacity style={styles.addChip} onPress={() => setShowAdd(true)}>
          <Text style={styles.addChipPlus}>＋</Text>
          <Text style={styles.addChipText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Show More Tags Button */}
      {hasMoreTags && !showAllTags && (
        <TouchableOpacity 
          style={styles.showMoreButton} 
          onPress={() => setShowAllTags(true)}
        >
          <Text style={styles.showMoreText}>+{totalTags - INITIAL_TAG_COUNT} more</Text>
        </TouchableOpacity>
      )}

      {/* Expanded Tags (when showAllTags is true) */}
      {showAllTags && hasMoreTags && (
        <View style={styles.expandedSection}>
          <Text style={styles.expandedTitle}>More options</Text>
          <View style={styles.chipGrid}>
            {moodValence === 'positive' && remainingBoosters.map((b) => renderChip(b, 'booster'))}
            {moodValence === 'negative' && remainingDrainers.map((d) => renderChip(d, 'drainer'))}
            {moodValence === 'neutral' && (
              <>
                {remainingBoosters.map((b) => renderChip(b, 'booster'))}
                {remainingDrainers.map((d) => renderChip(d, 'drainer'))}
              </>
            )}
          </View>
          <TouchableOpacity 
            style={styles.showLessButton} 
            onPress={() => setShowAllTags(false)}
          >
            <Text style={styles.showLessText}>Show less</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Continue Button - Now always visible */}
      <TouchableOpacity
        style={[styles.saveButton, !hasSelection && styles.saveButtonDisabled]}
        onPress={hasSelection ? onSave : undefined}
        activeOpacity={hasSelection ? 0.85 : 1}
        disabled={!hasSelection}
      >
        <Text style={styles.saveButtonText}>{'Continue'}</Text>
      </TouchableOpacity>

      {/* Add Tag Modal */}
      {showAdd && (
        <View style={styles.addModalOverlay}>
          <View style={styles.addModalContent}>
            <Text style={styles.addModalTitle}>Add Custom Tag</Text>
            <View style={styles.addModalRow}>
              <TextInput
                style={styles.addModalEmoji}
                value={newTagType === 'booster' ? '✨' : '⚠️'}
                editable={false}
              />
              <TextInput
                style={styles.addModalInput}
                value={newTag}
                onChangeText={setNewTag}
                maxLength={18}
                placeholder={newTagType === 'booster' ? 'e.g. Walk' : 'e.g. Overwork'}
              />
            </View>
            <View style={styles.addModalTypeRow}>
              <TouchableOpacity
                style={[styles.addModalTypeButton, newTagType === 'booster' && styles.addModalTypeSelected]}
                onPress={() => setNewTagType('booster')}
              >
                <Text>Booster</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addModalTypeButton, newTagType === 'drainer' && styles.addModalTypeSelected]}
                onPress={() => setNewTagType('drainer')}
              >
                <Text>Drainer</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.addModalActions}>
              <TouchableOpacity style={styles.saveButton} onPress={handleAddCustomTag}>
                <Text style={styles.saveButtonText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAdd(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  prompt: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 16,
    marginLeft: 8,
    color: '#222',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 12,
    marginHorizontal: 8,
    marginBottom: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: '#f7f7f7',
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    elevation: 0,
    position: 'relative',
  },
  chipSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#e6f0fa',
  },
  chipSuggested: {
    borderColor: '#FFD700',
    backgroundColor: '#fffbe6',
  },
  chipCustom: {
    borderColor: '#34C759',
    backgroundColor: '#f0fff4',
  },
  chipEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  chipLabel: {
    fontSize: 15,
    color: '#222',
  },
  suggestedBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    fontSize: 12,
  },
  addChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 10,
  },
  addChipPlus: {
    fontSize: 18,
    marginRight: 6,
    color: '#007AFF',
  },
  addChipText: {
    fontSize: 15,
    color: '#007AFF',
  },
  showMoreButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
  },
  showMoreText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  expandedSection: {
    marginBottom: 16,
  },
  expandedTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    marginLeft: 8,
  },
  showLessButton: {
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  showLessText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  saveButton: {
    marginTop: 8,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 40,
    elevation: 0,
  },
  saveButtonDisabled: {
    backgroundColor: '#b0c4de',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  addModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  addModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: 320,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  addModalTitle: {
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 16,
    color: '#007AFF',
  },
  addModalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  addModalEmoji: {
    fontSize: 24,
    width: 40,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    marginRight: 8,
    backgroundColor: '#f7f7f7',
  },
  addModalInput: {
    flex: 1,
    fontSize: 16,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
  },
  addModalTypeRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  addModalTypeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#eee',
    marginRight: 8,
  },
  addModalTypeSelected: {
    backgroundColor: '#b2f2d6',
  },
  addModalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    backgroundColor: '#eee',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  cancelButtonText: {
    color: '#888',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default ActivitySelector;