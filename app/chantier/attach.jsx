import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { chantierActionsApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function AttachQuoteScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [available, setAvailable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attaching, setAttaching] = useState(null);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace(`/chantier/${id}`);
  };

  useEffect(() => { loadAvailable(); }, [id]);

  const loadAvailable = async () => {
    try {
      setError('');
      const data = await chantierActionsApi.allQuotes(id);
      setAvailable(Array.isArray(data.available) ? data.available : []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const attach = async (quote) => {
    setAttaching(quote.id);
    try {
      await chantierActionsApi.attachQuote(id, quote.id);
      Alert.alert('Succès', 'Devis attaché');
      router.replace(`/chantier/${id}`);
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || err.message);
    } finally {
      setAttaching(null);
    }
  };

  const fmt = (n) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency', currency: 'EUR', minimumFractionDigits: 2,
    }).format(n || 0);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Attacher un devis" showBack />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Attacher un devis" showBack />
      <ScrollView contentContainerStyle={styles.scroll}>
        {!!error && (<View style={styles.errorBox}><Text style={styles.errorText}>⚠️ {error}</Text></View>)}

        <Card>
          <Text style={styles.hint}>
            Sélectionnez un devis à attacher à ce chantier.
          </Text>
        </Card>

        {available.length === 0 ? (
          <Card>
            <Text style={styles.empty}>
              Aucun devis disponible à attacher (tous les devis sont déjà attachés ou aucun devis n'existe).
            </Text>
          </Card>
        ) : (
          available.map((q) => (
            <TouchableOpacity
              key={q.id}
              style={styles.item}
              onPress={() => attach(q)}
              disabled={attaching === q.id}
              activeOpacity={0.7}
            >
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.itemNumber}>{q.number || q.quoteNumber}</Text>
                <Text style={styles.itemClient} numberOfLines={1}>
                  {q.client || q.clientName || '—'}
                </Text>
                <Text style={styles.itemDate}>{q.issueDate}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.itemTotal}>{fmt(q.total)}</Text>
                {attaching === q.id && <ActivityIndicator size="small" color={colors.accent} />}
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: spacing.md }} />
        <Button title="Retour" onPress={handleBack} variant="secondary" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700', marginBottom: spacing.md },
  hint: { color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 20 },
  empty: { color: colors.textMuted, fontSize: fontSize.sm, fontStyle: 'italic', textAlign: 'center', paddingVertical: spacing.lg },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.bgCard, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, marginBottom: spacing.sm,
  },
  itemNumber: { color: colors.accent, fontSize: fontSize.sm, fontWeight: '700' },
  itemClient: { color: colors.text, fontSize: fontSize.xs, marginTop: 2 },
  itemDate: { color: colors.textMuted, fontSize: 10, marginTop: 2 },
  itemTotal: { color: colors.text, fontSize: fontSize.sm, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)', borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.lg,
  },
  errorText: { color: colors.error, fontSize: fontSize.sm },
});