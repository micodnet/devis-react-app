import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity,
  RefreshControl, Alert, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { smsApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function SmsScreen() {
  const [config, setConfig] = useState(null);
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [testResult, setTestResult] = useState('');

  const loadAll = async () => {
    try {
      setError('');
      const [cfg, st, lg] = await Promise.all([
        smsApi.config().catch(() => ({})),
        smsApi.stats().catch(() => ({})),
        smsApi.logs(50).catch(() => []),
      ]);
      setConfig(cfg);
      setStats(st);
      setLogs(Array.isArray(lg) ? lg : []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadAll();
  };

  const update = (key, value) => setConfig((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await smsApi.updateConfig({
        enabled: config.enabled,
        accountSid: config.accountSid || '',
        authToken: config.authToken || '',
        fromNumber: config.fromNumber || '',
        notifySignature: config.notifySignature,
        ownerPhone: config.ownerPhone || '',
        templateQuote: config.templateQuote || '',
        templateReminder: config.templateReminder || '',
        templateAppointment: config.templateAppointment || '',
      });
      setSuccess('Configuration enregistrée ✅');
      setTimeout(() => setSuccess(''), 3000);
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const test = async () => {
    if (!config?.ownerPhone) {
      Alert.alert('Info', 'Renseignez votre numéro de téléphone d\'abord.');
      return;
    }
    setTesting(true);
    setTestResult('');
    try {
      const res = await smsApi.test(config.ownerPhone);
      setTestResult('✅ SMS envoyé (ID : ' + (res.messageId || 'n/a') + ')');
      await loadAll();
    } catch (err) {
      setTestResult('❌ ' + (err.response?.data?.error || err.message));
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="SMS" showBack />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="SMS" showBack />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
            tintColor={colors.accent} colors={[colors.accent]} />
        }
      >
        {!!error && (<View style={styles.errorBox}><Text style={styles.errorText}>⚠️ {error}</Text></View>)}
        {!!success && (<View style={styles.successBox}><Text style={styles.successText}>{success}</Text></View>)}

        <Card>
          <TouchableOpacity style={styles.checkboxRow}
            onPress={() => update('enabled', !config.enabled)} activeOpacity={0.7}>
            <View style={[styles.checkbox, config.enabled && styles.checkboxOn]}>
              {config.enabled && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Activer l'envoi de SMS</Text>
          </TouchableOpacity>
        </Card>

        {config.enabled && (
          <>
            <Card>
              <Text style={styles.sectionTitle}>🔧 Configuration Twilio</Text>
              <Input label="Account SID" value={config.accountSid || ''}
                onChangeText={(v) => update('accountSid', v)} placeholder="ACxxxxx..." />
              <Input label="Auth Token" value={config.authToken || ''}
                onChangeText={(v) => update('authToken', v)}
                placeholder={config.hasAuthToken ? 'Laisser vide pour conserver' : 'Votre auth token'}
                secureTextEntry />
              <Input label="Numéro expéditeur (+32...)" value={config.fromNumber || ''}
                onChangeText={(v) => update('fromNumber', v)} keyboardType="phone-pad" />
              <Input label="Votre numéro (notifications)" value={config.ownerPhone || ''}
                onChangeText={(v) => update('ownerPhone', v)} keyboardType="phone-pad" />

              <TouchableOpacity style={styles.checkboxRow}
                onPress={() => update('notifySignature', !config.notifySignature)} activeOpacity={0.7}>
                <View style={[styles.checkbox, config.notifySignature && styles.checkboxOn]}>
                  {config.notifySignature && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>SMS quand un client signe un devis</Text>
              </TouchableOpacity>
            </Card>

            <Card>
              <Text style={styles.sectionTitle}>📝 Modèles de SMS</Text>
              <Text style={styles.hint}>
                Variables : {'{client}'}, {'{quoteNumber}'}, {'{invoiceNumber}'}, {'{total}'}, {'{amount}'}, {'{link}'}, {'{company}'}, {'{date}'}, {'{time}'}
              </Text>
              <Input label="Envoi de devis" value={config.templateQuote || ''}
                onChangeText={(v) => update('templateQuote', v)} multiline />
              <Input label="Relance impayé" value={config.templateReminder || ''}
                onChangeText={(v) => update('templateReminder', v)} multiline />
              <Input label="Rappel RDV" value={config.templateAppointment || ''}
                onChangeText={(v) => update('templateAppointment', v)} multiline />
            </Card>

            <View style={styles.actionsRow}>
              <TouchableOpacity style={[styles.actionBtn, styles.actionSecondary]}
                onPress={test} disabled={testing} activeOpacity={0.7}>
                <Text style={styles.actionSecondaryText}>
                  {testing ? 'Envoi...' : '🧪 Test SMS'}
                </Text>
              </TouchableOpacity>
            </View>

            {!!testResult && (
              <View style={styles.testResultBox}>
                <Text style={styles.testResultText}>{testResult}</Text>
              </View>
            )}
          </>
        )}

        <Card>
          <Text style={styles.sectionTitle}>📊 Statistiques</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{stats?.totalSent || 0}</Text>
              <Text style={styles.statLabel}>Envoyés</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{stats?.last30Days || 0}</Text>
              <Text style={styles.statLabel}>30 jours</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, stats?.failed > 0 && { color: colors.error }]}>
                {stats?.failed || 0}
              </Text>
              <Text style={styles.statLabel}>Échecs</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {(stats?.totalCost || 0).toFixed(2)} €
              </Text>
              <Text style={styles.statLabel}>Coût</Text>
            </View>
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>📜 Historique ({logs.length})</Text>
          {logs.length === 0 ? (
            <Text style={styles.empty}>Aucun SMS envoyé.</Text>
          ) : (
            logs.slice(0, 30).map((log) => {
              const isFailed = log.status === 'failed';
              return (
                <View key={log.id} style={styles.logRow}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.logNumber} numberOfLines={1}>
                      {log.toNumber}
                    </Text>
                    <Text style={styles.logBody} numberOfLines={2}>
                      {log.body}
                    </Text>
                    <Text style={styles.logDate}>
                      {new Date(log.createdAt).toLocaleString('fr-FR')}
                    </Text>
                  </View>
                  <Text style={[styles.logStatus, { color: isFailed ? colors.error : colors.success }]}>
                    {isFailed ? '✕' : '✓'}
                  </Text>
                </View>
              );
            })
          )}
        </Card>

        <Button
          title={saving ? 'Enregistrement...' : '💾 Enregistrer la configuration'}
          onPress={save} disabled={saving} loading={saving}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700', marginBottom: spacing.md },
  hint: { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 16, marginBottom: spacing.md, fontFamily: 'monospace' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: colors.borderLight, alignItems: 'center', justifyContent: 'center' },
  checkboxOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '800' },
  checkboxLabel: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500', flex: 1 },
  actionsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  actionBtn: { flex: 1, paddingVertical: 12, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', minHeight: 44 },
  actionSecondary: { backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.borderLight },
  actionSecondaryText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600' },
  testResultBox: {
    padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.md,
    backgroundColor: 'rgba(59,130,246,0.12)', borderWidth: 1, borderColor: 'rgba(59,130,246,0.35)',
  },
  testResultText: { color: '#3b82f6', fontSize: fontSize.sm, textAlign: 'center' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statBox: {
    flex: 1, minWidth: '45%', padding: spacing.md, borderRadius: radius.md,
    backgroundColor: colors.bgInput, alignItems: 'center',
  },
  statNumber: { color: colors.text, fontSize: fontSize.xl, fontWeight: '800' },
  statLabel: { color: colors.textMuted, fontSize: 10, textTransform: 'uppercase', marginTop: 4 },
  logRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md,
    paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  logNumber: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600' },
  logBody: { color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2 },
  logDate: { color: colors.textMuted, fontSize: 10, marginTop: 4 },
  logStatus: { fontSize: 18, fontWeight: '800' },
  empty: { color: colors.textMuted, fontSize: fontSize.sm, fontStyle: 'italic', textAlign: 'center', paddingVertical: spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)', borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.lg,
  },
  errorText: { color: colors.error, fontSize: fontSize.sm },
  successBox: {
    backgroundColor: 'rgba(16,185,129,0.12)', borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.35)', borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.lg,
  },
  successText: { color: colors.success, fontSize: fontSize.sm },
});