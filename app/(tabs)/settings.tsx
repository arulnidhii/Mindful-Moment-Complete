import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button as RNButton, Platform, Switch, Modal, TouchableOpacity, FlatList, Alert, KeyboardAvoidingView, Platform as RNPlatform, ScrollView } from 'react-native';
import { useUserStore } from '@/store/userStore';
import { useReminderStore } from '@/store/reminderStore';
import DateTimePicker from '@react-native-community/datetimepicker';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { Ionicons } from '@expo/vector-icons';
import { Activity } from '@/constants/activities';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CUSTOM_TAGS_KEY = 'custom-activity-tags';

export default function SettingsScreen() {
  const userName = useUserStore((state) => state.userName);
  const setUserName = useUserStore((state) => state.setUserName);
  const reminder = useReminderStore();
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(userName);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Notification toggles state (persisted in local storage for now)
  const [weeklyTeaserEnabled, setWeeklyTeaserEnabled] = useState(true);
  const [gentleEncouragementEnabled, setGentleEncouragementEnabled] = useState(true);

  // Custom Activities State
  const [customBoosters, setCustomBoosters] = useState<Activity[]>([]);
  const [customDrainers, setCustomDrainers] = useState<Activity[]>([]);
  const [showTagModal, setShowTagModal] = useState(false);
  const [editingTag, setEditingTag] = useState<Activity | null>(null);
  const [tagType, setTagType] = useState<'booster' | 'drainer'>('booster');
  const [tagName, setTagName] = useState('');
  const [tagEmoji, setTagEmoji] = useState('✨');

  useEffect(() => {
    // Load from AsyncStorage
    (async () => {
      try {
        const weekly = await AsyncStorage.getItem('weeklyTeaserEnabled');
        const gentle = await AsyncStorage.getItem('gentleEncouragementEnabled');
        if (weekly !== null) setWeeklyTeaserEnabled(weekly === 'true');
        if (gentle !== null) setGentleEncouragementEnabled(gentle === 'true');
      } catch {}
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('weeklyTeaserEnabled', String(weeklyTeaserEnabled));
  }, [weeklyTeaserEnabled]);
  useEffect(() => {
    AsyncStorage.setItem('gentleEncouragementEnabled', String(gentleEncouragementEnabled));
  }, [gentleEncouragementEnabled]);

  // Load custom tags on mount
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

  // Save custom tags
  const saveCustomTags = async (boosters: Activity[], drainers: Activity[]) => {
    setCustomBoosters(boosters);
    setCustomDrainers(drainers);
    await AsyncStorage.setItem(CUSTOM_TAGS_KEY, JSON.stringify({ boosters, drainers }));
  };

  // Add or edit tag
  const handleSaveTag = () => {
    if (!tagName.trim()) return;
    const newTag: Activity = {
      id: tagName.trim().toLowerCase().replace(/\s+/g, '_'),
      name: tagName.trim(),
      emoji: tagEmoji,
    };
    if (editingTag) {
      // Edit
      if (tagType === 'booster') {
        const updated = customBoosters.map(t => t.id === editingTag.id ? newTag : t);
        saveCustomTags(updated, customDrainers);
      } else {
        const updated = customDrainers.map(t => t.id === editingTag.id ? newTag : t);
        saveCustomTags(customBoosters, updated);
      }
    } else {
      // Add
      if (tagType === 'booster') {
        const updated = [...customBoosters, newTag];
        saveCustomTags(updated, customDrainers);
      } else {
        const updated = [...customDrainers, newTag];
        saveCustomTags(customBoosters, updated);
      }
    }
    setShowTagModal(false);
    setEditingTag(null);
    setTagName('');
    setTagEmoji(tagType === 'booster' ? '✨' : '⚠️');
  };

  // Delete tag
  const handleDeleteTag = (tag: Activity, type: 'booster' | 'drainer') => {
    Alert.alert('Delete Tag', `Are you sure you want to delete "${tag.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        if (type === 'booster') {
          const updated = customBoosters.filter(t => t.id !== tag.id);
          saveCustomTags(updated, customDrainers);
        } else {
          const updated = customDrainers.filter(t => t.id !== tag.id);
          saveCustomTags(customBoosters, updated);
        }
      }}
    ]);
  };

  // Open modal for add/edit
  const openTagModal = (type: 'booster' | 'drainer', tag?: Activity) => {
    setTagType(type);
    setEditingTag(tag || null);
    setTagName(tag ? tag.name : '');
    setTagEmoji(tag ? tag.emoji : (type === 'booster' ? '✨' : '⚠️'));
    setShowTagModal(true);
  };

  // Render tag pill
  const renderTagPill = (tag: Activity, type: 'booster' | 'drainer') => (
    <TouchableOpacity
      key={tag.id}
      style={[styles.tagPill, type === 'booster' ? styles.boosterPill : styles.drainerPill]}
      onPress={() => openTagModal(type, tag)}
    >
      <Text style={styles.tagEmoji}>{tag.emoji}</Text>
      <Text style={styles.tagText}>{tag.name}</Text>
      <TouchableOpacity onPress={() => handleDeleteTag(tag, type)} style={styles.deleteIcon}>
        <Ionicons name="trash-outline" size={18} color="#d32f2f" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={typography.headlineSmall}>Settings</Text>
      {/* Name Change */}
      <View style={styles.section}>
        <Text style={typography.titleMedium}>Display Name</Text>
        {editingName ? (
          <View style={styles.row}>
            <TextInput
              style={styles.nameInput}
              value={newName}
              onChangeText={setNewName}
              maxLength={24}
              autoFocus
            />
            <RNButton
              title="Save"
              onPress={() => {
                setUserName(newName);
                setEditingName(false);
              }}
            />
            <RNButton
              title="Cancel"
              onPress={() => {
                setNewName(userName);
                setEditingName(false);
              }}
            />
          </View>
        ) : (
          <View style={styles.row}>
            <Text style={typography.bodyLarge}>{userName}</Text>
            <RNButton title="Edit" onPress={() => setEditingName(true)} />
          </View>
        )}
      </View>
      {/* Reminder Settings */}
      <View style={styles.section}>
        <Text style={typography.titleMedium}>Daily Reminder</Text>
        <View style={styles.row}>
          <Text style={typography.bodyMedium}>
            {reminder.enabled ? `Remind me at ${reminder.time}` : 'Reminders off'}
          </Text>
          <RNButton
            title={reminder.enabled ? 'Disable' : 'Enable'}
            onPress={reminder.toggleEnabled}
          />
        </View>
        {reminder.enabled && (
          <View style={styles.row}>
            <RNButton
              title="Change Time"
              onPress={() => setShowTimePicker(true)}
            />
            {showTimePicker && (
              <DateTimePicker
                value={parseTime(reminder.time)}
                mode="time"
                is24Hour={true}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowTimePicker(false);
                  if (selectedDate) {
                    const hours = selectedDate.getHours().toString().padStart(2, '0');
                    const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
                    reminder.setTime(`${hours}:${minutes}`);
                  }
                }}
              />
            )}
          </View>
        )}
      </View>
      {/* Notification Toggles */}
      <View style={styles.section}>
        <Text style={typography.titleMedium}>Notifications</Text>
        <View style={styles.row}>
          <Text style={typography.bodyMedium}>Weekly Insight Teaser</Text>
          <Switch
            value={weeklyTeaserEnabled}
            onValueChange={setWeeklyTeaserEnabled}
          />
        </View>
        <View style={styles.row}>
          <Text style={typography.bodyMedium}>Gentle Encouragement</Text>
          <Switch
            value={gentleEncouragementEnabled}
            onValueChange={setGentleEncouragementEnabled}
          />
        </View>
      </View>
      {/* Custom Activities Section */}
      <View style={styles.section}>
        <Text style={typography.titleMedium}>Custom Activities</Text>
        <Text style={styles.customDesc}>Personalize your boosters and drainers for a more meaningful experience.</Text>
        <Text style={styles.groupLabel}>Boosters</Text>
        <View style={styles.tagRow}>
          {customBoosters.length === 0 && <Text style={styles.emptyText}>No custom boosters yet.</Text>}
          {customBoosters.map(tag => renderTagPill(tag, 'booster'))}
        </View>
        <Text style={styles.groupLabel}>Drainers</Text>
        <View style={styles.tagRow}>
          {customDrainers.length === 0 && <Text style={styles.emptyText}>No custom drainers yet.</Text>}
          {customDrainers.map(tag => renderTagPill(tag, 'drainer'))}
        </View>
        <TouchableOpacity style={styles.addTagButton} onPress={() => openTagModal('booster')}>
          <Ionicons name="add-circle-outline" size={22} color="#007AFF" />
          <Text style={styles.addTagText}>Add Custom Booster</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addTagButton} onPress={() => openTagModal('drainer')}>
          <Ionicons name="add-circle-outline" size={22} color="#d32f2f" />
          <Text style={styles.addTagText}>Add Custom Drainer</Text>
        </TouchableOpacity>
      </View>
      {/* Tag Modal */}
      <Modal
        visible={showTagModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTagModal(false)}
      >
        <KeyboardAvoidingView
          behavior={RNPlatform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingTag ? 'Edit Tag' : 'Add Custom Tag'}</Text>
            <View style={styles.modalRow}>
              <TextInput
                style={styles.emojiInput}
                value={tagEmoji}
                onChangeText={setTagEmoji}
                maxLength={2}
                placeholder={tagType === 'booster' ? '✨' : '⚠️'}
              />
              <TextInput
                style={styles.nameInput}
                value={tagName}
                onChangeText={setTagName}
                maxLength={18}
                placeholder={tagType === 'booster' ? 'e.g. Walk' : 'e.g. Overwork'}
              />
            </View>
            <View style={styles.modalTypeRow}>
              <TouchableOpacity
                style={[styles.typeButton, tagType === 'booster' && styles.typeSelected]}
                onPress={() => setTagType('booster')}
              >
                <Text>Booster</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, tagType === 'drainer' && styles.typeSelected]}
                onPress={() => setTagType('drainer')}
              >
                <Text>Drainer</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveTag}>
                <Text style={styles.saveButtonText}>{editingTag ? 'Save Changes' : 'Add Tag'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowTagModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

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
  container: {
    flex: 1,
    padding: 24,
    paddingBottom: 100, // Add extra padding for bottom navigation
    backgroundColor: colors.background.primary,
  },
  section: {
    marginTop: 32,
    marginBottom: 16,
    padding: 16,
    backgroundColor: colors.surface.container,
    borderRadius: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 8,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: 12,
    padding: 10,
    fontSize: 18,
    color: colors.text.primary,
    backgroundColor: colors.surface.container,
    minWidth: 120,
    marginRight: 8,
  },
  customDesc: {
    color: colors.text.secondary,
    marginBottom: 8,
    fontSize: 15,
  },
  groupLabel: {
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
    color: colors.primary[40],
    fontSize: 15,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
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
  tagEmoji: {
    fontSize: 18,
    marginRight: 6,
  },
  tagText: {
    fontSize: 15,
    color: colors.text.primary,
    marginRight: 8,
  },
  deleteIcon: {
    marginLeft: 2,
    padding: 2,
  },
  addTagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginTop: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  addTagText: {
    fontSize: 15,
    color: colors.primary[40],
    marginLeft: 6,
  },
  emptyText: {
    color: colors.text.tertiary,
    fontStyle: 'italic',
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
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
  modalTitle: {
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 16,
    color: colors.primary[40],
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  emojiInput: {
    fontSize: 24,
    width: 40,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: 12,
    marginRight: 8,
    backgroundColor: colors.surface.container,
  },
  modalTypeRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  typeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#eee',
    marginRight: 8,
  },
  typeSelected: {
    backgroundColor: '#b2f2d6',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: colors.primary[40],
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  cancelButton: {
    backgroundColor: '#eee',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  cancelButtonText: {
    color: colors.text.secondary,
    fontWeight: '600',
    fontSize: 15,
  },
}); 