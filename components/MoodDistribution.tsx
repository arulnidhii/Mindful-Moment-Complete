import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, Animated as RNAnimated } from 'react-native';
import Svg, { G, Path, Circle } from 'react-native-svg';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

interface MoodCount {
  mood: string;
  count: number;
  percentage: number;
}

interface MoodDistributionProps {
  data: MoodCount[];
  size?: number; // Optional: chart size
  legendFontSize?: number; // Optional: legend font size
  legendAlign?: 'left' | 'center'; // New: legend alignment
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

const MoodDistribution: React.FC<MoodDistributionProps> = ({ data, size = 140, legendFontSize, legendAlign = 'left' }) => {
  const radius = size / 2 - 10;
  const center = size / 2;
  const total = data.reduce((sum, d) => sum + d.count, 0);

  // Tooltip state
  const [tooltip, setTooltip] = useState<null | { mood: string; percent: number; count: number; color: string; x: number; y: number }>(null);
  const tooltipTimeout = useRef<NodeJS.Timeout | null>(null);

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

  // Pie arcs
  let startAngle = 0;
  const arcs = data.map((d, i) => {
    const angle = total === 0 ? 0 : (d.count / total) * 360;
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

  return (
    <TouchableWithoutFeedback onPress={handleChartPress}>
      <View style={styles.container}>
        <Svg width={size} height={size}>
          <G>
            {arcs}
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
          {data.map((d) => (
            <View key={d.mood} style={styles.legendRow}>
              <View style={[styles.legendSwatch, { backgroundColor: MOOD_COLORS[d.mood] || '#ccc' }]} />
              <Text style={[styles.legendLabel, legendFontSize ? { fontSize: legendFontSize } : null]}>{d.mood.charAt(0).toUpperCase() + d.mood.slice(1)} ({total === 0 ? 0 : Math.round((d.count / total) * 100)}%)</Text>
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
  legendContainer: {
    marginTop: 28, // Increased from 12 for more space between chart and legend
    width: '100%',
    alignItems: 'flex-start', // Keep left-aligned for easier reading
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14, // Increased for more vertical space between legend items
  },
  legendSwatch: {
    width: 20, // Slightly larger swatch
    height: 20,
    borderRadius: 10,
    marginRight: 12, // More space between swatch and label
  },
  legendLabel: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    lineHeight: 44, // Increased for descender room
    paddingBottom: 2, // Extra space for descenders
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