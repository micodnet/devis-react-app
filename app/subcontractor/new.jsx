import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { subcontractorsApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function NewSubcontractorScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [iban, setIban] = useState('');
  const [bic, setBic] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('30');
  const [active, setActive] = useState(true);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    if (!name.trim()) return setError('Nom requis.');

    setSubmitting(true);
    try {
      const res = await subcontractorsApi.create({
        name: name.trim(),
        companyName: companyName.trim() || null,
        contactName: contactName.trim() || null,
        specialty: specialty.trim() || null,
        email: email.trim() || null,
        phone: phone.trim() || null,
        address: address.trim() || null,
        vatNumber: vatNumber.trim() || null,
        hourlyRate: parseFloat(hourlyRate.replace(',', '.')) || null,
        iban: iban.trim() || null,
        bic: bic.trim() || null,
        paymentTerms: parseInt(paymentTerms) || 30,
        active,
        notes: notes.trim() || null,
      });
      router.replace(`/subcontractor/${res.id}`);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Nouveau sous-traitant" showBack />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {!!error && (<View style={styles.errorBox}><Text style={styles.errorText}>⚠️ {error}</Text></View>)}

          <Card>
            <Text style={styles.sectionTitle}>Général</Text>
            <Input label="Nom *" value={name} onChangeText={setName} />
            <Input label="Raison sociale" value={companyName} onChangeText={setCompanyName} />
            <Input label="Personne de contact" value={contactName} onChangeText={setContactName} />
            <Input label="Spécialité" value={specialty} onChangeText={setSpecialty} placeholder="Électricien, Plombier..." />
            <Input label="N° TVA" value={vatNumber} onChangeText={setVatNumber} />
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Coordonnées</Text>
            <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <Input label="Téléphone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <Input label="Adresse" value={address} onChangeText={setAddress} multiline />
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Bancaire</Text>
            <Input label="IBAN" value={iban} onChangeText={setIban} autoCapitalize="characters" />
            <Input label="BIC" value={bic} onChangeText={setBic} autoCapitalize="characters" />
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Tarification</Text>
            <Input label="Taux horaire (€)" value={hourlyRate} onChangeText={setHourlyRate} keyboardType="numeric" />
            <Input label="Délai paiement (jours)" value={paymentTerms} onChangeText={setPaymentTerms} keyboardType="numeric" />
            <TouchableOpacity style={styles.checkboxRow} onPress={() => setActive(!active)} activeOpacity={0.7}>
              <View style={[styles.checkbox, active && styles.checkboxOn]}>
                {active && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Sous-traitant actif</Text>
            </TouchableOpacity>
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Input value={notes} onChangeText={setNotes} multiline />
          </Card>

          <Button
            title={submitting ? 'Création...' : 'Créer le sous-traitant'}
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
  sectionTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700', marginBottom: spacing.md },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: colors.borderLight, alignItems: 'center', justifyContent: 'center' },
  checkboxOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '800' },
  checkboxLabel: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500', flex: 1 },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.35)', borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg },
  errorText: { color: colors.error, fontSize: fontSize.sm },
});