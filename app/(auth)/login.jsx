// app/(auth)/login.jsx

import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    KeyboardAvoidingView, Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/auth';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import Button from '../../components/Button';
import Input from '../../components/Input';

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuth((s) => s.login);
  const isSigningIn = useAuth((s) => s.isSigningIn);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Email et mot de passe requis.');
      return;
    }
    try {
      await login(email.trim().toLowerCase(), password);
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
          <View style={styles.logoArea}>
            <Text style={styles.logo}>
              Devis <Text style={styles.logoAccent}>Express</Text> Pro
            </Text>
            <Text style={styles.tagline}>Connectez-vous à votre espace</Text>
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
              placeholder="••••••••"
              secureTextEntry
            />

            <TouchableOpacity
              onPress={() => router.push('/(auth)/forgot')}
              style={styles.forgotLink}
            >
              <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            <Button
              title="Se connecter"
              onPress={handleLogin}
              loading={isSigningIn}
            />
          </View>

          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>Pas encore de compte ?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={styles.bottomLink}> Créer un compte</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => router.replace('/')}
            style={styles.backHomeRow}
            activeOpacity={0.7}
          >
            <Text style={styles.backHomeText}>← Retour à l'accueil</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logo: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  logoAccent: { color: colors.accent },
  tagline: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
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
  errorText: {
    color: colors.error,
    fontSize: fontSize.sm,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginTop: -spacing.sm,
    marginBottom: spacing.lg,
  },
  forgotText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  bottomText: { color: colors.textSecondary, fontSize: fontSize.sm },
  bottomLink: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  backHomeRow: { alignItems: 'center', marginTop: spacing.lg },
  backHomeText: { color: colors.textMuted, fontSize: fontSize.sm },
});