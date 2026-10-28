import { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  RefreshControl, TouchableOpacity, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { templatesApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';

export default function TemplatesScreen() {
  const router = useRouter();
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setError('');
      const [listData, catData] = await Promise.all([
        templatesApi.list({
          category: currentCategory === 'all' ? undefined : currentCategory,
          search: search || undefined,
        }),
        templatesApi.categories(),
      ]);
      setTemplates(Array.isArray(listData) ? listData : []);
      setCategories(Array.isArray(catData) ? catData : []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [currentCategory, search])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
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
        title="Modèles"
        showBack
        right={
          <TouchableOpacity
            onPress={() => router.push('/template/new')}
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
        placeholder="🔍 Rechercher un modèle..."
      />

      {/* Filtres catégories */}
      {categories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
          style={styles.filtersScroll}
        >
          <TouchableOpacity
            style={[
              styles.filterBtn,
              currentCategory === 'all' && styles.filterBtnActive,
            ]}
            onPress={() => setCurrentCategory('all')}
          >
            <Text
              style={[
                styles.filterText,
                currentCategory === 'all' && styles.filterTextActive,
              ]}
            >
              Toutes
            </Text>
          </TouchableOpacity>
          {categories.map((cat) => {
            const isActive = currentCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.filterBtn, isActive && styles.filterBtnActive]}
                onPress={() => setCurrentCategory(cat)}
              >
                <Text
                  style={[styles.filterText, isActive && styles.filterTextActive]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <Button title="Réessayer" onPress={loadData} variant="secondary" />
        </View>
      ) : templates.length === 0 ? (
        <EmptyState
          icon="📋"
          title="Aucun modèle"
          message="Créez votre premier modèle pour gagner du temps sur vos devis récurrents."
        />
      ) : (
        <FlatList
          data={templates}
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
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/template/${item.id}`)}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardName} numberOfLines={1}>
                  {item.name}
                </Text>
                {item.category ? (
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{item.category}</Text>
                  </View>
                ) : null}
              </View>
              {item.description ? (
                <Text style={styles.cardDesc} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}
              <View style={styles.cardFooter}>
                <Text style={styles.cardMeta}>
                  {(item.items || []).length} article
                  {(item.items || []).length > 1 ? 's' : ''} ·{' '}
                  {item.usageCount || 0} utilisation
                  {(item.usageCount || 0) > 1 ? 's' : ''}
                </Text>
                <Text style={styles.cardTotal}>{fmtMoney(item.total)}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListFooterComponent={
            <Text style={styles.footer}>
              {templates.length} modèle{templates.length > 1 ? 's' : ''}
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
  listContent: { padding: spacing.lg, paddingBottom: spacing.xxl },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
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
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  categoryText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  cardDesc: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  cardMeta: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    flex: 1,
  },
  cardTotal: {
    color: colors.accent,
    fontSize: fontSize.md,
    fontWeight: '800',
  },
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