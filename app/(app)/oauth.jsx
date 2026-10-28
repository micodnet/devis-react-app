import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity,
  RefreshControl, Alert, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { oauthApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';

export default function OauthScreen() {
  const [clients, setClients] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [scopes, setScopes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formRedirects, setFormRedirects] = useState('');
  const [formScopes, setFormScopes] = useState(['read']);
  const [formPublic, setFormPublic] = useState(false);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(null);

  const loadAll = async () => {
    try {
      setError('');
      const [c, t, s] = await Promise.all([
        oauthApi.clients().catch(() => []),
        oauthApi.tokens().catch(() => []),
        oauthApi.scopes().catch(() => []),
      ]);
      setClients(Array.isArray(c) ? c : []);
      setTokens(Array.isArray(t) ? t : []);
      setScopes(Array.isArray(s) ? s : []);
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

  const openCreate = () => {
    setFormName('');
    setFormDesc('');
    setFormRedirects('');
    setFormScopes(['read']);
    setFormPublic(false);
    setCreated(null);
    setCreateOpen(true);
  };

  const toggleScope = (key) => {
    setFormScopes((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
  };

  const create = async () => {
    if (!formName.trim()) return Alert.alert('Erreur', 'Nom requis.');
    if (formScopes.length === 0) return Alert.alert('Erreur', 'Sélectionnez un scope.');

    const redirectUris = formRedirects.split('\n').map((l) => l.trim()).filter(Boolean);
    if (!formPublic && redirectUris.length === 0) {
      return Alert.alert('Erreur', 'Au moins une URL de redirection.');
    }

    setCreating(true);
    try {
      const res = await oauthApi.createClient({
        name: formName.trim(),
        description: formDesc.trim() || null,
        redirectUris,
        scopes: formScopes,
        isPublic: formPublic,
      });
      setCreated(res.client);
      await loadAll();
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || err.message);
    } finally {
      setCreating(false);
    }
  };

  const copy = async (text) => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert('Copié', 'Copié dans le presse-papier');
    } catch (err) {
      Alert.alert('Info', text);
    }
  };

  const removeClient = (id, name) => {
    Alert.alert('Supprimer', `Supprimer "${name}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await oauthApi.removeClient(id);
            await loadAll();
          } catch (err) {
            Alert.alert('Erreur', err.response?.data?.error || err.message);
          }
        },
      },
    ]);
  };

  const revokeToken = (id) => {
    Alert.alert('Révoquer', 'Révoquer ce jeton ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Révoquer',
        style: 'destructive',
        onPress: async () => {
          try {
            await oauthApi.revokeToken(id);
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
        <Header title="OAuth" showBack />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header
        title="OAuth"
        showBack
        right={
          <TouchableOpacity style={styles.newBtn} onPress={openCreate} activeOpacity={0.7}>
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
            OAuth permet à des applications tierces d'accéder à votre compte
            sans partager votre mot de passe.
          </Text>
        </Card>

        {clients.length === 0 ? (
          <EmptyState icon="🔐" title="Aucune application OAuth" message="Créez votre première application." />
        ) : (
          <Card>
            <Text style={styles.sectionTitle}>Applications ({clients.length})</Text>
            {clients.map((c) => (
              <View key={c.id} style={styles.clientRow}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.clientName} numberOfLines={1}>{c.name}</Text>
                  {c.description ? (
                    <Text style={styles.clientDesc} numberOfLines={1}>{c.description}</Text>
                  ) : null}
                  <Text style={styles.clientId} numberOfLines={1}>{c.clientId}</Text>
                  <View style={styles.tagsRow}>
                    {c.isPublic && <View style={styles.tag}><Text style={styles.tagText}>Public</Text></View>}
                    {(c.scopes || []).map((s) => (
                      <View key={s} style={styles.tag}><Text style={styles.tagText}>{s}</Text></View>
                    ))}
                  </View>
                </View>
                <TouchableOpacity style={[styles.smallBtn, styles.smallBtnDanger]}
                  onPress={() => removeClient(c.id, c.name)} activeOpacity={0.7}>
                  <Text style={styles.smallBtnDangerText}>Suppr.</Text>
                </TouchableOpacity>
              </View>
            ))}
          </Card>
        )}

        {tokens.length > 0 && (
          <Card>
            <Text style={styles.sectionTitle}>Jetons actifs ({tokens.length})</Text>
            {tokens.map((t) => (
              <View key={t.id} style={styles.tokenRow}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.tokenClient} numberOfLines={1}>
                    {t.clientName || t.clientId}
                  </Text>
                  <Text style={styles.tokenMeta}>
                    Expire : {new Date(t.expiresAt).toLocaleDateString('fr-FR')}
                  </Text>
                  <Text style={styles.tokenMeta}>
                    {(t.scopes || []).join(', ')}
                  </Text>
                </View>
                <TouchableOpacity style={[styles.smallBtn, styles.smallBtnDanger]}
                  onPress={() => revokeToken(t.id)} activeOpacity={0.7}>
                  <Text style={styles.smallBtnDangerText}>Révoquer</Text>
                </TouchableOpacity>
              </View>
            ))}
          </Card>
        )}
      </ScrollView>

      <Modal visible={createOpen} transparent animationType="slide" onRequestClose={() => setCreateOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <ScrollView>
              {!created ? (
                <>
                  <Text style={styles.modalTitle}>Nouvelle application OAuth</Text>
                  <Input label="Nom *" value={formName} onChangeText={setFormName} />
                  <Input label="Description" value={formDesc} onChangeText={setFormDesc} />
                  <Input label="URLs de redirection (une par ligne)" value={formRedirects}
                    onChangeText={setFormRedirects} multiline
                    placeholder="https://monapp.com/callback" />

                  <Text style={styles.fieldLabel}>Scopes</Text>
                  {scopes.map((s) => {
                    const active = formScopes.includes(s.key);
                    return (
                      <TouchableOpacity key={s.key} style={styles.checkboxRow}
                        onPress={() => toggleScope(s.key)} activeOpacity={0.7}>
                        <View style={[styles.checkbox, active && styles.checkboxOn]}>
                          {active && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.checkboxLabel}>{s.key}</Text>
                          <Text style={styles.checkboxSub}>{s.label}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}

                  <TouchableOpacity style={styles.checkboxRow}
                    onPress={() => setFormPublic(!formPublic)} activeOpacity={0.7}>
                    <View style={[styles.checkbox, formPublic && styles.checkboxOn]}>
                      {formPublic && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.checkboxLabel}>Application publique (sans client_secret)</Text>
                  </TouchableOpacity>

                  <View style={styles.modalActions}>
                    <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]}
                      onPress={() => setCreateOpen(false)} disabled={creating}>
                      <Text style={styles.modalBtnCancelText}>Annuler</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.modalBtn, styles.modalBtnConfirm]}
                      onPress={create} disabled={creating}>
                      <Text style={styles.modalBtnConfirmText}>{creating ? '...' : 'Créer'}</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.modalTitle}>✅ Application créée</Text>
                  <Text style={styles.hint}>Copiez ces identifiants maintenant.</Text>
                  <Text style={styles.fieldLabel}>Client ID</Text>
                  <View style={styles.copyBox}>
                    <Text style={styles.copyText} selectable>{created.clientId}</Text>
                  </View>
                  <TouchableOpacity style={styles.copyBtn}
                    onPress={() => copy(created.clientId)} activeOpacity={0.7}>
                    <Text style={styles.copyBtnText}>📋 Copier le Client ID</Text>
                  </TouchableOpacity>

                  {created.clientSecret && (
                    <>
                      <Text style={styles.fieldLabel}>Client Secret</Text>
                      <View style={styles.copyBox}>
                        <Text style={styles.copyText} selectable>{created.clientSecret}</Text>
                      </View>
                      <TouchableOpacity style={styles.copyBtn}
                        onPress={() => copy(created.clientSecret)} activeOpacity={0.7}>
                        <Text style={styles.copyBtnText}>📋 Copier le Client Secret</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  <View style={styles.modalActions}>
                    <TouchableOpacity style={[styles.modalBtn, styles.modalBtnConfirm]}
                      onPress={() => setCreateOpen(false)}>
                      <Text style={styles.modalBtnConfirmText}>Fermer</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  newBtn: { backgroundColor: colors.accent, paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.full },
  newBtnText: { color: '#0b1120', fontSize: fontSize.xs, fontWeight: '700' },
  sectionTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700', marginBottom: spacing.md },
  hint: { color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 20 },
  clientRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  clientName: { color: colors.text, fontSize: fontSize.sm, fontWeight: '700' },
  clientDesc: { color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2 },
  clientId: { color: colors.accent, fontSize: 10, fontFamily: 'monospace', marginTop: 4 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  tag: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full, backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.borderLight },
  tagText: { color: colors.textSecondary, fontSize: 10, fontWeight: '600' },
  smallBtn: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.full, alignItems: 'center' },
  smallBtnDanger: { backgroundColor: 'rgba(248,113,113,0.1)', borderWidth: 1, borderColor: 'rgba(248,113,113,0.4)' },
  smallBtnDangerText: { color: colors.error, fontSize: fontSize.xs, fontWeight: '600' },
  tokenRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  tokenClient: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600' },
  tokenMeta: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },
  fieldLabel: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600', marginTop: spacing.md, marginBottom: spacing.sm },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: colors.borderLight, alignItems: 'center', justifyContent: 'center' },
  checkboxOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '800' },
  checkboxLabel: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600' },
  checkboxSub: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },
  copyBox: { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.borderLight, borderRadius: radius.md, padding: spacing.md, marginVertical: spacing.sm },
  copyText: { color: colors.accent, fontSize: fontSize.xs, fontFamily: 'monospace' },
  copyBtn: { paddingVertical: 10, borderRadius: radius.full, backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.borderLight, alignItems: 'center' },
  copyBtnText: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  modalBox: { backgroundColor: colors.bgCard, borderRadius: radius.lg, padding: spacing.lg, width: '100%', maxWidth: 500, maxHeight: '85%', borderWidth: 1, borderColor: colors.borderLight },
  modalTitle: { color: colors.text, fontSize: fontSize.lg, fontWeight: '800', marginBottom: spacing.lg },
  modalActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', minHeight: 44 },
  modalBtnCancel: { backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.borderLight },
  modalBtnCancelText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600' },
  modalBtnConfirm: { backgroundColor: colors.accent },
  modalBtnConfirmText: { color: '#0b1120', fontSize: fontSize.sm, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.35)', borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg },
  errorText: { color: colors.error, fontSize: fontSize.sm },
});