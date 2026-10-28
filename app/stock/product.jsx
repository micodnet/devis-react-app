import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { productsApi, stockApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import StockBadge from '../../components/StockBadge';

export default function StockProductScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/stock');
  };

  useEffect(() => { loadAll(); }, [id]);

  const loadAll = async () => {
    try {
      setError('');
      const [p, m] = await Promise.all([
        productsApi.get(id),
        stockApi.movements(500).catch(() => []),
      ]);
      setProduct(p);
      setMovements((m || []).filter((mv) =>
        String(mv.productId || mv.product_id) === String(id)
      ));
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency', currency: 'EUR', minimumFractionDigits: 2,
    }).format(n || 0);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Produit" showBack />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Produit" showBack />
        <View style={styles.center}>
          <Text style={styles.errorText}>⚠️ {error || 'Introuvable'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const typeLabels = { in: '📥 Entrée', out: '📤 Sortie', adjustment: '⚙️ Ajustement', sale: '💰 Vente', purchase: '🛒 Réception' };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title={product.name} showBack />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card>
          <Text style={styles.sectionTitle}>Informations</Text>
          {product.ref ? <Row label="Référence" value={product.ref} /> : null}
          <Row label="Nom" value={product.name} />
          {product.description ? <Row label="Description" value={product.description} /> : null}
          {product.category ? <Row label="Catégorie" value={product.category} /> : null}
          <Row label="Unité" value={product.unit || 'u'} />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Stock</Text>
          <View style={styles.stockHeader}>
            <StockBadge quantity={product.stockQuantity} threshold={product.stockAlertThreshold} />
          </View>
          <Row label="Stock actuel" value={`${product.stockQuantity || 0} ${product.unit || 'u'}`} />
          <Row label="Seuil d'alerte" value={`${product.stockAlertThreshold || 0}`} />
          {product.stockMax ? <Row label="Stock max" value={`${product.stockMax}`} /> : null}
          {product.reorderQuantity ? <Row label="Qté à recommander" value={`${product.reorderQuantity}`} /> : null}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Prix</Text>
          <Row label="Prix vente HT" value={fmt(product.unitPrice)} />
          {product.costPrice ? <Row label="Prix achat HT" value={fmt(product.costPrice)} /> : null}
          {product.costPrice && product.unitPrice ? (
            <Row label="Marge" value={`${(((product.unitPrice - product.costPrice) / product.unitPrice) * 100).toFixed(1)} %`} />
          ) : null}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Actions</Text>
          <TouchableOpacity style={styles.actionRow}
            onPress={() => router.push(`/stock/movement?productId=${id}`)} activeOpacity={0.7}>
            <Text style={[styles.actionLabel, { color: colors.accent }]}>+ Nouveau mouvement</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionRow}
            onPress={() => router.push(`/product/edit?id=${id}`)} activeOpacity={0.7}>
            <Text style={styles.actionLabel}>✏️ Modifier</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </Card>

        <Text style={styles.sectionTitleOutside}>Historique ({movements.length})</Text>
        {movements.length === 0 ? (
          <Card><Text style={styles.empty}>Aucun mouvement pour ce produit.</Text></Card>
        ) : (
          movements.slice(0, 50).map((m) => {
            const isIn = m.movementType === 'in' || m.movementType === 'purchase';
            return (
              <Card key={m.id} style={{ borderLeftWidth: 4, borderLeftColor: isIn ? colors.success : colors.error }}>
                <View style={styles.movementHeader}>
                  <Text style={styles.movementType}>
                    {typeLabels[m.movementType] || m.movementType}
                  </Text>
                  <Text style={[styles.movementQty, { color: isIn ? colors.success : colors.error }]}>
                    {isIn ? '+' : '-'}{m.quantity}
                  </Text>
                </View>
                <Text style={styles.movementDate}>
                  {new Date(m.createdAt).toLocaleString('fr-FR')}
                </Text>
                {m.reason ? <Text style={styles.movementReason}>{m.reason}</Text> : null}
                {m.reference ? <Text style={styles.movementRef}>Réf: {m.reference}</Text> : null}
              </Card>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={3}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700', marginBottom: spacing.md },
  sectionTitleOutside: {
    color: colors.text, fontSize: fontSize.md, fontWeight: '700',
    marginTop: spacing.lg, marginBottom: spacing.md,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, gap: spacing.md },
  label: { color: colors.textSecondary, fontSize: fontSize.sm },
  value: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500', flexShrink: 1, textAlign: 'right' },
  stockHeader: { marginBottom: spacing.md },
  actionRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: colors.border,
  },
  actionLabel: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500' },
  actionArrow: { color: colors.textMuted, fontSize: 20, fontWeight: '300' },
  movementHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', gap: spacing.md, marginBottom: 4,
  },
  movementType: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600' },
  movementQty: { fontSize: fontSize.md, fontWeight: '800' },
  movementDate: { color: colors.textMuted, fontSize: 10 },
  movementReason: { color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2 },
  movementRef: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },
  empty: { color: colors.textMuted, fontSize: fontSize.sm, fontStyle: 'italic', textAlign: 'center', paddingVertical: spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorText: { color: colors.error, fontSize: fontSize.md, textAlign: 'center' },
});