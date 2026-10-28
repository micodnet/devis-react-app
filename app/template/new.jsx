import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { templatesApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import ArticlePickerModal from '../../components/ArticlePickerModal';

export default function NewTemplateScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/templates');
  };

  const addArticle = (article) => {
    setItems((prev) => [
      ...prev,
      {
        ref: article.ref,
        name: article.name,
        unit: article.unit,
        unitPrice: article.unitPrice,
        qty: 1,
        total: article.unitPrice,
      },
    ]);
  };

  const updateQty = (index, value) => {
    setItems((prev) => {
      const copy = [...prev];
      const qty = parseFloat(String(value).replace(',', '.')) || 0;
      const unitPrice = copy[index].unitPrice || 0;
      copy[index] = { ...copy[index], qty: value, total: qty * unitPrice };
      return copy;
    });
  };

  const updateUnitPrice = (index, value) => {
    setItems((prev) => {
      const copy = [...prev];
      const unitPrice = parseFloat(String(value).replace(',', '.')) || 0;
      const qty = parseFloat(String(copy[index].qty).replace(',', '.')) || 0;
      copy[index] = { ...copy[index], unitPrice, total: qty * unitPrice };
      return copy;
    });
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const getTotals = () => {
    let subtotal = 0;
    for (const item of items) {
      subtotal += Number(item.total) || 0;
    }
    return { subtotal, total: subtotal };
  };

  const submit = async () => {
    setError('');
    if (!name.trim()) return setError('Le nom est requis.');
    if (items.length === 0) return setError('Ajoutez au moins un article.');

    const cleanItems = items
      .filter((it) => {
        const qty = parseFloat(String(it.qty).replace(',', '.')) || 0;
        return it.name && qty > 0;
      })
      .map((it) => {
        const qty = parseFloat(String(it.qty).replace(',', '.')) || 0;
        const unitPrice = Number(it.unitPrice) || 0;
        return {
          ref: it.ref || null,
          name: it.name,
          unit: it.unit || 'u',
          qty,
          unitPrice,
          total: Math.round(qty * unitPrice * 100) / 100,
        };
      });

    if (cleanItems.length === 0) return setError('Aucun article valide.');

    setSubmitting(true);
    try {
      const res = await templatesApi.create({
        name: name.trim(),
        category: category.trim() || null,
        description: description.trim() || null,
        items: cleanItems,
      });
      router.replace(`/template/${res.id}`);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  const { total } = getTotals();
  const fmt = (n) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(n || 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Nouveau modèle" showBack />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {!!error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}

          <Card>
            <Text style={styles.sectionTitle}>Informations</Text>
            <Input label="Nom *" value={name} onChangeText={setName} placeholder="Peinture appartement T3" />
            <Input label="Catégorie" value={category} onChangeText={setCategory} placeholder="Peinture, Placo, Carrelage..." />
            <Input label="Description" value={description} onChangeText={setDescription} multiline />
          </Card>

          <Card>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Articles ({items.length})</Text>
              <TouchableOpacity
                style={styles.addBtnSmall}
                onPress={() => setPickerOpen(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.addBtnSmallText}>+ Ajouter</Text>
              </TouchableOpacity>
            </View>

            {items.length === 0 ? (
              <TouchableOpacity
                style={styles.emptyDrop}
                onPress={() => setPickerOpen(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.emptyDropIcon}>📦</Text>
                <Text style={styles.emptyDropTitle}>Aucun article</Text>
                <Text style={styles.emptyDropSub}>
                  Tapez ici pour ajouter un produit ou service depuis votre catalogue
                </Text>
              </TouchableOpacity>
            ) : (
              items.map((item, i) => (
                <View key={i} style={styles.itemRow}>
                  <View style={styles.itemHeader}>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.itemName} numberOfLines={2}>
                        {item.name}
                      </Text>
                      {item.ref ? (
                        <Text style={styles.itemRef}>{item.ref}</Text>
                      ) : null}
                    </View>
                    <TouchableOpacity onPress={() => removeItem(i)}>
                      <Text style={styles.removeText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.itemInputs}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Qté</Text>
                      <Input
                        value={String(item.qty)}
                        onChangeText={(v) => updateQty(i, v)}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>P.U. HT</Text>
                      <Input
                        value={String(item.unitPrice)}
                        onChangeText={(v) => updateUnitPrice(i, v)}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Total</Text>
                      <View style={styles.totalBox}>
                        <Text style={styles.totalBoxText}>{fmt(item.total)}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            )}
          </Card>

          <Card>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL HT</Text>
              <Text style={styles.totalValue}>{fmt(total)}</Text>
            </View>
          </Card>

          <Button
            title={submitting ? 'Création...' : 'Créer le modèle'}
            onPress={submit}
            disabled={submitting}
            loading={submitting}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <ArticlePickerModal
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={addArticle}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  addBtnSmall: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  addBtnSmallText: { color: '#0b1120', fontSize: fontSize.xs, fontWeight: '700' },
  emptyDrop: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.borderLight,
    borderRadius: radius.lg,
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyDropIcon: { fontSize: 32, marginBottom: spacing.sm },
  emptyDropTitle: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptyDropSub: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  itemRow: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  itemName: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  itemRef: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  removeText: {
    color: colors.error,
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: spacing.sm,
  },
  itemInputs: { flexDirection: 'row', gap: spacing.sm },
  inputLabel: {
    color: colors.textMuted,
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 4,
  },
  totalBox: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    minHeight: 44,
    justifyContent: 'center',
  },
  totalBoxText: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: { color: colors.text, fontSize: fontSize.md, fontWeight: '800' },
  totalValue: { color: colors.accent, fontSize: fontSize.xl, fontWeight: '800' },
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