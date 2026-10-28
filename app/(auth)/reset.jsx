// app/(auth)/reset.jsx
// Reçoit le token en query param (deep link) : devispro://reset?token=xxx

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    KeyboardAvoidingView, Platform, ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/auth';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import Button from '../../components/Button';
import Input from '../../components/Input';

export default function ResetScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const token = params.token || '';
  const resetPassword = useAuth((s) => s.resetPassword);

  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    if (!token) {
      setError('Lien invalide ou expiré.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (password !== password2) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess('Mot de passe modifié. Redirection...');
      setTimeout(() => router.replace('/(auth)/login'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <Text style={styles.title}>
              Nouveau <Text style={styles.accent}>mot de passe</Text>
            </Text>
            <Text style={styles.subtitle}>
              Choisissez un nouveau mot de passe (min. 6 caractères).
            </Text>
          </View>

          <View style={styles.card}>
            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            )}
            {!!success && (
              <View style={styles.successBox}>
                <Text style={styles.successText}>✅ {success}</Text>
              </View>
            )}

            <Input
              label="Nouveau mot de passe"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
            />

            <Input
              label="Confirmer le mot de passe"
              value={password2}
              onChangeText={setPassword2}
              placeholder="••••••••"
              secureTextEntry
            />

            <Button title="Réinitialiser" onPress={handleSubmit} loading={loading} />
          </View>

          <TouchableOpacity
            onPress={() => router.replace('/(auth)/login')}
            style={styles.backRow}
          >
            <Text style={styles.backText}>← Retour à la connexion</Text>
          </TouchableOpacity>
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
  title: { color: colors.text, fontSize: 26, fontWeight: '800' },
  accent: { color: colors.accent },
  subtitle: {
    color: colors.textSecondary, fontSize: fontSize.sm,
    textAlign: 'center', marginTop: spacing.sm, lineHeight: 20,
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
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.35)',
    borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg,
  },
  errorText: { color: colors.error, fontSize: fontSize.sm },
  successBox: {
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderWidth: 1, borderColor: 'rgba(16,185,129,0.35)',
    borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg,
  },
  successText: { color: colors.success, fontSize: fontSize.sm },
  backRow: { alignItems: 'center', marginTop: spacing.xl },
  backText: { color: colors.textMuted, fontSize: fontSize.sm },
});