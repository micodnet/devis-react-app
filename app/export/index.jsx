import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { excelApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';

const EXPORTS = [
  { key: 'quotes', label: '📄 Devis', fn: () => excelApi.exportQuotes(), filename: 'devis' },
  { key: 'invoices', label: '🧾 Factures', fn: () => excelApi.exportInvoices(), filename: 'factures' },
  { key: 'products', label: '📦 Produits', fn: () => excelApi.exportProducts(), filename: 'produits' },
  { key: 'clients', label: '👥 Clients', fn: () => excelApi.exportClients(), filename: 'clients' },
  { key: 'chantiers', label: '🏗️ Chantiers', fn: () => excelApi.exportChantiers(), filename: 'chantiers' },
  { key: 'all', label: '📊 Tout (multi-feuilles)', fn: () => excelApi.exportAll(), filename: 'export-complet' },
];

export default function ExportScreen() {
  const router = useRouter();
  const [busy, setBusy] = useState(null);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/plus');
  };

  const exportOne = async (item) => {
    setBusy(item.key);
    try {
      const buffer = await item.fn();
      const base64 = arrayBufferToBase64(buffer);
      const filename = `${item.filename}-${new Date().toISOString().slice(0, 10)}.xlsx`;
      const fileUri = FileSystem.cacheDirectory + filename;

      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          dialogTitle: `Export ${item.label}`,
          UTI: 'com.microsoft.excel.xlsx',
        });
      } else {
        Alert.alert('Succès', `Fichier créé : ${filename}`);
      }
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || err.message || 'Erreur export');
    } finally {
      setBusy(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Exports Excel" showBack />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card>
          <Text style={styles.hint}>
            Exportez vos données dans un fichier Excel (.xlsx) pour les
            sauvegarder, les analyser dans un tableur, ou les donner à votre
            comptable.
          </Text>
        </Card>

        {EXPORTS.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.exportRow}
            onPress={() => exportOne(item)}
            disabled={busy === item.key}
            activeOpacity={0.7}
          >
            <Text style={styles.exportLabel}>{item.label}</Text>
            {busy === item.key ? (
              <Text style={styles.exportBusy}>⏳</Text>
            ) : (
              <Text style={styles.exportArrow}>⬇</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  if (typeof btoa !== 'undefined') return btoa(binary);
  if (typeof Buffer !== 'undefined') return Buffer.from(binary, 'binary').toString('base64');
  throw new Error('Impossible de convertir');
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  hint: { color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 20 },
  exportRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.bgCard, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    paddingVertical: spacing.lg, paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  exportLabel: { color: colors.text, fontSize: fontSize.md, fontWeight: '600' },
  exportArrow: { color: colors.accent, fontSize: 20, fontWeight: '700' },
  exportBusy: { color: colors.warning, fontSize: 20, fontWeight: '700' },
});