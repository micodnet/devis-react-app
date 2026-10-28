// // // import { useRef, useState, useEffect } from 'react';
// // // import {
// // //   View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView,
// // //   ActivityIndicator, Alert,
// // // } from 'react-native';
// // // import { assistantApi, storage } from '../lib/api';
// // // import { colors, spacing, fontSize, radius } from '../lib/theme';
// // // import AssistantMessage from './AssistantMessage';
// // // import DraftCard from './DraftCard';

// // // const STORAGE_KEY = 'devis_assistant_history';
// // // const MAX_HISTORY = 40;

// // // const SUGGESTIONS = [
// // //   'Combien j\'ai de produits ?',
// // //   'Quel est mon chiffre d\'affaires ?',
// // //   'Cherche un client',
// // //   'Est-ce que j\'ai des alertes de stock ?',
// // //   'Crée un devis',
// // //   'Résumé de mon activité',
// // // ];

// // // export default function AssistantChat({ compact = false }) {
// // //   const scrollRef = useRef(null);
// // //   const [messages, setMessages] = useState([]);
// // //   const [input, setInput] = useState('');
// // //   const [sending, setSending] = useState(false);
// // //   const [recording, setRecording] = useState(false);
// // //   const [audioEnabled, setAudioEnabled] = useState(false);
// // //   const [ttsEnabled, setTtsEnabled] = useState(false);

// // //   // Charger l'historique au démarrage
// // //   const loadHistory = async () => {
// // //     try {
// // //       const raw = await storage.getItem(STORAGE_KEY);
// // //       if (raw) {
// // //         const parsed = JSON.parse(raw);
// // //         setMessages(Array.isArray(parsed) ? parsed : []);
// // //         return;
// // //       }
// // //       setMessages([
// // //         {
// // //           id: 'welcome',
// // //           role: 'assistant',
// // //           text: 'Bonjour 👋 Je suis votre assistant. Posez-moi une question, dictez-moi une tâche (🎤), ou demandez-moi de créer un devis.',
// // //         },
// // //       ]);
// // //     } catch (err) {
// // //       setMessages([{ id: 'welcome', role: 'assistant', text: 'Bonjour 👋' }]);
// // //     }
// // //   };

// // //   useEffect(() => { loadHistory(); }, []);

// // //   const saveHistory = async (all) => {
// // //     try {
// // //       await storage.setItem(STORAGE_KEY, JSON.stringify(all.slice(-MAX_HISTORY)));
// // //     } catch (err) { /* silent */ }
// // //   };

// // //   const speak = (text) => {
// // //     if (!ttsEnabled) return;
// // //     try {
// // //       const Speech = require('expo-speech');
// // //       const clean = String(text)
// // //         .replace(/[*_`#>]/g, '')
// // //         .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
// // //         .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
// // //         .replace(/\n+/g, '. ')
// // //         .replace(/\s+/g, ' ')
// // //         .trim();
// // //       if (!clean) return;
// // //       Speech.stop();
// // //       Speech.speak(clean, { language: 'fr-FR', rate: 1.0 });
// // //     } catch (err) { /* silent */ }
// // //   };

// // //   const send = async (text) => {
// // //     const trimmed = (text || input).trim();
// // //     if (!trimmed || sending) return;

// // //     const userMsg = { id: `u-${Date.now()}`, role: 'user', text: trimmed };
// // //     const nextMessages = [...messages, userMsg];
// // //     setMessages(nextMessages);
// // //     setInput('');
// // //     setSending(true);

// // //     const recentHistory = nextMessages
// // //       .slice(-6)
// // //       .filter((m) => m.role === 'user' || m.role === 'assistant')
// // //       .map((m) => ({ role: m.role, text: m.text }));

// // //     try {
// // //       const data = await assistantApi.chat(trimmed, recentHistory);

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

// // //       const textResponse =
// // //         typeof data.response === 'string'
// // //           ? data.response
// // //           : data.response?.message || 'Pas de réponse.';

// // //       const assistantMsg = { id: `a-${Date.now()}`, role: 'assistant', text: textResponse };
// // //       const updated = [...nextMessages, assistantMsg];
// // //       setMessages(updated);
// // //       await saveHistory(updated);
// // //       speak(textResponse);
// // //     } catch (err) {
// // //       const msg = '❌ ' + (err.response?.data?.error || err.message || 'Erreur');
// // //       setMessages((prev) => [...prev, { id: `e-${Date.now()}`, role: 'system', text: msg }]);
// // //       speak(msg);
// // //     } finally {
// // //       setSending(false);
// // //     }
// // //   };

// // //   // Micro : reconnaissance vocale via Web Speech API (web) ou placeholder mobile
// // //   const toggleRecording = async () => {
// // //     if (recording) {
// // //       setRecording(false);
// // //       return;
// // //     }
// // //     setRecording(true);

// // //     // Sur web, utiliser l'API native du navigateur
// // //     if (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
// // //       try {
// // //         const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
// // //         const rec = new SR();
// // //         rec.lang = 'fr-FR';
// // //         rec.continuous = false;
// // //         rec.interimResults = false;
// // //         rec.onresult = (event) => {
// // //           const transcript = event.results[0][0].transcript;
// // //           setInput(transcript);
// // //           setRecording(false);
// // //         };
// // //         rec.onerror = () => setRecording(false);
// // //         rec.onend = () => setRecording(false);
// // //         rec.start();
// // //         return;
// // //       } catch (err) {
// // //         setRecording(false);
// // //       }
// // //     }

// // //     // Sur mobile natif : message
// // //     Alert.alert(
// // //       '🎤 Reconnaissance vocale',
// // //       'La reconnaissance vocale native sera disponible avec un développement build. Sur mobile, tapez votre question.'
// // //     );
// // //     setRecording(false);
// // //   };

// // //   const clearHistory = async () => {
// // //     Alert.alert('Effacer', 'Effacer la conversation ?', [
// // //       { text: 'Annuler', style: 'cancel' },
// // //       {
// // //         text: 'Effacer', style: 'destructive',
// // //         onPress: async () => {
// // //           await storage.removeItem(STORAGE_KEY);
// // //           await loadHistory();
// // //         },
// // //       },
// // //     ]);
// // //   };

// // //   const onDraftConfirmed = (data) => {
// // //     setMessages((prev) => [...prev, {
// // //       id: `s-${Date.now()}`,
// // //       role: 'assistant',
// // //       text: '✅ Action effectuée avec succès.' + (data?.result?.id ? ` (ID ${data.result.id})` : ''),
// // //     }]);
// // //   };

// // //   const onDraftCancelled = () => {
// // //     setMessages((prev) => [...prev, {
// // //       id: `c-${Date.now()}`,
// // //       role: 'system',
// // //       text: 'Action annulée.',
// // //     }]);
// // //   };

// // //   return (
// // //     <View style={styles.container}>
// // //       {/* Header avec actions */}
// // //       <View style={styles.header}>
// // //         <View style={styles.headerLeft}>
// // //           <View style={styles.dot} />
// // //           <Text style={styles.headerTitle}>Assistant IA</Text>
// // //         </View>
// // //         <View style={styles.headerActions}>
// // //           <TouchableOpacity
// // //             style={[styles.toggleBtn, ttsEnabled && styles.toggleBtnActive]}
// // //             onPress={() => setTtsEnabled(!ttsEnabled)}
// // //           >
// // //             <Text style={styles.toggleBtnText}>🔊</Text>
// // //           </TouchableOpacity>
// // //           <TouchableOpacity style={styles.toggleBtn} onPress={clearHistory}>
// // //             <Text style={styles.toggleBtnText}>🗑</Text>
// // //           </TouchableOpacity>
// // //         </View>
// // //       </View>

// // //       {/* Messages */}
// // //       <ScrollView
// // //         ref={scrollRef}
// // //         style={styles.messages}
// // //         contentContainerStyle={styles.messagesContent}
// // //         onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
// // //       >
// // //         {messages.map((m) => {
// // //           if (m.role === 'draft' && m.draft) {
// // //             return (
// // //               <DraftCard key={m.id} draft={m.draft}
// // //                 onConfirmed={onDraftConfirmed}
// // //                 onCancelled={onDraftCancelled} />
// // //             );
// // //           }
// // //           return <AssistantMessage key={m.id} role={m.role} text={m.text} />;
// // //         })}

// // //         {sending && (
// // //           <View style={styles.typing}>
// // //             <ActivityIndicator size="small" color={colors.accent} />
// // //             <Text style={styles.typingText}>L'assistant réfléchit...</Text>
// // //           </View>
// // //         )}
// // //       </ScrollView>

// // //       {/* Suggestions rapides */}
// // //       {messages.length <= 1 && (
// // //         <ScrollView
// // //           horizontal
// // //           showsHorizontalScrollIndicator={false}
// // //           contentContainerStyle={styles.suggestions}
// // //         >
// // //           {SUGGESTIONS.map((s, i) => (
// // //             <TouchableOpacity
// // //               key={i}
// // //               style={styles.suggestionBtn}
// // //               onPress={() => send(s)}
// // //               activeOpacity={0.7}
// // //             >
// // //               <Text style={styles.suggestionText}>{s}</Text>
// // //             </TouchableOpacity>
// // //           ))}
// // //         </ScrollView>
// // //       )}

// // //       {/* Input + boutons micro + envoyer */}
// // //       <View style={styles.inputBar}>
// // //         <TouchableOpacity
// // //           style={[styles.micBtn, recording && styles.micBtnRecording]}
// // //           onPress={toggleRecording}
// // //           activeOpacity={0.7}
// // //         >
// // //           <Text style={styles.micBtnText}>{recording ? '⏹' : '🎤'}</Text>
// // //         </TouchableOpacity>

// // //         <TextInput
// // //           style={styles.input}
// // //           value={input}
// // //           onChangeText={setInput}
// // //           placeholder="Posez votre question..."
// // //           placeholderTextColor={colors.textMuted}
// // //           multiline
// // //           maxLength={2000}
// // //         />

// // //         <TouchableOpacity
// // //           style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
// // //           onPress={() => send()}
// // //           disabled={!input.trim() || sending}
// // //           activeOpacity={0.7}
// // //         >
// // //           {sending ? (
// // //             <ActivityIndicator size="small" color="#0b1120" />
// // //           ) : (
// // //             <Text style={styles.sendIcon}>➤</Text>
// // //           )}
// // //         </TouchableOpacity>
// // //       </View>
// // //     </View>
// // //   );
// // // }

// // // const styles = StyleSheet.create({
// // //   container: { flex: 1, backgroundColor: colors.bg },
// // //   header: {
// // //     flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
// // //     paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
// // //     borderBottomWidth: 1, borderBottomColor: colors.border,
// // //     backgroundColor: colors.bgCard,
// // //   },
// // //   headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
// // //   dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
// // //   headerTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700' },
// // //   headerActions: { flexDirection: 'row', gap: spacing.sm },
// // //   toggleBtn: {
// // //     width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
// // //     borderRadius: radius.full, backgroundColor: colors.bgInput,
// // //     borderWidth: 1, borderColor: colors.borderLight,
// // //   },
// // //   toggleBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
// // //   toggleBtnText: { fontSize: 14 },
// // //   messages: { flex: 1 },
// // //   messagesContent: { padding: spacing.lg },
// // //   typing: {
// // //     flexDirection: 'row', alignItems: 'center',
// // //     gap: spacing.sm, paddingVertical: spacing.md,
// // //   },
// // //   typingText: { color: colors.textMuted, fontSize: fontSize.xs, fontStyle: 'italic' },
// // //   suggestions: {
// // //     paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
// // //     gap: spacing.sm, flexDirection: 'row', alignItems: 'center',
// // //   },
// // //   suggestionBtn: {
// // //     paddingHorizontal: spacing.md, paddingVertical: 8,
// // //     borderRadius: radius.full, borderWidth: 1,
// // //     borderColor: colors.borderLight, backgroundColor: colors.bgCard,
// // //     height: 36, justifyContent: 'center',
// // //   },
// // //   suggestionText: { color: colors.textSecondary, fontSize: 11, fontWeight: '600' },
// // //   inputBar: {
// // //     flexDirection: 'row', alignItems: 'flex-end',
// // //     paddingHorizontal: spacing.md, paddingVertical: spacing.md,
// // //     borderTopWidth: 1, borderTopColor: colors.border,
// // //     backgroundColor: colors.bgCard, gap: spacing.sm,
// // //   },
// // //   micBtn: {
// // //     width: 44, height: 44, borderRadius: 22,
// // //     backgroundColor: colors.bgInput, borderWidth: 1,
// // //     borderColor: colors.borderLight,
// // //     alignItems: 'center', justifyContent: 'center',
// // //   },
// // //   micBtnRecording: { backgroundColor: colors.error, borderColor: colors.error },
// // //   micBtnText: { fontSize: 18 },
// // //   input: {
// // //     flex: 1, backgroundColor: colors.bgInput, borderWidth: 1,
// // //     borderColor: colors.borderLight, borderRadius: radius.lg,
// // //     paddingHorizontal: spacing.md, paddingVertical: 10,
// // //     color: colors.text, fontSize: fontSize.sm, maxHeight: 100,
// // //   },
// // //   sendBtn: {
// // //     width: 44, height: 44, borderRadius: 22,
// // //     backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center',
// // //   },
// // //   sendBtnDisabled: { backgroundColor: colors.bgInput, opacity: 0.6 },
// // //   sendIcon: { color: '#0b1120', fontSize: 18, fontWeight: '800' },
// // // });
// // import { useRef, useState, useEffect } from 'react';
// // import {
// //   View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView,
// //   ActivityIndicator, Alert,
// // } from 'react-native';
// // import { assistantApi, storage } from '../lib/api';
// // import { colors, spacing, fontSize, radius } from '../lib/theme';
// // import AssistantMessage from './AssistantMessage';
// // import DraftCard from './DraftCard';

// // const STORAGE_KEY = 'devis_assistant_history';
// // const MAX_HISTORY = 40;

// // const SUGGESTIONS = [
// //   'Combien j\'ai de produits ?',
// //   'Quel est mon chiffre d\'affaires ?',
// //   'Cherche un client',
// //   'Alertes de stock ?',
// //   'Crée un devis',
// //   'Résumé activité',
// // ];

// // export default function AssistantChat() {
// //   const scrollRef = useRef(null);
// //   const [messages, setMessages] = useState([]);
// //   const [input, setInput] = useState('');
// //   const [sending, setSending] = useState(false);
// //   const [recording, setRecording] = useState(false);
// //   const [ttsEnabled, setTtsEnabled] = useState(false);

// //   const loadHistory = async () => {
// //     try {
// //       const raw = await storage.getItem(STORAGE_KEY);
// //       if (raw) {
// //         const parsed = JSON.parse(raw);
// //         setMessages(Array.isArray(parsed) ? parsed : []);
// //         return;
// //       }
// //       setMessages([{
// //         id: 'welcome',
// //         role: 'assistant',
// //         text: 'Bonjour 👋 Je suis votre assistant. Posez-moi une question, dictez-moi une tâche (🎤), ou demandez-moi de créer un devis.',
// //       }]);
// //     } catch (err) {
// //       setMessages([{ id: 'welcome', role: 'assistant', text: 'Bonjour 👋' }]);
// //     }
// //   };

// //   useEffect(() => { loadHistory(); }, []);

// //   const saveHistory = async (all) => {
// //     try {
// //       await storage.setItem(STORAGE_KEY, JSON.stringify(all.slice(-MAX_HISTORY)));
// //     } catch (err) { /* silent */ }
// //   };

// //   const speak = (text) => {
// //     if (!ttsEnabled) return;
// //     try {
// //       const Speech = require('expo-speech');
// //       const clean = String(text)
// //         .replace(/[*_`#>]/g, '')
// //         .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
// //         .replace(/\n+/g, '. ')
// //         .replace(/\s+/g, ' ')
// //         .trim();
// //       if (!clean) return;
// //       Speech.stop();
// //       Speech.speak(clean, { language: 'fr-FR', rate: 1.0 });
// //     } catch (err) { /* silent */ }
// //   };

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
// //       speak(textResponse);
// //     } catch (err) {
// //       const msg = '❌ ' + (err.response?.data?.error || err.message || 'Erreur');
// //       setMessages((prev) => [...prev, { id: `e-${Date.now()}`, role: 'system', text: msg }]);
// //       speak(msg);
// //     } finally {
// //       setSending(false);
// //     }
// //   };

// //   const toggleRecording = async () => {
// //     if (recording) { setRecording(false); return; }
// //     setRecording(true);

// //     if (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
// //       try {
// //         const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
// //         const rec = new SR();
// //         rec.lang = 'fr-FR';
// //         rec.continuous = false;
// //         rec.interimResults = false;
// //         rec.onresult = (event) => {
// //           const transcript = event.results[0][0].transcript;
// //           setInput(transcript);
// //           setRecording(false);
// //         };
// //         rec.onerror = () => setRecording(false);
// //         rec.onend = () => setRecording(false);
// //         rec.start();
// //         return;
// //       } catch (err) { setRecording(false); }
// //     }

// //     Alert.alert(
// //       '🎤 Reconnaissance vocale',
// //       'La reconnaissance vocale native sera disponible avec un développement build. Sur mobile, tapez votre question.'
// //     );
// //     setRecording(false);
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

// //   const onDraftConfirmed = (data) => {
// //     setMessages((prev) => [...prev, {
// //       id: `s-${Date.now()}`, role: 'assistant',
// //       text: '✅ Action effectuée.' + (data?.result?.id ? ` (ID ${data.result.id})` : ''),
// //     }]);
// //   };

// //   const onDraftCancelled = () => {
// //     setMessages((prev) => [...prev, {
// //       id: `c-${Date.now()}`, role: 'system', text: 'Action annulée.',
// //     }]);
// //   };

// //   return (
// //     <View style={styles.container}>
// //       <View style={styles.header}>
// //         <View style={styles.headerLeft}>
// //           <View style={styles.dot} />
// //           <Text style={styles.headerTitle}>Assistant IA</Text>
// //         </View>
// //         <View style={styles.headerActions}>
// //           <TouchableOpacity
// //             style={[styles.toggleBtn, ttsEnabled && styles.toggleBtnActive]}
// //             onPress={() => setTtsEnabled(!ttsEnabled)}
// //           >
// //             <Text style={styles.toggleBtnText}>🔊</Text>
// //           </TouchableOpacity>
// //           <TouchableOpacity style={styles.toggleBtn} onPress={clearHistory}>
// //             <Text style={styles.toggleBtnText}>🗑</Text>
// //           </TouchableOpacity>
// //         </View>
// //       </View>

// //       <ScrollView
// //         ref={scrollRef}
// //         style={styles.messages}
// //         contentContainerStyle={styles.messagesContent}
// //         onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
// //       >
// //         {messages.map((m) => {
// //           if (m.role === 'draft' && m.draft) {
// //             return (
// //               <DraftCard key={m.id} draft={m.draft}
// //                 onConfirmed={onDraftConfirmed} onCancelled={onDraftCancelled} />
// //             );
// //           }
// //           return <AssistantMessage key={m.id} role={m.role} text={m.text} />;
// //         })}
// //         {sending && (
// //           <View style={styles.typing}>
// //             <ActivityIndicator size="small" color={colors.accent} />
// //             <Text style={styles.typingText}>L'assistant réfléchit...</Text>
// //           </View>
// //         )}
// //       </ScrollView>

// //       {messages.length <= 1 && (
// //         <ScrollView
// //           horizontal
// //           showsHorizontalScrollIndicator={false}
// //           contentContainerStyle={styles.suggestions}
// //         >
// //           {SUGGESTIONS.map((s, i) => (
// //             <TouchableOpacity key={i} style={styles.suggestionBtn}
// //               onPress={() => send(s)} activeOpacity={0.7}>
// //               <Text style={styles.suggestionText}>{s}</Text>
// //             </TouchableOpacity>
// //           ))}
// //         </ScrollView>
// //       )}

// //       <View style={styles.inputBar}>
// //         <TouchableOpacity
// //           style={[styles.micBtn, recording && styles.micBtnRecording]}
// //           onPress={toggleRecording} activeOpacity={0.7}>
// //           <Text style={styles.micBtnText}>{recording ? '⏹' : '🎤'}</Text>
// //         </TouchableOpacity>

// //         <TextInput
// //           style={styles.input}
// //           value={input}
// //           onChangeText={setInput}
// //           placeholder="Posez votre question..."
// //           placeholderTextColor={colors.textMuted}
// //           multiline
// //           maxLength={2000}
// //         />

// //         <TouchableOpacity
// //           style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
// //           onPress={() => send()}
// //           disabled={!input.trim() || sending}
// //           activeOpacity={0.7}>
// //           {sending ? (
// //             <ActivityIndicator size="small" color="#0b1120" />
// //           ) : (
// //             <Text style={styles.sendIcon}>➤</Text>
// //           )}
// //         </TouchableOpacity>
// //       </View>
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: { flex: 1, backgroundColor: colors.bg },
// //   header: {
// //     flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
// //     paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
// //     borderBottomWidth: 1, borderBottomColor: colors.border,
// //     backgroundColor: colors.bgCard,
// //   },
// //   headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
// //   dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
// //   headerTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700' },
// //   headerActions: { flexDirection: 'row', gap: spacing.sm },
// //   toggleBtn: {
// //     width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
// //     borderRadius: radius.full, backgroundColor: colors.bgInput,
// //     borderWidth: 1, borderColor: colors.borderLight,
// //   },
// //   toggleBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
// //   toggleBtnText: { fontSize: 14 },
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
// //   micBtn: {
// //     width: 44, height: 44, borderRadius: 22,
// //     backgroundColor: colors.bgInput, borderWidth: 1,
// //     borderColor: colors.borderLight,
// //     alignItems: 'center', justifyContent: 'center',
// //   },
// //   micBtnRecording: { backgroundColor: colors.error, borderColor: colors.error },
// //   micBtnText: { fontSize: 18 },
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
// import { useRef, useState, useEffect } from 'react';
// import {
//   View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView,
//   ActivityIndicator, Alert,
// } from 'react-native';
// import { assistantApi, storage } from '../lib/api';
// import { colors, spacing, fontSize, radius } from '../lib/theme';
// import AssistantMessage from './AssistantMessage';
// import DraftCard from './DraftCard';

// const STORAGE_KEY = 'devis_assistant_history';
// const MAX_HISTORY = 40;

// const SUGGESTIONS = [
//   'Combien j\'ai de produits ?',
//   'Quel est mon chiffre d\'affaires ?',
//   'Cherche un client',
//   'Alertes de stock ?',
//   'Crée un devis',
//   'Résumé activité',
// ];

// export default function AssistantChat() {
//   const scrollRef = useRef(null);
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState('');
//   const [sending, setSending] = useState(false);
//   const [recording, setRecording] = useState(false);
//   const [ttsEnabled, setTtsEnabled] = useState(false);

//   const loadHistory = async () => {
//     try {
//       const raw = await storage.getItem(STORAGE_KEY);
//       if (raw) {
//         const parsed = JSON.parse(raw);
//         setMessages(Array.isArray(parsed) ? parsed : []);
//         return;
//       }
//       setMessages([{
//         id: 'welcome',
//         role: 'assistant',
//         text: 'Bonjour 👋 Je suis votre assistant. Posez-moi une question, dictez-moi une tâche (🎤), ou demandez-moi de créer un devis.',
//       }]);
//     } catch (err) {
//       setMessages([{ id: 'welcome', role: 'assistant', text: 'Bonjour 👋' }]);
//     }
//   };

//   useEffect(() => { loadHistory(); }, []);

//   const saveHistory = async (all) => {
//     try {
//       await storage.setItem(STORAGE_KEY, JSON.stringify(all.slice(-MAX_HISTORY)));
//     } catch (err) { /* silent */ }
//   };

//   const speak = (text) => {
//     if (!ttsEnabled) return;
//     try {
//       const Speech = require('expo-speech');
//       const clean = String(text)
//         .replace(/[*_`#>]/g, '')
//         .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
//         .replace(/\n+/g, '. ')
//         .replace(/\s+/g, ' ')
//         .trim();
//       if (!clean) return;
//       Speech.stop();
//       Speech.speak(clean, { language: 'fr-FR', rate: 1.0 });
//     } catch (err) { /* silent */ }
//   };

//   const send = async (text) => {
//     const trimmed = (text || input).trim();
//     if (!trimmed || sending) return;

//     const userMsg = { id: `u-${Date.now()}`, role: 'user', text: trimmed };
//     const nextMessages = [...messages, userMsg];
//     setMessages(nextMessages);
//     setInput('');
//     setSending(true);

//     const recentHistory = nextMessages
//       .slice(-6)
//       .filter((m) => m.role === 'user' || m.role === 'assistant')
//       .map((m) => ({ role: m.role, text: m.text }));

//     try {
//       const data = await assistantApi.chat(trimmed, recentHistory);

//       if (data.response?.isPendingAction) {
//         const draftMsg = {
//           id: `d-${Date.now()}`,
//           role: 'draft',
//           draft: data.response.draft,
//           text: data.response.message || data.response.draft?.summary,
//         };
//         const updated = [...nextMessages, draftMsg];
//         setMessages(updated);
//         await saveHistory(updated);
//         return;
//       }

//       const textResponse =
//         typeof data.response === 'string'
//           ? data.response
//           : data.response?.message || 'Pas de réponse.';

//       const assistantMsg = { id: `a-${Date.now()}`, role: 'assistant', text: textResponse };
//       const updated = [...nextMessages, assistantMsg];
//       setMessages(updated);
//       await saveHistory(updated);
//       speak(textResponse);
//     } catch (err) {
//       const msg = '❌ ' + (err.response?.data?.error || err.message || 'Erreur');
//       setMessages((prev) => [...prev, { id: `e-${Date.now()}`, role: 'system', text: msg }]);
//       speak(msg);
//     } finally {
//       setSending(false);
//     }
//   };

//   const toggleRecording = async () => {
//     if (recording) { setRecording(false); return; }
//     setRecording(true);

//     if (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
//       try {
//         const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
//         const rec = new SR();
//         rec.lang = 'fr-FR';
//         rec.continuous = false;
//         rec.interimResults = false;
//         rec.onresult = (event) => {
//           const transcript = event.results[0][0].transcript;
//           setInput(transcript);
//           setRecording(false);
//         };
//         rec.onerror = () => setRecording(false);
//         rec.onend = () => setRecording(false);
//         rec.start();
//         return;
//       } catch (err) { setRecording(false); }
//     }

//     Alert.alert(
//       '🎤 Reconnaissance vocale',
//       'La reconnaissance vocale native sera disponible avec un développement build.'
//     );
//     setRecording(false);
//   };

//   const clearHistory = async () => {
//     Alert.alert('Effacer', 'Effacer la conversation ?', [
//       { text: 'Annuler', style: 'cancel' },
//       {
//         text: 'Effacer', style: 'destructive',
//         onPress: async () => {
//           await storage.removeItem(STORAGE_KEY);
//           await loadHistory();
//         },
//       },
//     ]);
//   };

//   const onDraftConfirmed = (data) => {
//     setMessages((prev) => [...prev, {
//       id: `s-${Date.now()}`, role: 'assistant',
//       text: '✅ Action effectuée.' + (data?.result?.id ? ` (ID ${data.result.id})` : ''),
//     }]);
//   };

//   const onDraftCancelled = () => {
//     setMessages((prev) => [...prev, {
//       id: `c-${Date.now()}`, role: 'system', text: 'Action annulée.',
//     }]);
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <View style={styles.headerLeft}>
//           <View style={styles.dot} />
//           <Text style={styles.headerTitle}>Assistant IA</Text>
//         </View>
//         <View style={styles.headerActions}>
//           <TouchableOpacity
//             style={[styles.toggleBtn, ttsEnabled && styles.toggleBtnActive]}
//             onPress={() => setTtsEnabled(!ttsEnabled)}
//           >
//             <Text style={styles.toggleBtnText}>🔊</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.toggleBtn} onPress={clearHistory}>
//             <Text style={styles.toggleBtnText}>🗑</Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       <ScrollView
//         ref={scrollRef}
//         style={styles.messages}
//         contentContainerStyle={styles.messagesContent}
//         onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
//       >
//         {messages.map((m) => {
//           if (m.role === 'draft' && m.draft) {
//             return (
//               <DraftCard key={m.id} draft={m.draft}
//                 onConfirmed={onDraftConfirmed} onCancelled={onDraftCancelled} />
//             );
//           }
//           return <AssistantMessage key={m.id} role={m.role} text={m.text} />;
//         })}
//         {sending && (
//           <View style={styles.typing}>
//             <ActivityIndicator size="small" color={colors.accent} />
//             <Text style={styles.typingText}>L'assistant réfléchit...</Text>
//           </View>
//         )}
//       </ScrollView>

//       <ScrollView
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         contentContainerStyle={styles.suggestions}
//       >
//         {SUGGESTIONS.map((s, i) => (
//           <TouchableOpacity key={i} style={styles.suggestionBtn}
//             onPress={() => send(s)} activeOpacity={0.7}>
//             <Text style={styles.suggestionText}>{s}</Text>
//           </TouchableOpacity>
//         ))}
//       </ScrollView>

//       <View style={styles.inputBar}>
//         <TouchableOpacity
//           style={[styles.micBtn, recording && styles.micBtnRecording]}
//           onPress={toggleRecording} activeOpacity={0.7}>
//           <Text style={styles.micBtnText}>{recording ? '⏹' : '🎤'}</Text>
//         </TouchableOpacity>

//         <TextInput
//           style={styles.input}
//           value={input}
//           onChangeText={setInput}
//           placeholder="Posez votre question..."
//           placeholderTextColor={colors.textMuted}
//           multiline
//           maxLength={2000}
//         />

//         <TouchableOpacity
//           style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
//           onPress={() => send()}
//           disabled={!input.trim() || sending}
//           activeOpacity={0.7}>
//           {sending ? (
//             <ActivityIndicator size="small" color="#0b1120" />
//           ) : (
//             <Text style={styles.sendIcon}>➤</Text>
//           )}
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: colors.bg },
//   header: {
//     flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
//     paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
//     borderBottomWidth: 1, borderBottomColor: colors.border,
//     backgroundColor: colors.bgCard,
//   },
//   headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
//   dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
//   headerTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700' },
//   headerActions: { flexDirection: 'row', gap: spacing.sm },
//   toggleBtn: {
//     width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
//     borderRadius: radius.full, backgroundColor: colors.bgInput,
//     borderWidth: 1, borderColor: colors.borderLight,
//   },
//   toggleBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
//   toggleBtnText: { fontSize: 14 },
//   messages: { flex: 1 },
//   messagesContent: { padding: spacing.lg },
//   typing: {
//     flexDirection: 'row', alignItems: 'center',
//     gap: spacing.sm, paddingVertical: spacing.md,
//   },
//   typingText: { color: colors.textMuted, fontSize: fontSize.xs, fontStyle: 'italic' },
//   suggestions: {
//     paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
//     gap: spacing.sm, flexDirection: 'row', alignItems: 'center',
//   },
//   suggestionBtn: {
//     paddingHorizontal: spacing.md, paddingVertical: 8,
//     borderRadius: radius.full, borderWidth: 1,
//     borderColor: colors.borderLight, backgroundColor: colors.bgCard,
//     height: 36, justifyContent: 'center',
//   },
//   suggestionText: { color: colors.textSecondary, fontSize: 11, fontWeight: '600' },
//   inputBar: {
//     flexDirection: 'row', alignItems: 'flex-end',
//     paddingHorizontal: spacing.md, paddingVertical: spacing.md,
//     borderTopWidth: 1, borderTopColor: colors.border,
//     backgroundColor: colors.bgCard, gap: spacing.sm,
//   },
//   micBtn: {
//     width: 44, height: 44, borderRadius: 22,
//     backgroundColor: colors.bgInput, borderWidth: 1,
//     borderColor: colors.borderLight,
//     alignItems: 'center', justifyContent: 'center',
//   },
//   micBtnRecording: { backgroundColor: colors.error, borderColor: colors.error },
//   micBtnText: { fontSize: 18 },
//   input: {
//     flex: 1, backgroundColor: colors.bgInput, borderWidth: 1,
//     borderColor: colors.borderLight, borderRadius: radius.lg,
//     paddingHorizontal: spacing.md, paddingVertical: 10,
//     color: colors.text, fontSize: fontSize.sm, maxHeight: 100,
//   },
//   sendBtn: {
//     width: 44, height: 44, borderRadius: 22,
//     backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center',
//   },
//   sendBtnDisabled: { backgroundColor: colors.bgInput, opacity: 0.6 },
//   sendIcon: { color: '#0b1120', fontSize: 18, fontWeight: '800' },
// });
import { useRef, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView,
  ActivityIndicator, Alert,
} from 'react-native';
import * as Speech from 'expo-speech';
import { assistantApi, storage } from '../lib/api';
import { colors, spacing, fontSize, radius } from '../lib/theme';
import AssistantMessage from './AssistantMessage';
import DraftCard from './DraftCard';

const STORAGE_KEY = 'devis_assistant_history';
const VOICE_PREF_KEY = 'devis_assistant_voice_enabled';
const MAX_HISTORY = 40;

const SUGGESTIONS = [
  'Combien j\'ai de produits ?',
  'Quel est mon chiffre d\'affaires ?',
  'Cherche un client',
  'Alertes de stock ?',
  'Crée un devis',
  'Résumé activité',
];

export default function AssistantChat() {
  const scrollRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true); // activé par défaut

  // Charger la préférence vocale
  useEffect(() => {
    (async () => {
      try {
        const pref = await storage.getItem(VOICE_PREF_KEY);
        if (pref === 'true') setTtsEnabled(true);
        else if (pref === 'false') setTtsEnabled(false);
      } catch (err) { /* silent */ }
    })();
  }, []);

  const saveVoicePref = async (enabled) => {
    try {
      await storage.setItem(VOICE_PREF_KEY, enabled ? 'true' : 'false');
    } catch (err) { /* silent */ }
  };

  const toggleVoice = async () => {
    const next = !ttsEnabled;
    setTtsEnabled(next);
    await saveVoicePref(next);
    if (!next) {
      // Couper la lecture en cours
      try { Speech.stop(); } catch (err) { /* silent */ }
    }
  };

  const speak = (text) => {
    if (!ttsEnabled) return;
    if (!text) return;
    try {
      // Nettoyer le texte pour la synthèse vocale
      const clean = String(text)
        .replace(/[*_`#>~]/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
        .replace(/\n+/g, '. ')
        .replace(/\s+/g, ' ')
        .trim();
      if (!clean) return;

      Speech.stop(); // Couper toute lecture en cours
      Speech.speak(clean, {
        language: 'fr-FR',
        rate: 1.0,
        pitch: 1.0,
        onError: (err) => console.warn('Erreur TTS:', err),
      });
    } catch (err) {
      console.warn('Erreur speak:', err);
    }
  };

  const loadHistory = async () => {
    try {
      const raw = await storage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setMessages(Array.isArray(parsed) ? parsed : []);
        return;
      }
      const welcome =
        'Bonjour 👋 Je suis votre assistant. Posez-moi une question, dictez-moi une tâche, ou demandez-moi de créer un devis.';
      setMessages([{ id: 'welcome', role: 'assistant', text: welcome }]);
      speak(welcome);
    } catch (err) {
      setMessages([{ id: 'welcome', role: 'assistant', text: 'Bonjour 👋' }]);
    }
  };

  useEffect(() => { loadHistory(); }, []);

  const saveHistory = async (all) => {
    try {
      await storage.setItem(STORAGE_KEY, JSON.stringify(all.slice(-MAX_HISTORY)));
    } catch (err) { /* silent */ }
  };

  const send = async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || sending) return;

    // Couper la lecture en cours avant d'envoyer
    try { Speech.stop(); } catch (err) { /* silent */ }

    const userMsg = { id: `u-${Date.now()}`, role: 'user', text: trimmed };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setSending(true);

    const recentHistory = nextMessages
      .slice(-6)
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role, text: m.text }));

    try {
      const data = await assistantApi.chat(trimmed, recentHistory);

      // Cas 1 : action à confirmer
      if (data.response?.isPendingAction) {
        const draftText =
          data.response.message ||
          data.response.draft?.summary ||
          'Action en attente de confirmation.';

        const draftMsg = {
          id: `d-${Date.now()}`,
          role: 'draft',
          draft: data.response.draft,
          text: draftText,
        };
        const updated = [...nextMessages, draftMsg];
        setMessages(updated);
        await saveHistory(updated);
        // Lire le texte de confirmation
        speak(draftText);
        return;
      }

      // Cas 2 : réponse simple
      const textResponse =
        typeof data.response === 'string'
          ? data.response
          : data.response?.message || 'Pas de réponse.';

      const assistantMsg = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: textResponse,
      };
      const updated = [...nextMessages, assistantMsg];
      setMessages(updated);
      await saveHistory(updated);
      // Lire la réponse
      speak(textResponse);
    } catch (err) {
      const msg = '❌ ' + (err.response?.data?.error || err.message || 'Erreur');
      setMessages((prev) => [...prev, { id: `e-${Date.now()}`, role: 'system', text: msg }]);
      speak('Désolé, une erreur est survenue.');
    } finally {
      setSending(false);
    }
  };

  const toggleRecording = async () => {
    if (recording) { setRecording(false); return; }
    setRecording(true);

    if (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
      try {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        const rec = new SR();
        rec.lang = 'fr-FR';
        rec.continuous = false;
        rec.interimResults = false;
        rec.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setRecording(false);
        };
        rec.onerror = () => setRecording(false);
        rec.onend = () => setRecording(false);
        rec.start();
        return;
      } catch (err) { setRecording(false); }
    }

    Alert.alert(
      '🎤 Reconnaissance vocale',
      'La reconnaissance vocale native sera disponible avec un développement build.'
    );
    setRecording(false);
  };

  const clearHistory = async () => {
    Alert.alert('Effacer', 'Effacer la conversation ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Effacer', style: 'destructive',
        onPress: async () => {
          await storage.removeItem(STORAGE_KEY);
          try { Speech.stop(); } catch (err) { /* silent */ }
          await loadHistory();
        },
      },
    ]);
  };

  const onDraftConfirmed = (data) => {
    const successText =
      'Action effectuée avec succès.' +
      (data?.result?.id ? ` (ID ${data.result.id})` : '');
    setMessages((prev) => [...prev, {
      id: `s-${Date.now()}`,
      role: 'assistant',
      text: '✅ ' + successText,
    }]);
    speak(successText);
  };

  const onDraftCancelled = () => {
    setMessages((prev) => [...prev, {
      id: `c-${Date.now()}`, role: 'system', text: 'Action annulée.',
    }]);
    speak('Action annulée.');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.dot} />
          <Text style={styles.headerTitle}>Assistant IA</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.toggleBtn, ttsEnabled && styles.toggleBtnActive]}
            onPress={toggleVoice}
            activeOpacity={0.7}
          >
            <Text style={styles.toggleBtnText}>🔊</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toggleBtn} onPress={clearHistory} activeOpacity={0.7}>
            <Text style={styles.toggleBtnText}>🗑</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((m) => {
          if (m.role === 'draft' && m.draft) {
            return (
              <DraftCard key={m.id} draft={m.draft}
                onConfirmed={onDraftConfirmed} onCancelled={onDraftCancelled} />
            );
          }
          return <AssistantMessage key={m.id} role={m.role} text={m.text} />;
        })}
        {sending && (
          <View style={styles.typing}>
            <ActivityIndicator size="small" color={colors.accent} />
            <Text style={styles.typingText}>L'assistant réfléchit...</Text>
          </View>
        )}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.suggestions}
      >
        {SUGGESTIONS.map((s, i) => (
          <TouchableOpacity key={i} style={styles.suggestionBtn}
            onPress={() => send(s)} activeOpacity={0.7}>
            <Text style={styles.suggestionText}>{s}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.inputBar}>
        <TouchableOpacity
          style={[styles.micBtn, recording && styles.micBtnRecording]}
          onPress={toggleRecording} activeOpacity={0.7}>
          <Text style={styles.micBtnText}>{recording ? '⏹' : '🎤'}</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Posez votre question..."
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={2000}
        />

        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
          onPress={() => send()}
          disabled={!input.trim() || sending}
          activeOpacity={0.7}>
          {sending ? (
            <ActivityIndicator size="small" color="#0b1120" />
          ) : (
            <Text style={styles.sendIcon}>➤</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  headerTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700' },
  headerActions: { flexDirection: 'row', gap: spacing.sm },
  toggleBtn: {
    width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
    borderRadius: radius.full, backgroundColor: colors.bgInput,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  toggleBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  toggleBtnText: { fontSize: 14 },
  messages: { flex: 1 },
  messagesContent: { padding: spacing.lg },
  typing: {
    flexDirection: 'row', alignItems: 'center',
    gap: spacing.sm, paddingVertical: spacing.md,
  },
  typingText: { color: colors.textMuted, fontSize: fontSize.xs, fontStyle: 'italic' },
  suggestions: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    gap: spacing.sm, flexDirection: 'row', alignItems: 'center',
  },
  suggestionBtn: {
    paddingHorizontal: spacing.md, paddingVertical: 8,
    borderRadius: radius.full, borderWidth: 1,
    borderColor: colors.borderLight, backgroundColor: colors.bgCard,
    height: 36, justifyContent: 'center',
  },
  suggestionText: { color: colors.textSecondary, fontSize: 11, fontWeight: '600' },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    borderTopWidth: 1, borderTopColor: colors.border,
    backgroundColor: colors.bgCard, gap: spacing.sm,
  },
  micBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.bgInput, borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center', justifyContent: 'center',
  },
  micBtnRecording: { backgroundColor: colors.error, borderColor: colors.error },
  micBtnText: { fontSize: 18 },
  input: {
    flex: 1, backgroundColor: colors.bgInput, borderWidth: 1,
    borderColor: colors.borderLight, borderRadius: radius.lg,
    paddingHorizontal: spacing.md, paddingVertical: 10,
    color: colors.text, fontSize: fontSize.sm, maxHeight: 100,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: colors.bgInput, opacity: 0.6 },
  sendIcon: { color: '#0b1120', fontSize: 18, fontWeight: '800' },
});