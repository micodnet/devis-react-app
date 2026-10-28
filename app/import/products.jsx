import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { excelApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function ImportProductsScreen() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/catalogue');
  };

  const pickFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: [
          'text/csv',
          'text/plain',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (res.canceled) return;
      const asset = res.assets?.[0];
      if (!asset) return;
      setFile({
        uri: asset.uri, name: asset.name,
        mimeType: asset.mimeType || 'text/csv', file: asset.file,
      });
      setResult(null);
      setError('');
    } catch (err) {
      Alert.alert('Erreur', err.message);
    }
  };

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const data = await excelApi.importProducts(file);
      setResult(data);
      Alert.alert('Succès', `${data.imported || 0} produit(s) importé(s)`);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur d\'import');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Importer produits" showBack />
      <ScrollView contentContainerStyle={styles.scroll}>
        {!!error && (<View style={styles.errorBox}><Text style={styles.errorText}>⚠️ {error}</Text></View>)}

        <Card>
          <Text style={styles.sectionTitle}>Format attendu</Text>
          <Text style={styles.hint}>
            Fichier CSV ou Excel avec les colonnes :
            {'\n'}• <Text style={styles.bold}>nom</Text> (obligatoire)
            {'\n'}• ref, description, unité, prix, prix_achat, catégorie
            {'\n'}• stock, seuil_alerte (si suivi de stock)
          </Text>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Fichier</Text>
          <TouchableOpacity style={styles.dropZone} onPress={pickFile} activeOpacity={0.7}>
            {file ? (
              <>
                <Text style={styles.fileIcon}>📎</Text>
                <Text style={styles.fileName} numberOfLines={2}>{file.name}</Text>
                <Text style={styles.fileSub}>Tapez pour changer</Text>
              </>
            ) : (
              <>
                <Text style={styles.dropIcon}>📄</Text>
                <Text style={styles.dropTitle}>Choisir un fichier</Text>
                <Text style={styles.dropSub}>CSV, XLSX, XLS</Text>
              </>
            )}
          </TouchableOpacity>
        </Card>

        {result && (
          <Card style={styles.resultCard}>
            <Text style={styles.resultTitle}>✅ Import terminé</Text>
            <Row label="Produits importés" value={String(result.imported || 0)} />
            {result.skipped != null && <Row label="Ignorés" value={String(result.skipped)} />}
            {result.errors != null && <Row label="Erreurs" value={String(result.errors)} />}
          </Card>
        )}

        <Button
          title={uploading ? 'Import en cours...' : '📥 Importer'}
          onPress={upload}
          disabled={!file || uploading}
          loading={uploading}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700', marginBottom: spacing.md },
  hint: { color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 20 },
  bold: { color: colors.text, fontWeight: '700' },
  dropZone: {
    borderWidth: 2, borderStyle: 'dashed', borderColor: colors.borderLight,
    borderRadius: radius.lg, paddingVertical: spacing.xxl, alignItems: 'center',
  },
  dropIcon: { fontSize: 40, marginBottom: spacing.sm },
  dropTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '600', marginBottom: 4 },
  dropSub: { color: colors.textMuted, fontSize: fontSize.xs },
  fileIcon: { fontSize: 40, marginBottom: spacing.sm },
  fileName: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600', textAlign: 'center', paddingHorizontal: spacing.md },
  fileSub: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 4 },
  resultCard: { borderColor: colors.success, borderWidth: 2 },
  resultTitle: { color: colors.success, fontSize: fontSize.md, fontWeight: '800', marginBottom: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, gap: spacing.md },
  label: { color: colors.textSecondary, fontSize: fontSize.sm },
  value: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500', textAlign: 'right' },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)', borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.lg,
  },
  errorText: { color: colors.error, fontSize: fontSize.sm },
});