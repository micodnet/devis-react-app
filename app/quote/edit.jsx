import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { quotesApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';

const VALID_STATUSES = [
  { value: 'draft', label: 'Brouillon' },
  { value: 'sent', label: 'Envoyé' },
  { value: 'accepted', label: 'Accepté' },
  { value: 'refused', label: 'Refusé' },
];

export default function EditQuoteScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState(null);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientVat, setClientVat] = useState('');
  const [items, setItems] = useState([]);
  const [vatRegime, setVatRegime] = useState('franchise');
  const [vatRate, setVatRate] = useState('21');
  const [validDate, setValidDate] = useState('');
  const [status, setStatus] = useState('draft');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadQuote(); }, [id]);

  const loadQuote = async () => {
    try {
      const q = await quotesApi.get(id);
      setQuote(q);
      setClientName(q.clientName || '');
      setClientEmail(q.clientEmail || '');
      setClientAddress(q.clientAddress || '');
      setClientVat(q.clientVat || '');
      setVatRegime(q.vatRegime || 'franchise');
      setVatRate(String(q.vatRate || 21));
      setValidDate(q.validDate ? q.validDate.slice(0, 10) : '');
      setStatus(q.status || 'draft');
      setItems(
        (q.items || []).map((it) => ({
          ref: it.ref || null,
          name: it.name || '',
          qty: String(it.qty || 1),
          unitPrice: String(it.unitPrice || 0),
          total: Number(it.total) || 0,
        }))
      );
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const updateItem = (index, key, value) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [key]: value };
      const qty = parseFloat(String(copy[index].qty).replace(',', '.')) || 0;
      const price = parseFloat(String(copy[index].unitPrice).replace(',', '.')) || 0;
      copy[index].total = Math.round(qty * price * 100) / 100;
      return copy;
    });
  };

  const addItem = () => {
    setItems((prev) => [...prev, { ref: null, name: '', qty: '1', unitPrice: '0', total: 0 }]);
  };

  const removeItem = (index) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const computeTotals = () => {
    let subtotal = 0;
    for (const it of items) {
      subtotal += Number(it.total) || 0;
    }
    const vatAmount = vatRegime === 'assujetti'
      ? subtotal * (parseFloat(vatRate.replace(',', '.')) || 0) / 100
      : 0;
    return { subtotal, vatAmount, total: subtotal + vatAmount };
  };

  const submit = async () => {
    setError('');
    const cleanItems = items
      .filter((it) => it.name.trim() && (parseFloat(String(it.qty).replace(',', '.')) || 0) > 0)
      .map((it) => {
        const qty = parseFloat(String(it.qty).replace(',', '.')) || 0;
        const unitPrice = parseFloat(String(it.unitPrice).replace(',', '.')) || 0;
        return {
          ref: it.ref || null,
          name: it.name.trim(),
          qty,
          unitPrice,
          total: Math.round(qty * unitPrice * 100) / 100,
        };
      });
    if (cleanItems.length === 0) return setError('Ajoutez au moins un article.');

    setSubmitting(true);
    try {
      await quotesApi.update(id, {
        items: cleanItems,
        client: {
          name: clientName.trim(),
          address: clientAddress.trim(),
          vat: clientVat.trim(),
          email: clientEmail.trim(),
        },
        vatRegime,
        vatRate: parseFloat(vatRate.replace(',', '.')) || 0,
        validDate,
      });
      // Changer le statut si différent
      if (quote && status !== quote.status) {
        await quotesApi.setStatus(id, status);
      }
      router.replace(`/quote/${id}`);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Modifier le devis" showBack />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>
      </SafeAreaView>
    );
  }

  const { subtotal, vatAmount, total } = computeTotals();
  const fmt = (n) => new Intl.NumberFormat('fr-FR', {
    style: 'currency', currency: 'EUR', minimumFractionDigits: 2,
  }).format(n || 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title={`Modifier ${quote?.quoteNumber || ''}`} showBack />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {!!error && (<View style={styles.errorBox}><Text style={styles.errorText}>⚠️ {error}</Text></View>)}

          <Card>
            <Text style={styles.sectionTitle}>Client</Text>
            <Input label="Nom" value={clientName} onChangeText={setClientName} />
            <Input label="Email" value={clientEmail} onChangeText={setClientEmail} keyboardType="email-address" autoCapitalize="none" />
            <Input label="Adresse" value={clientAddress} onChangeText={setClientAddress} />
            <Input label="N° TVA" value={clientVat} onChangeText={setClientVat} />
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Statut</Text>
            <View style={styles.chipsRow}>
              {VALID_STATUSES.map((s) => {
                const active = status === s.value;
                return (
                  <TouchableOpacity
                    key={s.value}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => setStatus(s.value)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{s.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>

          <Card>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Articles ({items.length})</Text>
              <TouchableOpacity style={styles.addBtnSmall} onPress={addItem} activeOpacity={0.7}>
                <Text style={styles.addBtnSmallText}>+ Ajouter</Text>
              </TouchableOpacity>
            </View>

            {items.map((it, i) => (
              <View key={i} style={styles.itemRow}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemIndex}>#{i + 1}</Text>
                  <TouchableOpacity onPress={() => removeItem(i)}>
                    <Text style={styles.removeText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <Input label="Désignation" value={it.name} onChangeText={(v) => updateItem(i, 'name', v)} />
                <View style={styles.itemInputs}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Qté</Text>
                    <Input value={String(it.qty)} onChangeText={(v) => updateItem(i, 'qty', v)} keyboardType="numeric" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>P.U. HT</Text>
                    <Input value={String(it.unitPrice)} onChangeText={(v) => updateItem(i, 'unitPrice', v)} keyboardType="numeric" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Total</Text>
                    <View style={styles.totalBox}>
                      <Text style={styles.totalBoxText}>{fmt(it.total)}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>TVA</Text>
            <View style={styles.chipsRow}>
              <TouchableOpacity
                style={[styles.chip, vatRegime === 'franchise' && styles.chipActive]}
                onPress={() => setVatRegime('franchise')} activeOpacity={0.7}>
                <Text style={[styles.chipText, vatRegime === 'franchise' && styles.chipTextActive]}>Franchise</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chip, vatRegime === 'assujetti' && styles.chipActive]}
                onPress={() => setVatRegime('assujetti')} activeOpacity={0.7}>
                <Text style={[styles.chipText, vatRegime === 'assujetti' && styles.chipTextActive]}>Assujetti</Text>
              </TouchableOpacity>
            </View>
            {vatRegime === 'assujetti' && (
              <Input label="Taux TVA (%)" value={vatRate} onChangeText={setVatRate} keyboardType="numeric" />
            )}
            <Input label="Valable jusqu'au (YYYY-MM-DD)" value={validDate} onChangeText={setValidDate} />
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Totaux</Text>
            <Row label="Sous-total HT" value={fmt(subtotal)} />
            {vatRegime === 'assujetti' && <Row label="TVA" value={fmt(vatAmount)} />}
            <View style={[styles.row, styles.totalRow]}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalValue}>{fmt(total)}</Text>
            </View>
          </Card>

          <Button
            title={submitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
            onPress={submit}
            disabled={submitting}
            loading={submitting}
          />
        </ScrollView>
      </KeyboardAvoidingView>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700' },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: spacing.md,
  },
  addBtnSmall: {
    backgroundColor: colors.accent, paddingHorizontal: spacing.md,
    paddingVertical: 5, borderRadius: radius.full,
  },
  addBtnSmallText: { color: '#0b1120', fontSize: 11, fontWeight: '700' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  chip: {
    paddingHorizontal: spacing.md, paddingVertical: 8,
    borderRadius: radius.full, borderWidth: 1,
    borderColor: colors.borderLight, backgroundColor: colors.bgCard,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600' },
  chipTextActive: { color: '#0b1120' },
  itemRow: { paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  itemHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: spacing.sm,
  },
  itemIndex: { color: colors.accent, fontSize: fontSize.xs, fontWeight: '700' },
  removeText: { color: colors.error, fontSize: 18, fontWeight: '700' },
  itemInputs: { flexDirection: 'row', gap: spacing.sm },
  inputLabel: {
    color: colors.textMuted, fontSize: 10, textTransform: 'uppercase',
    fontWeight: '600', marginBottom: 4,
  },
  totalBox: {
    backgroundColor: colors.bgInput, borderWidth: 1,
    borderColor: colors.borderLight, borderRadius: radius.md,
    paddingVertical: 12, paddingHorizontal: 14, minHeight: 44, justifyContent: 'center',
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