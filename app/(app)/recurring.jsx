import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  RefreshControl, TouchableOpacity, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { recurringApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';

const FILTERS = [
  { key: 'all', label: 'Toutes' },
  { key: 'active', label: 'Actives' },
  { key: 'paused', label: 'En pause' },
  { key: 'completed', label: 'Terminées' },
];

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

const FREQ_LABELS = {
  monthly: 'Mensuelle',
  quarterly: 'Trimestrielle',
  semiannual: 'Semestrielle',
  yearly: 'Annuelle',
};

export default function RecurringScreen() {
  const router = useRouter();
  const [rules, setRules] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  const loadRules = async () => {
    try {
      setError('');
      const data = await recurringApi.list(currentFilter);
      setRules(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRules();
    }, [currentFilter])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadRules();
  };

  const handleProcess = async () => {
    setProcessing(true);
    try {
      const res = await recurringApi.process();
      const ok = res.processed?.length || 0;
      const ko = res.failed?.length || 0;
      alert(`${ok} facture(s) émise(s)${ko > 0 ? `, ${ko} échec(s)` : ''}`);
      loadRules();
    } catch (err) {
      alert('Erreur : ' + (err.response?.data?.error || err.message));
    } finally {
      setProcessing(false);
    }
  };

  const fmtMoney = (n) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(n || 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header
        title="Factures récurrentes"
        showBack
        right={
          <TouchableOpacity
            onPress={() => router.push('/recurring/new')}
            style={styles.newBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.newBtnText}>+ Nouvelle</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
        style={styles.filtersScroll}
      >
        {FILTERS.map((f) => {
          const isActive = currentFilter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterBtn, isActive && styles.filterBtnActive]}
              onPress={() => setCurrentFilter(f.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Bouton forcer l'émission */}
      <TouchableOpacity
        style={styles.processBtn}
        onPress={handleProcess}
        disabled={processing}
        activeOpacity={0.7}
      >
        <Text style={styles.processBtnText}>
          {processing ? '⏳ Traitement...' : '⚡ Forcer l\'émission maintenant'}
        </Text>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <Button title="Réessayer" onPress={loadRules} variant="secondary" />
        </View>
      ) : rules.length === 0 ? (
        <EmptyState
          icon="🔁"
          title="Aucune règle récurrente"
          message="Créez une règle pour générer automatiquement vos factures (contrats, abonnements, entretiens)."
        />
      ) : (
        <FlatList
          data={rules}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
          renderItem={({ item }) => {
            const statusLabel = STATUS_LABELS[item.status] || item.status;
            const statusColor = STATUS_COLORS[item.status] || '#94a3b8';
            const progress = item.maxOccurrences
              ? `${item.occurrencesCount} / ${item.maxOccurrences}`
              : `${item.occurrencesCount || 0} émise(s)`;
            const next = item.nextIssueDate
              ? new Date(item.nextIssueDate).toLocaleDateString('fr-FR')
              : '—';
            return (
              <TouchableOpacity
                style={[styles.card, { borderLeftColor: statusColor }]}
                onPress={() => router.push(`/recurring/${item.id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusColor + '22', borderColor: statusColor + '66' },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: statusColor }]}>
                      {statusLabel}
                    </Text>
                  </View>
                </View>
                {item.clientName ? (
                  <Text style={styles.cardClient} numberOfLines={1}>
                    {item.clientName}
                  </Text>
                ) : null}
                <View style={styles.cardGrid}>
                  <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>Fréquence</Text>
                    <Text style={styles.gridValue}>
                      {FREQ_LABELS[item.frequency] || item.frequency}
                    </Text>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>Montant</Text>
                    <Text style={styles.gridValueAccent}>{fmtMoney(item.total)}</Text>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>Émises</Text>
                    <Text style={styles.gridValue}>{progress}</Text>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={styles.gridLabel}>Prochaine</Text>
                    <Text style={styles.gridValue}>{next}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          ListFooterComponent={
            <Text style={styles.footer}>
              {rules.length} règle{rules.length > 1 ? 's' : ''}
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  newBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  newBtnText: { color: '#0b1120', fontSize: fontSize.xs, fontWeight: '700' },
  filtersScroll: {
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filtersContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    flexDirection: 'row',
  },
  filterBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.bgCard,
    height: 36,
    justifyContent: 'center',
  },
  filterBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  filterText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600' },
  filterTextActive: { color: '#0b1120' },
  processBtn: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(59,130,246,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.4)',
    alignItems: 'center',
  },
  processBtnText: {
    color: '#3b82f6',
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  listContent: { padding: spacing.lg, paddingBottom: spacing.xxl },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  cardName: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  statusText: { fontSize: 10, fontWeight: '700' },
  cardClient: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  gridItem: { minWidth: '45%', flex: 1 },
  gridLabel: {
    color: colors.textMuted,
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 2,
  },
  gridValue: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600' },
  gridValueAccent: { color: colors.accent, fontSize: fontSize.sm, fontWeight: '700' },
  center: {
    flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl,
  },
  errorText: {
    color: colors.error, fontSize: fontSize.md, textAlign: 'center', marginBottom: spacing.lg,
  },
  footer: {
    color: colors.textMuted, fontSize: fontSize.xs, textAlign: 'center', paddingVertical: spacing.lg,
  },
});