import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity,
  RefreshControl, Alert, Modal, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { bankApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';

const FILTERS = [
  { key: 'all', label: 'Toutes' },
  { key: 'suggested', label: 'À valider' },
  { key: 'pending', label: 'Sans correspondance' },
  { key: 'validated', label: 'Rapprochées' },
  { key: 'ignored', label: 'Ignorées' },
];

const STATUS_LABELS = {
  pending: 'Sans correspondance',
  suggested: 'À valider',
  validated: 'Rapprochée',
  ignored: 'Ignorée',
};

const STATUS_COLORS = {
  pending: '#94a3b8',
  suggested: '#f97316',
  validated: '#22c55e',
  ignored: '#64748b',
};

export default function BankScreen() {
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [imports, setImports] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  // Modal de rapprochement
  const [matchOpen, setMatchOpen] = useState(false);
  const [matchTx, setMatchTx] = useState(null);
  const [matches, setMatches] = useState([]);
  const [matching, setMatching] = useState(false);

  const loadAll = async () => {
    try {
      setError('');
      const [st, tx, imp] = await Promise.all([
        bankApi.stats().catch(() => ({})),
        bankApi.transactions(filter).catch(() => []),
        bankApi.imports().catch(() => []),
      ]);
      setStats(st);
      setTransactions(Array.isArray(tx) ? tx : []);
      setImports(Array.isArray(imp) ? imp : []);
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
    }, [filter])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadAll();
  };

  const importFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/plain', 'application/xml', 'text/xml',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (res.canceled) return;
      const asset = res.assets?.[0];
      if (!asset) return;

      setUploading(true);
      const result = await bankApi.importFile({
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType || 'text/csv',
        file: asset.file,
      });
      Alert.alert(
        'Import terminé',
        `${result.transactionsCount || 0} transaction(s) importée(s)\n${result.matched || 0} correspondance(s) trouvée(s)`
      );
      await loadAll();
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || err.message);
    } finally {
      setUploading(false);
    }
  };

  const openMatch = async (tx) => {
    setMatchTx(tx);
    setMatchOpen(true);
    setMatching(true);
    try {
      const data = await bankApi.matches(tx.id);
      setMatches(data.matches || []);
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || err.message);
      setMatchOpen(false);
    } finally {
      setMatching(false);
    }
  };

  const validateMatch = async (invoiceId) => {
    try {
      await bankApi.validate(matchTx.id, invoiceId);
      Alert.alert('Succès', 'Rapprochement validé');
      setMatchOpen(false);
      await loadAll();
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || err.message);
    }
  };

  const ignoreTx = (tx) => {
    Alert.alert('Ignorer', 'Marquer cette transaction comme ignorée ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Ignorer',
        onPress: async () => {
          try {
            await bankApi.ignore(tx.id);
            await loadAll();
          } catch (err) {
            Alert.alert('Erreur', err.response?.data?.error || err.message);
          }
        },
      },
    ]);
  };

  const deleteTx = (tx) => {
    Alert.alert('Supprimer', 'Supprimer cette transaction ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await bankApi.remove(tx.id);
            await loadAll();
          } catch (err) {
            Alert.alert('Erreur', err.response?.data?.error || err.message);
          }
        },
      },
    ]);
  };

  const rematch = async () => {
    try {
      const res = await bankApi.rematch();
      Alert.alert('Analyse terminée', `${res.matched || 0} correspondance(s) trouvée(s)`);
      await loadAll();
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || err.message);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Banque" showBack />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>
      </SafeAreaView>
    );
  }

  const fmtMoney = (n) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency', currency: 'EUR', minimumFractionDigits: 2,
    }).format(n || 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Banque" showBack />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
            tintColor={colors.accent} colors={[colors.accent]} />
        }
      >
        {!!error && (<View style={styles.errorBox}><Text style={styles.errorText}>⚠️ {error}</Text></View>)}

        {/* Statistiques */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats?.total || 0}</Text>
            <Text style={styles.statLabel}>Transactions</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, stats?.suggested > 0 && { color: colors.warning }]}>
              {stats?.suggested || 0}
            </Text>
            <Text style={styles.statLabel}>À valider</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: colors.success }]}>
              {stats?.validated || 0}
            </Text>
            <Text style={styles.statLabel}>Rapprochées</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#3b82f6' }]}>
              {fmtMoney(stats?.totalReconciled)}
            </Text>
            <Text style={styles.statLabel}>Montant rapproché</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionPrimary]}
            onPress={importFile}
            disabled={uploading}
            activeOpacity={0.7}
          >
            <Text style={styles.actionPrimaryText}>
              {uploading ? '⏳ Import...' : '+ Importer un relevé'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionSecondary]}
            onPress={rematch}
            activeOpacity={0.7}
          >
            <Text style={styles.actionSecondaryText}>🔄 Relancer</Text>
          </TouchableOpacity>
        </View>

        {/* Filtres */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
          style={styles.filtersScroll}
        >
          {FILTERS.map((f) => {
            const isActive = filter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterBtn, isActive && styles.filterBtnActive]}
                onPress={() => setFilter(f.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Transactions */}
        {transactions.length === 0 ? (
          <EmptyState
            icon="🏦"
            title="Aucune transaction"
            message="Importez un relevé bancaire pour démarrer le rapprochement."
          />
        ) : (
          transactions.map((tx) => {
            const statusColor = STATUS_COLORS[tx.status] || '#94a3b8';
            const isCredit = tx.amount > 0;
            const canMatch = tx.status === 'pending' || tx.status === 'suggested';
            return (
              <View key={tx.id} style={[styles.txCard, { borderLeftColor: statusColor }]}>
                <View style={styles.txHeader}>
                  <Text style={styles.txDate}>
                    {new Date(tx.transactionDate || tx.transaction_date).toLocaleDateString('fr-FR')}
                  </Text>
                  <View style={[styles.txStatusBadge, { backgroundColor: statusColor + '22', borderColor: statusColor + '66' }]}>
                    <Text style={[styles.txStatusText, { color: statusColor }]}>
                      {STATUS_LABELS[tx.status] || tx.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.txDescription} numberOfLines={2}>
                  {tx.description || tx.counterparty || 'Transaction'}
                </Text>
                {tx.counterparty && tx.description !== tx.counterparty ? (
                  <Text style={styles.txCounterparty} numberOfLines={1}>{tx.counterparty}</Text>
                ) : null}
                <Text style={[styles.txAmount, { color: isCredit ? colors.success : colors.error }]}>
                  {isCredit ? '+' : ''}{fmtMoney(tx.amount)}
                </Text>
                {tx.matchReason ? (
                  <Text style={styles.txMatch}>💡 {tx.matchReason} (score {tx.matchScore})</Text>
                ) : null}

                <View style={styles.txActions}>
                  {canMatch && (
                    <TouchableOpacity style={[styles.txBtn, styles.txBtnPrimary]}
                      onPress={() => openMatch(tx)} activeOpacity={0.7}>
                      <Text style={styles.txBtnPrimaryText}>🔗 Rapprocher</Text>
                    </TouchableOpacity>
                  )}
                  {tx.status === 'pending' && (
                    <TouchableOpacity style={[styles.txBtn, styles.txBtnSecondary]}
                      onPress={() => ignoreTx(tx)} activeOpacity={0.7}>
                      <Text style={styles.txBtnSecondaryText}>Ignorer</Text>
                    </TouchableOpacity>
                  )}
                  {tx.status !== 'validated' && (
                    <TouchableOpacity style={[styles.txBtn, styles.txBtnDanger]}
                      onPress={() => deleteTx(tx)} activeOpacity={0.7}>
                      <Text style={styles.txBtnDangerText}>Suppr.</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}

        {/* Historique imports */}
        {imports.length > 0 && (
          <Card>
            <Text style={styles.sectionTitle}>Historique des imports</Text>
            {imports.map((imp) => (
              <View key={imp.id} style={styles.importRow}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.importName} numberOfLines={1}>
                    {imp.originalName || imp.filename}
                  </Text>
                  <Text style={styles.importMeta}>
                    {imp.transactionsCount} transaction(s) · {imp.reconciledCount} rapprochée(s)
                  </Text>
                  <Text style={styles.importDate}>
                    {new Date(imp.createdAt).toLocaleString('fr-FR')}
                  </Text>
                </View>
                <Text style={styles.importFormat}>{imp.format?.toUpperCase()}</Text>
              </View>
            ))}
          </Card>
        )}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>

      {/* Modal rapprochement */}
      <Modal visible={matchOpen} transparent animationType="slide"
        onRequestClose={() => setMatchOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Rapprocher la transaction</Text>
            {matchTx && (
              <View style={styles.matchTxBox}>
                <Text style={styles.matchTxDesc} numberOfLines={2}>
                  {matchTx.description || 'Transaction'}
                </Text>
                <Text style={[styles.matchTxAmount, { color: colors.success }]}>
                  +{fmtMoney(matchTx.amount)}
                </Text>
              </View>
            )}
            {matching ? (
              <ActivityIndicator color={colors.accent} />
            ) : matches.length === 0 ? (
              <Text style={styles.empty}>Aucune correspondance trouvée.</Text>
            ) : (
              matches.map((m) => (
                <View key={m.invoiceId} style={styles.matchRow}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.matchInv}>{m.invoiceNumber}</Text>
                    <Text style={styles.matchClient} numberOfLines={1}>{m.clientName || '—'}</Text>
                    <Text style={styles.matchMeta}>
                      Reste dû : {fmtMoney(m.amountDue)} · Score {m.score}/100
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.matchBtn}
                    onPress={() => validateMatch(m.invoiceId)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.matchBtnText}>✓</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setMatchOpen(false)}>
                <Text style={styles.modalBtnCancelText}>Fermer</Text>
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
  sectionTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700', marginBottom: spacing.md },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  statBox: {
    flex: 1, minWidth: '45%', padding: spacing.md,
    borderRadius: radius.md, backgroundColor: colors.bgCard,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center',
  },
  statNumber: { color: colors.text, fontSize: fontSize.lg, fontWeight: '800' },
  statLabel: { color: colors.textMuted, fontSize: 10, textTransform: 'uppercase', marginTop: 4 },
  actionsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  actionBtn: { flex: 1, paddingVertical: 12, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', minHeight: 44 },
  actionPrimary: { backgroundColor: colors.accent },
  actionPrimaryText: { color: '#0b1120', fontSize: fontSize.sm, fontWeight: '700' },
  actionSecondary: { backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.borderLight },
  actionSecondaryText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600' },
  filtersScroll: { maxHeight: 50, marginBottom: spacing.md },
  filtersContainer: { gap: spacing.sm, flexDirection: 'row' },
  filterBtn: {
    paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.borderLight, backgroundColor: colors.bgCard,
    height: 36, justifyContent: 'center',
  },
  filterBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  filterText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600' },
  filterTextActive: { color: '#0b1120' },
  txCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, borderLeftWidth: 4,
    padding: spacing.lg, marginBottom: spacing.md,
  },
  txHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm,
  },
  txDate: { color: colors.textMuted, fontSize: fontSize.xs },
  txStatusBadge: {
    paddingHorizontal: spacing.sm, paddingVertical: 2,
    borderRadius: radius.full, borderWidth: 1,
  },
  txStatusText: { fontSize: 10, fontWeight: '700' },
  txDescription: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600' },
  txCounterparty: { color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2 },
  txAmount: { fontSize: fontSize.lg, fontWeight: '800', marginTop: spacing.sm },
  txMatch: {
    color: colors.warning, fontSize: fontSize.xs,
    marginTop: spacing.sm, fontStyle: 'italic',
  },
  txActions: {
    flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap',
    marginTop: spacing.md, paddingTop: spacing.md,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  txBtn: {
    paddingVertical: 8, paddingHorizontal: spacing.md,
    borderRadius: radius.full, alignItems: 'center',
  },
  txBtnPrimary: { backgroundColor: colors.accent },
  txBtnPrimaryText: { color: '#0b1120', fontSize: fontSize.xs, fontWeight: '700' },
  txBtnSecondary: { backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.borderLight },
  txBtnSecondaryText: { color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: '600' },
  txBtnDanger: { backgroundColor: 'rgba(248,113,113,0.1)', borderWidth: 1, borderColor: 'rgba(248,113,113,0.4)' },
  txBtnDangerText: { color: colors.error, fontSize: fontSize.xs, fontWeight: '600' },
  importRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md,
    paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  importName: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600' },
  importMeta: { color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2 },
  importDate: { color: colors.textMuted, fontSize: 10, marginTop: 4 },
  importFormat: { color: '#3b82f6', fontSize: 11, fontWeight: '700' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  modalBox: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg, padding: spacing.lg,
    width: '100%', maxWidth: 500, maxHeight: '85%',
    borderWidth: 1, borderColor: colors.borderLight,
  },
  modalTitle: { color: colors.text, fontSize: fontSize.lg, fontWeight: '800', marginBottom: spacing.lg },
  matchTxBox: {
    backgroundColor: colors.bgInput, borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.lg,
  },
  matchTxDesc: { color: colors.text, fontSize: fontSize.sm },
  matchTxAmount: { fontSize: fontSize.lg, fontWeight: '800', marginTop: 4 },
  matchRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  matchInv: { color: colors.accent, fontSize: fontSize.sm, fontWeight: '700' },
  matchClient: { color: colors.text, fontSize: fontSize.sm, marginTop: 2 },
  matchMeta: { color: colors.textMuted, fontSize: 10, marginTop: 4 },
  matchBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.success,
    alignItems: 'center', justifyContent: 'center',
  },
  matchBtnText: { color: '#fff', fontSize: 20, fontWeight: '800' },
  modalActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', minHeight: 44 },
  modalBtnCancel: { backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.borderLight },
  modalBtnCancelText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { color: colors.textMuted, fontSize: fontSize.sm, fontStyle: 'italic', textAlign: 'center', paddingVertical: spacing.lg },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)', borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.lg,
  },
  errorText: { color: colors.error, fontSize: fontSize.sm },
});