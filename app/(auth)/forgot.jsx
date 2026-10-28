// app/(auth)/forgot.jsx

import { useState } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/auth';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function ForgotScreen() {
  const router = useRouter();
  const forgotPassword = useAuth((s) => s.forgotPassword);

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    if (!email.trim()) {
      setError('Email requis.');
      return;
    }
    setLoading(true);
    try {
      const msg = await forgotPassword(email.trim().toLowerCase());
      setSuccess(msg);
      setEmail('');
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
              Mot de passe <Text style={styles.accent}>oublié</Text>
            </Text>
            <Text style={styles.subtitle}>
              Entrez votre email, nous vous enverrons un lien de réinitialisation.
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
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="vous@entreprise.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Button title="Envoyer le lien" onPress={handleSubmit} loading={loading} />
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