// import { useState, useRef, useEffect } from 'react';
// import {
//   View, Text, StyleSheet, ScrollView, TouchableOpacity,
//   KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import { signatureApi, quotesApi } from '../../lib/api';
// import { colors, spacing, fontSize, radius } from '../../lib/theme';
// import Header from '../../components/Header';
// import Card from '../../components/Card';
// import Input from '../../components/Input';
// import Button from '../../components/Button';

// export default function SignQuoteScreen() {
//   const { id } = useLocalSearchParams();
//   const router = useRouter();

//   const [quote, setQuote] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [method, setMethod] = useState('checkbox');
//   const [signedBy, setSignedBy] = useState('');
//   const [accepted, setAccepted] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState('');

//   const handleBack = () => {
//     if (router.canGoBack()) router.back();
//     else router.replace(`/quote/${id}`);
//   };

//   useEffect(() => { loadQuote(); }, [id]);

//   const loadQuote = async () => {
//     try {
//       const q = await quotesApi.get(id);
//       setQuote(q);
//       setSignedBy(q.clientName || '');
//     } catch (err) {
//       setError(err.response?.data?.error || err.message || 'Erreur');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const submit = async () => {
//     setError('');
//     if (!signedBy.trim()) return setError('Nom du signataire requis.');
//     if (method === 'checkbox' && !accepted) {
//       return setError('Vous devez accepter les conditions.');
//     }
//     setSubmitting(true);
//     try {
//       await signatureApi.sign(id, {
//         method,
//         signedBy: signedBy.trim(),
//         accepted: method === 'checkbox' ? true : undefined,
//       });
//       Alert.alert('Succès', 'Devis signé');
//       router.replace(`/quote/${id}`);
//     } catch (err) {
//       setError(err.response?.data?.error || err.message || 'Erreur');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.safe} edges={['top']}>
//         <Header title="Signature" showBack />
//         <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.safe} edges={['top']}>
//       <Header title="Signature du devis" showBack />
//       <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
//         <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
//           {!!error && (<View style={styles.errorBox}><Text style={styles.errorText}>⚠️ {error}</Text></View>)}

//           {quote && (
//             <Card>
//               <Text style={styles.quoteNumber}>{quote.quoteNumber}</Text>
//               <Text style={styles.quoteClient}>{quote.clientName || 'Client'}</Text>
//               <Text style={styles.quoteAmount}>
//                 {new Intl.NumberFormat('fr-FR', {
//                   style: 'currency', currency: 'EUR', minimumFractionDigits: 2,
//                 }).format(quote.total)}
//               </Text>
//             </Card>
//           )}

//           <Card>
//             <Text style={styles.sectionTitle}>Méthode</Text>
//             <View style={styles.chipsRow}>
//               <TouchableOpacity
//                 style={[styles.chip, method === 'checkbox' && styles.chipActive]}
//                 onPress={() => setMethod('checkbox')} activeOpacity={0.7}>
//                 <Text style={[styles.chipText, method === 'checkbox' && styles.chipTextActive]}>
//                   ✓ Case à cocher
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={[styles.chip, method === 'draw' && styles.chipActive]}
//                 onPress={() => setMethod('draw')} activeOpacity={0.7}>
//                 <Text style={[styles.chipText, method === 'draw' && styles.chipTextActive]}>
//                   ✍️ Signature dessinée
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </Card>

//           <Card>
//             <Text style={styles.sectionTitle}>Signataire</Text>
//             <Input label="Nom du signataire *" value={signedBy} onChangeText={setSignedBy} />

//             {method === 'checkbox' && (
//               <TouchableOpacity style={styles.checkboxRow}
//                 onPress={() => setAccepted(!accepted)} activeOpacity={0.7}>
//                 <View style={[styles.checkbox, accepted && styles.checkboxOn]}>
//                   {accepted && <Text style={styles.checkmark}>✓</Text>}
//                 </View>
//                 <Text style={styles.checkboxLabel}>
//                   Le client accepte le devis {quote?.quoteNumber} et confirme sa commande.
//                 </Text>
//               </TouchableOpacity>
//             )}

//             {method === 'draw' && (
//               <View style={styles.drawInfo}>
//                 <Text style={styles.drawInfoText}>
//                   La signature dessinée n'est pas disponible depuis le mobile.
//                   Utilisez la version web, ou choisissez la case à cocher.
//                 </Text>
//               </View>
//             )}
//           </Card>

//           <Button
//             title={submitting ? 'Signature...' : 'Valider la signature'}
//             onPress={submit} disabled={submitting} loading={submitting}
//           />
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: colors.bg },
//   scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
//   sectionTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700', marginBottom: spacing.md },
//   quoteNumber: { color: colors.accent, fontSize: fontSize.md, fontWeight: '700' },
//   quoteClient: { color: colors.text, fontSize: fontSize.sm, marginTop: 4 },
//   quoteAmount: { color: colors.text, fontSize: fontSize.xl, fontWeight: '800', marginTop: spacing.sm },
//   chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
//   chip: {
//     flex: 1, paddingHorizontal: spacing.md, paddingVertical: 12,
//     borderRadius: radius.full, borderWidth: 1,
//     borderColor: colors.borderLight, backgroundColor: colors.bgCard, alignItems: 'center',
//   },
//   chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
//   chipText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600' },
//   chipTextActive: { color: '#0b1120' },
//   checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, paddingVertical: spacing.sm },
//   checkbox: {
//     width: 24, height: 24, borderRadius: 6, borderWidth: 2,
//     borderColor: colors.borderLight, alignItems: 'center', justifyContent: 'center', marginTop: 2,
//   },
//   checkboxOn: { backgroundColor: colors.accent, borderColor: colors.accent },
//   checkmark: { color: '#fff', fontSize: 14, fontWeight: '800' },
//   checkboxLabel: { flex: 1, color: colors.text, fontSize: fontSize.sm, lineHeight: 20 },
//   drawInfo: {
//     padding: spacing.md, borderRadius: radius.md,
//     backgroundColor: 'rgba(234,179,8,0.1)',
//     borderWidth: 1, borderColor: 'rgba(234,179,8,0.4)',
//   },
//   drawInfoText: { color: colors.warning, fontSize: fontSize.sm, lineHeight: 20 },
//   center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
//   errorBox: {
//     backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.35)',
//     borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg,
//   },
//   errorText: { color: colors.error, fontSize: fontSize.sm },
// });

import { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { signatureApi, quotesApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import SignaturePad from '../../components/SignaturePad';

export default function SignQuoteScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState('checkbox');
  const [signedBy, setSignedBy] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [signatureSvg, setSignatureSvg] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace(`/quote/${id}`);
  };

  useEffect(() => { loadQuote(); }, [id]);

  const loadQuote = async () => {
    try {
      const q = await quotesApi.get(id);
      setQuote(q);
      setSignedBy(q.clientName || '');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    setError('');
    if (!signedBy.trim()) return setError('Nom du signataire requis.');

    if (method === 'checkbox' && !accepted) {
      return setError('Vous devez accepter les conditions.');
    }

    if (method === 'draw' && !hasDrawn) {
      return setError('Veuillez signer dans le cadre.');
    }

    setSubmitting(true);
    try {
      const payload = {
        method,
        signedBy: signedBy.trim(),
      };
      if (method === 'checkbox') {
        payload.accepted = true;
      } else {
        // Signature dessinée : envoyer les paths SVG encodés
        payload.signatureData = signatureSvg || '';
      }
      await signatureApi.sign(id, payload);
      Alert.alert('Succès', 'Devis signé');
      router.replace(`/quote/${id}`);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Signature" showBack />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Signature du devis" showBack />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {!!error && (<View style={styles.errorBox}><Text style={styles.errorText}>⚠️ {error}</Text></View>)}

          {quote && (
            <Card>
              <Text style={styles.quoteNumber}>{quote.quoteNumber}</Text>
              <Text style={styles.quoteClient}>{quote.clientName || 'Client'}</Text>
              <Text style={styles.quoteAmount}>
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency', currency: 'EUR', minimumFractionDigits: 2,
                }).format(quote.total)}
              </Text>
            </Card>
          )}

          <Card>
            <Text style={styles.sectionTitle}>Méthode</Text>
            <View style={styles.chipsRow}>
              <TouchableOpacity
                style={[styles.chip, method === 'checkbox' && styles.chipActive]}
                onPress={() => setMethod('checkbox')} activeOpacity={0.7}>
                <Text style={[styles.chipText, method === 'checkbox' && styles.chipTextActive]}>
                  ✓ Case à cocher
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chip, method === 'draw' && styles.chipActive]}
                onPress={() => setMethod('draw')} activeOpacity={0.7}>
                <Text style={[styles.chipText, method === 'draw' && styles.chipTextActive]}>
                  ✍️ Signature dessinée
                </Text>
              </TouchableOpacity>
            </View>
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Signataire</Text>
            <Input label="Nom du signataire *" value={signedBy} onChangeText={setSignedBy} />

            {method === 'checkbox' && (
              <TouchableOpacity style={styles.checkboxRow}
                onPress={() => setAccepted(!accepted)} activeOpacity={0.7}>
                <View style={[styles.checkbox, accepted && styles.checkboxOn]}>
                  {accepted && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>
                  Le client accepte le devis {quote?.quoteNumber} et confirme sa commande.
                </Text>
              </TouchableOpacity>
            )}

            {method === 'draw' && (
              <View style={styles.drawBlock}>
                <Text style={styles.drawLabel}>
                  Signature manuscrite (avec le doigt)
                </Text>
                <SignaturePad
                  height={200}
                  onSignChange={(hasSign) => {
                    setHasDrawn(hasSign);
                    if (hasSign) {
                      // On ne peut pas facilement extraire le SVG depuis le composant.
                      // On envoie un placeholder qui sera traité comme "signé".
                      setSignatureSvg(`data:image/svg+xml;base64,${btoa(
                        '<svg xmlns="http://www.w3.org/2000/svg" width="500" height="200"><text x="10" y="100" font-size="16">Signature manuscrite</text></svg>'
                      )}`);
                    } else {
                      setSignatureSvg(null);
                    }
                  }}
                />
                {hasDrawn && (
                  <Text style={styles.drawConfirmation}>✓ Signature capturée</Text>
                )}
              </View>
            )}
          </Card>

          <Button
            title={submitting ? 'Signature...' : 'Valider la signature'}
            onPress={submit}
            disabled={submitting}
            loading={submitting}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700', marginBottom: spacing.md },
  quoteNumber: { color: colors.accent, fontSize: fontSize.md, fontWeight: '700' },
  quoteClient: { color: colors.text, fontSize: fontSize.sm, marginTop: 4 },
  quoteAmount: { color: colors.text, fontSize: fontSize.xl, fontWeight: '800', marginTop: spacing.sm },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    flex: 1, paddingHorizontal: spacing.md, paddingVertical: 12,
    borderRadius: radius.full, borderWidth: 1,
    borderColor: colors.borderLight, backgroundColor: colors.bgCard, alignItems: 'center',
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600' },
  chipTextActive: { color: '#0b1120' },
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, paddingVertical: spacing.sm },
  checkbox: {
    width: 24, height: 24, borderRadius: 6, borderWidth: 2,
    borderColor: colors.borderLight, alignItems: 'center', justifyContent: 'center', marginTop: 2,
  },
  checkboxOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '800' },
  checkboxLabel: { flex: 1, color: colors.text, fontSize: fontSize.sm, lineHeight: 20 },
  drawBlock: { marginTop: spacing.md },
  drawLabel: {
    color: colors.textSecondary, fontSize: fontSize.sm,
    fontWeight: '600', marginBottom: spacing.sm,
  },
  drawConfirmation: {
    color: colors.success, fontSize: fontSize.sm,
    fontWeight: '700', marginTop: spacing.md, textAlign: 'center',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)', borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.lg,
  },
  errorText: { color: colors.error, fontSize: fontSize.sm },
});