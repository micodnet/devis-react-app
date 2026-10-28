import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity,
  RefreshControl, Alert, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { webhooksApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';

export default function WebhooksScreen() {
  const [webhooks, setWebhooks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formUrl, setFormUrl] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formEvents, setFormEvents] = useState([]);
  const [formActive, setFormActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [deliveries, setDeliveries] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyTitle, setHistoryTitle] = useState('');

  const loadAll = async () => {
    try {
      setError('');
      const [wh, ev] = await Promise.all([
        webhooksApi.list().catch(() => []),
        webhooksApi.events().catch(() => []),
      ]);
      setWebhooks(Array.isArray(wh) ? wh : []);
      setEvents(Array.isArray(ev) ? ev : []);
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
    setEditing(null);
    setFormUrl('');
    setFormDesc('');
    setFormEvents([]);
    setFormActive(true);
    setCreateOpen(true);
  };

  const openEdit = (wh) => {
    setEditing(wh);
    setFormUrl(wh.url);
    setFormDesc(wh.description || '');
    setFormEvents(wh.events || []);
    setFormActive(wh.active);
    setCreateOpen(true);
  };

  const toggleEvent = (key) => {
    setFormEvents((prev) =>
      prev.includes(key) ? prev.filter((e) => e !== key) : [...prev, key]
    );
  };

  const save = async () => {
    if (!formUrl.trim()) {
      Alert.alert('Erreur', 'URL requise.');
      return;
    }
    if (formEvents.length === 0) {
      Alert.alert('Erreur', 'Sélectionnez au moins un événement.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        url: formUrl.trim(),
        description: formDesc.trim() || null,
        events: formEvents,
        active: formActive,
      };
      if (editing) {
        await webhooksApi.update(editing.id, payload);
      } else {
        const res = await webhooksApi.create(payload);
        if (res?.webhook?.secret) {
          Alert.alert('Webhook créé', `Secret (à conserver) :\n\n${res.webhook.secret}`);
        }
      }
      setCreateOpen(false);
      await loadAll();
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  const removeWh = (wh) => {
    Alert.alert('Supprimer', `Supprimer "${wh.description || wh.url}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await webhooksApi.remove(wh.id);
            await loadAll();
          } catch (err) {
            Alert.alert('Erreur', err.response?.data?.error || err.message);
          }
        },
      },
    ]);
  };

  const testWh = async (wh) => {
    try {
      const res = await webhooksApi.test(wh.id);
      if (res.success) {
        Alert.alert('Succès', `Statut HTTP ${res.status} (${res.durationMs}ms)`);
      } else {
        Alert.alert('Échec', res.error || `Statut HTTP ${res.status}`);
      }
      await loadAll();
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || err.message);
    }
  };

  const openHistory = async (wh) => {
    setHistoryOpen(true);
    setHistoryTitle(wh.description || wh.url);
    setHistoryLoading(true);
    try {
      const data = await webhooksApi.deliveries(wh.id);
      setDeliveries(Array.isArray(data) ? data : []);
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || err.message);
      setDeliveries([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Webhooks" showBack />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header
        title="Webhooks"
        showBack
        right={
          <TouchableOpacity style={styles.newBtn} onPress={openCreate} activeOpacity={0.7}>
            <Text style={styles.newBtnText}>+ Nouveau</Text>
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
            Les webhooks envoient une requête HTTP POST à l'URL de votre choix
            lorsqu'un événement se produit (devis signé, facture payée...).
          </Text>
        </Card>

        {webhooks.length === 0 ? (
          <EmptyState icon="🔔" title="Aucun webhook" message="Créez votre premier webhook." />
        ) : (
          webhooks.map((wh) => {
            const successRate = wh.totalDeliveries > 0
              ? Math.round((wh.successCount / wh.totalDeliveries) * 100)
              : 100;
            return (
              <Card key={wh.id}>
                <View style={styles.whHeader}>
                  <Text style={styles.whDesc} numberOfLines={1}>
                    {wh.description || 'Sans description'}
                  </Text>
                  <View style={[styles.statusBadge, {
                    backgroundColor: wh.active ? 'rgba(34,197,94,0.15)' : 'rgba(148,163,184,0.15)',
                    borderColor: wh.active ? 'rgba(34,197,94,0.4)' : 'rgba(148,163,184,0.4)',
                  }]}>
                    <Text style={[styles.statusText, { color: wh.active ? colors.success : colors.textMuted }]}>
                      {wh.active ? 'Actif' : 'Inactif'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.whUrl} numberOfLines={2}>{wh.url}</Text>
                <View style={styles.tagsRow}>
                  {(wh.events || []).map((e) => (
                    <View key={e} style={styles.tag}>
                      <Text style={styles.tagText}>{e}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.statsMini}>
                  <Text style={styles.statsMiniText}>
                    {wh.totalDeliveries || 0} livraisons · Succès {successRate}%
                  </Text>
                </View>
                <View style={styles.whActions}>
                  <TouchableOpacity style={[styles.whBtn, styles.whBtnSecondary]}
                    onPress={() => testWh(wh)} activeOpacity={0.7}>
                    <Text style={styles.whBtnSecondaryText}>Tester</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.whBtn, styles.whBtnSecondary]}
                    onPress={() => openHistory(wh)} activeOpacity={0.7}>
                    <Text style={styles.whBtnSecondaryText}>Historique</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.whBtn, styles.whBtnSecondary]}
                    onPress={() => openEdit(wh)} activeOpacity={0.7}>
                    <Text style={styles.whBtnSecondaryText}>Modifier</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.whBtn, styles.whBtnDanger]}
                    onPress={() => removeWh(wh)} activeOpacity={0.7}>
                    <Text style={styles.whBtnDangerText}>Suppr.</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>

      {/* Modal création/édition */}
      <Modal visible={createOpen} transparent animationType="slide" onRequestClose={() => setCreateOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <ScrollView>
              <Text style={styles.modalTitle}>
                {editing ? 'Modifier le webhook' : 'Nouveau webhook'}
              </Text>
              <Input label="URL *" value={formUrl} onChangeText={setFormUrl}
                placeholder="https://hooks.zapier.com/..." autoCapitalize="none" />
              <Input label="Description" value={formDesc} onChangeText={setFormDesc} />

              <Text style={styles.fieldLabel}>Événements</Text>
              {events.map((ev) => {
                const active = formEvents.includes(ev.key);
                return (
                  <TouchableOpacity key={ev.key} style={styles.checkboxRow}
                    onPress={() => toggleEvent(ev.key)} activeOpacity={0.7}>
                    <View style={[styles.checkbox, active && styles.checkboxOn]}>
                      {active && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.checkboxLabel}>{ev.label}</Text>
                      <Text style={styles.checkboxSub}>{ev.key}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity style={styles.checkboxRow}
                onPress={() => setFormActive(!formActive)} activeOpacity={0.7}>
                <View style={[styles.checkbox, formActive && styles.checkboxOn]}>
                  {formActive && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Webhook actif</Text>
              </TouchableOpacity>

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]}
                  onPress={() => setCreateOpen(false)} disabled={saving}>
                  <Text style={styles.modalBtnCancelText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnConfirm]}
                  onPress={save} disabled={saving}>
                  <Text style={styles.modalBtnConfirmText}>{saving ? '...' : 'Enregistrer'}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal historique */}
      <Modal visible={historyOpen} transparent animationType="slide" onRequestClose={() => setHistoryOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle} numberOfLines={1}>
              Historique — {historyTitle}
            </Text>
            {historyLoading ? (
              <ActivityIndicator color={colors.accent} />
            ) : deliveries.length === 0 ? (
              <Text style={styles.empty}>Aucune livraison.</Text>
            ) : (
              <ScrollView style={{ maxHeight: 400 }}>
                {deliveries.map((d) => {
                  const color = d.success ? colors.success : colors.error;
                  return (
                    <View key={d.id} style={[styles.deliveryRow, { borderLeftColor: color }]}>
                      <View style={styles.deliveryHeader}>
                        <Text style={[styles.deliveryStatus, { color }]}>
                          {d.success ? '✓' : '✕'} {d.eventType}
                        </Text>
                        <Text style={styles.deliveryDate}>
                          {new Date(d.createdAt).toLocaleString('fr-FR')}
                        </Text>
                      </View>
                      <Text style={styles.deliveryMeta}>
                        HTTP {d.responseStatus || '—'} · {d.durationMs || 0}ms · tentative {d.attempt}
                      </Text>
                      {d.errorMessage ? (
                        <Text style={styles.deliveryError}>{d.errorMessage}</Text>
                      ) : null}
                    </View>
                  );
                })}
              </ScrollView>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnConfirm]}
                onPress={() => setHistoryOpen(false)}>
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
  newBtn: { backgroundColor: colors.accent, paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.full },
  newBtnText: { color: '#0b1120', fontSize: fontSize.xs, fontWeight: '700' },
  hint: { color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 20 },
  whHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
  whDesc: { color: colors.text, fontSize: fontSize.md, fontWeight: '700', flex: 1 },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full, borderWidth: 1 },
  statusText: { fontSize: 10, fontWeight: '700' },
  whUrl: { color: colors.textMuted, fontSize: fontSize.xs, fontFamily: 'monospace', marginBottom: spacing.md },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  tag: {
    paddingHorizontal: spacing.sm, paddingVertical: 3,
    borderRadius: radius.full, backgroundColor: colors.bgInput,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  tagText: { color: colors.textSecondary, fontSize: 10, fontWeight: '600' },
  statsMini: { marginBottom: spacing.md },
  statsMiniText: { color: colors.textMuted, fontSize: fontSize.xs },
  whActions: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  whBtn: { paddingVertical: 6, paddingHorizontal: spacing.md, borderRadius: radius.full, alignItems: 'center' },
  whBtnSecondary: { backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.borderLight },
  whBtnSecondaryText: { color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: '600' },
  whBtnDanger: { backgroundColor: 'rgba(248,113,113,0.1)', borderWidth: 1, borderColor: 'rgba(248,113,113,0.4)' },
  whBtnDangerText: { color: colors.error, fontSize: fontSize.xs, fontWeight: '600' },
  fieldLabel: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600', marginTop: spacing.md, marginBottom: spacing.sm },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: colors.borderLight, alignItems: 'center', justifyContent: 'center' },
  checkboxOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '800' },
  checkboxLabel: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600' },
  checkboxSub: { color: colors.textMuted, fontSize: 10, marginTop: 2, fontFamily: 'monospace' },
  deliveryRow: {
    paddingVertical: spacing.md, paddingLeft: spacing.md,
    borderLeftWidth: 3, marginBottom: spacing.sm,
  },
  deliveryHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md, marginBottom: 4 },
  deliveryStatus: { fontSize: fontSize.sm, fontWeight: '700', flex: 1 },
  deliveryDate: { color: colors.textMuted, fontSize: 10 },
  deliveryMeta: { color: colors.textSecondary, fontSize: fontSize.xs },
  deliveryError: { color: colors.error, fontSize: fontSize.xs, marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  modalBox: { backgroundColor: colors.bgCard, borderRadius: radius.lg, padding: spacing.lg, width: '100%', maxWidth: 500, maxHeight: '85%', borderWidth: 1, borderColor: colors.borderLight },
  modalTitle: { color: colors.text, fontSize: fontSize.lg, fontWeight: '800', marginBottom: spacing.lg },
  modalActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', minHeight: 44 },
  modalBtnCancel: { backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.borderLight },
  modalBtnCancelText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600' },
  modalBtnConfirm: { backgroundColor: colors.accent },
  modalBtnConfirmText: { color: '#0b1120', fontSize: fontSize.sm, fontWeight: '700' },
  empty: { color: colors.textMuted, fontSize: fontSize.sm, fontStyle: 'italic', textAlign: 'center', paddingVertical: spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.35)',
    borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg,
  },
  errorText: { color: colors.error, fontSize: fontSize.sm },
});