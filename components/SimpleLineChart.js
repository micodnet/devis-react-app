import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polyline, Line, Circle } from 'react-native-svg';
import { colors, spacing, fontSize, radius } from '../lib/theme';

/**
 * data: [{ label: string, value: number }]
 */
export default function SimpleLineChart({
  data = [],
  height = 200,
  color = '#f97316',
  valuePrefix = '',
  valueSuffix = '',
}) {
  if (!data || data.length === 0) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={styles.emptyText}>Aucune donnée</Text>
      </View>
    );
  }

  const chartHeight = height - 40;
  const chartWidth = 300; // largeur logique, on utilise le viewBox pour scaler

  const maxValue = Math.max(...data.map((d) => Number(d.value) || 0), 1);
  const stepX = chartWidth / Math.max(1, data.length - 1);

  const points = data
    .map((d, i) => {
      const x = i * stepX;
      const y = chartHeight - ((Number(d.value) || 0) / maxValue) * (chartHeight - 10) - 5;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <View style={styles.wrap}>
      <View style={[styles.svgWrap, { height: chartHeight }]}>
        <Svg
          width="100%"
          height={chartHeight}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="none"
        >
          {/* Lignes horizontales de repère */}
          {[0.25, 0.5, 0.75, 1].map((r, i) => (
            <Line
              key={i}
              x1="0"
              x2={chartWidth}
              y1={chartHeight - r * (chartHeight - 10) - 5}
              y2={chartHeight - r * (chartHeight - 10) - 5}
              stroke={colors.border}
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          ))}

          {/* Ligne principale */}
          <Polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Points */}
          {data.map((d, i) => {
            const x = i * stepX;
            const y =
              chartHeight -
              ((Number(d.value) || 0) / maxValue) * (chartHeight - 10) -
              5;
            return (
              <Circle key={i} cx={x} cy={y} r="3" fill={color} />
            );
          })}
        </Svg>
      </View>

      {/* Labels */}
      <View style={styles.labelsRow}>
        {data.map((d, i) => (
          <Text key={i} style={styles.label} numberOfLines={1}>
            {d.label}
          </Text>
        ))}
      </View>

      {/* Min/max */}
      <View style={styles.legend}>
        <Text style={styles.legendText}>
          Min: {valuePrefix}0{valueSuffix}
        </Text>
        <Text style={styles.legendText}>
          Max: {valuePrefix}
          {Math.round(maxValue)}
          {valueSuffix}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', justifyContent: 'center' },
  emptyText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontStyle: 'italic',
  },
  wrap: { width: '100%' },
  svgWrap: { width: '100%' },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingHorizontal: 4,
  },
  label: {
    color: colors.textMuted,
    fontSize: 9,
    textAlign: 'center',
    flex: 1,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingHorizontal: 4,
  },
  legendText: {
    color: colors.textMuted,
    fontSize: 10,
  },
});