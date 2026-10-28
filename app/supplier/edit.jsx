import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { suppliersApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function EditSupplierScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [contactName, setContactName] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [iban, setIban] = useState('');
  const [bic, setBic] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('7');
  const [paymentTerms, setPaymentTerms] = useState('30');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadSupplier(); }, [id]);

  const loadSupplier = async () => {
    try {
      const s = await suppliersApi.get(id);
      setName(s.name || '');
      setCategory(s.category || '');
      setContactName(s.contactName || '');
      setVatNumber(s.vatNumber || '');
      setEmail(s.email || '');
      setPhone(s.phone || '');
      setAddress(s.address || '');
      setWebsite(s.website || '');
      setIban(s.iban || '');
      setBic(s.bic || '');
      setDeliveryDays(String(s.deliveryDays || 7));
      setPaymentTerms(String(s.paymentTerms || 30));
      setNotes(s.notes || '');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    if (!name.trim()) return setError('Nom requis.');
    setSubmitting(true);
    setError('');
    try {
      await suppliersApi.update(id, {
        name: name.trim(),
        category: category.trim() || null,
        contactName: contactName.trim() || null,
        vatNumber: vatNumber.trim() || null,
        email: email.trim() || null,
        phone: phone.trim() || null,
        address: address.trim() || null,
        website: website.trim() || null,
        iban: iban.trim() || null,
        bic: bic.trim() || null,
        deliveryDays: parseInt(deliveryDays) || 7,
        paymentTerms: parseInt(paymentTerms) || 30,
        notes: notes.trim() || null,
      });
      router.replace(`/supplier/${id}`);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Modifier le fournisseur" showBack />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Modifier le fournisseur" showBack />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {!!error && (<View style={styles.errorBox}><Text style={styles.errorText}>⚠️ {error}</Text></View>)}

          <Card>
            <Text style={styles.sectionTitle}>Général</Text>
            <Input label="Nom *" value={name} onChangeText={setName} />
            <Input label="Catégorie" value={category} onChangeText={setCategory} />
            <Input label="Personne de contact" value={contactName} onChangeText={setContactName} />
            <Input label="N° TVA" value={vatNumber} onChangeText={setVatNumber} />
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Coordonnées</Text>
            <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <Input label="Téléphone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <Input label="Adresse" value={address} onChangeText={setAddress} multiline />
            <Input label="Site web" value={website} onChangeText={setWebsite} autoCapitalize="none" />
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Bancaire</Text>
            <Input label="IBAN" value={iban} onChangeText={setIban} autoCapitalize="characters" />
            <Input label="BIC" value={bic} onChangeText={setBic} autoCapitalize="characters" />
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Logistique</Text>
            <Input label="Délai livraison (jours)" value={deliveryDays} onChangeText={setDeliveryDays} keyboardType="numeric" />
            <Input label="Délai paiement (jours)" value={paymentTerms} onChangeText={setPaymentTerms} keyboardType="numeric" />
            <Input label="Notes" value={notes} onChangeText={setNotes} multiline />
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
  errorBox: { backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.35)', borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg },
  errorText: { color: colors.error, fontSize: fontSize.sm },
});