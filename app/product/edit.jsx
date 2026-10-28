import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { productsApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function EditProductScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [ref, setRef] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('u');
  const [unitPrice, setUnitPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [category, setCategory] = useState('');
  const [trackStock, setTrackStock] = useState(false);
  const [stockQuantity, setStockQuantity] = useState('0');
  const [stockAlertThreshold, setStockAlertThreshold] = useState('0');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const p = await productsApi.get(id);
      setRef(p.ref || '');
      setName(p.name || '');
      setDescription(p.description || '');
      setUnit(p.unit || 'u');
      setUnitPrice(String(p.unitPrice || ''));
      setCostPrice(String(p.costPrice || ''));
      setCategory(p.category || '');
      setTrackStock(p.trackStock === true);
      setStockQuantity(String(p.stockQuantity || 0));
      setStockAlertThreshold(String(p.stockAlertThreshold || 0));
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    setError('');
    if (!name.trim()) {
      setError('Le nom est requis.');
      return;
    }
    const price = parseFloat(unitPrice.replace(',', '.'));
    if (isNaN(price) || price < 0) {
      setError('Prix invalide.');
      return;
    }
    setSubmitting(true);
    try {
      await productsApi.update(id, {
        ref: ref.trim() || null,
        name: name.trim(),
        description: description.trim() || null,
        unit: unit.trim() || 'u',
        unitPrice: price,
        costPrice: parseFloat(costPrice.replace(',', '.')) || 0,
        category: category.trim() || null,
        trackStock,
        stockQuantity: trackStock ? parseFloat(stockQuantity.replace(',', '.')) || 0 : 0,
        stockAlertThreshold: trackStock ? parseFloat(stockAlertThreshold.replace(',', '.')) || 0 : 0,
      });
      router.replace('/(app)/catalogue');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Modifier le produit" showBack />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Modifier le produit" showBack />
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
            <Input label="Prix de vente HT (€) *" value={unitPrice} onChangeText={setUnitPrice} keyboardType="numeric" />
            <Input label="Prix d'achat HT (€)" value={costPrice} onChangeText={setCostPrice} keyboardType="numeric" />
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Stock</Text>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setTrackStock(!trackStock)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, trackStock && styles.checkboxOn]}>
                {trackStock && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Suivre le stock</Text>
            </TouchableOpacity>

            {trackStock && (
              <>
                <Input label="Stock actuel" value={stockQuantity} onChangeText={setStockQuantity} keyboardType="numeric" />
                <Input label="Seuil d'alerte" value={stockAlertThreshold} onChangeText={setStockAlertThreshold} keyboardType="numeric" />
              </>
            )}
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
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 2, borderColor: colors.borderLight,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '800' },
  checkboxLabel: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500' },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.35)',
    borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg,
  },
  errorText: { color: colors.error, fontSize: fontSize.sm },
});