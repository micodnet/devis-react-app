import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { assistantApi } from '../lib/api';
import { colors, radius, spacing, fontSize } from '../lib/theme';

export default function DraftCard({ draft, onConfirmed, onCancelled }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const confirm = async () => {
    setBusy(true);
    setError('');
    try {
      const data = await assistantApi.confirm(draft);
      setDone(true);
      if (onConfirmed) onConfirmed(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setBusy(false);
    }
  };

  const cancel = () => {
    setDone(true);
    if (onCancelled) onCancelled();
  };

  const summary = draft?.summary || 'Action proposée';
  const preview = draft?.preview || {};
  const items = draft?.payload?.items || [];

  return (
    <View style={[styles.card, done && styles.cardDone]}>
      <Text style={[styles.title, done && styles.titleDone]}>
        {done ? '✓ Action effectuée' : '⚡ Action proposée'}
      </Text>

      <Text style={styles.summary}>{summary}</Text>

      {Object.keys(preview).length > 0 && (
        <View style={styles.preview}>
          {Object.entries(preview).map(([key, value]) => (
            <View key={key} style={styles.previewRow}>
              <Text style={styles.previewKey}>{key}</Text>
              <Text style={styles.previewValue} numberOfLines={2}>
                {String(value)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {items.length > 0 && (
        <View style={styles.itemsWrap}>
          <Text style={styles.itemsTitle}>Détail ({items.length})</Text>
          {items.map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.itemQty}>{item.qty}</Text>
              <Text style={styles.itemTotal}>
                {(Number(item.total) || 0).toFixed(2)} €
              </Text>
            </View>
          ))}
        </View>
      )}

      {!!error && <Text style={styles.error}>⚠️ {error}</Text>}

      {!done && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btn, styles.btnCancel]}
            onPress={cancel}
            disabled={busy}
          >
            <Text style={styles.btnCancelText}>Annuler</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.btnConfirm, busy && styles.btnDisabled]}
            onPress={confirm}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator size="small" color="#0b1120" />
            ) : (
              <Text style={styles.btnConfirmText}>✓ Confirmer</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.accent,
    padding: spacing.lg,
    marginVertical: spacing.sm,
  },
  cardDone: {
    borderColor: colors.success,
    opacity: 0.85,
  },
  title: {
    color: colors.accent,
    fontSize: fontSize.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  titleDone: {
    color: colors.success,
  },
  summary: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  preview: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    gap: spacing.md,
  },
  previewKey: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
  },
  previewValue: {
    color: colors.text,
    fontSize: fontSize.xs,
    fontWeight: '500',
    flexShrink: 1,
    textAlign: 'right',
  },
  itemsWrap: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  itemsTitle: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: spacing.sm,
  },
  itemName: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.xs,
  },
  itemQty: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    width: 40,
    textAlign: 'center',
  },
  itemTotal: {
    color: colors.accent,
    fontSize: fontSize.xs,
    fontWeight: '700',
    width: 70,
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  btnCancel: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  btnCancelText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  btnConfirm: {
    backgroundColor: colors.accent,
  },
  btnConfirmText: {
    color: '#0b1120',
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  btnDisabled: { opacity: 0.6 },
  error: {
    color: colors.error,
    fontSize: fontSize.xs,
    marginTop: spacing.sm,
  },
});