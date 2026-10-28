import { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { pushApi } from '../../lib/api';
import { registerDevice } from '../../lib/notifications';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function NotificationsScreen() {
  const router = useRouter();

  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [permissionStatus, setPermissionStatus] = useState('unknown');

  const loadDevices = async () => {
    try {
      setError('');
      const data = await pushApi.subscriptions();
      setDevices(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDevices();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadDevices();
  };

  const handleEnable = async () => {
    setError('');
    setSuccess('');
    setRegistering(true);
    try {
      const result = await registerDevice();
      if (result.success) {
        setSuccess('Notifications activées ✅');
        setPermissionStatus('granted');
        await loadDevices();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        if (result.reason === 'denied') {
          setError('Permission refusée. Activez les notifications dans les réglages de votre téléphone.');
        } else if (result.reason === 'physical_device_required') {
          setError('Les notifications nécessitent un appareil physique (pas un émulateur).');
        } else {
          setError('Impossible d\'activer les notifications.');
        }
      }
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'activation.');
    } finally {
      setRegistering(false);
    }
  };

  const handleTest = async () => {
    setError('');
    setSuccess('');
    setTesting(true);
    try {
      const res = await pushApi.test();
      if (res.sent > 0) {
        setSuccess(`Notification de test envoyée à ${res.sent} appareil(s).`);
      } else {
        setSuccess('Aucun appareil n\'a reçu la notification.');
      }
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur d\'envoi.');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Notifications" showBack />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Notifications" showBack />
      <ScrollView
        contentContainerStyle={styles.scroll}
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
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}
        {!!success && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>{success}</Text>
          </View>
        )}

        <Card>
          <Text style={styles.sectionTitle}>🔔 Statut</Text>
          {devices.length > 0 ? (
            <>
              <Text style={styles.statusOk}>
                ✅ {devices.length} appareil(s) abonné(s)
              </Text>
              <Text style={styles.hint}>
                Vous recevrez les notifications (devis signés, paiements reçus,
                etc.) sur ces appareils.
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.statusOff}>
                ○ Notifications non configurées
              </Text>
              <Text style={styles.hint}>
                Activez les notifications pour recevoir une alerte quand un
                client signe un devis ou paie une facture.
              </Text>
            </>
          )}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Actions</Text>
          <Button
            title={
              registering ? 'Activation...' : '🔔 Activer les notifications'
            }
            onPress={handleEnable}
            disabled={registering}
            loading={registering}
          />
          {devices.length > 0 && (
            <>
              <View style={{ height: spacing.md }} />
              <Button
                title={testing ? 'Envoi...' : '🧪 Envoyer une notification de test'}
                onPress={handleTest}
                disabled={testing}
                loading={testing}
                variant="secondary"
              />
            </>
          )}
        </Card>

        {devices.length > 0 && (
          <Card>
            <Text style={styles.sectionTitle}>
              📱 Appareils abonnés ({devices.length})
            </Text>
            {devices.map((d, i) => (
              <View key={i} style={styles.deviceRow}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.deviceLabel} numberOfLines={1}>
                    {d.device_label || d.deviceLabel || 'Appareil'}
                  </Text>
                  <Text style={styles.deviceMeta} numberOfLines={1}>
                    {d.user_agent || d.userAgent || ''}
                  </Text>
                  <Text style={styles.deviceDate}>
                    Abonné le{' '}
                    {new Date(d.created_at || d.createdAt).toLocaleDateString(
                      'fr-FR'
                    )}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        )}

        <Card>
          <Text style={styles.sectionTitle}>❓ Comment ça marche ?</Text>
          <Text style={styles.hint}>
            Quand un client signe un devis, paie une facture, ou vous envoie un
            message, vous recevez une notification push sur votre téléphone.
            {'\n\n'}
            Les notifications sont envoyées par votre backend Devis Express Pro.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  statusOk: {
    color: colors.success,
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  statusOff: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  hint: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    lineHeight: 18,
  },
  deviceRow: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  deviceLabel: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  deviceMeta: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  deviceDate: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: { color: colors.error, fontSize: fontSize.sm },
  successBox: {
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.35)',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  successText: { color: colors.success, fontSize: fontSize.sm },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
});