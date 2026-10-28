import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { appointmentsApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function NewAppointmentScreen() {
  const router = useRouter();

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [subject, setSubject] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState('09:00');
  const [duration, setDuration] = useState('60');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/appointments');
  };

  const submit = async () => {
    setError('');
    if (!clientName.trim()) return setError('Nom du client requis.');
    if (!date) return setError('Date requise.');
    if (!startTime) return setError('Heure de début requise.');

    setSubmitting(true);
    try {
      await appointmentsApi.create({
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim() || null,
        clientEmail: clientEmail.trim() || null,
        clientAddress: clientAddress.trim() || null,
        subject: subject.trim() || null,
        notes: notes.trim() || null,
        date,
        startTime,
        durationMinutes: parseInt(duration) || 60,
      });
      router.replace('/(app)/appointments');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Nouveau rendez-vous" showBack />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {!!error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}

          <Card>
            <Text style={styles.sectionTitle}>Client</Text>
            <Input label="Nom *" value={clientName} onChangeText={setClientName} />
            <Input label="Téléphone" value={clientPhone} onChangeText={setClientPhone} keyboardType="phone-pad" />
            <Input label="Email" value={clientEmail} onChangeText={setClientEmail} keyboardType="email-address" autoCapitalize="none" />
            <Input label="Adresse" value={clientAddress} onChangeText={setClientAddress} />
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Rendez-vous</Text>
            <Input label="Sujet" value={subject} onChangeText={setSubject} placeholder="Visite technique..." />
            <Input label="Date (YYYY-MM-DD) *" value={date} onChangeText={setDate} />
            <Input label="Heure début (HH:MM) *" value={startTime} onChangeText={setStartTime} />
            <Input label="Durée (minutes)" value={duration} onChangeText={setDuration} keyboardType="numeric" />
            <Input label="Notes" value={notes} onChangeText={setNotes} multiline />
          </Card>

          <Button
            title={submitting ? 'Création...' : 'Créer le rendez-vous'}
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
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700', marginBottom: spacing.md },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)', borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.lg,
  },
  errorText: { color: colors.error, fontSize: fontSize.sm },
});