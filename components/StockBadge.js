import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, fontSize } from '../lib/theme';

export default function StockBadge({ quantity, threshold }) {
  const q = Number(quantity) || 0;
  const t = Number(threshold) || 0;

  let level = 'ok';
  if (q <= 0) level = 'out';
  else if (q <= t) level = 'low';

  const styles_by_level = {
    ok: { bg: 'rgba(34,197,94,0.15)', fg: '#22c55e', border: 'rgba(34,197,94,0.3)', label: 'OK' },
    low: { bg: 'rgba(249,115,22,0.15)', fg: '#f97316', border: 'rgba(249,115,22,0.3)', label: '⚠ Bas' },
    out: { bg: 'rgba(248,113,113,0.15)', fg: '#f87171', border: 'rgba(248,113,113,0.3)', label: 'Rupture' },
  };

  const s = styles_by_level[level];

  return (
    <View style={[styles.badge, { backgroundColor: s.bg, borderColor: s.border }]}>
      <Text style={[styles.text, { color: s.fg }]}>
        {s.label} · {q}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});