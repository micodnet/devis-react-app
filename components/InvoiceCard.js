import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radius, spacing, fontSize } from '../lib/theme';
import InvoiceStatusBadge from './InvoiceStatusBadge';

export default function InvoiceCard({ invoice }) {
  const router = useRouter();

  const fmtMoney = (n) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: invoice.currency || 'EUR',
      minimumFractionDigits: 2,
    }).format(n || 0);

  const fmtDate = (d) => {
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

  const status = invoice.status || 'draft';
  const amountDue = Number(invoice.amountDue) || Number(invoice.total) || 0;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => router.push(`/invoice/${invoice.id}`)}
    >
      <View style={styles.header}>
        <Text style={styles.number}>{invoice.invoiceNumber}</Text>
        <InvoiceStatusBadge status={status} />
      </View>

      <Text style={styles.client} numberOfLines={1}>
        {invoice.clientName || 'Aucun client'}
      </Text>

      <View style={styles.footer}>
        <View>
          <Text style={styles.dateLabel}>Émise le</Text>
          <Text style={styles.date}>{fmtDate(invoice.issueDate)}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.total}>{fmtMoney(invoice.total)}</Text>
          {status !== 'paid' && amountDue > 0 ? (
            <Text style={styles.due}>Reste : {fmtMoney(amountDue)}</Text>
          ) : null}
        </View>
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
    color: colors.primary,
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
    alignItems: 'flex-end',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dateLabel: {
    color: colors.textMuted,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  date: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
  },
  total: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  due: {
    color: colors.warning,
    fontSize: fontSize.xs,
    marginTop: 2,
    fontWeight: '600',
  },
});