import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { accountApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function ExportDataScreen() {
  const router = useRouter();
  const [exporting, setExporting] = useState(false);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/settings');
  };

  const exportData = async () => {
    setExporting(true);
    try {
      const data = await accountApi.exportData();
      const jsonString = JSON.stringify(data, null, 2);
      const filename = `export-rgpd-${new Date().toISOString().slice(0, 10)}.json`;
      const fileUri = FileSystem.cacheDirectory + filename;

      await FileSystem.writeAsStringAsync(fileUri, jsonString, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Export RGPD',
          UTI: 'public.json',
        });
      } else {
        Alert.alert('Succès', `Fichier créé : ${filename}`);
      }
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setExporting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Export RGPD" showBack />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card>
          <Text style={styles.sectionTitle}>📥 Portabilité de vos données</Text>
          <Text style={styles.hint}>
            Conformément à l'article 20 du RGPD, vous pouvez télécharger
            l'intégralité de vos données (compte, paramètres, clients, produits,
            devis) dans un fichier JSON lisible.
          </Text>
          <Text style={styles.hint}>
            Ce fichier peut être conservé, transféré à un autre service, ou
            analysé dans un tableur.
          </Text>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Contenu de l'export</Text>
          <Text style={styles.bullet}>• Compte (email, date de création)</Text>
          <Text style={styles.bullet}>• Paramètres entreprise (nom, adresse, TVA...)</Text>
          <Text style={styles.bullet}>• Liste des clients</Text>
          <Text style={styles.bullet}>• Liste des produits</Text>
          <Text style={styles.bullet}>• Tous vos devis avec articles</Text>
        </Card>

        <Button
          title={exporting ? 'Génération...' : '📥 Télécharger mes données (JSON)'}
          onPress={exportData}
          disabled={exporting}
          loading={exporting}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700', marginBottom: spacing.md },
  hint: { color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 20, marginBottom: spacing.md },
  bullet: { color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 22 },
});