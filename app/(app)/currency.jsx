import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { currencyApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function CurrencyScreen() {
  const [available, setAvailable] = useState([]);
  const [supported, setSupported] = useState([]);
  const [defaultCurrency, setDefaultCurrency] = useState('EUR');
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadAll = async () => {
    try {
      setError('');
      const [list, config, ratesData] = await Promise.all([
        currencyApi.list().catch(() => ({ available: [], supported: [], default: 'EUR' })),
        currencyApi.config().catch(() => ({})),
        currencyApi.rates().catch(() => []),
      ]);
      setAvailable(list.available || []);
      setSupported(list.supported || []);
      setDefaultCurrency(list.default || 'EUR');
      setRates(Array.isArray(ratesData) ? ratesData : []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { loadAll(); }, []));

  const onRefresh = () => { setRefreshing(true); loadAll(); };

  const toggleCurrency = (code) => {
    if (code === 'EUR') return;
    if (supported.includes(code)) {
      setSupported(supported.filter((c) => c !== code));
    } else {
      setSupported([...supported, code]);
    }
  };

  const setDefault = (code) => {
    if (!supported.includes(code)) return;
    setDefaultCurrency(code);
  };

  const save = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await currencyApi.updateConfig({
        defaultCurrency,
        supportedCurrencies: supported.length > 0 ? supported : ['EUR'],
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

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Devises" showBack />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>
      </SafeAreaView>
    );
  }

  const activeSupported = supported.includes('EUR') ? supported : ['EUR', ...supported];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Devises" showBack />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
            tintColor={colors.accent} colors={[colors.accent]} />
        }
      >
        {!!error && (<View style={styles.errorBox}><Text style={styles.errorText}>⚠️ {error}</Text></View>)}
        {!!success && (<View style={styles.successBox}><Text style={styles.successText}>{success}</Text></View>)}

        <Card>
          <Text style={styles.hint}>
            Activez les devises dans lesquelles vous facturez. Chaque devis
            peut avoir sa propre devise. Les statistiques sont consolidées en
            EUR.
          </Text>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Devises supportées</Text>
          {available.map((c) => {
            const isSupported = activeSupported.includes(c.code);
            const isDefault = defaultCurrency === c.code;
            return (
              <View key={c.code} style={styles.currencyRow}>
                <TouchableOpacity
                  style={styles.currencyLeft}
                  onPress={() => toggleCurrency(c.code)}
                  disabled={c.code === 'EUR'}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, isSupported && styles.checkboxOn]}>
                    {isSupported && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.currencyCode}>
                      {c.code} {c.code === 'EUR' && '(obligatoire)'}
                    </Text>
                    <Text style={styles.currencyLabel}>{c.label}</Text>
                  </View>
                </TouchableOpacity>

                {isSupported && (
                  <TouchableOpacity
                    style={[styles.defaultBtn, isDefault && styles.defaultBtnActive]}
                    onPress={() => setDefault(c.code)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.defaultBtnText, isDefault && styles.defaultBtnTextActive]}>
                      {isDefault ? '★ Défaut' : 'Définir défaut'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </Card>

        {rates.length > 0 && (
          <Card>
            <Text style={styles.sectionTitle}>Taux de change actuels</Text>
            {rates.map((r, i) => (
              <View key={i} style={styles.rateRow}>
                <Text style={styles.rateLabel}>
                  {r.base_currency || r.base} → {r.target_currency || r.target}
                </Text>
                <Text style={styles.rateValue}>
                  {Number(r.rate || 0).toFixed(4)}
                </Text>
              </View>
            ))}
            <Text style={styles.ratesHint}>
              Mis à jour automatiquement. Utilisés pour convertir dans la devise par défaut.
            </Text>
          </Card>
        )}

        <Button
          title={saving ? 'Enregistrement...' : '💾 Enregistrer'}
          onPress={save}
          disabled={saving}
          loading={saving}
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
  currencyRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  currencyLeft: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2,
    borderColor: colors.borderLight, alignItems: 'center', justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '800' },
  currencyCode: { color: colors.text, fontSize: fontSize.sm, fontWeight: '700' },
  currencyLabel: { color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2 },
  defaultBtn: {
    paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.borderLight, backgroundColor: colors.bgCard,
  },
  defaultBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  defaultBtnText: { color: colors.textSecondary, fontSize: 10, fontWeight: '700' },
  defaultBtnTextActive: { color: '#0b1120' },
  rateRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 6, gap: spacing.md,
  },
  rateLabel: { color: colors.textSecondary, fontSize: fontSize.sm },
  rateValue: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600' },
  ratesHint: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: spacing.md, fontStyle: 'italic' },
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