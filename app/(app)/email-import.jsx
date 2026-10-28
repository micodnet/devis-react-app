import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator,
  TouchableOpacity, Alert, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { emailImportApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function EmailImportScreen() {
  const router = useRouter();

  const [fromName, setFromName] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = async () => {
    try {
      const data = await emailImportApi.list();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Erreur history email import:', err.message);
    } finally {
      setHistoryLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  const analyze = async () => {
    setError('');
    if (!text.trim() || text.length < 20) {
      setError('Le texte de l\'email est trop court (20 caractères minimum).');
      return;
    }
    setAnalyzing(true);
    try {
      const data = await emailImportApi.analyze({
        text: text.trim(),
        fromName: fromName.trim() || null,
        fromEmail: fromEmail.trim() || null,
        subject: subject.trim() || null,
      });
      setResult(data);
      loadHistory();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur analyse');
    } finally {
      setAnalyzing(false);
    }
  };

  const createQuote = () => {
    if (!result) return;
    Alert.alert('Créer un devis', 'Créer un devis à partir de cette analyse ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Créer',
        onPress: async () => {
          try {
            const res = await emailImportApi.convert(result.importId, {});
            Alert.alert('Succès', `Devis ${res.quote?.quoteNumber || ''} créé`);
            router.replace('/(app)/devis');
          } catch (err) {
            Alert.alert('Erreur', err.response?.data?.error || err.message);
          }
        },
      },
    ]);
  };

  const reset = () => {
    setFromName(''); setFromEmail(''); setSubject(''); setText('');
    setResult(null); setError('');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Import email" showBack />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
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

        {!result && (
          <>
            <Card>
              <Text style={styles.sectionTitle}>📧 Nouvel import</Text>
              <Text style={styles.hint}>
                Collez le texte d'un email client. L'IA analyse la demande et
                prépare un devis brouillon.
              </Text>

              <Input label="Nom du client (optionnel)" value={fromName} onChangeText={setFromName} />
              <Input
                label="Email du client (optionnel)"
                value={fromEmail} onChangeText={setFromEmail}
                keyboardType="email-address" autoCapitalize="none"
              />
              <Input label="Sujet (optionnel)" value={subject} onChangeText={setSubject} />

              <Text style={styles.fieldLabel}>Contenu de l'email *</Text>
              <TextInput
                style={styles.textarea}
                value={text}
                onChangeText={setText}
                placeholder="Collez ici le texte complet de l'email client..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={12}
              />
            </Card>

            <Button
              title={analyzing ? '⏳ Analyse en cours...' : '🔍 Analyser l\'email'}
              onPress={analyze}
              disabled={analyzing}
              loading={analyzing}
            />
          </>
        )}

        {result && (
          <Card style={styles.resultCard}>
            <Text style={styles.resultTitle}>✅ Analyse terminée</Text>
            <Text style={styles.resultSummary}>
              {result.data?.description || 'Demande analysée'}
            </Text>

            {/* Infos client */}
            <View style={styles.resultBlock}>
              <Text style={styles.resultBlockTitle}>Informations extraites</Text>
              <Row label="Client" value={result.data?.clientName || result.sender?.name || '-'} />
              <Row label="Email" value={result.data?.clientEmail || result.sender?.email || '-'} />
              <Row label="Téléphone" value={result.data?.clientPhone || '-'} />
              <Row label="Adresse" value={result.data?.clientAddress || '-'} />
              <Row label="Type" value={result.data?.requestType || '-'} />
              <Row label="Urgence" value={result.data?.urgency || 'normale'} />
              {result.data?.suggestedMetier ? (
                <Row label="Métier suggéré" value={result.data.suggestedMetier} />
              ) : null}
            </View>

            {/* Articles */}
            {(result.calculated?.items || result.data?.items || []).length > 0 && (
              <View style={styles.resultBlock}>
                <Text style={styles.resultBlockTitle}>
                  Articles détectés
                </Text>
                {(result.calculated?.items || result.data?.items || []).map((it, i) => {
                  const qty = Number(it.qty) || 1;
                  const price = Number(it.unitPrice) || 0;
                  const total = Number(it.total) || qty * price;
                  return (
                    <View key={i} style={styles.itemRow}>
                      <Text style={styles.itemName} numberOfLines={2}>{it.name}</Text>
                      <Text style={styles.itemQty}>{qty}</Text>
                      <Text style={styles.itemTotal}>{total.toFixed(2)} €</Text>
                    </View>
                  );
                })}
              </View>
            )}

            <View style={{ height: spacing.lg }} />

            <Button title="🚀 Créer le devis" onPress={createQuote} />
            <View style={{ height: spacing.md }} />
            <Button title="Nouvel import" onPress={reset} variant="secondary" />
          </Card>
        )}

        {/* Historique */}
        <Text style={styles.sectionTitleOutside}>Historique</Text>
        {historyLoading ? (
          <ActivityIndicator color={colors.accent} />
        ) : history.length === 0 ? (
          <Text style={styles.empty}>Aucun import pour le moment.</Text>
        ) : (
          history.map((imp) => (
            <TouchableOpacity
              key={imp.id}
              style={styles.historyCard}
              onPress={() => router.push(`/email-import/${imp.id}`)}
              activeOpacity={0.7}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.historySubject} numberOfLines={1}>
                  {imp.fromName || imp.fromEmail || 'Email inconnu'}
                </Text>
                {imp.subject ? (
                  <Text style={styles.historyMeta} numberOfLines={1}>
                    {imp.subject}
                  </Text>
                ) : null}
                <Text style={styles.historyDate}>
                  {new Date(imp.createdAt).toLocaleString('fr-FR')}
                </Text>
              </View>
              {imp.status === 'converted' && (
                <Text style={styles.historyConverted}>✅ Devis</Text>
              )}
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={3}>{value}</Text>
    </View>
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
  hint: { color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 20, marginBottom: spacing.md },
  fieldLabel: {
    color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600',
    marginBottom: spacing.sm, marginTop: spacing.sm,
  },
  textarea: {
    backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.borderLight,
    borderRadius: radius.md, paddingVertical: 12, paddingHorizontal: 14,
    color: colors.text, fontSize: fontSize.sm, minHeight: 180,
    textAlignVertical: 'top', fontFamily: 'monospace',
  },
  resultCard: { borderColor: colors.success, borderWidth: 2 },
  resultTitle: { color: colors.success, fontSize: fontSize.md, fontWeight: '800', marginBottom: spacing.sm },
  resultSummary: { color: colors.text, fontSize: fontSize.sm, lineHeight: 20, marginBottom: spacing.md },
  resultBlock: { marginTop: spacing.lg },
  resultBlockTitle: {
    color: colors.textSecondary, fontSize: 10, textTransform: 'uppercase',
    fontWeight: '700', letterSpacing: 0.5, marginBottom: spacing.sm,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, gap: spacing.md },
  label: { color: colors.textSecondary, fontSize: fontSize.sm },
  value: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500', flexShrink: 1, textAlign: 'right' },
  itemRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.sm,
  },
  itemName: { flex: 1, color: colors.text, fontSize: fontSize.sm, fontWeight: '500' },
  itemQty: { color: colors.textSecondary, fontSize: fontSize.xs, width: 40, textAlign: 'center' },
  itemTotal: { color: colors.accent, fontSize: fontSize.sm, fontWeight: '700', width: 80, textAlign: 'right' },
  historyCard: {
    flexDirection: 'row', gap: spacing.md,
    backgroundColor: colors.bgCard, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, marginBottom: spacing.sm, alignItems: 'center',
  },
  historySubject: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600' },
  historyMeta: { color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2 },
  historyDate: { color: colors.textMuted, fontSize: 10, marginTop: 4 },
  historyConverted: { color: colors.success, fontSize: 10, fontWeight: '700' },
  empty: {
    color: colors.textMuted, fontSize: fontSize.sm, fontStyle: 'italic',
    textAlign: 'center', paddingVertical: spacing.lg,
  },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)', borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.lg,
  },
  errorText: { color: colors.error, fontSize: fontSize.sm },
});