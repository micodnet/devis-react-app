// // app/index.jsx
// // Écran d'entrée : redirige vers login ou app selon la session

// import { useRouter } from 'expo-router';
// import { useEffect } from 'react';
// import { ActivityIndicator, StyleSheet, View } from 'react-native';
// import { useAuth } from '../lib/auth';
// import { colors } from '../lib/theme';

// export default function Index() {
//   const router = useRouter();
//   const { token, isLoading } = useAuth();

//   useEffect(() => {
//     if (isLoading) return;
//     if (token) {
//       router.replace('/(app)/devis');
//     } else {
//       router.replace('/(auth)/login');
//     }
//   }, [isLoading, token]);

//   return (
//     <View style={styles.container}>
//       <ActivityIndicator size="large" color={colors.accent} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.bg,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });

import { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../lib/auth';
import { colors, spacing, fontSize, radius } from '../lib/theme';

export default function LandingScreen() {
  const router = useRouter();
  const { token, isLoading } = useAuth();

  // Si déjà connecté → redirection directe vers l'app
  useEffect(() => {
    if (!isLoading && token) {
      router.replace('/(app)/devis');
    }
  }, [isLoading, token]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Logo */}
        <View style={styles.logoArea}>
          <Text style={styles.logo}>
            Devis <Text style={styles.logoAccent}>Express</Text> Pro
          </Text>
          <Text style={styles.tagline}>
            Générez vos devis en 10 secondes grâce à l'IA
          </Text>
        </View>

        {/* Badge IA */}
        <View style={styles.badgeWrap}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>PROPULSÉ PAR L'IA</Text>
          </View>
        </View>

        {/* Titre */}
        <Text style={styles.heroTitle}>
          Créez vos devis en <Text style={styles.heroAccent}>quelques secondes</Text> au lieu de plusieurs heures.
        </Text>

        {/* Description */}
        <Text style={styles.heroSub}>
          Déposez n'importe quelle demande client (PDF, Word, Excel, photo),
          l'IA extrait les articles et génère un devis professionnel.
        </Text>

        {/* Fonctionnalités */}
        <View style={styles.features}>
          <Feature icon="🤖" title="Assistant IA" text="Dictez un chantier, l'IA calcule tout." />
          <Feature icon="📄" title="Devis depuis un fichier" text="PDF, Word, Excel → devis en 1 clic." />
          <Feature icon="✍️" title="Signature électronique" text="Le client signe en ligne, conforme eIDAS." />
          <Feature icon="📊" title="Gestion complète" text="Clients, produits, stock, factures, chantiers." />
          <Feature icon="🎯" title="Conforme Peppol" text="Facturation B2B conforme UE 2026." />
          <Feature icon="☁️" title="Multi-appareils" text="Synchronisé sur mobile et web." />
        </View>

        {/* CTA */}
        <View style={styles.ctaRow}>
          <TouchableOpacity
            style={[styles.ctaBtn, styles.ctaPrimary]}
            onPress={() => router.push('/(auth)/signup')}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaPrimaryText}>🚀 Créer un compte gratuit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.ctaBtn, styles.ctaSecondary]}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaSecondaryText}>J'ai déjà un compte</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          © {new Date().getFullYear()} Devis Express Pro — Tous droits réservés
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Feature({ icon, title, text }) {
  return (
    <View style={styles.featureCard}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureText}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: {
    flex: 1, backgroundColor: colors.bg,
    alignItems: 'center', justifyContent: 'center',
  },
  scroll: { padding: spacing.xl, paddingBottom: spacing.xxl },
  logoArea: { alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.lg },
  logo: {
    color: colors.text, fontSize: 32, fontWeight: '800',
    letterSpacing: -0.5,
  },
  logoAccent: { color: colors.accent },
  tagline: {
    color: colors.textSecondary, fontSize: fontSize.sm,
    marginTop: spacing.sm, textAlign: 'center',
  },
  badgeWrap: { alignItems: 'center', marginVertical: spacing.lg },
  badge: {
    paddingHorizontal: spacing.lg, paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: 'rgba(249,115,22,0.12)',
    borderWidth: 1, borderColor: 'rgba(249,115,22,0.3)',
  },
  badgeText: {
    color: colors.accent, fontSize: 10, fontWeight: '800',
    letterSpacing: 0.8,
  },
  heroTitle: {
    color: colors.text, fontSize: 26, fontWeight: '800',
    textAlign: 'center', lineHeight: 34,
    marginBottom: spacing.lg,
  },
  heroAccent: { color: colors.accent },
  heroSub: {
    color: colors.textSecondary, fontSize: fontSize.md,
    textAlign: 'center', lineHeight: 22, marginBottom: spacing.xxl,
  },
  features: { gap: spacing.md, marginBottom: spacing.xxl },
  featureCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.md, paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  featureIcon: { fontSize: 24 },
  featureTitle: {
    color: colors.text, fontSize: fontSize.sm,
    fontWeight: '700', marginBottom: 2,
  },
  featureText: {
    color: colors.textSecondary, fontSize: fontSize.xs, lineHeight: 16,
  },
  ctaRow: { gap: spacing.md, marginTop: spacing.lg },
  ctaBtn: {
    paddingVertical: 16, borderRadius: radius.full,
    alignItems: 'center', justifyContent: 'center',
  },
  ctaPrimary: { backgroundColor: colors.accent },
  ctaPrimaryText: { color: '#0b1120', fontSize: fontSize.md, fontWeight: '800' },
  ctaSecondary: {
    backgroundColor: colors.bgCard,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  ctaSecondaryText: { color: colors.text, fontSize: fontSize.md, fontWeight: '600' },
  footer: {
    color: colors.textMuted, fontSize: fontSize.xs,
    textAlign: 'center', marginTop: spacing.xxl,
  },
});