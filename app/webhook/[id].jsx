import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { webhooksApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';

export default function WebhookDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [webhook, setWebhook] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/webhooks');
  };

  useEffect(() => { loadAll(); }, [id]);

  const loadAll = async () => {
    try {
      setError('');
      const [wh, del] = await Promise.all([
        webhooksApi.get(id),
        webhooksApi.deliveries(id).catch(() => []),
      ]);
      setWebhook(wh);
      setDeliveries(Array.isArray(del) ? del : []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const test = async () => {
    try {
      const res = await webhooksApi.test(id);
      if (res.success) {
        Alert.alert('Succès', `HTTP ${res.status} (${res.durationMs}ms)`);
      } else {
        Alert.alert('Échec', res.error || `HTTP ${res.status}`);
      }
      await loadAll();
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || err.message);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Webhook" showBack />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>
      </SafeAreaView>
    );
  }

  if (error || !webhook) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Webhook" showBack />
        <View style={styles.center}>
          <Text style={styles.errorText}>⚠️ {error || 'Introuvable'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const successRate = webhook.totalDeliveries > 0
    ? Math.round((webhook.successCount / webhook.totalDeliveries) * 100)
    : 100;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title={webhook.description || 'Webhook'} showBack />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card>
          <Text style={styles.sectionTitle}>Informations</Text>
          <Row label="Description" value={webhook.description || '—'} />
          <Row label="URL" value={webhook.url} />
          <Row label="Statut" value={webhook.active ? 'Actif' : 'Inactif'} />
          <Row label="Livraisons totales" value={String(webhook.totalDeliveries || 0)} />
          <Row label="Succès" value={`${successRate}%`} />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Événements ({(webhook.events || []).length})</Text>
          <View style={styles.tagsRow}>
            {(webhook.events || []).map((e) => (
              <View key={e} style={styles.tag}>
                <Text style={styles.tagText}>{e}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Actions</Text>
          <TouchableOpacity style={styles.actionRow} onPress={test} activeOpacity={0.7}>
            <Text style={[styles.actionLabel, { color: colors.accent }]}>🧪 Tester</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </Card>

        <Text style={styles.sectionTitleOutside}>Historique ({deliveries.length})</Text>
        {deliveries.length === 0 ? (
          <Card><Text style={styles.empty}>Aucune livraison.</Text></Card>
        ) : (
          deliveries.map((d) => {
            const color = d.success ? colors.success : colors.error;
            return (
              <Card key={d.id} style={{ borderLeftWidth: 4, borderLeftColor: color }}>
                <View style={styles.deliveryHeader}>
                  <Text style={[styles.deliveryEvent, { color }]}>
                    {d.success ? '✓' : '✕'} {d.eventType}
                  </Text>
                  <Text style={styles.deliveryDate}>
                    {new Date(d.createdAt).toLocaleString('fr-FR')}
                  </Text>
                </View>
                <Text style={styles.deliveryMeta}>
                  HTTP {d.responseStatus || '—'} · {d.durationMs || 0}ms · tentative {d.attempt}
                </Text>
                {d.errorMessage ? (
                  <Text style={styles.deliveryError}>{d.errorMessage}</Text>
                ) : null}
              </Card>
            );
          })
        )}
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
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700', marginBottom: spacing.md },
  sectionTitleOutside: {
    color: colors.text, fontSize: fontSize.md, fontWeight: '700',
    marginTop: spacing.lg, marginBottom: spacing.md,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, gap: spacing.md },
  label: { color: colors.textSecondary, fontSize: fontSize.sm },
  value: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500', flexShrink: 1, textAlign: 'right' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tag: {
    paddingHorizontal: spacing.sm, paddingVertical: 3,
    borderRadius: radius.full, backgroundColor: colors.bgInput,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  tagText: { color: colors.textSecondary, fontSize: 10, fontWeight: '600' },
  actionRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: colors.border,
  },
  actionLabel: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500' },
  actionArrow: { color: colors.textMuted, fontSize: 20, fontWeight: '300' },
  deliveryHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    gap: spacing.md, marginBottom: 4,
  },
  deliveryEvent: { fontSize: fontSize.sm, fontWeight: '700', flex: 1 },
  deliveryDate: { color: colors.textMuted, fontSize: 10 },
  deliveryMeta: { color: colors.textSecondary, fontSize: fontSize.xs },
  deliveryError: { color: colors.error, fontSize: fontSize.xs, marginTop: 4 },
  empty: { color: colors.textMuted, fontSize: fontSize.sm, fontStyle: 'italic', textAlign: 'center', paddingVertical: spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: colors.error, fontSize: fontSize.md, textAlign: 'center' },
});