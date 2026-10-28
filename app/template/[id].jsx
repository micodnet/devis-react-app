import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  TouchableOpacity, Alert, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { templatesApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function TemplateDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [using, setUsing] = useState(false);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/templates');
  };

  const loadTemplate = async () => {
    try {
      setError('');
      const data = await templatesApi.get(id);
      setTemplate(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTemplate();
    }, [id])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadTemplate();
  };

  const fmtMoney = (n) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(n || 0);

  const handleUse = () => {
    Alert.alert(
      'Utiliser ce modèle',
      'Créer un nouveau devis à partir de ce modèle ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Créer',
          onPress: async () => {
            setUsing(true);
            try {
              const res = await templatesApi.use(id);
              Alert.alert('Succès', `Devis ${res.quoteNumber || ''} créé`);
              if (res.id) router.replace(`/quote/${res.id}`);
              else router.replace('/(app)/devis');
            } catch (err) {
              Alert.alert('Erreur', err.response?.data?.error || err.message);
            } finally {
              setUsing(false);
            }
          },
        },
      ]
    );
  };

  const handleDuplicate = () => {
    Alert.alert('Dupliquer', 'Créer une copie de ce modèle ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Dupliquer',
        onPress: async () => {
          try {
            const res = await templatesApi.duplicate(id);
            Alert.alert('Succès', 'Modèle dupliqué');
            if (res.id) router.replace(`/template/${res.id}`);
          } catch (err) {
            Alert.alert('Erreur', err.response?.data?.error || err.message);
          }
        },
      },
    ]);
  };

  const handleDelete = () => {
    Alert.alert(
      'Supprimer',
      'Cette action est irréversible. Confirmer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await templatesApi.remove(id);
              router.replace('/(app)/templates');
            } catch (err) {
              Alert.alert('Erreur', err.response?.data?.error || err.message);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !template) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Erreur</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.errorText}>⚠️ {error || 'Modèle introuvable'}</Text>
          <Button title="Retour" onPress={handleBack} variant="secondary" />
        </View>
      </SafeAreaView>
    );
  }

  const items = Array.isArray(template.items) ? template.items : [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {template.name}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        <Card>
          <Text style={styles.sectionTitle}>Informations</Text>
          {template.category ? (
            <Row label="Catégorie" value={template.category} />
          ) : null}
          {template.description ? (
            <Row label="Description" value={template.description} />
          ) : null}
          <Row label="Utilisations" value={String(template.usageCount || 0)} />
          {template.lastUsedAt ? (
            <Row
              label="Dernière utilisation"
              value={new Date(template.lastUsedAt).toLocaleDateString('fr-FR')}
            />
          ) : null}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Articles ({items.length})</Text>
          {items.length === 0 ? (
            <Text style={styles.empty}>Aucun article.</Text>
          ) : (
            items.map((item, i) => (
              <View key={i} style={styles.itemRow}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  {item.ref ? (
                    <Text style={styles.itemRef}>{item.ref}</Text>
                  ) : null}
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.itemQty}>
                    {item.qty} × {fmtMoney(item.unitPrice)}
                  </Text>
                  <Text style={styles.itemTotal}>{fmtMoney(item.total)}</Text>
                </View>
              </View>
            ))
          )}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Total</Text>
          <Row label="Sous-total HT" value={fmtMoney(template.subtotal)} />
          <View style={[styles.row, styles.totalRow]}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalValue}>{fmtMoney(template.total)}</Text>
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Actions</Text>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleUse}
            disabled={using}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionLabel, { color: colors.accent }]}>
              {using ? '⏳ Création...' : '🚀 Utiliser ce modèle'}
            </Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => router.push(`/template/edit?id=${id}`)}
            activeOpacity={0.7}
          >
            <Text style={styles.actionLabel}>✏️ Modifier</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleDuplicate}
            activeOpacity={0.7}
          >
            <Text style={styles.actionLabel}>📋 Dupliquer</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleDelete}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionLabel, { color: colors.error }]}>
              🗑 Supprimer
            </Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={3}>
        {value}
      </Text>
    </View>
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    gap: spacing.md,
  },
  label: { color: colors.textSecondary, fontSize: fontSize.sm },
  value: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '500',
    flexShrink: 1,
    textAlign: 'right',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  itemName: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500' },
  itemRef: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },
  itemQty: { color: colors.textSecondary, fontSize: fontSize.xs },
  itemTotal: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: '700',
    marginTop: 2,
  },
  totalRow: {
    borderTopWidth: 2,
    borderTopColor: colors.accent,
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
  totalLabel: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '800',
  },
  totalValue: {
    color: colors.accent,
    fontSize: fontSize.xl,
    fontWeight: '800',
  },
  empty: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionLabel: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500' },
  actionArrow: { color: colors.textMuted, fontSize: 20, fontWeight: '300' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.md,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
});