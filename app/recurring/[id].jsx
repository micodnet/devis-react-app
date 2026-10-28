import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  TouchableOpacity, Alert, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { recurringApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Card from '../../components/Card';
import Button from '../../components/Button';

const FREQ_LABELS = {
  monthly: 'Mensuelle',
  quarterly: 'Trimestrielle',
  semiannual: 'Semestrielle',
  yearly: 'Annuelle',
};

const STATUS_LABELS = {
  active: 'Active',
  paused: 'En pause',
  completed: 'Terminée',
  cancelled: 'Annulée',
};

const STATUS_COLORS = {
  active: '#22c55e',
  paused: '#eab308',
  completed: '#64748b',
  cancelled: '#f87171',
};

export default function RecurringDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [rule, setRule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/recurring');
  };

  const loadRule = async () => {
    try {
      setError('');
      const data = await recurringApi.get(id);
      setRule(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRule();
    }, [id])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadRule();
  };

  const fmtMoney = (n) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: rule?.currency || 'EUR',
      minimumFractionDigits: 2,
    }).format(n || 0);

  const fmtDate = (d) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('fr-FR'); } catch { return d; }
  };

  const handlePause = () => {
    Alert.alert('Pause', 'Suspendre cette règle ? Les factures ne seront plus émises.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Suspendre',
        onPress: async () => {
          try {
            await recurringApi.pause(id);
            await loadRule();
          } catch (err) {
            Alert.alert('Erreur', err.response?.data?.error || err.message);
          }
        },
      },
    ]);
  };

  const handleResume = async () => {
    try {
      await recurringApi.resume(id);
      await loadRule();
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || err.message);
    }
  };

  const handleDelete = () => {
    Alert.alert('Supprimer', 'Cette action est irréversible. Confirmer ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await recurringApi.remove(id);
            router.replace('/(app)/recurring');
          } catch (err) {
            Alert.alert('Erreur', err.response?.data?.error || err.message);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !rule) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Erreur</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.errorText}>⚠️ {error || 'Règle introuvable'}</Text>
          <Button title="Retour" onPress={handleBack} variant="secondary" />
        </View>
      </SafeAreaView>
    );
  }

  const items = Array.isArray(rule.items) ? rule.items : [];
  const logs = Array.isArray(rule.logs) ? rule.logs : [];
  const statusColor = STATUS_COLORS[rule.status] || '#94a3b8';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{rule.name}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        <Card>
          <Text style={styles.sectionTitle}>Informations</Text>
          <Row label="Statut" value={STATUS_LABELS[rule.status] || rule.status} valueColor={statusColor} />
          <Row label="Client" value={rule.clientName || '—'} />
          {rule.clientEmail ? <Row label="Email" value={rule.clientEmail} /> : null}
          <Row label="Fréquence" value={FREQ_LABELS[rule.frequency] || rule.frequency} />
          {rule.dayOfPeriod ? <Row label="Jour du mois" value={String(rule.dayOfPeriod)} /> : null}
          <Row label="Début" value={fmtDate(rule.startDate)} />
          {rule.endDate ? <Row label="Fin" value={fmtDate(rule.endDate)} /> : null}
          {rule.maxOccurrences ? (
            <Row label="Occurrences" value={`${rule.occurrencesCount} / ${rule.maxOccurrences}`} />
          ) : (
            <Row label="Émises" value={`${rule.occurrencesCount || 0}`} />
          )}
          {rule.nextIssueDate ? (
            <Row label="Prochaine" value={fmtDate(rule.nextIssueDate)} valueColor={colors.accent} />
          ) : null}
          <Row label="Délai paiement" value={`${rule.paymentTerms || 30} jours`} />
          {rule.autoSendEmail ? <Row label="Email auto" value="✅" /> : null}
          {rule.autoSendPeppol ? <Row label="Peppol auto" value="✅" /> : null}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Articles ({items.length})</Text>
          {items.length === 0 ? (
            <Text style={styles.empty}>Aucun article.</Text>
          ) : (
            items.map((it, i) => (
              <View key={i} style={styles.itemRow}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.itemName} numberOfLines={2}>{it.name}</Text>
                  {it.ref ? <Text style={styles.itemRef}>{it.ref}</Text> : null}
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.itemQty}>{it.qty} × {fmtMoney(it.unitPrice)}</Text>
                  <Text style={styles.itemTotal}>
                    {fmtMoney((Number(it.qty) || 0) * (Number(it.unitPrice) || 0))}
                  </Text>
                </View>
              </View>
            ))
          )}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Total</Text>
          <Row label="Sous-total HT" value={fmtMoney(rule.subtotal)} />
          <View style={[styles.row, styles.totalRow]}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalValue}>{fmtMoney(rule.total)}</Text>
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Historique ({logs.length})</Text>
          {logs.length === 0 ? (
            <Text style={styles.empty}>Aucune émission.</Text>
          ) : (
            logs.slice(0, 30).map((log, i) => {
              const isError = log.action === 'error';
              const color = isError ? colors.error : colors.success;
              const label = log.action === 'generated' ? 'Facture émise' : (log.action === 'error' ? 'Erreur' : log.action);
              return (
                <View key={i} style={[styles.logRow, { borderLeftColor: color }]}>
                  <View style={styles.logHeader}>
                    <Text style={[styles.logLabel, { color }]}>{label}</Text>
                    <Text style={styles.logDate}>
                      {new Date(log.createdAt).toLocaleString('fr-FR')}
                    </Text>
                  </View>
                  {log.invoiceNumber ? (
                    <Text style={styles.logInvoice}>
                      {log.invoiceNumber}
                      {log.invoiceTotal ? ` — ${fmtMoney(log.invoiceTotal)}` : ''}
                    </Text>
                  ) : null}
                  {log.errorMessage ? (
                    <Text style={styles.logError}>{log.errorMessage}</Text>
                  ) : null}
                </View>
              );
            })
          )}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Actions</Text>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => router.push(`/recurring/edit?id=${id}`)}
            activeOpacity={0.7}
          >
            <Text style={styles.actionLabel}>✏️ Modifier</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          {rule.status === 'active' && (
            <TouchableOpacity style={styles.actionRow} onPress={handlePause} activeOpacity={0.7}>
              <Text style={[styles.actionLabel, { color: colors.warning }]}>⏸ Mettre en pause</Text>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>
          )}

          {rule.status === 'paused' && (
            <TouchableOpacity style={styles.actionRow} onPress={handleResume} activeOpacity={0.7}>
              <Text style={[styles.actionLabel, { color: colors.success }]}>▶️ Reprendre</Text>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.actionRow} onPress={handleDelete} activeOpacity={0.7}>
            <Text style={[styles.actionLabel, { color: colors.error }]}>🗑 Supprimer</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value, valueColor }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, valueColor && { color: valueColor, fontWeight: '700' }]} numberOfLines={3}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.md,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backText: { color: colors.text, fontSize: 24, fontWeight: '600' },
  title: { flex: 1, color: colors.text, fontSize: fontSize.lg, fontWeight: '700' },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionTitle: {
    color: colors.text, fontSize: fontSize.md, fontWeight: '700', marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 6, gap: spacing.md,
  },
  label: { color: colors.textSecondary, fontSize: fontSize.sm },
  value: {
    color: colors.text, fontSize: fontSize.sm, fontWeight: '500',
    flexShrink: 1, textAlign: 'right',
  },
  itemRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: spacing.md, borderBottomWidth: 1,
    borderBottomColor: colors.border, gap: spacing.md,
  },
  itemName: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500' },
  itemRef: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },
  itemQty: { color: colors.textSecondary, fontSize: fontSize.xs },
  itemTotal: { color: colors.accent, fontSize: fontSize.sm, fontWeight: '700', marginTop: 2 },
  totalRow: {
    borderTopWidth: 2, borderTopColor: colors.accent,
    marginTop: spacing.md, paddingTop: spacing.md,
  },
  totalLabel: { color: colors.text, fontSize: fontSize.md, fontWeight: '800' },
  totalValue: { color: colors.accent, fontSize: fontSize.xl, fontWeight: '800' },
  logRow: {
    paddingVertical: spacing.md, paddingLeft: spacing.md,
    borderLeftWidth: 3, marginBottom: spacing.sm,
  },
  logHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', gap: spacing.md, marginBottom: 4,
  },
  logLabel: { fontSize: fontSize.sm, fontWeight: '700' },
  logDate: { color: colors.textMuted, fontSize: fontSize.xs },
  logInvoice: { color: colors.accent, fontSize: fontSize.sm, fontWeight: '600' },
  logError: { color: colors.error, fontSize: fontSize.xs, marginTop: 4 },
  empty: {
    color: colors.textMuted, fontSize: fontSize.sm, fontStyle: 'italic',
    textAlign: 'center', paddingVertical: spacing.lg,
  },
  actionRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: colors.border,
  },
  actionLabel: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500' },
  actionArrow: { color: colors.textMuted, fontSize: 20, fontWeight: '300' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorText: {
    color: colors.error, fontSize: fontSize.md, textAlign: 'center', marginBottom: spacing.lg,
  },
});