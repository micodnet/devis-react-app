// // import { useState, useCallback, useMemo } from 'react';
// // import {
// //   View, Text, StyleSheet, ScrollView, FlatList,
// //   TouchableOpacity, ActivityIndicator, RefreshControl,
// //   TextInput, KeyboardAvoidingView, Platform, Alert, Linking,
// // } from 'react-native';
// // import { SafeAreaView } from 'react-native-safe-area-context';
// // import { useFocusEffect, useRouter } from 'expo-router';
// // import { servicesApi } from '../../lib/api';
// // import { colors, spacing, fontSize, radius } from '../../lib/theme';
// // import Header from '../../components/Header';
// // import SearchBar from '../../components/SearchBar';
// // import ListItem from '../../components/ListItem';
// // import EmptyState from '../../components/EmptyState';
// // import Button from '../../components/Button';

// // export default function ServicesScreen() {
// //   const router = useRouter();
// //   const [services, setServices] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [refreshing, setRefreshing] = useState(false);
// //   const [error, setError] = useState('');
// //   const [search, setSearch] = useState('');

// //   const loadServices = async () => {
// //     try {
// //       setError('');
// //       const data = await servicesApi.list();
// //       setServices(Array.isArray(data) ? data : []);
// //     } catch (err) {
// //       setError(err.response?.data?.error || err.message || 'Erreur de chargement');
// //     } finally {
// //       setLoading(false);
// //       setRefreshing(false);
// //     }
// //   };

// //   useFocusEffect(
// //     useCallback(() => {
// //       loadServices();
// //     }, [])
// //   );

// //   const onRefresh = () => {
// //     setRefreshing(true);
// //     loadServices();
// //   };

// //   const filtered = useMemo(() => {
// //     const q = search.trim().toLowerCase();
// //     if (!q) return services;
// //     return services.filter(
// //       (s) =>
// //         (s.name || '').toLowerCase().includes(q) ||
// //         (s.ref || '').toLowerCase().includes(q) ||
// //         (s.category || '').toLowerCase().includes(q)
// //     );
// //   }, [services, search]);

// //   const fmtMoney = (n) =>
// //     new Intl.NumberFormat('fr-FR', {
// //       style: 'currency',
// //       currency: 'EUR',
// //       minimumFractionDigits: 2,
// //     }).format(n || 0);

// //   const getSubtitle = (item) => {
// //     if (item.ref && item.unit) return `${item.ref} • ${item.unit}`;
// //     if (item.ref) return item.ref;
// //     if (item.category) return item.category;
// //     if (item.unit) return item.unit;
// //     return '—';
// //   };

// //   return (
// //     <SafeAreaView style={styles.safe} edges={['top']}>
// //       <Header
// //         title="Services"
// //         showBack
// //         right={
// //           <View style={styles.headerActions}>
// //             <TouchableOpacity
// //               onPress={() => router.push('/export')}
// //               style={styles.iconBtn}
// //               activeOpacity={0.7}
// //             >
// //               <Text style={styles.iconBtnText}>⬇</Text>
// //             </TouchableOpacity>
// //             <TouchableOpacity
// //               onPress={() => router.push('/import/services')}
// //               style={styles.iconBtn}
// //               activeOpacity={0.7}
// //             >
// //               <Text style={styles.iconBtnText}>⬆</Text>
// //             </TouchableOpacity>
// //             <TouchableOpacity
// //               onPress={() => router.push('/service/new')}
// //               style={styles.newBtn}
// //               activeOpacity={0.7}
// //             >
// //               <Text style={styles.newBtnText}>+ Nouveau</Text>
// //             </TouchableOpacity>
// //           </View>
// //         }
// //       />
// //       <SearchBar
// //         value={search}
// //         onChangeText={setSearch}
// //         placeholder="🔍 Rechercher un service..."
// //       />

// //       {loading ? (
// //         <View style={styles.center}>
// //           <ActivityIndicator size="large" color={colors.accent} />
// //         </View>
// //       ) : error ? (
// //         <View style={styles.center}>
// //           <Text style={styles.errorText}>⚠️ {error}</Text>
// //           <Button title="Réessayer" onPress={loadServices} variant="secondary" />
// //         </View>
// //       ) : filtered.length === 0 ? (
// //         <EmptyState
// //           icon="🔧"
// //           title={search ? 'Aucun résultat' : 'Aucun service'}
// //           message={
// //             search
// //               ? 'Essayez un autre terme.'
// //               : 'Ajoutez vos services (main d\'œuvre, déplacements, forfaits) depuis l\'app web.'
// //           }
// //         />
// //       ) : (
// //         <FlatList
// //           data={filtered}
// //           keyExtractor={(item) => String(item.id)}
// //           renderItem={({ item }) => (
// //             <ListItem
// //               icon={item.isLabor ? '🛠️' : '🔧'}
// //               title={item.name || 'Sans nom'}
// //               // subtitle={
// //               //   item.ref
// //               //     ? `${item.ref}${item.unit ? ' • ' + item.unit : ''}`
// //               //     : item.category || item.unit || '—'
// //               // }
// //               subtitle={getSubtitle(item)}
// //               rightText={fmtMoney(item.unitPrice)}
// //             />
// //           )}
// //           refreshControl={
// //             <RefreshControl
// //               refreshing={refreshing}
// //               onRefresh={onRefresh}
// //               tintColor={colors.accent}
// //               colors={[colors.accent]}
// //             />
// //           }
// //           ListFooterComponent={
// //             <Text style={styles.footer}>
// //               {filtered.length} service{filtered.length > 1 ? 's' : ''}
// //             </Text>
// //           }
// //         />
// //       )}
// //     </SafeAreaView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   safe: { flex: 1, backgroundColor: colors.bg },
// //   center: {
// //     flex: 1,
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     padding: spacing.xl,
// //   },
// //   errorText: {
// //     color: colors.error,
// //     fontSize: fontSize.md,
// //     textAlign: 'center',
// //     marginBottom: spacing.lg,
// //   },
// //   footer: {
// //     color: colors.textMuted,
// //     fontSize: fontSize.xs,
// //     textAlign: 'center',
// //     paddingVertical: spacing.lg,
// //   },
// //     newBtn: {
// //     backgroundColor: colors.accent,
// //     paddingHorizontal: spacing.md,
// //     paddingVertical: 6,
// //     borderRadius: radius.full,
// //   },
// //   newBtnText: {
// //     color: '#0b1120',
// //     fontSize: fontSize.xs,
// //     fontWeight: '700',
// //   },
// //   headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
// //   iconBtn: {
// //     width: 36, height: 36, borderRadius: radius.full,
// //     backgroundColor: colors.bgInput, borderWidth: 1,
// //     borderColor: colors.borderLight,
// //     alignItems: 'center', justifyContent: 'center',
// //   },
// //   iconBtnText: { color: colors.text, fontSize: 16, fontWeight: '700' },
// // });
// import { useState, useCallback, useMemo } from 'react';
// import {
//   View, Text, StyleSheet, FlatList, ActivityIndicator,
//   RefreshControl, TouchableOpacity, Alert,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useFocusEffect, useRouter } from 'expo-router';
// import { servicesApi } from '../../lib/api';
// import { colors, spacing, fontSize, radius } from '../../lib/theme';
// import Header from '../../components/Header';
// import SearchBar from '../../components/SearchBar';
// import EmptyState from '../../components/EmptyState';
// import Button from '../../components/Button';

// export default function ServicesScreen() {
//   const router = useRouter();
//   const [services, setServices] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState('');
//   const [search, setSearch] = useState('');

//   const loadServices = async () => {
//     try {
//       setError('');
//       const data = await servicesApi.list();
//       setServices(Array.isArray(data) ? data : []);
//     } catch (err) {
//       setError(err.response?.data?.error || err.message || 'Erreur');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useFocusEffect(useCallback(() => { loadServices(); }, []));

//   const onRefresh = () => { setRefreshing(true); loadServices(); };

//   const filtered = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     if (!q) return services;
//     return services.filter(
//       (s) =>
//         (s.name || '').toLowerCase().includes(q) ||
//         (s.ref || '').toLowerCase().includes(q) ||
//         (s.category || '').toLowerCase().includes(q)
//     );
//   }, [services, search]);

//   const deleteService = (id, name) => {
//     Alert.alert('Supprimer', `Supprimer "${name}" ?`, [
//       { text: 'Annuler', style: 'cancel' },
//       {
//         text: 'Supprimer', style: 'destructive',
//         onPress: async () => {
//           try {
//             await servicesApi.remove(id);
//             await loadServices();
//           } catch (err) {
//             Alert.alert('Erreur', err.response?.data?.error || err.message);
//           }
//         },
//       },
//     ]);
//   };

//   const fmt = (n) => new Intl.NumberFormat('fr-FR', {
//     style: 'currency', currency: 'EUR', minimumFractionDigits: 2,
//   }).format(n || 0);

//   return (
//     <SafeAreaView style={styles.safe} edges={['top']}>
//       <Header
//         title="Services"
//         showBack
//         right={
//           <View style={styles.headerActions}>
//             <TouchableOpacity
//               onPress={() => router.push('/import/services')}
//               style={styles.iconBtn} activeOpacity={0.7}
//             >
//               <Text style={styles.iconBtnText}>⬆</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               onPress={() => router.push('/service/new')}
//               style={styles.newBtn} activeOpacity={0.7}
//             >
//               <Text style={styles.newBtnText}>+ Nouveau</Text>
//             </TouchableOpacity>
//           </View>
//         }
//       />

//       <SearchBar value={search} onChangeText={setSearch}
//         placeholder="🔍 Rechercher un service..." />

//       {loading ? (
//         <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>
//       ) : error ? (
//         <View style={styles.center}>
//           <Text style={styles.errorText}>⚠️ {error}</Text>
//           <Button title="Réessayer" onPress={loadServices} variant="secondary" />
//         </View>
//       ) : filtered.length === 0 ? (
//         <EmptyState icon="🔧" title={search ? 'Aucun résultat' : 'Aucun service'}
//           message="Ajoutez vos services (main d'œuvre, déplacements, forfaits)." />
//       ) : (
//         <FlatList
//           data={filtered}
//           keyExtractor={(item) => String(item.id)}
//           contentContainerStyle={styles.listContent}
//           refreshControl={
//             <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
//               tintColor={colors.accent} colors={[colors.accent]} />
//           }
//           renderItem={({ item }) => (
//             <View style={styles.card}>
//               <View style={{ flex: 1, minWidth: 0 }}>
//                 <View style={styles.cardHeader}>
//                   <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
//                   {item.ref ? <Text style={styles.cardRef}>{item.ref}</Text> : null}
//                 </View>
//                 <View style={styles.cardMeta}>
//                   {item.category ? <Text style={styles.cardMetaText}>{item.category}</Text> : null}
//                   <Text style={styles.cardPrice}>{fmt(item.unitPrice)}</Text>
//                   {item.unit ? <Text style={styles.cardUnit}>/ {item.unit}</Text> : null}
//                   {item.isLabor && <Text style={styles.laborBadge}>Main d'œuvre</Text>}
//                 </View>
//               </View>
//               <View style={styles.cardActions}>
//                 <TouchableOpacity style={styles.actionBtn}
//                   onPress={() => router.push(`/service/edit?id=${item.id}`)} activeOpacity={0.7}>
//                   <Text style={styles.actionBtnText}>✏️</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDanger]}
//                   onPress={() => deleteService(item.id, item.name)} activeOpacity={0.7}>
//                   <Text style={styles.actionBtnDangerText}>🗑</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           )}
//           ListFooterComponent={
//             <Text style={styles.footer}>{filtered.length} service(s)</Text>
//           }
//         />
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: colors.bg },
//   headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
//   iconBtn: {
//     width: 36, height: 36, borderRadius: radius.full,
//     backgroundColor: colors.bgInput, borderWidth: 1,
//     borderColor: colors.borderLight,
//     alignItems: 'center', justifyContent: 'center',
//   },
//   iconBtnText: { color: colors.text, fontSize: 16, fontWeight: '700' },
//   newBtn: {
//     backgroundColor: colors.accent, paddingHorizontal: spacing.md,
//     paddingVertical: 6, borderRadius: radius.full,
//   },
//   newBtnText: { color: '#0b1120', fontSize: fontSize.xs, fontWeight: '700' },
//   listContent: { padding: spacing.lg, paddingBottom: spacing.xxl },
//   card: {
//     flexDirection: 'row', alignItems: 'center', gap: spacing.md,
//     backgroundColor: colors.bgCard, borderRadius: radius.md,
//     borderWidth: 1, borderColor: colors.border,
//     padding: spacing.md, marginBottom: spacing.sm,
//   },
//   cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 4 },
//   cardName: { color: colors.text, fontSize: fontSize.sm, fontWeight: '700', flexShrink: 1 },
//   cardRef: {
//     color: colors.textMuted, fontSize: 10, fontWeight: '600',
//     backgroundColor: colors.bgInput, paddingHorizontal: 6,
//     paddingVertical: 1, borderRadius: radius.full,
//   },
//   cardMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 2, flexWrap: 'wrap' },
//   cardMetaText: { color: colors.textSecondary, fontSize: fontSize.xs },
//   cardPrice: { color: colors.accent, fontSize: fontSize.sm, fontWeight: '700' },
//   cardUnit: { color: colors.textMuted, fontSize: 10 },
//   laborBadge: {
//     fontSize: 9, fontWeight: '700', color: colors.accent,
//     backgroundColor: 'rgba(249,115,22,0.15)',
//     paddingHorizontal: 6, paddingVertical: 2,
//     borderRadius: radius.full,
//   },
//   cardActions: { flexDirection: 'column', gap: spacing.sm },
//   actionBtn: {
//     width: 44, height: 44, borderRadius: 22,
//     backgroundColor: colors.bgInput, borderWidth: 1,
//     borderColor: colors.borderLight,
//     alignItems: 'center', justifyContent: 'center',
//   },
//   actionBtnText: { fontSize: 18 },
//   actionBtnDanger: { backgroundColor: 'rgba(248,113,113,0.1)', borderColor: 'rgba(248,113,113,0.4)' },
//   actionBtnDangerText: { fontSize: 18 },
//   footer: { color: colors.textMuted, fontSize: fontSize.xs, textAlign: 'center', paddingVertical: spacing.lg },
//   center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
//   errorText: { color: colors.error, fontSize: fontSize.md, textAlign: 'center', marginBottom: spacing.lg },
// });

import { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  RefreshControl, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { servicesApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';

export default function ServicesScreen() {
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const loadServices = async () => {
    try {
      setError('');
      const data = await servicesApi.list();
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { loadServices(); }, []));

  const onRefresh = () => { setRefreshing(true); loadServices(); };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return services;
    return services.filter(
      (s) =>
        (s.name || '').toLowerCase().includes(q) ||
        (s.ref || '').toLowerCase().includes(q) ||
        (s.category || '').toLowerCase().includes(q)
    );
  }, [services, search]);

  const deleteService = (id, name) => {
    Alert.alert('Supprimer', `Supprimer "${name}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          try {
            await servicesApi.remove(id);
            await loadServices();
          } catch (err) {
            Alert.alert('Erreur', err.response?.data?.error || err.message);
          }
        },
      },
    ]);
  };

  const fmt = (n) => new Intl.NumberFormat('fr-FR', {
    style: 'currency', currency: 'EUR', minimumFractionDigits: 2,
  }).format(n || 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header
        title="Services"
        showBack
        right={
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => router.push('/export')}
              style={styles.iconBtn} activeOpacity={0.7}
            >
              <Text style={styles.iconBtnText}>⬇</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/import/services')}
              style={styles.iconBtn} activeOpacity={0.7}
            >
              <Text style={styles.iconBtnText}>⬆</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/service/new')}
              style={styles.newBtn} activeOpacity={0.7}
            >
              <Text style={styles.newBtnText}>+ Nouveau</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <SearchBar value={search} onChangeText={setSearch}
        placeholder="🔍 Rechercher un service..." />

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <Button title="Réessayer" onPress={loadServices} variant="secondary" />
        </View>
      ) : filtered.length === 0 ? (
        <EmptyState icon="🔧" title={search ? 'Aucun résultat' : 'Aucun service'}
          message="Ajoutez vos services (main d'œuvre, déplacements, forfaits)." />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
              tintColor={colors.accent} colors={[colors.accent]} />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                  {item.ref ? <Text style={styles.cardRef}>{item.ref}</Text> : null}
                </View>
                <View style={styles.cardMeta}>
                  {item.category ? <Text style={styles.cardMetaText}>{item.category}</Text> : null}
                  <Text style={styles.cardPrice}>{fmt(item.unitPrice)}</Text>
                  {item.unit ? <Text style={styles.cardUnit}>/ {item.unit}</Text> : null}
                  {item.isLabor && <Text style={styles.laborBadge}>Main d'œuvre</Text>}
                </View>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.actionBtn}
                  onPress={() => router.push(`/service/edit?id=${item.id}`)} activeOpacity={0.7}>
                  <Text style={styles.actionBtnText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDanger]}
                  onPress={() => deleteService(item.id, item.name)} activeOpacity={0.7}>
                  <Text style={styles.actionBtnDangerText}>🗑</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListFooterComponent={
            <Text style={styles.footer}>{filtered.length} service(s)</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconBtn: {
    width: 36, height: 36, borderRadius: radius.full,
    backgroundColor: colors.bgInput, borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center', justifyContent: 'center',
  },
  iconBtnText: { color: colors.text, fontSize: 16, fontWeight: '700' },
  newBtn: {
    backgroundColor: colors.accent, paddingHorizontal: spacing.md,
    paddingVertical: 6, borderRadius: radius.full,
  },
  newBtnText: { color: '#0b1120', fontSize: fontSize.xs, fontWeight: '700' },
  listContent: { padding: spacing.lg, paddingBottom: spacing.xxl },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.bgCard, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, marginBottom: spacing.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 4 },
  cardName: { color: colors.text, fontSize: fontSize.sm, fontWeight: '700', flexShrink: 1 },
  cardRef: {
    color: colors.textMuted, fontSize: 10, fontWeight: '600',
    backgroundColor: colors.bgInput, paddingHorizontal: 6,
    paddingVertical: 1, borderRadius: radius.full,
  },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 2, flexWrap: 'wrap' },
  cardMetaText: { color: colors.textSecondary, fontSize: fontSize.xs },
  cardPrice: { color: colors.accent, fontSize: fontSize.sm, fontWeight: '700' },
  cardUnit: { color: colors.textMuted, fontSize: 10 },
  laborBadge: {
    fontSize: 9, fontWeight: '700', color: colors.accent,
    backgroundColor: 'rgba(249,115,22,0.15)',
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: radius.full,
  },
  cardActions: { flexDirection: 'column', gap: spacing.sm },
  actionBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.bgInput, borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center', justifyContent: 'center',
  },
  actionBtnText: { fontSize: 18 },
  actionBtnDanger: { backgroundColor: 'rgba(248,113,113,0.1)', borderColor: 'rgba(248,113,113,0.4)' },
  actionBtnDangerText: { fontSize: 18 },
  footer: { color: colors.textMuted, fontSize: fontSize.xs, textAlign: 'center', paddingVertical: spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorText: { color: colors.error, fontSize: fontSize.md, textAlign: 'center', marginBottom: spacing.lg },
});