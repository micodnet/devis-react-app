import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { onboardingApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import OnboardingTour from '../../components/OnboardingTour';

const TOUR_STEPS = [
  {
    title: 'Bienvenue dans l\'assistant 👋',
    body: 'Cet assistant IA analyse vos demandes clients et crée des devis automatiquement. Vous pouvez aussi lui demander de créer des clients, produits, ou de consulter votre activité.',
    tip: 'Commencez par poser une question simple : "Combien j\'ai de produits ?"',
  },
  {
    title: 'Onglet Devis 📄',
    body: 'Retrouvez ici tous vos devis. Vous pouvez en créer un nouveau en déposant un fichier (PDF, Word, Excel) — l\'IA extrait les articles et crée le devis.',
    tip: 'Le bouton "+ Nouveau" est en haut à droite.',
  },
  {
    title: 'Onglet Clients 👥',
    body: 'Votre carnet clients. Chaque client a une fiche avec ses devis, ses factures, et son accès au portail client.',
    tip: 'Vous pouvez inviter un client à son espace personnel depuis sa fiche.',
  },
  {
    title: 'Onglet Produits 📦',
    body: 'Votre catalogue produits. Utilisé par l\'IA pour matcher les articles extraits des demandes clients.',
    tip: 'Importez votre catalogue en 1 clic (CSV/Excel).',
  },
  {
    title: 'Onglet Assistant ✨',
    body: 'L\'assistant IA à tout moment. Posez-lui des questions, dictez-lui des tâches, ou demandez-lui de créer des éléments.',
    tip: 'Vous pouvez aussi lui parler par voix.',
  },
  {
    title: 'Menu Plus ⋯',
    body: 'Tout le reste : factures, stock, fournisseurs, chantiers, sous-traitants, analytics, rapports, rendez-vous, paiements, banque, développeur, abonnement...',
    tip: 'C\'est votre point d\'entrée vers les 30+ modules de l\'app.',
  },
];

export default function OnboardingTourScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleClose = async () => {
    Alert.alert(
      'Terminer la visite',
      'Voulez-vous marquer la visite comme terminée ?',
      [
        { text: 'Continuer la visite', style: 'cancel' },
        {
          text: 'Terminer',
          onPress: async () => {
            try {
              await onboardingApi.tourCompleted();
            } catch (err) { /* silent */ }
            router.replace('/(app)/dashboard');
          },
        },
      ]
    );
  };

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/dashboard');
  };

  const restart = () => {
    setCurrentStep(0);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Visite guidée" showBack />
      <View style={styles.content}>
        <Card>
          <Text style={styles.sectionTitle}>🎓 Découvrez l'application</Text>
          <Text style={styles.hint}>
            Cette visite guidée vous présente les principales fonctionnalités
            de Devis Express Pro. Vous pouvez la relancer à tout moment depuis
            les Paramètres ou cet écran.
          </Text>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Étapes ({TOUR_STEPS.length})</Text>
          {TOUR_STEPS.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={[styles.stepCircle, i === currentStep && styles.stepCircleActive]}>
                <Text style={[styles.stepCircleText, i === currentStep && styles.stepCircleTextActive]}>
                  {i + 1}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.stepTitle, i === currentStep && { color: colors.accent }]}>
                  {step.title}
                </Text>
              </View>
            </View>
          ))}
        </Card>

        <TouchableOpacity style={styles.startBtn} onPress={() => setCurrentStep(0)} activeOpacity={0.7}>
          <Text style={styles.startBtnText}>▶ Démarrer la visite</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
          <Text style={styles.backBtnText}>← Retour</Text>
        </TouchableOpacity>
      </View>

      <OnboardingTour
        steps={TOUR_STEPS}
        currentStep={currentStep}
        onNext={handleNext}
        onPrev={handlePrev}
        onClose={handleClose}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, padding: spacing.lg },
  sectionTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700', marginBottom: spacing.md },
  hint: { color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 20 },
  stepRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: spacing.md, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  stepCircle: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 2, borderColor: colors.borderLight,
    alignItems: 'center', justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: colors.accent, borderColor: colors.accent,
  },
  stepCircleText: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: '800' },
  stepCircleTextActive: { color: '#0b1120' },
  stepTitle: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600' },
  startBtn: {
    marginTop: spacing.lg, paddingVertical: spacing.lg,
    borderRadius: radius.full, backgroundColor: colors.accent,
    alignItems: 'center',
  },
  startBtnText: { color: '#0b1120', fontSize: fontSize.md, fontWeight: '800' },
  backBtn: {
    marginTop: spacing.md, paddingVertical: spacing.md,
    borderRadius: radius.full, backgroundColor: colors.bgInput,
    borderWidth: 1, borderColor: colors.borderLight, alignItems: 'center',
  },
  backBtnText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600' },
});