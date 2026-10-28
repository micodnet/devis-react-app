// import { useState, useEffect } from 'react';
// import {
//   View, Text, StyleSheet, ScrollView, FlatList,
//   TouchableOpacity, ActivityIndicator, RefreshControl,
//   TextInput, KeyboardAvoidingView, Platform, Alert, Linking,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useLocalSearchParams, useRouter, useFocusEffect  } from 'expo-router';
// import { quotesApi } from '../../lib/api';
// import { colors, spacing, fontSize, radius } from '../../lib/theme';
// import StatusBadge from '../../components/StatusBadge';
// import Card from '../../components/Card';
// import Button from '../../components/Button';

// export default function QuoteDetailScreen() {
//   const { id } = useLocalSearchParams();
//   const router = useRouter();
//   const handleBack = () => {
//     if (router.canGoBack()) {
//       router.back();
//     } else {
//       router.replace('/(app)/devis');
//     }
//   };
//   const [quote, setQuote] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     loadQuote();
//   }, [id]);

//   const loadQuote = async () => {
//     try {
//       setError('');
//       const data = await quotesApi.get(id);
//       setQuote(data);
//     } catch (err) {
//       setError(err.response?.data?.error || err.message || 'Erreur de chargement');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fmt = (n) =>
//     new Intl.NumberFormat('fr-FR', {
//       style: 'currency',
//       currency: quote?.currency || 'EUR',
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

//   if (error || !quote) {
//     return (
//       <SafeAreaView style={styles.safe} edges={['top']}>
//         <View style={styles.header}>
//           <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
//             <Text style={styles.backText}>←</Text>
//           </TouchableOpacity>
//           <Text style={styles.title}>Erreur</Text>
//         </View>
//         <View style={styles.center}>
//           <Text style={styles.errorText}>⚠️ {error || 'Devis introuvable'}</Text>
//           <Button title="Réessayer" onPress={loadQuote} variant="secondary" />
//         </View>
//       </SafeAreaView>
//     );
//   }

//   const items = Array.isArray(quote.items) ? quote.items : [];

//   const handleDuplicate = () => {
//     Alert.alert(
//       'Dupliquer',
//       'Créer une copie de ce devis ?',
//       [
//         { text: 'Annuler', style: 'cancel' },
//         {
//           text: 'Dupliquer',
//           onPress: async () => {
//             try {
//               const res = await quotesApi.duplicate(id);
//               Alert.alert('Succès', `Devis ${res.quoteNumber} créé`);
//               router.replace(`/quote/${res.id}`);
//             } catch (err) {
//               Alert.alert('Erreur', err.response?.data?.error || err.message);
//             }
//           },
//         },
//       ]
//     );
//   };

//   const handleChangeStatus = () => {
//     const statuses = [
//       { label: 'Brouillon', value: 'draft' },
//       { label: 'Envoyé', value: 'sent' },
//       { label: 'Accepté', value: 'accepted' },
//       { label: 'Refusé', value: 'refused' },
//     ];
//     Alert.alert(
//       'Changer le statut',
//       'Sélectionnez un nouveau statut',
//       [
//         ...statuses.map((s) => ({
//           text: s.label,
//           onPress: async () => {
//             try {
//               await quotesApi.setStatus(id, s.value);
//               await loadQuote();
//             } catch (err) {
//               Alert.alert('Erreur', err.response?.data?.error || err.message);
//             }
//           },
//         })),
//         { text: 'Annuler', style: 'cancel' },
//       ]
//     );
//   };

//   const handleSendToClient = () => {
//     Alert.alert(
//       'Envoyer au client',
//       `Envoyer le devis ${quote.quoteNumber} par email ?`,
//       [
//         { text: 'Annuler', style: 'cancel' },
//         {
//           text: 'Envoyer',
//           onPress: async () => {
//             try {
//               const res = await quotesApi.sendToClient(id);
//               Alert.alert('Succès', `Email envoyé${res.publicUrl ? '\n\nLien : ' + res.publicUrl : ''}`);
//               await loadQuote();
//             } catch (err) {
//               Alert.alert('Erreur', err.response?.data?.error || err.message);
//             }
//           },
//         },
//       ]
//     );
//   };

//   const handleMarkSigned = () => {
//     Alert.prompt
//       ? Alert.prompt(
//           'Marquer signé',
//           'Nom du signataire :',
//           async (signedBy) => {
//             if (!signedBy?.trim()) return;
//             try {
//               await quotesApi.sign(id, {
//                 method: 'checkbox',
//                 signedBy: signedBy.trim(),
//                 accepted: true,
//               });
//               await loadQuote();
//             } catch (err) {
//               Alert.alert('Erreur', err.response?.data?.error || err.message);
//             }
//           }
//         )
//       : handleSendToClient();
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
//               await quotesApi.remove(id);
//               router.replace('/(app)/devis');
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
//       {/* Header custom avec back */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
//           <Text style={styles.backText}>←</Text>
//         </TouchableOpacity>
//         <Text style={styles.title} numberOfLines={1}>
//           {quote.quoteNumber}
//         </Text>
//         <View style={styles.headerRight}>
//           <StatusBadge status={quote.status} />
//         </View>
//       </View>

//       <ScrollView contentContainerStyle={styles.scroll}>
//         {/* Infos générales */}
//         <Card>
//           <Text style={styles.sectionTitle}>Informations</Text>
//           <View style={styles.row}>
//             <Text style={styles.label}>Client</Text>
//             <Text style={styles.value}>{quote.clientName || '—'}</Text>
//           </View>
//           {quote.clientEmail ? (
//             <View style={styles.row}>
//               <Text style={styles.label}>Email</Text>
//               <Text style={styles.value} numberOfLines={1}>
//                 {quote.clientEmail}
//               </Text>
//             </View>
//           ) : null}
//           <View style={styles.row}>
//             <Text style={styles.label}>Émis le</Text>
//             <Text style={styles.value}>{fmtDate(quote.issueDate)}</Text>
//           </View>
//           <View style={styles.row}>
//             <Text style={styles.label}>Valable jusqu'au</Text>
//             <Text style={styles.value}>{fmtDate(quote.validDate)}</Text>
//           </View>
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
//                     {item.qty} × {fmt(item.unitPrice)}
//                   </Text>
//                   <Text style={styles.itemTotal}>{fmt(item.total)}</Text>
//                 </View>
//               </View>
//             ))
//           )}
//         </Card>

//         {/* Totaux */}
//         <Card>
//           <Text style={styles.sectionTitle}>Totaux</Text>
//           <View style={styles.row}>
//             <Text style={styles.label}>Sous-total HT</Text>
//             <Text style={styles.value}>{fmt(quote.subtotal)}</Text>
//           </View>
//           {quote.vatRegime === 'assujetti' ? (
//             <View style={styles.row}>
//               <Text style={styles.label}>TVA</Text>
//               <Text style={styles.value}>{fmt(quote.vatAmount)}</Text>
//             </View>
//           ) : (
//             <View style={styles.row}>
//               <Text style={styles.label}>TVA</Text>
//               <Text style={styles.valueMuted}>Franchise</Text>
//             </View>
//           )}
//           <View style={[styles.row, styles.totalRow]}>
//             <Text style={styles.totalLabel}>TOTAL</Text>
//             <Text style={styles.totalValue}>{fmt(quote.total)}</Text>
//           </View>
//         </Card>

//                 {/* Actions */}
//         <Card>
//           <Text style={styles.sectionTitle}>Actions</Text>

//           <TouchableOpacity
//             style={styles.actionRow}
//             onPress={handleDuplicate}
//             activeOpacity={0.7}
//           >
//             <Text style={styles.actionLabel}>📋 Dupliquer</Text>
//             <Text style={styles.actionArrow}>›</Text>
//           </TouchableOpacity>

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
//             onPress={handleSendToClient}
//             activeOpacity={0.7}
//           >
//             <Text style={styles.actionLabel}>📤 Envoyer au client</Text>
//             <Text style={styles.actionArrow}>›</Text>
//           </TouchableOpacity>

//           {!quote.signature?.signedAt && (
//             <TouchableOpacity
//               style={styles.actionRow}
//               onPress={handleMarkSigned}
//               activeOpacity={0.7}
//             >
//               <Text style={styles.actionLabel}>✍️ Marquer comme signé</Text>
//               <Text style={styles.actionArrow}>›</Text>
//             </TouchableOpacity>
//           )}

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

//         {/* Signature */}
//         {quote.signature?.signedAt && (
//           <Card>
//             <Text style={styles.sectionTitle}>Signature</Text>
//             <View style={styles.row}>
//               <Text style={styles.label}>Signé par</Text>
//               <Text style={styles.value}>{quote.signature.signedBy || '—'}</Text>
//             </View>
//             <View style={styles.row}>
//               <Text style={styles.label}>Le</Text>
//               <Text style={styles.value}>{fmtDate(quote.signature.signedAt)}</Text>
//             </View>
//           </Card>
//         )}
//       </ScrollView>
//     </SafeAreaView>
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
//   backBtn: {
//     width: 36,
//     height: 36,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   backText: {
//     color: colors.text,
//     fontSize: 24,
//     fontWeight: '600',
//   },
//   title: {
//     flex: 1,
//     color: colors.text,
//     fontSize: fontSize.lg,
//     fontWeight: '700',
//   },
//   headerRight: { marginLeft: 'auto' },
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
//   label: {
//     color: colors.textSecondary,
//     fontSize: fontSize.sm,
//   },
//   value: {
//     color: colors.text,
//     fontSize: fontSize.sm,
//     fontWeight: '500',
//     flexShrink: 1,
//     textAlign: 'right',
//   },
//   valueMuted: {
//     color: colors.textMuted,
//     fontSize: fontSize.sm,
//     fontStyle: 'italic',
//   },
//   itemRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingVertical: spacing.md,
//     borderBottomWidth: 1,
//     borderBottomColor: colors.border,
//     gap: spacing.md,
//   },
//   itemLeft: { flex: 1 },
//   itemRight: { alignItems: 'flex-end' },
//   itemName: {
//     color: colors.text,
//     fontSize: fontSize.sm,
//     fontWeight: '500',
//   },
//   itemRef: {
//     color: colors.textMuted,
//     fontSize: fontSize.xs,
//     marginTop: 2,
//   },
//   itemQty: {
//     color: colors.textSecondary,
//     fontSize: fontSize.xs,
//   },
//   itemTotal: {
//     color: colors.accent,
//     fontSize: fontSize.sm,
//     fontWeight: '700',
//     marginTop: 2,
//   },
//   totalRow: {
//     borderTopWidth: 2,
//     borderTopColor: colors.accent,
//     marginTop: spacing.md,
//     paddingTop: spacing.md,
//   },
//   totalLabel: {
//     color: colors.text,
//     fontSize: fontSize.md,
//     fontWeight: '800',
//   },
//   totalValue: {
//     color: colors.accent,
//     fontSize: fontSize.xl,
//     fontWeight: '800',
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

import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  TouchableOpacity, Alert, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { quotesApi, templatesApi, signatureApi, API_URL } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import StatusBadge from '../../components/StatusBadge';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function QuoteDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadQuote = async () => {
    try {
      setError('');
      const data = await quotesApi.get(id);
      setQuote(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadQuote(); }, [id]);

  const fmt = (n) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency', currency: quote?.currency || 'EUR', minimumFractionDigits: 2,
    }).format(n || 0);

  const fmtDate = (d) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('fr-FR'); } catch { return d; }
  };

  const handleDuplicate = () => {
    Alert.alert('Dupliquer', 'Créer une copie de ce devis ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Dupliquer',
        onPress: async () => {
          try {
            const res = await quotesApi.duplicate(id);
            Alert.alert('Succès', `Devis ${res.quoteNumber} créé`);
            router.replace(`/quote/${res.id}`);
          } catch (err) { Alert.alert('Erreur', err.response?.data?.error || err.message); }
        },
      },
    ]);
  };

  const handleChangeStatus = () => {
    const statuses = [
      { label: 'Brouillon', value: 'draft' },
      { label: 'Envoyé', value: 'sent' },
      { label: 'Accepté', value: 'accepted' },
      { label: 'Refusé', value: 'refused' },
    ];
    Alert.alert('Changer le statut', 'Sélectionnez un nouveau statut', [
      ...statuses.map((s) => ({
        text: s.label,
        onPress: async () => {
          try {
            await quotesApi.setStatus(id, s.value);
            await loadQuote();
          } catch (err) { Alert.alert('Erreur', err.response?.data?.error || err.message); }
        },
      })),
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  const handleSendToClient = () => {
    if (!quote) return;
    Alert.prompt
      ? Alert.prompt(
          'Envoyer au client',
          'Email du client :',
          async (email) => {
            if (!email?.trim()) return;
            try {
              const res = await quotesApi.sendToClient(id, email.trim());
              Alert.alert('Succès', `Email envoyé${res.publicUrl ? '\n\nLien : ' + res.publicUrl : ''}`);
              await loadQuote();
            } catch (err) { Alert.alert('Erreur', err.response?.data?.error || err.message); }
          },
          'plain-text',
          quote.clientEmail || ''
        )
      : (async () => {
          try {
            const res = await quotesApi.sendToClient(id, quote.clientEmail);
            Alert.alert('Succès', `Email envoyé${res.publicUrl ? '\n\nLien : ' + res.publicUrl : ''}`);
            await loadQuote();
          } catch (err) { Alert.alert('Erreur', err.response?.data?.error || err.message); }
        })();
  };

  const handleDelete = () => {
    Alert.alert('Supprimer', 'Cette action est irréversible. Confirmer ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await quotesApi.remove(id);
            router.replace('/(app)/devis');
          } catch (err) { Alert.alert('Erreur', err.response?.data?.error || err.message); }
        },
      },
    ]);
  };

  const handleSaveAsTemplate = () => {
    Alert.prompt
      ? Alert.prompt(
          'Sauvegarder comme modèle',
          'Nom du modèle :',
          async (name) => {
            if (!name?.trim()) return;
            try {
              await templatesApi.fromQuote(id, { name: name.trim() });
              Alert.alert('Succès', 'Modèle créé');
            } catch (err) { Alert.alert('Erreur', err.response?.data?.error || err.message); }
          }
        )
      : null;
  };

  const handleDownloadPdf = async () => {
    try {
      const url = `${API_URL}/api/quotes/${id}`;
      const res = await fetch(url, {
        headers: {
          Authorization: 'Bearer ' + (await require('../../lib/api').storage.getItem('devis_token')),
        },
      });
      const data = await res.json();
      const pdfUrl = `${API_URL}/api/public/quotes/${data.publicToken}/pdf`;
      if (data.publicToken) {
        await Linking.openURL(pdfUrl);
      } else {
        Alert.alert('Info', 'Générez le PDF depuis l\'app web.');
      }
    } catch (err) {
      Alert.alert('Erreur', err.message);
    }
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

  if (error || !quote) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Erreur</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.errorText}>⚠️ {error || 'Devis introuvable'}</Text>
          <Button title="Réessayer" onPress={loadQuote} variant="secondary" />
        </View>
      </SafeAreaView>
    );
  }

  const items = Array.isArray(quote.items) ? quote.items : [];
  const variants = Array.isArray(quote.variants) ? quote.variants : [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{quote.quoteNumber}</Text>
        <StatusBadge status={quote.status} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Card>
          <Text style={styles.sectionTitle}>Informations</Text>
          <Row label="Client" value={quote.clientName || '—'} />
          {quote.clientEmail ? <Row label="Email" value={quote.clientEmail} /> : null}
          <Row label="Émis le" value={fmtDate(quote.issueDate)} />
          <Row label="Valable jusqu'au" value={fmtDate(quote.validDate)} />
          {quote.isMultiOption ? <Row label="Multi-options" value="Oui" /> : null}
        </Card>

        {/* Variantes */}
        {quote.isMultiOption && variants.length > 0 && (
          <Card>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Variantes ({variants.length})</Text>
            <TouchableOpacity style={styles.actionRow}
              onPress={() => router.push(`/quote/photos?id=${id}`)} activeOpacity={0.7}>
              <Text style={styles.actionLabel}>📷 Photos du devis</Text>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionRow}
              onPress={() => router.push(`/quote/photos?id=${id}`)} activeOpacity={0.7}>
              <Text style={styles.actionLabel}>📷 Photos du devis</Text>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionRow}
              onPress={() => router.push(`/quote/convert?id=${id}`)} activeOpacity={0.7}>
              <Text style={styles.actionLabel}>💱 Convertir en autre devise</Text>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>
            </View>
            {variants.map((v, i) => (
              <View
                key={i}
                style={[
                  styles.variantRow,
                  quote.selectedVariantIndex === i && styles.variantRowSelected,
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.variantName}>
                    {v.name}
                    {v.recommended ? ' ⭐' : ''}
                  </Text>
                  {v.description ? (
                    <Text style={styles.variantDesc} numberOfLines={1}>{v.description}</Text>
                  ) : null}
                </View>
                <Text style={styles.variantTotal}>
                  {fmt((v.items || []).reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0), 0))}
                </Text>
              </View>
            ))}
          </Card>
        )}

        {/* Articles */}
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

        {/* Totaux */}
        <Card>
          <Text style={styles.sectionTitle}>Totaux</Text>
          <Row label="Sous-total HT" value={fmt(quote.subtotal)} />
          {quote.vatRegime === 'assujetti' ? (
            <Row label="TVA" value={fmt(quote.vatAmount)} />
          ) : (
            <Row label="TVA" value="Franchise" muted />
          )}
          <View style={[styles.row, styles.totalRow]}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalValue}>{fmt(quote.total)}</Text>
          </View>
        </Card>

        {/* Signature */}
        <Card>
          <Text style={styles.sectionTitle}>Signature</Text>
          {quote.signature?.signedAt ? (
            <>
              <Row label="Signé par" value={quote.signature.signedBy || '—'} />
              <Row label="Le" value={fmtDate(quote.signature.signedAt)} />
              <Row label="Méthode" value={quote.signature.method === 'draw' ? 'Dessinée' : 'Case à cocher'} />
              <View style={{ height: spacing.md }} />
              <TouchableOpacity
                style={styles.sectionActionFull}
                onPress={() => router.push(`/quote/certificate?id=${id}`)}
                activeOpacity={0.7}
              >
                <Text style={styles.sectionActionFullText}>📜 Voir le certificat</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.empty}>Pas encore signé.</Text>
              <View style={{ height: spacing.md }} />
              <TouchableOpacity
                style={styles.sectionActionFull}
                onPress={() => router.push(`/quote/sign?id=${id}`)}
                activeOpacity={0.7}
              >
                <Text style={styles.sectionActionFullText}>✍️ Marquer comme signé</Text>
              </TouchableOpacity>
            </>
          )}
        </Card>

        {/* Actions */}
        <Card>
          <Text style={styles.sectionTitle}>Actions</Text>

          <TouchableOpacity style={styles.actionRow} onPress={handleDuplicate} activeOpacity={0.7}>
            <Text style={styles.actionLabel}>📋 Dupliquer</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow} onPress={handleChangeStatus} activeOpacity={0.7}>
            <Text style={styles.actionLabel}>🔄 Changer le statut</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow} onPress={handleSendToClient} activeOpacity={0.7}>
            <Text style={styles.actionLabel}>📤 Envoyer au client</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow}
            onPress={() => router.push(`/quote/variants?id=${id}`)} activeOpacity={0.7}>
            <Text style={styles.actionLabel}>🔀 Gérer les variantes</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow} onPress={handleSaveAsTemplate} activeOpacity={0.7}>
            <Text style={styles.actionLabel}>📄 Sauvegarder comme modèle</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow} onPress={handleDownloadPdf} activeOpacity={0.7}>
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
  sectionTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700' },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: spacing.md,
  },
  sectionAction: {
    backgroundColor: colors.bgInput, paddingHorizontal: spacing.md,
    paddingVertical: 5, borderRadius: radius.full, borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sectionActionText: { color: colors.textSecondary, fontSize: 11, fontWeight: '700' },
  sectionActionFull: {
    paddingVertical: 12, borderRadius: radius.full,
    backgroundColor: colors.bgInput, borderWidth: 1,
    borderColor: colors.borderLight, alignItems: 'center',
  },
  sectionActionFullText: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600' },
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
  variantRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: spacing.md,
    paddingHorizontal: spacing.md, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    marginBottom: spacing.sm, gap: spacing.md,
  },
  variantRowSelected: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(249,115,22,0.08)',
  },
  variantName: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600' },
  variantDesc: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },
  variantTotal: { color: colors.accent, fontSize: fontSize.sm, fontWeight: '700' },
  empty: { color: colors.textMuted, fontSize: fontSize.sm, fontStyle: 'italic', textAlign: 'center', paddingVertical: spacing.md },
  actionRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: colors.border,
  },
  actionLabel: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500' },
  actionArrow: { color: colors.textMuted, fontSize: 20, fontWeight: '300' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorText: { color: colors.error, fontSize: fontSize.md, textAlign: 'center', marginBottom: spacing.lg },
});