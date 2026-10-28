import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
  ActivityIndicator, Alert, TextInput, FlatList, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { visionApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function VisionScreen() {
  const router = useRouter();

  const [image, setImage] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ----- Charger l'historique -----
  const loadHistory = async () => {
    try {
      const data = await visionApi.history(30);
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Erreur history vision:', err.message);
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

  // ----- Choisir une image (galerie) -----
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Autorisez l\'accès à votre galerie.');
        return;
      }

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
      });
      if (res.canceled) return;
      const asset = res.assets[0];
      setImage({
        uri: asset.uri,
        name: asset.fileName || 'image.jpg',
        mimeType: asset.mimeType || 'image/jpeg',
        file: asset.file,
      });
      setResult(null);
      setError('');
    } catch (err) {
      Alert.alert('Erreur', err.message);
    }
  };

  // ----- Prendre une photo (caméra) -----
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Autorisez l\'accès à votre caméra.');
        return;
      }

      const res = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: false,
      });
      if (res.canceled) return;
      const asset = res.assets[0];
      setImage({
        uri: asset.uri,
        name: asset.fileName || 'photo.jpg',
        mimeType: asset.mimeType || 'image/jpeg',
        file: asset.file,
      });
      setResult(null);
      setError('');
    } catch (err) {
      Alert.alert('Erreur', err.message);
    }
  };

  // ----- Analyser -----
  const analyze = async () => {
    if (!image) return;
    setError('');
    setAnalyzing(true);
    try {
      const data = await visionApi.analyze({ file: image, prompt });
      setResult(data);
    } catch (err) {
      setError(
        err.response?.data?.error || err.message || 'Erreur analyse'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  // ----- Créer un devis depuis l'analyse -----
  const createQuote = () => {
    if (!result) return;
    const materials = result.data?.materials || [];
    if (materials.length === 0) {
      Alert.alert('Info', 'Aucun article à convertir en devis.');
      return;
    }
    Alert.prompt
      ? Alert.prompt(
          'Créer un devis',
          'Nom du client (optionnel) :',
          async (clientName) => {
            try {
              const res = await visionApi.convertToQuote(result.analysisId, {
                clientName: clientName?.trim() || 'Client image',
              });
              Alert.alert('Succès', `Devis ${res.quoteNumber} créé`);
              if (res.id) router.replace(`/quote/${res.id}`);
            } catch (err) {
              Alert.alert('Erreur', err.response?.data?.error || err.message);
            }
          }
        )
      : null;
  };

  const reset = () => {
    setImage(null);
    setPrompt('');
    setResult(null);
    setError('');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Analyse image" showBack />
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

        {/* Upload */}
        {!image ? (
          <Card>
            <Text style={styles.sectionTitle}>📷 Nouvelle analyse</Text>
            <Text style={styles.hint}>
              Prenez une photo (chantier, plan manuscrit, facture papier) ou
              choisissez une image. L'IA extrait les dimensions, matériaux et
              texte pour créer un devis.
            </Text>

            <TouchableOpacity
              style={styles.dropZone}
              onPress={pickImage}
              activeOpacity={0.7}
            >
              <Text style={styles.dropIcon}>🖼️</Text>
              <Text style={styles.dropTitle}>Choisir une image</Text>
              <Text style={styles.dropSub}>Depuis votre galerie</Text>
            </TouchableOpacity>

            <View style={{ height: spacing.md }} />

            <TouchableOpacity
              style={[styles.dropZone, styles.cameraZone]}
              onPress={takePhoto}
              activeOpacity={0.7}
            >
              <Text style={styles.dropIcon}>📷</Text>
              <Text style={styles.dropTitle}>Prendre une photo</Text>
              <Text style={styles.dropSub}>Avec votre caméra</Text>
            </TouchableOpacity>
          </Card>
        ) : (
          <Card>
            <Text style={styles.sectionTitle}>📷 Image sélectionnée</Text>
            <Image source={{ uri: image.uri }} style={styles.preview} resizeMode="contain" />

            {!result && (
              <>
                <Text style={styles.fieldLabel}>
                  Que voulez-vous extraire ? (optionnel)
                </Text>
                <TextInput
                  style={styles.textarea}
                  value={prompt}
                  onChangeText={setPrompt}
                  placeholder="Ex: extrais les dimensions et les matériaux pour peindre cette pièce"
                  placeholderTextColor={colors.textMuted}
                  multiline
                />

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionBtnSecondary]}
                    onPress={reset}
                    disabled={analyzing}
                  >
                    <Text style={styles.actionBtnSecondaryText}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionBtnPrimary]}
                    onPress={analyze}
                    disabled={analyzing}
                  >
                    {analyzing ? (
                      <ActivityIndicator size="small" color="#0b1120" />
                    ) : (
                      <Text style={styles.actionBtnPrimaryText}>Analyser</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Card>
        )}

        {/* Résultat */}
        {result && (
          <Card style={styles.resultCard}>
            <Text style={styles.resultTitle}>✅ Analyse terminée</Text>
            <Text style={styles.resultMeta}>
              {result.provider} / {result.model} · {(result.durationMs / 1000).toFixed(1)}s
            </Text>

            {result.data?.description ? (
              <Text style={styles.resultDesc}>{result.data.description}</Text>
            ) : null}

            {/* Dimensions */}
            {result.data?.dimensions?.length > 0 && (
              <View style={styles.resultBlock}>
                <Text style={styles.resultBlockTitle}>Dimensions</Text>
                <View style={styles.chipsRow}>
                  {result.data.dimensions.map((d, i) => (
                    <View key={i} style={styles.chip}>
                      <Text style={styles.chipText}>
                        {d.label}: {d.length} × {d.width} {d.unit || 'm'}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Matériaux */}
            {result.data?.materials?.length > 0 && (
              <View style={styles.resultBlock}>
                <Text style={styles.resultBlockTitle}>
                  Matériaux ({result.data.materials.length})
                </Text>
                {result.data.materials.map((m, i) => (
                  <View key={i} style={styles.itemRow}>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.itemName}>{m.name}</Text>
                      {m.ref ? <Text style={styles.itemRef}>{m.ref}</Text> : null}
                    </View>
                    <Text style={styles.itemQty}>
                      {m.estimatedQty || 1} {m.unit || ''}
                    </Text>
                    <Text style={styles.itemPrice}>
                      {(m.unitPrice || 0).toFixed(2)} €
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Texte extrait */}
            {result.data?.extractedText ? (
              <View style={styles.resultBlock}>
                <Text style={styles.resultBlockTitle}>Texte extrait</Text>
                <View style={styles.textBox}>
                  <Text style={styles.textBoxContent} numberOfLines={8}>
                    {result.data.extractedText}
                  </Text>
                </View>
              </View>
            ) : null}

            {/* Notes */}
            {result.data?.notes ? (
              <View style={styles.resultBlock}>
                <Text style={styles.resultBlockTitle}>Notes</Text>
                <Text style={styles.notesText}>{result.data.notes}</Text>
              </View>
            ) : null}

            <View style={{ height: spacing.lg }} />

            <Button title="🚀 Créer un devis" onPress={createQuote} />
            <View style={{ height: spacing.md }} />
            <Button title="Nouvelle analyse" onPress={reset} variant="secondary" />
          </Card>
        )}

        {/* Historique */}
        <Text style={styles.sectionTitleOutside}>Historique</Text>
        {historyLoading ? (
          <ActivityIndicator color={colors.accent} />
        ) : history.length === 0 ? (
          <Text style={styles.empty}>Aucune analyse pour le moment.</Text>
        ) : (
          history.map((a) => (
            <TouchableOpacity
              key={a.id}
              style={styles.historyCard}
              onPress={() => router.push(`/vision/${a.id}`)}
              activeOpacity={0.7}
            >
              <Image
                source={{ uri: a.imageUrl }}
                style={styles.historyThumb}
                resizeMode="cover"
              />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.historyDesc} numberOfLines={2}>
                  {a.result?.description || 'Analyse'}
                </Text>
                <Text style={styles.historyDate}>
                  {new Date(a.createdAt).toLocaleString('fr-FR')}
                </Text>
                {a.convertedQuoteId ? (
                  <Text style={styles.historyConverted}>✅ Converti en devis</Text>
                ) : null}
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionTitle: {
    color: colors.text, fontSize: fontSize.md, fontWeight: '700', marginBottom: spacing.md,
  },
  sectionTitleOutside: {
    color: colors.text, fontSize: fontSize.md, fontWeight: '700',
    marginTop: spacing.lg, marginBottom: spacing.md,
  },
  hint: {
    color: colors.textSecondary, fontSize: fontSize.sm,
    lineHeight: 20, marginBottom: spacing.lg,
  },
  dropZone: {
    borderWidth: 2, borderStyle: 'dashed', borderColor: colors.borderLight,
    borderRadius: radius.lg, paddingVertical: spacing.xxl,
    alignItems: 'center', justifyContent: 'center',
  },
  cameraZone: { borderColor: 'rgba(249,115,22,0.5)' },
  dropIcon: { fontSize: 36, marginBottom: spacing.sm },
  dropTitle: { color: colors.text, fontSize: fontSize.sm, fontWeight: '700' },
  dropSub: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },
  preview: {
    width: '100%', height: 240, borderRadius: radius.md,
    backgroundColor: colors.bg, marginBottom: spacing.md,
  },
  fieldLabel: {
    color: colors.textSecondary, fontSize: fontSize.sm,
    fontWeight: '600', marginBottom: spacing.sm,
  },
  textarea: {
    backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.borderLight,
    borderRadius: radius.md, paddingVertical: 12, paddingHorizontal: 14,
    color: colors.text, fontSize: fontSize.sm, minHeight: 80,
    textAlignVertical: 'top', marginBottom: spacing.md,
  },
  actionsRow: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: {
    flex: 1, paddingVertical: 12, borderRadius: radius.full,
    alignItems: 'center', justifyContent: 'center', minHeight: 44,
  },
  actionBtnSecondary: {
    backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.borderLight,
  },
  actionBtnSecondaryText: {
    color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600',
  },
  actionBtnPrimary: { backgroundColor: colors.accent },
  actionBtnPrimaryText: { color: '#0b1120', fontSize: fontSize.sm, fontWeight: '700' },
  resultCard: { borderColor: colors.success, borderWidth: 2 },
  resultTitle: {
    color: colors.success, fontSize: fontSize.md, fontWeight: '800', marginBottom: 4,
  },
  resultMeta: {
    color: colors.textMuted, fontSize: fontSize.xs, marginBottom: spacing.md,
  },
  resultDesc: {
    color: colors.text, fontSize: fontSize.sm, lineHeight: 20, marginBottom: spacing.md,
  },
  resultBlock: { marginTop: spacing.lg },
  resultBlockTitle: {
    color: colors.textSecondary, fontSize: 10, textTransform: 'uppercase',
    fontWeight: '700', letterSpacing: 0.5, marginBottom: spacing.sm,
  },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.full,
    backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.borderLight,
  },
  chipText: { color: colors.text, fontSize: fontSize.xs },
  itemRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  itemName: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500' },
  itemRef: { color: colors.textMuted, fontSize: fontSize.xs },
  itemQty: { color: colors.textSecondary, fontSize: fontSize.xs, width: 60, textAlign: 'center' },
  itemPrice: { color: colors.accent, fontSize: fontSize.sm, fontWeight: '700', width: 70, textAlign: 'right' },
  textBox: {
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.borderLight,
    borderRadius: radius.md, padding: spacing.md,
  },
  textBoxContent: {
    color: colors.textSecondary, fontSize: fontSize.xs, fontFamily: 'monospace', lineHeight: 18,
  },
  notesText: { color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 20 },
  historyCard: {
    flexDirection: 'row', gap: spacing.md,
    backgroundColor: colors.bgCard, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.sm, marginBottom: spacing.sm,
  },
  historyThumb: { width: 60, height: 60, borderRadius: radius.sm, backgroundColor: colors.bg },
  historyDesc: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500' },
  historyDate: { color: colors.textMuted, fontSize: 10, marginTop: 4 },
  historyConverted: { color: colors.success, fontSize: 10, fontWeight: '700', marginTop: 4 },
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