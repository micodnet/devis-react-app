import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  TouchableOpacity, Alert, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { onboardingApi, demoApi } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function DemoScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [onboarding, setOnboarding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [working, setWorking] = useState(false);

  const loadAll = async () => {
    try {
      setError('');
      const o = await onboardingApi.get();
      setOnboarding(o);
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

  const resetOnboarding = async () => {
    Alert.alert(
      'Réinitialiser',
      'Relancer la visite guidée et l\'onboarding ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réinitialiser',
          style: 'destructive',
          onPress: async () => {
            setWorking(true);
            try {
              await onboardingApi.reset();
              Alert.alert('Succès', 'Onboarding réinitialisé');
              await loadAll();
            } catch (err) {
              Alert.alert('Erreur', err.response?.data?.error || err.message);
            } finally {
              setWorking(false);
            }
          },
        },
      ]
    );
  };

  const startDemo = async () => {
    Alert.alert(
      'Démarrer une démo',
      'Créer un compte démo de 30 minutes ? Vous serez déconnecté et redirigé.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Démarrer',
          onPress: async () => {
            setWorking(true);
            try {
              const res = await demoApi.start();
              Alert.alert('Info', `Compte démo créé : ${res.user?.email || 'N/A'}\nToken expirant dans 30 min.`);
            } catch (err) {
              Alert.alert('Erreur', err.response?.data?.error || err.message);
            } finally {
              setWorking(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Démo & Onboarding" showBack />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>
      </SafeAreaView>
    );
  }

  const completed = onboarding?.completedSteps || [];
  const total = onboarding?.totalSteps || 3;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Démo & Onboarding" showBack />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
            tintColor={colors.accent} colors={[colors.accent]} />
        }
      >
        {!!error && (<View style={styles.errorBox}><Text style={styles.errorText}>⚠️ {error}</Text></View>)}

        <Card>
          <Text style={styles.sectionTitle}>🎓 Progression</Text>
          <Text style={styles.progress}>
            {completed.length} / {total} étapes complétées
          </Text>
          {onboarding?.steps?.map((step) => {
            const done = completed.includes(step.key);
            return (
              <View key={step.key} style={styles.stepRow}>
                <View style={[styles.stepCircle, done && styles.stepCircleDone]}>
                  <Text style={[styles.stepCircleText, done && styles.stepCircleTextDone]}>
                    {done ? '✓' : '○'}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.stepTitle, done && styles.stepTitleDone]}>
                    {step.title}
                  </Text>
                  <Text style={styles.stepDesc}>{step.description}</Text>
                </View>
              </View>
            );
          })}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>🔧 Actions</Text>

          <TouchableOpacity style={styles.actionBtn}
            onPress={resetOnboarding} disabled={working} activeOpacity={0.7}>
            <Text style={styles.actionBtnText}>
              🔄 Réinitialiser l'onboarding
            </Text>
          </TouchableOpacity>

          <View style={{ height: spacing.md }} />

          <TouchableOpacity style={styles.actionBtn}
            onPress={startDemo} disabled={working} activeOpacity={0.7}>
            <Text style={styles.actionBtnText}>
              🎬 Démarrer une démo (30 min)
            </Text>
          </TouchableOpacity>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>ℹ️ À propos</Text>
          <Text style={styles.hint}>
            • <Text style={styles.bold}>Onboarding</Text> : checklist et visite
            guidée pour vous accompagner dans la prise en main de l'application.
            {'\n\n'}
            • <Text style={styles.bold}>Mode démo</Text> : crée un compte
            temporaire avec des données d'exemple pendant 30 minutes.
            Attention, cela vous déconnectera de votre compte actuel.
          </Text>
        </Card>

        {user?.isDemo && (
          <Card style={styles.demoBanner}>
            <Text style={styles.demoBannerTitle}>🎬 Vous êtes en mode démo</Text>
            <Text style={styles.demoBannerText}>
              Votre session expire le{' '}
              {new Date(user.demoExpiresAt).toLocaleString('fr-FR')}
            </Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700', marginBottom: spacing.md },
  progress: { color: colors.accent, fontSize: fontSize.sm, fontWeight: '700', marginBottom: spacing.lg },
  stepRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md,
    paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  stepCircle: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 2, borderColor: colors.borderLight,
    alignItems: 'center', justifyContent: 'center',
  },
  stepCircleDone: { backgroundColor: 'rgba(34,197,94,0.15)', borderColor: colors.success },
  stepCircleText: { color: colors.textMuted, fontSize: 14, fontWeight: '800' },
  stepCircleTextDone: { color: colors.success },
  stepTitle: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600' },
  stepTitleDone: { color: colors.success, textDecorationLine: 'line-through' },
  stepDesc: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2, lineHeight: 16 },
  actionBtn: {
    paddingVertical: 14, borderRadius: radius.full,
    backgroundColor: colors.bgInput, borderWidth: 1,
    borderColor: colors.borderLight, alignItems: 'center',
  },
  actionBtnText: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600' },
  hint: { color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 20 },
  bold: { color: colors.text, fontWeight: '700' },
  demoBanner: {
    borderColor: colors.warning, borderWidth: 2,
    backgroundColor: 'rgba(234,179,8,0.08)',
  },
  demoBannerTitle: { color: colors.warning, fontSize: fontSize.md, fontWeight: '800', marginBottom: spacing.sm },
  demoBannerText: { color: colors.textSecondary, fontSize: fontSize.sm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)', borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.lg,
  },
  errorText: { color: colors.error, fontSize: fontSize.sm },
});