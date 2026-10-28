import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { servicesApi, serviceHistoryApi, quotesApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function ServiceHistoryScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [service, setService] = useState(null);
  const [usage, setUsage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace(`/service/${id}`);
  };

  useEffect(() => { loadAll(); }, [id]);

  const loadAll = async () => {
    try {
      setError('');
      const s = await servicesApi.get(id);

      // Essayer d'abord l'endpoint dédié
      let usageData = [];
      try {
        usageData = await serviceHistoryApi.usage(id);
      } catch (err) {
        // Fallback : parcourir tous les devis pour trouver ceux contenant ce service
        const allQuotes = await quotesApi.list().catch(() => []);
        usageData = (allQuotes || [])
          .map((q) => {
            const items = q.items || [];
            const matchingItems = items.filter(
              (it) =>
                (it.ref && it.ref === s.ref) ||
                (it.name && it.name === s.name)
            );
            if (matchingItems.length === 0) return null;
            return {
              quoteId: q.id,
              quoteNumber: q.quoteNumber,
              clientName: q.clientName,
              issueDate: q.issueDate,
              status: q.status,
              items: matchingItems,
              totalService: matchingItems.reduce(
                (sum, it) => sum + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0),
                0
              ),
            };
          })
          .filter(Boolean);
      }

      setService(s);
      setUsage(Array.isArray(usageData) ? usageData : []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency', currency: 'EUR', minimumFractionDigits: 2,
    }).format(n || 0);

  const fmtDate = (d) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('fr-FR'); } catch { return d; }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Historique" showBack />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>
      </SafeAreaView>
    );
  }

  if (error || !service) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Historique" showBack />
        <View style={styles.center}>
          <Text style={styles.errorText}>⚠️ {error || 'Introuvable'}</Text>
          <Button title="Retour" onPress={handleBack} variant="secondary" />
        </View>
      </SafeAreaView>
    );
  }

  const totalRevenue = usage.reduce((s, u) => s + (u.totalService || 0), 0);
  const totalQty = usage.reduce(
    (s, u) => s + u.items.reduce((sum, it) => sum + (Number(it.qty) || 0), 0),
    0
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title={`Historique — ${service.name}`} showBack />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card>
          <Text style={styles.sectionTitle}>Statistiques</Text>
          <Row label="Utilisé dans" value={`${usage.length} devis`} />
          <Row label="Quantité totale vendue" value={`${totalQty} ${service.unit || ''}`} />
          <Row label="CA total généré" value={fmt(totalRevenue)} />
        </Card>

        <Text style={styles.sectionTitleOutside}>
          Devis contenant ce service ({usage.length})
        </Text>

        {usage.length === 0 ? (
          <Card>
            <Text style={styles.empty}>
              Ce service n'a jamais été utilisé dans un devis.
            </Text>
          </Card>
        ) : (
          usage.map((u) => (
            <TouchableOpacity
              key={u.quoteId}
              style={styles.usageCard}
              onPress={() => router.push(`/quote/${u.quoteId}`)}
              activeOpacity={0.7}
            >
              <View style={styles.usageHeader}>
                <Text style={styles.usageNumber}>{u.quoteNumber}</Text>
                <Text style={styles.usageTotal}>{fmt(u.totalService)}</Text>
              </View>
              <Text style={styles.usageClient} numberOfLines={1}>
                {u.clientName || '—'}
              </Text>
              <Text style={styles.usageDate}>{fmtDate(u.issueDate)}</Text>
              <View style={styles.usageItems}>
                {u.items.map((it, i) => (
                  <Text key={i} style={styles.usageItem} numberOfLines={1}>
                    • {it.qty} × {fmt(it.unitPrice)}
                  </Text>
                ))}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700', marginBottom: spacing.md },
  sectionTitleOutside: {
    color: colors.text, fontSize: fontSize.md, fontWeight: '700',
    marginTop: spacing.lg, marginBottom: spacing.md,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, gap: spacing.md },
  label: { color: colors.textSecondary, fontSize: fontSize.sm },
  value: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500', textAlign: 'right' },
  empty: { color: colors.textMuted, fontSize: fontSize.sm, fontStyle: 'italic', textAlign: 'center', paddingVertical: spacing.lg },
  usageCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, marginBottom: spacing.sm,
  },
  usageHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', gap: spacing.md, marginBottom: 4,
  },
  usageNumber: { color: colors.accent, fontSize: fontSize.sm, fontWeight: '700' },
  usageTotal: { color: colors.text, fontSize: fontSize.sm, fontWeight: '700' },
  usageClient: { color: colors.textSecondary, fontSize: fontSize.xs },
  usageDate: { color: colors.textMuted, fontSize: 10, marginTop: 2 },
  usageItems: { marginTop: spacing.sm, gap: 2 },
  usageItem: { color: colors.textSecondary, fontSize: 11 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorText: { color: colors.error, fontSize: fontSize.md, textAlign: 'center', marginBottom: spacing.lg },
});