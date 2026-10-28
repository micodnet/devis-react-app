import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  TouchableOpacity, Alert, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { appointmentsApi, API_URL } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import * as Clipboard from 'expo-clipboard';

export default function BookingSettingsScreen() {
  const { user } = useAuth();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadConfig = async () => {
    try {
      setError('');
      const data = await appointmentsApi.config();
      setConfig(data);
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

  const update = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await appointmentsApi.updateConfig({
        enabled: config.enabled,
        slug: config.slug || '',
        duration: parseInt(config.duration) || 60,
        bufferMinutes: parseInt(config.bufferMinutes) || 15,
        daysAhead: parseInt(config.daysAhead) || 60,
        message: config.message || '',
        notifyEmail: config.notifyEmail,
        notifySms: config.notifySms,
      });
      setSuccess('Paramètres enregistrés ✅');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const copyLink = async () => {
    const url = config?.slug
      ? `${API_URL}/booking.html?u=${encodeURIComponent(config.slug)}`
      : `${API_URL}/booking.html?user=${user?.id || ''}`;
    try {
      await Clipboard.setStringAsync(url);
      Alert.alert('Lien copié', url);
    } catch (err) {
      Alert.alert('Lien', url);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Config booking" showBack />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  const bookingUrl = config?.slug
    ? `${API_URL}/booking.html?u=${encodeURIComponent(config.slug)}`
    : `${API_URL}/booking.html?user=${user?.id || ''}`;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Config booking" showBack />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        {!!error && (
          <View style={styles.errorBox}><Text style={styles.errorText}>⚠️ {error}</Text></View>
        )}
        {!!success && (
          <View style={styles.successBox}><Text style={styles.successText}>{success}</Text></View>
        )}

        <Card>
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => update('enabled', !config.enabled)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, config.enabled && styles.checkboxOn]}>
              {config.enabled && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Activer la prise de RDV en ligne</Text>
          </TouchableOpacity>
        </Card>

        {config.enabled && (
          <Card>
            <Text style={styles.sectionTitle}>Lien public</Text>
            <Text style={styles.linkText} numberOfLines={2}>
              {bookingUrl}
            </Text>
            <Button
              title="📋 Copier le lien"
              onPress={copyLink}
              variant="secondary"
            />
          </Card>
        )}

        <Card>
          <Text style={styles.sectionTitle}>Configuration</Text>
          <Input
            label="Slug personnalisé (URL courte)"
            value={config.slug || ''}
            onChangeText={(v) => update('slug', v)}
            placeholder="mon-entreprise"
          />
          <Input
            label="Durée d'un RDV (min)"
            value={String(config.duration || 60)}
            onChangeText={(v) => update('duration', v)}
            keyboardType="numeric"
          />
          <Input
            label="Battement entre 2 RDV (min)"
            value={String(config.bufferMinutes || 15)}
            onChangeText={(v) => update('bufferMinutes', v)}
            keyboardType="numeric"
          />
          <Input
            label="Jours à afficher"
            value={String(config.daysAhead || 60)}
            onChangeText={(v) => update('daysAhead', v)}
            keyboardType="numeric"
          />
          <Input
            label="Message d'accueil"
            value={config.message || ''}
            onChangeText={(v) => update('message', v)}
            multiline
          />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => update('notifyEmail', !config.notifyEmail)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, config.notifyEmail && styles.checkboxOn]}>
              {config.notifyEmail && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Recevoir un email quand un client réserve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => update('notifySms', !config.notifySms)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, config.notifySms && styles.checkboxOn]}>
              {config.notifySms && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Recevoir un SMS</Text>
          </TouchableOpacity>
        </Card>

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
  linkText: {
    color: colors.accent, fontSize: fontSize.xs,
    fontFamily: 'monospace', marginBottom: spacing.md,
  },
  checkboxRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: spacing.md, paddingVertical: spacing.sm,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2,
    borderColor: colors.borderLight, alignItems: 'center', justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '800' },
  checkboxLabel: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500', flex: 1 },
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