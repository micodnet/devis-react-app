// import { useState, useEffect, useCallback } from 'react';
// import {
//   View, Text, StyleSheet, ScrollView, FlatList,
//   TouchableOpacity, ActivityIndicator, RefreshControl,
//   TextInput, KeyboardAvoidingView, Platform, Alert, Linking,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
// import { invoicesApi, API_URL } from '../../lib/api';
// import { colors, spacing, fontSize, radius } from '../../lib/theme';
// import InvoiceStatusBadge from '../../components/InvoiceStatusBadge';
// import Card from '../../components/Card';
// import Button from '../../components/Button';

// export default function InvoiceDetailScreen() {
//   const { id } = useLocalSearchParams();
//   const router = useRouter();

//   const [invoice, setInvoice] = useState(null);
//   const [payments, setPayments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState('');

//   const handleBack = () => {
//     if (router.canGoBack()) router.back();
//     else router.replace('/(app)/factures');
//   };

//   const loadAll = async () => {
//     try {
//       setError('');
//       const [inv, pays] = await Promise.all([
//         invoicesApi.get(id),
//         invoicesApi.listPayments(id).catch(() => []),
//       ]);
//       setInvoice(inv);
//       setPayments(Array.isArray(pays) ? pays : []);
//     } catch (err) {
//       setError(err.response?.data?.error || err.message || 'Erreur de chargement');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       loadAll();
//     }, [id])
//   );

//   const onRefresh = () => {
//     setRefreshing(true);
//     loadAll();
//   };

//   const fmtMoney = (n) =>
//     new Intl.NumberFormat('fr-FR', {
//       style: 'currency',
//       currency: invoice?.currency || 'EUR',
//       minimumFractionDigits: 2,
//     }).format(n || 0);

//   const fmtDate = (d) => {
//     if (!d) return '—';
//     try {
//       return new Date(d).toLocaleDateString('fr-FR');
//     } catch {
//       return d;
//     }
//   };

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.safe} edges={['top']}>
//         <View style={styles.center}>
//           <ActivityIndicator size="large" color={colors.accent} />
//         </View>
//       </SafeAreaView>
//     );
//   }

//   if (error || !invoice) {
//     return (
//       <SafeAreaView style={styles.safe} edges={['top']}>
//         <View style={styles.header}>
//           <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
//             <Text style={styles.backText}>←</Text>
//           </TouchableOpacity>
//           <Text style={styles.title}>Erreur</Text>
//         </View>
//         <View style={styles.center}>
//           <Text style={styles.errorText}>⚠️ {error || 'Facture introuvable'}</Text>
//           <Button title="Retour" onPress={handleBack} variant="secondary" />
//         </View>
//       </SafeAreaView>
//     );
//   }

//   const items = Array.isArray(invoice.items) ? invoice.items : [];
//   const amountDue = Number(invoice.amountDue) || 0;
//   const isPaid = invoice.status === 'paid';

//   const handleSendReminder = () => {
//     Alert.alert(
//       'Envoyer une relance',
//       `Envoyer une relance pour la facture ${invoice.invoiceNumber} ?`,
//       [
//         { text: 'Annuler', style: 'cancel' },
//         {
//           text: 'Envoyer',
//           onPress: async () => {
//             try {
//               await invoicesApi.sendReminder(id);
//               Alert.alert('Succès', 'Relance envoyée');
//             } catch (err) {
//               Alert.alert('Erreur', err.response?.data?.error || err.message);
//             }
//           },
//         },
//       ]
//     );
//   };

//   const handleDuplicate = () => {
//     Alert.alert(
//       'Dupliquer',
//       'Créer une copie de cette facture ?',
//       [
//         { text: 'Annuler', style: 'cancel' },
//         {
//           text: 'Dupliquer',
//           onPress: async () => {
//             try {
//               const res = await invoicesApi.duplicate(id);
//               Alert.alert('Succès', `Facture ${res.invoice?.invoice_number || ''} créée`);
//               router.replace(`/invoice/${res.invoice?.id || id}`);
//             } catch (err) {
//               Alert.alert('Erreur', err.response?.data?.error || err.message);
//             }
//           },
//         },
//       ]
//     );
//   };

//   const handleCreateCreditNote = () => {
//     Alert.alert(
//       'Créer un avoir',
//       'Choisissez le type d\'avoir',
//       [
//         { text: 'Annuler', style: 'cancel' },
//         {
//           text: 'Avoir total',
//           onPress: async () => {
//             try {
//               const res = await invoicesApi.createCreditNote(id, {
//                 reason: 'Avoir total',
//                 fullCredit: true,
//               });
//               Alert.alert('Succès', `Avoir ${res.creditNote?.invoice_number || ''} créé`);
//               router.replace('/(app)/factures');
//             } catch (err) {
//               Alert.alert('Erreur', err.response?.data?.error || err.message);
//             }
//           },
//         },
//         {
//           text: 'Avoir partiel',
//           onPress: () => {
//             Alert.prompt
//               ? Alert.prompt('Avoir partiel', 'Montant (€) :', async (amount) => {
//                   const amt = parseFloat(String(amount).replace(',', '.'));
//                   if (isNaN(amt) || amt <= 0) return;
//                   try {
//                     const res = await invoicesApi.createCreditNote(id, {
//                       reason: 'Avoir partiel',
//                       amount: amt,
//                       fullCredit: false,
//                     });
//                     Alert.alert('Succès', `Avoir créé`);
//                     router.replace('/(app)/factures');
//                   } catch (err) {
//                     Alert.alert('Erreur', err.response?.data?.error || err.message);
//                   }
//                 })
//               : null;
//           },
//         },
//       ]
//     );
//   };

//   const handleChangeStatus = () => {
//     const statuses = [
//       { label: 'Brouillon', value: 'draft' },
//       { label: 'Envoyée', value: 'sent' },
//       { label: 'Payée', value: 'paid' },
//       { label: 'En retard', value: 'overdue' },
//       { label: 'Annulée', value: 'cancelled' },
//     ];
//     Alert.alert(
//       'Changer le statut',
//       'Sélectionnez un nouveau statut',
//       [
//         ...statuses.map((s) => ({
//           text: s.label,
//           onPress: async () => {
//             try {
//               await invoicesApi.setStatus(id, s.value);
//               await loadAll();
//             } catch (err) {
//               Alert.alert('Erreur', err.response?.data?.error || err.message);
//             }
//           },
//         })),
//         { text: 'Annuler', style: 'cancel' },
//       ]
//     );
//   };

//   const handleDelete = () => {
//     Alert.alert(
//       'Supprimer',
//       'Cette action est irréversible. Confirmer ?',
//       [
//         { text: 'Annuler', style: 'cancel' },
//         {
//           text: 'Supprimer',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               await invoicesApi.remove(id);
//               router.replace('/(app)/factures');
//             } catch (err) {
//               Alert.alert('Erreur', err.response?.data?.error || err.message);
//             }
//           },
//         },
//       ]
//     );
//   };
//   return (
//     <SafeAreaView style={styles.safe} edges={['top']}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
//           <Text style={styles.backText}>←</Text>
//         </TouchableOpacity>
//         <Text style={styles.title} numberOfLines={1}>
//           {invoice.invoiceNumber}
//         </Text>
//         <InvoiceStatusBadge status={invoice.status} />
//       </View>

//       <ScrollView
//         contentContainerStyle={styles.scroll}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             tintColor={colors.accent}
//             colors={[colors.accent]}
//           />
//         }
//       >
//         {/* Infos */}
//         <Card>
//           <Text style={styles.sectionTitle}>Informations</Text>
//           <Row label="Client" value={invoice.clientName || '—'} />
//           {invoice.clientEmail ? <Row label="Email" value={invoice.clientEmail} /> : null}
//           <Row label="Émise le" value={fmtDate(invoice.issueDate)} />
//           <Row label="Échéance" value={fmtDate(invoice.dueDate)} />
//           {invoice.paymentDate ? (
//             <Row label="Payée le" value={fmtDate(invoice.paymentDate)} />
//           ) : null}
//           {invoice.paymentMethod ? (
//             <Row label="Mode de paiement" value={invoice.paymentMethod} />
//           ) : null}
//         </Card>

//         {/* Articles */}
//         <Card>
//           <Text style={styles.sectionTitle}>Articles ({items.length})</Text>
//           {items.length === 0 ? (
//             <Text style={styles.empty}>Aucun article.</Text>
//           ) : (
//             items.map((item, i) => (
//               <View key={i} style={styles.itemRow}>
//                 <View style={styles.itemLeft}>
//                   <Text style={styles.itemName} numberOfLines={2}>
//                     {item.name || 'Article'}
//                   </Text>
//                   {item.ref ? <Text style={styles.itemRef}>{item.ref}</Text> : null}
//                 </View>
//                 <View style={styles.itemRight}>
//                   <Text style={styles.itemQty}>
//                     {item.qty} × {fmtMoney(item.unitPrice)}
//                   </Text>
//                   <Text style={styles.itemTotal}>{fmtMoney(item.total)}</Text>
//                 </View>
//               </View>
//             ))
//           )}
//         </Card>

//         {/* Totaux */}
//         <Card>
//           <Text style={styles.sectionTitle}>Totaux</Text>
//           <Row label="Sous-total HT" value={fmtMoney(invoice.subtotal)} />
//           {invoice.vatRegime === 'assujetti' ? (
//             <Row label="TVA" value={fmtMoney(invoice.vatAmount)} />
//           ) : (
//             <Row label="TVA" value="Franchise" muted />
//           )}
//           <View style={[styles.row, styles.totalRow]}>
//             <Text style={styles.totalLabel}>TOTAL TTC</Text>
//             <Text style={styles.totalValue}>{fmtMoney(invoice.total)}</Text>
//           </View>
//           {!isPaid && amountDue > 0 ? (
//             <View style={[styles.row, styles.dueRow]}>
//               <Text style={styles.dueLabel}>RESTE DÛ</Text>
//               <Text style={styles.dueValue}>{fmtMoney(amountDue)}</Text>
//             </View>
//           ) : null}
//         </Card>

//         {/* Paiements */}
//         <Card>
//           <Text style={styles.sectionTitle}>Paiements ({payments.length})</Text>
//           {payments.length === 0 ? (
//             <Text style={styles.empty}>Aucun paiement enregistré.</Text>
//           ) : (
//             payments.map((p, i) => (
//               <View key={i} style={styles.paymentRow}>
//                 <View style={styles.itemLeft}>
//                   <Text style={styles.paymentAmount}>{fmtMoney(p.amount)}</Text>
//                   <Text style={styles.paymentMeta}>
//                     {fmtDate(p.paymentDate)}
//                     {p.paymentMethod ? ` · ${p.paymentMethod}` : ''}
//                   </Text>
//                 </View>
//                 {p.reference ? (
//                   <Text style={styles.paymentRef}>Réf: {p.reference}</Text>
//                 ) : null}
//               </View>
//             ))
//           )}
//         </Card>

//         {/* Actions */}
//         {/* Actions secondaires */}
//         <Card>
//           <Text style={styles.sectionTitle}>Actions</Text>

//           {!isPaid && (
//             <TouchableOpacity
//               style={styles.actionRow}
//               onPress={() => router.push(`/invoice/payment?id=${invoice.id}`)}
//               activeOpacity={0.7}
//             >
//               <Text style={styles.actionLabel}>💰 Enregistrer un paiement</Text>
//               <Text style={styles.actionArrow}>›</Text>
//             </TouchableOpacity>
//           )}

//           {!isPaid && (
//             <TouchableOpacity
//               style={styles.actionRow}
//               onPress={() => router.push(`/invoice/schedule?id=${invoice.id}`)}
//               activeOpacity={0.7}
//             >
//               <Text style={styles.actionLabel}>📅 Plan de paiement</Text>
//               <Text style={styles.actionArrow}>›</Text>
//             </TouchableOpacity>
//           )}

//           {!isPaid && invoice.clientEmail && (
//             <TouchableOpacity
//               style={styles.actionRow}
//               onPress={handleSendReminder}
//               activeOpacity={0.7}
//             >
//               <Text style={styles.actionLabel}>📧 Envoyer une relance</Text>
//               <Text style={styles.actionArrow}>›</Text>
//             </TouchableOpacity>
//           )}

//           <TouchableOpacity
//             style={styles.actionRow}
//             onPress={handleDuplicate}
//             activeOpacity={0.7}
//           >
//             <Text style={styles.actionLabel}>📋 Dupliquer</Text>
//             <Text style={styles.actionArrow}>›</Text>
//           </TouchableOpacity>

//           {invoice.status !== 'cancelled' && invoice.invoice_type !== 'credit_note' && (
//             <TouchableOpacity
//               style={styles.actionRow}
//               onPress={handleCreateCreditNote}
//               activeOpacity={0.7}
//             >
//               <Text style={styles.actionLabel}>↩ Créer un avoir</Text>
//               <Text style={styles.actionArrow}>›</Text>
//             </TouchableOpacity>
//           )}

//           <TouchableOpacity
//             style={styles.actionRow}
//             onPress={handleChangeStatus}
//             activeOpacity={0.7}
//           >
//             <Text style={styles.actionLabel}>🔄 Changer le statut</Text>
//             <Text style={styles.actionArrow}>›</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.actionRow}
//             onPress={handleDelete}
//             activeOpacity={0.7}
//           >
//             <Text style={[styles.actionLabel, { color: colors.error }]}>
//               🗑 Supprimer
//             </Text>
//             <Text style={styles.actionArrow}>›</Text>
//           </TouchableOpacity>
//         </Card>
//           <>
//             <Button
//               title="💰 Enregistrer un paiement"
//               onPress={() => router.push(`/invoice/payment?id=${invoice.id}`)}
//             />
//             <View style={{ height: spacing.md }} />
//           </>
        

//         <Button
//           title="⬇ Télécharger le PDF"
//           variant="secondary"
//           onPress={() => {
//             const url = `${API_URL}/api/invoices/${invoice.id}/pdf`;
//             Linking.openURL(url);
//           }}
//         />

//         {invoice.quoteId ? (
//           <>
//             <View style={{ height: spacing.md }} />
//             <Button
//               title="📄 Voir le devis source"
//               variant="secondary"
//               onPress={() => router.push(`/quote/${invoice.quoteId}`)}
//             />
//           </>
//         ) : null}
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// function Row({ label, value, muted }) {
//   return (
//     <View style={styles.row}>
//       <Text style={styles.label}>{label}</Text>
//       <Text
//         style={[styles.value, muted && styles.valueMuted]}
//         numberOfLines={2}
//       >
//         {value}
//       </Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: colors.bg },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: spacing.md,
//     paddingVertical: spacing.md,
//     borderBottomWidth: 1,
//     borderBottomColor: colors.border,
//     gap: spacing.md,
//   },
//   backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
//   backText: { color: colors.text, fontSize: 24, fontWeight: '600' },
//   title: { flex: 1, color: colors.text, fontSize: fontSize.lg, fontWeight: '700' },
//   scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
//   sectionTitle: {
//     color: colors.text,
//     fontSize: fontSize.md,
//     fontWeight: '700',
//     marginBottom: spacing.md,
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 6,
//     gap: spacing.md,
//   },
//   label: { color: colors.textSecondary, fontSize: fontSize.sm },
//   value: {
//     color: colors.text,
//     fontSize: fontSize.sm,
//     fontWeight: '500',
//     flexShrink: 1,
//     textAlign: 'right',
//   },
//   valueMuted: { color: colors.textMuted, fontStyle: 'italic', fontWeight: '400' },
//   itemRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingVertical: spacing.md,
//     borderBottomWidth: 1,
//     borderBottomColor: colors.border,
//     gap: spacing.md,
//   },
//   itemLeft: { flex: 1, minWidth: 0 },
//   itemRight: { alignItems: 'flex-end' },
//   itemName: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500' },
//   itemRef: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },
//   itemQty: { color: colors.textSecondary, fontSize: fontSize.xs },
//   itemTotal: {
//     color: colors.primary,
//     fontSize: fontSize.sm,
//     fontWeight: '700',
//     marginTop: 2,
//   },
//   totalRow: {
//     borderTopWidth: 2,
//     borderTopColor: colors.primary,
//     marginTop: spacing.md,
//     paddingTop: spacing.md,
//   },
//   totalLabel: {
//     color: colors.text,
//     fontSize: fontSize.md,
//     fontWeight: '800',
//   },
//   totalValue: {
//     color: colors.primary,
//     fontSize: fontSize.xl,
//     fontWeight: '800',
//   },
//   dueRow: {
//     marginTop: spacing.sm,
//     paddingTop: spacing.sm,
//     borderTopWidth: 1,
//     borderTopColor: colors.border,
//   },
//   dueLabel: {
//     color: colors.warning,
//     fontSize: fontSize.sm,
//     fontWeight: '700',
//   },
//   dueValue: {
//     color: colors.warning,
//     fontSize: fontSize.lg,
//     fontWeight: '800',
//   },
//   paymentRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: spacing.md,
//     borderBottomWidth: 1,
//     borderBottomColor: colors.border,
//     gap: spacing.md,
//   },
//   paymentAmount: {
//     color: colors.success,
//     fontSize: fontSize.md,
//     fontWeight: '700',
//   },
//   paymentMeta: {
//     color: colors.textSecondary,
//     fontSize: fontSize.xs,
//     marginTop: 2,
//   },
//   paymentRef: {
//     color: colors.textMuted,
//     fontSize: fontSize.xs,
//   },
//   empty: {
//     color: colors.textMuted,
//     fontSize: fontSize.sm,
//     fontStyle: 'italic',
//     textAlign: 'center',
//     paddingVertical: spacing.lg,
//   },
//   center: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: spacing.xl,
//   },
//   errorText: {
//     color: colors.error,
//     fontSize: fontSize.md,
//     textAlign: 'center',
//     marginBottom: spacing.lg,
//   },
//   actionRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: spacing.md,
//     borderTopWidth: 1,
//     borderTopColor: colors.border,
//   },
//   actionLabel: {
//     color: colors.text,
//     fontSize: fontSize.sm,
//     fontWeight: '500',
//   },
//   actionArrow: {
//     color: colors.textMuted,
//     fontSize: 20,
//     fontWeight: '300',
//   },
// });

import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  TouchableOpacity, RefreshControl, Alert, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { invoicesApi, invoiceAdvancedApi, onlinePaymentsApi, API_URL } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import InvoiceStatusBadge from '../../components/InvoiceStatusBadge';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [invoice, setInvoice] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/factures');
  };

  const loadAll = async () => {
    try {
      setError('');
      const [inv, pays] = await Promise.all([
        invoicesApi.get(id),
        invoicesApi.listPayments(id).catch(() => []),
      ]);
      setInvoice(inv);
      setPayments(Array.isArray(pays) ? pays : []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { loadAll(); }, [id]));

  const onRefresh = () => { setRefreshing(true); loadAll(); };

  const fmt = (n) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency', currency: invoice?.currency || 'EUR', minimumFractionDigits: 2,
    }).format(n || 0);

  const fmtDate = (d) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('fr-FR'); } catch { return d; }
  };

  const handleSendReminder = () => {
    Alert.alert('Envoyer une relance', `Relancer la facture ${invoice.invoiceNumber} ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Envoyer',
        onPress: async () => {
          try {
            await invoicesApi.sendReminder(id);
            Alert.alert('Succès', 'Relance envoyée');
          } catch (err) { Alert.alert('Erreur', err.response?.data?.error || err.message); }
        },
      },
    ]);
  };

  const handleDuplicate = () => {
    Alert.alert('Dupliquer', 'Créer une copie de cette facture ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Dupliquer',
        onPress: async () => {
          try {
            const res = await invoicesApi.duplicate(id);
            Alert.alert('Succès', `Facture ${res.invoice?.invoice_number || ''} créée`);
            if (res.invoice?.id) router.replace(`/invoice/${res.invoice.id}`);
          } catch (err) { Alert.alert('Erreur', err.response?.data?.error || err.message); }
        },
      },
    ]);
  };

  const handleCreateCreditNote = () => {
    Alert.alert('Créer un avoir', 'Type d\'avoir', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Avoir total',
        onPress: async () => {
          try {
            await invoicesApi.createCreditNote(id, { reason: 'Avoir total', fullCredit: true });
            Alert.alert('Succès', 'Avoir créé');
            router.replace('/(app)/factures');
          } catch (err) { Alert.alert('Erreur', err.response?.data?.error || err.message); }
        },
      },
    ]);
  };

  const handleChangeStatus = () => {
    const statuses = [
      { label: 'Brouillon', value: 'draft' },
      { label: 'Envoyée', value: 'sent' },
      { label: 'Payée', value: 'paid' },
      { label: 'En retard', value: 'overdue' },
      { label: 'Annulée', value: 'cancelled' },
    ];
    Alert.alert('Changer le statut', 'Sélectionnez', [
      ...statuses.map((s) => ({
        text: s.label,
        onPress: async () => {
          try {
            await invoicesApi.setStatus(id, s.value);
            await loadAll();
          } catch (err) { Alert.alert('Erreur', err.response?.data?.error || err.message); }
        },
      })),
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  const handleDelete = () => {
    Alert.alert('Supprimer', 'Confirmer la suppression ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          try {
            await invoicesApi.remove(id);
            router.replace('/(app)/factures');
          } catch (err) { Alert.alert('Erreur', err.response?.data?.error || err.message); }
        },
      },
    ]);
  };

  const handlePaymentLink = async () => {
    try {
      const res = await onlinePaymentsApi.createCheckout(id);
      Alert.alert('Lien de paiement', res.url || 'Lien généré', [
        { text: 'Copier', onPress: () => Linking.openURL(res.url) },
        { text: 'OK', style: 'cancel' },
      ]);
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || err.message);
    }
  };

  const handleSendPeppol = () => {
    Alert.alert('Peppol', 'Envoyer via Peppol ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Envoyer',
        onPress: async () => {
          try {
            const { peppolApi } = require('../../lib/api');
            await peppolApi.sendInvoice(id);
            Alert.alert('Succès', 'Facture envoyée via Peppol');
            await loadAll();
          } catch (err) { Alert.alert('Erreur', err.response?.data?.error || err.message); }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>
      </SafeAreaView>
    );
  }

  if (error || !invoice) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Erreur</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.errorText}>⚠️ {error || 'Facture introuvable'}</Text>
          <Button title="Retour" onPress={handleBack} variant="secondary" />
        </View>
      </SafeAreaView>
    );
  }

  const items = Array.isArray(invoice.items) ? invoice.items : [];
  const isPaid = invoice.status === 'paid';
  const amountDue = Number(invoice.amountDue) || Number(invoice.total) || 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{invoice.invoiceNumber}</Text>
        <InvoiceStatusBadge status={invoice.status} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
            tintColor={colors.accent} colors={[colors.accent]} />
        }
      >
        <Card>
          <Text style={styles.sectionTitle}>Informations</Text>
          <Row label="Client" value={invoice.clientName || '—'} />
          {invoice.clientEmail ? <Row label="Email" value={invoice.clientEmail} /> : null}
          <Row label="Émise le" value={fmtDate(invoice.issueDate)} />
          <Row label="Échéance" value={fmtDate(invoice.dueDate)} />
          {invoice.paymentDate ? <Row label="Payée le" value={fmtDate(invoice.paymentDate)} /> : null}
          {invoice.paymentMethod ? <Row label="Mode paiement" value={invoice.paymentMethod} /> : null}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Articles ({items.length})</Text>
          {items.length === 0 ? (
            <Text style={styles.empty}>Aucun article.</Text>
          ) : (
            items.map((it, i) => (
              <View key={i} style={styles.itemRow}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.itemName} numberOfLines={2}>{it.name}</Text>
                  {it.ref ? <Text style={styles.itemRef}>{it.ref}</Text> : null}
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.itemQty}>{it.qty} × {fmt(it.unitPrice)}</Text>
                  <Text style={styles.itemTotal}>{fmt(it.total)}</Text>
                </View>
              </View>
            ))
          )}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Totaux</Text>
          <Row label="Sous-total HT" value={fmt(invoice.subtotal)} />
          {invoice.vatRegime === 'assujetti' ? (
            <Row label="TVA" value={fmt(invoice.vatAmount)} />
          ) : (
            <Row label="TVA" value="Franchise" muted />
          )}
          <View style={[styles.row, styles.totalRow]}>
            <Text style={styles.totalLabel}>TOTAL TTC</Text>
            <Text style={styles.totalValue}>{fmt(invoice.total)}</Text>
          </View>
          {!isPaid && amountDue > 0 ? (
            <View style={[styles.row, styles.dueRow]}>
              <Text style={styles.dueLabel}>RESTE DÛ</Text>
              <Text style={styles.dueValue}>{fmt(amountDue)}</Text>
            </View>
          ) : null}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Paiements ({payments.length})</Text>
          {payments.length === 0 ? (
            <Text style={styles.empty}>Aucun paiement enregistré.</Text>
          ) : (
            payments.map((p, i) => (
              <View key={i} style={styles.paymentRow}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.paymentAmount}>{fmt(p.amount)}</Text>
                  <Text style={styles.paymentMeta}>
                    {fmtDate(p.paymentDate)}{p.paymentMethod ? ` · ${p.paymentMethod}` : ''}
                  </Text>
                </View>
                {p.reference ? <Text style={styles.paymentRef}>Réf: {p.reference}</Text> : null}
              </View>
            ))
          )}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Actions</Text>

          {!isPaid && (
            <TouchableOpacity style={styles.actionRow}
              onPress={() => router.push(`/invoice/payment?id=${id}`)} activeOpacity={0.7}>
              <Text style={styles.actionLabel}>💰 Enregistrer un paiement</Text>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>
          )}

          {!isPaid && (
            <TouchableOpacity style={styles.actionRow}
              onPress={() => router.push(`/invoice/schedule?id=${id}`)} activeOpacity={0.7}>
              <Text style={styles.actionLabel}>📅 Plan de paiement</Text>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>
          )}

          {!isPaid && invoice.clientEmail && (
            <TouchableOpacity style={styles.actionRow} onPress={handleSendReminder} activeOpacity={0.7}>
              <Text style={styles.actionLabel}>📧 Envoyer une relance</Text>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>
          )}

          {!isPaid && (
            <TouchableOpacity style={styles.actionRow} onPress={handlePaymentLink} activeOpacity={0.7}>
              <Text style={styles.actionLabel}>💳 Lien de paiement Stripe</Text>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.actionRow} onPress={handleDuplicate} activeOpacity={0.7}>
            <Text style={styles.actionLabel}>📋 Dupliquer</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          {invoice.status !== 'cancelled' && invoice.invoice_type !== 'credit_note' && (
            <TouchableOpacity style={styles.actionRow} onPress={handleCreateCreditNote} activeOpacity={0.7}>
              <Text style={styles.actionLabel}>↩ Créer un avoir</Text>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.actionRow} onPress={handleSendPeppol} activeOpacity={0.7}>
            <Text style={styles.actionLabel}>📨 Envoyer via Peppol</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow} onPress={handleChangeStatus} activeOpacity={0.7}>
            <Text style={styles.actionLabel}>🔄 Changer le statut</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow}
            onPress={() => Linking.openURL(`${API_URL}/api/invoices/${id}/pdf`)}
            activeOpacity={0.7}>
            <Text style={styles.actionLabel}>⬇ Télécharger PDF</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow} onPress={handleDelete} activeOpacity={0.7}>
            <Text style={[styles.actionLabel, { color: colors.error }]}>🗑 Supprimer</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value, muted }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, muted && { color: colors.textMuted, fontStyle: 'italic' }]} numberOfLines={3}>
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
  itemTotal: { color: '#3b82f6', fontSize: fontSize.sm, fontWeight: '700', marginTop: 2 },
  totalRow: {
    borderTopWidth: 2, borderTopColor: '#3b82f6',
    marginTop: spacing.md, paddingTop: spacing.md,
  },
  totalLabel: { color: colors.text, fontSize: fontSize.md, fontWeight: '800' },
  totalValue: { color: '#3b82f6', fontSize: fontSize.xl, fontWeight: '800' },
  dueRow: {
    marginTop: spacing.sm, paddingTop: spacing.sm,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  dueLabel: { color: colors.warning, fontSize: fontSize.sm, fontWeight: '700' },
  dueValue: { color: colors.warning, fontSize: fontSize.lg, fontWeight: '800' },
  paymentRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.md,
  },
  paymentAmount: { color: colors.success, fontSize: fontSize.md, fontWeight: '700' },
  paymentMeta: { color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2 },
  paymentRef: { color: colors.textMuted, fontSize: fontSize.xs },
  empty: { color: colors.textMuted, fontSize: fontSize.sm, fontStyle: 'italic', textAlign: 'center', paddingVertical: spacing.lg },
  actionRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: colors.border,
  },
  actionLabel: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500' },
  actionArrow: { color: colors.textMuted, fontSize: 20, fontWeight: '300' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorText: { color: colors.error, fontSize: fontSize.md, textAlign: 'center', marginBottom: spacing.lg },
});