// import { useState, useCallback } from 'react';
// import {
//   View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity,
//   RefreshControl, Alert, Modal,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useFocusEffect, useRouter } from 'expo-router';
// import { proactiveApi } from '../../lib/api';
// import { colors, spacing, fontSize, radius } from '../../lib/theme';
// import Header from '../../components/Header';
// import Card from '../../components/Card';
// import Input from '../../components/Input';
// import Button from '../../components/Button';
// import EmptyState from '../../components/EmptyState';

// const TYPE_CONFIG = {
//   overdue_invoices: { border: '#f87171', badge: 'Facture en retard' },
//   dormant_quote: { border: '#eab308', badge: 'Devis dormant' },
//   upcoming_payments: { border: '#3b82f6', badge: 'Échéance' },
//   low_stock: { border: '#f97316', badge: 'Stock bas' },
// };

// const ACTION_LABELS = {
//   send_reminders: 'Envoyer les relances',
//   follow_up_quote: 'Relancer le client',
//   view_schedules: 'Voir les échéances',
//   generate_purchase_orders: 'Générer les BC',
// };

// export default function ProactiveScreen() {
//   const router = useRouter();
//   const [suggestions, setSuggestions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState('');
//   const [running, setRunning] = useState(false);
//   const [settingsOpen, setSettingsOpen] = useState(false);
//   const [settings, setSettings] = useState(null);
//   const [savingSettings, setSavingSettings] = useState(false);

//   const loadSuggestions = async () => {
//     try {
//       setError('');
//       const data = await proactiveApi.suggestions();
//       setSuggestions(Array.isArray(data) ? data : []);
//     } catch (err) {
//       setError(err.response?.data?.error || err.message || 'Erreur');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       loadSuggestions();
//     }, [])
//   );

//   const onRefresh = () => {
//     setRefreshing(true);
//     loadSuggestions();
//   };

//   const runDetection = async () => {
//     setRunning(true);
//     try {
//       const res = await proactiveApi.run();
//       Alert.alert('Analyse terminée', `${res.detected || 0} nouvelle(s) situation(s) détectée(s)`);
//       await loadSuggestions();
//     } catch (err) {
//       Alert.alert('Erreur', err.response?.data?.error || err.message);
//     } finally {
//       setRunning(false);
//     }
//   };

//   const dismiss = async (id) => {
//     try {
//       await proactiveApi.dismiss(id);
//       await loadSuggestions();
//     } catch (err) {
//       Alert.alert('Erreur', err.response?.data?.error || err.message);
//     }
//   };

//   const executeAction = async (s) => {
//     // Marquer comme actionnée
//     try {
//       await proactiveApi.actioned(s.id);
//     } catch (err) {
//       // silent
//     }

//     // Rediriger selon le type
//     if (s.actionType === 'send_reminders') {
//       router.push('/(app)/factures');
//     } else if (s.actionType === 'follow_up_quote') {
//       router.push('/(app)/devis');
//     } else if (s.actionType === 'view_schedules') {
//       router.push('/(app)/factures');
//     } else if (s.actionType === 'generate_purchase_orders') {
//       router.push('/(app)/purchase-orders');
//     }

//     await loadSuggestions();
//   };

//   const openSettings = async () => {
//     try {
//       const s = await proactiveApi.settings();
//       setSettings(s);
//       setSettingsOpen(true);
//     } catch (err) {
//       Alert.alert('Erreur', err.response?.data?.error || err.message);
//     }
//   };

//   const saveSettings = async () => {
//     setSavingSettings(true);
//     try {
//       await proactiveApi.updateSettings({
//         enabled: settings.enabled,
//         overdueInvoiceEnabled: settings.overdueInvoiceEnabled,
//         dormantQuoteEnabled: settings.dormantQuoteEnabled,
//         dormantQuoteDays: parseInt(settings.dormantQuoteDays) || 14,
//         upcomingPaymentEnabled: settings.upcomingPaymentEnabled,
//         upcomingPaymentDays: parseInt(settings.upcomingPaymentDays) || 3,
//         lowStockEnabled: settings.lowStockEnabled,
//       });
//       Alert.alert('Succès', 'Paramètres enregistrés');
//       setSettingsOpen(false);
//       await loadSuggestions();
//     } catch (err) {
//       Alert.alert('Erreur', err.response?.data?.error || err.message);
//     } finally {
//       setSavingSettings(false);
//     }
//   };

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.safe} edges={['top']}>
//         <Header title="Assistant proactif" showBack />
//         <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.safe} edges={['top']}>
//       <Header title="Assistant proactif" showBack />
//       <ScrollView
//         contentContainerStyle={styles.scroll}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
//             tintColor={colors.accent} colors={[colors.accent]} />
//         }
//       >
//         {!!error && (<View style={styles.errorBox}><Text style={styles.errorText}>⚠️ {error}</Text></View>)}

//         <View style={styles.actionsRow}>
//           <TouchableOpacity
//             style={[styles.actionBtn, styles.actionPrimary]}
//             onPress={runDetection}
//             disabled={running}
//             activeOpacity={0.7}
//           >
//             <Text style={styles.actionPrimaryText}>
//               {running ? '⏳ Analyse...' : '🔍 Analyser maintenant'}
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.actionBtn, styles.actionSecondary]}
//             onPress={openSettings}
//             activeOpacity={0.7}
//           >
//             <Text style={styles.actionSecondaryText}>⚙️ Paramètres</Text>
//           </TouchableOpacity>
//         </View>

//         {suggestions.length === 0 ? (
//           <EmptyState
//             icon="✨"
//             title="Aucune alerte"
//             message="L'assistant surveille votre activité. Vous serez prévenu dès qu'une situation mérite votre attention."
//           />
//         ) : (
//           suggestions.map((s) => {
//             const config = TYPE_CONFIG[s.type] || { border: '#94a3b8', badge: 'Alerte' };
//             return (
//               <View key={s.id} style={[styles.card, { borderLeftColor: config.border }]}>
//                 <Text style={[styles.badge, { color: config.border }]}>
//                   {config.badge.toUpperCase()}
//                 </Text>
//                 <Text style={styles.title}>{s.title}</Text>
//                 <Text style={styles.message}>{s.message}</Text>
//                 <Text style={styles.date}>
//                   {new Date(s.createdAt).toLocaleString('fr-FR')}
//                 </Text>
//                 <View style={styles.cardActions}>
//                   {s.actionType && (
//                     <TouchableOpacity
//                       style={[styles.cardBtn, styles.cardBtnPrimary]}
//                       onPress={() => executeAction(s)}
//                       activeOpacity={0.7}
//                     >
//                       <Text style={styles.cardBtnPrimaryText}>
//                         {ACTION_LABELS[s.actionType] || 'Voir'}
//                       </Text>
//                     </TouchableOpacity>
//                   )}
//                   <TouchableOpacity
//                     style={[styles.cardBtn, styles.cardBtnSecondary]}
//                     onPress={() => dismiss(s.id)}
//                     activeOpacity={0.7}
//                   >
//                     <Text style={styles.cardBtnSecondaryText}>Ignorer</Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             );
//           })
//         )}
//       </ScrollView>

//       {/* Modal paramètres */}
//       <Modal visible={settingsOpen} transparent animationType="slide"
//         onRequestClose={() => setSettingsOpen(false)}>
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalBox}>
//             <ScrollView>
//               <Text style={styles.modalTitle}>⚙️ Paramètres de détection</Text>

//               {settings && (
//                 <>
//                   <TouchableOpacity style={styles.checkboxRow}
//                     onPress={() => setSettings({ ...settings, enabled: !settings.enabled })} activeOpacity={0.7}>
//                     <View style={[styles.checkbox, settings.enabled && styles.checkboxOn]}>
//                       {settings.enabled && <Text style={styles.checkmark}>✓</Text>}
//                     </View>
//                     <Text style={styles.checkboxLabel}>Activer la détection</Text>
//                   </TouchableOpacity>

//                   {settings.enabled && (
//                     <>
//                       <TouchableOpacity style={styles.checkboxRow}
//                         onPress={() => setSettings({ ...settings, overdueInvoiceEnabled: !settings.overdueInvoiceEnabled })} activeOpacity={0.7}>
//                         <View style={[styles.checkbox, settings.overdueInvoiceEnabled && styles.checkboxOn]}>
//                           {settings.overdueInvoiceEnabled && <Text style={styles.checkmark}>✓</Text>}
//                         </View>
//                         <Text style={styles.checkboxLabel}>Factures en retard</Text>
//                       </TouchableOpacity>

//                       <TouchableOpacity style={styles.checkboxRow}
//                         onPress={() => setSettings({ ...settings, dormantQuoteEnabled: !settings.dormantQuoteEnabled })} activeOpacity={0.7}>
//                         <View style={[styles.checkbox, settings.dormantQuoteEnabled && styles.checkboxOn]}>
//                           {settings.dormantQuoteEnabled && <Text style={styles.checkmark}>✓</Text>}
//                         </View>
//                         <Text style={styles.checkboxLabel}>Devis dormants</Text>
//                       </TouchableOpacity>

//                       <Input label="Jours devis dormant" value={String(settings.dormantQuoteDays || 14)}
//                         onChangeText={(v) => setSettings({ ...settings, dormantQuoteDays: v })} keyboardType="numeric" />

//                       <TouchableOpacity style={styles.checkboxRow}
//                         onPress={() => setSettings({ ...settings, upcomingPaymentEnabled: !settings.upcomingPaymentEnabled })} activeOpacity={0.7}>
//                         <View style={[styles.checkbox, settings.upcomingPaymentEnabled && styles.checkboxOn]}>
//                           {settings.upcomingPaymentEnabled && <Text style={styles.checkmark}>✓</Text>}
//                         </View>
//                         <Text style={styles.checkboxLabel}>Échéances à venir</Text>
//                       </TouchableOpacity>

//                       <Input label="Jours avant échéance" value={String(settings.upcomingPaymentDays || 3)}
//                         onChangeText={(v) => setSettings({ ...settings, upcomingPaymentDays: v })} keyboardType="numeric" />

//                       <TouchableOpacity style={styles.checkboxRow}
//                         onPress={() => setSettings({ ...settings, lowStockEnabled: !settings.lowStockEnabled })} activeOpacity={0.7}>
//                         <View style={[styles.checkbox, settings.lowStockEnabled && styles.checkboxOn]}>
//                           {settings.lowStockEnabled && <Text style={styles.checkmark}>✓</Text>}
//                         </View>
//                         <Text style={styles.checkboxLabel}>Produits en alerte de stock</Text>
//                       </TouchableOpacity>
//                     </>
//                   )}
//                 </>
//               )}

//               <View style={styles.modalActions}>
//                 <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]}
//                   onPress={() => setSettingsOpen(false)} disabled={savingSettings}>
//                   <Text style={styles.modalBtnCancelText}>Annuler</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity style={[styles.modalBtn, styles.modalBtnConfirm]}
//                   onPress={saveSettings} disabled={savingSettings}>
//                   <Text style={styles.modalBtnConfirmText}>
//                     {savingSettings ? '...' : 'Enregistrer'}
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: colors.bg },
//   scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
//   actionsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
//   actionBtn: {
//     flex: 1, paddingVertical: 12, borderRadius: radius.full,
//     alignItems: 'center', justifyContent: 'center', minHeight: 44,
//   },
//   actionPrimary: { backgroundColor: colors.accent },
//   actionPrimaryText: { color: '#0b1120', fontSize: fontSize.sm, fontWeight: '700' },
//   actionSecondary: { backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.borderLight },
//   actionSecondaryText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600' },
//   card: {
//     backgroundColor: colors.bgCard, borderRadius: radius.lg,
//     borderWidth: 1, borderColor: colors.border, borderLeftWidth: 4,
//     padding: spacing.lg, marginBottom: spacing.md,
//   },
//   badge: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
//   title: { color: colors.text, fontSize: fontSize.md, fontWeight: '700', marginBottom: spacing.sm },
//   message: { color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 20, marginBottom: spacing.md },
//   date: { color: colors.textMuted, fontSize: 10, marginBottom: spacing.md },
//   cardActions: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
//   cardBtn: {
//     paddingVertical: 8, paddingHorizontal: spacing.md,
//     borderRadius: radius.full, alignItems: 'center', justifyContent: 'center',
//   },
//   cardBtnPrimary: { backgroundColor: colors.accent },
//   cardBtnPrimaryText: { color: '#0b1120', fontSize: fontSize.xs, fontWeight: '700' },
//   cardBtnSecondary: { backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.borderLight },
//   cardBtnSecondaryText: { color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: '600' },
//   modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
//   modalBox: {
//     backgroundColor: colors.bgCard, borderRadius: radius.lg,
//     padding: spacing.lg, width: '100%', maxWidth: 500, maxHeight: '85%',
//     borderWidth: 1, borderColor: colors.borderLight,
//   },
//   modalTitle: { color: colors.text, fontSize: fontSize.lg, fontWeight: '800', marginBottom: spacing.lg },
//   checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
//   checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: colors.borderLight, alignItems: 'center', justifyContent: 'center' },
//   checkboxOn: { backgroundColor: colors.accent, borderColor: colors.accent },
//   checkmark: { color: '#fff', fontSize: 14, fontWeight: '800' },
//   checkboxLabel: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500', flex: 1 },
//   modalActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
//   modalBtn: { flex: 1, paddingVertical: 12, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', minHeight: 44 },
//   modalBtnCancel: { backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.borderLight },
//   modalBtnCancelText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600' },
//   modalBtnConfirm: { backgroundColor: colors.accent },
//   modalBtnConfirmText: { color: '#0b1120', fontSize: fontSize.sm, fontWeight: '700' },
//   center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
//   errorBox: {
//     backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1,
//     borderColor: 'rgba(239,68,68,0.35)', borderRadius: radius.md,
//     padding: spacing.md, marginBottom: spacing.lg,
//   },
//   errorText: { color: colors.error, fontSize: fontSize.sm },
// });

import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity,
  RefreshControl, Alert, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { proactiveApi, proactiveActionsApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';

const TYPE_CONFIG = {
  overdue_invoices: { border: '#f87171', badge: 'Facture en retard' },
  dormant_quote: { border: '#eab308', badge: 'Devis dormant' },
  upcoming_payments: { border: '#3b82f6', badge: 'Échéance' },
  low_stock: { border: '#f97316', badge: 'Stock bas' },
};

const ACTION_LABELS = {
  send_reminders: '📧 Envoyer les relances',
  follow_up_quote: '📤 Relancer le client',
  view_schedules: '📅 Voir les échéances',
  generate_purchase_orders: '🛒 Générer les BC',
};

export default function ProactiveScreen() {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [running, setRunning] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState(null);
  const [savingSettings, setSavingSettings] = useState(false);

  // Modal détails + action
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsSuggestion, setDetailsSuggestion] = useState(null);
  const [details, setDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [actionRunning, setActionRunning] = useState(false);

  const loadSuggestions = async () => {
    try {
      setError('');
      const data = await proactiveApi.suggestions();
      setSuggestions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { loadSuggestions(); }, []));

  const onRefresh = () => { setRefreshing(true); loadSuggestions(); };

  const runDetection = async () => {
    setRunning(true);
    try {
      const res = await proactiveApi.run();
      Alert.alert('Analyse terminée', `${res.detected || 0} nouvelle(s) situation(s) détectée(s)`);
      await loadSuggestions();
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || err.message);
    } finally {
      setRunning(false);
    }
  };

  const dismiss = async (id) => {
    try {
      await proactiveApi.dismiss(id);
      await loadSuggestions();
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || err.message);
    }
  };

  const openDetails = async (s) => {
    setDetailsSuggestion(s);
    setDetailsOpen(true);
    setDetails(null);
    setLoadingDetails(true);
    try {
      const data = await proactiveActionsApi.details(s.id).catch(() => null);
      setDetails(data);
    } catch (err) {
      setDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const executeAction = async (s, directAction = null) => {
    const actionType = directAction || s.actionType;
    setActionRunning(true);
    setBusyId(s.id);
    try {
      let res = null;
      if (actionType === 'send_reminders') {
        res = await proactiveActionsApi.sendReminders(s.id);
      } else if (actionType === 'follow_up_quote') {
        res = await proactiveActionsApi.followUpQuote(s.id);
      } else if (actionType === 'generate_purchase_orders') {
        res = await proactiveActionsApi.generatePurchaseOrders(s.id);
      } else if (actionType === 'view_schedules') {
        router.push('/(app)/factures');
      }

      await proactiveApi.actioned(s.id).catch(() => null);
      await loadSuggestions();

      if (res) {
        const count = res.sent || res.count || res.generated || 0;
        Alert.alert('Succès', `${count} action(s) effectuée(s)`);
      }
      setDetailsOpen(false);
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || err.message);
    } finally {
      setActionRunning(false);
      setBusyId(null);
    }
  };

  const openSettings = async () => {
    try {
      const s = await proactiveApi.settings();
      setSettings(s);
      setSettingsOpen(true);
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || err.message);
    }
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      await proactiveApi.updateSettings({
        enabled: settings.enabled,
        overdueInvoiceEnabled: settings.overdueInvoiceEnabled,
        dormantQuoteEnabled: settings.dormantQuoteEnabled,
        dormantQuoteDays: parseInt(settings.dormantQuoteDays) || 14,
        upcomingPaymentEnabled: settings.upcomingPaymentEnabled,
        upcomingPaymentDays: parseInt(settings.upcomingPaymentDays) || 3,
        lowStockEnabled: settings.lowStockEnabled,
      });
      Alert.alert('Succès', 'Paramètres enregistrés');
      setSettingsOpen(false);
      await loadSuggestions();
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Assistant proactif" showBack />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Assistant proactif" showBack />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
            tintColor={colors.accent} colors={[colors.accent]} />
        }
      >
        {!!error && (<View style={styles.errorBox}><Text style={styles.errorText}>⚠️ {error}</Text></View>)}

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionPrimary]}
            onPress={runDetection} disabled={running} activeOpacity={0.7}>
            <Text style={styles.actionPrimaryText}>
              {running ? '⏳ Analyse...' : '🔍 Analyser maintenant'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionSecondary]}
            onPress={openSettings} activeOpacity={0.7}>
            <Text style={styles.actionSecondaryText}>⚙️ Paramètres</Text>
          </TouchableOpacity>
        </View>

        {suggestions.length === 0 ? (
          <EmptyState icon="✨" title="Aucune alerte"
            message="L'assistant surveille votre activité. Vous serez prévenu dès qu'une situation mérite votre attention." />
        ) : (
          suggestions.map((s) => {
            const config = TYPE_CONFIG[s.type] || { border: '#94a3b8', badge: 'Alerte' };
            const isBusy = busyId === s.id;
            return (
              <View key={s.id} style={[styles.card, { borderLeftColor: config.border }]}>
                <Text style={[styles.badge, { color: config.border }]}>
                  {config.badge.toUpperCase()}
                </Text>
                <Text style={styles.title}>{s.title}</Text>
                <Text style={styles.message}>{s.message}</Text>
                <Text style={styles.date}>
                  {new Date(s.createdAt).toLocaleString('fr-FR')}
                </Text>
                <View style={styles.cardActions}>
                  {s.actionType && (
                    <TouchableOpacity
                      style={[styles.cardBtn, styles.cardBtnPrimary]}
                      onPress={() => executeAction(s)}
                      disabled={isBusy}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.cardBtnPrimaryText}>
                        {isBusy ? '⏳...' : (ACTION_LABELS[s.actionType] || 'Voir')}
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.cardBtn, styles.cardBtnSecondary]}
                    onPress={() => openDetails(s)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cardBtnSecondaryText}>Détails</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.cardBtn, styles.cardBtnSecondary]}
                    onPress={() => dismiss(s.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cardBtnSecondaryText}>Ignorer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Modal détails */}
      <Modal visible={detailsOpen} transparent animationType="slide"
        onRequestClose={() => setDetailsOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <ScrollView>
              <Text style={styles.modalTitle}>
                {detailsSuggestion?.title || 'Détails'}
              </Text>
              <Text style={styles.modalMessage}>
                {detailsSuggestion?.message}
              </Text>

              {loadingDetails ? (
                <ActivityIndicator color={colors.accent} style={{ marginVertical: spacing.lg }} />
              ) : details ? (
                <View style={{ marginTop: spacing.lg }}>
                  {details.invoices && details.invoices.length > 0 && (
                    <>
                      <Text style={styles.detailsSectionTitle}>
                        Factures concernées ({details.invoices.length})
                      </Text>
                      {details.invoices.map((inv) => (
                        <TouchableOpacity key={inv.id}
                          onPress={() => { setDetailsOpen(false); router.push(`/invoice/${inv.id}`); }}
                          style={styles.detailRow} activeOpacity={0.7}>
                          <Text style={styles.detailMain}>{inv.invoiceNumber}</Text>
                          <Text style={styles.detailSub}>
                            {inv.clientName} · {Number(inv.amountDue || 0).toFixed(2)} €
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </>
                  )}

                  {details.quotes && details.quotes.length > 0 && (
                    <>
                      <Text style={styles.detailsSectionTitle}>
                        Devis concernés ({details.quotes.length})
                      </Text>
                      {details.quotes.map((q) => (
                        <TouchableOpacity key={q.id}
                          onPress={() => { setDetailsOpen(false); router.push(`/quote/${q.id}`); }}
                          style={styles.detailRow} activeOpacity={0.7}>
                          <Text style={styles.detailMain}>{q.quoteNumber}</Text>
                          <Text style={styles.detailSub}>
                            {q.clientName} · {Number(q.total || 0).toFixed(2)} €
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </>
                  )}

                  {details.products && details.products.length > 0 && (
                    <>
                      <Text style={styles.detailsSectionTitle}>
                        Produits concernés ({details.products.length})
                      </Text>
                      {details.products.map((p) => (
                        <TouchableOpacity key={p.id}
                          onPress={() => { setDetailsOpen(false); router.push(`/stock/product?id=${p.id}`); }}
                          style={styles.detailRow} activeOpacity={0.7}>
                          <Text style={styles.detailMain}>{p.name}</Text>
                          <Text style={styles.detailSub}>
                            Stock : {p.stockQuantity} / Seuil : {p.stockAlertThreshold}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </>
                  )}

                  {!details.invoices?.length && !details.quotes?.length && !details.products?.length && (
                    <Text style={styles.empty}>Aucun détail supplémentaire.</Text>
                  )}
                </View>
              ) : (
                <Text style={styles.empty}>Détails indisponibles.</Text>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]}
                  onPress={() => setDetailsOpen(false)} disabled={actionRunning}>
                  <Text style={styles.modalBtnCancelText}>Fermer</Text>
                </TouchableOpacity>
                {detailsSuggestion?.actionType && (
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.modalBtnConfirm]}
                    onPress={() => executeAction(detailsSuggestion)}
                    disabled={actionRunning}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.modalBtnConfirmText}>
                      {actionRunning ? '⏳...' : 'Exécuter'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal paramètres */}
      <Modal visible={settingsOpen} transparent animationType="slide"
        onRequestClose={() => setSettingsOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <ScrollView>
              <Text style={styles.modalTitle}>⚙️ Paramètres de détection</Text>

              {settings && (
                <>
                  <ToggleRow
                    label="Activer la détection"
                    value={settings.enabled}
                    onToggle={() => setSettings({ ...settings, enabled: !settings.enabled })}
                  />

                  {settings.enabled && (
                    <>
                      <ToggleRow
                        label="Factures en retard"
                        value={settings.overdueInvoiceEnabled}
                        onToggle={() => setSettings({ ...settings, overdueInvoiceEnabled: !settings.overdueInvoiceEnabled })}
                      />
                      <ToggleRow
                        label="Devis dormants"
                        value={settings.dormantQuoteEnabled}
                        onToggle={() => setSettings({ ...settings, dormantQuoteEnabled: !settings.dormantQuoteEnabled })}
                      />
                      <Input
                        label="Jours devis dormant"
                        value={String(settings.dormantQuoteDays || 14)}
                        onChangeText={(v) => setSettings({ ...settings, dormantQuoteDays: v })}
                        keyboardType="numeric"
                      />
                      <ToggleRow
                        label="Échéances à venir"
                        value={settings.upcomingPaymentEnabled}
                        onToggle={() => setSettings({ ...settings, upcomingPaymentEnabled: !settings.upcomingPaymentEnabled })}
                      />
                      <Input
                        label="Jours avant échéance"
                        value={String(settings.upcomingPaymentDays || 3)}
                        onChangeText={(v) => setSettings({ ...settings, upcomingPaymentDays: v })}
                        keyboardType="numeric"
                      />
                      <ToggleRow
                        label="Produits en alerte de stock"
                        value={settings.lowStockEnabled}
                        onToggle={() => setSettings({ ...settings, lowStockEnabled: !settings.lowStockEnabled })}
                      />
                    </>
                  )}
                </>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]}
                  onPress={() => setSettingsOpen(false)} disabled={savingSettings}>
                  <Text style={styles.modalBtnCancelText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnConfirm]}
                  onPress={saveSettings} disabled={savingSettings}>
                  <Text style={styles.modalBtnConfirmText}>
                    {savingSettings ? '...' : 'Enregistrer'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function ToggleRow({ label, value, onToggle }) {
  return (
    <TouchableOpacity style={styles.checkboxRow} onPress={onToggle} activeOpacity={0.7}>
      <View style={[styles.checkbox, value && styles.checkboxOn]}>
        {value && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  actionsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  actionBtn: {
    flex: 1, paddingVertical: 12, borderRadius: radius.full,
    alignItems: 'center', justifyContent: 'center', minHeight: 44,
  },
  actionPrimary: { backgroundColor: colors.accent },
  actionPrimaryText: { color: '#0b1120', fontSize: fontSize.sm, fontWeight: '700' },
  actionSecondary: { backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.borderLight },
  actionSecondaryText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600' },
  card: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, borderLeftWidth: 4,
    padding: spacing.lg, marginBottom: spacing.md,
  },
  badge: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  title: { color: colors.text, fontSize: fontSize.md, fontWeight: '700', marginBottom: spacing.sm },
  message: { color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 20, marginBottom: spacing.md },
  date: { color: colors.textMuted, fontSize: 10, marginBottom: spacing.md },
  cardActions: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  cardBtn: {
    paddingVertical: 8, paddingHorizontal: spacing.md,
    borderRadius: radius.full, alignItems: 'center', justifyContent: 'center',
  },
  cardBtnPrimary: { backgroundColor: colors.accent },
  cardBtnPrimaryText: { color: '#0b1120', fontSize: fontSize.xs, fontWeight: '700' },
  cardBtnSecondary: { backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.borderLight },
  cardBtnSecondaryText: { color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  modalBox: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    padding: spacing.lg, width: '100%', maxWidth: 500, maxHeight: '85%',
    borderWidth: 1, borderColor: colors.borderLight,
  },
  modalTitle: { color: colors.text, fontSize: fontSize.lg, fontWeight: '800', marginBottom: spacing.md },
  modalMessage: { color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 20 },
  detailsSectionTitle: {
    color: colors.textSecondary, fontSize: 10, textTransform: 'uppercase',
    fontWeight: '700', letterSpacing: 0.5, marginTop: spacing.lg, marginBottom: spacing.sm,
  },
  detailRow: {
    paddingVertical: spacing.md, paddingHorizontal: spacing.md,
    borderRadius: radius.md, backgroundColor: colors.bgInput,
    borderWidth: 1, borderColor: colors.borderLight, marginBottom: spacing.sm,
  },
  detailMain: { color: colors.text, fontSize: fontSize.sm, fontWeight: '700' },
  detailSub: { color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2,
    borderColor: colors.borderLight, alignItems: 'center', justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '800' },
  checkboxLabel: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500', flex: 1 },
  modalActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', minHeight: 44 },
  modalBtnCancel: { backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.borderLight },
  modalBtnCancelText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600' },
  modalBtnConfirm: { backgroundColor: colors.accent },
  modalBtnConfirmText: { color: '#0b1120', fontSize: fontSize.sm, fontWeight: '700' },
  empty: { color: colors.textMuted, fontSize: fontSize.sm, fontStyle: 'italic', textAlign: 'center', paddingVertical: spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)', borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.lg,
  },
  errorText: { color: colors.error, fontSize: fontSize.sm },
});