import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { suppliersApi } from '../../lib/api';
import { colors, spacing, fontSize } from '../../lib/theme';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function SupplierDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/suppliers');
  };

  useEffect(() => {
    loadSupplier();
  }, [id]);

  const loadSupplier = async () => {
    try {
      setError('');
      const data = await suppliersApi.get(id);
      setSupplier(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
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

  if (error || !supplier) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Erreur</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.errorText}>⚠️ {error || 'Fournisseur introuvable'}</Text>
          <Button title="Retour" onPress={handleBack} variant="secondary" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {supplier.name}
        </Text>
      </View>

        <Card>
          <Text style={styles.sectionTitle}>Actions</Text>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => router.push(`/supplier/edit?id=${id}`)}
            activeOpacity={0.7}
          >
            <Text style={styles.actionLabel}>✏️ Modifier</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </Card>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Card>
          <Text style={styles.sectionTitle}>Coordonnées</Text>
          {supplier.contactName ? <Row label="Contact" value={supplier.contactName} /> : null}
          {supplier.email ? <Row label="Email" value={supplier.email} /> : null}
          {supplier.phone ? <Row label="Téléphone" value={supplier.phone} /> : null}
          {supplier.address ? <Row label="Adresse" value={supplier.address} /> : null}
          {supplier.website ? <Row label="Site web" value={supplier.website} /> : null}
          {supplier.vatNumber ? <Row label="N° TVA" value={supplier.vatNumber} /> : null}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Coordonnées bancaires</Text>
          {supplier.iban ? <Row label="IBAN" value={supplier.iban} /> : null}
          {supplier.bic ? <Row label="BIC" value={supplier.bic} /> : null}
          {!supplier.iban && !supplier.bic ? (
            <Text style={styles.empty}>Aucune coordonnée bancaire.</Text>
          ) : null}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Logistique</Text>
          <Row label="Délai de livraison" value={`${supplier.deliveryDays || 7} jours`} />
          <Row label="Délai de paiement" value={`${supplier.paymentTerms || 30} jours`} />
        </Card>

        {supplier.notes ? (
          <Card>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notes}>{supplier.notes}</Text>
          </Card>
        ) : null}
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
  notes: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  empty: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
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
  actionRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: colors.border,
  },
  actionLabel: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500' },
  actionArrow: { color: colors.textMuted, fontSize: 20, fontWeight: '300' },
});