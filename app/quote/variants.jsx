import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { variantsApi, quotesApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import ArticlePickerModal from '../../components/ArticlePickerModal';

const MAX_VARIANTS = 5;
const MIN_VARIANTS = 2;

export default function VariantsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [variants, setVariants] = useState([]);
  const [isMultiOption, setIsMultiOption] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [pickerTarget, setPickerTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace(`/quote/${id}`);
  };

  useEffect(() => { loadVariants(); }, [id]);

  const loadVariants = async () => {
    try {
      const data = await variantsApi.list(id);
      setVariants(Array.isArray(data.variants) ? data.variants : []);
      setIsMultiOption(data.isMultiOption === true);
      setSelectedIndex(data.selectedVariantIndex ?? null);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const addVariant = () => {
    if (variants.length >= MAX_VARIANTS) {
      Alert.alert('Maximum', `Maximum ${MAX_VARIANTS} variantes.`);
      return;
    }
    setVariants((prev) => [
      ...prev,
      { name: 'Nouvelle formule', description: '', recommended: false, items: [] },
    ]);
  };

  const removeVariant = (index) => {
    if (variants.length <= MIN_VARIANTS) {
      Alert.alert('Minimum', `Il faut au moins ${MIN_VARIANTS} variantes.`);
      return;
    }
    Alert.alert('Supprimer', 'Supprimer cette variante ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: () => setVariants((prev) => prev.filter((_, i) => i !== index)),
      },
    ]);
  };

  const updateVariant = (index, key, value) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [key]: value };
      return copy;
    });
  };

  const toggleRecommended = (index) => {
    setVariants((prev) =>
      prev.map((v, i) => ({ ...v, recommended: i === index ? !v.recommended : false }))
    );
  };

  const addItemToVariant = (variantIndex, article) => {
    setVariants((prev) => {
      const copy = [...prev];
      const items = [...(copy[variantIndex].items || [])];
      items.push({
        ref: article.ref, name: article.name, unit: article.unit,
        unitPrice: article.unitPrice, qty: 1,
      });
      copy[variantIndex] = { ...copy[variantIndex], items };
      return copy;
    });
  };

  const updateItemQty = (variantIndex, itemIndex, value) => {
    setVariants((prev) => {
      const copy = [...prev];
      const items = [...(copy[variantIndex].items || [])];
      items[itemIndex] = { ...items[itemIndex], qty: value };
      copy[variantIndex] = { ...copy[variantIndex], items };
      return copy;
    });
  };

  const removeItem = (variantIndex, itemIndex) => {
    setVariants((prev) => {
      const copy = [...prev];
      const items = (copy[variantIndex].items || []).filter((_, i) => i !== itemIndex);
      copy[variantIndex] = { ...copy[variantIndex], items };
      return copy;
    });
  };

  const computeTotal = (variant) => {
    let total = 0;
    for (const it of variant.items || []) {
      const qty = parseFloat(String(it.qty).replace(',', '.')) || 0;
      const price = Number(it.unitPrice) || 0;
      total += qty * price;
    }
    return total;
  };

  const fmt = (n) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency', currency: 'EUR', minimumFractionDigits: 2,
    }).format(n || 0);

  const save = async () => {
    setError('');
    if (variants.length < MIN_VARIANTS || variants.length > MAX_VARIANTS) {
      return setError(`Il faut entre ${MIN_VARIANTS} et ${MAX_VARIANTS} variantes.`);
    }
    for (const v of variants) {
      if (!v.items || v.items.length === 0) {
        return setError(`La variante "${v.name}" n'a pas d'articles.`);
      }
    }
    setSubmitting(true);
    try {
      const clean = variants.map((v) => ({
        name: v.name || 'Sans nom',
        description: v.description || '',
        recommended: v.recommended === true,
        items: (v.items || []).map((it) => {
          const qty = parseFloat(String(it.qty).replace(',', '.')) || 0;
          const unitPrice = Number(it.unitPrice) || 0;
          return {
            ref: it.ref || null, name: it.name, unit: it.unit || 'u',
            qty, unitPrice, total: Math.round(qty * unitPrice * 100) / 100,
          };
        }),
      }));
      await variantsApi.save(id, clean);
      Alert.alert('Succès', 'Variantes enregistrées');
      router.replace(`/quote/${id}`);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Variantes" showBack />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Variantes multi-options" showBack />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {!!error && (<View style={styles.errorBox}><Text style={styles.errorText}>⚠️ {error}</Text></View>)}

          <Card>
            <Text style={styles.hint}>
              Proposez jusqu'à {MAX_VARIANTS} formules au client. Il choisira la sienne sur le lien public.
            </Text>
          </Card>

          {variants.length === 0 ? (
            <Card>
              <Text style={styles.empty}>
                Aucune variante. Ajoutez-en au moins {MIN_VARIANTS} pour activer le mode multi-options.
              </Text>
            </Card>
          ) : (
            variants.map((v, vi) => {
              const total = computeTotal(v);
              return (
                <Card
                  key={vi}
                  style={v.recommended ? { borderColor: colors.accent, borderWidth: 2 } : null}
                >
                  {v.recommended && (
                    <View style={styles.recommendedBadge}>
                      <Text style={styles.recommendedBadgeText}>RECOMMANDÉE</Text>
                    </View>
                  )}

                  <View style={styles.variantHeader}>
                    <Text style={styles.variantIndex}>Formule #{vi + 1}</Text>
                    {variants.length > MIN_VARIANTS && (
                      <TouchableOpacity onPress={() => removeVariant(vi)}>
                        <Text style={styles.removeText}>✕</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <Input
                    label="Nom de la formule"
                    value={v.name}
                    onChangeText={(val) => updateVariant(vi, 'name', val)}
                    placeholder="Formule Essentielle"
                  />
                  <Input
                    label="Description"
                    value={v.description || ''}
                    onChangeText={(val) => updateVariant(vi, 'description', val)}
                    placeholder="Carrelage standard..."
                  />

                  <TouchableOpacity
                    style={styles.recommendRow}
                    onPress={() => toggleRecommended(vi)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.checkbox, v.recommended && styles.checkboxOn]}>
                      {v.recommended && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.checkboxLabel}>Mettre en avant (recommandée)</Text>
                  </TouchableOpacity>

                  <View style={styles.itemsHeader}>
                    <Text style={styles.sectionTitle}>Articles ({(v.items || []).length})</Text>
                    <TouchableOpacity
                      style={styles.addBtnSmall}
                      onPress={() => setPickerTarget(vi)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.addBtnSmallText}>+ Ajouter</Text>
                    </TouchableOpacity>
                  </View>

                  {(v.items || []).length === 0 ? (
                    <Text style={styles.emptyItems}>Aucun article</Text>
                  ) : (
                    (v.items || []).map((it, i) => (
                      <View key={i} style={styles.itemRow}>
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text style={styles.itemName} numberOfLines={2}>{it.name}</Text>
                          {it.ref ? <Text style={styles.itemRef}>{it.ref}</Text> : null}
                        </View>
                        <Input
                          value={String(it.qty)}
                          onChangeText={(val) => updateItemQty(vi, i, val)}
                          keyboardType="numeric"
                          style={{ width: 60, marginBottom: 0 }}
                        />
                        <Text style={styles.itemTotal}>{fmt((parseFloat(String(it.qty).replace(',', '.')) || 0) * (Number(it.unitPrice) || 0))}</Text>
                        <TouchableOpacity onPress={() => removeItem(vi, i)}>
                          <Text style={styles.removeTextSmall}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    ))
                  )}

                  <View style={styles.variantTotal}>
                    <Text style={styles.variantTotalLabel}>Total HT</Text>
                    <Text style={styles.variantTotalValue}>{fmt(total)}</Text>
                  </View>
                </Card>
              );
            })
          )}

          <Button
            title={variants.length >= MAX_VARIANTS ? 'Maximum atteint' : '+ Ajouter une variante'}
            onPress={addVariant}
            disabled={variants.length >= MAX_VARIANTS}
            variant="secondary"
          />

          <View style={{ height: spacing.md }} />

          {variants.length >= MIN_VARIANTS && (
            <Button
              title={submitting ? 'Enregistrement...' : 'Enregistrer les variantes'}
              onPress={save}
              disabled={submitting}
              loading={submitting}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <ArticlePickerModal
        visible={pickerTarget !== null}
        onClose={() => setPickerTarget(null)}
        onSelect={(a) => { if (pickerTarget !== null) addItemToVariant(pickerTarget, a); }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionTitle: { color: colors.text, fontSize: fontSize.sm, fontWeight: '700' },
  hint: { color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 20 },
  empty: { color: colors.textMuted, fontSize: fontSize.sm, fontStyle: 'italic', textAlign: 'center', paddingVertical: spacing.lg },
  emptyItems: { color: colors.textMuted, fontSize: fontSize.xs, fontStyle: 'italic', textAlign: 'center', paddingVertical: spacing.md },
  variantHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: spacing.md,
  },
  variantIndex: { color: colors.accent, fontSize: fontSize.sm, fontWeight: '800' },
  recommendedBadge: {
    position: 'absolute', top: -10, right: spacing.lg,
    backgroundColor: colors.accent, paddingHorizontal: spacing.md,
    paddingVertical: 3, borderRadius: radius.full, zIndex: 1,
  },
  recommendedBadgeText: { color: '#0b1120', fontSize: 10, fontWeight: '800' },
  recommendRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingVertical: spacing.sm, marginBottom: spacing.md,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2,
    borderColor: colors.borderLight, alignItems: 'center', justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '800' },
  checkboxLabel: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500', flex: 1 },
  itemsHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: spacing.sm,
  },
  addBtnSmall: {
    backgroundColor: colors.accent, paddingHorizontal: spacing.md,
    paddingVertical: 4, borderRadius: radius.full,
  },
  addBtnSmallText: { color: '#0b1120', fontSize: 10, fontWeight: '800' },
  itemRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: spacing.sm, paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  itemName: { color: colors.text, fontSize: fontSize.xs, fontWeight: '500' },
  itemRef: { color: colors.textMuted, fontSize: 10, marginTop: 2 },
  itemTotal: { color: colors.accent, fontSize: fontSize.xs, fontWeight: '700', minWidth: 70, textAlign: 'right' },
  removeTextSmall: { color: colors.error, fontSize: 14, fontWeight: '700', paddingHorizontal: 4 },
  removeText: { color: colors.error, fontSize: 18, fontWeight: '700' },
  variantTotal: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingTop: spacing.md, marginTop: spacing.md,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  variantTotalLabel: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '700' },
  variantTotalValue: { color: colors.accent, fontSize: fontSize.md, fontWeight: '800' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)', borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.lg,
  },
  errorText: { color: colors.error, fontSize: fontSize.sm },
});