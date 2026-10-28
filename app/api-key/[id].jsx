import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { apiKeysApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';

const SCOPE_LABELS = { read: 'Lecture', write: 'Écriture', admin: 'Admin' };

export default function ApiKeyDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [key, setKey] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/api-keys');
  };

  useEffect(() => { loadAll(); }, [id]);

  const loadAll = async () => {
    try {
      setError('');
      const [keys, allLogs] = await Promise.all([
        apiKeysApi.list().catch(() => []),
        apiKeysApi.logs(200).catch(() => []),
      ]);
      const found = (keys || []).find((k) => String(k.id) === String(id));
      setKey(found || null);
      // Filtrer les logs pour cette clé
      setLogs((allLogs || []).filter((l) => String(l.apiKeyId || l.api_key_id) === String(id)));
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const revoke = () => {
    Alert.alert('Révoquer', 'Révoquer cette clé ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Révoquer', style: 'destructive',
        onPress: async () => {
          try {
            await apiKeysApi.revoke(id);
            Alert.alert('Succès', 'Clé révoquée');
            await loadAll();
          } catch (err) { Alert.alert('Erreur', err.response?.data?.error || err.message); }
        },
      },
    ]);
  };

  const remove = () => {
    Alert.alert('Supprimer', 'Action irréversible. Confirmer ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          try {
            await apiKeysApi.remove(id);
            router.replace('/(app)/api-keys');
          } catch (err) { Alert.alert('Erreur', err.response?.data?.error || err.message); }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Clé API" showBack />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>
      </SafeAreaView>
    );
  }

  if (error || !key) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Clé API" showBack />
        <View style={styles.center}>
          <Text style={styles.errorText}>⚠️ {error || 'Introuvable'}</Text>
          <Button title="Retour" onPress={handleBack} variant="secondary" />
        </View>
      </SafeAreaView>
    );
  }

  const isActive = key.active && !key.revokedAt;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title={key.name} showBack />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card>
          <Text style={styles.sectionTitle}>Informations</Text>
          <Row label="Nom" value={key.name} />
          <Row label="Préfixe" value={key.prefix + '…'} />
          <Row label="Statut" value={isActive ? 'Active' : 'Révoquée'} />
          <Row label="Rate limit" value={`${key.rateLimit}/h`} />
          <Row label="Créée le" value={new Date(key.createdAt).toLocaleDateString('fr-FR')} />
          <Row label="Dernière utilisation" value={
            key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleString('fr-FR') : 'Jamais'
          } />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Permissions</Text>
          <View style={styles.tagsRow}>
            {(key.scopes || []).map((s) => (
              <View key={s} style={styles.tag}>
                <Text style={styles.tagText}>{SCOPE_LABELS[s] || s}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Actions</Text>
          {isActive && (
            <TouchableOpacity style={styles.actionRow} onPress={revoke} activeOpacity={0.7}>
              <Text style={[styles.actionLabel, { color: colors.warning }]}>🚫 Révoquer</Text>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.actionRow} onPress={remove} activeOpacity={0.7}>
            <Text style={[styles.actionLabel, { color: colors.error }]}>🗑 Supprimer</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </Card>

        <Text style={styles.sectionTitleOutside}>Appels récents ({logs.length})</Text>
        {logs.length === 0 ? (
          <Card><Text style={styles.empty}>Aucun appel enregistré.</Text></Card>
        ) : (
          logs.slice(0, 50).map((log) => {
            const isError = log.statusCode >= 400;
            return (
              <Card key={log.id} style={{ borderLeftWidth: 4, borderLeftColor: isError ? colors.error : colors.success }}>
                <View style={styles.logRow}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.logEndpoint} numberOfLines={1}>
                      <Text style={styles.logMethod}>{log.method}</Text> {log.endpoint}
                    </Text>
                    <Text style={styles.logDate}>
                      {new Date(log.createdAt).toLocaleString('fr-FR')} · {log.ipAddress || '—'}
                    </Text>
                    {log.durationMs ? (
                      <Text style={styles.logMeta}>Durée : {log.durationMs}ms</Text>
                    ) : null}
                    {log.errorMessage ? (
                      <Text style={styles.logError} numberOfLines={2}>{log.errorMessage}</Text>
                    ) : null}
                  </View>
                  <Text style={[styles.logStatus, { color: isError ? colors.error : colors.success }]}>
                    {log.statusCode}
                  </Text>
                </View>
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
  logRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  logEndpoint: { color: colors.text, fontSize: fontSize.xs, fontFamily: 'monospace' },
  logMethod: { color: colors.accent, fontWeight: '700' },
  logDate: { color: colors.textMuted, fontSize: 10, marginTop: 2 },
  logMeta: { color: colors.textSecondary, fontSize: 10, marginTop: 2 },
  logError: { color: colors.error, fontSize: 10, marginTop: 2 },
  logStatus: { fontSize: fontSize.sm, fontWeight: '800' },
  empty: { color: colors.textMuted, fontSize: fontSize.sm, fontStyle: 'italic', textAlign: 'center', paddingVertical: spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorText: { color: colors.error, fontSize: fontSize.md, textAlign: 'center', marginBottom: spacing.lg },
});