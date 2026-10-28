import { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  RefreshControl, TouchableOpacity, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { stockApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import ListItem from '../../components/ListItem';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';
import StockBadge from '../../components/StockBadge';

const FILTERS = [
  { key: 'all', label: 'Tous' },
  { key: 'alert', label: '⚠ Alertes' },
  { key: 'out', label: 'Ruptures' },
];

export default function StockScreen() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const loadStock = async () => {
    try {
      setError('');
      const data = await stockApi.productsWithStock();
      setProducts(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadStock();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadStock();
  };

  const filtered = useMemo(() => {
    if (filter === 'all') return products;
    if (filter === 'alert')
      return products.filter((p) => Number(p.stockQuantity) <= Number(p.stockAlertThreshold));
    if (filter === 'out')
      return products.filter((p) => Number(p.stockQuantity) <= 0);
    return products;
  }, [products, filter]);

  const counts = {
    all: products.length,
    alert: products.filter(
      (p) => Number(p.stockQuantity) <= Number(p.stockAlertThreshold)
    ).length,
    out: products.filter((p) => Number(p.stockQuantity) <= 0).length,
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header
        title="Stock"
        right={
          <TouchableOpacity
            onPress={() => router.push('/stock/movement')}
            style={styles.newBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.newBtnText}>+ Mouvement</Text>
          </TouchableOpacity>
        }
      />

      {/* Filtres */}
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
            >
              <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                {f.label}
              </Text>
              <View style={[styles.filterCount, isActive && styles.filterCountActive]}>
                <Text style={[styles.filterCountText, isActive && styles.filterCountTextActive]}>
                  {counts[f.key]}
                </Text>
              </View>
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
          <Button title="Réessayer" onPress={loadStock} variant="secondary" />
        </View>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="📦"
          title={
            filter === 'all'
              ? 'Aucun produit avec suivi de stock'
              : 'Aucun produit dans cette catégorie'
          }
          message={
            filter === 'all'
              ? 'Activez le suivi de stock sur vos produits depuis l\'app web.'
              : 'Changez de filtre.'
          }
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <ListItem
              icon="📦"
              title={item.name}
              subtitle={`Seuil: ${item.stockAlertThreshold} ${item.unit || 'u'}${
                item.supplierName ? ' · ' + item.supplierName : ''
              }`}
              rightText={`${item.stockQuantity} ${item.unit || 'u'}`}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
          ListFooterComponent={
            <Text style={styles.footer}>
              {filtered.length} produit{filtered.length > 1 ? 's' : ''}
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
  newBtnText: {
    color: '#0b1120',
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.bgCard,
    height: 36,
  },
  filterBtnActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filterText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  filterTextActive: { color: '#0b1120' },
  filterCount: {
    backgroundColor: colors.bgInput,
    borderRadius: radius.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 20,
    alignItems: 'center',
  },
  filterCountActive: { backgroundColor: 'rgba(11,17,32,0.25)' },
  filterCountText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  filterCountTextActive: { color: '#0b1120' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.md,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  footer: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
});