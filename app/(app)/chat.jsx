// import { useState, useCallback } from 'react';
// import {
//   View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useFocusEffect, useRouter } from 'expo-router';
// import { chatApi } from '../../lib/api';
// import { colors, spacing, fontSize, radius } from '../../lib/theme';
// import Header from '../../components/Header';
// import EmptyState from '../../components/EmptyState';
// import Button from '../../components/Button';

// export default function ChatListScreen() {
//   const router = useRouter();
//   const [conversations, setConversations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState('');

//   const loadConversations = async () => {
//     try {
//       setError('');
//       const data = await chatApi.conversations();
//       setConversations(Array.isArray(data) ? data : []);
//     } catch (err) {
//       setError(err.response?.data?.error || err.message || 'Erreur de chargement');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       loadConversations();
//     }, [])
//   );

//   const onRefresh = () => {
//     setRefreshing(true);
//     loadConversations();
//   };

//   return (
//     <SafeAreaView style={styles.safe} edges={['top']}>
//       <Header title="Messages clients" />

//       {loading ? (
//         <View style={styles.center}>
//           <ActivityIndicator size="large" color={colors.accent} />
//         </View>
//       ) : error ? (
//         <View style={styles.center}>
//           <Text style={styles.errorText}>⚠️ {error}</Text>
//           <Button title="Réessayer" onPress={loadConversations} variant="secondary" />
//         </View>
//       ) : conversations.length === 0 ? (
//         <EmptyState
//           icon="💬"
//           title="Aucune conversation"
//           message="Vos clients peuvent vous envoyer des messages depuis la page publique de signature."
//         />
//       ) : (
//         <FlatList
//           data={conversations}
//           keyExtractor={(item) => String(item.id)}
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={onRefresh}
//               tintColor={colors.accent}
//               colors={[colors.accent]}
//             />
//           }
//           renderItem={({ item }) => {
//             const isUnread = (item.ownerUnreadCount || item.owner_unread_count || 0) > 0;
//             const lastMsg = item.lastMessageAt || item.last_message_at;
//             const preview = item.lastMessagePreview || item.last_message_preview || '';
//             return (
//               <TouchableOpacity
//                 style={[styles.card, isUnread && styles.cardUnread]}
//                 onPress={() => router.push(`/chat/${item.id}`)}
//                 activeOpacity={0.7}
//               >
//                 <View style={styles.cardHeader}>
//                   <Text style={styles.clientName}>
//                     {item.clientName || item.client_name || 'Client'}
//                   </Text>
//                   {lastMsg ? (
//                     <Text style={styles.time}>
//                       {new Date(lastMsg).toLocaleDateString('fr-FR')}
//                     </Text>
//                   ) : null}
//                 </View>
//                 {item.clientEmail ? (
//                   <Text style={styles.email} numberOfLines={1}>
//                     {item.clientEmail}
//                   </Text>
//                 ) : null}
//                 <Text style={styles.preview} numberOfLines={2}>
//                   {preview || '(Aucun message)'}
//                 </Text>
//                 {isUnread ? (
//                   <View style={styles.unreadBadge}>
//                     <Text style={styles.unreadText}>
//                       {item.ownerUnreadCount || item.owner_unread_count} nouveau
//                     </Text>
//                   </View>
//                 ) : null}
//               </TouchableOpacity>
//             );
//           }}
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
//   card: {
//     backgroundColor: colors.bgCard,
//     borderBottomWidth: 1,
//     borderBottomColor: colors.border,
//     padding: spacing.lg,
//     gap: 4,
//   },
//   cardUnread: {
//     borderLeftWidth: 4,
//     borderLeftColor: colors.accent,
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     gap: spacing.md,
//   },
//   clientName: {
//     color: colors.text,
//     fontSize: fontSize.md,
//     fontWeight: '700',
//     flex: 1,
//   },
//   time: {
//     color: colors.textMuted,
//     fontSize: fontSize.xs,
//   },
//   email: {
//     color: colors.textSecondary,
//     fontSize: fontSize.xs,
//   },
//   preview: {
//     color: colors.textSecondary,
//     fontSize: fontSize.sm,
//     marginTop: spacing.sm,
//     lineHeight: 18,
//   },
//   unreadBadge: {
//     alignSelf: 'flex-start',
//     backgroundColor: colors.accent,
//     paddingHorizontal: spacing.md,
//     paddingVertical: 3,
//     borderRadius: radius.full,
//     marginTop: spacing.sm,
//   },
//   unreadText: {
//     color: '#0b1120',
//     fontSize: 10,
//     fontWeight: '800',
//   },
// });

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { chatApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';

const POLL_INTERVAL = 10000; // 10 secondes

export default function ChatListScreen() {
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const pollRef = useRef(null);

  const loadConversations = async (silent = false) => {
    try {
      if (!silent) setError('');
      const data = await chatApi.conversations();
      setConversations(Array.isArray(data) ? data : []);
    } catch (err) {
      if (!silent) setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      if (!silent) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  // Charger au focus + démarrer le polling
  useFocusEffect(
    useCallback(() => {
      loadConversations();
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(() => loadConversations(true), POLL_INTERVAL);
      return () => {
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      };
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Messages clients" showBack />

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <Button title="Réessayer" onPress={() => loadConversations()} variant="secondary" />
        </View>
      ) : conversations.length === 0 ? (
        <EmptyState icon="💬" title="Aucune conversation"
          message="Vos clients peuvent vous envoyer des messages depuis la page publique de signature." />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => String(item.id)}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
              tintColor={colors.accent} colors={[colors.accent]} />
          }
          renderItem={({ item }) => {
            const unread = item.ownerUnreadCount || item.owner_unread_count || 0;
            const isUnread = unread > 0;
            const lastMsg = item.lastMessageAt || item.last_message_at;
            const preview = item.lastMessagePreview || item.last_message_preview || '';
            return (
              <TouchableOpacity
                style={[styles.card, isUnread && styles.cardUnread]}
                onPress={() => router.push(`/chat/${item.id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.clientName} numberOfLines={1}>
                    {item.clientName || item.client_name || 'Client'}
                  </Text>
                  {lastMsg ? (
                    <Text style={styles.time}>
                      {new Date(lastMsg).toLocaleDateString('fr-FR')}
                    </Text>
                  ) : null}
                </View>
                {item.clientEmail ? (
                  <Text style={styles.email} numberOfLines={1}>{item.clientEmail}</Text>
                ) : null}
                <Text style={styles.preview} numberOfLines={2}>
                  {preview || '(Aucun message)'}
                </Text>
                {isUnread ? (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{unread} nouveau{unread > 1 ? 'x' : ''}</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorText: { color: colors.error, fontSize: fontSize.md, textAlign: 'center', marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.bgCard, borderBottomWidth: 1,
    borderBottomColor: colors.border, padding: spacing.lg, gap: 4,
  },
  cardUnread: { borderLeftWidth: 4, borderLeftColor: colors.accent },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', gap: spacing.md,
  },
  clientName: { color: colors.text, fontSize: fontSize.md, fontWeight: '700', flex: 1 },
  time: { color: colors.textMuted, fontSize: fontSize.xs },
  email: { color: colors.textSecondary, fontSize: fontSize.xs },
  preview: { color: colors.textSecondary, fontSize: fontSize.sm, marginTop: spacing.sm, lineHeight: 18 },
  unreadBadge: {
    alignSelf: 'flex-start', backgroundColor: colors.accent,
    paddingHorizontal: spacing.md, paddingVertical: 3,
    borderRadius: radius.full, marginTop: spacing.sm,
  },
  unreadText: { color: '#0b1120', fontSize: 10, fontWeight: '800' },
});