import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { quotesApi, clientsApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Button from '../../components/Button';
import Card from '../../components/Card';
import FilePickerButton from '../../components/FilePickerButton';

export default function NewQuoteScreen() {
  const router = useRouter();
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(app)/devis');
    }
  };
  const [file, setFile] = useState(null);
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [clientPickerOpen, setClientPickerOpen] = useState(false);
  const [currency, setCurrency] = useState('EUR');

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const data = await clientsApi.list();
      setClients(Array.isArray(data) ? data : []);
    } catch (err) {
      // silencieux, on n'affiche pas d'erreur si la liste des clients ne charge pas
    }
  };

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  const generateQuote = async () => {
    if (!file) {
      setError('Veuillez sélectionner un fichier.');
      return;
    }
    setError('');
    setGenerating(true);
    try {
      const data = await quotesApi.generateFromFile({
        file,
        clientId: selectedClientId,
        currency,
      });
      setResult(data);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.message ||
        'Erreur lors de la génération du devis.';
      setError(msg);
    } finally {
      setGenerating(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setResult(null);
    setError('');
    setSelectedClientId(null);
  };

  const goToQuote = () => {
    if (result?.id) {
      router.replace(`/quote/${result.id}`);
    } else {
      router.replace('/(app)/devis');
    }
  };

  const fmtMoney = (n) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: result?.currency || currency,
      minimumFractionDigits: 2,
    }).format(n || 0);

  // ─────────────────────────────────────────────
  // VUE RÉSULTAT (devis généré)
  // ─────────────────────────────────────────────
  if (result) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={resetForm} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Devis généré</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <Card>
            <Text style={styles.successTitle}>✅ Devis créé avec succès</Text>
            <Text style={styles.successNumber}>
              N° {result.quoteNumber}
            </Text>
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>
              Articles ({result.items?.length || 0})
            </Text>
            {(result.items || []).map((item, i) => (
              <View key={i} style={styles.itemRow}>
                <View style={styles.itemLeft}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.itemMeta}>
                    {item.qty} × {fmtMoney(item.unitPrice)}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>{fmtMoney(item.total)}</Text>
              </View>
            ))}
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Totaux</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Sous-total HT</Text>
              <Text style={styles.value}>{fmtMoney(result.subtotal)}</Text>
            </View>
            {result.vatRegime === 'assujetti' ? (
              <View style={styles.row}>
                <Text style={styles.label}>TVA</Text>
                <Text style={styles.value}>{fmtMoney(result.vatAmount)}</Text>
              </View>
            ) : null}
            <View style={[styles.row, styles.totalRow]}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalValue}>{fmtMoney(result.total)}</Text>
            </View>
          </Card>

          <Button title="Voir le devis" onPress={goToQuote} />
          <View style={{ height: spacing.md }} />
          <Button title="Créer un autre devis" onPress={resetForm} variant="secondary" />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─────────────────────────────────────────────
  // VUE FORMULAIRE
  // ─────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Nouveau devis</Text>
      </View>

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

          {/* Étape 1 : Client (optionnel) */}
          <Card>
            <Text style={styles.sectionTitle}>1. Client (optionnel)</Text>
            <TouchableOpacity
              style={styles.clientSelector}
              onPress={() => setClientPickerOpen(!clientPickerOpen)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.clientSelectorText,
                  !selectedClient && styles.clientSelectorPlaceholder,
                ]}
                numberOfLines={1}
              >
                {selectedClient
                  ? selectedClient.name
                  : '— Aucun client sélectionné —'}
              </Text>
              <Text style={styles.chevron}>{clientPickerOpen ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {clientPickerOpen && (
              <View style={styles.clientList}>
                <TouchableOpacity
                  style={styles.clientItem}
                  onPress={() => {
                    setSelectedClientId(null);
                    setClientPickerOpen(false);
                  }}
                >
                  <Text style={styles.clientItemText}>
                    — Aucun client —
                  </Text>
                </TouchableOpacity>
                {clients.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={styles.clientItem}
                    onPress={() => {
                      setSelectedClientId(c.id);
                      setClientPickerOpen(false);
                    }}
                  >
                    <Text style={styles.clientItemText} numberOfLines={1}>
                      {c.name}
                      {c.email ? ` (${c.email})` : ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Card>

          {/* Étape 2 : Fichier */}
          <Card>
            <Text style={styles.sectionTitle}>2. Fichier à analyser</Text>
            <Text style={styles.hint}>
              Déposez une demande client : PDF, Word, Excel, CSV ou TXT.
              L'IA extrait les articles automatiquement.
            </Text>
            <FilePickerButton
              onFileSelected={setFile}
              selectedFile={file}
            />
          </Card>

          {/* Bouton générer */}
          <Button
            title={generating ? 'Génération en cours...' : '🚀 Générer le devis'}
            onPress={generateQuote}
            disabled={!file || generating}
            loading={generating}
          />

          {generating && (
            <View style={styles.generatingHint}>
              <Text style={styles.generatingText}>
                Analyse du fichier par l'IA... Cela peut prendre 10 à 60 secondes.
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { color: colors.text, fontSize: 24, fontWeight: '600' },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  hint: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    lineHeight: 18,
    marginBottom: spacing.md,
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
  clientSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  clientSelectorText: {
    color: colors.text,
    fontSize: fontSize.sm,
    flex: 1,
  },
  clientSelectorPlaceholder: {
    color: colors.textMuted,
  },
  chevron: { color: colors.textMuted, fontSize: 12 },
  clientList: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
    maxHeight: 240,
  },
  clientItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  clientItemText: {
    color: colors.text,
    fontSize: fontSize.sm,
  },
  // Vue résultat
  successTitle: {
    color: colors.success,
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  successNumber: {
    color: colors.accent,
    fontSize: fontSize.lg,
    fontWeight: '800',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  itemLeft: { flex: 1, minWidth: 0 },
  itemName: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  itemMeta: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  itemTotal: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    gap: spacing.md,
  },
  label: { color: colors.textSecondary, fontSize: fontSize.sm },
  value: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500' },
  totalRow: {
    borderTopWidth: 2,
    borderTopColor: colors.accent,
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
  totalLabel: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '800',
  },
  totalValue: {
    color: colors.accent,
    fontSize: fontSize.xl,
    fontWeight: '800',
  },
  generatingHint: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(249,115,22,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(249,115,22,0.3)',
  },
  generatingText: {
    color: colors.accent,
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
});