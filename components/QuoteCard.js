import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radius, spacing, fontSize } from '../lib/theme';
import StatusBadge from './StatusBadge';

export default function QuoteCard({ quote }) {
  const router = useRouter();

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: quote.currency || 'EUR',
      minimumFractionDigits: 2,
    }).format(amount || 0);

  const formatDate = (d) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return d;
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => router.push(`/quote/${quote.id}`)}
    >
      <View style={styles.header}>
        <Text style={styles.number}>{quote.quoteNumber}</Text>
        <StatusBadge status={quote.status} />
      </View>

      <Text style={styles.client} numberOfLines={1}>
        {quote.clientName || 'Aucun client'}
      </Text>

      <View style={styles.footer}>
        <Text style={styles.date}>{formatDate(quote.issueDate)}</Text>
        <Text style={styles.total}>{formatCurrency(quote.total)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  number: {
    color: colors.accent,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  client: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  date: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  total: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
});