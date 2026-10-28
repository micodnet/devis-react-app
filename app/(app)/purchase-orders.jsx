import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  RefreshControl, TouchableOpacity, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { purchaseOrdersApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';

const FILTERS = [
  { key: 'all', label: 'Tous' },
  { key: 'draft', label: 'Brouillons' },
  { key: 'sent', label: 'Envoyés' },
  { key: 'partial', label: 'Reçus partiels' },
  { key: 'received', label: 'Reçus' },
  { key: 'cancelled', label: 'Annulés' },
];

const STATUS_LABELS = {
  draft: 'Brouillon',
  sent: 'Envoyé',
  partial: 'Reçu partiel',
  received: 'Reçu',
  cancelled: 'Annulé',
};

const STATUS_COLORS = {
  draft: '#94a3b8',
  sent: '#3b82f6',
  partial: '#eab308',
  received: '#22c55e',
  cancelled: '#f87171',
};

export default function PurchaseOrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);

  const loadOrders = async () => {
    try {
      setError('');
      const data = await purchaseOrdersApi.list(currentFilter);
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [currentFilter])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const handleScan = () => {
    Alert.alert(
      'Scanner les stocks',
      'Générer automatiquement les bons de commande pour les produits sous le seuil d\'alerte ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Scanner',
          onPress: async () => {
            setScanning(true);
            try {
              const res = await purchaseOrdersApi.scanStock();
              if (res.created === 0) {
                Alert.alert('Scan terminé', 'Aucun produit sous le seuil d\'alerte.');
              } else {
                Alert.alert('Scan terminé', `${res.created} bon(s) de commande créé(s).`);
              }
              loadOrders();
            } catch (err) {
              Alert.alert('Erreur', err.response?.data?.error || err.message);
            } finally {
              setScanning(false);
            }
          },
        },
      ]
    );
  };

  const fmtMoney = (n) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(n || 0);

  const fmtDate = (d) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('fr-FR'); } catch { return d; }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header
        title="Bons de commande"
        showBack
        right={
          <TouchableOpacity
            onPress={() => router.push('/purchase-order/new')}
            style={styles.newBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.newBtnText}>+ Nouveau</Text>
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

      <TouchableOpacity
        style={styles.scanBtn}
        onPress={handleScan}
        disabled={scanning}
        activeOpacity={0.7}
      >
        <Text style={styles.scanBtnText}>
          {scanning ? '⏳ Scan...' : '🔍 Scanner les stocks et générer les BC'}
        </Text>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <Button title="Réessayer" onPress={loadOrders} variant="secondary" />
        </View>
      ) : orders.length === 0 ? (
        <EmptyState
          icon="🛒"
          title="Aucun bon de commande"
          message="Les BC sont créés automatiquement quand le stock passe sous le seuil d'alerte, ou manuellement."
        />
      ) : (
        <FlatList
          data={orders}
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
            const source = item.source;
            return (
              <TouchableOpacity
                style={[styles.card, { borderLeftColor: statusColor }]}
                onPress={() => router.push(`/purchase-order/${item.id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardNumber}>{item.poNumber || item.po_number}</Text>
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
                <Text style={styles.cardSupplier} numberOfLines={1}>
                  {item.supplierName || '—'}
                </Text>
                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.cardMetaLabel}>Commande</Text>
                    <Text style={styles.cardMeta}>{fmtDate(item.issueDate || item.issue_date)}</Text>
                  </View>
                  <View>
                    <Text style={styles.cardMetaLabel}>Articles</Text>
                    <Text style={styles.cardMeta}>
                      {item.itemsCount || item.items_count || 0}
                    </Text>
                  </View>
                  <Text style={styles.cardTotal}>{fmtMoney(item.total)}</Text>
                </View>
                {source === 'low_stock' && (
                  <Text style={styles.sourceBadge}>⚠ Stock bas</Text>
                )}
                {source === 'quote_signed' && (
                  <Text style={[styles.sourceBadge, { color: '#3b82f6' }]}>
                    ✅ Devis signé
                  </Text>
                )}
              </TouchableOpacity>
            );
          }}
          ListFooterComponent={
            <Text style={styles.footer}>
              {orders.length} bon{orders.length > 1 ? 's' : ''}
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
  scanBtn: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(234,179,8,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(234,179,8,0.4)',
    alignItems: 'center',
  },
  scanBtnText: {
    color: '#eab308',
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
  cardNumber: {
    color: colors.accent,
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
  cardSupplier: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '500',
    marginBottom: spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  cardMetaLabel: {
    color: colors.textMuted,
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 2,
  },
  cardMeta: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600' },
  cardTotal: {
    color: colors.accent,
    fontSize: fontSize.lg,
    fontWeight: '800',
    marginLeft: 'auto',
  },
  sourceBadge: {
    color: '#eab308',
    fontSize: 10,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
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