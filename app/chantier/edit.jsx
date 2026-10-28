import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { chantiersApi, clientsApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';

const STATUSES = [
  { value: 'planned', label: '📋 Planifié' },
  { value: 'in_progress', label: '🔨 En cours' },
  { value: 'paused', label: '⏸ En pause' },
  { value: 'completed', label: '✅ Terminé' },
  { value: 'cancelled', label: '❌ Annulé' },
];

const COLORS = ['#f97316', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ef4444'];

export default function EditChantierScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);

  const [name, setName] = useState('');
  const [reference, setReference] = useState('');
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState(null);
  const [clientPickerOpen, setClientPickerOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [status, setStatus] = useState('planned');
  const [budgetEstimate, setBudgetEstimate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [color, setColor] = useState('#f97316');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      await loadClients();
      await loadChantier();
    })();
  }, [id]);

  const loadClients = async () => {
    try {
      const data = await clientsApi.list();
      setClients(Array.isArray(data) ? data : []);
    } catch (err) { /* silent */ }
  };

  const loadChantier = async () => {
    try {
      const c = await chantiersApi.get(id);
      setName(c.name || '');
      setReference(c.reference || '');
      setDescription(c.description || '');
      setClientId(c.clientId || null);
      setClientName(c.clientName || '');
      setClientAddress(c.clientAddress || '');
      setStatus(c.status || 'planned');
      setBudgetEstimate(c.budgetEstimate ? String(c.budgetEstimate) : '');
      setStartDate(c.startDate ? c.startDate.slice(0, 10) : '');
      setEndDate(c.endDate ? c.endDate.slice(0, 10) : '');
      setColor(c.color || '#f97316');
      setNotes(c.notes || '');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const selectClient = (c) => {
    setClientId(c.id);
    setClientName(c.name || '');
    setClientAddress(c.address || '');
    setClientPickerOpen(false);
  };

  const submit = async () => {
    if (!name.trim()) return setError('Nom requis.');
    setSubmitting(true);
    setError('');
    try {
      await chantiersApi.update(id, {
        name: name.trim(),
        reference: reference.trim() || null,
        description: description.trim() || null,
        clientId,
        clientName: clientName.trim() || null,
        clientAddress: clientAddress.trim() || null,
        status,
        budgetEstimate: parseFloat(budgetEstimate.replace(',', '.')) || null,
        startDate: startDate || null,
        endDate: endDate || null,
        color,
        notes: notes.trim() || null,
      });
      router.replace(`/chantier/${id}`);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Modifier" showBack />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>
      </SafeAreaView>
    );
  }

  const selectedClient = clients.find((c) => c.id === clientId);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Modifier le chantier" showBack />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {!!error && (<View style={styles.errorBox}><Text style={styles.errorText}>⚠️ {error}</Text></View>)}

          <Card>
            <Text style={styles.sectionTitle}>Général</Text>
            <Input label="Nom *" value={name} onChangeText={setName} />
            <Input label="Référence" value={reference} onChangeText={setReference} />
            <Input label="Description" value={description} onChangeText={setDescription} multiline />
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Client</Text>
            <TouchableOpacity style={styles.selector}
              onPress={() => setClientPickerOpen(!clientPickerOpen)} activeOpacity={0.7}>
              <Text style={[styles.selectorText, !selectedClient && styles.placeholder]} numberOfLines={1}>
                {selectedClient ? selectedClient.name : '— Aucun client —'}
              </Text>
              <Text style={styles.chevron}>{clientPickerOpen ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {clientPickerOpen && (
              <View style={styles.list}>
                <TouchableOpacity style={styles.listItem}
                  onPress={() => { setClientId(null); setClientPickerOpen(false); }}>
                  <Text style={styles.listItemText}>— Aucun —</Text>
                </TouchableOpacity>
                {clients.map((c) => (
                  <TouchableOpacity key={c.id} style={styles.listItem} onPress={() => selectClient(c)}>
                    <Text style={styles.listItemText} numberOfLines={1}>{c.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <Input label="Nom client" value={clientName} onChangeText={setClientName} />
            <Input label="Adresse" value={clientAddress} onChangeText={setClientAddress} />
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Planification</Text>
            <Text style={styles.fieldLabel}>Statut</Text>
            <View style={styles.chipsRow}>
              {STATUSES.map((s) => {
                const active = status === s.value;
                return (
                  <TouchableOpacity key={s.value}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => setStatus(s.value)} activeOpacity={0.7}>
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{s.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Input label="Budget estimé (€)" value={budgetEstimate} onChangeText={setBudgetEstimate} keyboardType="numeric" />
            <Input label="Date début" value={startDate} onChangeText={setStartDate} />
            <Input label="Date fin" value={endDate} onChangeText={setEndDate} />
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Couleur</Text>
            <View style={styles.chipsRow}>
              {COLORS.map((c) => (
                <TouchableOpacity key={c}
                  style={[styles.colorChip, { borderColor: c }, color === c && { backgroundColor: c + '33', borderWidth: 2 }]}
                  onPress={() => setColor(c)} activeOpacity={0.7}>
                  <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: c }} />
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Input value={notes} onChangeText={setNotes} multiline />
          </Card>

          <Button
            title={submitting ? 'Enregistrement...' : 'Enregistrer'}
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
  fieldLabel: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600', marginBottom: spacing.sm },
  selector: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.borderLight,
    borderRadius: radius.md, paddingVertical: 12, paddingHorizontal: spacing.md,
    gap: spacing.md, marginBottom: spacing.md,
  },
  selectorText: { color: colors.text, fontSize: fontSize.sm, flex: 1 },
  placeholder: { color: colors.textMuted },
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
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  chip: {
    paddingHorizontal: spacing.md, paddingVertical: 8,
    borderRadius: radius.full, borderWidth: 1,
    borderColor: colors.borderLight, backgroundColor: colors.bgCard,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600' },
  chipTextActive: { color: '#0b1120' },
  colorChip: {
    padding: 6, borderRadius: radius.full, borderWidth: 1,
    backgroundColor: colors.bgCard,
  },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)', borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.lg,
  },
  errorText: { color: colors.error, fontSize: fontSize.sm },
});