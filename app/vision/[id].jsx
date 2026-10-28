import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, ActivityIndicator,
  TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { visionApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function VisionDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/vision');
  };

  useEffect(() => { loadAnalysis(); }, [id]);

  const loadAnalysis = async () => {
    try {
      setError('');
      const data = await visionApi.get(id);
      setAnalysis(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Supprimer', 'Supprimer cette analyse ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await visionApi.remove(id);
            router.replace('/(app)/vision');
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

  if (error || !analysis) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Erreur</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.errorText}>⚠️ {error || 'Analyse introuvable'}</Text>
          <Button title="Retour" onPress={handleBack} variant="secondary" />
        </View>
      </SafeAreaView>
    );
  }

  const r = analysis.result || {};
  const dimensions = r.dimensions || [];
  const materials = r.materials || [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>Analyse image</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Card>
          <Image
            source={{ uri: analysis.imageUrl }}
            style={styles.image}
            resizeMode="contain"
          />
          <Text style={styles.meta}>
            {analysis.provider} / {analysis.model} · {(analysis.durationMs / 1000).toFixed(1)}s
          </Text>
          <Text style={styles.date}>
            {new Date(analysis.createdAt).toLocaleString('fr-FR')}
          </Text>
        </Card>

        {r.description ? (
          <Card>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.bodyText}>{r.description}</Text>
          </Card>
        ) : null}

        {dimensions.length > 0 && (
          <Card>
            <Text style={styles.sectionTitle}>Dimensions</Text>
            {dimensions.map((d, i) => (
              <View key={i} style={styles.row}>
                <Text style={styles.label}>{d.label || 'Dimension'}</Text>
                <Text style={styles.value}>
                  {d.length} × {d.width} {d.unit || 'm'}
                </Text>
              </View>
            ))}
          </Card>
        )}

        {materials.length > 0 && (
          <Card>
            <Text style={styles.sectionTitle}>Matériaux ({materials.length})</Text>
            {materials.map((m, i) => (
              <View key={i} style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{m.name}</Text>
                  {m.ref ? <Text style={styles.itemRef}>{m.ref}</Text> : null}
                </View>
                <Text style={styles.itemQty}>
                  {m.estimatedQty || 1} {m.unit || ''}
                </Text>
                <Text style={styles.itemPrice}>
                  {(m.unitPrice || 0).toFixed(2)} €
                </Text>
              </View>
            ))}
          </Card>
        )}

        {r.extractedText ? (
          <Card>
            <Text style={styles.sectionTitle}>Texte extrait</Text>
            <View style={styles.textBox}>
              <Text style={styles.textBoxContent}>{r.extractedText}</Text>
            </View>
          </Card>
        ) : null}

        {r.notes ? (
          <Card>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.bodyText}>{r.notes}</Text>
          </Card>
        ) : null}

        {analysis.convertedQuoteId ? (
          <Card>
            <Text style={styles.sectionTitle}>Devis associé</Text>
            <Button
              title="Voir le devis"
              onPress={() => router.push(`/quote/${analysis.convertedQuoteId}`)}
              variant="secondary"
            />
          </Card>
        ) : null}

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteText}>🗑 Supprimer cette analyse</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
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
  image: { width: '100%', height: 260, borderRadius: radius.md, backgroundColor: colors.bg },
  meta: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: spacing.md },
  date: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, gap: spacing.md },
  label: { color: colors.textSecondary, fontSize: fontSize.sm },
  value: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500', textAlign: 'right' },
  itemRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.sm,
  },
  itemName: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500' },
  itemRef: { color: colors.textMuted, fontSize: fontSize.xs },
  itemQty: { color: colors.textSecondary, fontSize: fontSize.xs, width: 60, textAlign: 'center' },
  itemPrice: { color: colors.accent, fontSize: fontSize.sm, fontWeight: '700', width: 70, textAlign: 'right' },
  bodyText: { color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 20 },
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
    backgroundColor: 'rgba(248,113,113,0.08)',
    alignItems: 'center',
  },
  deleteText: { color: colors.error, fontSize: fontSize.sm, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorText: { color: colors.error, fontSize: fontSize.md, textAlign: 'center', marginBottom: spacing.lg },
});