import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { emailImportApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function EmailImportDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [importData, setImportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/email-import');
  };

  useEffect(() => { loadImport(); }, [id]);

  const loadImport = async () => {
    try {
      setError('');
      const data = await emailImportApi.get(id);
      setImportData(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Supprimer', 'Supprimer cet import ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await emailImportApi.remove(id);
            router.replace('/(app)/email-import');
          } catch (err) {
            Alert.alert('Erreur', err.response?.data?.error || err.message);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>
      </SafeAreaView>
    );
  }

  if (error || !importData) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Erreur</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.errorText}>⚠️ {error || 'Import introuvable'}</Text>
          <Button title="Retour" onPress={handleBack} variant="secondary" />
        </View>
      </SafeAreaView>
    );
  }

  const d = importData.extractedData || {};
  const items = d.items || [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>Import email</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Card>
          <Text style={styles.sectionTitle}>Métadonnées</Text>
          <Row label="Date" value={new Date(importData.createdAt).toLocaleString('fr-FR')} />
          <Row label="De" value={importData.fromName || importData.fromEmail || '-'} />
          {importData.subject ? <Row label="Sujet" value={importData.subject} /> : null}
          <Row label="Statut" value={importData.status || '-'} />
        </Card>

        {d.description ? (
          <Card>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.bodyText}>{d.description}</Text>
          </Card>
        ) : null}

        <Card>
          <Text style={styles.sectionTitle}>Données extraites</Text>
          <Row label="Client" value={d.clientName || '-'} />
          <Row label="Email" value={d.clientEmail || '-'} />
          <Row label="Téléphone" value={d.clientPhone || '-'} />
          <Row label="Adresse" value={d.clientAddress || '-'} />
        </Card>

        {items.length > 0 && (
          <Card>
            <Text style={styles.sectionTitle}>Articles ({items.length})</Text>
            {items.map((it, i) => (
              <View key={i} style={styles.itemRow}>
                <Text style={styles.itemName} numberOfLines={2}>{it.name}</Text>
                <Text style={styles.itemQty}>{it.qty || 1}</Text>
                <Text style={styles.itemTotal}>
                  {((Number(it.qty) || 1) * (Number(it.unitPrice) || 0)).toFixed(2)} €
                </Text>
              </View>
            ))}
          </Card>
        )}

        <Card>
          <Text style={styles.sectionTitle}>Texte original</Text>
          <View style={styles.textBox}>
            <Text style={styles.textBoxContent} numberOfLines={20}>
              {importData.rawText || ''}
            </Text>
          </View>
        </Card>

        {importData.quoteId ? (
          <Card>
            <Text style={styles.sectionTitle}>Devis créé</Text>
            <Button
              title="Voir le devis"
              onPress={() => router.push(`/quote/${importData.quoteId}`)}
              variant="secondary"
            />
          </Card>
        ) : null}

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteText}>🗑 Supprimer cet import</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={3}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.md,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backText: { color: colors.text, fontSize: 24, fontWeight: '600' },
  title: { flex: 1, color: colors.text, fontSize: fontSize.lg, fontWeight: '700' },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700', marginBottom: spacing.md },
  bodyText: { color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, gap: spacing.md },
  label: { color: colors.textSecondary, fontSize: fontSize.sm },
  value: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500', flexShrink: 1, textAlign: 'right' },
  itemRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.sm,
  },
  itemName: { flex: 1, color: colors.text, fontSize: fontSize.sm, fontWeight: '500' },
  itemQty: { color: colors.textSecondary, fontSize: fontSize.xs, width: 40, textAlign: 'center' },
  itemTotal: { color: colors.accent, fontSize: fontSize.sm, fontWeight: '700', width: 80, textAlign: 'right' },
  textBox: {
    backgroundColor: colors.bg, borderRadius: radius.md,
    padding: spacing.md, borderWidth: 1, borderColor: colors.borderLight,
  },
  textBoxContent: {
    color: colors.textSecondary, fontSize: fontSize.xs,
    fontFamily: 'monospace', lineHeight: 18,
  },
  deleteBtn: {
    marginTop: spacing.xl, paddingVertical: spacing.md,
    borderRadius: radius.md, borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.4)',
    backgroundColor: 'rgba(248,113,113,0.08)', alignItems: 'center',
  },
  deleteText: { color: colors.error, fontSize: fontSize.sm, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorText: { color: colors.error, fontSize: fontSize.md, textAlign: 'center', marginBottom: spacing.lg },
});