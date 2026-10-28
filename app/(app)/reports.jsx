import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { reportsApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';

const PERIODS = [
  { key: 'month', label: 'Mois en cours' },
  { key: 'lastmonth', label: 'Mois précédent' },
  { key: 'quarter', label: 'Trimestre' },
  { key: 'year', label: 'Année en cours' },
  { key: 'lastyear', label: 'Année précédente' },
  { key: 'custom', label: 'Personnalisé' },
];

function getPeriodDates(period, customFrom, customTo) {
  const now = new Date();
  let from, to;
  switch (period) {
    case 'month':
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;
    case 'lastmonth':
      from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      to = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
    case 'quarter': {
      const q = Math.floor(now.getMonth() / 3);
      from = new Date(now.getFullYear(), q * 3, 1);
      to = new Date(now.getFullYear(), q * 3 + 3, 0);
      break;
    }
    case 'year':
      from = new Date(now.getFullYear(), 0, 1);
      to = new Date(now.getFullYear(), 11, 31);
      break;
    case 'lastyear':
      from = new Date(now.getFullYear() - 1, 0, 1);
      to = new Date(now.getFullYear() - 1, 11, 31);
      break;
    case 'custom':
      if (!customFrom || !customTo) return null;
      return { from: customFrom, to: customTo };
    default:
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  }
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

export default function ReportsScreen() {
  const [period, setPeriod] = useState('month');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [loading, setLoading] = useState(false);

  const dates = getPeriodDates(period, customFrom, customTo);

  const fmtDate = (d) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('fr-FR'); } catch { return d; }
  };

  const generate = async () => {
    if (!dates) {
      Alert.alert('Erreur', 'Sélectionnez une période valide.');
      return;
    }
    if (dates.from > dates.to) {
      Alert.alert('Erreur', 'La date de début doit être avant la date de fin.');
      return;
    }

    setLoading(true);
    try {
      const buffer = await reportsApi.downloadPdf(dates.from, dates.to);

      // Convertir en base64 pour sauvegarde
      const base64 = arrayBufferToBase64(buffer);
      const filename = `rapport-${dates.from}-au-${dates.to}.pdf`;
      const fileUri = FileSystem.cacheDirectory + filename;

      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Partager / ouvrir avec l'app PDF du téléphone
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Rapport d\'activité',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('Succès', `PDF généré : ${filename}`);
      }
    } catch (err) {
      console.error('Erreur génération rapport:', err);
      Alert.alert(
        'Erreur',
        err.response?.data?.error ||
          err.message ||
          'Impossible de générer le rapport.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Rapports" showBack />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Card>
          <Text style={styles.sectionTitle}>📅 Période</Text>
          <View style={styles.periodGrid}>
            {PERIODS.map((p) => {
              const isActive = period === p.key;
              return (
                <TouchableOpacity
                  key={p.key}
                  style={[styles.periodBtn, isActive && styles.periodBtnActive]}
                  onPress={() => setPeriod(p.key)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.periodText, isActive && styles.periodTextActive]}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {period === 'custom' && (
            <>
              <Input
                label="Date de début (YYYY-MM-DD)"
                value={customFrom}
                onChangeText={setCustomFrom}
                placeholder="2026-01-01"
              />
              <Input
                label="Date de fin (YYYY-MM-DD)"
                value={customTo}
                onChangeText={setCustomTo}
                placeholder="2026-12-31"
              />
            </>
          )}

          {dates && (
            <View style={styles.periodInfo}>
              <Text style={styles.periodInfoText}>
                Du {fmtDate(dates.from)} au {fmtDate(dates.to)}
              </Text>
            </View>
          )}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>📄 Contenu du rapport</Text>
          <Text style={styles.bullet}>• Résumé chiffré : CA, devis, conversion, panier moyen</Text>
          <Text style={styles.bullet}>• Facturation : total, payé, reste dû, impayés</Text>
          <Text style={styles.bullet}>• Évolution mensuelle du CA (graphique)</Text>
          <Text style={styles.bullet}>• Top 10 clients</Text>
          <Text style={styles.bullet}>• Top 10 produits et services</Text>
          <Text style={styles.bullet}>• Rentabilité par métier</Text>
          <Text style={styles.bullet}>• Prévisionnel de trésorerie (30/60/90 jours)</Text>
          <Text style={styles.bullet}>• Liste détaillée des devis de la période</Text>
        </Card>

        <Button
          title={loading ? '⏳ Génération en cours...' : '📥 Générer et télécharger le PDF'}
          onPress={generate}
          disabled={loading}
          loading={loading}
        />

        <Card style={{ marginTop: spacing.lg }}>
          <Text style={styles.sectionTitle}>💡 Comment ça marche ?</Text>
          <Text style={styles.bullet}>
            Le PDF est généré côté serveur à partir de vos données. Vous pourrez
            l'ouvrir avec n'importe quelle app PDF, l'imprimer, ou l'envoyer par
            email.
          </Text>
          <Text style={styles.bullet}>
            Idéal pour votre comptable, vos archives ou votre banque.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

// Convertit un ArrayBuffer en base64 (sans dépendance externe)
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  if (typeof btoa !== 'undefined') {
    return btoa(binary);
  }
  // Fallback Buffer si dispo (RN)
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(binary, 'binary').toString('base64');
  }
  throw new Error('Impossible de convertir le PDF');
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  periodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  periodBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.bgCard,
  },
  periodBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  periodText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600' },
  periodTextActive: { color: '#0b1120' },
  periodInfo: {
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.bgInput,
  },
  periodInfoText: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: '700',
    textAlign: 'center',
  },
  bullet: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 22,
    marginBottom: 2,
  },
});