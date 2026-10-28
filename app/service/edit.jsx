import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { servicesApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function EditServiceScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [ref, setRef] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('forfait');
  const [unitPrice, setUnitPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [category, setCategory] = useState('');
  const [isLabor, setIsLabor] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadService(); }, [id]);

  const loadService = async () => {
    try {
      const s = await servicesApi.get(id);
      setRef(s.ref || '');
      setName(s.name || '');
      setDescription(s.description || '');
      setUnit(s.unit || 'forfait');
      setUnitPrice(String(s.unitPrice || ''));
      setCostPrice(String(s.costPrice || ''));
      setCategory(s.category || '');
      setIsLabor(s.isLabor === true);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    setError('');
    if (!name.trim()) return setError('Le nom est requis.');
    const price = parseFloat(unitPrice.replace(',', '.'));
    if (isNaN(price) || price < 0) return setError('Prix invalide.');

    setSubmitting(true);
    try {
      await servicesApi.update(id, {
        ref: ref.trim() || null,
        name: name.trim(),
        description: description.trim() || null,
        unit: unit.trim() || 'forfait',
        unitPrice: price,
        costPrice: parseFloat(costPrice.replace(',', '.')) || 0,
        category: category.trim() || null,
        isLabor,
      });
      router.replace('/(app)/services');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Modifier le service" showBack />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Modifier le service" showBack />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {!!error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}

          <Card>
            <Text style={styles.sectionTitle}>Informations</Text>
            <Input label="Référence" value={ref} onChangeText={setRef} />
            <Input label="Nom *" value={name} onChangeText={setName} />
            <Input label="Description" value={description} onChangeText={setDescription} multiline />
            <Input label="Unité" value={unit} onChangeText={setUnit} />
            <Input label="Catégorie" value={category} onChangeText={setCategory} />
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Prix</Text>
            <Input label="Prix HT (€) *" value={unitPrice} onChangeText={setUnitPrice} keyboardType="numeric" />
            <Input label="Prix de revient (€)" value={costPrice} onChangeText={setCostPrice} keyboardType="numeric" />
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Type</Text>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setIsLabor(!isLabor)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, isLabor && styles.checkboxOn]}>
                {isLabor && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Main d'œuvre</Text>
            </TouchableOpacity>
          </Card>

          <Button
            title={submitting ? 'Enregistrement...' : 'Enregistrer'}
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700', marginBottom: spacing.md },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2,
    borderColor: colors.borderLight, alignItems: 'center', justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '800' },
  checkboxLabel: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500' },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)', borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.lg,
  },
  errorText: { color: colors.error, fontSize: fontSize.sm },
});