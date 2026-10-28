import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { quotesApi, currencyApi, quoteConvertApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function ConvertQuoteScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [quote, setQuote] = useState(null);
  const [currencies, setCurrencies] = useState([]);
  const [targetCurrency, setTargetCurrency] = useState('EUR');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [error, setError] = useState('');

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace(`/quote/${id}`);
  };

  useEffect(() => { loadAll(); }, [id]);

  const loadAll = async () => {
    try {
      setError('');
      const [q, curr] = await Promise.all([
        quotesApi.get(id),
        currencyApi.list().catch(() => ({ supported: [], available: [], default: 'EUR' })),
      ]);
      setQuote(q);
      const supported = curr.supported || [];
      const available = curr.available || [];
      setCurrencies(available.filter((c) => supported.includes(c.code)));
      setTargetCurrency(q.currency || 'EUR');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const loadPreview = async () => {
    if (!quote || targetCurrency === quote.currency) {
      setPreview(null);
      return;
    }
    setPreviewing(true);
    setPreview(null);
    try {
      const data = await quoteConvertApi.preview(id, targetCurrency);
      setPreview(data);
    } catch (err) {
      // Silent — la preview peut ne pas être implémentée
      setPreview(null);
    } finally {
      setPreviewing(false);
    }
  };

  useEffect(() => {
    if (quote && targetCurrency && targetCurrency !== quote.currency) {
      loadPreview();
    } else {
      setPreview(null);
    }
  }, [targetCurrency, quote]);

  const submit = async () => {
    if (!quote) return;
    if (targetCurrency === quote.currency) {
      Alert.alert('Info', 'Le devis est déjà dans cette devise.');
      return;
    }
    Alert.alert(
      'Convertir le devis',
      `Convertir ${quote.quoteNumber} vers ${targetCurrency} ? Un nouveau devis sera créé.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Convertir',
          onPress: async () => {
            setConverting(true);
            setError('');
            try {
              const res = await quoteConvertApi.convert(id, targetCurrency);
              Alert.alert('Succès', `Devis ${res.quoteNumber || ''} créé en ${targetCurrency}`);
              if (res.id) router.replace(`/quote/${res.id}`);
              else router.replace('/(app)/devis');
            } catch (err) {
              setError(err.response?.data?.error || err.message || 'Erreur');
            } finally {
              setConverting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Convertir devise" showBack />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>
      </SafeAreaView>
    );
  }

  if (error && !quote) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Convertir devise" showBack />
        <View style={styles.center}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <Button title="Retour" onPress={handleBack} variant="secondary" />
        </View>
      </SafeAreaView>
    );
  }

  const fmt = (n, cur) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency', currency: cur || 'EUR', minimumFractionDigits: 2,
    }).format(n || 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Convertir devise" showBack />
      <ScrollView contentContainerStyle={styles.scroll}>
        {!!error && (<View style={styles.errorBox}><Text style={styles.errorText}>⚠️ {error}</Text></View>)}

        {quote && (
          <Card>
            <Text style={styles.sectionTitle}>Devis source</Text>
            <Row label="N°" value={quote.quoteNumber} />
            <Row label="Devise actuelle" value={quote.currency || 'EUR'} />
            <Row label="Total" value={fmt(quote.total, quote.currency)} />
          </Card>
        )}

        <Card>
          <Text style={styles.sectionTitle}>Devise cible</Text>
          {currencies.length === 0 ? (
            <Text style={styles.empty}>
              Aucune devise supportée. Allez dans Plus → Devises pour en activer.
            </Text>
          ) : (
            <View style={styles.chipsRow}>
              {currencies.map((c) => {
                const isActive = targetCurrency === c.code;
                return (
                  <TouchableOpacity
                    key={c.code}
                    style={[styles.chip, isActive && styles.chipActive]}
                    onPress={() => setTargetCurrency(c.code)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                      {c.code} — {c.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </Card>

        {previewing && (
          <Card>
            <View style={styles.previewLoading}>
              <ActivityIndicator color={colors.accent} />
              <Text style={styles.previewLoadingText}>Calcul du taux de change...</Text>
            </View>
          </Card>
        )}

        {preview && !previewing && (
          <Card>
            <Text style={styles.sectionTitle}>Aperçu de la conversion</Text>
            <Row label="Taux de change" value={`1 ${quote.currency} = ${Number(preview.rate || 0).toFixed(4)} ${targetCurrency}`} />
            <Row label="Total actuel" value={fmt(quote.total, quote.currency)} />
            <Row
              label="Total converti"
              value={fmt(preview.convertedTotal || 0, targetCurrency)}
              highlight
            />
            {preview.rateDate ? (
              <Row label="Taux du" value={new Date(preview.rateDate).toLocaleDateString('fr-FR')} />
            ) : null}
          </Card>
        )}

        <Button
          title={converting ? 'Conversion...' : `💱 Convertir vers ${targetCurrency}`}
          onPress={submit}
          disabled={converting || targetCurrency === quote?.currency}
          loading={converting}
        />

        <Text style={styles.hint}>
          Un nouveau devis sera créé dans la devise choisie. Le devis source
          reste inchangé.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value, highlight }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, highlight && { color: colors.accent, fontWeight: '800', fontSize: fontSize.lg }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700', marginBottom: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, gap: spacing.md },
  label: { color: colors.textSecondary, fontSize: fontSize.sm },
  value: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500', textAlign: 'right' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md, paddingVertical: 10,
    borderRadius: radius.full, borderWidth: 1,
    borderColor: colors.borderLight, backgroundColor: colors.bgCard,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600' },
  chipTextActive: { color: '#0b1120' },
  previewLoading: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  previewLoadingText: { color: colors.textSecondary, fontSize: fontSize.sm },
  empty: { color: colors.textMuted, fontSize: fontSize.sm, fontStyle: 'italic', textAlign: 'center', paddingVertical: spacing.lg },
  hint: { color: colors.textMuted, fontSize: fontSize.xs, textAlign: 'center', marginTop: spacing.lg, lineHeight: 16 },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)', borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.lg,
  },
  errorText: { color: colors.error, fontSize: fontSize.sm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
});