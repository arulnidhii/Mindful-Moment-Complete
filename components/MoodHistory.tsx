import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert } from 'react-native';
import Card from './Card';
import Button from './Button';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { MoodEntry } from '@/types/mood';
import { format } from '@/utils/dateFormatter';
// Removed lucide-react-native to avoid extra dependency; using MaterialIcons instead
import { haptics } from '@/utils/haptics';
import Animated, { 
  FadeOut, 
  FadeIn, 
  SlideInRight, 
  Layout
} from 'react-native-reanimated';
import { Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface MoodHistoryProps {
  entries: MoodEntry[];
  emptyMessage?: string;
  onDeleteEntries?: (entryIds: string[]) => void;
}

const MoodHistory: React.FC<MoodHistoryProps> = ({ 
  entries, 
  emptyMessage = "You haven't recorded any moments yet. Start by checking in with your mood.",
  onDeleteEntries
}) => {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);

  const toggleSelectionMode = () => {
    haptics.selection();
    setSelectionMode(!selectionMode);
    setSelectedEntries([]);
  };

  const toggleEntrySelection = (entryId: string) => {
    haptics.light();
    
    setSelectedEntries(prev => {
      if (prev.includes(entryId)) {
        return prev.filter(id => id !== entryId);
      } else {
        return [...prev, entryId];
      }
    });
  };

  const selectAllEntries = () => {
    haptics.medium();
    
    if (selectedEntries.length === entries.length) {
      setSelectedEntries([]);
    } else {
      setSelectedEntries(entries.map(entry => entry.entry_id));
    }
  };

  const confirmDelete = () => {
    if (selectedEntries.length === 0) return;
    
    haptics.warning();
    
    Alert.alert(
      "Delete Moments",
      `Are you sure you want to delete ${selectedEntries.length} moment${selectedEntries.length > 1 ? 's' : ''}?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            haptics.heavy();
            onDeleteEntries?.(selectedEntries);
            setSelectionMode(false);
            setSelectedEntries([]);
          }
        }
      ]
    );
  };

  const renderItem = ({ item, index }: { item: MoodEntry, index: number }) => {
    const isSelected = selectedEntries.includes(item.entry_id);
    
    const handlePress = () => {
      if (selectionMode) {
        toggleEntrySelection(item.entry_id);
      }
    };
    
    const handleLongPress = () => {
      if (!selectionMode) {
        haptics.medium();
        toggleSelectionMode();
        toggleEntrySelection(item.entry_id);
      }
    };
    
    // Get the appropriate color from the Material 3 palette
    const getMoodColor = (mood: string): string => {
      const moodKey = mood.toLowerCase() as keyof typeof colors.mood;
      return colors.mood[moodKey]?.medium || colors.primary[40];
    };
    
    return (
      <Animated.View 
        style={styles.entryCardContainer}
        entering={Platform.OS !== 'web' ? SlideInRight.delay(index * 50).duration(300) : FadeIn}
        exiting={Platform.OS !== 'web' ? FadeOut.duration(300) : FadeOut}
        layout={Platform.OS !== 'web' ? Layout.springify() : undefined}
      >
        <Card 
          style={[
            styles.entryCard, 
            isSelected && { borderColor: colors.primary[40], borderWidth: 2 }
          ] as any}
          elevation={isSelected ? 2 : 1}
          onPress={handlePress}
        >
          {selectionMode && (
            <TouchableOpacity 
              style={styles.checkbox}
              onPress={() => toggleEntrySelection(item.entry_id)}
            >
              {isSelected ? (
                <MaterialIcons name="check-circle" size={24} color={colors.primary[40]} />
              ) : (
                <MaterialIcons name="radio-button-unchecked" size={24} color={colors.text.secondary} />
              )}
            </TouchableOpacity>
          )}
          
          <View style={[styles.entryContent, selectionMode && styles.entryContentWithCheckbox]}>
            <View style={styles.entryHeader}>
              <View style={styles.timestampContainer}>
                <MaterialIcons name="access-time" size={14} color={colors.text.secondary} />
                <Text style={[typography.bodySmall, styles.timestamp]}>
                  {format(item.timestamp)}
                </Text>
              </View>
              
              <View 
                style={[
                  styles.moodBadge, 
                  { backgroundColor: getMoodColor(item.mood_value) + '20' }
                ]}
              >
                <Text style={styles.moodIcon}>{getMoodIcon(item.mood_value)}</Text>
                <Text 
                  style={[
                    styles.moodLabel,
                    { color: getMoodColor(item.mood_value) }
                  ]}
                >
                  {item.mood_value}
                </Text>
              </View>
            </View>
            
            <Text style={[typography.bodyMedium, styles.guidanceText]}>
              {item.guidance_text_shown}
            </Text>
            
            {item.journal_note ? (
              <View style={styles.journalContainer}>
                <View style={styles.journalHeader}>
                  <MaterialIcons name="chat" size={14} color={colors.text.secondary} />
                  <Text style={[typography.labelSmall, styles.journalLabel]}>
                    Your note:
                  </Text>
                </View>
                <Text style={[typography.bodyMedium, styles.journalText]}>
                  {item.journal_note}
                </Text>
              </View>
            ) : (
              <Text style={[typography.bodySmall, styles.noNote]}>
                No note recorded
              </Text>
            )}
            {/* Boosters and Drainers Pills */}
            {(item.boosters?.length || item.drainers?.length) ? (
              <View style={styles.pillRow}>
                {item.boosters?.map((id) => (
                  <View key={id} style={[styles.pill, styles.boosterPill]}>
                    <Text style={styles.pillText}>{id}</Text>
                  </View>
                ))}
                {item.drainers?.map((id) => (
                  <View key={id} style={[styles.pill, styles.drainerPill]}>
                    <Text style={styles.pillText}>{id}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        </Card>
      </Animated.View>
    );
  };

  const getMoodIcon = (mood: string): string => {
    switch (mood.toLowerCase()) {
      case 'great': return '😊';
      case 'good': return '🙂';
      case 'okay': return '😐';
      case 'challenged': return '😕';
      case 'struggling': return '😞';
      default: return '😐';
    }
  };

  if (entries.length === 0) {
    return (
      <Animated.View 
        style={styles.emptyContainer}
        entering={FadeIn.duration(300)}
      >
        <Text style={[typography.bodyLarge, styles.emptyText]}>
          {emptyMessage}
        </Text>
      </Animated.View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {selectionMode ? (
          <>
            <TouchableOpacity onPress={selectAllEntries} style={styles.selectAllButton}>
              <Text style={styles.selectAllText}>
                {selectedEntries.length === entries.length ? "Deselect All" : "Select All"}
              </Text>
            </TouchableOpacity>
            
            <Text style={styles.selectedCount}>
              {selectedEntries.length} selected
            </Text>
            
            <TouchableOpacity 
              onPress={toggleSelectionMode}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity onPress={toggleSelectionMode} style={styles.selectButton}>
            <Text style={styles.selectText}>Select</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <FlatList
        data={entries}
        renderItem={renderItem}
        keyExtractor={(item) => item.entry_id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
      
      {selectionMode && selectedEntries.length > 0 && (
        <Animated.View 
          style={styles.actionBar}
          entering={FadeIn.duration(200)}
        >
          <Button
            title={`Delete ${selectedEntries.length} Moment${selectedEntries.length > 1 ? 's' : ''}`}
            onPress={confirmDelete}
            style={styles.deleteButton}
            icon={<MaterialIcons name="delete" size={18} color={colors.neutral[99]} />}
          />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.bright,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.outline,
  },
  selectButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  selectText: {
    color: colors.primary[40],
    fontWeight: '500',
  },
  selectAllButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  selectAllText: {
    color: colors.primary[40],
    fontWeight: '500',
  },
  selectedCount: {
    flex: 1,
    textAlign: 'center',
    color: colors.text.secondary,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelText: {
    color: colors.text.secondary,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  entryCardContainer: {
    marginBottom: 16,
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
    overflow: 'hidden',
  },
  checkbox: {
    padding: 16,
  },
  entryContent: {
    flex: 1,
    padding: 20,
  },
  entryContentWithCheckbox: {
    paddingLeft: 0,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    marginLeft: 4,
    color: colors.text.secondary,
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  moodIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  guidanceText: {
    marginBottom: 16,
    fontStyle: 'italic',
    color: colors.text.primary,
  },
  journalContainer: {
    backgroundColor: colors.surface.containerLow,
    padding: 12,
    borderRadius: 8,
  },
  journalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  journalLabel: {
    marginLeft: 4,
    color: colors.text.secondary,
  },
  journalText: {
    color: colors.text.primary,
  },
  noNote: {
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 6,
    marginBottom: 6,
  },
  boosterPill: {
    backgroundColor: '#e6f9ed',
    borderColor: '#b2f2d6',
    borderWidth: 1,
  },
  drainerPill: {
    backgroundColor: '#ffeaea',
    borderColor: '#ffb3b3',
    borderWidth: 1,
  },
  pillText: {
    fontSize: 13,
    color: colors.text.primary,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface.containerLowest,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.outline,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  deleteButton: {
    backgroundColor: colors.accent[40],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.text.secondary,
  },
});

export default MoodHistory;