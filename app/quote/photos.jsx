import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator,
  Alert, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { quotePhotosApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';

export default function QuotePhotosScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const [pendingImage, setPendingImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [captionOpen, setCaptionOpen] = useState(false);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace(`/quote/${id}`);
  };

  const loadPhotos = async () => {
    try {
      setError('');
      const data = await quotePhotosApi.list(id);
      setPhotos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPhotos(); }, [id]);

  const pickFromGallery = async () => {
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
    openCaption({
      uri: asset.uri, name: asset.fileName || 'photo.jpg',
      mimeType: asset.mimeType || 'image/jpeg', file: asset.file,
    });
  };

  const takePhoto = async () => {
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
    openCaption({
      uri: asset.uri, name: asset.fileName || 'photo.jpg',
      mimeType: asset.mimeType || 'image/jpeg', file: asset.file,
    });
  };

  const openCaption = (image) => {
    setPendingImage(image);
    setCaption('');
    setCaptionOpen(true);
  };

  const confirmUpload = async () => {
    if (!pendingImage) return;
    setCaptionOpen(false);
    setUploading(true);
    try {
      await quotePhotosApi.upload(id, pendingImage, caption.trim() || null);
      setPendingImage(null);
      setCaption('');
      await loadPhotos();
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || err.message);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (photo) => {
    Alert.alert('Supprimer', 'Supprimer cette photo ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          try {
            await quotePhotosApi.remove(id, photo.id);
            await loadPhotos();
          } catch (err) { Alert.alert('Erreur', err.response?.data?.error || err.message); }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Photos" showBack />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Photos du devis" showBack />
      <ScrollView contentContainerStyle={styles.scroll}>
        {!!error && (<View style={styles.errorBox}><Text style={styles.errorText}>⚠️ {error}</Text></View>)}

        <Card>
          <Text style={styles.sectionTitle}>Ajouter une photo</Text>
          <View style={styles.uploadRow}>
            <TouchableOpacity style={styles.uploadBtn} onPress={pickFromGallery}
              disabled={uploading} activeOpacity={0.7}>
              <Text style={styles.uploadBtnIcon}>🖼️</Text>
              <Text style={styles.uploadBtnText}>Galerie</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.uploadBtn} onPress={takePhoto}
              disabled={uploading} activeOpacity={0.7}>
              <Text style={styles.uploadBtnIcon}>📷</Text>
              <Text style={styles.uploadBtnText}>Caméra</Text>
            </TouchableOpacity>
          </View>
          {uploading && (
            <View style={styles.uploadingBox}>
              <ActivityIndicator color={colors.accent} />
              <Text style={styles.uploadingText}>Upload en cours...</Text>
            </View>
          )}
        </Card>

        <Text style={styles.sectionTitleOutside}>Photos ({photos.length})</Text>

        {photos.length === 0 ? (
          <EmptyState icon="📷" title="Aucune photo" message="Ajoutez des photos liées à ce devis." />
        ) : (
          <View style={styles.grid}>
            {photos.map((p) => (
              <TouchableOpacity key={p.id} style={styles.photoCell}
                onPress={() => setPreview(p)} onLongPress={() => removePhoto(p)}
                activeOpacity={0.7}>
                <Image source={{ uri: p.url }} style={styles.photoImage} resizeMode="cover" />
                {p.caption ? (
                  <View style={styles.captionOverlay}>
                    <Text style={styles.captionText} numberOfLines={1}>{p.caption}</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.hint}>Appui long sur une photo pour la supprimer.</Text>
      </ScrollView>

      <Modal visible={captionOpen} transparent animationType="slide"
        onRequestClose={() => setCaptionOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Légende (optionnel)</Text>
            {pendingImage && (
              <Image source={{ uri: pendingImage.uri }} style={styles.previewImage} resizeMode="contain" />
            )}
            <Input label="Légende" value={caption} onChangeText={setCaption} placeholder="Ex: Avant travaux" />
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => { setCaptionOpen(false); setPendingImage(null); }}>
                <Text style={styles.modalBtnCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnConfirm]}
                onPress={confirmUpload}>
                <Text style={styles.modalBtnConfirmText}>Uploader</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={!!preview} transparent animationType="fade"
        onRequestClose={() => setPreview(null)}>
        <View style={styles.previewOverlay}>
          <TouchableOpacity style={styles.previewClose} onPress={() => setPreview(null)}>
            <Text style={styles.previewCloseText}>✕</Text>
          </TouchableOpacity>
          {preview && (
            <>
              <Image source={{ uri: preview.url }} style={styles.previewFull} resizeMode="contain" />
              {preview.caption ? <Text style={styles.previewCaption}>{preview.caption}</Text> : null}
            </>
          )}
        </View>
      </Modal>
    </SafeAreaView>
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
  uploadRow: { flexDirection: 'row', gap: spacing.sm },
  uploadBtn: {
    flex: 1, paddingVertical: spacing.lg, borderRadius: radius.md,
    borderWidth: 2, borderStyle: 'dashed', borderColor: colors.borderLight,
    alignItems: 'center', justifyContent: 'center',
  },
  uploadBtnIcon: { fontSize: 28, marginBottom: spacing.sm },
  uploadBtnText: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600' },
  uploadingBox: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  uploadingText: { color: colors.textSecondary, fontSize: fontSize.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  photoCell: {
    width: '48%', aspectRatio: 1, borderRadius: radius.md,
    overflow: 'hidden', backgroundColor: colors.bgCard,
    borderWidth: 1, borderColor: colors.border,
  },
  photoImage: { width: '100%', height: '100%' },
  captionOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)', padding: spacing.sm,
  },
  captionText: { color: '#fff', fontSize: 10 },
  hint: { color: colors.textMuted, fontSize: fontSize.xs, textAlign: 'center', marginTop: spacing.lg },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  modalBox: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg, padding: spacing.lg,
    width: '100%', maxWidth: 500, borderWidth: 1, borderColor: colors.borderLight,
  },
  modalTitle: { color: colors.text, fontSize: fontSize.lg, fontWeight: '800', marginBottom: spacing.lg },
  previewImage: { width: '100%', height: 200, borderRadius: radius.md, marginBottom: spacing.md, backgroundColor: colors.bg },
  modalActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', minHeight: 44 },
  modalBtnCancel: { backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.borderLight },
  modalBtnCancelText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600' },
  modalBtnConfirm: { backgroundColor: colors.accent },
  modalBtnConfirmText: { color: '#0b1120', fontSize: fontSize.sm, fontWeight: '700' },
  previewOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center', alignItems: 'center', padding: spacing.lg,
  },
  previewClose: {
    position: 'absolute', top: 50, right: 20, zIndex: 10,
    width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  previewCloseText: { color: '#fff', fontSize: 22, fontWeight: '700' },
  previewFull: { width: '100%', height: '70%' },
  previewCaption: { color: '#fff', fontSize: fontSize.md, marginTop: spacing.lg, textAlign: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)', borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.lg,
  },
  errorText: { color: colors.error, fontSize: fontSize.sm },
});