import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, fontSize, spacing } from '../lib/theme';

const LABELS = {
  draft: 'Brouillon',
  sent: 'Envoyé',
  accepted: 'Accepté',
  refused: 'Refusé',
};

const STYLES = {
  draft: { bg: 'rgba(148,163,184,0.15)', fg: '#94a3b8', border: 'rgba(148,163,184,0.3)' },
  sent: { bg: 'rgba(59,130,246,0.15)', fg: '#3b82f6', border: 'rgba(59,130,246,0.3)' },
  accepted: { bg: 'rgba(34,197,94,0.15)', fg: '#22c55e', border: 'rgba(34,197,94,0.3)' },
  refused: { bg: 'rgba(248,113,113,0.15)', fg: '#f87171', border: 'rgba(248,113,113,0.3)' },
};

export default function StatusBadge({ status = 'draft' }) {
  const label = LABELS[status] || status;
  const style = STYLES[status] || STYLES.draft;

  return (
    <View style={[styles.badge, { backgroundColor: style.bg, borderColor: style.border }]}>
      <Text style={[styles.text, { color: style.fg }]}>{label.toUpperCase()}</Text>
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