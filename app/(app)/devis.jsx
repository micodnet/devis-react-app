// // import { useState, useEffect, useCallback } from 'react';
// // import {
// //   View, Text, StyleSheet, FlatList, RefreshControl,
// //   ActivityIndicator, ScrollView, TouchableOpacity,
// // } from 'react-native';
// // import { SafeAreaView } from 'react-native-safe-area-context';
// // import { useFocusEffect, useRouter } from 'expo-router';
// // import { quotesApi } from '../../lib/api';
// // import { useAuth } from '../../lib/auth';
// // import { colors, spacing, fontSize, radius } from '../../lib/theme';
// // import Header from '../../components/Header';
// // import QuoteCard from '../../components/QuoteCard';
// // import EmptyState from '../../components/EmptyState';
// // import Button from '../../components/Button';

// // const FILTERS = [
// //   { key: 'all', label: 'Tous' },
// //   { key: 'draft', label: 'Brouillons' },
// //   { key: 'sent', label: 'Envoyés' },
// //   { key: 'accepted', label: 'Acceptés' },
// //   { key: 'refused', label: 'Refusés' },
// // ];

// // export default function DevisScreen() {
// //   const { user, logout } = useAuth();
// //   const router = useRouter();
// //   const [quotes, setQuotes] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [refreshing, setRefreshing] = useState(false);
// //   const [error, setError] = useState('');
// //   const [filter, setFilter] = useState('all');

// //   const loadQuotes = async () => {
// //     try {
// //       setError('');
// //       const data = await quotesApi.list();
// //       setQuotes(Array.isArray(data) ? data : []);
// //     } catch (err) {
// //       setError(err.response?.data?.error || err.message || 'Erreur de chargement');
// //     } finally {
// //       setLoading(false);
// //       setRefreshing(false);
// //     }
// //   };

// //   // Charger à l'affichage initial
// //   useEffect(() => {
// //     loadQuotes();
// //   }, []);

// //   // Recharger à chaque fois que l'écran reprend le focus
// //   useFocusEffect(
// //     useCallback(() => {
// //       loadQuotes();
// //     }, [])
// //   );

// //   const onRefresh = () => {
// //     setRefreshing(true);
// //     loadQuotes();
// //   };

// //   const filteredQuotes = quotes.filter((q) => {
// //     if (filter === 'all') return true;
// //     return (q.status || 'draft') === filter;
// //   });

// //   const counts = {
// //     all: quotes.length,
// //     draft: quotes.filter((q) => (q.status || 'draft') === 'draft').length,
// //     sent: quotes.filter((q) => q.status === 'sent').length,
// //     accepted: quotes.filter((q) => q.status === 'accepted').length,
// //     refused: quotes.filter((q) => q.status === 'refused').length,
// //   };

// //   return (
// //     <SafeAreaView style={styles.safe} edges={['top']}>
// //       <Header
// //         title="Devis"
// //         right={
// //           <View style={styles.headerActions}>
// //             <TouchableOpacity
// //               onPress={() => router.push('/quote/new')}
// //               style={styles.newBtn}
// //               activeOpacity={0.7}
// //             >
// //               <Text style={styles.newBtnText}>+ Nouveau</Text>
// //             </TouchableOpacity>
// //             <TouchableOpacity onPress={logout}>
// //               <Text style={styles.logout}>Déconnexion</Text>
// //             </TouchableOpacity>
// //           </View>
// //         }
// //       />

// //       {/* Barre de filtres */}
// //       <ScrollView
// //         horizontal
// //         showsHorizontalScrollIndicator={false}
// //         contentContainerStyle={styles.filtersContainer}
// //         style={styles.filtersScroll}
// //       >
// //         {FILTERS.map((f) => {
// //           const isActive = filter === f.key;
// //           return (
// //             <TouchableOpacity
// //               key={f.key}
// //               style={[styles.filterBtn, isActive && styles.filterBtnActive]}
// //               onPress={() => setFilter(f.key)}
// //               activeOpacity={0.7}
// //             >
// //               <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
// //                 {f.label}
// //               </Text>
// //               <View style={[styles.filterCount, isActive && styles.filterCountActive]}>
// //                 <Text style={[styles.filterCountText, isActive && styles.filterCountTextActive]}>
// //                   {counts[f.key]}
// //                 </Text>
// //               </View>
// //             </TouchableOpacity>
// //           );
// //         })}
// //       </ScrollView>

// //       {/* Contenu */}
// //       {loading ? (
// //         <View style={styles.center}>
// //           <ActivityIndicator size="large" color={colors.accent} />
// //           <Text style={styles.loadingText}>Chargement des devis...</Text>
// //         </View>
// //       ) : error ? (
// //         <View style={styles.center}>
// //           <Text style={styles.errorText}>⚠️ {error}</Text>
// //           <Button title="Réessayer" onPress={loadQuotes} variant="secondary" />
// //         </View>
// //       ) : filteredQuotes.length === 0 ? (
// //         <EmptyState
// //           icon="📄"
// //           title={filter === 'all' ? 'Aucun devis' : 'Aucun devis dans cette catégorie'}
// //           message={
// //             filter === 'all'
// //               ? 'Créez votre premier devis depuis l\'application web ou l\'API.'
// //               : 'Essayez un autre filtre.'
// //           }
// //         />
// //       ) : (
// //         <FlatList
// //           data={filteredQuotes}
// //           keyExtractor={(item) => String(item.id)}
// //           renderItem={({ item }) => <QuoteCard quote={item} />}
// //           contentContainerStyle={styles.listContent}
// //           refreshControl={
// //             <RefreshControl
// //               refreshing={refreshing}
// //               onRefresh={onRefresh}
// //               tintColor={colors.accent}
// //               colors={[colors.accent]}
// //             />
// //           }
// //           ListFooterComponent={
// //             <Text style={styles.footerText}>
// //               {filteredQuotes.length} devis
// //             </Text>
// //           }
// //         />
// //       )}
// //     </SafeAreaView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   safe: { flex: 1, backgroundColor: colors.bg },
// //   logout: { color: colors.error, fontSize: fontSize.xs, fontWeight: '600' },
// //   filtersScroll: {
// //     maxHeight: 60,
// //     borderBottomWidth: 1,
// //     borderBottomColor: colors.border,
// //   },
// //   filtersContainer: {
// //     paddingHorizontal: spacing.lg,
// //     paddingVertical: spacing.md,
// //     gap: spacing.sm,
// //     flexDirection: 'row',
// //   },
// //   filterBtn: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     gap: 6,
// //     paddingHorizontal: spacing.md,
// //     paddingVertical: 8,
// //     borderRadius: radius.full,
// //     borderWidth: 1,
// //     borderColor: colors.borderLight,
// //     backgroundColor: colors.bgCard,
// //     height: 36,
// //   },
// //   filterBtnActive: {
// //     backgroundColor: colors.accent,
// //     borderColor: colors.accent,
// //   },
// //   filterText: {
// //     color: colors.textSecondary,
// //     fontSize: fontSize.sm,
// //     fontWeight: '600',
// //   },
// //   filterTextActive: {
// //     color: '#0b1120',
// //   },
// //   filterCount: {
// //     backgroundColor: colors.bgInput,
// //     borderRadius: radius.full,
// //     paddingHorizontal: 6,
// //     paddingVertical: 1,
// //     minWidth: 20,
// //     alignItems: 'center',
// //   },
// //   filterCountActive: {
// //     backgroundColor: 'rgba(11,17,32,0.25)',
// //   },
// //   filterCountText: {
// //     color: colors.textMuted,
// //     fontSize: 10,
// //     fontWeight: '700',
// //   },
// //   filterCountTextActive: {
// //     color: '#0b1120',
// //   },
// //   listContent: {
// //     padding: spacing.lg,
// //     paddingBottom: spacing.xxl,
// //   },
// //   center: {
// //     flex: 1,
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     padding: spacing.xl,
// //   },
// //   loadingText: {
// //     color: colors.textSecondary,
// //     fontSize: fontSize.sm,
// //     marginTop: spacing.md,
// //   },
// //   errorText: {
// //     color: colors.error,
// //     fontSize: fontSize.md,
// //     textAlign: 'center',
// //     marginBottom: spacing.lg,
// //   },
// //   footerText: {
// //     color: colors.textMuted,
// //     fontSize: fontSize.xs,
// //     textAlign: 'center',
// //     marginTop: spacing.lg,
// //   },

// //   headerActions: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     gap: spacing.md,
// //   },
// //   newBtn: {
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
// // });
// import { useState, useEffect, useCallback } from 'react';
// import {
//   View, Text, StyleSheet, FlatList, RefreshControl,
//   ActivityIndicator, ScrollView, TouchableOpacity,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useFocusEffect, useRouter } from 'expo-router';
// import { quotesApi } from '../../lib/api';
// import { useAuth } from '../../lib/auth';
// import { colors, spacing, fontSize, radius } from '../../lib/theme';
// import Header from '../../components/Header';
// import QuoteCard from '../../components/QuoteCard';
// import EmptyState from '../../components/EmptyState';
// import Button from '../../components/Button';

// const FILTERS = [
//   { key: 'all', label: 'Tous' },
//   { key: 'draft', label: 'Brouillons' },
//   { key: 'sent', label: 'Envoyés' },
//   { key: 'accepted', label: 'Acceptés' },
//   { key: 'refused', label: 'Refusés' },
// ];

// export default function DevisScreen() {
//   const router = useRouter();
//   const { user, logout } = useAuth();
//   const [quotes, setQuotes] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState('');
//   const [filter, setFilter] = useState('all');

//   const loadQuotes = async () => {
//     try {
//       setError('');
//       const data = await quotesApi.list();
//       setQuotes(Array.isArray(data) ? data : []);
//     } catch (err) {
//       setError(err.response?.data?.error || err.message || 'Erreur de chargement');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useEffect(() => { loadQuotes(); }, []);

//   useFocusEffect(
//     useCallback(() => {
//       loadQuotes();
//     }, [])
//   );

//   const onRefresh = () => {
//     setRefreshing(true);
//     loadQuotes();
//   };

//   const filteredQuotes = quotes.filter((q) => {
//     if (filter === 'all') return true;
//     return (q.status || 'draft') === filter;
//   });

//   const counts = {
//     all: quotes.length,
//     draft: quotes.filter((q) => (q.status || 'draft') === 'draft').length,
//     sent: quotes.filter((q) => q.status === 'sent').length,
//     accepted: quotes.filter((q) => q.status === 'accepted').length,
//     refused: quotes.filter((q) => q.status === 'refused').length,
//   };

//   return (
//     <SafeAreaView style={styles.safe} edges={['top']}>
//       <Header
//         title="Devis"
//         right={
//           <View style={styles.headerActions}>
//             <TouchableOpacity
//               onPress={() => router.push('/quote/new')}
//               style={styles.newBtn}
//               activeOpacity={0.7}
//             >
//               <Text style={styles.newBtnText}>+ Nouveau</Text>
//             </TouchableOpacity>
//             <TouchableOpacity onPress={logout}>
//               <Text style={styles.logout}>Déconnexion</Text>
//             </TouchableOpacity>
//           </View>
//         }
//       />

//       {/* Barre de filtres */}
//       <View style={styles.filtersBar}>
//         <ScrollView
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           contentContainerStyle={styles.filtersContainer}
//         >
//           {FILTERS.map((f) => {
//             const isActive = filter === f.key;
//             return (
//               <TouchableOpacity
//                 key={f.key}
//                 style={[styles.filterBtn, isActive && styles.filterBtnActive]}
//                 onPress={() => setFilter(f.key)}
//                 activeOpacity={0.7}
//               >
//                 <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
//                   {f.label}
//                 </Text>
//                 <View style={[styles.filterCount, isActive && styles.filterCountActive]}>
//                   <Text style={[styles.filterCountText, isActive && styles.filterCountTextActive]}>
//                     {counts[f.key]}
//                   </Text>
//                 </View>
//               </TouchableOpacity>
//             );
//           })}
//         </ScrollView>
//       </View>

//       {/* Contenu */}
//       {loading ? (
//         <View style={styles.center}>
//           <ActivityIndicator size="large" color={colors.accent} />
//           <Text style={styles.loadingText}>Chargement des devis...</Text>
//         </View>
//       ) : error ? (
//         <View style={styles.center}>
//           <Text style={styles.errorText}>⚠️ {error}</Text>
//           <Button title="Réessayer" onPress={loadQuotes} variant="secondary" />
//         </View>
//       ) : filteredQuotes.length === 0 ? (
//         <EmptyState
//           icon="📄"
//           title={filter === 'all' ? 'Aucun devis' : 'Aucun devis dans cette catégorie'}
//           message={
//             filter === 'all'
//               ? 'Créez votre premier devis en haut à droite.'
//               : 'Essayez un autre filtre.'
//           }
//         />
//       ) : (
//         <FlatList
//           data={filteredQuotes}
//           keyExtractor={(item) => String(item.id)}
//           renderItem={({ item }) => <QuoteCard quote={item} />}
//           contentContainerStyle={styles.listContent}
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={onRefresh}
//               tintColor={colors.accent}
//               colors={[colors.accent]}
//             />
//           }
//           ListFooterComponent={
//             <Text style={styles.footerText}>
//               {filteredQuotes.length} devis
//             </Text>
//           }
//         />
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: colors.bg },
//   headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
//   newBtn: {
//     backgroundColor: colors.accent,
//     paddingHorizontal: spacing.md,
//     paddingVertical: 6,
//     borderRadius: radius.full,
//   },
//   newBtnText: { color: '#0b1120', fontSize: fontSize.xs, fontWeight: '700' },
//   logout: { color: colors.error, fontSize: fontSize.xs, fontWeight: '600' },
//   filtersBar: {
//     borderBottomWidth: 1,
//     borderBottomColor: colors.border,
//     backgroundColor: colors.bg,
//   },
//   filtersContainer: {
//     paddingHorizontal: spacing.lg,
//     paddingVertical: spacing.md,
//     gap: spacing.sm,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   filterBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//     paddingHorizontal: spacing.md,
//     paddingVertical: 8,
//     borderRadius: radius.full,
//     borderWidth: 1,
//     borderColor: colors.borderLight,
//     backgroundColor: colors.bgCard,
//     height: 36,
//   },
//   filterBtnActive: {
//     backgroundColor: colors.accent,
//     borderColor: colors.accent,
//   },
//   filterText: {
//     color: colors.textSecondary,
//     fontSize: fontSize.sm,
//     fontWeight: '600',
//   },
//   filterTextActive: { color: '#0b1120' },
//   filterCount: {
//     backgroundColor: colors.bgInput,
//     borderRadius: radius.full,
//     paddingHorizontal: 6,
//     paddingVertical: 1,
//     minWidth: 20,
//     alignItems: 'center',
//   },
//   filterCountActive: { backgroundColor: 'rgba(11,17,32,0.25)' },
//   filterCountText: {
//     color: colors.textMuted,
//     fontSize: 10,
//     fontWeight: '700',
//   },
//   filterCountTextActive: { color: '#0b1120' },
//   listContent: {
//     padding: spacing.lg,
//     paddingBottom: spacing.xxl,
//   },
//   center: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: spacing.xl,
//   },
//   loadingText: {
//     color: colors.textSecondary,
//     fontSize: fontSize.sm,
//     marginTop: spacing.md,
//   },
//   errorText: {
//     color: colors.error,
//     fontSize: fontSize.md,
//     textAlign: 'center',
//     marginBottom: spacing.lg,
//   },
//   footerText: {
//     color: colors.textMuted,
//     fontSize: fontSize.xs,
//     textAlign: 'center',
//     marginTop: spacing.lg,
//   },
// });
import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl,
  ActivityIndicator, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { quotesApi } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import QuoteCard from '../../components/QuoteCard';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';

const FILTERS = [
  { key: 'all', label: 'Tous' },
  { key: 'draft', label: 'Brouillons' },
  { key: 'sent', label: 'Envoyés' },
  { key: 'accepted', label: 'Acceptés' },
  { key: 'refused', label: 'Refusés' },
];

export default function DevisScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const loadQuotes = async () => {
    try {
      setError('');
      const data = await quotesApi.list();
      setQuotes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadQuotes(); }, []);
  useFocusEffect(useCallback(() => { loadQuotes(); }, []));

  const onRefresh = () => { setRefreshing(true); loadQuotes(); };

  const deleteQuote = (id, number) => {
    Alert.alert(
      'Supprimer le devis',
      `Supprimer définitivement ${number} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await quotesApi.remove(id);
              await loadQuotes();
            } catch (err) {
              Alert.alert('Erreur', err.response?.data?.error || err.message);
            }
          },
        },
      ]
    );
  };

  const filteredQuotes = quotes.filter((q) => {
    if (filter === 'all') return true;
    return (q.status || 'draft') === filter;
  });

  const counts = {
    all: quotes.length,
    draft: quotes.filter((q) => (q.status || 'draft') === 'draft').length,
    sent: quotes.filter((q) => q.status === 'sent').length,
    accepted: quotes.filter((q) => q.status === 'accepted').length,
    refused: quotes.filter((q) => q.status === 'refused').length,
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header
        title="Devis"
        right={
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => router.push('/quote/new')}
              style={styles.newBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.newBtnText}>+ Nouveau</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={logout}>
              <Text style={styles.logout}>Déconnexion</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <View style={styles.filtersBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
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
                <View style={[styles.filterCount, isActive && styles.filterCountActive]}>
                  <Text style={[styles.filterCountText, isActive && styles.filterCountTextActive]}>
                    {counts[f.key]}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <Button title="Réessayer" onPress={loadQuotes} variant="secondary" />
        </View>
      ) : filteredQuotes.length === 0 ? (
        <EmptyState
          icon="📄"
          title={filter === 'all' ? 'Aucun devis' : 'Aucun devis dans cette catégorie'}
          message={filter === 'all' ? 'Créez votre premier devis en haut à droite.' : 'Essayez un autre filtre.'}
        />
      ) : (
        <FlatList
          data={filteredQuotes}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.quoteRow}>
              <View style={{ flex: 1 }}>
                <QuoteCard quote={item} />
              </View>
              <View style={styles.quoteActions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => router.push(`/quote/edit?id=${item.id}`)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.actionBtnText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionBtnDanger]}
                  onPress={() => deleteQuote(item.id, item.quoteNumber)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.actionBtnDangerText}>🗑</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
              tintColor={colors.accent} colors={[colors.accent]} />
          }
          ListFooterComponent={
            <Text style={styles.footerText}>{filteredQuotes.length} devis</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  newBtn: {
    backgroundColor: colors.accent, paddingHorizontal: spacing.md,
    paddingVertical: 6, borderRadius: radius.full,
  },
  newBtnText: { color: '#0b1120', fontSize: fontSize.xs, fontWeight: '700' },
  logout: { color: colors.error, fontSize: fontSize.xs, fontWeight: '600' },
  filtersBar: {
    borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.bg,
  },
  filtersContainer: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    gap: spacing.sm, flexDirection: 'row', alignItems: 'center',
  },
  filterBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: spacing.md, paddingVertical: 8,
    borderRadius: radius.full, borderWidth: 1,
    borderColor: colors.borderLight, backgroundColor: colors.bgCard, height: 36,
  },
  filterBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  filterText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600' },
  filterTextActive: { color: '#0b1120' },
  filterCount: {
    backgroundColor: colors.bgInput, borderRadius: radius.full,
    paddingHorizontal: 6, paddingVertical: 1, minWidth: 20, alignItems: 'center',
  },
  filterCountActive: { backgroundColor: 'rgba(11,17,32,0.25)' },
  filterCountText: { color: colors.textMuted, fontSize: 10, fontWeight: '700' },
  filterCountTextActive: { color: '#0b1120' },
  quoteRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.sm },
  quoteActions: { flexDirection: 'column', gap: spacing.sm, paddingTop: spacing.md },
  actionBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.bgInput, borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center', justifyContent: 'center',
  },
  actionBtnText: { fontSize: 18 },
  actionBtnDanger: { backgroundColor: 'rgba(248,113,113,0.1)', borderColor: 'rgba(248,113,113,0.4)' },
  actionBtnDangerText: { fontSize: 18 },
  listContent: { padding: spacing.lg, paddingBottom: spacing.xxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  loadingText: { color: colors.textSecondary, fontSize: fontSize.sm, marginTop: spacing.md },
  errorText: { color: colors.error, fontSize: fontSize.md, textAlign: 'center', marginBottom: spacing.lg },
  footerText: { color: colors.textMuted, fontSize: fontSize.xs, textAlign: 'center', marginTop: spacing.lg },
});