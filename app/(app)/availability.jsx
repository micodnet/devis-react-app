import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  TouchableOpacity, Alert, RefreshControl, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { appointmentsApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';

const WEEKDAYS = [
  { id: 1, label: 'Lundi' },
  { id: 2, label: 'Mardi' },
  { id: 3, label: 'Mercredi' },
  { id: 4, label: 'Jeudi' },
  { id: 5, label: 'Vendredi' },
  { id: 6, label: 'Samedi' },
  { id: 0, label: 'Dimanche' },
];

export default function AvailabilityScreen() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalWeekday, setModalWeekday] = useState(1);
  const [modalStart, setModalStart] = useState('09:00');
  const [modalEnd, setModalEnd] = useState('17:00');
  const [saving, setSaving] = useState(false);

  const loadAvailability = async () => {
    try {
      setError('');
      const res = await appointmentsApi.availability();
      setData(res);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAvailability();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadAvailability();
  };

  const openModal = (weekday) => {
    setModalWeekday(weekday);
    setModalStart('09:00');
    setModalEnd('17:00');
    setModalOpen(true);
  };

  const saveAvailability = async () => {
    if (!modalStart || !modalEnd || modalStart >= modalEnd) {
      Alert.alert('Erreur', 'Heures invalides.');
      return;
    }
    setSaving(true);
    try {
      await appointmentsApi.addAvailability({
        weekday: modalWeekday,
        startTime: modalStart,
        endTime: modalEnd,
      });
      setModalOpen(false);
      await loadAvailability();
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  const removeAvailability = (id) => {
    Alert.alert('Supprimer', 'Supprimer cette plage ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await appointmentsApi.removeAvailability(id);
            await loadAvailability();
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
        <Header title="Disponibilités" showBack />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Disponibilités" showBack />
      <ScrollView
        contentContainerStyle={styles.scroll}
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

        <Card>
          <Text style={styles.hint}>
            Définissez vos plages horaires par jour. Les clients ne pourront
            réserver que dans ces créneaux.
          </Text>
        </Card>

        {WEEKDAYS.map((day) => {
          const slots = data?.slots?.[day.id] || [];
          return (
            <Card key={day.id}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayName}>{day.label}</Text>
                <TouchableOpacity
                  style={styles.addBtnSmall}
                  onPress={() => openModal(day.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.addBtnSmallText}>+ Ajouter</Text>
                </TouchableOpacity>
              </View>

              {slots.length === 0 ? (
                <Text style={styles.emptyDay}>Aucune plage définie</Text>
              ) : (
                <View style={styles.slotsWrap}>
                  {slots.map((s) => (
                    <View key={s.id} style={styles.slotChip}>
                      <Text style={styles.slotText}>
                        {s.startTime?.slice(0, 5)} - {s.endTime?.slice(0, 5)}
                      </Text>
                      <TouchableOpacity onPress={() => removeAvailability(s.id)}>
                        <Text style={styles.removeText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </Card>
          );
        })}
      </ScrollView>

      <Modal
        visible={modalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              Ajouter une plage — {WEEKDAYS.find((w) => w.id === modalWeekday)?.label}
            </Text>
            <Input label="Heure début (HH:MM)" value={modalStart} onChangeText={setModalStart} />
            <Input label="Heure fin (HH:MM)" value={modalEnd} onChangeText={setModalEnd} />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setModalOpen(false)}
                disabled={saving}
              >
                <Text style={styles.modalBtnCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnConfirm]}
                onPress={saveAvailability}
                disabled={saving}
              >
                <Text style={styles.modalBtnConfirmText}>
                  {saving ? '...' : 'Ajouter'}
                </Text>
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
  hint: { color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 20 },
  dayHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: spacing.md,
  },
  dayName: { color: colors.text, fontSize: fontSize.md, fontWeight: '700' },
  addBtnSmall: {
    backgroundColor: colors.accent, paddingHorizontal: spacing.md,
    paddingVertical: 5, borderRadius: radius.full,
  },
  addBtnSmallText: { color: '#0b1120', fontSize: fontSize.xs, fontWeight: '700' },
  emptyDay: {
    color: colors.textMuted, fontSize: fontSize.sm,
    fontStyle: 'italic', textAlign: 'center', paddingVertical: spacing.md,
  },
  slotsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  slotChip: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.bgInput, borderWidth: 1,
    borderColor: colors.borderLight, borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: 6,
  },
  slotText: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600' },
  removeText: { color: colors.error, fontSize: 14, fontWeight: '700', paddingLeft: 4 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center', alignItems: 'center', padding: spacing.lg,
  },
  modalBox: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    padding: spacing.lg, width: '100%', maxWidth: 400,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  modalTitle: {
    color: colors.text, fontSize: fontSize.md,
    fontWeight: '700', marginBottom: spacing.lg,
  },
  modalActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  modalBtn: {
    flex: 1, paddingVertical: 12, borderRadius: radius.full,
    alignItems: 'center', justifyContent: 'center', minHeight: 44,
  },
  modalBtnCancel: {
    backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.borderLight,
  },
  modalBtnCancelText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600' },
  modalBtnConfirm: { backgroundColor: colors.accent },
  modalBtnConfirmText: { color: '#0b1120', fontSize: fontSize.sm, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)', borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.lg,
  },
  errorText: { color: colors.error, fontSize: fontSize.sm },
});