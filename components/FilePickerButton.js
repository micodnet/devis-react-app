import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';
import { colors, radius, spacing, fontSize } from '../lib/theme';

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export default function FilePickerButton({ onFileSelected, selectedFile }) {
  const [loading, setLoading] = useState(false);

  const pickFile = async () => {
    try {
      setLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ACCEPTED_TYPES,
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) {
        setLoading(false);
        return;
      }

      const asset = result.assets?.[0];
      if (!asset) {
        setLoading(false);
        return;
      }

      // Sur web, l'asset contient le File natif dans .file
      // Sur mobile, on a .uri + .name + .mimeType
      if (Platform.OS === 'web') {
        onFileSelected({
          file: asset.file || asset,   // File natif web
          name: asset.name || 'document',
          mimeType: asset.mimeType || 'application/octet-stream',
          size: asset.size || 0,
          isWeb: true,
        });
      } else {
        onFileSelected({
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType || 'application/octet-stream',
          size: asset.size,
          isWeb: false,
        });
      }
    } catch (err) {
      console.warn('Erreur pick document:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    onFileSelected(null);
  };

  if (selectedFile) {
    return (
      <View style={styles.fileSelectedBox}>
        <View style={styles.fileInfo}>
          <Text style={styles.fileIcon}>📎</Text>
          <View style={styles.fileTextWrap}>
            <Text style={styles.fileName} numberOfLines={1}>
              {selectedFile.name}
            </Text>
            {selectedFile.size ? (
              <Text style={styles.fileSize}>
                {(selectedFile.size / 1024).toFixed(0)} Ko
              </Text>
            ) : null}
          </View>
        </View>
        <TouchableOpacity onPress={clearFile} style={styles.clearBtn}>
          <Text style={styles.clearText}>✕</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.dropZone}
      onPress={pickFile}
      disabled={loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={colors.accent} />
      ) : (
        <>
          <Text style={styles.dropIcon}>📄</Text>
          <Text style={styles.dropTitle}>Déposez votre fichier</Text>
          <Text style={styles.dropSub}>
            PDF, Word, Excel, CSV, TXT
          </Text>
          <Text style={styles.dropSub}>ou cliquez pour parcourir</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  dropZone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.borderLight,
    borderRadius: radius.lg,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  dropIcon: {
    fontSize: 40,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  dropTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: 4,
  },
  dropSub: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  fileSelectedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
    minWidth: 0,
  },
  fileIcon: { fontSize: 24 },
  fileTextWrap: { flex: 1, minWidth: 0 },
  fileName: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  fileSize: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  clearBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: 'rgba(248,113,113,0.15)',
  },
  clearText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '700',
  },
});