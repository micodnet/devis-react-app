import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity,
  RefreshControl, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { settingsApi, peppolApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';

const SCHEMES = [
  { value: '0208', label: '0208 — Belgique (BCE/TVA)' },
  { value: '0009', label: '0009 — France (SIRET)' },
  { value: '0106', label: '0106 — Pays-Bas (KVK)' },
  { value: '9930', label: '9930 — Allemagne (VAT)' },
];

export default function PeppolSettingsScreen() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadConfig = async () => {
    try {
      setError('');
      const s = await settingsApi.get();
      setConfig(s);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadConfig();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadConfig();
  };

  const update = (key, value) => setConfig((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await settingsApi.update({
        ...config,
        peppolEnabled: config.peppolEnabled,
        peppolApiKey: config.peppolApiKey || '',
        peppolLegalEntityId: config.peppolLegalEntityId || '',
        peppolSchemeId: config.peppolSchemeId || '0208',
      });
      setSuccess('Configuration Peppol enregistrée ✅');
      setTimeout(() => setSuccess(''), 3000);
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
      const res = await peppolApi.test();
      if (res.success) {
        setTestResult('✅ Connexion Peppol opérationnelle');
      } else {
        setTestResult('❌ ' + (res.error || 'Erreur'));
      }
    } catch (err) {
      setTestResult('❌ ' + (err.response?.data?.error || err.message));
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Peppol" showBack />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Peppol" showBack />
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
          <Text style={styles.hint}>
            Peppol est le réseau d'échange de factures électroniques B2B.
            Obligatoire en Belgique depuis janvier 2026. Créez un compte sur
            Storecove pour obtenir une clé API.
          </Text>
        </Card>

        <Card>
          <TouchableOpacity style={styles.checkboxRow}
            onPress={() => update('peppolEnabled', !config.peppolEnabled)} activeOpacity={0.7}>
            <View style={[styles.checkbox, config.peppolEnabled && styles.checkboxOn]}>
              {config.peppolEnabled && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Activer l'envoi Peppol</Text>
          </TouchableOpacity>
        </Card>

        {config.peppolEnabled && (
          <Card>
            <Text style={styles.sectionTitle}>Configuration</Text>
            <Input label="Clé API Storecove" value={config.peppolApiKey || ''}
              onChangeText={(v) => update('peppolApiKey', v)}
              placeholder="sk_live_..." secureTextEntry />
            <Input label="Legal Entity ID" value={config.peppolLegalEntityId || ''}
              onChangeText={(v) => update('peppolLegalEntityId', v)}
              placeholder="Fourni par Storecove" />

            <Text style={styles.fieldLabel}>Schéma d'identification</Text>
            {SCHEMES.map((s) => {
              const active = (config.peppolSchemeId || '0208') === s.value;
              return (
                <TouchableOpacity key={s.value} style={styles.optionRow}
                  onPress={() => update('peppolSchemeId', s.value)} activeOpacity={0.7}>
                  <View style={[styles.radio, active && styles.radioActive]}>
                    {active && <View style={styles.radioDot} />}
                  </View>
                  <Text style={styles.optionLabel}>{s.label}</Text>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity style={styles.testBtn}
              onPress={test} disabled={testing} activeOpacity={0.7}>
              <Text style={styles.testBtnText}>
                {testing ? 'Test...' : '🔌 Tester la connexion'}
              </Text>
            </TouchableOpacity>

            {!!testResult && (
              <View style={styles.testResultBox}>
                <Text style={styles.testResultText}>{testResult}</Text>
              </View>
            )}
          </Card>
        )}

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
  hint: { color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 20 },
  fieldLabel: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600', marginTop: spacing.md, marginBottom: spacing.sm },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: colors.borderLight, alignItems: 'center', justifyContent: 'center' },
  checkboxOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '800' },
  checkboxLabel: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500', flex: 1 },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.borderLight, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: colors.accent },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent },
  optionLabel: { color: colors.text, fontSize: fontSize.sm },
  testBtn: {
    marginTop: spacing.lg, paddingVertical: 12,
    borderRadius: radius.full, backgroundColor: colors.bgInput,
    borderWidth: 1, borderColor: colors.borderLight, alignItems: 'center',
  },
  testBtnText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600' },
  testResultBox: {
    padding: spacing.md, borderRadius: radius.md, marginTop: spacing.md,
    backgroundColor: 'rgba(59,130,246,0.12)', borderWidth: 1, borderColor: 'rgba(59,130,246,0.35)',
  },
  testResultText: { color: '#3b82f6', fontSize: fontSize.sm, textAlign: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.35)', borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg },
  errorText: { color: colors.error, fontSize: fontSize.sm },
  successBox: { backgroundColor: 'rgba(16,185,129,0.12)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.35)', borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg },
  successText: { color: colors.success, fontSize: fontSize.sm },
});