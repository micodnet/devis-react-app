import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { stockApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';

const TYPES = [
  { value: 'in', label: '📥 Entrée' },
  { value: 'out', label: '📤 Sortie' },
  { value: 'adjustment', label: '⚙️ Ajustement' },
];

export default function MovementScreen() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [type, setType] = useState('in');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [reference, setReference] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/stock');
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await stockApi.productsWithStock();
      setProducts(data);
    } catch (err) {
      console.warn('Erreur load products:', err.message);
    }
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const submit = async () => {
    setError('');
    if (!selectedProductId) {
      setError('Sélectionnez un produit.');
      return;
    }
    const qty = parseFloat(quantity.replace(',', '.'));
    if (!qty || qty <= 0) {
      setError('Quantité invalide.');
      return;
    }

    setSubmitting(true);
    try {
      await stockApi.createMovement({
        productId: selectedProductId,
        movementType: type,
        quantity: qty,
        reason: reason.trim() || null,
        reference: reference.trim() || null,
      });
      router.replace('/(app)/stock');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur lors de l\'enregistrement.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mouvement de stock</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {!!error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}

          <Card>
            <Text style={styles.sectionTitle}>Produit</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setProductPickerOpen(!productPickerOpen)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.selectorText, !selectedProduct && styles.selectorPlaceholder]}
                numberOfLines={1}
              >
                {selectedProduct
                  ? `${selectedProduct.name} (${selectedProduct.stockQuantity} ${selectedProduct.unit || 'u'})`
                  : '— Sélectionner un produit —'}
              </Text>
              <Text style={styles.chevron}>{productPickerOpen ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {productPickerOpen && (
              <View style={styles.list}>
                {products.length === 0 ? (
                  <Text style={styles.empty}>Aucun produit avec suivi de stock.</Text>
                ) : (
                  products.map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      style={styles.listItem}
                      onPress={() => {
                        setSelectedProductId(p.id);
                        setProductPickerOpen(false);
                      }}
                    >
                      <Text style={styles.listItemText} numberOfLines={1}>
                        {p.name} · {p.stockQuantity} {p.unit || 'u'}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Type</Text>
            <View style={styles.typeRow}>
              {TYPES.map((t) => {
                const isActive = type === t.value;
                return (
                  <TouchableOpacity
                    key={t.value}
                    style={[styles.typeBtn, isActive && styles.typeBtnActive]}
                    onPress={() => setType(t.value)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.typeText, isActive && styles.typeTextActive]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Détails</Text>
            <Input
              label="Quantité *"
              value={quantity}
              onChangeText={setQuantity}
              placeholder="Ex: 5"
              keyboardType="numeric"
            />
            <Input
              label="Motif (optionnel)"
              value={reason}
              onChangeText={setReason}
              placeholder="Inventaire, casse, retour..."
            />
            <Input
              label="Référence (optionnel)"
              value={reference}
              onChangeText={setReference}
              placeholder="N° bon de livraison..."
            />
          </Card>

          <Button
            title={submitting ? 'Enregistrement...' : 'Enregistrer le mouvement'}
            onPress={submit}
            disabled={submitting}
            loading={submitting}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backText: { color: colors.text, fontSize: 24, fontWeight: '600' },
  title: { flex: 1, color: colors.text, fontSize: fontSize.lg, fontWeight: '700' },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  selectorText: { color: colors.text, fontSize: fontSize.sm, flex: 1 },
  selectorPlaceholder: { color: colors.textMuted },
  chevron: { color: colors.textMuted, fontSize: 12 },
  list: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
    maxHeight: 240,
  },
  listItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listItemText: { color: colors.text, fontSize: fontSize.sm },
  empty: { color: colors.textMuted, fontSize: fontSize.sm, padding: spacing.md, textAlign: 'center' },
  typeRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  typeBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.bgCard,
  },
  typeBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  typeText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600' },
  typeTextActive: { color: '#0b1120' },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: { color: colors.error, fontSize: fontSize.sm },
});