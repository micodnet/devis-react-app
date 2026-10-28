import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, fontSize } from '../lib/theme';

export default function KpiCard({ label, value, subtitle, color, big }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text
        style={[
          styles.value,
          big && styles.valueBig,
          color && { color },
        ]}
        numberOfLines={2}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
  },
  label: {
    color: colors.textSecondary,
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.4,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  value: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '800',
    textAlign: 'center',
  },
  valueBig: {
    fontSize: fontSize.xxl,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 4,
    textAlign: 'center',
  },
});