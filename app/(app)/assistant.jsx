// // // import { useState, useRef, useEffect } from 'react';
// // // import {
// // //   View, Text, StyleSheet, ScrollView, TextInput,
// // //   TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator,
// // // } from 'react-native';
// // // import { SafeAreaView } from 'react-native-safe-area-context';
// // // import { useFocusEffect } from 'expo-router';
// // // import { useCallback } from 'react';
// // // import { assistantApi } from '../../lib/api';
// // // import { storage } from '../../lib/api';
// // // import { useAuth } from '../../lib/auth';
// // // import { colors, spacing, fontSize, radius } from '../../lib/theme';
// // // import Header from '../../components/Header';
// // // import AssistantMessage from '../../components/AssistantMessage';
// // // import DraftCard from '../../components/DraftCard';

// // // const STORAGE_KEY = 'devis_assistant_history';
// // // const MAX_HISTORY = 40;

// // // const SUGGESTIONS = [
// // //   'Combien j\'ai de produits ?',
// // //   'Quel est mon chiffre d\'affaires ?',
// // //   'Cherche un client',
// // //   'Est-ce que j\'ai des alertes de stock ?',
// // // ];

// // // export default function AssistantScreen() {
// // //   const { user } = useAuth();
// // //   const scrollRef = useRef(null);

// // //   const [messages, setMessages] = useState([]);
// // //   const [input, setInput] = useState('');
// // //   const [sending, setSending] = useState(false);

// // //   // ---------------------------------------------------------
// // //   // Historique (persistant)
// // //   // ---------------------------------------------------------
// // //   const loadHistory = async () => {
// // //     try {
// // //       const raw = await storage.getItem(STORAGE_KEY);
// // //       if (raw) {
// // //         const parsed = JSON.parse(raw);
// // //         setMessages(Array.isArray(parsed) ? parsed : []);
// // //         return;
// // //       }
// // //       // Message d'accueil par défaut
// // //       setMessages([
// // //         {
// // //           id: 'welcome',
// // //           role: 'assistant',
// // //           text:
// // //             'Bonjour 👋 Je suis votre assistant. Posez-moi une question sur votre catalogue, vos clients, vos devis, votre stock. Ou demandez-moi de créer un devis.',
// // //         },
// // //       ]);
// // //     } catch (err) {
// // //       setMessages([
// // //         {
// // //           id: 'welcome',
// // //           role: 'assistant',
// // //           text: 'Bonjour 👋 Comment puis-je vous aider ?',
// // //         },
// // //       ]);
// // //     }
// // //   };

// // //   const saveHistory = async (all) => {
// // //     try {
// // //       const trimmed = all.slice(-MAX_HISTORY);
// // //       await storage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
// // //     } catch (err) {
// // //       console.warn('saveHistory error:', err.message);
// // //     }
// // //   };

// // //   const clearHistory = async () => {
// // //     await storage.removeItem(STORAGE_KEY);
// // //     await loadHistory();
// // //   };

// // //   useFocusEffect(
// // //     useCallback(() => {
// // //       loadHistory();
// // //     }, [])
// // //   );

// // //   // ---------------------------------------------------------
// // //   // Envoi d'un message
// // //   // ---------------------------------------------------------
// // //   const send = async (text) => {
// // //     const trimmed = (text || input).trim();
// // //     if (!trimmed || sending) return;

// // //     const userMsg = {
// // //       id: `u-${Date.now()}`,
// // //       role: 'user',
// // //       text: trimmed,
// // //     };
// // //     const nextMessages = [...messages, userMsg];
// // //     setMessages(nextMessages);
// // //     setInput('');
// // //     setSending(true);

// // //     // Historique récent à envoyer au backend
// // //     const recentHistory = nextMessages
// // //       .slice(-6)
// // //       .filter((m) => m.role === 'user' || m.role === 'assistant')
// // //       .map((m) => ({ role: m.role, text: m.text }));

// // //     try {
// // //       const data = await assistantApi.chat(trimmed, recentHistory);

// // //       // Cas 1 : action à confirmer (draft)
// // //       if (data.response?.isPendingAction) {
// // //         const draftMsg = {
// // //           id: `d-${Date.now()}`,
// // //           role: 'draft',
// // //           draft: data.response.draft,
// // //           text: data.response.message || data.response.draft?.summary,
// // //         };
// // //         const updated = [...nextMessages, draftMsg];
// // //         setMessages(updated);
// // //         await saveHistory(updated);
// // //         return;
// // //       }

// // //       // Cas 2 : réponse texte simple
// // //       const textResponse =
// // //         typeof data.response === 'string'
// // //           ? data.response
// // //           : data.response?.message || 'Pas de réponse.';

// // //       const assistantMsg = {
// // //         id: `a-${Date.now()}`,
// // //         role: 'assistant',
// // //         text: textResponse,
// // //       };
// // //       const updated = [...nextMessages, assistantMsg];
// // //       setMessages(updated);
// // //       await saveHistory(updated);
// // //     } catch (err) {
// // //       const errMsg = {
// // //         id: `e-${Date.now()}`,
// // //         role: 'system',
// // //         text: '❌ ' + (err.response?.data?.error || err.message || 'Erreur'),
// // //       };
// // //       setMessages((prev) => [...prev, errMsg]);
// // //     } finally {
// // //       setSending(false);
// // //     }
// // //   };

// // //   // ---------------------------------------------------------
// // //   // Callbacks DraftCard
// // //   // ---------------------------------------------------------
// // //   const onDraftConfirmed = (data) => {
// // //     // Marque visuellement que c'est fait + ajoute un message de succès
// // //     const successMsg = {
// // //       id: `s-${Date.now()}`,
// // //       role: 'assistant',
// // //       text:
// // //         '✅ Action effectuée avec succès.' +
// // //         (data?.result?.id ? ` (ID ${data.result.id})` : ''),
// // //     };
// // //     setMessages((prev) => [...prev, successMsg]);
// // //   };

// // //   const onDraftCancelled = () => {
// // //     const cancelMsg = {
// // //       id: `c-${Date.now()}`,
// // //       role: 'system',
// // //       text: 'Action annulée.',
// // //     };
// // //     setMessages((prev) => [...prev, cancelMsg]);
// // //   };

// // //   return (
// // //     <SafeAreaView style={styles.safe} edges={['top']}>
// // //       <Header
// // //         title="Assistant IA"
// // //         right={
// // //           <TouchableOpacity onPress={clearHistory}>
// // //             <Text style={styles.clearText}>Effacer</Text>
// // //           </TouchableOpacity>
// // //         }
// // //       />

// // //       <KeyboardAvoidingView
// // //         style={{ flex: 1 }}
// // //         behavior={Platform.OS === 'ios' ? 'padding' : undefined}
// // //         keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
// // //       >
// // //         <ScrollView
// // //           ref={scrollRef}
// // //           contentContainerStyle={styles.messagesContent}
// // //           onContentSizeChange={() =>
// // //             scrollRef.current?.scrollToEnd({ animated: true })
// // //           }
// // //         >
// // //           {messages.map((m) => {
// // //             if (m.role === 'draft' && m.draft) {
// // //               return (
// // //                 <DraftCard
// // //                   key={m.id}
// // //                   draft={m.draft}
// // //                   onConfirmed={onDraftConfirmed}
// // //                   onCancelled={onDraftCancelled}
// // //                 />
// // //               );
// // //             }
// // //             return (
// // //               <AssistantMessage key={m.id} role={m.role} text={m.text} />
// // //             );
// // //           })}

// // //           {sending ? (
// // //             <View style={styles.typing}>
// // //               <ActivityIndicator size="small" color={colors.accent} />
// // //               <Text style={styles.typingText}>L'assistant réfléchit...</Text>
// // //             </View>
// // //           ) : null}
// // //         </ScrollView>

// // //         {/* Zone fixe en bas : suggestions + input */}
// // //         <View style={styles.bottomArea}>
// // //           {messages.length <= 1 ? (
// // //             <ScrollView
// // //               horizontal
// // //               showsHorizontalScrollIndicator={false}
// // //               contentContainerStyle={styles.suggestions}
// // //               style={styles.suggestionsScroll}
// // //             >
// // //               {SUGGESTIONS.map((s, i) => (
// // //                 <TouchableOpacity
// // //                   key={i}
// // //                   style={styles.suggestionBtn}
// // //                   onPress={() => send(s)}
// // //                   activeOpacity={0.7}
// // //                 >
// // //                   <Text style={styles.suggestionText}>{s}</Text>
// // //                 </TouchableOpacity>
// // //               ))}
// // //             </ScrollView>
// // //           ) : null}

// // //         {/* Barre de saisie */}
// // //         <View style={styles.inputBar}>
// // //           <TextInput
// // //             style={styles.input}
// // //             value={input}
// // //             onChangeText={setInput}
// // //             placeholder="Posez votre question..."
// // //             placeholderTextColor={colors.textMuted}
// // //             multiline
// // //             maxLength={2000}
// // //             onSubmitEditing={() => send()}
// // //           />
// // //           <TouchableOpacity
// // //             style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
// // //             onPress={() => send()}
// // //             disabled={!input.trim() || sending}
// // //             activeOpacity={0.7}
// // //           >
// // //             {sending ? (
// // //               <ActivityIndicator size="small" color="#0b1120" />
// // //             ) : (
// // //               <Text style={styles.sendIcon}>➤</Text>
// // //             )}
// // //           </TouchableOpacity>
// // //           </View>
// // //         </View>
// // //       </KeyboardAvoidingView>
// // //     </SafeAreaView>
// // //   );
// // // }

// // // const styles = StyleSheet.create({
// // //   safe: { flex: 1, backgroundColor: colors.bg },
// // //   clearText: {
// // //     color: colors.error,
// // //     fontSize: fontSize.xs,
// // //     fontWeight: '600',
// // //   },
// // //   messagesContent: {
// // //     padding: spacing.lg,
// // //     paddingBottom: spacing.md,
// // //   },
// // //   typing: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     gap: spacing.sm,
// // //     padding: spacing.md,
// // //   },
// // //   typingText: {
// // //     color: colors.textMuted,
// // //     fontSize: fontSize.xs,
// // //     fontStyle: 'italic',
// // //   },
// // //   bottomArea: {
// // //     borderTopWidth: 1,
// // //     borderTopColor: colors.border,
// // //     backgroundColor: colors.bgCard,
// // //   },
// // //   suggestionsScroll: {
// // //     maxHeight: 44,
// // //     borderBottomWidth: 1,
// // //     borderBottomColor: colors.border,
// // //   },
// // //   suggestions: {
// // //     paddingHorizontal: spacing.lg,
// // //     paddingVertical: spacing.sm,
// // //     gap: spacing.sm,
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //   },
// // //   suggestionBtn: {
// // //     paddingHorizontal: spacing.md,
// // //     paddingVertical: 6,
// // //     borderRadius: radius.full,
// // //     borderWidth: 1,
// // //     borderColor: colors.borderLight,
// // //     backgroundColor: colors.bgCard,
// // //     height: 32,
// // //     justifyContent: 'center',
// // //     alignItems: 'center',
// // //   },
// // //   suggestionText: {
// // //     color: colors.textSecondary,
// // //     fontSize: 11,
// // //     fontWeight: '600',
// // //     lineHeight: 14,
// // //   },
// // //   inputBar: {
// // //     flexDirection: 'row',
// // //     alignItems: 'flex-end',
// // //     paddingHorizontal: spacing.md,
// // //     paddingVertical: spacing.md,
// // //     backgroundColor: colors.bgCard,
// // //     gap: spacing.sm,
// // //   },
// // //   input: {
// // //     flex: 1,
// // //     backgroundColor: colors.bgInput,
// // //     borderWidth: 1,
// // //     borderColor: colors.borderLight,
// // //     borderRadius: radius.lg,
// // //     paddingHorizontal: spacing.md,
// // //     paddingVertical: 10,
// // //     color: colors.text,
// // //     fontSize: fontSize.sm,
// // //     maxHeight: 100,
// // //   },
// // //   sendBtn: {
// // //     width: 44,
// // //     height: 44,
// // //     borderRadius: radius.full,
// // //     backgroundColor: colors.accent,
// // //     alignItems: 'center',
// // //     justifyContent: 'center',
// // //   },
// // //   sendBtnDisabled: {
// // //     backgroundColor: colors.bgInput,
// // //     opacity: 0.6,
// // //   },
// // //   sendIcon: {
// // //     color: '#0b1120',
// // //     fontSize: 18,
// // //     fontWeight: '800',
// // //   },
// // // });
// // import { useState, useRef, useEffect, useCallback } from 'react';
// // import {
// //   View, Text, StyleSheet, ScrollView, TextInput,
// //   TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
// // } from 'react-native';
// // import { SafeAreaView } from 'react-native-safe-area-context';
// // import { useFocusEffect } from 'expo-router';
// // import { assistantApi, storage } from '../../lib/api';
// // import { useAuth } from '../../lib/auth';
// // import { colors, spacing, fontSize, radius } from '../../lib/theme';
// // import Header from '../../components/Header';
// // import AssistantMessage from '../../components/AssistantMessage';
// // import DraftCard from '../../components/DraftCard';

// // const STORAGE_KEY = 'devis_assistant_history';
// // const MAX_HISTORY = 40;

// // const SUGGESTIONS = [
// //   'Combien j\'ai de produits ?',
// //   'Quel est mon chiffre d\'affaires ?',
// //   'Cherche un client',
// //   'Est-ce que j\'ai des alertes de stock ?',
// // ];

// // export default function AssistantScreen() {
// //   const { user } = useAuth();
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
// //     } catch (err) {
// //       // silent
// //     }
// //   };

// //   const saveHistory = async (all) => {
// //     try {
// //       const trimmed = all.slice(-MAX_HISTORY);
// //       await storage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
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

// //   useFocusEffect(
// //     useCallback(() => {
// //       loadHistory();
// //       loadSuggestions();
// //     }, [])
// //   );

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
// //       const errMsg = {
// //         id: `e-${Date.now()}`,
// //         role: 'system',
// //         text: '❌ ' + (err.response?.data?.error || err.message || 'Erreur'),
// //       };
// //       setMessages((prev) => [...prev, errMsg]);
// //     } finally {
// //       setSending(false);
// //     }
// //   };

// //   const onDraftConfirmed = (data) => {
// //     const successMsg = {
// //       id: `s-${Date.now()}`,
// //       role: 'assistant',
// //       text: '✅ Action effectuée avec succès.' + (data?.result?.id ? ` (ID ${data.result.id})` : ''),
// //     };
// //     setMessages((prev) => [...prev, successMsg]);
// //   };

// //   const onDraftCancelled = () => {
// //     setMessages((prev) => [...prev, {
// //       id: `c-${Date.now()}`,
// //       role: 'system',
// //       text: 'Action annulée.',
// //     }]);
// //   };

// //   const acceptSuggestion = async (sug) => {
// //     try {
// //       await assistantApi.acceptSuggestion(sug.id);
// //       Alert.alert('Succès', 'Préférence mémorisée');
// //       await loadSuggestions();
// //     } catch (err) {
// //       Alert.alert('Erreur', err.response?.data?.error || err.message);
// //     }
// //   };

// //   const dismissSuggestion = async (sug) => {
// //     try {
// //       await assistantApi.dismissSuggestion(sug.id);
// //       await loadSuggestions();
// //     } catch (err) {
// //       Alert.alert('Erreur', err.response?.data?.error || err.message);
// //     }
// //   };

// //   const renderSuggestionCard = (sug) => {
// //     const typeLabels = {
// //       hourly_rate: 'Taux horaire',
// //       margin: 'Marge',
// //       vat_rate: 'TVA',
// //       payment_terms: 'Conditions de paiement',
// //     };
// //     const contextLabel = sug.context ? ` en ${sug.context}` : '';
// //     const message =
// //       sug.observationType === 'hourly_rate'
// //         ? `J'ai remarqué que vous facturez ${sug.newValue} €/h${contextLabel} depuis ${sug.count} devis. Mémoriser ce taux ?`
// //         : `Mémoriser la préférence ${typeLabels[sug.observationType] || sug.observationType} à ${sug.newValue} ?`;

// //     return (
// //       <View key={sug.id} style={styles.sugCard}>
// //         <Text style={styles.sugTitle}>💡 Suggestion d'apprentissage</Text>
// //         <Text style={styles.sugMessage}>{message}</Text>
// //         <View style={styles.sugActions}>
// //           <TouchableOpacity style={[styles.sugBtn, styles.sugBtnAccept]}
// //             onPress={() => acceptSuggestion(sug)} activeOpacity={0.7}>
// //             <Text style={styles.sugBtnAcceptText}>✓ Mémoriser</Text>
// //           </TouchableOpacity>
// //           <TouchableOpacity style={[styles.sugBtn, styles.sugBtnDismiss]}
// //             onPress={() => dismissSuggestion(sug)} activeOpacity={0.7}>
// //             <Text style={styles.sugBtnDismissText}>✗ Ignorer</Text>
// //           </TouchableOpacity>
// //         </View>
// //       </View>
// //     );
// //   };

// //   return (
// //     <SafeAreaView style={styles.safe} edges={['top']}>
// //       <Header
// //         title="Assistant IA"
// //         right={
// //           <TouchableOpacity onPress={clearHistory}>
// //             <Text style={styles.clearText}>Effacer</Text>
// //           </TouchableOpacity>
// //         }
// //       />

// //       <KeyboardAvoidingView
// //         style={{ flex: 1 }}
// //         behavior={Platform.OS === 'ios' ? 'padding' : undefined}
// //         keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
// //       >
// //         <ScrollView
// //           ref={scrollRef}
// //           contentContainerStyle={styles.messagesContent}
// //           onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
// //         >
// //           {messages.map((m) => {
// //             if (m.role === 'draft' && m.draft) {
// //               return (
// //                 <DraftCard key={m.id} draft={m.draft}
// //                   onConfirmed={onDraftConfirmed}
// //                   onCancelled={onDraftCancelled} />
// //               );
// //             }
// //             return <AssistantMessage key={m.id} role={m.role} text={m.text} />;
// //           })}

// //           {suggestions.length > 0 && (
// //             <>
// //               <Text style={styles.sugSectionTitle}>Suggestions d'apprentissage</Text>
// //               {suggestions.map(renderSuggestionCard)}
// //             </>
// //           )}

// //           {sending && (
// //             <View style={styles.typing}>
// //               <ActivityIndicator size="small" color={colors.accent} />
// //               <Text style={styles.typingText}>L'assistant réfléchit...</Text>
// //             </View>
// //           )}
// //         </ScrollView>

// //         <View style={styles.bottomArea}>
// //           {messages.length <= 1 && (
// //             <ScrollView
// //               horizontal
// //               showsHorizontalScrollIndicator={false}
// //               contentContainerStyle={styles.suggestions}
// //               style={styles.suggestionsScroll}
// //             >
// //               {SUGGESTIONS.map((s, i) => (
// //                 <TouchableOpacity key={i} style={styles.suggestionBtn}
// //                   onPress={() => send(s)} activeOpacity={0.7}>
// //                   <Text style={styles.suggestionText}>{s}</Text>
// //                 </TouchableOpacity>
// //               ))}
// //             </ScrollView>
// //           )}

// //           <View style={styles.inputBar}>
// //             <TextInput
// //               style={styles.input}
// //               value={input}
// //               onChangeText={setInput}
// //               placeholder="Posez votre question..."
// //               placeholderTextColor={colors.textMuted}
// //               multiline
// //               maxLength={2000}
// //             />
// //             <TouchableOpacity
// //               style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
// //               onPress={() => send()}
// //               disabled={!input.trim() || sending}
// //               activeOpacity={0.7}
// //             >
// //               {sending ? (
// //                 <ActivityIndicator size="small" color="#0b1120" />
// //               ) : (
// //                 <Text style={styles.sendIcon}>➤</Text>
// //               )}
// //             </TouchableOpacity>
// //           </View>
// //         </View>
// //       </KeyboardAvoidingView>
// //     </SafeAreaView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   safe: { flex: 1, backgroundColor: colors.bg },
// //   clearText: { color: colors.error, fontSize: fontSize.xs, fontWeight: '600' },
// //   messagesContent: { padding: spacing.lg, paddingBottom: spacing.md },
// //   sugSectionTitle: {
// //     color: colors.textSecondary, fontSize: 10, textTransform: 'uppercase',
// //     fontWeight: '700', letterSpacing: 0.5, marginTop: spacing.lg, marginBottom: spacing.sm,
// //   },
// //   sugCard: {
// //     backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.accent,
// //     borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm,
// //   },
// //   sugTitle: { color: colors.accent, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', marginBottom: 6 },
// //   sugMessage: { color: colors.text, fontSize: fontSize.sm, lineHeight: 18, marginBottom: spacing.md },
// //   sugActions: { flexDirection: 'row', gap: spacing.sm },
// //   sugBtn: { flex: 1, paddingVertical: 8, borderRadius: radius.full, alignItems: 'center' },
// //   sugBtnAccept: { backgroundColor: colors.success },
// //   sugBtnAcceptText: { color: '#0b1120', fontSize: fontSize.xs, fontWeight: '700' },
// //   sugBtnDismiss: { backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.borderLight },
// //   sugBtnDismissText: { color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: '600' },
// //   typing: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md },
// //   typingText: { color: colors.textMuted, fontSize: fontSize.xs, fontStyle: 'italic' },
// //   bottomArea: { borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bgCard },
// //   suggestionsScroll: { maxHeight: 44, borderBottomWidth: 1, borderBottomColor: colors.border },
// //   suggestions: {
// //     paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
// //     gap: spacing.sm, flexDirection: 'row', alignItems: 'center',
// //   },
// //   suggestionBtn: {
// //     paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.full,
// //     borderWidth: 1, borderColor: colors.borderLight, backgroundColor: colors.bgCard,
// //     height: 32, justifyContent: 'center', alignItems: 'center',
// //   },
// //   suggestionText: { color: colors.textSecondary, fontSize: 11, fontWeight: '600', lineHeight: 14 },
// //   inputBar: {
// //     flexDirection: 'row', alignItems: 'flex-end',
// //     paddingHorizontal: spacing.md, paddingVertical: spacing.md,
// //     backgroundColor: colors.bgCard, gap: spacing.sm,
// //   },
// //   input: {
// //     flex: 1, backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.borderLight,
// //     borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: 10,
// //     color: colors.text, fontSize: fontSize.sm, maxHeight: 100,
// //   },
// //   sendBtn: {
// //     width: 44, height: 44, borderRadius: radius.full, backgroundColor: colors.accent,
// //     alignItems: 'center', justifyContent: 'center',
// //   },
// //   sendBtnDisabled: { backgroundColor: colors.bgInput, opacity: 0.6 },
// //   sendIcon: { color: '#0b1120', fontSize: 18, fontWeight: '800' },
// // });

// import { SafeAreaView } from 'react-native-safe-area-context';
// import Header from '../../components/Header';
// import AssistantChat from '../../components/AssistantChat';

// export default function AssistantScreen() {
//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0f1a' }} edges={['top']}>
//       <Header title="Assistant IA" />
//       <AssistantChat />
//     </SafeAreaView>
//   );
// }
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import AssistantChat from '../../components/AssistantChat';
import { colors } from '../../lib/theme';

export default function AssistantScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <Header title="Assistant IA" />
      <AssistantChat />
    </SafeAreaView>
  );
}