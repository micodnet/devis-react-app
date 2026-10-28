import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  TouchableOpacity, Alert, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { purchaseOrdersApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Card from '../../components/Card';
import Button from '../../components/Button';

const STATUS_LABELS = {
  draft: 'Brouillon',
  sent: 'Envoyé',
  partial: 'Reçu partiel',
  received: 'Reçu',
  cancelled: 'Annulé',
};

const STATUS_COLORS = {
  draft: '#94a3b8',
  sent: '#3b82f6',
  partial: '#eab308',
  received: '#22c55e',
  cancelled: '#f87171',
};

export default function PurchaseOrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/purchase-orders');
  };

  const loadOrder = async () => {
    try {
      setError('');
      const data = await purchaseOrdersApi.get(id);
      setOrder(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadOrder();
    }, [id])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadOrder();
  };

  const fmtMoney = (n) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(n || 0);

  const fmtDate = (d) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('fr-FR'); } catch { return d; }
  };

  const handleValidate = () => {
    Alert.alert('Valider', 'Valider ce bon de commande ? Il passera en "Envoyé".', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Valider',
        onPress: async () => {
          try {
            await purchaseOrdersApi.validate(id);
            await loadOrder();
          } catch (err) {
            Alert.alert('Erreur', err.response?.data?.error || err.message);
          }
        },
      },
    ]);
  };

  // const handleReceive = () => {
  //   Alert.alert(
  //     'Réceptionner',
  //     'Réceptionner cette commande ? Le stock sera mis à jour automatiquement.',
  //     [
  //       { text: 'Annuler', style: 'cancel' },
  //       {
  //         text: 'Réceptionner',
  //         onPress: async () => {
  //           try {
  //             await purchaseOrdersApi.receive(id);
  //             await loadOrder();
  //           } catch (err) {
  //             Alert.alert('Erreur', err.response?.data?.error || err.message);
  //           }
  //         },
  //       },
  //     ]
  //   );
  // };
  const handleReceive = () => {
    Alert.alert(
      'Réceptionner',
      'Choisissez le mode de réception',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réception complète',
          onPress: async () => {
            try {
              await purchaseOrdersApi.receive(id);
              await loadOrder();
            } catch (err) {
              Alert.alert('Erreur', err.response?.data?.error || err.message);
            }
          },
        },
        {
          text: 'Réception partielle',
          onPress: () => router.push(`/purchase-order/receive?id=${id}`),
        },
      ]
    );
  };

  const handleCancel = () => {
    Alert.alert('Annuler', 'Annuler ce bon de commande ?', [
      { text: 'Non', style: 'cancel' },
      {
        text: 'Oui',
        style: 'destructive',
        onPress: async () => {
          try {
            await purchaseOrdersApi.cancel(id);
            await loadOrder();
          } catch (err) {
            Alert.alert('Erreur', err.response?.data?.error || err.message);
          }
        },
      },
    ]);
  };

  const handleSendEmail = () => {
    const defaultEmail = order?.sentToEmail || order?.supplierEmail || '';
    Alert.prompt
      ? Alert.prompt(
          'Envoyer par email',
          'Email du fournisseur :',
          async (email) => {
            if (!email?.trim()) return;
            try {
              await purchaseOrdersApi.sendByEmail(id, email.trim());
              await loadOrder();
              Alert.alert('Succès', 'Email envoyé');
            } catch (err) {
              Alert.alert('Erreur', err.response?.data?.error || err.message);
            }
          },
          'plain-text',
          defaultEmail
        )
      : Alert.alert('Info', `Envoyer à ${defaultEmail || 'fournisseur'}`);
  };

  const handleDelete = () => {
    Alert.alert('Supprimer', 'Cette action est irréversible. Confirmer ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await purchaseOrdersApi.remove(id);
            router.replace('/(app)/purchase-orders');
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
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Erreur</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.errorText}>⚠️ {error || 'Bon de commande introuvable'}</Text>
          <Button title="Retour" onPress={handleBack} variant="secondary" />
        </View>
      </SafeAreaView>
    );
  }

  const items = Array.isArray(order.items) ? order.items : [];
  const statusColor = STATUS_COLORS[order.status] || '#94a3b8';
  const statusLabel = STATUS_LABELS[order.status] || order.status;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {order.poNumber || order.po_number}
        </Text>
      </View>

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
        <Card>
          <Text style={styles.sectionTitle}>Informations</Text>
          <Row label="Statut" value={statusLabel} valueColor={statusColor} />
          <Row label="Fournisseur" value={order.supplierName || '—'} />
          <Row label="Date commande" value={fmtDate(order.issueDate || order.issue_date)} />
          {order.expectedDate ? (
            <Row label="Livraison prévue" value={fmtDate(order.expectedDate)} />
          ) : null}
          {order.receivedDate ? (
            <Row label="Date réception" value={fmtDate(order.receivedDate)} />
          ) : null}
          {order.sentToEmail ? (
            <Row label="Email envoyé à" value={order.sentToEmail} />
          ) : null}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Articles ({items.length})</Text>
          {items.length === 0 ? (
            <Text style={styles.empty}>Aucun article.</Text>
          ) : (
            items.map((it, i) => (
              <View key={i} style={styles.itemRow}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {it.productName || it.name}
                  </Text>
                  {it.productRef ? (
                    <Text style={styles.itemRef}>{it.productRef}</Text>
                  ) : null}
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.itemQty}>
                    {it.quantity} × {fmtMoney(it.unitPrice)}
                  </Text>
                  <Text style={styles.itemTotal}>
                    {fmtMoney(it.total || it.quantity * it.unitPrice)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Totaux</Text>
          <Row label="Sous-total HT" value={fmtMoney(order.subtotal)} />
          <Row label="TVA" value={fmtMoney(order.vatAmount || order.vat_amount)} />
          <View style={[styles.row, styles.totalRow]}>
            <Text style={styles.totalLabel}>TOTAL TTC</Text>
            <Text style={styles.totalValue}>{fmtMoney(order.total)}</Text>
          </View>
        </Card>

        {order.notes ? (
          <Card>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notes}>{order.notes}</Text>
          </Card>
        ) : null}

        <Card>
          <Text style={styles.sectionTitle}>Actions</Text>

          {order.status === 'draft' && (
            <>
              <TouchableOpacity style={styles.actionRow} onPress={handleValidate} activeOpacity={0.7}>
                <Text style={[styles.actionLabel, { color: colors.success }]}>✅ Valider</Text>
                <Text style={styles.actionArrow}>›</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionRow} onPress={() => router.push(`/purchase-order/edit?id=${id}`)} activeOpacity={0.7}>
                <Text style={styles.actionLabel}>✏️ Modifier</Text>
                <Text style={styles.actionArrow}>›</Text>
              </TouchableOpacity>
            </>
          )}

          {(order.status === 'sent' || order.status === 'partial') && (
            <>
              <TouchableOpacity style={styles.actionRow} onPress={handleReceive} activeOpacity={0.7}>
                <Text style={[styles.actionLabel, { color: colors.success }]}>📦 Réceptionner</Text>
                <Text style={styles.actionArrow}>›</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionRow} onPress={handleCancel} activeOpacity={0.7}>
                <Text style={[styles.actionLabel, { color: colors.warning }]}>🚫 Annuler</Text>
                <Text style={styles.actionArrow}>›</Text>
              </TouchableOpacity>
            </>
          )}

          {order.status !== 'received' && order.status !== 'cancelled' && (
            <TouchableOpacity style={styles.actionRow} onPress={handleSendEmail} activeOpacity={0.7}>
              <Text style={styles.actionLabel}>📧 Envoyer par email</Text>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.actionRow} onPress={handleDelete} activeOpacity={0.7}>
            <Text style={[styles.actionLabel, { color: colors.error }]}>🗑 Supprimer</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value, valueColor }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, valueColor && { color: valueColor, fontWeight: '700' }]} numberOfLines={3}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.md,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backText: { color: colors.text, fontSize: 24, fontWeight: '600' },
  title: { flex: 1, color: colors.text, fontSize: fontSize.lg, fontWeight: '700' },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700', marginBottom: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, gap: spacing.md },
  label: { color: colors.textSecondary, fontSize: fontSize.sm },
  value: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500', flexShrink: 1, textAlign: 'right' },
  itemRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: spacing.md, borderBottomWidth: 1,
    borderBottomColor: colors.border, gap: spacing.md,
  },
  itemName: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500' },
  itemRef: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },
  itemQty: { color: colors.textSecondary, fontSize: fontSize.xs },
  itemTotal: { color: colors.accent, fontSize: fontSize.sm, fontWeight: '700', marginTop: 2 },
  totalRow: {
    borderTopWidth: 2, borderTopColor: colors.accent,
    marginTop: spacing.md, paddingTop: spacing.md,
  },
  totalLabel: { color: colors.text, fontSize: fontSize.md, fontWeight: '800' },
  totalValue: { color: colors.accent, fontSize: fontSize.xl, fontWeight: '800' },
  notes: { color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 20 },
  empty: {
    color: colors.textMuted, fontSize: fontSize.sm, fontStyle: 'italic',
    textAlign: 'center', paddingVertical: spacing.lg,
  },
  actionRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: colors.border,
  },
  actionLabel: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500' },
  actionArrow: { color: colors.textMuted, fontSize: 20, fontWeight: '300' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorText: { color: colors.error, fontSize: fontSize.md, textAlign: 'center', marginBottom: spacing.lg },
});