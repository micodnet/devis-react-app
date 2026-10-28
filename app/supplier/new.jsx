import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { suppliersApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function NewSupplierScreen() {
  const router = useRouter();

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

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/suppliers');
  };

  const submit = async () => {
    setError('');
    if (!name.trim()) return setError('Le nom est requis.');

    setSubmitting(true);
    try {
      const result = await suppliersApi.create({
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
      router.replace(`/supplier/${result.id}`);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Nouveau fournisseur" showBack />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {!!error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}

          <Card>
            <Text style={styles.sectionTitle}>Général</Text>
            <Input label="Nom / Raison sociale *" value={name} onChangeText={setName} />
            <Input label="Catégorie" value={category} onChangeText={setCategory} placeholder="Matériaux, Électricité..." />
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
            <Input label="Délai de livraison (jours)" value={deliveryDays} onChangeText={setDeliveryDays} keyboardType="numeric" />
            <Input label="Délai de paiement (jours)" value={paymentTerms} onChangeText={setPaymentTerms} keyboardType="numeric" />
            <Input label="Notes internes" value={notes} onChangeText={setNotes} multiline />
          </Card>

          <Button
            title={submitting ? 'Création...' : 'Créer le fournisseur'}
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