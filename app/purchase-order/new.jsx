import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { purchaseOrdersApi, suppliersApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import ArticlePickerModal from '../../components/ArticlePickerModal';

export default function NewPurchaseOrderScreen() {
  const router = useRouter();

  const [suppliers, setSuppliers] = useState([]);
  const [supplierId, setSupplierId] = useState(null);
  const [supplierPickerOpen, setSupplierPickerOpen] = useState(false);
  const [supplierEmail, setSupplierEmail] = useState('');

  const [items, setItems] = useState([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [expectedDate, setExpectedDate] = useState('');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/purchase-orders');
  };

  useEffect(() => { loadSuppliers(); }, []);

  const loadSuppliers = async () => {
    try {
      const data = await suppliersApi.list();
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (err) { /* silent */ }
  };

  const selectSupplier = (s) => {
    setSupplierId(s.id);
    setSupplierEmail(s.email || '');
    setSupplierPickerOpen(false);
  };

  const addArticle = (article) => {
    setItems((prev) => [...prev, {
      productId: article.id,
      productRef: article.ref,
      productName: article.name,
      unit: article.unit,
      unitPrice: article.unitPrice,
      quantity: 1,
    }]);
  };

  const updateQty = (index, value) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], quantity: value };
      return copy;
    });
  };

  const updatePrice = (index, value) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], unitPrice: parseFloat(String(value).replace(',', '.')) || 0 };
      return copy;
    });
  };

  const removeItem = (index) => setItems((prev) => prev.filter((_, i) => i !== index));

  const getTotals = () => {
    let subtotal = 0;
    for (const it of items) {
      const qty = parseFloat(String(it.quantity).replace(',', '.')) || 0;
      const price = Number(it.unitPrice) || 0;
      subtotal += qty * price;
    }
    const vatAmount = subtotal * 0.21;
    return { subtotal, vatAmount, total: subtotal + vatAmount };
  };

  const submit = async () => {
    setError('');
    if (items.length === 0) return setError('Ajoutez au moins un article.');

    const cleanItems = items.map((it) => {
      const qty = parseFloat(String(it.quantity).replace(',', '.')) || 0;
      const price = Number(it.unitPrice) || 0;
      return {
        productId: it.productId || null,
        productRef: it.productRef || null,
        productName: it.productName,
        unit: it.unit || 'u',
        quantity: qty,
        unitPrice: price,
        total: Math.round(qty * price * 100) / 100,
      };
    });

    setSubmitting(true);
    try {
      const res = await purchaseOrdersApi.create({
        supplierId,
        supplierEmail: supplierEmail.trim() || null,
        items: cleanItems,
        issueDate,
        expectedDate: expectedDate || null,
        notes: notes.trim() || null,
      });
      router.replace(`/purchase-order/${res.id || res.purchaseOrder?.id}`);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  const fmt = (n) => new Intl.NumberFormat('fr-FR', {
    style: 'currency', currency: 'EUR', minimumFractionDigits: 2,
  }).format(n || 0);

  const { subtotal, vatAmount, total } = getTotals();
  const selectedSupplier = suppliers.find((s) => s.id === supplierId);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Nouveau bon de commande" showBack />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {!!error && (<View style={styles.errorBox}><Text style={styles.errorText}>⚠️ {error}</Text></View>)}

          <Card>
            <Text style={styles.sectionTitle}>Fournisseur</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setSupplierPickerOpen(!supplierPickerOpen)}
              activeOpacity={0.7}
            >
              <Text style={[styles.selectorText, !selectedSupplier && styles.selectorPlaceholder]} numberOfLines={1}>
                {selectedSupplier ? selectedSupplier.name : '— Sélectionner —'}
              </Text>
              <Text style={styles.chevron}>{supplierPickerOpen ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {supplierPickerOpen && (
              <View style={styles.list}>
                <TouchableOpacity style={styles.listItem} onPress={() => { setSupplierId(null); setSupplierEmail(''); setSupplierPickerOpen(false); }}>
                  <Text style={styles.listItemText}>— Aucun —</Text>
                </TouchableOpacity>
                {suppliers.map((s) => (
                  <TouchableOpacity key={s.id} style={styles.listItem} onPress={() => selectSupplier(s)}>
                    <Text style={styles.listItemText} numberOfLines={1}>
                      {s.name}{s.email ? ` (${s.email})` : ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Input
              label="Email fournisseur"
              value={supplierEmail}
              onChangeText={setSupplierEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </Card>

          <Card>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Articles ({items.length})</Text>
              <TouchableOpacity style={styles.addBtnSmall} onPress={() => setPickerOpen(true)} activeOpacity={0.7}>
                <Text style={styles.addBtnSmallText}>+ Ajouter</Text>
              </TouchableOpacity>
            </View>

            {items.length === 0 ? (
              <TouchableOpacity style={styles.emptyDrop} onPress={() => setPickerOpen(true)} activeOpacity={0.7}>
                <Text style={styles.emptyDropIcon}>📦</Text>
                <Text style={styles.emptyDropTitle}>Aucun article</Text>
                <Text style={styles.emptyDropSub}>Tapez ici pour choisir des produits</Text>
              </TouchableOpacity>
            ) : (
              items.map((it, i) => (
                <View key={i} style={styles.itemRow}>
                  <View style={styles.itemHeader}>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.itemName} numberOfLines={2}>{it.productName}</Text>
                      {it.productRef ? <Text style={styles.itemRef}>{it.productRef}</Text> : null}
                    </View>
                    <TouchableOpacity onPress={() => removeItem(i)}>
                      <Text style={styles.removeText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.itemInputs}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Qté</Text>
                      <Input value={String(it.quantity)} onChangeText={(v) => updateQty(i, v)} keyboardType="numeric" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>P.U. HT</Text>
                      <Input value={String(it.unitPrice)} onChangeText={(v) => updatePrice(i, v)} keyboardType="numeric" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Total</Text>
                      <View style={styles.totalBox}>
                        <Text style={styles.totalBoxText}>
                          {fmt((parseFloat(String(it.quantity).replace(',', '.')) || 0) * (Number(it.unitPrice) || 0))}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            )}
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Dates</Text>
            <Input label="Date de commande" value={issueDate} onChangeText={setIssueDate} placeholder="YYYY-MM-DD" />
            <Input label="Livraison prévue" value={expectedDate} onChangeText={setExpectedDate} placeholder="YYYY-MM-DD" />
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Notes internes</Text>
            <Input value={notes} onChangeText={setNotes} multiline />
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Totaux</Text>
            <Row label="Sous-total HT" value={fmt(subtotal)} />
            <Row label="TVA (21%)" value={fmt(vatAmount)} />
            <View style={[styles.row, styles.totalRow]}>
              <Text style={styles.totalLabel}>TOTAL TTC</Text>
              <Text style={styles.totalValue}>{fmt(total)}</Text>
            </View>
          </Card>

          <Button
            title={submitting ? 'Création...' : 'Créer le bon de commande'}
            onPress={submit}
            disabled={submitting}
            loading={submitting}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <ArticlePickerModal
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={addArticle}
      />
    </SafeAreaView>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  selector: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.borderLight,
    borderRadius: radius.md, paddingVertical: 12, paddingHorizontal: spacing.md,
    gap: spacing.md, marginBottom: spacing.md,
  },
  selectorText: { color: colors.text, fontSize: fontSize.sm, flex: 1 },
  selectorPlaceholder: { color: colors.textMuted },
  chevron: { color: colors.textMuted, fontSize: 12 },
  list: {
    marginBottom: spacing.md, borderWidth: 1, borderColor: colors.borderLight,
    borderRadius: radius.md, backgroundColor: colors.bg, maxHeight: 240,
  },
  listItem: {
    paddingVertical: spacing.md, paddingHorizontal: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  listItemText: { color: colors.text, fontSize: fontSize.sm },
  addBtnSmall: {
    backgroundColor: colors.accent, paddingHorizontal: spacing.md,
    paddingVertical: 5, borderRadius: radius.full,
  },
  addBtnSmallText: { color: '#0b1120', fontSize: fontSize.xs, fontWeight: '700' },
  emptyDrop: {
    borderWidth: 2, borderStyle: 'dashed', borderColor: colors.borderLight,
    borderRadius: radius.lg, paddingVertical: spacing.xxl,
    alignItems: 'center', justifyContent: 'center',
  },
  emptyDropIcon: { fontSize: 32, marginBottom: spacing.sm },
  emptyDropTitle: { color: colors.text, fontSize: fontSize.sm, fontWeight: '700', marginBottom: 4 },
  emptyDropSub: { color: colors.textMuted, fontSize: fontSize.xs, textAlign: 'center' },
  itemRow: { paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  itemHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.sm },
  itemName: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600' },
  itemRef: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },
  removeText: { color: colors.error, fontSize: 18, fontWeight: '700', paddingHorizontal: spacing.sm },
  itemInputs: { flexDirection: 'row', gap: spacing.sm },
  inputLabel: {
    color: colors.textMuted, fontSize: 10, textTransform: 'uppercase',
    fontWeight: '600', marginBottom: 4,
  },
  totalBox: {
    backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.borderLight,
    borderRadius: radius.md, paddingVertical: 12, paddingHorizontal: 14,
    minHeight: 44, justifyContent: 'center',
  },
  totalBoxText: { color: colors.accent, fontSize: fontSize.sm, fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, gap: spacing.md },
  label: { color: colors.textSecondary, fontSize: fontSize.sm },
  value: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500', textAlign: 'right' },
  totalRow: { borderTopWidth: 2, borderTopColor: colors.accent, marginTop: spacing.md, paddingTop: spacing.md },
  totalLabel: { color: colors.text, fontSize: fontSize.md, fontWeight: '800' },
  totalValue: { color: colors.accent, fontSize: fontSize.xl, fontWeight: '800' },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)', borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.lg,
  },
  errorText: { color: colors.error, fontSize: fontSize.sm },
});