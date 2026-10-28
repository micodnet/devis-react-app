// import { useState, useEffect, useCallback } from 'react';
// import {
//   View, Text, StyleSheet, ScrollView, FlatList,
//   TouchableOpacity, ActivityIndicator, RefreshControl,
//   TextInput, KeyboardAvoidingView, Platform, Alert, Linking,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
// import { clientsApi, quotesApi } from '../../lib/api';
// import { colors, spacing, fontSize } from '../../lib/theme';
// import Card from '../../components/Card';
// import QuoteCard from '../../components/QuoteCard';
// import Button from '../../components/Button';

// export default function ClientDetailScreen() {
//   const { id } = useLocalSearchParams();
//   const router = useRouter();
//   const handleBack = () => {
//     if (router.canGoBack()) {
//       router.back();
//     } else {
//       router.replace('/(app)/clients');
//     }
//   };
//   const [client, setClient] = useState(null);
//   const [quotes, setQuotes] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState('');

//   const loadAll = async () => {
//     try {
//       setError('');
//       const [clientData, quotesData] = await Promise.all([
//         clientsApi.get(id),
//         quotesApi.list(),
//       ]);
//       setClient(clientData);
//       const clientQuotes = (quotesData || []).filter(
//         (q) => q.clientId === Number(id) || q.clientName === clientData.name
//       );
//       setQuotes(clientQuotes);
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

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.safe} edges={['top']}>
//         <View style={styles.center}>
//           <ActivityIndicator size="large" color={colors.accent} />
//         </View>
//       </SafeAreaView>
//     );
//   }

//   if (error || !client) {
//     return (
//       <SafeAreaView style={styles.safe} edges={['top']}>
//         <View style={styles.header}>
//           <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
//             <Text style={styles.backText}>←</Text>
//           </TouchableOpacity>
//           <Text style={styles.title}>Erreur</Text>
//         </View>
//         <View style={styles.center}>
//           <Text style={styles.errorText}>⚠️ {error || 'Client introuvable'}</Text>
//           <Button title="Retour" onPress={handleBack} variant="secondary" />
//         </View>
//       </SafeAreaView>
//     );
//   }

//   const totalQuotes = quotes.reduce((s, q) => s + (Number(q.total) || 0), 0);
//   const accepted = quotes.filter((q) => q.status === 'accepted');
//   const totalAccepted = accepted.reduce((s, q) => s + (Number(q.total) || 0), 0);

//   const fmtMoney = (n) =>
//     new Intl.NumberFormat('fr-FR', {
//       style: 'currency',
//       currency: 'EUR',
//       minimumFractionDigits: 2,
//     }).format(n || 0);

//   return (
//     <SafeAreaView style={styles.safe} edges={['top']}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
//           <Text style={styles.backText}>←</Text>
//         </TouchableOpacity>
//         <Text style={styles.title} numberOfLines={1}>
//           {client.name}
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
//         {/* Coordonnées */}
//         <Card>
//           <Text style={styles.sectionTitle}>Coordonnées</Text>
//           {client.contactName ? (
//             <Row label="Contact" value={client.contactName} />
//           ) : null}
//           {client.email ? <Row label="Email" value={client.email} /> : null}
//           {client.phone ? <Row label="Téléphone" value={client.phone} /> : null}
//           {client.address ? <Row label="Adresse" value={client.address} /> : null}
//           {client.vatNumber ? <Row label="N° TVA" value={client.vatNumber} /> : null}
//           {!client.email && !client.phone && !client.address ? (
//             <Text style={styles.empty}>Aucune coordonnée enregistrée.</Text>
//           ) : null}
//         </Card>

//         {/* Stats */}
//         <Card>
//           <Text style={styles.sectionTitle}>Statistiques</Text>
//           <Row label="Nombre de devis" value={String(quotes.length)} />
//           <Row label="Total HT" value={fmtMoney(totalQuotes)} />
//           <Row
//             label="Acceptés"
//             value={`${accepted.length} (${fmtMoney(totalAccepted)})`}
//           />
//         </Card>

//         {/* Devis du client */}
//         <Text style={styles.sectionTitleOutside}>
//           Devis ({quotes.length})
//         </Text>
//         {quotes.length === 0 ? (
//           <Card>
//             <Text style={styles.empty}>Aucun devis pour ce client.</Text>
//           </Card>
//         ) : (
//           quotes.map((q) => <QuoteCard key={q.id} quote={q} />)
//         )}
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// function Row({ label, value }) {
//   return (
//     <View style={styles.row}>
//       <Text style={styles.label}>{label}</Text>
//       <Text style={styles.value} numberOfLines={2}>
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
//   backBtn: {
//     width: 36,
//     height: 36,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   backText: { color: colors.text, fontSize: 24, fontWeight: '600' },
//   title: {
//     flex: 1,
//     color: colors.text,
//     fontSize: fontSize.lg,
//     fontWeight: '700',
//   },
//   scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
//   sectionTitle: {
//     color: colors.text,
//     fontSize: fontSize.md,
//     fontWeight: '700',
//     marginBottom: spacing.md,
//   },
//   sectionTitleOutside: {
//     color: colors.text,
//     fontSize: fontSize.md,
//     fontWeight: '700',
//     marginBottom: spacing.md,
//     marginTop: spacing.sm,
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

import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  TouchableOpacity, RefreshControl, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { clientsApi, quotesApi, clientPortalApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import QuoteCard from '../../components/QuoteCard';
import Button from '../../components/Button';

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [client, setClient] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/clients');
  };

  const loadAll = async () => {
    try {
      setError('');
      const [clientData, quotesData] = await Promise.all([
        clientsApi.get(id),
        quotesApi.list(),
      ]);
      setClient(clientData);
      const clientQuotes = (quotesData || []).filter(
        (q) => q.clientId === Number(id) || q.clientName === clientData.name
      );
      setQuotes(clientQuotes);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { loadAll(); }, [id]));

  const onRefresh = () => { setRefreshing(true); loadAll(); };

  const fmtMoney = (n) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency', currency: 'EUR', minimumFractionDigits: 2,
    }).format(n || 0);

  const handleEdit = () => {
    router.push(`/client/edit?id=${id}`);
  };

  const handleInvite = () => {
    Alert.prompt
      ? Alert.prompt(
          'Inviter au portail',
          `Email pour ${client.name} :`,
          async (email) => {
            try {
              await clientPortalApi.invite(id, email?.trim() || null);
              Alert.alert('Succès', 'Invitation envoyée');
            } catch (err) { Alert.alert('Erreur', err.response?.data?.error || err.message); }
          },
          'plain-text',
          client.email || ''
        )
      : (async () => {
          try {
            await clientPortalApi.invite(id, client.email);
            Alert.alert('Succès', 'Invitation envoyée');
          } catch (err) { Alert.alert('Erreur', err.response?.data?.error || err.message); }
        })();
  };

  const handleDelete = () => {
    Alert.alert('Supprimer', `Supprimer ${client.name} ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          try {
            await clientsApi.remove(id);
            router.replace('/(app)/clients');
          } catch (err) { Alert.alert('Erreur', err.response?.data?.error || err.message); }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Client" showBack />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>
      </SafeAreaView>
    );
  }

  if (error || !client) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Client" showBack />
        <View style={styles.center}>
          <Text style={styles.errorText}>⚠️ {error || 'Client introuvable'}</Text>
          <Button title="Retour" onPress={handleBack} variant="secondary" />
        </View>
      </SafeAreaView>
    );
  }

  const totalQuotes = quotes.reduce((s, q) => s + (Number(q.total) || 0), 0);
  const accepted = quotes.filter((q) => q.status === 'accepted');
  const totalAccepted = accepted.reduce((s, q) => s + (Number(q.total) || 0), 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title={client.name} showBack />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
            tintColor={colors.accent} colors={[colors.accent]} />
        }
      >
        <Card>
          <Text style={styles.sectionTitle}>Coordonnées</Text>
          {client.contactName ? <Row label="Contact" value={client.contactName} /> : null}
          {client.email ? <Row label="Email" value={client.email} /> : null}
          {client.phone ? <Row label="Téléphone" value={client.phone} /> : null}
          {client.address ? <Row label="Adresse" value={client.address} /> : null}
          {client.vatNumber ? <Row label="N° TVA" value={client.vatNumber} /> : null}
          {!client.email && !client.phone && !client.address ? (
            <Text style={styles.empty}>Aucune coordonnée.</Text>
          ) : null}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Statistiques</Text>
          <Row label="Nombre de devis" value={String(quotes.length)} />
          <Row label="Total HT" value={fmtMoney(totalQuotes)} />
          <Row label="Acceptés" value={`${accepted.length} (${fmtMoney(totalAccepted)})`} />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Actions</Text>
          <TouchableOpacity style={styles.actionRow} onPress={handleEdit} activeOpacity={0.7}>
            <Text style={styles.actionLabel}>✏️ Modifier</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionRow} onPress={handleInvite} activeOpacity={0.7}>
            <Text style={styles.actionLabel}>✉️ Inviter au portail client</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionRow} onPress={handleDelete} activeOpacity={0.7}>
            <Text style={[styles.actionLabel, { color: colors.error }]}>🗑 Supprimer</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </Card>

        <Text style={styles.sectionTitleOutside}>Devis ({quotes.length})</Text>
        {quotes.length === 0 ? (
          <Card><Text style={styles.empty}>Aucun devis pour ce client.</Text></Card>
        ) : (
          quotes.map((q) => <QuoteCard key={q.id} quote={q} />)
        )}
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorText: { color: colors.error, fontSize: fontSize.md, textAlign: 'center', marginBottom: spacing.lg },
});