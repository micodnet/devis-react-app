// import { useState, useEffect, useCallback } from 'react';
// import {
//   View, Text, StyleSheet, ScrollView, ActivityIndicator,
//   TouchableOpacity, RefreshControl,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
// import { chantiersApi } from '../../lib/api';
// import { colors, spacing, fontSize, radius } from '../../lib/theme';
// import Card from '../../components/Card';
// import Button from '../../components/Button';

// const STATUS_LABELS = {
//   planned: '📋 Planifié',
//   in_progress: '🔨 En cours',
//   paused: '⏸ En pause',
//   completed: '✅ Terminé',
//   cancelled: '❌ Annulé',
// };

// export default function ChantierDetailScreen() {
//   const { id } = useLocalSearchParams();
//   const router = useRouter();

//   const [chantier, setChantier] = useState(null);
//   const [stats, setStats] = useState(null);
//   const [quotes, setQuotes] = useState([]);
//   const [invoices, setInvoices] = useState([]);
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState('');

//   const handleBack = () => {
//     if (router.canGoBack()) router.back();
//     else router.replace('/(app)/chantiers');
//   };

//   const loadAll = async () => {
//     try {
//       setError('');
//       const [c, s, q, i, e] = await Promise.all([
//         chantiersApi.get(id),
//         chantiersApi.stats(id).catch(() => null),
//         chantiersApi.quotes(id).catch(() => []),
//         chantiersApi.invoices(id).catch(() => []),
//         chantiersApi.events(id).catch(() => []),
//       ]);
//       setChantier(c);
//       setStats(s);
//       setQuotes(Array.isArray(q) ? q : []);
//       setInvoices(Array.isArray(i) ? i : []);
//       setEvents(Array.isArray(e) ? e : []);
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
//       currency: 'EUR',
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

//   if (error || !chantier) {
//     return (
//       <SafeAreaView style={styles.safe} edges={['top']}>
//         <View style={styles.header}>
//           <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
//             <Text style={styles.backText}>←</Text>
//           </TouchableOpacity>
//           <Text style={styles.title}>Erreur</Text>
//         </View>
//         <View style={styles.center}>
//           <Text style={styles.errorText}>⚠️ {error || 'Chantier introuvable'}</Text>
//           <Button title="Retour" onPress={handleBack} variant="secondary" />
//         </View>
//       </SafeAreaView>
//     );
//   }

//   const progression = stats?.progression || 0;
//   const statusLabel = STATUS_LABELS[chantier.status] || chantier.status;

//   return (
//     <SafeAreaView style={styles.safe} edges={['top']}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
//           <Text style={styles.backText}>←</Text>
//         </TouchableOpacity>
//         <Text style={styles.title} numberOfLines={1}>
//           {chantier.name}
//         </Text>
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
//           {chantier.reference ? (
//             <Row label="Référence" value={chantier.reference} />
//           ) : null}
//           <Row label="Statut" value={statusLabel} />
//           {chantier.clientName ? (
//             <Row label="Client" value={chantier.clientName} />
//           ) : null}
//           {chantier.clientAddress ? (
//             <Row label="Adresse" value={chantier.clientAddress} />
//           ) : null}
//           {chantier.startDate ? (
//             <Row label="Début" value={fmtDate(chantier.startDate)} />
//           ) : null}
//           {chantier.endDate ? (
//             <Row label="Fin prévue" value={fmtDate(chantier.endDate)} />
//           ) : null}
//           {chantier.budgetEstimate ? (
//             <Row label="Budget estimé" value={fmtMoney(chantier.budgetEstimate)} />
//           ) : null}
//         </Card>

//         {/* Progression */}
//         {stats ? (
//           <Card>
//             <Text style={styles.sectionTitle}>Progression</Text>
//             <View style={styles.progressBar}>
//               <View
//                 style={[
//                   styles.progressFill,
//                   {
//                     width: `${Math.min(100, progression)}%`,
//                     backgroundColor: chantier.color || colors.accent,
//                   },
//                 ]}
//               />
//             </View>
//             <Text style={styles.progressText}>{progression}%</Text>

//             <View style={styles.statsGrid}>
//               <Stat label="Devis" value={String(stats.quotes?.total || 0)} />
//               <Stat
//                 label="Acceptés"
//                 value={String(stats.quotes?.accepted || 0)}
//               />
//               <Stat
//                 label="CA accepté"
//                 value={fmtMoney(stats.quotes?.acceptedValue)}
//               />
//               <Stat
//                 label="Reste à facturer"
//                 value={fmtMoney(stats.remainingToInvoice)}
//               />
//             </View>
//           </Card>
//         ) : null}

//         {/* Devis */}
//         <Card>
//           <Text style={styles.sectionTitle}>Devis ({quotes.length})</Text>
//           {quotes.length === 0 ? (
//             <Text style={styles.empty}>Aucun devis attaché.</Text>
//           ) : (
//             quotes.map((q) => (
//               <TouchableOpacity
//                 key={q.id}
//                 style={styles.rowItem}
//                 onPress={() => router.push(`/quote/${q.id}`)}
//                 activeOpacity={0.7}
//               >
//                 <View style={styles.itemLeft}>
//                   <Text style={styles.itemTitle}>{q.number || q.quoteNumber}</Text>
//                   <Text style={styles.itemSub}>{q.client || q.clientName || '—'}</Text>
//                 </View>
//                 <Text style={styles.itemAmount}>{fmtMoney(q.total)}</Text>
//               </TouchableOpacity>
//             ))
//           )}
//         </Card>

//         {/* Factures */}
//         <Card>
//           <Text style={styles.sectionTitle}>Factures ({invoices.length})</Text>
//           {invoices.length === 0 ? (
//             <Text style={styles.empty}>Aucune facture.</Text>
//           ) : (
//             invoices.map((inv) => (
//               <TouchableOpacity
//                 key={inv.id}
//                 style={styles.rowItem}
//                 onPress={() => router.push(`/invoice/${inv.id}`)}
//                 activeOpacity={0.7}
//               >
//                 <View style={styles.itemLeft}>
//                   <Text style={styles.itemTitle}>
//                     {inv.number || inv.invoiceNumber}
//                   </Text>
//                   <Text style={styles.itemSub}>
//                     {fmtDate(inv.issueDate)}
//                   </Text>
//                 </View>
//                 <Text style={styles.itemAmount}>{fmtMoney(inv.total)}</Text>
//               </TouchableOpacity>
//             ))
//           )}
//         </Card>

//         {/* Événements */}
//         <Card>
//           <Text style={styles.sectionTitle}>Historique ({events.length})</Text>
//           {events.length === 0 ? (
//             <Text style={styles.empty}>Aucun événement.</Text>
//           ) : (
//             events.slice(0, 20).map((e, i) => (
//               <View key={i} style={styles.eventRow}>
//                 <View style={styles.eventDot} />
//                 <View style={{ flex: 1 }}>
//                   <Text style={styles.eventType}>{e.event_type || e.type}</Text>
//                   <Text style={styles.eventDate}>
//                     {new Date(e.created_at || e.date).toLocaleString('fr-FR')}
//                   </Text>
//                 </View>
//               </View>
//             ))
//           )}
//         </Card>

//         {chantier.notes ? (
//           <Card>
//             <Text style={styles.sectionTitle}>Notes</Text>
//             <Text style={styles.notes}>{chantier.notes}</Text>
//           </Card>
//         ) : null}
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// function Row({ label, value }) {
//   return (
//     <View style={styles.row}>
//       <Text style={styles.label}>{label}</Text>
//       <Text style={styles.value} numberOfLines={3}>
//         {value}
//       </Text>
//     </View>
//   );
// }

// function Stat({ label, value }) {
//   return (
//     <View style={styles.statBox}>
//       <Text style={styles.statValue}>{value}</Text>
//       <Text style={styles.statLabel}>{label}</Text>
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
//   progressBar: {
//     height: 10,
//     borderRadius: 5,
//     backgroundColor: colors.bgInput,
//     overflow: 'hidden',
//     marginBottom: spacing.sm,
//   },
//   progressFill: { height: '100%' },
//   progressText: {
//     color: colors.accent,
//     fontSize: fontSize.lg,
//     fontWeight: '800',
//     textAlign: 'center',
//     marginBottom: spacing.lg,
//   },
//   statsGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: spacing.sm,
//   },
//   statBox: {
//     flex: 1,
//     minWidth: '45%',
//     padding: spacing.md,
//     borderRadius: radius.md,
//     backgroundColor: colors.bg,
//     borderWidth: 1,
//     borderColor: colors.border,
//     alignItems: 'center',
//   },
//   statValue: {
//     color: colors.text,
//     fontSize: fontSize.md,
//     fontWeight: '700',
//     marginBottom: 2,
//   },
//   statLabel: {
//     color: colors.textMuted,
//     fontSize: 10,
//     textAlign: 'center',
//   },
//   rowItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: spacing.md,
//     borderBottomWidth: 1,
//     borderBottomColor: colors.border,
//     gap: spacing.md,
//   },
//   itemLeft: { flex: 1, minWidth: 0 },
//   itemTitle: {
//     color: colors.text,
//     fontSize: fontSize.sm,
//     fontWeight: '600',
//   },
//   itemSub: {
//     color: colors.textMuted,
//     fontSize: fontSize.xs,
//     marginTop: 2,
//   },
//   itemAmount: {
//     color: colors.accent,
//     fontSize: fontSize.sm,
//     fontWeight: '700',
//   },
//   eventRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: spacing.md,
//     paddingVertical: spacing.sm,
//   },
//   eventDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: colors.accent,
//   },
//   eventType: {
//     color: colors.text,
//     fontSize: fontSize.sm,
//     fontWeight: '500',
//   },
//   eventDate: {
//     color: colors.textMuted,
//     fontSize: fontSize.xs,
//     marginTop: 2,
//   },
//   notes: {
//     color: colors.textSecondary,
//     fontSize: fontSize.sm,
//     lineHeight: 20,
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
// });

import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  TouchableOpacity, RefreshControl, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { chantiersApi, chantierPhotosApi, chantierActionsApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';

const STATUS_LABELS = {
  planned: '📋 Planifié',
  in_progress: '🔨 En cours',
  paused: '⏸ En pause',
  completed: '✅ Terminé',
  cancelled: '❌ Annulé',
};

export default function ChantierDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [chantier, setChantier] = useState(null);
  const [stats, setStats] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [events, setEvents] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/chantiers');
  };

  const loadAll = async () => {
    try {
      setError('');
      const [c, s, q, i, e, ph] = await Promise.all([
        chantiersApi.get(id),
        chantiersApi.stats(id).catch(() => null),
        chantiersApi.quotes(id).catch(() => []),
        chantiersApi.invoices(id).catch(() => []),
        chantiersApi.events(id).catch(() => []),
        chantierPhotosApi.list(id).catch(() => []),
      ]);
      setChantier(c);
      setStats(s);
      setQuotes(Array.isArray(q) ? q : []);
      setInvoices(Array.isArray(i) ? i : []);
      setEvents(Array.isArray(e) ? e : []);
      setPhotos(Array.isArray(ph) ? ph : []);
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

  const detachQuote = (quoteId) => {
    Alert.alert('Détacher', 'Détacher ce devis du chantier ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Détacher', style: 'destructive',
        onPress: async () => {
          try {
            await chantierActionsApi.detachQuote(id, quoteId);
            await loadAll();
          } catch (err) {
            Alert.alert('Erreur', err.response?.data?.error || err.message);
          }
        },
      },
    ]);
  };

  const facturerTout = () => {
    Alert.alert(
      'Facturer tout',
      'Créer une facture avec tous les devis acceptés de ce chantier ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Créer la facture',
          onPress: async () => {
            try {
              const res = await chantierActionsApi.facturerTout(id);
              Alert.alert('Succès', `Facture ${res.invoice?.invoice_number || ''} créée`);
              await loadAll();
            } catch (err) {
              Alert.alert('Erreur', err.response?.data?.error || err.message);
            }
          },
        },
      ]
    );
  };

  const editChantier = () => {
    router.push(`/chantier/edit?id=${id}`);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Chantier" showBack />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>
      </SafeAreaView>
    );
  }

  if (error || !chantier) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Chantier" showBack />
        <View style={styles.center}>
          <Text style={styles.errorText}>⚠️ {error || 'Introuvable'}</Text>
          <Button title="Retour" onPress={handleBack} variant="secondary" />
        </View>
      </SafeAreaView>
    );
  }

  const progression = stats?.progression || 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title={chantier.name} showBack />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
            tintColor={colors.accent} colors={[colors.accent]} />
        }
      >
        <Card>
          <Text style={styles.sectionTitle}>Informations</Text>
          {chantier.reference ? <Row label="Référence" value={chantier.reference} /> : null}
          <Row label="Statut" value={STATUS_LABELS[chantier.status] || chantier.status} />
          {chantier.clientName ? <Row label="Client" value={chantier.clientName} /> : null}
          {chantier.clientAddress ? <Row label="Adresse" value={chantier.clientAddress} /> : null}
          {chantier.startDate ? <Row label="Début" value={fmtDate(chantier.startDate)} /> : null}
          {chantier.endDate ? <Row label="Fin prévue" value={fmtDate(chantier.endDate)} /> : null}
          {chantier.budgetEstimate ? <Row label="Budget" value={fmtMoney(chantier.budgetEstimate)} /> : null}
        </Card>

        {stats && (
          <Card>
            <Text style={styles.sectionTitle}>Progression</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, {
                width: `${Math.min(100, progression)}%`,
                backgroundColor: chantier.color || colors.accent,
              }]} />
            </View>
            <Text style={styles.progressText}>{progression}%</Text>

            <View style={styles.statsGrid}>
              <StatBox label="Devis" value={String(stats.quotes?.total || 0)} />
              <StatBox label="Acceptés" value={String(stats.quotes?.accepted || 0)} />
              <StatBox label="CA accepté" value={fmtMoney(stats.quotes?.acceptedValue)} />
              <StatBox label="Reste à facturer" value={fmtMoney(stats.remainingToInvoice)} />
            </View>
          </Card>
        )}

        <Card>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Devis ({quotes.length})</Text>
            <TouchableOpacity
              style={styles.sectionAction}
              onPress={() => router.push(`/chantier/attach?id=${id}`)}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionActionText}>+ Attacher</Text>
            </TouchableOpacity>
          </View>
          {quotes.length === 0 ? (
            <Text style={styles.empty}>Aucun devis attaché.</Text>
          ) : (
            quotes.map((q) => (
              <TouchableOpacity key={q.id}
                onPress={() => router.push(`/quote/${q.id}`)}
                onLongPress={() => detachQuote(q.id)}
                activeOpacity={0.7}
                style={styles.rowItem}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.itemTitle}>{q.number || q.quoteNumber}</Text>
                  <Text style={styles.itemSub}>{q.client || q.clientName || '—'}</Text>
                </View>
                <Text style={styles.itemAmount}>{fmtMoney(q.total)}</Text>
              </TouchableOpacity>
            ))
          )}
          {quotes.length > 0 && (
            <Text style={styles.hint}>Appui long sur un devis pour le détacher.</Text>
          )}
        </Card>

        <Card>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Factures ({invoices.length})</Text>
            {stats?.remainingToInvoice > 0 && stats?.quotes?.accepted > 0 && (
              <TouchableOpacity
                style={[styles.sectionAction, { backgroundColor: 'rgba(34,197,94,0.15)', borderColor: 'rgba(34,197,94,0.4)' }]}
                onPress={facturerTout}
                activeOpacity={0.7}
              >
                <Text style={[styles.sectionActionText, { color: colors.success }]}>
                  💰 Facturer tout
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {invoices.length === 0 ? (
            <Text style={styles.empty}>Aucune facture.</Text>
          ) : (
            invoices.map((inv) => (
              <TouchableOpacity key={inv.id}
                onPress={() => router.push(`/invoice/${inv.id}`)}
                activeOpacity={0.7}
                style={styles.rowItem}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.itemTitle}>{inv.number || inv.invoiceNumber}</Text>
                  <Text style={styles.itemSub}>{fmtDate(inv.issueDate)}</Text>
                </View>
                <Text style={styles.itemAmount}>{fmtMoney(inv.total)}</Text>
              </TouchableOpacity>
            ))
          )}
        </Card>

        <Card>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Photos ({photos.length})</Text>
            <TouchableOpacity
              style={styles.sectionAction}
              onPress={() => router.push(`/chantier/photos?id=${id}`)}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionActionText}>+ Ajouter</Text>
            </TouchableOpacity>
          </View>
          {photos.length === 0 ? (
            <Text style={styles.empty}>Aucune photo.</Text>
          ) : (
            <View style={styles.photosGrid}>
              {photos.slice(0, 6).map((p) => (
                <TouchableOpacity key={p.id}
                  onPress={() => router.push(`/chantier/photos?id=${id}`)}
                  activeOpacity={0.7}
                  style={styles.photoCell}>
                  <Image source={{ uri: p.url }} style={styles.photoImage} resizeMode="cover" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Historique ({events.length})</Text>
          {events.length === 0 ? (
            <Text style={styles.empty}>Aucun événement.</Text>
          ) : (
            events.slice(0, 20).map((e, i) => (
              <View key={i} style={styles.eventRow}>
                <View style={styles.eventDot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.eventType}>{e.event_type || e.type}</Text>
                  <Text style={styles.eventDate}>
                    {new Date(e.created_at || e.date).toLocaleString('fr-FR')}
                  </Text>
                </View>
              </View>
            ))
          )}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Actions</Text>
          <TouchableOpacity style={styles.actionRow} onPress={editChantier} activeOpacity={0.7}>
            <Text style={styles.actionLabel}>✏️ Modifier</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionRow}
            onPress={() => router.push(`/chantier/photos?id=${id}`)} activeOpacity={0.7}>
            <Text style={styles.actionLabel}>📷 Gérer les photos</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </Card>
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

function StatBox({ label, value }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700' },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: spacing.md,
  },
  sectionAction: {
    backgroundColor: colors.accent, paddingHorizontal: spacing.md,
    paddingVertical: 5, borderRadius: radius.full,
  },
  sectionActionText: { color: '#0b1120', fontSize: 11, fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, gap: spacing.md },
  label: { color: colors.textSecondary, fontSize: fontSize.sm },
  value: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500', flexShrink: 1, textAlign: 'right' },
  progressBar: { height: 10, borderRadius: 5, backgroundColor: colors.bgInput, overflow: 'hidden', marginBottom: spacing.sm },
  progressFill: { height: '100%' },
  progressText: { color: colors.accent, fontSize: fontSize.lg, fontWeight: '800', textAlign: 'center', marginBottom: spacing.lg },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statBox: {
    flex: 1, minWidth: '45%', padding: spacing.md,
    borderRadius: radius.md, backgroundColor: colors.bg,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center',
  },
  statValue: { color: colors.text, fontSize: fontSize.md, fontWeight: '700', marginBottom: 2 },
  statLabel: { color: colors.textMuted, fontSize: 10, textAlign: 'center' },
  rowItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.md,
  },
  itemTitle: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600' },
  itemSub: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },
  itemAmount: { color: colors.accent, fontSize: fontSize.sm, fontWeight: '700' },
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  eventDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
  eventType: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500' },
  eventDate: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },
  photosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  photoCell: {
    width: '31%', aspectRatio: 1, borderRadius: radius.md,
    overflow: 'hidden', backgroundColor: colors.bgCard,
    borderWidth: 1, borderColor: colors.border,
  },
  photoImage: { width: '100%', height: '100%' },
  empty: { color: colors.textMuted, fontSize: fontSize.sm, fontStyle: 'italic', textAlign: 'center', paddingVertical: spacing.lg },
  hint: { color: colors.textMuted, fontSize: 10, fontStyle: 'italic', marginTop: spacing.sm },
  actionRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: colors.border,
  },
  actionLabel: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500' },
  actionArrow: { color: colors.textMuted, fontSize: 20, fontWeight: '300' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorText: { color: colors.error, fontSize: fontSize.md, textAlign: 'center', marginBottom: spacing.lg },
});