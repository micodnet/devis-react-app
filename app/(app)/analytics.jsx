import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  RefreshControl, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { statsApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import KpiCard from '../../components/KpiCard';
import SimpleBarChart from '../../components/SimpleBarChart';
import SimpleLineChart from '../../components/SimpleLineChart';

const PERIODS = [
  { key: '12m', label: '12 mois' },
  { key: '3m', label: '3 mois' },
  { key: '30d', label: '30 jours' },
  { key: 'ytd', label: 'Année' },
  { key: 'all', label: 'Tout' },
];

function getPeriodDates(period) {
  const now = new Date();
  let from = null;
  const to = now.toISOString().slice(0, 10);
  switch (period) {
    case '30d':
      from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      break;
    case '3m':
      from = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().slice(0, 10);
      break;
    case '12m':
      from = new Date(now.getFullYear(), now.getMonth() - 11, 1).toISOString().slice(0, 10);
      break;
    case 'ytd':
      from = new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);
      break;
    default:
      from = null;
  }
  return { from, to };
}

export default function AnalyticsScreen() {
  const [period, setPeriod] = useState('12m');
  const [kpi, setKpi] = useState(null);
  const [treasury, setTreasury] = useState(null);
  const [metiers, setMetiers] = useState(null);
  const [clients, setClients] = useState(null);
  const [conversion, setConversion] = useState(null);
  const [topProducts, setTopProducts] = useState(null);
  const [temporal, setTemporal] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadAll = async () => {
    setError('');
    const dates = getPeriodDates(period);
    try {
      const [k, t, m, c, cv, tp, temp] = await Promise.all([
        statsApi.kpi().catch(() => null),
        statsApi.treasury().catch(() => null),
        statsApi.profitabilityByMetier(dates).catch(() => null),
        statsApi.profitabilityByClient({ ...dates, limit: 10 }).catch(() => null),
        statsApi.conversion(dates).catch(() => null),
        statsApi.topProducts({ ...dates, limit: 10 }).catch(() => null),
        statsApi.temporal(dates).catch(() => null),
      ]);
      setKpi(k);
      setTreasury(t);
      setMetiers(m);
      setClients(c);
      setConversion(cv);
      setTopProducts(tp);
      setTemporal(temp);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [period])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadAll();
  };

  const fmtMoney = (n) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(n || 0);

  const fmtInt = (n) =>
    new Intl.NumberFormat('fr-FR').format(parseInt(n) || 0);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Analytics" showBack />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  // -------- Préparer les données des graphiques --------
  const metiersData = (metiers?.metiers || []).map((m) => ({
    label: m.name,
    value: m.acceptedRevenue || m.totalRevenue || 0,
  }));

  const clientsData = (clients?.clients || [])
    .slice(0, 5)
    .map((c) => ({
      label: c.name,
      value: c.acceptedRevenue || c.totalRevenue || 0,
    }));

  const conversionData = (conversion?.monthly || []).map((m) => ({
    label: m.month?.slice(5) || m.month,
    value: m.conversionRate || 0,
  }));

  const revenueData = (temporal?.series || []).map((s) => ({
    label: s.period,
    value: s.acceptedValue || 0,
  }));

  const topProductsData = (topProducts?.top || []).slice(0, 8).map((p) => ({
    label: p.name?.length > 22 ? p.name.slice(0, 20) + '…' : p.name,
    value: p.totalRevenue || 0,
  }));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Analytics" showBack />

      {/* Filtres période */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
        style={styles.filtersScroll}
      >
        {PERIODS.map((p) => {
          const isActive = period === p.key;
          return (
            <TouchableOpacity
              key={p.key}
              style={[styles.filterBtn, isActive && styles.filterBtnActive]}
              onPress={() => setPeriod(p.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

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
        {!!error && (
          <Card>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </Card>
        )}

        {/* KPI Cards */}
        <Text style={styles.sectionTitle}>📊 Indicateurs clés</Text>
        <View style={styles.kpiGrid}>
          <KpiCard
            label="CA accepté"
            value={fmtMoney(kpi?.year?.revenue)}
            subtitle={new Date().getFullYear()}
            color={colors.accent}
            big
          />
          <KpiCard
            label="Devis émis"
            value={fmtInt(kpi?.year?.quotes)}
            subtitle={new Date().getFullYear()}
          />
          <KpiCard
            label="Conversion"
            value={`${kpi?.year?.conversionRate || 0}%`}
            color={
              (kpi?.year?.conversionRate || 0) >= 50
                ? colors.success
                : colors.warning
            }
          />
          <KpiCard
            label="Panier moyen"
            value={fmtMoney(kpi?.year?.avgQuoteValue)}
          />
          <KpiCard
            label="Impayés"
            value={fmtMoney(kpi?.overdue?.amount)}
            subtitle={`${kpi?.overdue?.count || 0} facture(s)`}
            color={kpi?.overdue?.count > 0 ? colors.error : null}
          />
          <KpiCard
            label="Pipeline"
            value={fmtMoney(kpi?.pipeline?.value)}
            subtitle={`${kpi?.pipeline?.count || 0} devis`}
            color="#3b82f6"
          />
        </View>

        {/* Prévisionnel trésorerie */}
        {treasury?.buckets && (
          <>
            <Text style={styles.sectionTitle}>💰 Prévisionnel de trésorerie</Text>
            <View style={styles.kpiGrid}>
              <KpiCard
                label="⚠ En retard"
                value={fmtMoney(treasury.buckets.overdue?.amount)}
                subtitle={`${treasury.buckets.overdue?.count || 0} facture(s)`}
                color={colors.error}
              />
              <KpiCard
                label="< 30 jours"
                value={fmtMoney(treasury.buckets['30_days']?.amount)}
                subtitle={`${treasury.buckets['30_days']?.count || 0}`}
                color={colors.warning}
              />
              <KpiCard
                label="30-60 jours"
                value={fmtMoney(treasury.buckets['60_days']?.amount)}
                subtitle={`${treasury.buckets['60_days']?.count || 0}`}
              />
              <KpiCard
                label="60-90 jours"
                value={fmtMoney(treasury.buckets['90_days']?.amount)}
                subtitle={`${treasury.buckets['90_days']?.count || 0}`}
              />
              <KpiCard
                label="> 90 jours"
                value={fmtMoney(treasury.buckets.later?.amount)}
                subtitle={`${treasury.buckets.later?.count || 0}`}
              />
              <KpiCard
                label="À facturer"
                value={fmtMoney(treasury.acceptedNotInvoiced?.total)}
                subtitle={`${treasury.acceptedNotInvoiced?.count || 0} devis acceptés`}
                color="#3b82f6"
              />
            </View>
          </>
        )}

        {/* Évolution CA */}
        <Text style={styles.sectionTitle}>📈 Évolution du chiffre d'affaires</Text>
        <Card>
          <SimpleBarChart
            data={revenueData}
            height={200}
            barColor={colors.accent}
            valueSuffix="€"
          />
        </Card>

        {/* Conversion */}
        <Text style={styles.sectionTitle}>🎯 Taux de conversion mensuel</Text>
        <Card>
          <SimpleLineChart
            data={conversionData}
            height={200}
            color="#3b82f6"
            valueSuffix="%"
          />
        </Card>

        {/* Rentabilité par métier */}
        <Text style={styles.sectionTitle}>🎯 Rentabilité par métier</Text>
        <Card>
          <SimpleBarChart
            data={metiersData}
            horizontal
            barColor={colors.accent}
            valueSuffix="€"
          />
        </Card>

        {/* Tableau métier */}
        {metiers?.metiers && metiers.metiers.length > 0 && (
          <Card>
            <Text style={styles.subsectionTitle}>Détail métiers</Text>
            {metiers.metiers.slice(0, 10).map((m, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.tableLabel} numberOfLines={1}>
                  {m.name}
                </Text>
                <Text style={styles.tableValue}>{fmtMoney(m.acceptedRevenue)}</Text>
              </View>
            ))}
          </Card>
        )}

        {/* Top clients */}
        <Text style={styles.sectionTitle}>👥 Top clients</Text>
        <Card>
          <SimpleBarChart
            data={clientsData}
            horizontal
            barColor="#22c55e"
            valueSuffix="€"
          />
        </Card>

        {/* Top produits */}
        <Text style={styles.sectionTitle}>🏆 Top produits/services</Text>
        <Card>
          <SimpleBarChart
            data={topProductsData}
            horizontal
            barColor="#a855f7"
            valueSuffix="€"
          />
        </Card>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
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
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  subsectionTitle: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  tableLabel: {
    color: colors.text,
    fontSize: fontSize.sm,
    flex: 1,
    minWidth: 0,
  },
  tableValue: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  errorText: { color: colors.error, fontSize: fontSize.sm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});