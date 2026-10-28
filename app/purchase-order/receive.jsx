import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { purchaseOrdersApi, poReceiveApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function ReceivePurchaseOrderScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace(`/purchase-order/${id}`);
  };

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    try {
      setError('');
      const [orderData, receiveData] = await Promise.all([
        purchaseOrdersApi.get(id),
        poReceiveApi.getReceiveData(id).catch(() => ({ items: [] })),
      ]);
      setOrder(orderData);
      const rawItems = receiveData.items || orderData.items || [];
      setItems(
        rawItems.map((it) => ({
          id: it.id || it.purchaseOrderItemId,
          productName: it.productName || it.product_name || it.name,
          productRef: it.productRef || it.product_ref || it.ref,
          orderedQty: Number(it.quantity) || 0,
          alreadyReceived: Number(it.quantityReceived || it.quantity_received) || 0,
          unit: it.unit || 'u',
          unitPrice: Number(it.unitPrice || it.unit_price) || 0,
          receiveNow: '0',
        }))
      );
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const updateReceive = (index, value) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], receiveNow: value };
      return copy;
    });
  };

  const fillAll = () => {
    setItems((prev) =>
      prev.map((it) => ({
        ...it,
        receiveNow: String(Math.max(0, it.orderedQty - it.alreadyReceived)),
      }))
    );
  };

  const getTotals = () => {
    let ordered = 0;
    let received = 0;
    let totalOrderedValue = 0;
    let totalReceiveValue = 0;
    for (const it of items) {
      const now = parseFloat(String(it.receiveNow).replace(',', '.')) || 0;
      ordered += it.orderedQty;
      received += now;
      totalOrderedValue += it.orderedQty * it.unitPrice;
      totalReceiveValue += now * it.unitPrice;
    }
    return { ordered, received, totalOrderedValue, totalReceiveValue };
  };

  const submit = async () => {
    setError('');
    const cleanItems = items
      .map((it) => ({
        itemId: it.id,
        quantityReceived: parseFloat(String(it.receiveNow).replace(',', '.')) || 0,
      }))
      .filter((it) => it.quantityReceived > 0);

    if (cleanItems.length === 0) {
      return setError('Saisissez au moins une quantité à réceptionner.');
    }

    // Vérifier qu'on ne dépasse pas les quantités commandées
    for (const c of cleanItems) {
      const item = items.find((it) => it.id === c.itemId);
      const maxToReceive = item.orderedQty - item.alreadyReceived;
      if (c.quantityReceived > maxToReceive) {
        return setError(`La quantité pour "${item.productName}" dépasse le reste à recevoir (${maxToReceive}).`);
      }
    }

    setSubmitting(true);
    try {
      await poReceiveApi.receivePartial(id, cleanItems);
      Alert.alert('Succès', 'Réception enregistrée. Le stock a été mis à jour.');
      router.replace(`/purchase-order/${id}`);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  const fmt = (n) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency', currency: 'EUR', minimumFractionDigits: 2,
    }).format(n || 0);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Réception" showBack />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>
      </SafeAreaView>
    );
  }

  if (error && !order) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Réception" showBack />
        <View style={styles.center}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <Button title="Retour" onPress={handleBack} variant="secondary" />
        </View>
      </SafeAreaView>
    );
  }

  const totals = getTotals();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Réception partielle" showBack />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {!!error && (<View style={styles.errorBox}><Text style={styles.errorText}>⚠️ {error}</Text></View>)}

        {order && (
          <Card>
            <Text style={styles.sectionTitle}>Bon de commande</Text>
            <Row label="N°" value={order.poNumber || order.po_number} />
            <Row label="Fournisseur" value={order.supplierName || '—'} />
          </Card>
        )}

        <Card>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Articles</Text>
            <TouchableOpacity style={styles.fillBtn} onPress={fillAll} activeOpacity={0.7}>
              <Text style={styles.fillBtnText}>Tout recevoir</Text>
            </TouchableOpacity>
          </View>

          {items.map((it, i) => {
            const remaining = Math.max(0, it.orderedQty - it.alreadyReceived);
            return (
              <View key={i} style={styles.itemBlock}>
                <View style={styles.itemHeader}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.itemName} numberOfLines={2}>{it.productName}</Text>
                    {it.productRef ? <Text style={styles.itemRef}>{it.productRef}</Text> : null}
                  </View>
                </View>

                <View style={styles.qtyRow}>
                  <View style={styles.qtyCol}>
                    <Text style={styles.qtyLabel}>Commandé</Text>
                    <Text style={styles.qtyValue}>{it.orderedQty} {it.unit}</Text>
                  </View>
                  <View style={styles.qtyCol}>
                    <Text style={styles.qtyLabel}>Déjà reçu</Text>
                    <Text style={styles.qtyValue}>{it.alreadyReceived} {it.unit}</Text>
                  </View>
                  <View style={styles.qtyCol}>
                    <Text style={styles.qtyLabel}>Reste</Text>
                    <Text style={[styles.qtyValue, { color: colors.warning }]}>
                      {remaining} {it.unit}
                    </Text>
                  </View>
                </View>

                <Input
                  label="À recevoir maintenant"
                  value={String(it.receiveNow)}
                  onChangeText={(v) => updateReceive(i, v)}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
            );
          })}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Totaux</Text>
          <Row label="Quantité commandée" value={`${totals.ordered}`} />
          <Row label="Quantité reçue (maintenant)" value={`${totals.received}`} />
          <Row label="Valeur commandée" value={fmt(totals.totalOrderedValue)} />
          <Row label="Valeur reçue" value={fmt(totals.totalReceiveValue)} />
        </Card>

        <Button
          title={submitting ? 'Enregistrement...' : '📦 Valider la réception'}
          onPress={submit}
          disabled={submitting}
          loading={submitting}
        />
      </ScrollView>
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
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: spacing.md,
  },
  fillBtn: {
    backgroundColor: colors.bgInput, paddingHorizontal: spacing.md,
    paddingVertical: 6, borderRadius: radius.full, borderWidth: 1,
    borderColor: colors.borderLight,
  },
  fillBtnText: { color: colors.textSecondary, fontSize: 11, fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, gap: spacing.md },
  label: { color: colors.textSecondary, fontSize: fontSize.sm },
  value: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500', textAlign: 'right' },
  itemBlock: {
    paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  itemHeader: { flexDirection: 'row', marginBottom: spacing.sm },
  itemName: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600' },
  itemRef: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },
  qtyRow: {
    flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md,
    backgroundColor: colors.bg, padding: spacing.sm, borderRadius: radius.sm,
  },
  qtyCol: { flex: 1, alignItems: 'center' },
  qtyLabel: { color: colors.textMuted, fontSize: 9, textTransform: 'uppercase', fontWeight: '700', marginBottom: 2 },
  qtyValue: { color: colors.text, fontSize: fontSize.sm, fontWeight: '700' },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)', borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.lg,
  },
  errorText: { color: colors.error, fontSize: fontSize.sm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
});