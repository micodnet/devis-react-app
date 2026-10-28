import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { recurringApi, clientsApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import ArticlePickerModal from '../../components/ArticlePickerModal';

const FREQUENCIES = [
  { value: 'monthly', label: 'Mensuelle' },
  { value: 'quarterly', label: 'Trimestrielle' },
  { value: 'semiannual', label: 'Semestrielle' },
  { value: 'yearly', label: 'Annuelle' },
];

const CURRENCIES = ['EUR', 'USD', 'CHF', 'GBP'];

export default function NewRecurringScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState(null);
  const [clientPickerOpen, setClientPickerOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientVat, setClientVat] = useState('');
  const [clientEmail, setClientEmail] = useState('');

  const [items, setItems] = useState([]);
  const [articlePickerOpen, setArticlePickerOpen] = useState(false);

  const [frequency, setFrequency] = useState('monthly');
  const [dayOfPeriod, setDayOfPeriod] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState('');
  const [maxOccurrences, setMaxOccurrences] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('30');

  const [vatRegime, setVatRegime] = useState('franchise');
  const [vatRate, setVatRate] = useState('21');
  const [currency, setCurrency] = useState('EUR');

  const [autoSendEmail, setAutoSendEmail] = useState(false);
  const [autoSendPeppol, setAutoSendPeppol] = useState(false);

  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/recurring');
  };

  useEffect(() => { loadClients(); }, []);

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

  const updateQty = (index, value) => {
    setItems((prev) => {
      const copy = [...prev];
      const qty = parseFloat(String(value).replace(',', '.')) || 0;
      copy[index] = { ...copy[index], qty: value, total: qty * copy[index].unitPrice };
      return copy;
    });
  };

  const updateUnitPrice = (index, value) => {
    setItems((prev) => {
      const copy = [...prev];
      const price = parseFloat(String(value).replace(',', '.')) || 0;
      const qty = parseFloat(String(copy[index].qty).replace(',', '.')) || 0;
      copy[index] = { ...copy[index], unitPrice: price, total: qty * price };
      return copy;
    });
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

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
    if (!name.trim()) return setError('Nom de la règle requis.');
    if (items.length === 0) return setError('Ajoutez au moins un article.');
    if (!startDate) return setError('Date de début requise.');

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
      const res = await recurringApi.create({
        name: name.trim(),
        clientId,
        clientName: clientName.trim() || null,
        clientAddress: clientAddress.trim() || null,
        clientVat: clientVat.trim() || null,
        clientEmail: clientEmail.trim() || null,
        items: cleanItems,
        frequency,
        dayOfPeriod: dayOfPeriod ? parseInt(dayOfPeriod) : null,
        startDate,
        endDate: endDate || null,
        maxOccurrences: maxOccurrences ? parseInt(maxOccurrences) : null,
        paymentTerms: parseInt(paymentTerms) || 30,
        vatRegime,
        vatRate: parseFloat(vatRate.replace(',', '.')) || 0,
        currency,
        autoSendEmail,
        autoSendPeppol,
        notes: notes.trim() || null,
      });
      router.replace(`/recurring/${res.id}`);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  const fmt = (n) => new Intl.NumberFormat('fr-FR', {
    style: 'currency', currency, minimumFractionDigits: 2,
  }).format(n || 0);

  const { total } = getTotals();
  const selectedClient = clients.find((c) => c.id === clientId);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Nouvelle règle récurrente" showBack />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {!!error && (
            <View style={styles.errorBox}><Text style={styles.errorText}>⚠️ {error}</Text></View>
          )}

          <Card>
            <Text style={styles.sectionTitle}>Nom *</Text>
            <Input value={name} onChangeText={setName} placeholder="Contrat entretien mensuel Dupont" />
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Client</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setClientPickerOpen(!clientPickerOpen)}
              activeOpacity={0.7}
            >
              <Text style={[styles.selectorText, !selectedClient && styles.selectorPlaceholder]} numberOfLines={1}>
                {selectedClient ? selectedClient.name : '— Aucun client —'}
              </Text>
              <Text style={styles.chevron}>{clientPickerOpen ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {clientPickerOpen && (
              <View style={styles.list}>
                <TouchableOpacity
                  style={styles.listItem}
                  onPress={() => { setClientId(null); setClientName(''); setClientAddress(''); setClientVat(''); setClientEmail(''); setClientPickerOpen(false); }}
                >
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

            <Input label="Nom client (si non sélectionné)" value={clientName} onChangeText={setClientName} />
            <Input label="Adresse client" value={clientAddress} onChangeText={setClientAddress} />
            <Input label="N° TVA client" value={clientVat} onChangeText={setClientVat} />
            <Input label="Email client (envoi auto)" value={clientEmail} onChangeText={setClientEmail} keyboardType="email-address" autoCapitalize="none" />
          </Card>

          <Card>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Articles ({items.length})</Text>
              <TouchableOpacity
                style={styles.addBtnSmall}
                onPress={() => setArticlePickerOpen(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.addBtnSmallText}>+ Ajouter</Text>
              </TouchableOpacity>
            </View>

            {items.length === 0 ? (
              <TouchableOpacity
                style={styles.emptyDrop}
                onPress={() => setArticlePickerOpen(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.emptyDropIcon}>📦</Text>
                <Text style={styles.emptyDropTitle}>Aucun article</Text>
                <Text style={styles.emptyDropSub}>Tapez ici pour ajouter</Text>
              </TouchableOpacity>
            ) : (
              items.map((it, i) => (
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
                      <Input value={String(it.unitPrice)} onChangeText={(v) => updateUnitPrice(i, v)} keyboardType="numeric" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Total</Text>
                      <View style={styles.totalBox}>
                        <Text style={styles.totalBoxText}>{fmt(it.total)}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            )}
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Récurrence</Text>
            <Text style={styles.fieldLabel}>Fréquence</Text>
            <View style={styles.optionsRow}>
              {FREQUENCIES.map((f) => (
                <TouchableOpacity
                  key={f.value}
                  style={[styles.optionBtn, frequency === f.value && styles.optionBtnActive]}
                  onPress={() => setFrequency(f.value)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.optionText, frequency === f.value && styles.optionTextActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Input label="Jour du mois (1-31, optionnel)" value={dayOfPeriod} onChangeText={setDayOfPeriod} keyboardType="numeric" />
            <Input label="Date de début *" value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" />
            <Input label="Date de fin (optionnel)" value={endDate} onChangeText={setEndDate} placeholder="YYYY-MM-DD" />
            <Input label="Max occurrences (optionnel)" value={maxOccurrences} onChangeText={setMaxOccurrences} keyboardType="numeric" />
            <Input label="Délai paiement (jours)" value={paymentTerms} onChangeText={setPaymentTerms} keyboardType="numeric" />
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>TVA & devise</Text>
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={[styles.optionBtn, vatRegime === 'franchise' && styles.optionBtnActive]}
                onPress={() => setVatRegime('franchise')}
                activeOpacity={0.7}
              >
                <Text style={[styles.optionText, vatRegime === 'franchise' && styles.optionTextActive]}>Franchise</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.optionBtn, vatRegime === 'assujetti' && styles.optionBtnActive]}
                onPress={() => setVatRegime('assujetti')}
                activeOpacity={0.7}
              >
                <Text style={[styles.optionText, vatRegime === 'assujetti' && styles.optionTextActive]}>Assujetti</Text>
              </TouchableOpacity>
            </View>
            {vatRegime === 'assujetti' && (
              <Input label="Taux TVA (%)" value={vatRate} onChangeText={setVatRate} keyboardType="numeric" />
            )}
            <Text style={styles.fieldLabel}>Devise</Text>
            <View style={styles.optionsRow}>
              {CURRENCIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.optionBtn, currency === c && styles.optionBtnActive]}
                  onPress={() => setCurrency(c)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.optionText, currency === c && styles.optionTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Automatisation</Text>
            <TouchableOpacity style={styles.checkboxRow} onPress={() => setAutoSendEmail(!autoSendEmail)} activeOpacity={0.7}>
              <View style={[styles.checkbox, autoSendEmail && styles.checkboxOn]}>
                {autoSendEmail && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Envoyer la facture par email au client</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.checkboxRow} onPress={() => setAutoSendPeppol(!autoSendPeppol)} activeOpacity={0.7}>
              <View style={[styles.checkbox, autoSendPeppol && styles.checkboxOn]}>
                {autoSendPeppol && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Envoyer via Peppol</Text>
            </TouchableOpacity>
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Notes internes</Text>
            <Input value={notes} onChangeText={setNotes} multiline />
          </Card>

          <Card>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalValue}>{fmt(total)}</Text>
            </View>
          </Card>

          <Button
            title={submitting ? 'Création...' : 'Créer la règle'}
            onPress={submit}
            disabled={submitting}
            loading={submitting}
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700' },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: spacing.md,
  },
  fieldLabel: {
    color: colors.textSecondary, fontSize: fontSize.sm,
    fontWeight: '600', marginTop: spacing.md, marginBottom: spacing.sm,
  },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  optionBtn: {
    paddingHorizontal: spacing.md, paddingVertical: 8,
    borderRadius: radius.full, borderWidth: 1,
    borderColor: colors.borderLight, backgroundColor: colors.bgCard,
  },
  optionBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  optionText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600' },
  optionTextActive: { color: '#0b1120' },
  selector: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.bgInput, borderWidth: 1,
    borderColor: colors.borderLight, borderRadius: radius.md,
    paddingVertical: 12, paddingHorizontal: spacing.md, gap: spacing.md,
    marginBottom: spacing.md,
  },
  selectorText: { color: colors.text, fontSize: fontSize.sm, flex: 1 },
  selectorPlaceholder: { color: colors.textMuted },
  chevron: { color: colors.textMuted, fontSize: 12 },
  list: {
    marginBottom: spacing.md, borderWidth: 1,
    borderColor: colors.borderLight, borderRadius: radius.md,
    backgroundColor: colors.bg, maxHeight: 240,
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
    backgroundColor: colors.bgInput, borderWidth: 1,
    borderColor: colors.borderLight, borderRadius: radius.md,
    paddingVertical: 12, paddingHorizontal: 14, minHeight: 44, justifyContent: 'center',
  },
  totalBoxText: { color: colors.accent, fontSize: fontSize.sm, fontWeight: '700' },
  checkboxRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: spacing.md, paddingVertical: spacing.sm,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2,
    borderColor: colors.borderLight, alignItems: 'center', justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '800' },
  checkboxLabel: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500', flex: 1 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: colors.text, fontSize: fontSize.md, fontWeight: '800' },
  totalValue: { color: colors.accent, fontSize: fontSize.xl, fontWeight: '800' },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)', borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.lg,
  },
  errorText: { color: colors.error, fontSize: fontSize.sm },
});