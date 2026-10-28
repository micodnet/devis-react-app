import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, radius } from '../lib/theme';

/**
 * data: [{ label: string, value: number }]
 * options: { height, barColor, valuePrefix, valueSuffix, horizontal }
 */
export default function SimpleBarChart({
  data = [],
  height = 200,
  barColor = '#f97316',
  valuePrefix = '',
  valueSuffix = '',
  horizontal = false,
}) {
  if (!data || data.length === 0) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={styles.emptyText}>Aucune donnée</Text>
      </View>
    );
  }

  const maxValue = Math.max(...data.map((d) => Number(d.value) || 0), 1);

  // ------------------------------------------
  // Vertical
  // ------------------------------------------
  if (!horizontal) {
    return (
      <View style={[styles.verticalWrap, { height }]}>
        <View style={styles.barsRow}>
          {data.map((d, i) => {
            const value = Number(d.value) || 0;
            const ratio = value / maxValue;
            const barHeight = Math.max(4, ratio * (height - 40));
            return (
              <View key={i} style={styles.barCol}>
                <Text style={styles.barValue} numberOfLines={1}>
                  {valuePrefix}
                  {formatNumber(value)}
                  {valueSuffix}
                </Text>
                <View
                  style={[
                    styles.bar,
                    { height: barHeight, backgroundColor: barColor },
                  ]}
                />
                <Text style={styles.barLabel} numberOfLines={2}>
                  {d.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  }

  // ------------------------------------------
  // Horizontal
  // ------------------------------------------
  return (
    <View style={styles.horizontalWrap}>
      {data.map((d, i) => {
        const value = Number(d.value) || 0;
        const ratio = value / maxValue;
        return (
          <View key={i} style={styles.hRow}>
            <Text style={styles.hLabel} numberOfLines={1}>
              {d.label}
            </Text>
            <View style={styles.hBarWrap}>
              <View
                style={[
                  styles.hBar,
                  {
                    width: `${Math.max(2, ratio * 100)}%`,
                    backgroundColor: barColor,
                  },
                ]}
              />
            </View>
            <Text style={styles.hValue} numberOfLines={1}>
              {valuePrefix}
              {formatNumber(value)}
              {valueSuffix}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function formatNumber(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  if (n >= 100) return Math.round(n).toString();
  if (n >= 10) return n.toFixed(0);
  return n.toFixed(0);
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontStyle: 'italic',
  },
  verticalWrap: {
    justifyContent: 'flex-end',
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    gap: 4,
    flex: 1,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    minWidth: 0,
  },
  bar: {
    width: '70%',
    borderRadius: 4,
    minHeight: 4,
  },
  barValue: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
  },
  barLabel: {
    color: colors.textMuted,
    fontSize: 9,
    textAlign: 'center',
  },
  horizontalWrap: {
    gap: spacing.md,
  },
  hRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  hLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    width: 90,
  },
  hBarWrap: {
    flex: 1,
    height: 16,
    backgroundColor: colors.bgInput,
    borderRadius: 4,
    overflow: 'hidden',
  },
  hBar: {
    height: '100%',
    borderRadius: 4,
    minWidth: 3,
  },
  hValue: {
    color: colors.text,
    fontSize: fontSize.xs,
    fontWeight: '600',
    width: 70,
    textAlign: 'right',
  },
});