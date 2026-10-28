import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity,
  RefreshControl, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { subcontractorsApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Card from '../../components/Card';
import Button from '../../components/Button';

const STATUS_LABELS = {
  pending: 'En attente',
  in_progress: 'En cours',
  completed: 'Terminé',
  invoiced: 'Facturé',
  paid: 'Payé',
  cancelled: 'Annulé',
};

const STATUS_COLORS = {
  pending: '#94a3b8',
  in_progress: '#3b82f6',
  completed: '#22c55e',
  invoiced: '#eab308',
  paid: '#16a34a',
  cancelled: '#f87171',
};

export default function SubcontractorDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [sub, setSub] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/subcontractors');
  };

  const loadAll = async () => {
    try {
      setError('');
      const [s, a] = await Promise.all([
        subcontractorsApi.get(id),
        subcontractorsApi.assignments(id).catch(() => []),
      ]);
      setSub(s);
      setAssignments(Array.isArray(a) ? a : []);
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
    }, [id])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadAll();
  };

  const fmtMoney = (n) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency', currency: 'EUR', minimumFractionDigits: 2,
    }).format(n || 0);

  const fmtDate = (d) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('fr-FR'); } catch { return d; }
  };

  const completeAssignment = (assignmentId) => {
    Alert.prompt
      ? Alert.prompt('Terminer la mission', 'Heures réelles (optionnel) :', async (hours) => {
          try {
            await subcontractorsApi.completeAssignment(assignmentId, hours || null);
            Alert.alert('Succès', 'Mission terminée');
            await loadAll();
          } catch (err) {
            Alert.alert('Erreur', err.response?.data?.error || err.message);
          }
        })
      : (async () => {
          try {
            await subcontractorsApi.completeAssignment(assignmentId, null);
            await loadAll();
          } catch (err) {
            Alert.alert('Erreur', err.response?.data?.error || err.message);
          }
        })();
  };

  const invoiceAssignment = (assignmentId) => {
    Alert.prompt
      ? Alert.prompt('Facture reçue', 'N° de facture :', async (num) => {
          if (!num?.trim()) return;
          try {
            await subcontractorsApi.invoiceAssignment(assignmentId, {
              invoiceNumber: num.trim(),
              invoiceDate: new Date().toISOString().slice(0, 10),
            });
            Alert.alert('Succès', 'Facture enregistrée');
            await loadAll();
          } catch (err) {
            Alert.alert('Erreur', err.response?.data?.error || err.message);
          }
        })
      : null;
  };

  const payAssignment = (assignmentId) => {
    Alert.alert('Marquer payé', 'Choisir le mode de paiement', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Virement',
        onPress: async () => {
          try {
            await subcontractorsApi.payAssignment(assignmentId, 'virement');
            await loadAll();
          } catch (err) {
            Alert.alert('Erreur', err.response?.data?.error || err.message);
          }
        },
      },
      {
        text: 'Espèces',
        onPress: async () => {
          try {
            await subcontractorsApi.payAssignment(assignmentId, 'especes');
            await loadAll();
          } catch (err) {
            Alert.alert('Erreur', err.response?.data?.error || err.message);
          }
        },
      },
    ]);
  };

  const deleteAssignment = (assignmentId) => {
    Alert.alert('Supprimer', 'Supprimer cette mission ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          try {
            await subcontractorsApi.removeAssignment(assignmentId);
            await loadAll();
          } catch (err) {
            Alert.alert('Erreur', err.response?.data?.error || err.message);
          }
        },
      },
    ]);
  };

  const deleteSub = () => {
    Alert.alert('Supprimer', 'Supprimer ce sous-traitant ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          try {
            await subcontractorsApi.remove(id);
            router.replace('/(app)/subcontractors');
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
        <Header title="Sous-traitant" showBack />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>
      </SafeAreaView>
    );
  }

  if (error || !sub) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Sous-traitant" showBack />
        <View style={styles.center}>
          <Text style={styles.errorText}>⚠️ {error || 'Introuvable'}</Text>
          <Button title="Retour" onPress={handleBack} variant="secondary" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title={sub.name} showBack />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
            tintColor={colors.accent} colors={[colors.accent]} />
        }
      >
        <Card>
          <Text style={styles.sectionTitle}>Coordonnées</Text>
          {sub.companyName ? <Row label="Raison sociale" value={sub.companyName} /> : null}
          {sub.contactName ? <Row label="Contact" value={sub.contactName} /> : null}
          {sub.specialty ? <Row label="Spécialité" value={sub.specialty} /> : null}
          {sub.email ? <Row label="Email" value={sub.email} /> : null}
          {sub.phone ? <Row label="Téléphone" value={sub.phone} /> : null}
          {sub.address ? <Row label="Adresse" value={sub.address} /> : null}
          {sub.vatNumber ? <Row label="N° TVA" value={sub.vatNumber} /> : null}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Bancaire</Text>
          {sub.iban ? <Row label="IBAN" value={sub.iban} /> : null}
          {sub.bic ? <Row label="BIC" value={sub.bic} /> : null}
          {!sub.iban && !sub.bic ? <Text style={styles.empty}>Aucune info bancaire.</Text> : null}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Tarification</Text>
          {sub.hourlyRate ? <Row label="Taux horaire" value={fmtMoney(sub.hourlyRate) + '/h'} /> : null}
          <Row label="Délai paiement" value={`${sub.paymentTerms || 30} jours`} />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Actions</Text>

          <TouchableOpacity style={styles.actionRow}
            onPress={() => router.push(`/subcontractor/edit?id=${id}`)} activeOpacity={0.7}>
            <Text style={styles.actionLabel}>✏️ Modifier</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow}
            onPress={() => router.push(`/subcontractor/assignment?subId=${id}`)} activeOpacity={0.7}>
            <Text style={[styles.actionLabel, { color: colors.accent }]}>+ Nouvelle mission</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow} onPress={deleteSub} activeOpacity={0.7}>
            <Text style={[styles.actionLabel, { color: colors.error }]}>🗑 Supprimer</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </Card>

        <Text style={styles.sectionTitleOutside}>Missions ({assignments.length})</Text>

        {assignments.length === 0 ? (
          <Card>
            <Text style={styles.empty}>Aucune mission enregistrée.</Text>
          </Card>
        ) : (
          assignments.map((a) => {
            const statusLabel = STATUS_LABELS[a.status] || a.status;
            const statusColor = STATUS_COLORS[a.status] || '#94a3b8';
            return (
              <Card key={a.id} style={{ borderLeftWidth: 4, borderLeftColor: statusColor }}>
                <View style={styles.assignmentHeader}>
                  <Text style={styles.assignmentTitle} numberOfLines={2}>{a.title}</Text>
                  <View style={[styles.statusBadge, {
                    backgroundColor: statusColor + '22', borderColor: statusColor + '66',
                  }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
                  </View>
                </View>

                {a.description ? (
                  <Text style={styles.assignmentDesc} numberOfLines={2}>{a.description}</Text>
                ) : null}

                <View style={styles.assignmentMeta}>
                  {a.amount ? <Text style={styles.assignmentMetaText}>💰 {fmtMoney(a.amount)}</Text> : null}
                  {a.hourlyRate ? <Text style={styles.assignmentMetaText}>⏱ {fmtMoney(a.hourlyRate)}/h</Text> : null}
                  {a.estimatedHours ? <Text style={styles.assignmentMetaText}>📊 {a.estimatedHours}h estimées</Text> : null}
                  {a.actualHours ? <Text style={styles.assignmentMetaText}>✓ {a.actualHours}h réelles</Text> : null}
                </View>

                {a.startDate || a.endDate ? (
                  <Text style={styles.assignmentDate}>
                    📅 {fmtDate(a.startDate)} → {fmtDate(a.endDate)}
                  </Text>
                ) : null}

                {a.chantierName ? (
                  <Text style={styles.assignmentChantier} numberOfLines={1}>
                    🏗 {a.chantierName}
                  </Text>
                ) : null}

                {a.invoiceNumber ? (
                  <Text style={styles.assignmentInvoice}>
                    🧾 Facture {a.invoiceNumber} · {fmtDate(a.invoiceDate)}
                  </Text>
                ) : null}

                <View style={styles.assignmentActions}>
                  {(a.status === 'pending' || a.status === 'in_progress') && (
                    <TouchableOpacity style={[styles.smallBtn, styles.smallBtnSuccess]}
                      onPress={() => completeAssignment(a.id)} activeOpacity={0.7}>
                      <Text style={styles.smallBtnSuccessText}>✓ Terminer</Text>
                    </TouchableOpacity>
                  )}
                  {a.status === 'completed' && (
                    <TouchableOpacity style={[styles.smallBtn, styles.smallBtnWarning]}
                      onPress={() => invoiceAssignment(a.id)} activeOpacity={0.7}>
                      <Text style={styles.smallBtnWarningText}>🧾 Facture reçue</Text>
                    </TouchableOpacity>
                  )}
                  {a.status === 'invoiced' && (
                    <TouchableOpacity style={[styles.smallBtn, styles.smallBtnSuccess]}
                      onPress={() => payAssignment(a.id)} activeOpacity={0.7}>
                      <Text style={styles.smallBtnSuccessText}>💰 Marquer payé</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={[styles.smallBtn, styles.smallBtnSecondary]}
                    onPress={() => router.push(`/subcontractor/assignment?id=${a.id}&subId=${id}`)}
                    activeOpacity={0.7}>
                    <Text style={styles.smallBtnSecondaryText}>✏️ Modifier</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.smallBtn, styles.smallBtnDanger]}
                    onPress={() => deleteAssignment(a.id)} activeOpacity={0.7}>
                    <Text style={styles.smallBtnDangerText}>🗑</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            );
          })
        )}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={3}>{value}</Text>
    </View>
  );
}

// Import du composant Header (on l'utilise ici comme ailleurs)
import Header from '../../components/Header';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700', marginBottom: spacing.md },
  sectionTitleOutside: {
    color: colors.text, fontSize: fontSize.md, fontWeight: '700',
    marginTop: spacing.lg, marginBottom: spacing.md,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, gap: spacing.md },
  label: { color: colors.textSecondary, fontSize: fontSize.sm },
  value: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500', flexShrink: 1, textAlign: 'right' },
  empty: { color: colors.textMuted, fontSize: fontSize.sm, fontStyle: 'italic', textAlign: 'center', paddingVertical: spacing.lg },
  actionRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: colors.border,
  },
  actionLabel: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500' },
  actionArrow: { color: colors.textMuted, fontSize: 20, fontWeight: '300' },
  assignmentHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.sm,
  },
  assignmentTitle: { color: colors.text, fontSize: fontSize.sm, fontWeight: '700', flex: 1 },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full, borderWidth: 1 },
  statusText: { fontSize: 10, fontWeight: '700' },
  assignmentDesc: { color: colors.textSecondary, fontSize: fontSize.xs, marginBottom: spacing.sm },
  assignmentMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.sm },
  assignmentMetaText: { color: colors.textSecondary, fontSize: fontSize.xs },
  assignmentDate: { color: colors.textMuted, fontSize: fontSize.xs, marginBottom: 4 },
  assignmentChantier: { color: colors.textSecondary, fontSize: fontSize.xs, marginBottom: 4 },
  assignmentInvoice: { color: colors.warning, fontSize: fontSize.xs, marginBottom: spacing.md },
  assignmentActions: {
    flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap',
    paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border,
  },
  smallBtn: { paddingVertical: 6, paddingHorizontal: spacing.md, borderRadius: radius.full, alignItems: 'center' },
  smallBtnSuccess: { backgroundColor: 'rgba(34,197,94,0.15)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.4)' },
  smallBtnSuccessText: { color: colors.success, fontSize: fontSize.xs, fontWeight: '700' },
  smallBtnWarning: { backgroundColor: 'rgba(234,179,8,0.15)', borderWidth: 1, borderColor: 'rgba(234,179,8,0.4)' },
  smallBtnWarningText: { color: colors.warning, fontSize: fontSize.xs, fontWeight: '700' },
  smallBtnSecondary: { backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.borderLight },
  smallBtnSecondaryText: { color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: '600' },
  smallBtnDanger: { backgroundColor: 'rgba(248,113,113,0.1)', borderWidth: 1, borderColor: 'rgba(248,113,113,0.4)' },
  smallBtnDangerText: { color: colors.error, fontSize: fontSize.xs, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorText: { color: colors.error, fontSize: fontSize.md, textAlign: 'center', marginBottom: spacing.lg },
});