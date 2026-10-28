import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  RefreshControl, TouchableOpacity, Alert, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { subscriptionApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';

const PLANS = [
  { key: 'starter', name: 'Starter', price: '19€', features: ['50 devis/mois', 'Catalogue', 'Carnet clients', 'Envoi email', 'TVA'] },
  { key: 'pro', name: 'Pro', price: '49€', features: ['200 devis/mois', 'Tout Starter', 'Stats avancées'], popular: true },
  { key: 'entreprise', name: 'Entreprise', price: '99€', features: ['Devis illimités', 'Tout Pro', 'Support dédié'] },
];

export default function SubscriptionScreen() {
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [working, setWorking] = useState(false);

  const loadSub = async () => {
    try {
      setError('');
      const data = await subscriptionApi.get();
      setSub(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSub();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadSub();
  };

  const startCheckout = async (plan) => {
    setWorking(true);
    try {
      const res = await subscriptionApi.checkout(plan);
      if (res.url) {
        await Linking.openURL(res.url);
      }
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || err.message);
    } finally {
      setWorking(false);
    }
  };

  const openPortal = async () => {
    setWorking(true);
    try {
      const res = await subscriptionApi.portal();
      if (res.url) await Linking.openURL(res.url);
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || err.message);
    } finally {
      setWorking(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Abonnement" showBack />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>
      </SafeAreaView>
    );
  }

  const planNames = { free: 'Free', starter: 'Starter', pro: 'Pro', entreprise: 'Entreprise' };
  const planName = planNames[sub?.plan] || 'Free';
  const limits = { free: 3, starter: 50, pro: 200, entreprise: 'illimité' };
  const limit = limits[sub?.plan] || 3;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Abonnement" showBack />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
            tintColor={colors.accent} colors={[colors.accent]} />
        }
      >
        {!!error && (<View style={styles.errorBox}><Text style={styles.errorText}>⚠️ {error}</Text></View>)}

        <Card>
          <Text style={styles.currentPlan}>
            Plan actuel : <Text style={styles.planName}>{planName}</Text>
          </Text>
          <View style={styles.statusRow}>
            <View style={[
              styles.statusBadge,
              sub?.status === 'active' ? styles.statusActive : styles.statusInactive,
            ]}>
              <Text style={[
                styles.statusText,
                { color: sub?.status === 'active' ? colors.success : colors.warning },
              ]}>
                {sub?.status === 'active' ? '● Actif' : '○ ' + (sub?.status || 'Inactif')}
              </Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Limite mensuelle</Text>
              <Text style={styles.infoValue}>
                {limit === 'illimité' ? 'Illimité' : `${limit} devis`}
              </Text>
            </View>
            {sub?.endDate && (
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Fin de période</Text>
                <Text style={styles.infoValue}>
                  {new Date(sub.endDate).toLocaleDateString('fr-FR')}
                </Text>
              </View>
            )}
          </View>

          {sub?.plan !== 'free' && (
            <TouchableOpacity
              style={styles.portalBtn}
              onPress={openPortal}
              disabled={working}
              activeOpacity={0.7}
            >
              <Text style={styles.portalBtnText}>
                ⚙️ Gérer mon abonnement (portail Stripe)
              </Text>
            </TouchableOpacity>
          )}
        </Card>

        {sub?.plan === 'free' && (
          <>
            <Text style={styles.sectionTitleOutside}>🚀 Passer à un plan supérieur</Text>
            {PLANS.map((p) => (
              <Card key={p.key} style={p.popular ? styles.popularCard : null}>
                {p.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>POPULAIRE</Text>
                  </View>
                )}
                <View style={styles.planHeader}>
                  <Text style={styles.planNameBig}>{p.name}</Text>
                  <Text style={styles.planPrice}>{p.price}</Text>
                </View>
                <View style={styles.featuresList}>
                  {p.features.map((f, i) => (
                    <Text key={i} style={styles.featureItem}>✓ {f}</Text>
                  ))}
                </View>
                <Button
                  title={`Choisir ${p.name}`}
                  onPress={() => startCheckout(p.key)}
                  disabled={working}
                  loading={working}
                />
              </Card>
            ))}
          </>
        )}

        <Card>
          <Text style={styles.sectionTitle}>💡 À propos</Text>
          <Text style={styles.hint}>
            Les abonnements sont gérés par Stripe. Vous pouvez changer de plan
            ou annuler à tout moment depuis le portail Stripe.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
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
  currentPlan: { color: colors.text, fontSize: fontSize.md, marginBottom: spacing.md },
  planName: { color: colors.accent, fontWeight: '800' },
  statusRow: { marginBottom: spacing.lg },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radius.full, borderWidth: 1 },
  statusActive: { backgroundColor: 'rgba(34,197,94,0.15)', borderColor: 'rgba(34,197,94,0.4)' },
  statusInactive: { backgroundColor: 'rgba(234,179,8,0.15)', borderColor: 'rgba(234,179,8,0.4)' },
  statusText: { fontSize: 11, fontWeight: '700' },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  infoBox: { flex: 1, minWidth: '45%', backgroundColor: colors.bgInput, borderRadius: radius.md, padding: spacing.md },
  infoLabel: { color: colors.textMuted, fontSize: 10, textTransform: 'uppercase', fontWeight: '700', marginBottom: 4 },
  infoValue: { color: colors.text, fontSize: fontSize.md, fontWeight: '600' },
  portalBtn: {
    marginTop: spacing.lg, paddingVertical: 12, borderRadius: radius.full,
    backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.borderLight, alignItems: 'center',
  },
  portalBtnText: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600' },
  popularCard: { borderColor: colors.accent, borderWidth: 2 },
  popularBadge: {
    position: 'absolute', top: -10, left: spacing.lg,
    backgroundColor: colors.accent, paddingHorizontal: spacing.md,
    paddingVertical: 3, borderRadius: radius.full, zIndex: 1,
  },
  popularBadgeText: { color: '#0b1120', fontSize: 10, fontWeight: '800' },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  planNameBig: { color: colors.text, fontSize: fontSize.lg, fontWeight: '800' },
  planPrice: { color: colors.accent, fontSize: fontSize.xl, fontWeight: '800' },
  featuresList: { marginBottom: spacing.lg, gap: 4 },
  featureItem: { color: colors.textSecondary, fontSize: fontSize.sm },
  hint: { color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.35)', borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg },
  errorText: { color: colors.error, fontSize: fontSize.sm },
});