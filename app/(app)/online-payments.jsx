import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity,
  RefreshControl, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { onlinePaymentsApi, API_URL } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function OnlinePaymentsScreen() {
  const [config, setConfig] = useState(null);
  const [stats, setStats] = useState(null);
  const [payments, setPayments] = useState([]);
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
      const [cfg, st, list] = await Promise.all([
        onlinePaymentsApi.config().catch(() => ({})),
        onlinePaymentsApi.stats().catch(() => ({})),
        onlinePaymentsApi.list(50).catch(() => []),
      ]);
      setConfig(cfg);
      setStats(st);
      setPayments(Array.isArray(list) ? list : []);
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
      await onlinePaymentsApi.updateConfig({
        enabled: config.enabled,
        publicKey: config.publicKey || '',
        secretKey: config.secretKey || '',
        webhookSecret: config.webhookSecret || '',
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
    setTesting(true);
    setTestResult('');
    try {
      const res = await onlinePaymentsApi.test();
      setTestResult('✅ Connexion Stripe OK (compte : ' + res.accountId + ')');
    } catch (err) {
      setTestResult('❌ ' + (err.response?.data?.error || err.message));
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Paiements en ligne" showBack />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>
      </SafeAreaView>
    );
  }

  const fmtMoney = (n) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency', currency: 'EUR', minimumFractionDigits: 2,
    }).format(n || 0);

  const webhookUrl = `${API_URL}/api/stripe-webhooks/events`;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Paiements en ligne" showBack />
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
            <Text style={styles.checkboxLabel}>Activer les paiements en ligne (Stripe)</Text>
          </TouchableOpacity>
        </Card>

        {config.enabled && (
          <Card>
            <Text style={styles.sectionTitle}>🔑 Configuration Stripe</Text>
            <Input label="Clé publique" value={config.publicKey || ''}
              onChangeText={(v) => update('publicKey', v)} placeholder="pk_test_..." />
            <Input label="Clé secrète" value={config.secretKey || ''}
              onChangeText={(v) => update('secretKey', v)}
              placeholder={config.hasSecretKey ? 'Laisser vide pour conserver' : 'sk_test_...'}
              secureTextEntry />
            <Input label="Webhook secret" value={config.webhookSecret || ''}
              onChangeText={(v) => update('webhookSecret', v)}
              placeholder={config.hasWebhookSecret ? 'Laisser vide' : 'whsec_...'}
              secureTextEntry />

            <Text style={styles.webhookHint}>
              URL webhook : {webhookUrl}
            </Text>

            <TouchableOpacity style={styles.actionBtn}
              onPress={test} disabled={testing} activeOpacity={0.7}>
              <Text style={styles.actionBtnText}>
                {testing ? 'Test...' : '🧪 Tester la connexion'}
              </Text>
            </TouchableOpacity>

            {!!testResult && (
              <View style={styles.testResultBox}>
                <Text style={styles.testResultText}>{testResult}</Text>
              </View>
            )}
          </Card>
        )}

        <Card>
          <Text style={styles.sectionTitle}>📊 Statistiques</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{stats?.paidTotal || 0}</Text>
              <Text style={styles.statLabel}>Paiements</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{fmtMoney(stats?.paidAmount)}</Text>
              <Text style={styles.statLabel}>Encaissé</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{stats?.last30Days || 0}</Text>
              <Text style={styles.statLabel}>30 jours</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, stats?.pending > 0 && { color: colors.warning }]}>
                {stats?.pending || 0}
              </Text>
              <Text style={styles.statLabel}>En attente</Text>
            </View>
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>💳 Historique ({payments.length})</Text>
          {payments.length === 0 ? (
            <Text style={styles.empty}>Aucun paiement en ligne.</Text>
          ) : (
            payments.slice(0, 30).map((p) => {
              const statusColor =
                p.status === 'paid' ? colors.success :
                p.status === 'pending' ? colors.warning :
                p.status === 'failed' ? colors.error : colors.textMuted;
              const statusLabel =
                p.status === 'paid' ? 'Payé' :
                p.status === 'pending' ? 'En attente' :
                p.status === 'expired' ? 'Expiré' :
                p.status === 'failed' ? 'Échec' : p.status;
              return (
                <View key={p.id} style={styles.paymentRow}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.paymentInvoice} numberOfLines={1}>
                      {p.invoiceNumber || '—'}
                    </Text>
                    <Text style={styles.paymentEmail} numberOfLines={1}>
                      {p.customerEmail || '—'}
                    </Text>
                    <Text style={styles.paymentDate}>
                      {new Date(p.paidAt || p.createdAt).toLocaleString('fr-FR')}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.paymentAmount}>{fmtMoney(p.amount)}</Text>
                    <Text style={[styles.paymentStatus, { color: statusColor }]}>
                      {statusLabel}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </Card>

        <Button
          title={saving ? 'Enregistrement...' : '💾 Enregistrer'}
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
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: colors.borderLight, alignItems: 'center', justifyContent: 'center' },
  checkboxOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '800' },
  checkboxLabel: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500', flex: 1 },
  webhookHint: {
    color: colors.textMuted, fontSize: fontSize.xs,
    fontFamily: 'monospace', marginVertical: spacing.md,
  },
  actionBtn: {
    paddingVertical: 12, borderRadius: radius.full,
    backgroundColor: colors.bgInput, borderWidth: 1,
    borderColor: colors.borderLight, alignItems: 'center',
  },
  actionBtnText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600' },
  testResultBox: {
    padding: spacing.md, borderRadius: radius.md, marginTop: spacing.md,
    backgroundColor: 'rgba(59,130,246,0.12)', borderWidth: 1, borderColor: 'rgba(59,130,246,0.35)',
  },
  testResultText: { color: '#3b82f6', fontSize: fontSize.sm, textAlign: 'center' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statBox: {
    flex: 1, minWidth: '45%', padding: spacing.md,
    borderRadius: radius.md, backgroundColor: colors.bgInput, alignItems: 'center',
  },
  statNumber: { color: colors.text, fontSize: fontSize.lg, fontWeight: '800' },
  statLabel: { color: colors.textMuted, fontSize: 10, textTransform: 'uppercase', marginTop: 4 },
  paymentRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md,
    paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  paymentInvoice: { color: colors.accent, fontSize: fontSize.sm, fontWeight: '600' },
  paymentEmail: { color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2 },
  paymentDate: { color: colors.textMuted, fontSize: 10, marginTop: 4 },
  paymentAmount: { color: colors.text, fontSize: fontSize.sm, fontWeight: '700' },
  paymentStatus: { fontSize: 10, fontWeight: '700', marginTop: 4 },
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