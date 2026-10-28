import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { invoiceAdvancedApi, clientsApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import ArticlePickerModal from '../../components/ArticlePickerModal';

export default function NewInvoiceScreen() {
  const router = useRouter();

  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState(null);
  const [clientPickerOpen, setClientPickerOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientVat, setClientVat] = useState('');
  const [clientEmail, setClientEmail] = useState('');

  const [items, setItems] = useState([]);
  const [articlePickerOpen, setArticlePickerOpen] = useState(false);

  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState('');
  const [vatRegime, setVatRegime] = useState('franchise');
  const [vatRate, setVatRate] = useState('21');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadClients();
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setDueDate(d.toISOString().slice(0, 10));
  }, []);

  const loadClients = async () => {
    try {
      const data = await clientsApi.list();
      setClients(Array.isArray(data) ? data : []);
    } catch (err) { /* silent */ }
  };

  const selectClient = (c) => {
    setClientId(c.id);
    setClientName(c.name || '');
    setClientAddress(c.address || '');
    setClientVat(c.vatNumber || '');
    setClientEmail(c.email || '');
    setClientPickerOpen(false);
  };

  const addArticle = (article) => {
    setItems((prev) => [...prev, {
      ref: article.ref, name: article.name, unit: article.unit,
      unitPrice: article.unitPrice, qty: 1, total: article.unitPrice,
    }]);
  };

  const updateQty = (i, v) => {
    setItems((prev) => {
      const copy = [...prev];
      const qty = parseFloat(String(v).replace(',', '.')) || 0;
      copy[i] = { ...copy[i], qty: v, total: qty * copy[i].unitPrice };
      return copy;
    });
  };

  const updatePrice = (i, v) => {
    setItems((prev) => {
      const copy = [...prev];
      const price = parseFloat(String(v).replace(',', '.')) || 0;
      const qty = parseFloat(String(copy[i].qty).replace(',', '.')) || 0;
      copy[i] = { ...copy[i], unitPrice: price, total: qty * price };
      return copy;
    });
  };

  const removeItem = (i) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  const getTotals = () => {
    let subtotal = 0;
    for (const it of items) subtotal += Number(it.total) || 0;
    const vatAmount = vatRegime === 'assujetti'
      ? subtotal * (parseFloat(vatRate.replace(',', '.')) || 0) / 100
      : 0;
    return { subtotal, vatAmount, total: subtotal + vatAmount };
  };

  const submit = async () => {
    setError('');
    if (items.length === 0) return setError('Ajoutez au moins un article.');

    const cleanItems = items.map((it) => {
      const qty = parseFloat(String(it.qty).replace(',', '.')) || 0;
      const unitPrice = Number(it.unitPrice) || 0;
      return {
        ref: it.ref || null, name: it.name, unit: it.unit || 'u',
        qty, unitPrice, total: Math.round(qty * unitPrice * 100) / 100,
      };
    });

    setSubmitting(true);
    try {
      const res = await invoiceAdvancedApi.createManual({
        items: cleanItems,
        client: {
          id: clientId,
          name: clientName.trim(),
          address: clientAddress.trim(),
          vat: clientVat.trim(),
          email: clientEmail.trim(),
        },
        vatRegime,
        vatRate: parseFloat(vatRate.replace(',', '.')) || 0,
        issueDate,
        dueDate,
        notes: notes.trim() || null,
      });
      router.replace(`/invoice/${res.id || res.invoice?.id}`);
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
  const selectedClient = clients.find((c) => c.id === clientId);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Nouvelle facture" showBack />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {!!error && (<View style={styles.errorBox}><Text style={styles.errorText}>⚠️ {error}</Text></View>)}

          <Card>
            <Text style={styles.sectionTitle}>Client</Text>
            <TouchableOpacity style={styles.selector}
              onPress={() => setClientPickerOpen(!clientPickerOpen)} activeOpacity={0.7}>
              <Text style={[styles.selectorText, !selectedClient && styles.placeholder]} numberOfLines={1}>
                {selectedClient ? selectedClient.name : '— Sélectionner —'}
              </Text>
              <Text style={styles.chevron}>{clientPickerOpen ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {clientPickerOpen && (
              <View style={styles.list}>
                <TouchableOpacity style={styles.listItem}
                  onPress={() => { setClientId(null); setClientName(''); setClientAddress(''); setClientVat(''); setClientEmail(''); setClientPickerOpen(false); }}>
                  <Text style={styles.listItemText}>— Aucun —</Text>
                </TouchableOpacity>
                {clients.map((c) => (
                  <TouchableOpacity key={c.id} style={styles.listItem} onPress={() => selectClient(c)}>
                    <Text style={styles.listItemText} numberOfLines={1}>
                      {c.name}{c.email ? ` (${c.email})` : ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <Input label="Nom" value={clientName} onChangeText={setClientName} />
            <Input label="Adresse" value={clientAddress} onChangeText={setClientAddress} />
            <Input label="N° TVA" value={clientVat} onChangeText={setClientVat} />
            <Input label="Email" value={clientEmail} onChangeText={setClientEmail} keyboardType="email-address" autoCapitalize="none" />
          </Card>

          <Card>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Articles ({items.length})</Text>
              <TouchableOpacity style={styles.addBtn} onPress={() => setArticlePickerOpen(true)} activeOpacity={0.7}>
                <Text style={styles.addBtnText}>+ Ajouter</Text>
              </TouchableOpacity>
            </View>
            {items.length === 0 ? (
              <TouchableOpacity style={styles.emptyDrop} onPress={() => setArticlePickerOpen(true)} activeOpacity={0.7}>
                <Text style={styles.emptyIcon}>📦</Text>
                <Text style={styles.emptyTitle}>Aucun article</Text>
                <Text style={styles.emptySub}>Tapez ici pour ajouter</Text>
              </TouchableOpacity>
            ) : items.map((it, i) => (
              <View key={i} style={styles.itemRow}>
                <View style={styles.itemHeader}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.itemName} numberOfLines={2}>{it.name}</Text>
                    {it.ref ? <Text style={styles.itemRef}>{it.ref}</Text> : null}
                  </View>
                  <TouchableOpacity onPress={() => removeItem(i)}>
                    <Text style={styles.removeText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.itemInputs}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Qté</Text>
                    <Input value={String(it.qty)} onChangeText={(v) => updateQty(i, v)} keyboardType="numeric" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>P.U. HT</Text>
                    <Input value={String(it.unitPrice)} onChangeText={(v) => updatePrice(i, v)} keyboardType="numeric" />
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
            <Text style={styles.sectionTitle}>Dates</Text>
            <Input label="Date d'émission (YYYY-MM-DD)" value={issueDate} onChangeText={setIssueDate} />
            <Input label="Date d'échéance (YYYY-MM-DD)" value={dueDate} onChangeText={setDueDate} />
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>TVA</Text>
            <View style={styles.chipsRow}>
              <TouchableOpacity style={[styles.chip, vatRegime === 'franchise' && styles.chipActive]}
                onPress={() => setVatRegime('franchise')} activeOpacity={0.7}>
                <Text style={[styles.chipText, vatRegime === 'franchise' && styles.chipTextActive]}>Franchise</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.chip, vatRegime === 'assujetti' && styles.chipActive]}
                onPress={() => setVatRegime('assujetti')} activeOpacity={0.7}>
                <Text style={[styles.chipText, vatRegime === 'assujetti' && styles.chipTextActive]}>Assujetti</Text>
              </TouchableOpacity>
            </View>
            {vatRegime === 'assujetti' && (
              <Input label="Taux TVA (%)" value={vatRate} onChangeText={setVatRate} keyboardType="numeric" />
            )}
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Input value={notes} onChangeText={setNotes} multiline />
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
            title={submitting ? 'Création...' : 'Créer la facture'}
            onPress={submit} disabled={submitting} loading={submitting}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <ArticlePickerModal
        visible={articlePickerOpen}
        onClose={() => setArticlePickerOpen(false)}
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
  placeholder: { color: colors.textMuted },
  chevron: { color: colors.textMuted, fontSize: 12 },
  list: { marginBottom: spacing.md, borderWidth: 1, borderColor: colors.borderLight, borderRadius: radius.md, backgroundColor: colors.bg, maxHeight: 240 },
  listItem: { paddingVertical: spacing.md, paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  listItemText: { color: colors.text, fontSize: fontSize.sm },
  addBtn: { backgroundColor: colors.accent, paddingHorizontal: spacing.md, paddingVertical: 5, borderRadius: radius.full },
  addBtnText: { color: '#0b1120', fontSize: fontSize.xs, fontWeight: '700' },
  emptyDrop: { borderWidth: 2, borderStyle: 'dashed', borderColor: colors.borderLight, borderRadius: radius.lg, paddingVertical: spacing.xxl, alignItems: 'center' },
  emptyIcon: { fontSize: 32, marginBottom: spacing.sm },
  emptyTitle: { color: colors.text, fontSize: fontSize.sm, fontWeight: '700', marginBottom: 4 },
  emptySub: { color: colors.textMuted, fontSize: fontSize.xs },
  itemRow: { paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  itemHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.sm },
  itemName: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600' },
  itemRef: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },
  removeText: { color: colors.error, fontSize: 18, fontWeight: '700', paddingHorizontal: spacing.sm },
  itemInputs: { flexDirection: 'row', gap: spacing.sm },
  inputLabel: { color: colors.textMuted, fontSize: 10, textTransform: 'uppercase', fontWeight: '600', marginBottom: 4 },
  totalBox: { backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.borderLight, borderRadius: radius.md, paddingVertical: 12, paddingHorizontal: 14, minHeight: 44, justifyContent: 'center' },
  totalBoxText: { color: colors.accent, fontSize: fontSize.sm, fontWeight: '700' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  chip: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.full, borderWidth: 1, borderColor: colors.borderLight, backgroundColor: colors.bgCard },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600' },
  chipTextActive: { color: '#0b1120' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, gap: spacing.md },
  label: { color: colors.textSecondary, fontSize: fontSize.sm },
  value: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500', textAlign: 'right' },
  totalRow: { borderTopWidth: 2, borderTopColor: colors.accent, marginTop: spacing.md, paddingTop: spacing.md },
  totalLabel: { color: colors.text, fontSize: fontSize.md, fontWeight: '800' },
  totalValue: { color: colors.accent, fontSize: fontSize.xl, fontWeight: '800' },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.35)', borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg },
  errorText: { color: colors.error, fontSize: fontSize.sm },
});