// import { useState, useEffect, useRef } from 'react';
// import {
//   View, Text, StyleSheet, ScrollView, ActivityIndicator,
//   TouchableOpacity, TextInput, KeyboardAvoidingView, Platform,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import { chatApi } from '../../lib/api';
// import { colors, spacing, fontSize, radius } from '../../lib/theme';
// import AssistantMessage from '../../components/AssistantMessage';

// export default function ChatScreen() {
//   const { id } = useLocalSearchParams();
//   const router = useRouter();
//   const scrollRef = useRef(null);

//   const [conversation, setConversation] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [input, setInput] = useState('');
//   const [sending, setSending] = useState(false);

//   const handleBack = () => {
//     if (router.canGoBack()) router.back();
//     else router.replace('/(app)/chat');
//   };

//   const loadConversation = async () => {
//     try {
//       setError('');
//       const data = await chatApi.conversation(id);
//       setConversation(data.conversation || data);
//       setMessages(data.messages || []);
//     } catch (err) {
//       setError(err.response?.data?.error || err.message || 'Erreur de chargement');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadConversation();
//   }, [id]);

//   const send = async () => {
//     const body = input.trim();
//     if (!body || sending) return;
//     setSending(true);
//     setInput('');

//     // Optimistic update
//     const tempMsg = {
//       id: `temp-${Date.now()}`,
//       senderType: 'owner',
//       body,
//       createdAt: new Date().toISOString(),
//     };
//     setMessages((prev) => [...prev, tempMsg]);

//     try {
//       await chatApi.sendMessage(id, body);
//       await loadConversation();
//     } catch (err) {
//       // Retirer le message optimiste en cas d'erreur
//       setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
//       setError(err.response?.data?.error || err.message || 'Erreur d\'envoi');
//     } finally {
//       setSending(false);
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

//   if (error && !conversation) {
//     return (
//       <SafeAreaView style={styles.safe} edges={['top']}>
//         <View style={styles.header}>
//           <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
//             <Text style={styles.backText}>←</Text>
//           </TouchableOpacity>
//           <Text style={styles.title}>Erreur</Text>
//         </View>
//         <View style={styles.center}>
//           <Text style={styles.errorText}>⚠️ {error}</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   const clientName =
//     conversation?.clientName || conversation?.client_name || 'Client';

//   return (
//     <SafeAreaView style={styles.safe} edges={['top']}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
//           <Text style={styles.backText}>←</Text>
//         </TouchableOpacity>
//         <Text style={styles.title} numberOfLines={1}>
//           {clientName}
//         </Text>
//       </View>

//       <KeyboardAvoidingView
//         style={{ flex: 1 }}
//         behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//         keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
//       >
//         <ScrollView
//           ref={scrollRef}
//           contentContainerStyle={styles.messagesContent}
//           onContentSizeChange={() =>
//             scrollRef.current?.scrollToEnd({ animated: true })
//           }
//         >
//           {messages.length === 0 ? (
//             <Text style={styles.empty}>Aucun message pour le moment.</Text>
//           ) : (
//             messages.map((m) => {
//               const isClient = m.senderType === 'client';
//               return (
//                 <AssistantMessage
//                   key={m.id}
//                   role={isClient ? 'assistant' : 'user'}
//                   text={m.body}
//                 />
//               );
//             })
//           )}
//         </ScrollView>

//         {!!error && <Text style={styles.inlineError}>⚠️ {error}</Text>}

//         <View style={styles.inputBar}>
//           <TextInput
//             style={styles.input}
//             value={input}
//             onChangeText={setInput}
//             placeholder="Votre réponse..."
//             placeholderTextColor={colors.textMuted}
//             multiline
//             maxLength={2000}
//           />
//           <TouchableOpacity
//             style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
//             onPress={send}
//             disabled={!input.trim() || sending}
//             activeOpacity={0.7}
//           >
//             {sending ? (
//               <ActivityIndicator size="small" color="#0b1120" />
//             ) : (
//               <Text style={styles.sendIcon}>➤</Text>
//             )}
//           </TouchableOpacity>
//         </View>
//       </KeyboardAvoidingView>
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
//   backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
//   backText: { color: colors.text, fontSize: 24, fontWeight: '600' },
//   title: { flex: 1, color: colors.text, fontSize: fontSize.lg, fontWeight: '700' },
//   messagesContent: {
//     padding: spacing.lg,
//     paddingBottom: spacing.md,
//   },
//   empty: {
//     color: colors.textMuted,
//     fontSize: fontSize.sm,
//     fontStyle: 'italic',
//     textAlign: 'center',
//     paddingVertical: spacing.xxl,
//   },
//   inlineError: {
//     color: colors.error,
//     fontSize: fontSize.xs,
//     textAlign: 'center',
//     paddingVertical: spacing.sm,
//   },
//   inputBar: {
//     flexDirection: 'row',
//     alignItems: 'flex-end',
//     paddingHorizontal: spacing.md,
//     paddingVertical: spacing.md,
//     borderTopWidth: 1,
//     borderTopColor: colors.border,
//     backgroundColor: colors.bgCard,
//     gap: spacing.sm,
//   },
//   input: {
//     flex: 1,
//     backgroundColor: colors.bgInput,
//     borderWidth: 1,
//     borderColor: colors.borderLight,
//     borderRadius: radius.lg,
//     paddingHorizontal: spacing.md,
//     paddingVertical: 10,
//     color: colors.text,
//     fontSize: fontSize.sm,
//     maxHeight: 100,
//   },
//   sendBtn: {
//     width: 44,
//     height: 44,
//     borderRadius: radius.full,
//     backgroundColor: colors.accent,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   sendBtnDisabled: {
//     backgroundColor: colors.bgInput,
//     opacity: 0.6,
//   },
//   sendIcon: {
//     color: '#0b1120',
//     fontSize: 18,
//     fontWeight: '800',
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
//   },
// });

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  TouchableOpacity, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { chatApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import AssistantMessage from '../../components/AssistantMessage';

const POLL_INTERVAL = 5000; // 5 secondes

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const scrollRef = useRef(null);
  const pollRef = useRef(null);

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/chat');
  };

  const loadConversation = async (silent = false) => {
    try {
      if (!silent) setError('');
      const data = await chatApi.conversation(id);
      const newMessages = data.messages || [];

      // Ne mettre à jour que si le nombre de messages change (évite les re-rendus)
      setMessages((prev) => {
        if (prev.length !== newMessages.length) return newMessages;
        return prev;
      });
      setConversation(data.conversation || data);
    } catch (err) {
      if (!silent) setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadConversation();
    pollRef.current = setInterval(() => loadConversation(true), POLL_INTERVAL);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [id]);

  const send = async () => {
    const body = input.trim();
    if (!body || sending) return;
    setSending(true);
    setInput('');

    const tempMsg = {
      id: `temp-${Date.now()}`,
      senderType: 'owner',
      body,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      await chatApi.sendMessage(id, body);
      await loadConversation(true);
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
      setError(err.response?.data?.error || err.message || 'Erreur d\'envoi');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>
      </SafeAreaView>
    );
  }

  if (error && !conversation) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Erreur</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const clientName = conversation?.clientName || conversation?.client_name || 'Client';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{clientName}</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.length === 0 ? (
            <Text style={styles.empty}>Aucun message pour le moment.</Text>
          ) : (
            messages.map((m) => {
              const isClient = m.senderType === 'client';
              return (
                <AssistantMessage key={m.id}
                  role={isClient ? 'assistant' : 'user'}
                  text={m.body} />
              );
            })
          )}
        </ScrollView>

        {!!error && <Text style={styles.inlineError}>⚠️ {error}</Text>}

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Votre réponse..."
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={2000}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
            onPress={send}
            disabled={!input.trim() || sending}
            activeOpacity={0.7}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#0b1120" />
            ) : (
              <Text style={styles.sendIcon}>➤</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  messagesContent: { padding: spacing.lg, paddingBottom: spacing.md },
  empty: {
    color: colors.textMuted, fontSize: fontSize.sm,
    fontStyle: 'italic', textAlign: 'center', paddingVertical: spacing.xxl,
  },
  inlineError: {
    color: colors.error, fontSize: fontSize.xs,
    textAlign: 'center', paddingVertical: spacing.sm,
  },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    borderTopWidth: 1, borderTopColor: colors.border,
    backgroundColor: colors.bgCard, gap: spacing.sm,
  },
  input: {
    flex: 1, backgroundColor: colors.bgInput, borderWidth: 1,
    borderColor: colors.borderLight, borderRadius: radius.lg,
    paddingHorizontal: spacing.md, paddingVertical: 10,
    color: colors.text, fontSize: fontSize.sm, maxHeight: 100,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: radius.full,
    backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: colors.bgInput, opacity: 0.6 },
  sendIcon: { color: '#0b1120', fontSize: 18, fontWeight: '800' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorText: { color: colors.error, fontSize: fontSize.md, textAlign: 'center' },
});