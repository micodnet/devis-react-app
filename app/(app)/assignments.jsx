import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity,
  RefreshControl, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { subcontractorsApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';

const STATUS_LABELS = {
  pending: 'En attente', in_progress: 'En cours',
  completed: 'Terminé', invoiced: 'Facturé',
  paid: 'Payé', cancelled: 'Annulé',
};
const STATUS_COLORS = {
  pending: '#94a3b8', in_progress: '#3b82f6',
  completed: '#22c55e', invoiced: '#eab308',
  paid: '#16a34a', cancelled: '#f87171',
};

export default function AssignmentsScreen() {
  const router = useRouter();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadAll = async () => {
    try {
      setError('');
      const data = await subcontractorsApi.allAssignments();
      setAssignments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { loadAll(); }, []));

  const onRefresh = () => { setRefreshing(true); loadAll(); };

  const complete = (id) => {
    Alert.prompt
      ? Alert.prompt('Terminer', 'Heures réelles :', async (h) => {
          try {
            await subcontractorsApi.completeAssignment(id, h || null);
            await loadAll();
          } catch (err) { Alert.alert('Erreur', err.response?.data?.error || err.message); }
        })
      : null;
  };

  const fmtMoney = (n) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(n || 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header
        title="Toutes les missions"
        showBack
        right={
          <TouchableOpacity style={styles.newBtn}
            onPress={() => router.push('/(app)/subcontractors')} activeOpacity={0.7}>
            <Text style={styles.newBtnText}>Sous-traitants</Text>
          </TouchableOpacity>
        }
      />

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <Button title="Réessayer" onPress={loadAll} variant="secondary" />
        </View>
      ) : assignments.length === 0 ? (
        <EmptyState icon="🔨" title="Aucune mission" message="Créez des missions depuis un sous-traitant." />
      ) : (
        <FlatList
          data={assignments}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
              tintColor={colors.accent} colors={[colors.accent]} />
          }
          renderItem={({ item }) => {
            const statusLabel = STATUS_LABELS[item.status] || item.status;
            const statusColor = STATUS_COLORS[item.status] || '#94a3b8';
            return (
              <View style={[styles.card, { borderLeftColor: statusColor }]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                  <View style={[styles.statusBadge, {
                    backgroundColor: statusColor + '22', borderColor: statusColor + '66',
                  }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
                  </View>
                </View>

                {item.subcontractorName ? (
                  <Text style={styles.cardSub} numberOfLines={1}>
                    🔨 {item.subcontractorName}
                  </Text>
                ) : null}

                {item.chantierName ? (
                  <Text style={styles.cardSub} numberOfLines={1}>
                    🏗 {item.chantierName}
                  </Text>
                ) : null}

                <View style={styles.metaRow}>
                  {item.amount ? <Text style={styles.metaText}>💰 {fmtMoney(item.amount)}</Text> : null}
                  {item.startDate ? (
                    <Text style={styles.metaText}>
                      📅 {new Date(item.startDate).toLocaleDateString('fr-FR')}
                    </Text>
                  ) : null}
                </View>

                <View style={styles.actionsRow}>
                  {(item.status === 'pending' || item.status === 'in_progress') && (
                    <TouchableOpacity style={[styles.smallBtn, styles.smallBtnSuccess]}
                      onPress={() => complete(item.id)} activeOpacity={0.7}>
                      <Text style={styles.smallBtnSuccessText}>✓ Terminer</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={[styles.smallBtn, styles.smallBtnSecondary]}
                    onPress={() => router.push(`/subcontractor/${item.subcontractorId}`)} activeOpacity={0.7}>
                    <Text style={styles.smallBtnSecondaryText}>Voir le sous-traitant</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          ListFooterComponent={
            <Text style={styles.footer}>{assignments.length} mission(s)</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  newBtn: { backgroundColor: colors.bgInput, paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.full, borderWidth: 1, borderColor: colors.borderLight },
  newBtnText: { color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: '600' },
  listContent: { padding: spacing.lg, paddingBottom: spacing.xxl },
  card: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, borderLeftWidth: 4,
    padding: spacing.lg, marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.sm,
  },
  cardTitle: { color: colors.text, fontSize: fontSize.sm, fontWeight: '700', flex: 1 },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full, borderWidth: 1 },
  statusText: { fontSize: 10, fontWeight: '700' },
  cardSub: { color: colors.textSecondary, fontSize: fontSize.xs, marginBottom: 2 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.sm },
  metaText: { color: colors.textMuted, fontSize: fontSize.xs },
  actionsRow: {
    flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap',
    marginTop: spacing.md, paddingTop: spacing.md,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  smallBtn: { paddingVertical: 6, paddingHorizontal: spacing.md, borderRadius: radius.full, alignItems: 'center' },
  smallBtnSuccess: { backgroundColor: 'rgba(34,197,94,0.15)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.4)' },
  smallBtnSuccessText: { color: colors.success, fontSize: fontSize.xs, fontWeight: '700' },
  smallBtnSecondary: { backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.borderLight },
  smallBtnSecondaryText: { color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorText: { color: colors.error, fontSize: fontSize.md, textAlign: 'center', marginBottom: spacing.lg },
  footer: { color: colors.textMuted, fontSize: fontSize.xs, textAlign: 'center', paddingVertical: spacing.lg },
});