// app/(auth)/signup.jsx

import { useState } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/auth';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function SignupScreen() {
  const router = useRouter();
  const signup = useAuth((s) => s.signup);
  const isSigningIn = useAuth((s) => s.isSigningIn);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Email et mot de passe requis.');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (password !== password2) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }
    if (!terms) {
      setError('Vous devez accepter les CGU et la politique de confidentialité.');
      return;
    }
    try {
      await signup(email.trim().toLowerCase(), password, true);
      router.replace('/(app)/devis');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.logo}>
              Devis <Text style={styles.logoAccent}>Express</Text> Pro
            </Text>
            <Text style={styles.tagline}>Créez votre compte en 30 secondes</Text>
          </View>

          <View style={styles.card}>
            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            )}

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="vous@entreprise.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Mot de passe"
              value={password}
              onChangeText={setPassword}
              placeholder="•••••••• (6 caractères min.)"
              secureTextEntry
            />

            <Input
              label="Confirmer le mot de passe"
              value={password2}
              onChangeText={setPassword2}
              placeholder="••••••••"
              secureTextEntry
            />

            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setTerms(!terms)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, terms && styles.checkboxOn]}>
                {terms && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.termsText}>
                J'accepte les <Text style={styles.link}>CGU/CGV</Text> et la{' '}
                <Text style={styles.link}>politique de confidentialité</Text>.
              </Text>
            </TouchableOpacity>

            <Button
              title="Créer mon compte"
              onPress={handleSignup}
              loading={isSigningIn}
            />
          </View>

          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>Déjà un compte ?</Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.bottomLink}> Se connecter</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  logo: {
    color: colors.text, fontSize: 28, fontWeight: '800', letterSpacing: -0.5,
  },
  logoAccent: { color: colors.accent },
  tagline: {
    color: colors.textSecondary, fontSize: fontSize.sm, marginTop: spacing.sm,
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
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
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 2, borderColor: colors.borderLight,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 2,
  },
  checkboxOn: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '800' },
  termsText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  link: { color: colors.accent, fontWeight: '600' },
  bottomRow: {
    flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl,
  },
  bottomText: { color: colors.textSecondary, fontSize: fontSize.sm },
  bottomLink: {
    color: colors.accent, fontSize: fontSize.sm, fontWeight: '600',
  },
});