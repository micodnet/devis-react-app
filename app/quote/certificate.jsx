import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { signatureApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function CertificateScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace(`/quote/${id}`);
  };

  useEffect(() => { loadCertificate(); }, [id]);

  const loadCertificate = async () => {
    try {
      const data = await signatureApi.certificate(id);
      setCertificate(data.certificate || data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    setVerifying(true);
    setVerifyResult(null);
    try {
      const data = await signatureApi.verify(id);
      setVerifyResult(data);
    } catch (err) {
      setVerifyResult({
        valid: false,
        message: err.response?.data?.error || err.message,
      });
    } finally {
      setVerifying(false);
    }
  };

  const copyToClipboard = async (text, label) => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert('Copié', `${label} copié dans le presse-papier`);
    } catch (err) {
      Alert.alert(label, text);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Certificat" showBack />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>
      </SafeAreaView>
    );
  }

  if (error || !certificate) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Certificat" showBack />
        <View style={styles.center}>
          <Text style={styles.errorText}>⚠️ {error || 'Certificat indisponible'}</Text>
          <Button title="Retour" onPress={handleBack} variant="secondary" />
        </View>
      </SafeAreaView>
    );
  }

  const q = certificate.quote || {};
  const sig = certificate.signature || {};
  const company = certificate.company || {};

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Certificat de signature" showBack />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card>
          <Text style={styles.certTitle}>Certificat de signature électronique</Text>
          <Text style={styles.certSubtitle}>
            Conforme au règlement eIDAS (UE) n° 910/2014
          </Text>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>1. Devis</Text>
          <Row label="N° de devis" value={q.number || '—'} />
          <Row label="Date d'émission" value={q.issueDate || '—'} />
          <Row label="Date de validité" value={q.validDate || '—'} />
          <Row label="Client" value={q.clientName || '—'} />
          <Row label="Email client" value={q.clientEmail || '—'} />
          <Row label="Total HT" value={`${(q.subtotal || 0).toFixed(2)} €`} />
          <Row label="TVA" value={`${(q.vatAmount || 0).toFixed(2)} €`} />
          <Row label="Total TTC" value={`${(q.total || 0).toFixed(2)} €`} />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>2. Signataire</Text>
          <Row label="Nom" value={sig.signedBy || '—'} />
          <Row label="Date et heure" value={sig.signedAt ? new Date(sig.signedAt).toLocaleString('fr-FR') : '—'} />
          <Row label="Méthode" value={sig.method === 'draw' ? 'Signature manuscrite' : 'Case à cocher'} />
          <Row label="Adresse IP" value={sig.ip || '—'} />
          {sig.userAgent ? <Row label="User-Agent" value={sig.userAgent} /> : null}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>3. Preuves d'intégrité</Text>
          {sig.hash ? (
            <>
              <Text style={styles.hashLabel}>Hash SHA-256 du devis</Text>
              <View style={styles.hashBox}>
                <Text style={styles.hashText} selectable>{sig.hash}</Text>
              </View>
              <TouchableOpacity style={styles.copyBtn}
                onPress={() => copyToClipboard(sig.hash, 'Hash')} activeOpacity={0.7}>
                <Text style={styles.copyBtnText}>📋 Copier le hash</Text>
              </TouchableOpacity>
            </>
          ) : null}
          {sig.timestamp ? (
            <Row label="Horodatage" value={new Date(sig.timestamp).toLocaleString('fr-FR')} />
          ) : null}
          {sig.timestampSource ? (
            <Row label="Source" value={sig.timestampSource} />
          ) : null}
          {sig.token ? (
            <>
              <Text style={styles.hashLabel}>Token de vérification</Text>
              <View style={styles.hashBox}>
                <Text style={styles.hashText} selectable>{sig.token}</Text>
              </View>
              <TouchableOpacity style={styles.copyBtn}
                onPress={() => copyToClipboard(sig.token, 'Token')} activeOpacity={0.7}>
                <Text style={styles.copyBtnText}>📋 Copier le token</Text>
              </TouchableOpacity>
            </>
          ) : null}
        </Card>

        {certificate.auditTrail && certificate.auditTrail.length > 0 && (
          <Card>
            <Text style={styles.sectionTitle}>4. Audit trail</Text>
            {certificate.auditTrail.map((ev, i) => (
              <View key={i} style={styles.auditRow}>
                <Text style={styles.auditEvent}>{ev.event}</Text>
                <Text style={styles.auditDate}>
                  {new Date(ev.date).toLocaleString('fr-FR')}
                </Text>
                {ev.ip ? <Text style={styles.auditIp}>IP : {ev.ip}</Text> : null}
              </View>
            ))}
          </Card>
        )}

        <Card>
          <Text style={styles.sectionTitle}>5. Vérification d'intégrité</Text>
          <Text style={styles.verifyHint}>
            Vérifiez que le document n'a pas été modifié depuis la signature.
          </Text>
          <TouchableOpacity
            style={[styles.verifyBtn, verifying && { opacity: 0.5 }]}
            onPress={verify}
            disabled={verifying}
            activeOpacity={0.7}
          >
            <Text style={styles.verifyBtnText}>
              {verifying ? 'Vérification...' : '🔍 Vérifier l\'intégrité'}
            </Text>
          </TouchableOpacity>

          {verifyResult && (
            <View style={[
              styles.verifyResult,
              verifyResult.valid
                ? { backgroundColor: 'rgba(34,197,94,0.15)', borderColor: 'rgba(34,197,94,0.4)' }
                : { backgroundColor: 'rgba(248,113,113,0.15)', borderColor: 'rgba(248,113,113,0.4)' },
            ]}>
              <Text style={[
                styles.verifyResultText,
                { color: verifyResult.valid ? colors.success : colors.error },
              ]}>
                {verifyResult.valid
                  ? '✅ Signature valide — document non modifié'
                  : '❌ ' + (verifyResult.message || 'Signature invalide')}
              </Text>
            </View>
          )}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Émetteur</Text>
          <Row label="Entreprise" value={company.companyName || '—'} />
          <Row label="Email" value={company.email || '—'} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={5}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700', marginBottom: spacing.md },
  certTitle: { color: colors.text, fontSize: fontSize.lg, fontWeight: '800', textAlign: 'center' },
  certSubtitle: { color: colors.textMuted, fontSize: fontSize.xs, textAlign: 'center', marginTop: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, gap: spacing.md },
  label: { color: colors.textSecondary, fontSize: fontSize.sm },
  value: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500', flexShrink: 1, textAlign: 'right' },
  hashLabel: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600', marginTop: spacing.sm, marginBottom: spacing.sm },
  hashBox: {
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.borderLight,
    borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm,
  },
  hashText: { color: colors.accent, fontSize: 10, fontFamily: 'monospace' },
  copyBtn: {
    paddingVertical: 10, borderRadius: radius.full,
    backgroundColor: colors.bgInput, borderWidth: 1,
    borderColor: colors.borderLight, alignItems: 'center', marginBottom: spacing.md,
  },
  copyBtnText: { color: colors.text, fontSize: fontSize.xs, fontWeight: '600' },
  auditRow: {
    paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  auditEvent: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600' },
  auditDate: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },
  auditIp: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },
  verifyHint: { color: colors.textSecondary, fontSize: fontSize.sm, marginBottom: spacing.md },
  verifyBtn: {
    paddingVertical: 12, borderRadius: radius.full, backgroundColor: colors.accent,
    alignItems: 'center',
  },
  verifyBtnText: { color: '#0b1120', fontSize: fontSize.sm, fontWeight: '700' },
  verifyResult: {
    padding: spacing.md, borderRadius: radius.md, marginTop: spacing.md,
    borderWidth: 1,
  },
  verifyResultText: { fontSize: fontSize.sm, fontWeight: '700', textAlign: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorText: { color: colors.error, fontSize: fontSize.md, textAlign: 'center', marginBottom: spacing.lg },
});