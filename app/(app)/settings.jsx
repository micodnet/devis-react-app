// import { useState, useEffect, useCallback } from 'react';
// import {
//   View, Text, StyleSheet, ScrollView, ActivityIndicator,
//   RefreshControl, TouchableOpacity, Alert, Linking,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useFocusEffect, useRouter } from 'expo-router';
// import { settingsApi } from '../../lib/api';
// import { useAuth } from '../../lib/auth';
// import { colors, spacing, fontSize, radius } from '../../lib/theme';
// import Header from '../../components/Header';
// import Card from '../../components/Card';
// import Input from '../../components/Input';
// import Button from '../../components/Button';

// const VAT_REGIMES = [
//   { value: 'franchise', label: 'Franchise' },
//   { value: 'assujetti', label: 'Assujetti' },
// ];

// const LANGUAGES = [
//   { value: 'fr', label: '🇫🇷 Français' },
//   { value: 'nl', label: '🇳🇱 Nederlands' },
//   { value: 'en', label: '🇬🇧 English' },
// ];

// const PDF_TEMPLATES = [
//   { value: 'classic', label: 'Classique' },
//   { value: 'modern', label: 'Moderne' },
//   { value: 'elegant', label: 'Élégant' },
// ];

// const SIGNATURE_METHODS = [
//   { value: 'none', label: 'Aucune' },
//   { value: 'checkbox', label: 'Case à cocher' },
//   { value: 'draw', label: 'Dessinée' },
// ];

// export default function SettingsScreen() {
//   const router = useRouter();
//   const { user, logout } = useAuth();

//   const [settings, setSettings] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   const loadSettings = async () => {
//     try {
//       setError('');
//       const data = await settingsApi.get();
//       setSettings(data);
//     } catch (err) {
//       setError(err.response?.data?.error || err.message || 'Erreur de chargement');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       loadSettings();
//     }, [])
//   );

//   const onRefresh = () => {
//     setRefreshing(true);
//     loadSettings();
//   };

//   const updateField = (key, value) => {
//     setSettings((prev) => ({ ...prev, [key]: value }));
//   };

//   const save = async () => {
//     setError('');
//     setSuccess('');
//     setSaving(true);
//     try {
//       await settingsApi.update({
//         companyName: settings.companyName,
//         address: settings.address,
//         siret: settings.siret,
//         tva: settings.tva,
//         phone: settings.phone,
//         email: settings.email,
//         website: settings.website,
//         vatRegime: settings.vatRegime,
//         vatRate: parseFloat(settings.vatRate) || 0,
//         signatureMethod: settings.signatureMethod,
//         iban: settings.iban,
//         bic: settings.bic,
//         bankName: settings.bankName,
//         invoicePrefix: settings.invoicePrefix,
//         paymentTerms: parseInt(settings.paymentTerms) || 30,
//         language: settings.language,
//         pdfTemplate: settings.pdfTemplate,
//       });
//       setSuccess('Paramètres enregistrés ✅');
//       setTimeout(() => setSuccess(''), 3000);
//     } catch (err) {
//       setError(err.response?.data?.error || err.message || 'Erreur d\'enregistrement');
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.safe} edges={['top']}>
//         <Header title="Paramètres" />
//         <View style={styles.center}>
//           <ActivityIndicator size="large" color={colors.accent} />
//         </View>
//       </SafeAreaView>
//     );
//   }

//   if (!settings) {
//     return (
//       <SafeAreaView style={styles.safe} edges={['top']}>
//         <Header title="Paramètres" />
//         <View style={styles.center}>
//           <Text style={styles.errorText}>⚠️ {error || 'Impossible de charger'}</Text>
//           <Button title="Réessayer" onPress={loadSettings} variant="secondary" />
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.safe} edges={['top']}>
//       <Header title="Paramètres" />
//       <ScrollView
//         contentContainerStyle={styles.scroll}
//         keyboardShouldPersistTaps="handled"
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             tintColor={colors.accent}
//             colors={[colors.accent]}
//           />
//         }
//       >
//         {!!error && (
//           <View style={styles.errorBox}>
//             <Text style={styles.errorText}>⚠️ {error}</Text>
//           </View>
//         )}
//         {!!success && (
//           <View style={styles.successBox}>
//             <Text style={styles.successText}>{success}</Text>
//           </View>
//         )}

//         {/* Infos entreprise */}
//         <Card>
//           <Text style={styles.sectionTitle}>🏢 Entreprise</Text>
//           <Input
//             label="Nom de l'entreprise"
//             value={settings.companyName || ''}
//             onChangeText={(v) => updateField('companyName', v)}
//             placeholder="Mon Entreprise"
//           />
//           <Input
//             label="Adresse"
//             value={settings.address || ''}
//             onChangeText={(v) => updateField('address', v)}
//             placeholder="Rue, ville, code postal"
//           />
//           <Input
//             label="SIRET / BCE"
//             value={settings.siret || ''}
//             onChangeText={(v) => updateField('siret', v)}
//           />
//           <Input
//             label="N° TVA"
//             value={settings.tva || ''}
//             onChangeText={(v) => updateField('tva', v)}
//           />
//           <Input
//             label="Téléphone"
//             value={settings.phone || ''}
//             onChangeText={(v) => updateField('phone', v)}
//             keyboardType="phone-pad"
//           />
//           <Input
//             label="Email"
//             value={settings.email || ''}
//             onChangeText={(v) => updateField('email', v)}
//             keyboardType="email-address"
//           />
//           <Input
//             label="Site web"
//             value={settings.website || ''}
//             onChangeText={(v) => updateField('website', v)}
//           />
//         </Card>

//         {/* TVA */}
//         <Card>
//           <Text style={styles.sectionTitle}>💰 TVA</Text>
//           <Text style={styles.fieldLabel}>Régime</Text>
//           <View style={styles.optionsRow}>
//             {VAT_REGIMES.map((r) => (
//               <OptionButton
//                 key={r.value}
//                 label={r.label}
//                 active={settings.vatRegime === r.value}
//                 onPress={() => updateField('vatRegime', r.value)}
//               />
//             ))}
//           </View>
//           <Input
//             label="Taux par défaut (%)"
//             value={String(settings.vatRate || 21)}
//             onChangeText={(v) => updateField('vatRate', v)}
//             keyboardType="numeric"
//           />
//         </Card>

//         {/* Langue & PDF */}
//         <Card>
//           <Text style={styles.sectionTitle}>🌍 Langue & Documents</Text>
//           <Text style={styles.fieldLabel}>Langue</Text>
//           <View style={styles.optionsRow}>
//             {LANGUAGES.map((l) => (
//               <OptionButton
//                 key={l.value}
//                 label={l.label}
//                 active={settings.language === l.value}
//                 onPress={() => updateField('language', l.value)}
//               />
//             ))}
//           </View>

//           <Text style={styles.fieldLabel}>Template PDF</Text>
//           <View style={styles.optionsRow}>
//             {PDF_TEMPLATES.map((t) => (
//               <OptionButton
//                 key={t.value}
//                 label={t.label}
//                 active={settings.pdfTemplate === t.value}
//                 onPress={() => updateField('pdfTemplate', t.value)}
//               />
//             ))}
//           </View>

//           <Text style={styles.fieldLabel}>Signature par défaut</Text>
//           <View style={styles.optionsRow}>
//             {SIGNATURE_METHODS.map((s) => (
//               <OptionButton
//                 key={s.value}
//                 label={s.label}
//                 active={settings.signatureMethod === s.value}
//                 onPress={() => updateField('signatureMethod', s.value)}
//               />
//             ))}
//           </View>
//         </Card>

//         {/* Banque */}
//         <Card>
//           <Text style={styles.sectionTitle}>🏦 Banque & Facturation</Text>
//           <Input
//             label="IBAN"
//             value={settings.iban || ''}
//             onChangeText={(v) => updateField('iban', v)}
//             placeholder="BE68 5390 0754 7034"
//           />
//           <Input
//             label="BIC"
//             value={settings.bic || ''}
//             onChangeText={(v) => updateField('bic', v)}
//             placeholder="GEBABEBB"
//           />
//           <Input
//             label="Nom de la banque"
//             value={settings.bankName || ''}
//             onChangeText={(v) => updateField('bankName', v)}
//           />
//           <Input
//             label="Préfixe n° facture"
//             value={settings.invoicePrefix || 'FAC'}
//             onChangeText={(v) => updateField('invoicePrefix', v)}
//           />
//           <Input
//             label="Délai de paiement (jours)"
//             value={String(settings.paymentTerms || 30)}
//             onChangeText={(v) => updateField('paymentTerms', v)}
//             keyboardType="numeric"
//           />
//         </Card>

//         <Button
//           title={saving ? 'Enregistrement...' : '💾 Enregistrer'}
//           onPress={save}
//           disabled={saving}
//           loading={saving}
//         />

//         {/* Compte */}
//         <Card style={{ marginTop: spacing.lg }}>
//           <Text style={styles.sectionTitle}>🔐 Compte</Text>
//           <View style={styles.userInfo}>
//             <Text style={styles.userEmail}>{user?.email}</Text>
//             <Text style={styles.userRole}>
//               Rôle : {user?.role || 'owner'}
//             </Text>
//           </View>

//           <TouchableOpacity
//             style={styles.actionRow}
//             onPress={() => router.push('/change-password')}
//             activeOpacity={0.7}
//           >
//             <Text style={styles.actionLabel}>🔒 Changer le mot de passe</Text>
//             <Text style={styles.actionArrow}>›</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.actionRow}
//             onPress={() => router.push('/notifications')}
//             activeOpacity={0.7}
//           >
//             <Text style={styles.actionLabel}>🔔 Notifications</Text>
//             <Text style={styles.actionArrow}>›</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.actionRow}
//             onPress={logout}
//             activeOpacity={0.7}
//           >
//             <Text style={[styles.actionLabel, { color: colors.warning }]}>
//               🚪 Se déconnecter
//             </Text>
//             <Text style={styles.actionArrow}>›</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.actionRow}
//             onPress={() => router.push('/delete-account')}
//             activeOpacity={0.7}
//           >
//             <Text style={[styles.actionLabel, { color: colors.error }]}>
//               🗑 Supprimer mon compte
//             </Text>
//             <Text style={styles.actionArrow}>›</Text>
//           </TouchableOpacity>
//         </Card>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// function OptionButton({ label, active, onPress }) {
//   return (
//     <TouchableOpacity
//       style={[styles.optionBtn, active && styles.optionBtnActive]}
//       onPress={onPress}
//       activeOpacity={0.7}
//     >
//       <Text style={[styles.optionText, active && styles.optionTextActive]}>
//         {label}
//       </Text>
//     </TouchableOpacity>
//   );
// }

// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: colors.bg },
//   scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
//   sectionTitle: {
//     color: colors.text,
//     fontSize: fontSize.md,
//     fontWeight: '700',
//     marginBottom: spacing.md,
//   },
//   fieldLabel: {
//     color: colors.textSecondary,
//     fontSize: fontSize.sm,
//     fontWeight: '600',
//     marginTop: spacing.md,
//     marginBottom: spacing.sm,
//   },
//   optionsRow: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: spacing.sm,
//     marginBottom: spacing.md,
//   },
//   optionBtn: {
//     paddingHorizontal: spacing.md,
//     paddingVertical: 10,
//     borderRadius: radius.full,
//     borderWidth: 1,
//     borderColor: colors.borderLight,
//     backgroundColor: colors.bgCard,
//   },
//   optionBtnActive: {
//     backgroundColor: colors.accent,
//     borderColor: colors.accent,
//   },
//   optionText: {
//     color: colors.textSecondary,
//     fontSize: fontSize.sm,
//     fontWeight: '600',
//   },
//   optionTextActive: { color: '#0b1120' },
//   userInfo: {
//     padding: spacing.md,
//     borderRadius: radius.md,
//     backgroundColor: colors.bgInput,
//     marginBottom: spacing.md,
//   },
//   userEmail: {
//     color: colors.text,
//     fontSize: fontSize.sm,
//     fontWeight: '600',
//   },
//   userRole: {
//     color: colors.accent,
//     fontSize: fontSize.xs,
//     marginTop: 4,
//     fontWeight: '600',
//   },
//   actionRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: spacing.md,
//     borderTopWidth: 1,
//     borderTopColor: colors.border,
//   },
//   actionLabel: {
//     color: colors.text,
//     fontSize: fontSize.sm,
//     fontWeight: '500',
//   },
//   actionArrow: {
//     color: colors.textMuted,
//     fontSize: 20,
//     fontWeight: '300',
//   },
//   errorBox: {
//     backgroundColor: 'rgba(239,68,68,0.12)',
//     borderWidth: 1,
//     borderColor: 'rgba(239,68,68,0.35)',
//     borderRadius: radius.md,
//     padding: spacing.md,
//     marginBottom: spacing.lg,
//   },
//   errorText: { color: colors.error, fontSize: fontSize.sm },
//   successBox: {
//     backgroundColor: 'rgba(16,185,129,0.12)',
//     borderWidth: 1,
//     borderColor: 'rgba(16,185,129,0.35)',
//     borderRadius: radius.md,
//     padding: spacing.md,
//     marginBottom: spacing.lg,
//   },
//   successText: { color: colors.success, fontSize: fontSize.sm },
//   center: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: spacing.xl,
//   },
// });
import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  RefreshControl, TouchableOpacity, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { settingsApi } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';

const VAT_REGIMES = [
  { value: 'franchise', label: 'Franchise' },
  { value: 'assujetti', label: 'Assujetti' },
];

const LANGUAGES = [
  { value: 'fr', label: '🇫🇷 Français' },
  { value: 'nl', label: '🇳🇱 Nederlands' },
  { value: 'en', label: '🇬🇧 English' },
];

const PDF_TEMPLATES = [
  { value: 'classic', label: 'Classique' },
  { value: 'modern', label: 'Moderne' },
  { value: 'elegant', label: 'Élégant' },
];

const SIGNATURE_METHODS = [
  { value: 'none', label: 'Aucune' },
  { value: 'checkbox', label: 'Case à cocher' },
  { value: 'draw', label: 'Dessinée' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const loadSettings = async () => {
    try {
      setError('');
      const data = await settingsApi.get();
      setSettings(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { loadSettings(); }, []));

  const onRefresh = () => { setRefreshing(true); loadSettings(); };

  const updateField = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const pickLogo = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Autorisez l\'accès à votre galerie.');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: true,
        aspect: [1, 1],
        base64: true,
      });
      if (res.canceled) return;
      const asset = res.assets[0];
      if (!asset.base64) {
        Alert.alert('Erreur', 'Impossible de lire l\'image.');
        return;
      }
      const mime = asset.mimeType || 'image/png';
      const base64Data = `data:${mime};base64,${asset.base64}`;
      setUploadingLogo(true);
      setSettings((prev) => ({ ...prev, logo: base64Data }));
      setSuccess('Logo chargé. N\'oubliez pas d\'enregistrer.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      Alert.alert('Erreur', err.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  const removeLogo = () => {
    Alert.alert('Supprimer le logo', 'Confirmer ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: () => {
          setSettings((prev) => ({ ...prev, logo: null }));
        },
      },
    ]);
  };

  const save = async () => {
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await settingsApi.update({
        companyName: settings.companyName,
        address: settings.address,
        siret: settings.siret,
        tva: settings.tva,
        phone: settings.phone,
        email: settings.email,
        website: settings.website,
        logo: settings.logo,
        vatRegime: settings.vatRegime,
        vatRate: parseFloat(settings.vatRate) || 0,
        signatureMethod: settings.signatureMethod,
        iban: settings.iban,
        bic: settings.bic,
        bankName: settings.bankName,
        invoicePrefix: settings.invoicePrefix,
        paymentTerms: parseInt(settings.paymentTerms) || 30,
        language: settings.language,
        pdfTemplate: settings.pdfTemplate,
      });
      setSuccess('Paramètres enregistrés ✅');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Paramètres" showBack />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>
      </SafeAreaView>
    );
  }

  if (!settings) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Paramètres" showBack />
        <View style={styles.center}>
          <Text style={styles.errorText}>⚠️ {error || 'Impossible de charger'}</Text>
          <Button title="Réessayer" onPress={loadSettings} variant="secondary" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Paramètres" showBack />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
            tintColor={colors.accent} colors={[colors.accent]} />
        }
      >
        {!!error && (<View style={styles.errorBox}><Text style={styles.errorText}>⚠️ {error}</Text></View>)}
        {!!success && (<View style={styles.successBox}><Text style={styles.successText}>{success}</Text></View>)}

        {/* Logo */}
        <Card>
          <Text style={styles.sectionTitle}>🖼️ Logo</Text>
          <View style={styles.logoBox}>
            {settings.logo ? (
              <Image source={{ uri: settings.logo }} style={styles.logoImage} resizeMode="contain" />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoPlaceholderIcon}>🏢</Text>
                <Text style={styles.logoPlaceholderText}>Aucun logo</Text>
              </View>
            )}
          </View>
          <View style={styles.logoActions}>
            <TouchableOpacity style={styles.logoBtn} onPress={pickLogo}
              disabled={uploadingLogo} activeOpacity={0.7}>
              <Text style={styles.logoBtnText}>
                {uploadingLogo ? '⏳...' : (settings.logo ? '🔄 Changer' : '📷 Choisir')}
              </Text>
            </TouchableOpacity>
            {settings.logo && (
              <TouchableOpacity style={[styles.logoBtn, styles.logoBtnDanger]}
                onPress={removeLogo} activeOpacity={0.7}>
                <Text style={styles.logoBtnDangerText}>🗑 Supprimer</Text>
              </TouchableOpacity>
            )}
          </View>
        </Card>

        {/* Infos entreprise */}
        <Card>
          <Text style={styles.sectionTitle}>🏢 Entreprise</Text>
          <Input label="Nom" value={settings.companyName || ''} onChangeText={(v) => updateField('companyName', v)} />
          <Input label="Adresse" value={settings.address || ''} onChangeText={(v) => updateField('address', v)} />
          <Input label="SIRET / BCE" value={settings.siret || ''} onChangeText={(v) => updateField('siret', v)} />
          <Input label="N° TVA" value={settings.tva || ''} onChangeText={(v) => updateField('tva', v)} />
          <Input label="Téléphone" value={settings.phone || ''} onChangeText={(v) => updateField('phone', v)} keyboardType="phone-pad" />
          <Input label="Email" value={settings.email || ''} onChangeText={(v) => updateField('email', v)} keyboardType="email-address" />
          <Input label="Site web" value={settings.website || ''} onChangeText={(v) => updateField('website', v)} />
        </Card>

        {/* TVA */}
        <Card>
          <Text style={styles.sectionTitle}>💰 TVA</Text>
          <Text style={styles.fieldLabel}>Régime</Text>
          <View style={styles.optionsRow}>
            {VAT_REGIMES.map((r) => (
              <OptionButton key={r.value} label={r.label}
                active={settings.vatRegime === r.value}
                onPress={() => updateField('vatRegime', r.value)} />
            ))}
          </View>
          <Input label="Taux par défaut (%)" value={String(settings.vatRate || 21)}
            onChangeText={(v) => updateField('vatRate', v)} keyboardType="numeric" />
        </Card>

        {/* Langue / PDF */}
        <Card>
          <Text style={styles.sectionTitle}>🌍 Langue & Documents</Text>
          <Text style={styles.fieldLabel}>Langue</Text>
          <View style={styles.optionsRow}>
            {LANGUAGES.map((l) => (
              <OptionButton key={l.value} label={l.label}
                active={settings.language === l.value}
                onPress={() => updateField('language', l.value)} />
            ))}
          </View>
          <Text style={styles.fieldLabel}>Template PDF</Text>
          <View style={styles.optionsRow}>
            {PDF_TEMPLATES.map((t) => (
              <OptionButton key={t.value} label={t.label}
                active={settings.pdfTemplate === t.value}
                onPress={() => updateField('pdfTemplate', t.value)} />
            ))}
          </View>
          <Text style={styles.fieldLabel}>Signature par défaut</Text>
          <View style={styles.optionsRow}>
            {SIGNATURE_METHODS.map((s) => (
              <OptionButton key={s.value} label={s.label}
                active={settings.signatureMethod === s.value}
                onPress={() => updateField('signatureMethod', s.value)} />
            ))}
          </View>
        </Card>

        {/* Banque */}
        <Card>
          <Text style={styles.sectionTitle}>🏦 Banque & Facturation</Text>
          <Input label="IBAN" value={settings.iban || ''} onChangeText={(v) => updateField('iban', v)} autoCapitalize="characters" />
          <Input label="BIC" value={settings.bic || ''} onChangeText={(v) => updateField('bic', v)} autoCapitalize="characters" />
          <Input label="Nom de la banque" value={settings.bankName || ''} onChangeText={(v) => updateField('bankName', v)} />
          <Input label="Préfixe n° facture" value={settings.invoicePrefix || 'FAC'} onChangeText={(v) => updateField('invoicePrefix', v)} />
          <Input label="Délai de paiement (jours)" value={String(settings.paymentTerms || 30)}
            onChangeText={(v) => updateField('paymentTerms', v)} keyboardType="numeric" />
        </Card>

        <Button title={saving ? 'Enregistrement...' : '💾 Enregistrer'} onPress={save}
          disabled={saving} loading={saving} />

        {/* Compte */}
        <Card style={{ marginTop: spacing.lg }}>
          <Text style={styles.sectionTitle}>🔐 Compte</Text>
          <View style={styles.userInfo}>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <Text style={styles.userRole}>Rôle : {user?.role || 'owner'}</Text>
          </View>

          <TouchableOpacity style={styles.actionRow}
            onPress={() => router.push('/(app)/change-password')} activeOpacity={0.7}>
            <Text style={styles.actionLabel}>🔒 Changer le mot de passe</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow}
            onPress={() => router.push('/(app)/notifications')} activeOpacity={0.7}>
            <Text style={styles.actionLabel}>🔔 Notifications</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow}
            onPress={() => router.push('/(app)/currency')} activeOpacity={0.7}>
            <Text style={styles.actionLabel}>💱 Devises</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow}
            onPress={() => router.push('/(app)/export-data')} activeOpacity={0.7}>
            <Text style={styles.actionLabel}>📥 Export RGPD (JSON)</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow} onPress={logout} activeOpacity={0.7}>
            <Text style={[styles.actionLabel, { color: colors.warning }]}>🚪 Se déconnecter</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow}
            onPress={() => router.push('/(app)/delete-account')} activeOpacity={0.7}>
            <Text style={[styles.actionLabel, { color: colors.error }]}>🗑 Supprimer mon compte</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function OptionButton({ label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.optionBtn, active && styles.optionBtnActive]}
      onPress={onPress} activeOpacity={0.7}
    >
      <Text style={[styles.optionText, active && styles.optionTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700', marginBottom: spacing.md },
  fieldLabel: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600', marginTop: spacing.md, marginBottom: spacing.sm },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  optionBtn: {
    paddingHorizontal: spacing.md, paddingVertical: 10, borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.borderLight, backgroundColor: colors.bgCard,
  },
  optionBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  optionText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600' },
  optionTextActive: { color: '#0b1120' },
  logoBox: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: spacing.lg, marginBottom: spacing.md,
  },
  logoImage: { width: 120, height: 120, borderRadius: radius.md, backgroundColor: colors.bg },
  logoPlaceholder: {
    width: 120, height: 120, borderRadius: radius.md,
    backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.borderLight,
    alignItems: 'center', justifyContent: 'center',
  },
  logoPlaceholderIcon: { fontSize: 36, marginBottom: 4 },
  logoPlaceholderText: { color: colors.textMuted, fontSize: fontSize.xs },
  logoActions: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'center' },
  logoBtn: {
    paddingHorizontal: spacing.lg, paddingVertical: 10, borderRadius: radius.full,
    backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.borderLight,
  },
  logoBtnText: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600' },
  logoBtnDanger: { backgroundColor: 'rgba(248,113,113,0.1)', borderColor: 'rgba(248,113,113,0.4)' },
  logoBtnDangerText: { color: colors.error, fontSize: fontSize.sm, fontWeight: '600' },
  userInfo: {
    padding: spacing.md, borderRadius: radius.md,
    backgroundColor: colors.bgInput, marginBottom: spacing.md,
  },
  userEmail: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600' },
  userRole: { color: colors.accent, fontSize: fontSize.xs, marginTop: 4, fontWeight: '600' },
  actionRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: colors.border,
  },
  actionLabel: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500' },
  actionArrow: { color: colors.textMuted, fontSize: 20, fontWeight: '300' },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)', borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.lg,
  },
  errorText: { color: colors.error, fontSize: fontSize.sm },
  successBox: {
    backgroundColor: 'rgba(16,185,129,0.12)', borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.35)', borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.lg,
  },
  successText: { color: colors.success, fontSize: fontSize.sm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
});