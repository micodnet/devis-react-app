import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { accountApi } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function DeleteAccountScreen() {
  const router = useRouter();
  const logout = useAuth((s) => s.logout);

  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');

    if (!password) {
      setError('Mot de passe requis pour confirmer.');
      return;
    }
    if (confirmText.trim() !== 'SUPPRIMER') {
      setError('Tapez exactement "SUPPRIMER" pour confirmer.');
      return;
    }

    setSubmitting(true);
    try {
      await accountApi.deleteAccount(password);
      await logout();
      router.replace('/(auth)/login');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Supprimer le compte" showBack />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {!!error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}

          <Card style={styles.dangerCard}>
            <Text style={styles.dangerTitle}>⚠️ Zone de danger</Text>
            <Text style={styles.dangerText}>
              La suppression de votre compte est <Text style={styles.bold}>définitive et irréversible</Text>.
            </Text>
            <Text style={styles.dangerText}>
              Toutes vos données (paramètres, clients, produits, devis,
              factures, chantiers) seront effacées. Votre abonnement Stripe sera
              automatiquement annulé.
            </Text>
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Confirmation</Text>

            <Input
              label="Votre mot de passe *"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
            />

            <Input
              label='Tapez "SUPPRIMER" pour confirmer *'
              value={confirmText}
              onChangeText={setConfirmText}
              placeholder="SUPPRIMER"
            />
          </Card>

          <Button
            title={submitting ? 'Suppression...' : '🗑 Supprimer définitivement'}
            onPress={submit}
            disabled={submitting}
            loading={submitting}
            variant="danger"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  dangerCard: {
    borderColor: 'rgba(248,113,113,0.35)',
    backgroundColor: 'rgba(248,113,113,0.05)',
  },
  dangerTitle: {
    color: colors.error,
    fontSize: fontSize.md,
    fontWeight: '800',
    marginBottom: spacing.md,
  },
  dangerText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  bold: {
    color: colors.error,
    fontWeight: '700',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.lg,
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
});