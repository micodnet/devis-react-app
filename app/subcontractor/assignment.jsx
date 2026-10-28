import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { subcontractorsApi, chantiersApi, quotesApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';

const STATUSES = [
  { value: 'pending', label: 'En attente' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'completed', label: 'Terminé' },
  { value: 'invoiced', label: 'Facturé' },
  { value: 'paid', label: 'Payé' },
  { value: 'cancelled', label: 'Annulé' },
];

export default function AssignmentFormScreen() {
  const { id, subId } = useLocalSearchParams();
  const router = useRouter();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [chantiers, setChantiers] = useState([]);
  const [quotes, setQuotes] = useState([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [chantierId, setChantierId] = useState(null);
  const [quoteId, setQuoteId] = useState(null);
  const [amount, setAmount] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [actualHours, setActualHours] = useState('');
  const [status, setStatus] = useState('pending');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      await Promise.all([loadChantiers(), loadQuotes()]);
      if (isEdit) await loadAssignment();
    })();
  }, [id]);

  const loadChantiers = async () => {
    try {
      const data = await chantiersApi.list();
      setChantiers(Array.isArray(data) ? data : []);
    } catch (err) { /* silent */ }
  };

  const loadQuotes = async () => {
    try {
      const data = await quotesApi.list();
      setQuotes(Array.isArray(data) ? data : []);
    } catch (err) { /* silent */ }
  };

  const loadAssignment = async () => {
    try {
      const a = await subcontractorsApi.getAssignment(id);
      setTitle(a.title || '');
      setDescription(a.description || '');
      setChantierId(a.chantierId || null);
      setQuoteId(a.quoteId || null);
      setAmount(a.amount ? String(a.amount) : '');
      setHourlyRate(a.hourlyRate ? String(a.hourlyRate) : '');
      setEstimatedHours(a.estimatedHours ? String(a.estimatedHours) : '');
      setActualHours(a.actualHours ? String(a.actualHours) : '');
      setStatus(a.status || 'pending');
      setStartDate(a.startDate ? a.startDate.slice(0, 10) : '');
      setEndDate(a.endDate ? a.endDate.slice(0, 10) : '');
      setNotes(a.notes || '');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    setError('');
    if (!title.trim()) return setError('Titre requis.');

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      chantierId: chantierId ? parseInt(chantierId) : null,
      quoteId: quoteId ? parseInt(quoteId) : null,
      amount: parseFloat(amount.replace(',', '.')) || null,
      hourlyRate: parseFloat(hourlyRate.replace(',', '.')) || null,
      estimatedHours: parseFloat(estimatedHours.replace(',', '.')) || null,
      actualHours: parseFloat(actualHours.replace(',', '.')) || null,
      status,
      startDate: startDate || null,
      endDate: endDate || null,
      notes: notes.trim() || null,
    };

    setSubmitting(true);
    try {
      if (isEdit) {
        await subcontractorsApi.updateAssignment(id, payload);
        router.replace(`/subcontractor/${subId}`);
      } else {
        await subcontractorsApi.createAssignment(subId, payload);
        router.replace(`/subcontractor/${subId}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title={isEdit ? 'Modifier' : 'Nouvelle mission'} showBack />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title={isEdit ? 'Modifier la mission' : 'Nouvelle mission'} showBack />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {!!error && (<View style={styles.errorBox}><Text style={styles.errorText}>⚠️ {error}</Text></View>)}

          <Card>
            <Text style={styles.sectionTitle}>Informations</Text>
            <Input label="Titre *" value={title} onChangeText={setTitle} placeholder="Pose carrelage salle de bain" />
            <Input label="Description" value={description} onChangeText={setDescription} multiline />
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Liaisons</Text>
            <Text style={styles.fieldLabel}>Chantier (optionnel)</Text>
            <View style={styles.optionList}>
              <TouchableOpacity
                style={[styles.optionRow, !chantierId && styles.optionRowActive]}
                onPress={() => setChantierId(null)}
                activeOpacity={0.7}
              >
                <View style={[styles.radio, !chantierId && styles.radioActive]}>
                  {!chantierId && <View style={styles.radioDot} />}
                </View>
                <Text style={styles.optionLabel}>Aucun</Text>
              </TouchableOpacity>
              {chantiers.map((c) => {
                const active = chantierId === c.id;
                return (
                  <TouchableOpacity key={c.id}
                    style={[styles.optionRow, active && styles.optionRowActive]}
                    onPress={() => setChantierId(c.id)} activeOpacity={0.7}>
                    <View style={[styles.radio, active && styles.radioActive]}>
                      {active && <View style={styles.radioDot} />}
                    </View>
                    <Text style={styles.optionLabel} numberOfLines={1}>{c.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.fieldLabel}>Devis lié (optionnel)</Text>
            <View style={styles.optionList}>
              <TouchableOpacity
                style={[styles.optionRow, !quoteId && styles.optionRowActive]}
                onPress={() => setQuoteId(null)}
                activeOpacity={0.7}
              >
                <View style={[styles.radio, !quoteId && styles.radioActive]}>
                  {!quoteId && <View style={styles.radioDot} />}
                </View>
                <Text style={styles.optionLabel}>Aucun</Text>
              </TouchableOpacity>
              {quotes.slice(0, 20).map((q) => {
                const active = quoteId === q.id;
                return (
                  <TouchableOpacity key={q.id}
                    style={[styles.optionRow, active && styles.optionRowActive]}
                    onPress={() => setQuoteId(q.id)} activeOpacity={0.7}>
                    <View style={[styles.radio, active && styles.radioActive]}>
                      {active && <View style={styles.radioDot} />}
                    </View>
                    <Text style={styles.optionLabel} numberOfLines={1}>
                      {q.quoteNumber} — {q.clientName || '—'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Montants</Text>
            <Input label="Montant forfaitaire (€)" value={amount} onChangeText={setAmount} keyboardType="numeric" />
            <Input label="Taux horaire (€/h)" value={hourlyRate} onChangeText={setHourlyRate} keyboardType="numeric" />
            <Input label="Heures estimées" value={estimatedHours} onChangeText={setEstimatedHours} keyboardType="numeric" />
            <Input label="Heures réelles" value={actualHours} onChangeText={setActualHours} keyboardType="numeric" />
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Statut</Text>
            <View style={styles.chipsRow}>
              {STATUSES.map((s) => {
                const active = status === s.value;
                return (
                  <TouchableOpacity key={s.value}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => setStatus(s.value)} activeOpacity={0.7}>
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Dates</Text>
            <Input label="Date de début (YYYY-MM-DD)" value={startDate} onChangeText={setStartDate} />
            <Input label="Date de fin (YYYY-MM-DD)" value={endDate} onChangeText={setEndDate} />
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Input value={notes} onChangeText={setNotes} multiline />
          </Card>

          <Button
            title={submitting ? 'Enregistrement...' : (isEdit ? 'Enregistrer' : 'Créer la mission')}
            onPress={submit} disabled={submitting} loading={submitting}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700', marginBottom: spacing.md },
  fieldLabel: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600', marginTop: spacing.md, marginBottom: spacing.sm },
  optionList: { gap: spacing.sm },
  optionRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingVertical: spacing.md, paddingHorizontal: spacing.md,
    borderRadius: radius.md, borderWidth: 1,
    borderColor: colors.borderLight, backgroundColor: colors.bgInput,
  },
  optionRowActive: { borderColor: colors.accent, backgroundColor: 'rgba(249,115,22,0.1)' },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.borderLight, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: colors.accent },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
  optionLabel: { color: colors.text, fontSize: fontSize.sm, flex: 1 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.full, borderWidth: 1, borderColor: colors.borderLight, backgroundColor: colors.bgCard },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600' },
  chipTextActive: { color: '#0b1120' },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.35)', borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg },
  errorText: { color: colors.error, fontSize: fontSize.sm },
});