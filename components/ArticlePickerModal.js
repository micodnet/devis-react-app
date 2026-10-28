import { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, Modal, FlatList, TouchableOpacity,
  ActivityIndicator, TextInput,
} from 'react-native';
import { productsApi, servicesApi } from '../lib/api';
import { colors, radius, spacing, fontSize } from '../lib/theme';

export default function ArticlePickerModal({ visible, onClose, onSelect }) {
  const [tab, setTab] = useState('products'); // 'products' | 'services'
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodData, servData] = await Promise.all([
        productsApi.list().catch(() => []),
        servicesApi.list().catch(() => []),
      ]);
      setProducts(Array.isArray(prodData) ? prodData : []);
      setServices(Array.isArray(servData) ? servData : []);
    } finally {
      setLoading(false);
    }
  };

  const currentList = tab === 'products' ? products : services;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return currentList;
    return currentList.filter(
      (item) =>
        (item.name || '').toLowerCase().includes(q) ||
        (item.ref || '').toLowerCase().includes(q) ||
        (item.category || '').toLowerCase().includes(q)
    );
  }, [currentList, search]);

  const fmt = (n) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(n || 0);

  const handleSelect = (item) => {
    onSelect({
      ref: item.ref || null,
      name: item.name,
      unitPrice: parseFloat(item.unitPrice) || 0,
      unit: item.unit || 'u',
      qty: 1,
      type: tab === 'products' ? 'product' : 'service',
    });
    setSearch('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Choisir un article</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, tab === 'products' && styles.tabActive]}
            onPress={() => setTab('products')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, tab === 'products' && styles.tabTextActive]}>
              📦 Produits ({products.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'services' && styles.tabActive]}
            onPress={() => setTab('services')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, tab === 'services' && styles.tabTextActive]}>
              🔧 Services ({services.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Rechercher par nom, référence, catégorie..."
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Liste */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>
              {search
                ? 'Aucun résultat'
                : tab === 'products'
                ? 'Aucun produit dans le catalogue'
                : 'Aucun service'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => `${tab}-${item.id}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.itemRow}
                onPress={() => handleSelect(item)}
                activeOpacity={0.7}
              >
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={styles.itemNameWrap}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    {item.ref ? (
                      <View style={styles.refBadge}>
                        <Text style={styles.refText}>{item.ref}</Text>
                      </View>
                    ) : null}
                  </View>
                  {item.description ? (
                    <Text style={styles.itemDesc} numberOfLines={1}>
                      {item.description}
                    </Text>
                  ) : null}
                  {item.category ? (
                    <Text style={styles.itemCat}>{item.category}</Text>
                  ) : null}
                </View>
                <View style={styles.itemPriceWrap}>
                  <Text style={styles.itemPrice}>{fmt(item.unitPrice)}</Text>
                  {item.unit ? (
                    <Text style={styles.itemUnit}>/ {item.unit}</Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeBtn: {
    width: 36, height: 36, alignItems: 'center', justifyContent: 'center',
  },
  closeText: { color: colors.text, fontSize: 22, fontWeight: '600' },
  title: { color: colors.text, fontSize: fontSize.md, fontWeight: '700' },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.bgCard,
  },
  tabActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  tabText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600' },
  tabTextActive: { color: '#0b1120' },
  searchWrap: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  searchInput: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    color: colors.text,
    fontSize: fontSize.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  itemNameWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 2,
  },
  itemName: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
    flexShrink: 1,
  },
  refBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
    borderRadius: radius.full,
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  refText: { color: colors.textMuted, fontSize: 10, fontWeight: '600' },
  itemDesc: { color: colors.textSecondary, fontSize: fontSize.xs },
  itemCat: { color: colors.textMuted, fontSize: 10, marginTop: 2 },
  itemPriceWrap: { alignItems: 'flex-end' },
  itemPrice: { color: colors.accent, fontSize: fontSize.md, fontWeight: '700' },
  itemUnit: { color: colors.textMuted, fontSize: 10 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyText: { color: colors.textMuted, fontSize: fontSize.sm },
});