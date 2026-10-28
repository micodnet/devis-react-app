import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  RefreshControl, TouchableOpacity, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { appointmentsApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';

const FILTERS = [
  { key: 'upcoming', label: 'À venir' },
  { key: 'pending', label: 'En attente' },
  { key: 'confirmed', label: 'Confirmés' },
  { key: 'past', label: 'Passés' },
  { key: 'cancelled', label: 'Annulés' },
  { key: 'all', label: 'Tous' },
];

const STATUS_LABELS = {
  pending: 'En attente',
  confirmed: 'Confirmé',
  completed: 'Terminé',
  cancelled: 'Annulé',
  no_show: 'Absent',
};

const STATUS_COLORS = {
  pending: '#eab308',
  confirmed: '#3b82f6',
  completed: '#22c55e',
  cancelled: '#94a3b8',
  no_show: '#f87171',
};

export default function AppointmentsScreen() {
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('upcoming');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadAppointments = async () => {
    try {
      setError('');
      const params = {};
      if (currentFilter === 'upcoming') params.upcoming = true;
      else if (currentFilter === 'past') {
        params.to = new Date().toISOString().slice(0, 10);
      } else if (currentFilter !== 'all') {
        params.status = currentFilter;
      }
      const data = await appointmentsApi.list(params);
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAppointments();
    }, [currentFilter])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadAppointments();
  };

  const confirmAppt = async (id) => {
    try {
      await appointmentsApi.setStatus(id, 'confirmed');
      await loadAppointments();
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || err.message);
    }
  };

  const completeAppt = async (id) => {
    try {
      await appointmentsApi.setStatus(id, 'completed');
      await loadAppointments();
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || err.message);
    }
  };

  const cancelAppt = (id) => {
    Alert.prompt
      ? Alert.prompt('Annuler le RDV', 'Raison (optionnel) :', async (reason) => {
          try {
            await appointmentsApi.setStatus(id, 'cancelled', reason || null);
            await loadAppointments();
          } catch (err) {
            Alert.alert('Erreur', err.response?.data?.error || err.message);
          }
        })
      : (async () => {
          try {
            await appointmentsApi.setStatus(id, 'cancelled', null);
            await loadAppointments();
          } catch (err) {
            Alert.alert('Erreur', err.response?.data?.error || err.message);
          }
        })();
  };

  const deleteAppt = (id) => {
    Alert.alert('Supprimer', 'Supprimer ce rendez-vous ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await appointmentsApi.remove(id);
            await loadAppointments();
          } catch (err) {
            Alert.alert('Erreur', err.response?.data?.error || err.message);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header
        title="Rendez-vous"
        showBack
        right={
          <TouchableOpacity
            onPress={() => router.push('/appointment/new')}
            style={styles.newBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.newBtnText}>+ Nouveau</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
        style={styles.filtersScroll}
      >
        {FILTERS.map((f) => {
          const isActive = currentFilter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterBtn, isActive && styles.filterBtnActive]}
              onPress={() => setCurrentFilter(f.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickBtn}
          onPress={() => router.push('/(app)/booking-settings')}
          activeOpacity={0.7}
        >
          <Text style={styles.quickBtnText}>⚙️ Config booking</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickBtn}
          onPress={() => router.push('/(app)/availability')}
          activeOpacity={0.7}
        >
          <Text style={styles.quickBtnText}>📅 Disponibilités</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <Button title="Réessayer" onPress={loadAppointments} variant="secondary" />
        </View>
      ) : appointments.length === 0 ? (
        <EmptyState
          icon="📅"
          title="Aucun rendez-vous"
          message="Activez la prise de RDV en ligne ou créez-en un manuellement."
        />
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
          renderItem={({ item }) => {
            const statusLabel = STATUS_LABELS[item.status] || item.status;
            const statusColor = STATUS_COLORS[item.status] || '#94a3b8';
            const dateObj = new Date(item.date || item.appointment_date);
            const dateLabel = dateObj.toLocaleDateString('fr-FR', {
              weekday: 'short', day: '2-digit', month: 'short',
            });
            const time = item.startTime || item.start_time || '';
            const isPending = item.status === 'pending';
            const isConfirmed = item.status === 'confirmed';

            return (
              <View style={[styles.card, { borderLeftColor: statusColor }]}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.clientName} numberOfLines={1}>
                      {item.clientName || item.client_name}
                    </Text>
                    {item.subject ? (
                      <Text style={styles.subject} numberOfLines={1}>
                        {item.subject}
                      </Text>
                    ) : null}
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusColor + '22', borderColor: statusColor + '66' },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: statusColor }]}>
                      {statusLabel}
                    </Text>
                  </View>
                </View>

                <View style={styles.dateBox}>
                  <Text style={styles.dateText}>
                    {dateLabel} — {time.slice(0, 5)}
                  </Text>
                  <Text style={styles.durationText}>
                    {item.durationMinutes || item.duration_minutes || 60} min
                  </Text>
                </View>

                {item.clientPhone || item.client_phone ? (
                  <Text style={styles.info}>📞 {item.clientPhone || item.client_phone}</Text>
                ) : null}
                {item.clientEmail || item.client_email ? (
                  <Text style={styles.info} numberOfLines={1}>
                    ✉️ {item.clientEmail || item.client_email}
                  </Text>
                ) : null}

                <View style={styles.actionsRow}>
                  {isPending && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.actionConfirm]}
                      onPress={() => confirmAppt(item.id)}
                    >
                      <Text style={styles.actionConfirmText}>✅ Confirmer</Text>
                    </TouchableOpacity>
                  )}
                  {isConfirmed && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.actionPrimary]}
                      onPress={() => completeAppt(item.id)}
                    >
                      <Text style={styles.actionPrimaryText}>✔ Terminé</Text>
                    </TouchableOpacity>
                  )}
                  {(isPending || isConfirmed) && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.actionWarning]}
                      onPress={() => cancelAppt(item.id)}
                    >
                      <Text style={styles.actionWarningText}>✕ Annuler</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionDanger]}
                    onPress={() => deleteAppt(item.id)}
                  >
                    <Text style={styles.actionDangerText}>🗑</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          ListFooterComponent={
            <Text style={styles.footer}>
              {appointments.length} RDV
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  newBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  newBtnText: { color: '#0b1120', fontSize: fontSize.xs, fontWeight: '700' },
  filtersScroll: { maxHeight: 60, borderBottomWidth: 1, borderBottomColor: colors.border },
  filtersContainer: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    gap: spacing.sm, flexDirection: 'row',
  },
  filterBtn: {
    paddingHorizontal: spacing.md, paddingVertical: 8,
    borderRadius: radius.full, borderWidth: 1,
    borderColor: colors.borderLight, backgroundColor: colors.bgCard,
    height: 36, justifyContent: 'center',
  },
  filterBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  filterText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600' },
  filterTextActive: { color: '#0b1120' },
  quickActions: {
    flexDirection: 'row', gap: spacing.sm,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
  },
  quickBtn: {
    flex: 1, paddingVertical: 10,
    borderRadius: radius.md, borderWidth: 1,
    borderColor: colors.borderLight, backgroundColor: colors.bgInput,
    alignItems: 'center',
  },
  quickBtnText: { color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: '600' },
  listContent: { padding: spacing.lg, paddingBottom: spacing.xxl },
  card: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, borderLeftWidth: 4,
    padding: spacing.lg, marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.md,
  },
  clientName: { color: colors.text, fontSize: fontSize.md, fontWeight: '700' },
  subject: { color: colors.textSecondary, fontSize: fontSize.sm, marginTop: 2 },
  statusBadge: {
    paddingHorizontal: spacing.sm, paddingVertical: 3,
    borderRadius: radius.full, borderWidth: 1,
  },
  statusText: { fontSize: 10, fontWeight: '700' },
  dateBox: {
    backgroundColor: colors.bgInput, borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.md,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  dateText: { color: colors.accent, fontSize: fontSize.sm, fontWeight: '700' },
  durationText: { color: colors.textMuted, fontSize: fontSize.xs },
  info: { color: colors.textSecondary, fontSize: fontSize.xs, marginBottom: 4 },
  actionsRow: {
    flexDirection: 'row', gap: spacing.sm,
    marginTop: spacing.md, paddingTop: spacing.md,
    borderTopWidth: 1, borderTopColor: colors.border, flexWrap: 'wrap',
  },
  actionBtn: {
    paddingVertical: 8, paddingHorizontal: spacing.md,
    borderRadius: radius.full, alignItems: 'center', justifyContent: 'center',
  },
  actionConfirm: { backgroundColor: 'rgba(34,197,94,0.15)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.4)' },
  actionConfirmText: { color: colors.success, fontSize: fontSize.xs, fontWeight: '700' },
  actionPrimary: { backgroundColor: 'rgba(59,130,246,0.15)', borderWidth: 1, borderColor: 'rgba(59,130,246,0.4)' },
  actionPrimaryText: { color: '#3b82f6', fontSize: fontSize.xs, fontWeight: '700' },
  actionWarning: { backgroundColor: 'rgba(234,179,8,0.15)', borderWidth: 1, borderColor: 'rgba(234,179,8,0.4)' },
  actionWarningText: { color: colors.warning, fontSize: fontSize.xs, fontWeight: '700' },
  actionDanger: { backgroundColor: 'rgba(248,113,113,0.15)', borderWidth: 1, borderColor: 'rgba(248,113,113,0.4)' },
  actionDangerText: { color: colors.error, fontSize: fontSize.xs, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorText: { color: colors.error, fontSize: fontSize.md, textAlign: 'center', marginBottom: spacing.lg },
  footer: { color: colors.textMuted, fontSize: fontSize.xs, textAlign: 'center', paddingVertical: spacing.lg },
});