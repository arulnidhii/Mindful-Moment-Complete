import React, { useState, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, Animated as RNAnimated, TouchableOpacity } from 'react-native';
import Svg, { G, Path, Circle } from 'react-native-svg';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { BOOSTERS, DRAINERS } from '@/constants/activities';
import { MaterialIcons } from '@expo/vector-icons';
import { 
  calculateTagRelevance, 
  groupTagsByCategory, 
  getTopRelevantTags,
  getTrendingTags,
  getLegacyTags,
  TagRelevance 
} from '@/utils/tagRelevanceEngine';

interface MoodCount {
  mood: string;
  count: number;
  percentage: number;
}

import { MoodEntry } from '@/types/mood';

interface MoodDistributionProps {
  data: MoodCount[];
  size?: number; // Optional: chart size
  legendFontSize?: number; // Optional: legend font size
  legendAlign?: 'left' | 'center'; // New: legend alignment
  moodEntries?: MoodEntry[]; // Add moodEntries prop for filtering
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  const d = [
    'M', start.x, start.y,
    'A', r, r, 0, largeArcFlag, 0, end.x, end.y,
    'L', cx, cy,
    'Z',
  ].join(' ');
  return d;
}

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = (angle - 90) * Math.PI / 180.0;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

const MOOD_COLORS: Record<string, string> = {
  great: colors.mood.great.medium,
  good: colors.mood.good.medium,
  okay: colors.mood.okay.medium,
  challenged: colors.mood.challenged.medium,
  struggling: colors.mood.struggling.medium,
};

const MoodDistribution: React.FC<MoodDistributionProps> = ({ data, size = 140, legendFontSize, legendAlign = 'left', moodEntries = [] }) => {
  const radius = size / 2 - 10;
  const center = size / 2;
  const total = data.reduce((sum, d) => sum + d.count, 0);

  // Tooltip state
  const [tooltip, setTooltip] = useState<null | { mood: string; percent: number; count: number; color: string; x: number; y: number }>(null);
  const tooltipTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Filter states
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showTagFilters, setShowTagFilters] = useState(false);
  const [filterMode, setFilterMode] = useState<'relevant' | 'trending' | 'legacy'>('relevant');

  // Calculate tag relevance using the smart engine
  const tagRelevances = useMemo(() => calculateTagRelevance(moodEntries), [moodEntries]);
  const categorizedTags = useMemo(() => groupTagsByCategory(tagRelevances), [tagRelevances]);
  const topRelevantTags = useMemo(() => getTopRelevantTags(tagRelevances), [tagRelevances]);
  const trendingTags = useMemo(() => getTrendingTags(tagRelevances), [tagRelevances]);
  const legacyTags = useMemo(() => getLegacyTags(tagRelevances), [tagRelevances]);

  // Handle tap on arc
  const handleArcPress = (d: MoodCount, midAngle: number) => {
    // Calculate tooltip position (polar to cartesian)
    const tooltipRadius = radius * 0.85;
    const pos = polarToCartesian(center, center, tooltipRadius, midAngle);
    // Clear any existing timeout
    if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
    setTooltip({
      mood: d.mood,
      percent: total === 0 ? 0 : Math.round((d.count / total) * 100),
      count: d.count,
      color: MOOD_COLORS[d.mood] || '#ccc',
      x: pos.x,
      y: pos.y,
    });
    // Auto-dismiss after 2 seconds
    tooltipTimeout.current = setTimeout(() => setTooltip(null), 2000);
  };

  // Dismiss tooltip on tap elsewhere
  const handleChartPress = () => {
    if (tooltip) setTooltip(null);
  };

  // Filter mood entries by activeFilter
  const filteredEntries = activeFilter
    ? moodEntries.filter(entry =>
        entry.boosters?.includes(activeFilter) || entry.drainers?.includes(activeFilter)
      )
    : moodEntries;

  // Recalculate data if filtered
  const filteredData = activeFilter && moodEntries.length > 0
    ? Object.values(filteredEntries.reduce((acc, entry) => {
        acc[entry.mood_value] = acc[entry.mood_value] || { mood: entry.mood_value, count: 0, percentage: 0 };
        acc[entry.mood_value].count += 1;
        return acc;
      }, {} as Record<string, MoodCount>))
    : data;
  const filteredTotal = filteredData.reduce((sum, d) => sum + d.count, 0);
  filteredData.forEach(d => { d.percentage = filteredTotal === 0 ? 0 : (d.count / filteredTotal) * 100; });

  // Pie arcs
  let startAngle = 0;
  const arcs = filteredData.map((d, i) => {
    const angle = filteredTotal === 0 ? 0 : (d.count / filteredTotal) * 360;
    const endAngle = startAngle + angle;
    const midAngle = startAngle + angle / 2;
    const path = describeArc(center, center, radius, startAngle, endAngle);
    const arc = (
      <TouchableWithoutFeedback key={d.mood} onPress={() => handleArcPress(d, midAngle)}>
        <Path
          d={path}
          fill={MOOD_COLORS[d.mood] || '#ccc'}
          stroke="#fff"
          strokeWidth={2}
          opacity={tooltip && tooltip.mood === d.mood ? 0.7 : 1}
        />
      </TouchableWithoutFeedback>
    );
    startAngle = endAngle;
    return arc;
  });

  const toggleCategory = (categoryKey: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryKey)) {
      newExpanded.delete(categoryKey);
    } else {
      newExpanded.add(categoryKey);
    }
    setExpandedCategories(newExpanded);
  };

  const handleTagPress = (tagId: string) => {
    setActiveFilter(activeFilter === tagId ? null : tagId);
  };

  const getFilterModeData = () => {
    switch (filterMode) {
      case 'trending':
        return trendingTags;
      case 'legacy':
        return legacyTags;
      default:
        return topRelevantTags;
    }
  };

  const getFilterModeLabel = () => {
    switch (filterMode) {
      case 'trending':
        return 'Trending';
      case 'legacy':
        return 'Past Favorites';
      default:
        return 'Most Relevant';
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handleChartPress}>
      <View style={styles.container}>
        {/* Smart Tag Filter System */}
        {tagRelevances.length > 0 && (
          <View style={styles.filterContainer}>
            {/* Toggle button for tag filters */}
            <TouchableOpacity 
              style={styles.filterToggle}
              onPress={() => setShowTagFilters(!showTagFilters)}
            >
              <MaterialIcons 
                name={showTagFilters ? 'expand-less' : 'expand-more'} 
                size={20} 
                color={colors.text.secondary} 
              />
              <Text style={styles.filterToggleText}>
                {showTagFilters ? 'Hide' : 'Show'} Activity Filters ({tagRelevances.length})
              </Text>
            </TouchableOpacity>

            {/* Filter mode selector */}
            {showTagFilters && (
              <View style={styles.filterModeContainer}>
                <View style={styles.filterModeRow}>
                  {[
                    { key: 'relevant', label: 'Most Relevant', count: topRelevantTags.length },
                    { key: 'trending', label: 'Trending', count: trendingTags.length },
                    { key: 'legacy', label: 'Past Favorites', count: legacyTags.length }
                  ].map(mode => (
                    <TouchableOpacity
                      key={mode.key}
                      style={[
                        styles.filterModeButton,
                        filterMode === mode.key && styles.filterModeButtonActive
                      ]}
                      onPress={() => setFilterMode(mode.key as any)}
                    >
                      <Text style={[
                        styles.filterModeText,
                        filterMode === mode.key && styles.filterModeTextActive
                      ]}>
                        {mode.label} ({mode.count})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Quick filter tags */}
                <View style={styles.quickFilterContainer}>
                  {getFilterModeData().map(tag => (
                    <TouchableOpacity
                      key={tag.id}
                      style={[
                        styles.quickFilterPill,
                        activeFilter === tag.id && styles.quickFilterPillActive
                      ]}
                      onPress={() => handleTagPress(tag.id)}
                    >
                      <Text style={[
                        styles.quickFilterText,
                        activeFilter === tag.id && styles.quickFilterTextActive
                      ]}>
                        {tag.id.replace(/_/g, ' ')} ({tag.recentCount})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Detailed categorized view */}
                <View style={styles.categoriesContainer}>
                  {categorizedTags.map(category => (
                    <View key={category.name} style={styles.categorySection}>
                      <TouchableOpacity 
                        style={styles.categoryHeader}
                        onPress={() => toggleCategory(category.name)}
                      >
                        <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                          <MaterialIcons name={category.icon as any} size={16} color={colors.surface.bright} />
                        </View>
                        <Text style={styles.categoryName}>{category.name}</Text>
                        <Text style={styles.categoryCount}>({category.recentCount})</Text>
                        <MaterialIcons 
                          name={expandedCategories.has(category.name) ? 'expand-less' : 'expand-more'} 
                          size={16} 
                          color={colors.text.secondary} 
                        />
                      </TouchableOpacity>
                      
                      {expandedCategories.has(category.name) && (
                        <View style={styles.tagsContainer}>
                          {category.tags.map(tag => (
                            <TouchableOpacity
                              key={tag.id}
                              style={[
                                styles.tagPill, 
                                activeFilter === tag.id && styles.tagPillActive
                              ]}
                              onPress={() => handleTagPress(tag.id)}
                            >
                              <Text style={[
                                styles.tagPillText,
                                activeFilter === tag.id && styles.tagPillTextActive
                              ]}>
                                {tag.id.replace(/_/g, ' ')} ({tag.count})
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  ))}
                </View>
                
                {/* Clear filter button */}
                {activeFilter && (
                  <TouchableOpacity 
                    style={styles.clearFilterButton}
                    onPress={() => setActiveFilter(null)}
                  >
                    <MaterialIcons name="clear" size={16} color={colors.semantic.warning} />
                    <Text style={styles.clearFilterText}>Clear Filter</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}

        <Svg width={size} height={size}>
          <G>
            {/* Use filteredData for arcs */}
            {(() => {
              let startAngle = 0;
              return filteredData.map((d, i) => {
                const angle = filteredTotal === 0 ? 0 : (d.count / filteredTotal) * 360;
                const endAngle = startAngle + angle;
                const midAngle = startAngle + angle / 2;
                const path = describeArc(center, center, radius, startAngle, endAngle);
                const arc = (
                  <TouchableWithoutFeedback key={d.mood} onPress={() => handleArcPress(d, midAngle)}>
                    <Path
                      d={path}
                      fill={MOOD_COLORS[d.mood] || '#ccc'}
                      stroke="#fff"
                      strokeWidth={2}
                      opacity={tooltip && tooltip.mood === d.mood ? 0.7 : 1}
                    />
                  </TouchableWithoutFeedback>
                );
                startAngle = endAngle;
                return arc;
              });
            })()}
            {/* Donut hole */}
            <Circle cx={center} cy={center} r={radius * 0.55} fill={colors.surface.bright} />
          </G>
        </Svg>
        
        {/* Tooltip */}
        {tooltip && (
          <View style={[styles.tooltip, { left: tooltip.x - 60, top: tooltip.y - 50, borderColor: tooltip.color }]}> 
            <Text style={[styles.tooltipMood, { color: tooltip.color }]}>{tooltip.mood.charAt(0).toUpperCase() + tooltip.mood.slice(1)}</Text>
            <Text style={styles.tooltipPercent}>{tooltip.percent}%</Text>
            <Text style={styles.tooltipCount}>{tooltip.count} check-ins</Text>
          </View>
        )}
        
        <View style={[styles.legendContainer, legendAlign === 'center' && { alignItems: 'center' }]}> 
          {filteredData.map((d) => (
            <View key={d.mood} style={styles.legendRow}>
              <View style={[styles.legendSwatch, { backgroundColor: MOOD_COLORS[d.mood] || '#ccc' }]} />
              <Text style={[styles.legendLabel, legendFontSize ? { fontSize: legendFontSize } : null]}>{d.mood.charAt(0).toUpperCase() + d.mood.slice(1)} ({filteredTotal === 0 ? 0 : Math.round((d.count / filteredTotal) * 100)}%)</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 12,
  },
  filterContainer: {
    width: '100%',
    marginBottom: 16,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.surface.containerLow,
    borderRadius: 20,
    alignSelf: 'center',
  },
  filterToggleText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginLeft: 4,
  },
  filterModeContainer: {
    marginTop: 12,
    gap: 12,
  },
  filterModeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 8,
  },
  filterModeButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: colors.surface.container,
    borderRadius: 16,
    alignItems: 'center',
  },
  filterModeButtonActive: {
    backgroundColor: colors.primary[95],
    borderColor: colors.primary[40],
    borderWidth: 1,
  },
  filterModeText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  filterModeTextActive: {
    color: colors.primary[40],
    fontWeight: '600',
  },
  quickFilterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  quickFilterPill: {
    backgroundColor: colors.surface.container,
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  quickFilterPillActive: {
    backgroundColor: colors.primary[95],
    borderColor: colors.primary[40],
  },
  quickFilterText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  quickFilterTextActive: {
    color: colors.primary[40],
    fontWeight: '600',
  },
  categoriesContainer: {
    gap: 8,
  },
  categorySection: {
    backgroundColor: colors.surface.containerLow,
    borderRadius: 12,
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  categoryIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  categoryName: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    fontWeight: '600',
    flex: 1,
  },
  categoryCount: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginRight: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 6,
  },
  tagPill: {
    backgroundColor: colors.surface.container,
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  tagPillActive: {
    backgroundColor: colors.primary[95],
    borderColor: colors.primary[40],
  },
  tagPillText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  tagPillTextActive: {
    color: colors.primary[40],
    fontWeight: '600',
  },
  clearFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.surface.container,
    borderRadius: 16,
    alignSelf: 'center',
    marginTop: 8,
  },
  clearFilterText: {
    ...typography.bodySmall,
    color: colors.semantic.warning,
    marginLeft: 4,
  },
  legendContainer: {
    marginTop: 28,
    width: '100%',
    alignItems: 'flex-start',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  legendSwatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
  },
  legendLabel: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    lineHeight: 44,
    paddingBottom: 2,
    paddingTop: 2,
  },
  tooltip: {
    position: 'absolute',
    minWidth: 110,
    backgroundColor: colors.surface.bright,
    borderRadius: 12,
    borderWidth: 2,
    paddingVertical: 8,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
    alignItems: 'center',
  },
  tooltipMood: {
    ...typography.bodyMedium,
    fontWeight: '600',
    marginBottom: 2,
  },
  tooltipPercent: {
    ...typography.bodyLarge,
    fontWeight: '700',
    marginBottom: 2,
  },
  tooltipCount: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
});

export default MoodDistribution;