// import { useState, useCallback, useMemo } from 'react';
// import {
//   View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useFocusEffect, useRouter } from 'expo-router';
// import { chantiersApi } from '../../lib/api';
// import { colors, spacing, fontSize, radius } from '../../lib/theme';
// import Header from '../../components/Header';
// import SearchBar from '../../components/SearchBar';
// import ListItem from '../../components/ListItem';
// import EmptyState from '../../components/EmptyState';
// import Button from '../../components/Button';

// const STATUS_LABELS = {
//   planned: '📋 Planifié',
//   in_progress: '🔨 En cours',
//   paused: '⏸ En pause',
//   completed: '✅ Terminé',
//   cancelled: '❌ Annulé',
// };

// export default function ChantiersScreen() {
//   const router = useRouter();
//   const [chantiers, setChantiers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState('');
//   const [search, setSearch] = useState('');

//   const loadChantiers = async () => {
//     try {
//       setError('');
//       const data = await chantiersApi.list();
//       setChantiers(Array.isArray(data) ? data : []);
//     } catch (err) {
//       setError(err.response?.data?.error || err.message || 'Erreur de chargement');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       loadChantiers();
//     }, [])
//   );

//   const onRefresh = () => {
//     setRefreshing(true);
//     loadChantiers();
//   };

//   const filtered = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     if (!q) return chantiers;
//     return chantiers.filter(
//       (c) =>
//         (c.name || '').toLowerCase().includes(q) ||
//         (c.clientName || '').toLowerCase().includes(q) ||
//         (c.reference || '').toLowerCase().includes(q)
//     );
//   }, [chantiers, search]);

//   return (
//     <SafeAreaView style={styles.safe} edges={['top']}>
//       <Header title="Chantiers" />
//       <SearchBar
//         value={search}
//         onChangeText={setSearch}
//         placeholder="🔍 Rechercher un chantier..."
//       />

//       {loading ? (
//         <View style={styles.center}>
//           <ActivityIndicator size="large" color={colors.accent} />
//         </View>
//       ) : error ? (
//         <View style={styles.center}>
//           <Text style={styles.errorText}>⚠️ {error}</Text>
//           <Button title="Réessayer" onPress={loadChantiers} variant="secondary" />
//         </View>
//       ) : filtered.length === 0 ? (
//         <EmptyState
//           icon="🏗️"
//           title={search ? 'Aucun résultat' : 'Aucun chantier'}
//           message={
//             search
//               ? 'Essayez un autre terme.'
//               : 'Créez vos chantiers depuis l\'application web.'
//           }
//         />
//       ) : (
//         <FlatList
//           data={filtered}
//           keyExtractor={(item) => String(item.id)}
//           renderItem={({ item }) => {
//             const statusLabel = STATUS_LABELS[item.status] || item.status;
//             const subtitle = [
//               item.reference,
//               item.clientName,
//               statusLabel,
//             ]
//               .filter(Boolean)
//               .join(' · ');
//             return (
//               <ListItem
//                 icon="🏗️"
//                 title={item.name}
//                 subtitle={subtitle}
//                 onPress={() => router.push(`/chantier/${item.id}`)}
//               />
//             );
//           }}
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={onRefresh}
//               tintColor={colors.accent}
//               colors={[colors.accent]}
//             />
//           }
//           ListFooterComponent={
//             <Text style={styles.footer}>
//               {filtered.length} chantier{filtered.length > 1 ? 's' : ''}
//             </Text>
//           }
//         />
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: colors.bg },
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
//   footer: {
//     color: colors.textMuted,
//     fontSize: fontSize.xs,
//     textAlign: 'center',
//     paddingVertical: spacing.lg,
//   },
// });

import { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { chantiersApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import ListItem from '../../components/ListItem';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';

const STATUS_LABELS = {
  planned: '📋 Planifié',
  in_progress: '🔨 En cours',
  paused: '⏸ En pause',
  completed: '✅ Terminé',
  cancelled: '❌ Annulé',
};

export default function ChantiersScreen() {
  const router = useRouter();
  const [chantiers, setChantiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const loadChantiers = async () => {
    try {
      setError('');
      const data = await chantiersApi.list();
      setChantiers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadChantiers();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadChantiers();
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return chantiers;
    return chantiers.filter(
      (c) =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.clientName || '').toLowerCase().includes(q) ||
        (c.reference || '').toLowerCase().includes(q)
    );
  }, [chantiers, search]);

  const getSubtitle = (item) => {
    const parts = [];
    if (item.reference) parts.push(item.reference);
    if (item.clientName) parts.push(item.clientName);
    if (item.status) parts.push(STATUS_LABELS[item.status] || item.status);
    return parts.length > 0 ? parts.join(' · ') : '—';
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header
        title="Chantiers"
        showBack
        right={
          <TouchableOpacity
            onPress={() => router.push('/chantier/new')}
            style={styles.newBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.newBtnText}>+ Nouveau</Text>
          </TouchableOpacity>
        }
      />

      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="🔍 Rechercher un chantier..."
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <Button title="Réessayer" onPress={loadChantiers} variant="secondary" />
        </View>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="🏗️"
          title={search ? 'Aucun résultat' : 'Aucun chantier'}
          message={
            search
              ? 'Essayez un autre terme.'
              : 'Créez votre premier chantier pour regrouper vos devis.'
          }
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <ListItem
              icon="🏗️"
              title={item.name || 'Sans nom'}
              subtitle={getSubtitle(item)}
              onPress={() => router.push(`/chantier/${item.id}`)}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
          ListFooterComponent={
            <Text style={styles.footer}>
              {filtered.length} chantier{filtered.length > 1 ? 's' : ''}
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  newBtn: {
    backgroundColor: colors.accent, paddingHorizontal: spacing.md,
    paddingVertical: 6, borderRadius: radius.full,
  },
  newBtnText: { color: '#0b1120', fontSize: fontSize.xs, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorText: { color: colors.error, fontSize: fontSize.md, textAlign: 'center', marginBottom: spacing.lg },
  footer: { color: colors.textMuted, fontSize: fontSize.xs, textAlign: 'center', paddingVertical: spacing.lg },
});