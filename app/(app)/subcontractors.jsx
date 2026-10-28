import { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity,
  RefreshControl, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { subcontractorsApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';

const FILTERS = [
  { key: 'all', label: 'Tous' },
  { key: 'active', label: 'Actifs' },
  { key: 'inactive', label: 'Inactifs' },
];

export default function SubcontractorsScreen() {
  const router = useRouter();
  const [subs, setSubs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadSubs = async () => {
    try {
      setError('');
      const data = await subcontractorsApi.list();
      setSubs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSubs();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadSubs();
  };

  const filtered = useMemo(() => {
    let list = subs;
    if (filter === 'active') list = list.filter((s) => s.active);
    else if (filter === 'inactive') list = list.filter((s) => !s.active);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (s) =>
          (s.name || '').toLowerCase().includes(q) ||
          (s.companyName || '').toLowerCase().includes(q) ||
          (s.email || '').toLowerCase().includes(q) ||
          (s.specialty || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [subs, filter, search]);

  const fmtMoney = (n) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency', currency: 'EUR', minimumFractionDigits: 2,
    }).format(n || 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header
        title="Sous-traitants"
        showBack
        right={
          <TouchableOpacity
            onPress={() => router.push('/subcontractor/new')}
            style={styles.newBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.newBtnText}>+ Nouveau</Text>
          </TouchableOpacity>
        }
      />

      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="🔍 Rechercher un sous-traitant..."
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
        style={styles.filtersScroll}
      >
        {FILTERS.map((f) => {
          const isActive = filter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterBtn, isActive && styles.filterBtnActive]}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <Button title="Réessayer" onPress={loadSubs} variant="secondary" />
        </View>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="🔨"
          title={search ? 'Aucun résultat' : 'Aucun sous-traitant'}
          message="Ajoutez vos sous-traitants pour suivre leurs missions et paiements."
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
              tintColor={colors.accent} colors={[colors.accent]} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/subcontractor/${item.id}`)}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                  {item.companyName ? (
                    <Text style={styles.cardCompany} numberOfLines={1}>{item.companyName}</Text>
                  ) : null}
                  {item.specialty ? (
                    <Text style={styles.cardSpecialty}>{item.specialty}</Text>
                  ) : null}
                </View>
                <View style={[styles.statusBadge, {
                  backgroundColor: item.active ? 'rgba(34,197,94,0.15)' : 'rgba(148,163,184,0.15)',
                  borderColor: item.active ? 'rgba(34,197,94,0.4)' : 'rgba(148,163,184,0.4)',
                }]}>
                  <Text style={[styles.statusText, { color: item.active ? colors.success : colors.textMuted }]}>
                    {item.active ? 'Actif' : 'Inactif'}
                  </Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Missions</Text>
                  <Text style={styles.statValue}>{item.assignmentsCount || 0}</Text>
                  <Text style={styles.statSub}>{item.activeAssignments || 0} en cours</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Payé</Text>
                  <Text style={[styles.statValue, { color: colors.success }]}>
                    {fmtMoney(item.paidTotal)}
                  </Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>En attente</Text>
                  <Text style={[styles.statValue, { color: colors.warning }]}>
                    {fmtMoney(item.pendingTotal)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListFooterComponent={
            <Text style={styles.footer}>
              {filtered.length} sous-traitant{filtered.length > 1 ? 's' : ''}
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
    backgroundColor: colors.accent, paddingHorizontal: spacing.md,
    paddingVertical: 6, borderRadius: radius.full,
  },
  newBtnText: { color: '#0b1120', fontSize: fontSize.xs, fontWeight: '700' },
  filtersScroll: { maxHeight: 50, borderBottomWidth: 1, borderBottomColor: colors.border },
  filtersContainer: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    gap: spacing.sm, flexDirection: 'row',
  },
  filterBtn: {
    paddingHorizontal: spacing.md, paddingVertical: 6,
    borderRadius: radius.full, borderWidth: 1,
    borderColor: colors.borderLight, backgroundColor: colors.bgCard,
    height: 32, justifyContent: 'center',
  },
  filterBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  filterText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600' },
  filterTextActive: { color: '#0b1120' },
  listContent: { padding: spacing.lg, paddingBottom: spacing.xxl },
  card: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.lg, marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.md,
  },
  cardName: { color: colors.text, fontSize: fontSize.md, fontWeight: '700' },
  cardCompany: { color: colors.textSecondary, fontSize: fontSize.sm, marginTop: 2 },
  cardSpecialty: {
    color: colors.accent, fontSize: fontSize.xs,
    fontWeight: '600', marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm, paddingVertical: 3,
    borderRadius: radius.full, borderWidth: 1,
  },
  statusText: { fontSize: 10, fontWeight: '700' },
  statsRow: {
    flexDirection: 'row', gap: spacing.sm,
    paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border,
  },
  statBox: { flex: 1 },
  statLabel: {
    color: colors.textMuted, fontSize: 10, textTransform: 'uppercase',
    fontWeight: '700', marginBottom: 2,
  },
  statValue: { color: colors.text, fontSize: fontSize.sm, fontWeight: '700' },
  statSub: { color: colors.textMuted, fontSize: 10, marginTop: 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorText: { color: colors.error, fontSize: fontSize.md, textAlign: 'center', marginBottom: spacing.lg },
  footer: { color: colors.textMuted, fontSize: fontSize.xs, textAlign: 'center', paddingVertical: spacing.lg },
});