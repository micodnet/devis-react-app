// // import { useRef, useState, useEffect, useCallback } from 'react';
// // import {
// //   View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView,
// //   KeyboardAvoidingView, Platform, ActivityIndicator, Modal, Alert,
// // } from 'react-native';
// // import { SafeAreaView } from 'react-native-safe-area-context';
// // import { assistantApi, storage } from '../lib/api';
// // import { colors, spacing, fontSize, radius } from '../lib/theme';
// // import AssistantMessage from './AssistantMessage';
// // import DraftCard from './DraftCard';
// // import { useAssistant } from './AssistantProvider';

// // const STORAGE_KEY = 'devis_assistant_history';
// // const MAX_HISTORY = 40;

// // const SUGGESTIONS = [
// //   'Combien j\'ai de produits ?',
// //   'Quel est mon chiffre d\'affaires ?',
// //   'Cherche un client',
// //   'Est-ce que j\'ai des alertes de stock ?',
// //   'Crée un devis',
// // ];

// // export default function AssistantBubble() {
// //   const { isOpen, close, toggle } = useAssistant();
// //   const scrollRef = useRef(null);

// //   const [messages, setMessages] = useState([]);
// //   const [input, setInput] = useState('');
// //   const [sending, setSending] = useState(false);
// //   const [suggestions, setSuggestions] = useState([]);

// //   const loadHistory = async () => {
// //     try {
// //       const raw = await storage.getItem(STORAGE_KEY);
// //       if (raw) {
// //         const parsed = JSON.parse(raw);
// //         setMessages(Array.isArray(parsed) ? parsed : []);
// //         return;
// //       }
// //       setMessages([
// //         {
// //           id: 'welcome',
// //           role: 'assistant',
// //           text: 'Bonjour 👋 Je suis votre assistant. Posez-moi une question sur votre catalogue, vos clients, vos devis, votre stock. Ou demandez-moi de créer un devis.',
// //         },
// //       ]);
// //     } catch (err) {
// //       setMessages([{ id: 'welcome', role: 'assistant', text: 'Bonjour 👋' }]);
// //     }
// //   };

// //   const loadSuggestions = async () => {
// //     try {
// //       const data = await assistantApi.suggestions();
// //       setSuggestions(Array.isArray(data) ? data : []);
// //     } catch (err) { /* silent */ }
// //   };

// //   const saveHistory = async (all) => {
// //     try {
// //       await storage.setItem(STORAGE_KEY, JSON.stringify(all.slice(-MAX_HISTORY)));
// //     } catch (err) { /* silent */ }
// //   };

// //   const clearHistory = async () => {
// //     Alert.alert('Effacer', 'Effacer la conversation ?', [
// //       { text: 'Annuler', style: 'cancel' },
// //       {
// //         text: 'Effacer', style: 'destructive',
// //         onPress: async () => {
// //           await storage.removeItem(STORAGE_KEY);
// //           await loadHistory();
// //         },
// //       },
// //     ]);
// //   };

// //   useEffect(() => {
// //     if (isOpen) {
// //       loadHistory();
// //       loadSuggestions();
// //     }
// //   }, [isOpen]);

// //   const send = async (text) => {
// //     const trimmed = (text || input).trim();
// //     if (!trimmed || sending) return;

// //     const userMsg = { id: `u-${Date.now()}`, role: 'user', text: trimmed };
// //     const nextMessages = [...messages, userMsg];
// //     setMessages(nextMessages);
// //     setInput('');
// //     setSending(true);

// //     const recentHistory = nextMessages
// //       .slice(-6)
// //       .filter((m) => m.role === 'user' || m.role === 'assistant')
// //       .map((m) => ({ role: m.role, text: m.text }));

// //     try {
// //       const data = await assistantApi.chat(trimmed, recentHistory);

// //       if (data.response?.isPendingAction) {
// //         const draftMsg = {
// //           id: `d-${Date.now()}`,
// //           role: 'draft',
// //           draft: data.response.draft,
// //           text: data.response.message || data.response.draft?.summary,
// //         };
// //         const updated = [...nextMessages, draftMsg];
// //         setMessages(updated);
// //         await saveHistory(updated);
// //         return;
// //       }

// //       const textResponse =
// //         typeof data.response === 'string'
// //           ? data.response
// //           : data.response?.message || 'Pas de réponse.';

// //       const assistantMsg = { id: `a-${Date.now()}`, role: 'assistant', text: textResponse };
// //       const updated = [...nextMessages, assistantMsg];
// //       setMessages(updated);
// //       await saveHistory(updated);
// //     } catch (err) {
// //       setMessages((prev) => [...prev, {
// //         id: `e-${Date.now()}`,
// //         role: 'system',
// //         text: '❌ ' + (err.response?.data?.error || err.message || 'Erreur'),
// //       }]);
// //     } finally {
// //       setSending(false);
// //     }
// //   };

// //   const onDraftConfirmed = (data) => {
// //     setMessages((prev) => [...prev, {
// //       id: `s-${Date.now()}`,
// //       role: 'assistant',
// //       text: '✅ Action effectuée avec succès.' + (data?.result?.id ? ` (ID ${data.result.id})` : ''),
// //     }]);
// //   };

// //   const onDraftCancelled = () => {
// //     setMessages((prev) => [...prev, {
// //       id: `c-${Date.now()}`,
// //       role: 'system',
// //       text: 'Action annulée.',
// //     }]);
// //   };

// //   return (
// //     <>
// //       {/* Bulle flottante */}
// //       <TouchableOpacity
// //         style={styles.bubble}
// //         onPress={toggle}
// //         activeOpacity={0.85}
// //       >
// //         <Text style={styles.bubbleIcon}>💬</Text>
// //       </TouchableOpacity>

// //       {/* Panneau chat overlay */}
// //       <Modal
// //         visible={isOpen}
// //         transparent
// //         animationType="slide"
// //         onRequestClose={close}
// //       >
// //         <View style={styles.overlay}>
// //           <KeyboardAvoidingView
// //             style={{ flex: 1, justifyContent: 'flex-end' }}
// //             behavior={Platform.OS === 'ios' ? 'padding' : undefined}
// //           >
// //             <View style={styles.panel}>
// //               {/* Header */}
// //               <View style={styles.header}>
// //                 <View style={styles.headerLeft}>
// //                   <View style={styles.dot} />
// //                   <Text style={styles.headerTitle}>Assistant IA</Text>
// //                 </View>
// //                 <View style={styles.headerActions}>
// //                   <TouchableOpacity style={styles.headerBtn} onPress={clearHistory}>
// //                     <Text style={styles.headerBtnText}>🗑</Text>
// //                   </TouchableOpacity>
// //                   <TouchableOpacity style={styles.headerBtn} onPress={close}>
// //                     <Text style={styles.headerBtnText}>✕</Text>
// //                   </TouchableOpacity>
// //                 </View>
// //               </View>

// //               {/* Messages */}
// //               <ScrollView
// //                 ref={scrollRef}
// //                 style={styles.messages}
// //                 contentContainerStyle={styles.messagesContent}
// //                 onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
// //               >
// //                 {messages.map((m) => {
// //                   if (m.role === 'draft' && m.draft) {
// //                     return (
// //                       <DraftCard key={m.id} draft={m.draft}
// //                         onConfirmed={onDraftConfirmed}
// //                         onCancelled={onDraftCancelled} />
// //                     );
// //                   }
// //                   return <AssistantMessage key={m.id} role={m.role} text={m.text} />;
// //                 })}

// //                 {sending && (
// //                   <View style={styles.typing}>
// //                     <ActivityIndicator size="small" color={colors.accent} />
// //                     <Text style={styles.typingText}>L'assistant réfléchit...</Text>
// //                   </View>
// //                 )}
// //               </ScrollView>

// //               {/* Suggestions rapides */}
// //               {messages.length <= 1 && (
// //                 <ScrollView
// //                   horizontal
// //                   showsHorizontalScrollIndicator={false}
// //                   contentContainerStyle={styles.suggestions}
// //                 >
// //                   {SUGGESTIONS.map((s, i) => (
// //                     <TouchableOpacity
// //                       key={i}
// //                       style={styles.suggestionBtn}
// //                       onPress={() => send(s)}
// //                       activeOpacity={0.7}
// //                     >
// //                       <Text style={styles.suggestionText}>{s}</Text>
// //                     </TouchableOpacity>
// //                   ))}
// //                 </ScrollView>
// //               )}

// //               {/* Input + actions */}
// //               <View style={styles.inputBar}>
// //                 <TextInput
// //                   style={styles.input}
// //                   value={input}
// //                   onChangeText={setInput}
// //                   placeholder="Posez votre question..."
// //                   placeholderTextColor={colors.textMuted}
// //                   multiline
// //                   maxLength={2000}
// //                 />
// //                 <TouchableOpacity
// //                   style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
// //                   onPress={() => send()}
// //                   disabled={!input.trim() || sending}
// //                   activeOpacity={0.7}
// //                 >
// //                   {sending ? (
// //                     <ActivityIndicator size="small" color="#0b1120" />
// //                   ) : (
// //                     <Text style={styles.sendIcon}>➤</Text>
// //                   )}
// //                 </TouchableOpacity>
// //               </View>
// //             </View>
// //           </KeyboardAvoidingView>
// //         </View>
// //       </Modal>
// //     </>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   bubble: {
// //     position: 'absolute',
// //     bottom: 100,
// //     right: 20,
// //     width: 60,
// //     height: 60,
// //     borderRadius: 30,
// //     backgroundColor: colors.accent,
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 8 },
// //     shadowOpacity: 0.35,
// //     shadowRadius: 16,
// //     elevation: 8,
// //     zIndex: 9000,
// //   },
// //   bubbleIcon: { fontSize: 26 },
// //   overlay: {
// //     flex: 1,
// //     backgroundColor: 'rgba(0,0,0,0.5)',
// //   },
// //   panel: {
// //     backgroundColor: colors.bg,
// //     borderTopLeftRadius: radius.xl,
// //     borderTopRightRadius: radius.xl,
// //     height: '85%',
// //     borderTopWidth: 2,
// //     borderTopColor: colors.accent,
// //   },
// //   header: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     paddingHorizontal: spacing.lg,
// //     paddingVertical: spacing.md,
// //     borderBottomWidth: 1,
// //     borderBottomColor: colors.border,
// //     backgroundColor: colors.bgCard,
// //     borderTopLeftRadius: radius.xl,
// //     borderTopRightRadius: radius.xl,
// //   },
// //   headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
// //   dot: {
// //     width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success,
// //   },
// //   headerTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700' },
// //   headerActions: { flexDirection: 'row', gap: spacing.sm },
// //   headerBtn: {
// //     width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
// //     borderRadius: radius.full, backgroundColor: colors.bgInput,
// //   },
// //   headerBtnText: { color: colors.text, fontSize: 14, fontWeight: '700' },
// //   messages: { flex: 1 },
// //   messagesContent: { padding: spacing.lg },
// //   typing: {
// //     flexDirection: 'row', alignItems: 'center',
// //     gap: spacing.sm, paddingVertical: spacing.md,
// //   },
// //   typingText: { color: colors.textMuted, fontSize: fontSize.xs, fontStyle: 'italic' },
// //   suggestions: {
// //     paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
// //     gap: spacing.sm, flexDirection: 'row', alignItems: 'center',
// //   },
// //   suggestionBtn: {
// //     paddingHorizontal: spacing.md, paddingVertical: 8,
// //     borderRadius: radius.full, borderWidth: 1,
// //     borderColor: colors.borderLight, backgroundColor: colors.bgCard,
// //     height: 36, justifyContent: 'center',
// //   },
// //   suggestionText: { color: colors.textSecondary, fontSize: 11, fontWeight: '600' },
// //   inputBar: {
// //     flexDirection: 'row', alignItems: 'flex-end',
// //     paddingHorizontal: spacing.md, paddingVertical: spacing.md,
// //     borderTopWidth: 1, borderTopColor: colors.border,
// //     backgroundColor: colors.bgCard, gap: spacing.sm,
// //   },
// //   input: {
// //     flex: 1, backgroundColor: colors.bgInput, borderWidth: 1,
// //     borderColor: colors.borderLight, borderRadius: radius.lg,
// //     paddingHorizontal: spacing.md, paddingVertical: 10,
// //     color: colors.text, fontSize: fontSize.sm, maxHeight: 100,
// //   },
// //   sendBtn: {
// //     width: 44, height: 44, borderRadius: 22,
// //     backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center',
// //   },
// //   sendBtnDisabled: { backgroundColor: colors.bgInput, opacity: 0.6 },
// //   sendIcon: { color: '#0b1120', fontSize: 18, fontWeight: '800' },
// // });

// import { TouchableOpacity, Text, StyleSheet, Modal, View, KeyboardAvoidingView, Platform } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { colors, radius } from '../lib/theme';
// import AssistantChat from './AssistantChat';
// import { useAssistant } from './AssistantProvider';

// export default function AssistantBubble() {
//   const { isOpen, close, toggle } = useAssistant();

//   return (
//     <>
//       {/* Bulle flottante */}
//       <TouchableOpacity
//         style={styles.bubble}
//         onPress={toggle}
//         activeOpacity={0.85}
//       >
//         <Text style={styles.bubbleIcon}>💬</Text>
//       </TouchableOpacity>

//       {/* Panneau chat par-dessus */}
//       <Modal
//         visible={isOpen}
//         transparent
//         animationType="slide"
//         onRequestClose={close}
//       >
//         <View style={styles.overlay}>
//           <KeyboardAvoidingView
//             style={{ flex: 1, justifyContent: 'flex-end' }}
//             behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//           >
//             <SafeAreaView style={styles.panel} edges={['top']}>
//               {/* Bouton fermer en haut */}
//               <TouchableOpacity style={styles.closeBtn} onPress={close}>
//                 <Text style={styles.closeBtnText}>✕</Text>
//               </TouchableOpacity>
//               <AssistantChat />
//             </SafeAreaView>
//           </KeyboardAvoidingView>
//         </View>
//       </Modal>
//     </>
//   );
// }

// const styles = StyleSheet.create({
//   bubble: {
//     position: 'absolute',
//     bottom: 100,
//     right: 20,
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: colors.accent,
//     alignItems: 'center',
//     justifyContent: 'center',
//     zIndex: 9000,
//     elevation: 8,
//   },
//   bubbleIcon: { fontSize: 26 },
//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//   },
//   panel: {
//     backgroundColor: colors.bg,
//     borderTopLeftRadius: radius.xl,
//     borderTopRightRadius: radius.xl,
//     height: '85%',
//     borderTopWidth: 2,
//     borderTopColor: colors.accent,
//   },
//   closeBtn: {
//     position: 'absolute',
//     top: 12,
//     right: 12,
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: colors.bgInput,
//     alignItems: 'center',
//     justifyContent: 'center',
//     zIndex: 10,
//     borderWidth: 1,
//     borderColor: colors.borderLight,
//   },
//   closeBtnText: { color: colors.text, fontSize: 16, fontWeight: '700' },
// });
import { TouchableOpacity, Text, StyleSheet, Modal, View, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius } from '../lib/theme';
import AssistantChat from './AssistantChat';
import { useAssistant } from './AssistantProvider';

export default function AssistantBubble() {
  const { isOpen, close, toggle } = useAssistant();

  return (
    <>
      <TouchableOpacity style={styles.bubble} onPress={toggle} activeOpacity={0.85}>
        <Text style={styles.bubbleIcon}>💬</Text>
      </TouchableOpacity>

      <Modal visible={isOpen} transparent animationType="slide" onRequestClose={close}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            style={{ flex: 1, justifyContent: 'flex-end' }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <SafeAreaView style={styles.panel} edges={['top']}>
              <TouchableOpacity style={styles.closeBtn} onPress={close}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
              <AssistantChat />
            </SafeAreaView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9000,
    elevation: 8,
  },
  bubbleIcon: { fontSize: 26 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  panel: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    height: '85%',
    borderTopWidth: 2,
    borderTopColor: colors.accent,
  },
  closeBtn: {
    position: 'absolute', top: 12, right: 12,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.bgInput,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 10, borderWidth: 1, borderColor: colors.borderLight,
  },
  closeBtnText: { color: colors.text, fontSize: 16, fontWeight: '700' },
});