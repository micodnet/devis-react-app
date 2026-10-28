import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { invoiceAdvancedApi, invoicesApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';

const STATUS_LABELS = { pending: 'En attente', partial: 'Partiel', paid: 'Payé' };
const STATUS_COLORS = { pending: '#94a3b8', partial: '#eab308', paid: '#22c55e' };

export default function ScheduleScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [invoice, setInvoice] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [hasSchedule, setHasSchedule] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('auto'); // 'auto' | 'manual'
  const [generating, setGenerating] = useState(false);

  // Paramètres auto
  const [installments, setInstallments] = useState('3');
  const [firstDays, setFirstDays] = useState('0');
  const [intervalDays, setIntervalDays] = useState('30');
  const [firstAmount, setFirstAmount] = useState('');

  // Entrées manuelles
  const [manualEntries, setManualEntries] = useState([]);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace(`/invoice/${id}`);
  };

  const loadAll = async () => {
    try {
      setError('');
      const [inv, sched] = await Promise.all([
        invoicesApi.get(id),
        invoiceAdvancedApi.scheduleList(id).catch(() => ({ schedule: [], hasSchedule: false })),
      ]);
      setInvoice(inv);
      setSchedule(sched.schedule || []);
      setHasSchedule(sched.hasSchedule === true);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, [id]);

  const fmt = (n) => new Intl.NumberFormat('fr-FR', {
    style: 'currency', currency: invoice?.currency || 'EUR', minimumFractionDigits: 2,
  }).format(n || 0);

  const generateAuto = async () => {
    setGenerating(true);
    try {
      await invoiceAdvancedApi.scheduleGenerate(id, {
        installments: parseInt(installments) || 3,
        firstDueDays: parseInt(firstDays) || 0,
        intervalDays: parseInt(intervalDays) || 30,
        firstAmount: parseFloat(firstAmount.replace(',', '.')) || 0,
      });
      Alert.alert('Succès', 'Plan de paiement créé');
      await loadAll();
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || err.message);
    } finally {
      setGenerating(false);
    }
  };

  const addManualEntry = () => {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);
    setManualEntries((prev) => [
      ...prev,
      { label: '', amount: '', dueDate: defaultDate.toISOString().slice(0, 10) },
    ]);
  };

  const updateManual = (i, key, value) => {
    setManualEntries((prev) => {
      const copy = [...prev];
      copy[i] = { ...copy[i], [key]: value };
      return copy;
    });
  };

  const removeManual = (i) => {
    setManualEntries((prev) => prev.filter((_, idx) => idx !== i));
  };

  const saveManual = async () => {
    const entries = manualEntries
      .map((e) => ({
        label: e.label.trim() || 'Échéance',
        amount: parseFloat(String(e.amount).replace(',', '.')) || 0,
        dueDate: e.dueDate,
      }))
      .filter((e) => e.amount > 0 && e.dueDate);

    if (entries.length === 0) {
      Alert.alert('Erreur', 'Ajoutez au moins une échéance valide.');
      return;
    }
    const sum = entries.reduce((s, e) => s + e.amount, 0);
    if (Math.abs(sum - invoice.total) > 0.01) {
      Alert.alert('Erreur', `La somme (${fmt(sum)}) doit égaler le total (${fmt(invoice.total)})`);
      return;
    }
    setGenerating(true);
    try {
      await invoiceAdvancedApi.scheduleCreateManual(id, entries);
      Alert.alert('Succès', 'Plan créé');
      await loadAll();
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || err.message);
    } finally {
      setGenerating(false);
    }
  };

  const removeSchedule = () => {
    Alert.alert('Supprimer', 'Supprimer le plan de paiement ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          try {
            await invoiceAdvancedApi.scheduleRemove(id);
            await loadAll();
          } catch (err) {
            Alert.alert('Erreur', err.response?.data?.error || err.message);
          }
        },
      },
    ]);
  };

  const payEntry = (entry) => {
    const amountDue = (entry.amount || 0) - (entry.amountPaid || 0);
    Alert.prompt
      ? Alert.prompt('Paiement', `Montant (reste ${fmt(amountDue)}) :`, async (val) => {
          const amt = parseFloat(String(val).replace(',', '.')) || 0;
          if (amt <= 0) return;
          try {
            await invoiceAdvancedApi.scheduleEntryPay(entry.id, {
              amount: amt, method: 'virement',
            });
            await loadAll();
          } catch (err) {
            Alert.alert('Erreur', err.response?.data?.error || err.message);
          }
        }, 'plain-text', String(amountDue.toFixed(2)))
      : null;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Plan de paiement" showBack />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Plan de paiement" showBack />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {!!error && (<View style={styles.errorBox}><Text style={styles.errorText}>⚠️ {error}</Text></View>)}

          {invoice && (
            <Card>
              <Row label="Facture" value={invoice.invoiceNumber} />
              <Row label="Total" value={fmt(invoice.total)} />
              <Row label="Payé" value={fmt(invoice.amountPaid)} />
              <Row label="Reste dû" value={fmt(invoice.amountDue)} />
            </Card>
          )}

          {hasSchedule ? (
            <>
              <Text style={styles.sectionTitleOutside}>
                Échéances ({schedule.length})
              </Text>
              {schedule.map((e) => {
                const status = STATUS_LABELS[e.status] || e.status;
                const color = STATUS_COLORS[e.status] || '#94a3b8';
                const amountDue = (e.amount || 0) - (e.amountPaid || 0);
                return (
                  <Card key={e.id} style={{ borderLeftWidth: 4, borderLeftColor: color }}>
                    <View style={styles.schHeader}>
                      <Text style={styles.schLabel} numberOfLines={2}>
                        {e.label || `Échéance ${e.position}`}
                      </Text>
                      <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color + '66' }]}>
                        <Text style={[styles.badgeText, { color }]}>{status}</Text>
                      </View>
                    </View>
                    <Text style={styles.schDate}>
                      Échéance : {new Date(e.dueDate).toLocaleDateString('fr-FR')}
                    </Text>
                    <View style={styles.schFooter}>
                      <Text style={styles.schAmount}>{fmt(e.amount)}</Text>
                      {e.amountPaid > 0 && (
                        <Text style={styles.schPaid}>Payé : {fmt(e.amountPaid)} · Reste : {fmt(amountDue)}</Text>
                      )}
                    </View>
                    {e.status !== 'paid' && (
                      <TouchableOpacity style={styles.schBtn}
                        onPress={() => payEntry(e)} activeOpacity={0.7}>
                        <Text style={styles.schBtnText}>💰 Enregistrer un paiement</Text>
                      </TouchableOpacity>
                    )}
                  </Card>
                );
              })}

              <Button
                title="🗑 Supprimer le plan"
                onPress={removeSchedule}
                variant="danger"
              />
            </>
          ) : (
            <>
              <Card>
                <Text style={styles.sectionTitle}>Type de création</Text>
                <View style={styles.chipsRow}>
                  <TouchableOpacity style={[styles.chip, mode === 'auto' && styles.chipActive]}
                    onPress={() => setMode('auto')} activeOpacity={0.7}>
                    <Text style={[styles.chipText, mode === 'auto' && styles.chipTextActive]}>
                      Automatique
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.chip, mode === 'manual' && styles.chipActive]}
                    onPress={() => { setMode('manual'); if (manualEntries.length === 0) addManualEntry(); }}
                    activeOpacity={0.7}>
                    <Text style={[styles.chipText, mode === 'manual' && styles.chipTextActive]}>
                      Manuel
                    </Text>
                  </TouchableOpacity>
                </View>
              </Card>

              {mode === 'auto' && (
                <Card>
                  <Text style={styles.sectionTitle}>Plan automatique</Text>
                  <Input label="Nombre d'échéances" value={installments} onChangeText={setInstallments} keyboardType="numeric" />
                  <Input label="Premier paiement dans (jours)" value={firstDays} onChangeText={setFirstDays} keyboardType="numeric" />
                  <Input label="Écart entre échéances (jours)" value={intervalDays} onChangeText={setIntervalDays} keyboardType="numeric" />
                  <Input label="Acompte initial (optionnel, €)" value={firstAmount} onChangeText={setFirstAmount} keyboardType="numeric" />
                  <Button
                    title={generating ? 'Génération...' : 'Générer le plan'}
                    onPress={generateAuto} disabled={generating} loading={generating}
                  />
                </Card>
              )}

              {mode === 'manual' && (
                <Card>
                  <Text style={styles.sectionTitle}>Plan manuel</Text>
                  {manualEntries.map((e, i) => (
                    <View key={i} style={styles.manualBlock}>
                      <View style={styles.manualHeader}>
                        <Text style={styles.manualIndex}>#{i + 1}</Text>
                        <TouchableOpacity onPress={() => removeManual(i)}>
                          <Text style={styles.removeText}>✕</Text>
                        </TouchableOpacity>
                      </View>
                      <Input label="Libellé" value={e.label} onChangeText={(v) => updateManual(i, 'label', v)} placeholder="Acompte, Solde..." />
                      <Input label="Montant (€)" value={e.amount} onChangeText={(v) => updateManual(i, 'amount', v)} keyboardType="numeric" />
                      <Input label="Date d'échéance (YYYY-MM-DD)" value={e.dueDate} onChangeText={(v) => updateManual(i, 'dueDate', v)} />
                    </View>
                  ))}
                  <TouchableOpacity style={styles.addBtn} onPress={addManualEntry} activeOpacity={0.7}>
                    <Text style={styles.addBtnText}>+ Ajouter une échéance</Text>
                  </TouchableOpacity>
                  <View style={{ height: spacing.md }} />
                  <Button
                    title={generating ? 'Enregistrement...' : 'Enregistrer le plan'}
                    onPress={saveManual} disabled={generating} loading={generating}
                  />
                </Card>
              )}
            </>
          )}
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
  sectionTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700', marginBottom: spacing.md },
  sectionTitleOutside: { color: colors.text, fontSize: fontSize.md, fontWeight: '700', marginTop: spacing.lg, marginBottom: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, gap: spacing.md },
  label: { color: colors.textSecondary, fontSize: fontSize.sm },
  value: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500', textAlign: 'right' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { flex: 1, paddingHorizontal: spacing.md, paddingVertical: 10, borderRadius: radius.full, borderWidth: 1, borderColor: colors.borderLight, backgroundColor: colors.bgCard, alignItems: 'center' },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600' },
  chipTextActive: { color: '#0b1120' },
  schHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.sm },
  schLabel: { color: colors.text, fontSize: fontSize.sm, fontWeight: '700', flex: 1 },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full, borderWidth: 1 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  schDate: { color: colors.textMuted, fontSize: fontSize.xs, marginBottom: spacing.md },
  schFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: spacing.md },
  schAmount: { color: colors.accent, fontSize: fontSize.md, fontWeight: '800' },
  schPaid: { color: colors.textSecondary, fontSize: fontSize.xs },
  schBtn: {
    marginTop: spacing.md, paddingVertical: 10, borderRadius: radius.full,
    backgroundColor: 'rgba(34,197,94,0.15)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.4)',
    alignItems: 'center',
  },
  schBtnText: { color: colors.success, fontSize: fontSize.xs, fontWeight: '700' },
  manualBlock: { paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  manualHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  manualIndex: { color: colors.accent, fontSize: fontSize.xs, fontWeight: '700' },
  removeText: { color: colors.error, fontSize: 18, fontWeight: '700' },
  addBtn: {
    paddingVertical: spacing.md, borderRadius: radius.md, borderWidth: 1,
    borderStyle: 'dashed', borderColor: colors.borderLight, alignItems: 'center', marginTop: spacing.sm,
  },
  addBtnText: { color: colors.accent, fontSize: fontSize.sm, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.35)', borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg },
  errorText: { color: colors.error, fontSize: fontSize.sm },
});