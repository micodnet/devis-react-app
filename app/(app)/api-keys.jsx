import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity,
  RefreshControl, Alert, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { apiKeysApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';

const SCOPE_LABELS = { read: 'Lecture', write: 'Écriture', admin: 'Admin' };

export default function ApiKeysScreen() {
  const [keys, setKeys] = useState([]);
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newScopes, setNewScopes] = useState(['read']);
  const [newRateLimit, setNewRateLimit] = useState('1000');
  const [creating, setCreating] = useState(false);
  const [secretKey, setSecretKey] = useState(null);

  const loadAll = async () => {
    try {
      setError('');
      const [k, st, lg] = await Promise.all([
        apiKeysApi.list().catch(() => []),
        apiKeysApi.stats().catch(() => null),
        apiKeysApi.logs(50).catch(() => []),
      ]);
      setKeys(Array.isArray(k) ? k : []);
      setStats(st);
      setLogs(Array.isArray(lg) ? lg : []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadAll();
  };

  const toggleScope = (scope) => {
    setNewScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  };

  const createKey = async () => {
    if (!newKeyName.trim()) {
      Alert.alert('Erreur', 'Nom requis.');
      return;
    }
    if (newScopes.length === 0) {
      Alert.alert('Erreur', 'Sélectionnez au moins une permission.');
      return;
    }
    setCreating(true);
    try {
      const res = await apiKeysApi.create({
        name: newKeyName.trim(),
        scopes: newScopes,
        rateLimit: parseInt(newRateLimit) || 1000,
      });
      setSecretKey(res.secretKey);
      setCreateOpen(false);
      setNewKeyName('');
      setNewScopes(['read']);
      setNewRateLimit('1000');
      await loadAll();
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || err.message);
    } finally {
      setCreating(false);
    }
  };

  const copySecret = async () => {
    if (!secretKey) return;
    try {
      await Clipboard.setStringAsync(secretKey);
      Alert.alert('Copié', 'Clé copiée dans le presse-papier');
    } catch (err) {
      Alert.alert('Clé', secretKey);
    }
  };

  const revokeKey = (id, name) => {
    Alert.alert('Révoquer', `Révoquer la clé "${name}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Révoquer',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiKeysApi.revoke(id);
            await loadAll();
          } catch (err) {
            Alert.alert('Erreur', err.response?.data?.error || err.message);
          }
        },
      },
    ]);
  };

  const removeKey = (id, name) => {
    Alert.alert('Supprimer', `Supprimer définitivement "${name}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiKeysApi.remove(id);
            await loadAll();
          } catch (err) {
            Alert.alert('Erreur', err.response?.data?.error || err.message);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Clés API" showBack />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header
        title="Clés API"
        showBack
        right={
          <TouchableOpacity
            style={styles.newBtn}
            onPress={() => { setSecretKey(null); setCreateOpen(true); }}
            activeOpacity={0.7}
          >
            <Text style={styles.newBtnText}>+ Nouvelle</Text>
          </TouchableOpacity>
        }
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
            tintColor={colors.accent} colors={[colors.accent]} />
        }
      >
        {!!error && (<View style={styles.errorBox}><Text style={styles.errorText}>⚠️ {error}</Text></View>)}

        <Card>
          <Text style={styles.hint}>
            Utilisez les clés API pour connecter vos outils externes (Zapier,
            Make, scripts) à Devis Express Pro. Chaque clé a des permissions
            limitées et un historique d'appels.
          </Text>
        </Card>

        {keys.length === 0 ? (
          <EmptyState icon="🗃" title="Aucune clé API" message="Créez votre première clé." />
        ) : (
          <Card>
            <Text style={styles.sectionTitle}>Mes clés ({keys.length})</Text>
            {keys.map((k) => {
              const isActive = k.active && !k.revokedAt;
              return (
                <View key={k.id} style={styles.keyRow}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.keyName} numberOfLines={1}>{k.name}</Text>
                    <Text style={styles.keyPrefix}>{k.prefix}…</Text>
                    <Text style={styles.keyScopes}>
                      {(k.scopes || []).map((s) => SCOPE_LABELS[s] || s).join(' · ')} · {k.rateLimit}/h
                    </Text>
                    <Text style={styles.keyLastUsed}>
                      {k.lastUsedAt
                        ? `Dernière : ${new Date(k.lastUsedAt).toLocaleString('fr-FR')}`
                        : 'Jamais utilisée'}
                    </Text>
                    <View style={[styles.statusBadge, {
                      backgroundColor: isActive ? 'rgba(34,197,94,0.15)' : 'rgba(248,113,113,0.15)',
                      borderColor: isActive ? 'rgba(34,197,94,0.4)' : 'rgba(248,113,113,0.4)',
                    }]}>
                      <Text style={[styles.statusText, { color: isActive ? colors.success : colors.error }]}>
                        {isActive ? 'Active' : 'Révoquée'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.keyActions}>
                    {isActive && (
                      <TouchableOpacity style={[styles.smallBtn, styles.smallBtnWarning]}
                        onPress={() => revokeKey(k.id, k.name)} activeOpacity={0.7}>
                        <Text style={styles.smallBtnWarningText}>Révoquer</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity style={[styles.smallBtn, styles.smallBtnDanger]}
                      onPress={() => removeKey(k.id, k.name)} activeOpacity={0.7}>
                      <Text style={styles.smallBtnDangerText}>Suppr.</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </Card>
        )}

        {stats && (
          <Card>
            <Text style={styles.sectionTitle}>📊 Statistiques</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{stats.last24h?.calls || 0}</Text>
                <Text style={styles.statLabel}>24h</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statNumber, stats.last24h?.errors > 0 && { color: colors.error }]}>
                  {stats.last24h?.errors || 0}
                </Text>
                <Text style={styles.statLabel}>Erreurs 24h</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{stats.last7days?.calls || 0}</Text>
                <Text style={styles.statLabel}>7 jours</Text>
              </View>
            </View>
          </Card>
        )}

        {logs.length > 0 && (
          <Card>
            <Text style={styles.sectionTitle}>📜 Derniers appels</Text>
            {logs.slice(0, 20).map((log) => {
              const isError = log.statusCode >= 400;
              return (
                <View key={log.id} style={styles.logRow}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.logEndpoint} numberOfLines={1}>
                      <Text style={styles.logMethod}>{log.method}</Text> {log.endpoint}
                    </Text>
                    <Text style={styles.logDate}>
                      {new Date(log.createdAt).toLocaleString('fr-FR')} · {log.keyName || '—'}
                    </Text>
                  </View>
                  <Text style={[styles.logStatus, { color: isError ? colors.error : colors.success }]}>
                    {log.statusCode}
                  </Text>
                </View>
              );
            })}
          </Card>
        )}
      </ScrollView>

      {/* Modal création */}
      <Modal visible={createOpen} transparent animationType="slide" onRequestClose={() => setCreateOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <ScrollView>
              <Text style={styles.modalTitle}>Nouvelle clé API</Text>
              <Input
                label="Nom *"
                value={newKeyName}
                onChangeText={setNewKeyName}
                placeholder="Intégration Zapier"
              />

              <Text style={styles.fieldLabel}>Permissions</Text>
              {['read', 'write', 'admin'].map((scope) => {
                const active = newScopes.includes(scope);
                return (
                  <TouchableOpacity
                    key={scope}
                    style={styles.checkboxRow}
                    onPress={() => toggleScope(scope)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.checkbox, active && styles.checkboxOn]}>
                      {active && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.checkboxLabel}>{SCOPE_LABELS[scope]}</Text>
                      <Text style={styles.checkboxSub}>
                        {scope === 'read' && 'Consulter devis, clients, produits'}
                        {scope === 'write' && 'Créer et modifier'}
                        {scope === 'admin' && 'Accès complet'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              <Input
                label="Limite par heure"
                value={newRateLimit}
                onChangeText={setNewRateLimit}
                keyboardType="numeric"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]}
                  onPress={() => setCreateOpen(false)} disabled={creating}>
                  <Text style={styles.modalBtnCancelText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnConfirm]}
                  onPress={createKey} disabled={creating}>
                  <Text style={styles.modalBtnConfirmText}>
                    {creating ? '...' : 'Créer'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal secret key */}
      <Modal visible={!!secretKey} transparent animationType="slide" onRequestClose={() => setSecretKey(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>✅ Clé créée</Text>
            <Text style={styles.hint}>Copiez cette clé maintenant. Elle ne sera plus jamais affichée.</Text>
            <View style={styles.secretBox}>
              <Text style={styles.secretText} selectable>{secretKey}</Text>
            </View>
            <TouchableOpacity style={styles.copyBtn} onPress={copySecret} activeOpacity={0.7}>
              <Text style={styles.copyBtnText}>📋 Copier la clé</Text>
            </TouchableOpacity>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnConfirm]}
                onPress={() => setSecretKey(null)}>
                <Text style={styles.modalBtnConfirmText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  newBtn: {
    backgroundColor: colors.accent, paddingHorizontal: spacing.md,
    paddingVertical: 6, borderRadius: radius.full,
  },
  newBtnText: { color: '#0b1120', fontSize: fontSize.xs, fontWeight: '700' },
  sectionTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700', marginBottom: spacing.md },
  hint: { color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 20 },
  keyRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md,
    paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  keyName: { color: colors.text, fontSize: fontSize.sm, fontWeight: '700' },
  keyPrefix: { color: colors.accent, fontSize: fontSize.xs, fontFamily: 'monospace', marginTop: 2 },
  keyScopes: { color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 4 },
  keyLastUsed: { color: colors.textMuted, fontSize: 10, marginTop: 2 },
  statusBadge: {
    alignSelf: 'flex-start', marginTop: spacing.sm,
    paddingHorizontal: spacing.sm, paddingVertical: 2,
    borderRadius: radius.full, borderWidth: 1,
  },
  statusText: { fontSize: 10, fontWeight: '700' },
  keyActions: { flexDirection: 'column', gap: spacing.sm, flexShrink: 0 },
  smallBtn: {
    paddingHorizontal: spacing.md, paddingVertical: 6,
    borderRadius: radius.full, alignItems: 'center',
  },
  smallBtnWarning: { backgroundColor: 'rgba(234,179,8,0.1)', borderWidth: 1, borderColor: 'rgba(234,179,8,0.4)' },
  smallBtnWarningText: { color: colors.warning, fontSize: fontSize.xs, fontWeight: '600' },
  smallBtnDanger: { backgroundColor: 'rgba(248,113,113,0.1)', borderWidth: 1, borderColor: 'rgba(248,113,113,0.4)' },
  smallBtnDangerText: { color: colors.error, fontSize: fontSize.xs, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statBox: {
    flex: 1, minWidth: '30%', padding: spacing.md,
    borderRadius: radius.md, backgroundColor: colors.bgInput, alignItems: 'center',
  },
  statNumber: { color: colors.text, fontSize: fontSize.lg, fontWeight: '800' },
  statLabel: { color: colors.textMuted, fontSize: 10, textTransform: 'uppercase', marginTop: 4 },
  logRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md,
    paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  logEndpoint: { color: colors.text, fontSize: fontSize.xs, fontFamily: 'monospace' },
  logMethod: { color: colors.accent, fontWeight: '700' },
  logDate: { color: colors.textMuted, fontSize: 10, marginTop: 2 },
  logStatus: { fontSize: fontSize.sm, fontWeight: '800' },
  fieldLabel: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600', marginTop: spacing.md, marginBottom: spacing.sm },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: colors.borderLight, alignItems: 'center', justifyContent: 'center' },
  checkboxOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '800' },
  checkboxLabel: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600' },
  checkboxSub: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },
  secretBox: {
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.borderLight,
    borderRadius: radius.md, padding: spacing.md, marginVertical: spacing.md,
  },
  secretText: { color: colors.accent, fontSize: fontSize.xs, fontFamily: 'monospace' },
  copyBtn: {
    paddingVertical: 12, borderRadius: radius.full,
    backgroundColor: colors.accent, alignItems: 'center', marginBottom: spacing.md,
  },
  copyBtnText: { color: '#0b1120', fontSize: fontSize.sm, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  modalBox: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg, padding: spacing.lg,
    width: '100%', maxWidth: 500, maxHeight: '85%',
    borderWidth: 1, borderColor: colors.borderLight,
  },
  modalTitle: { color: colors.text, fontSize: fontSize.lg, fontWeight: '800', marginBottom: spacing.lg },
  modalActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', minHeight: 44 },
  modalBtnCancel: { backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.borderLight },
  modalBtnCancelText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600' },
  modalBtnConfirm: { backgroundColor: colors.accent },
  modalBtnConfirmText: { color: '#0b1120', fontSize: fontSize.sm, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)', borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.lg,
  },
  errorText: { color: colors.error, fontSize: fontSize.sm },
});