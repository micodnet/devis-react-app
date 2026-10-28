import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { invoicesApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';

const METHODS = [
  { value: 'virement', label: 'Virement' },
  { value: 'carte', label: 'Carte' },
  { value: 'especes', label: 'Espèces' },
  { value: 'cheque', label: 'Chèque' },
  { value: 'autre', label: 'Autre' },
];

export default function PaymentScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('virement');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/factures');
  };

  const submit = async () => {
    setError('');
    const amt = parseFloat(amount.replace(',', '.'));
    if (!amt || amt <= 0) {
      setError('Montant invalide.');
      return;
    }
    setSubmitting(true);
    try {
      await invoicesApi.recordPayment(id, {
        amount: amt,
        paymentMethod: method,
        paymentDate: new Date().toISOString().slice(0, 10),
        reference: reference.trim() || null,
        notes: notes.trim() || null,
      });
      router.replace(`/invoice/${id}`);
    } catch (err) {
      setError(
        err.response?.data?.error || err.message || 'Erreur lors de l\'enregistrement.'
      );
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
        <Text style={styles.title}>Enregistrer un paiement</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {!!error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}

          <Card>
            <Text style={styles.sectionTitle}>Montant</Text>
            <Input
              label="Montant reçu *"
              value={amount}
              onChangeText={setAmount}
              placeholder="Ex: 150.00"
              keyboardType="numeric"
            />
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Mode de paiement</Text>
            <View style={styles.methodsRow}>
              {METHODS.map((m) => {
                const isActive = method === m.value;
                return (
                  <TouchableOpacity
                    key={m.value}
                    style={[styles.methodBtn, isActive && styles.methodBtnActive]}
                    onPress={() => setMethod(m.value)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[styles.methodText, isActive && styles.methodTextActive]}
                    >
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Détails (optionnel)</Text>
            <Input
              label="Référence"
              value={reference}
              onChangeText={setReference}
              placeholder="N° transaction, chèque..."
            />
            <Input
              label="Notes internes"
              value={notes}
              onChangeText={setNotes}
              placeholder="Remarques..."
              multiline
            />
          </Card>

          <Button
            title={submitting ? 'Enregistrement...' : '💰 Enregistrer le paiement'}
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
  methodsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  methodBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.bgCard,
  },
  methodBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  methodText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  methodTextActive: { color: '#0b1120' },
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