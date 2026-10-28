import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { clientPortalApi, quotesApi, invoicesApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function PortalClientDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [account, setAccount] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/client-portal');
  };

  useEffect(() => { loadAll(); }, [id]);

  const loadAll = async () => {
    try {
      setError('');
      const [accounts, q, i] = await Promise.all([
        clientPortalApi.accounts().catch(() => []),
        quotesApi.list().catch(() => []),
        invoicesApi.list().catch(() => []),
      ]);
      const acc = (accounts || []).find((a) => String(a.clientId || a.client_id) === String(id));
      setAccount(acc || null);

      // Filtrer devis et factures du client
      const clientName = acc?.clientName || acc?.client_name;
      if (clientName) {
        setQuotes((q || []).filter((x) => x.clientName === clientName));
        setInvoices((i || []).filter((x) => x.clientName === clientName));
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const invite = () => {
    Alert.prompt
      ? Alert.prompt(
          'Inviter',
          'Email :',
          async (email) => {
            try {
              await clientPortalApi.invite(id, email?.trim() || null);
              Alert.alert('Succès', 'Invitation envoyée');
              await loadAll();
            } catch (err) { Alert.alert('Erreur', err.response?.data?.error || err.message); }
          },
          'plain-text',
          account?.email || ''
        )
      : null;
  };

  const revoke = () => {
    Alert.alert('Désactiver', 'Désactiver cet accès ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Désactiver', style: 'destructive',
        onPress: async () => {
          try {
            await clientPortalApi.revoke(id);
            await loadAll();
          } catch (err) { Alert.alert('Erreur', err.response?.data?.error || err.message); }
        },
      },
    ]);
  };

  const reactivate = async () => {
    try {
      await clientPortalApi.reactivate(id);
      await loadAll();
    } catch (err) { Alert.alert('Erreur', err.response?.data?.error || err.message); }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Compte client" showBack />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>
      </SafeAreaView>
    );
  }

  if (error || !account) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Compte client" showBack />
        <View style={styles.center}>
          <Text style={styles.errorText}>⚠️ {error || 'Compte introuvable'}</Text>
          <Button title="Retour" onPress={handleBack} variant="secondary" />
        </View>
      </SafeAreaView>
    );
  }

  const fmt = (n) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency', currency: 'EUR', minimumFractionDigits: 2,
    }).format(n || 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title={account.clientName || 'Compte client'} showBack />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card>
          <Text style={styles.sectionTitle}>Informations</Text>
          <Row label="Client" value={account.clientName || '—'} />
          <Row label="Email" value={account.email || '—'} />
          <Row label="Statut" value={!account.active ? 'Désactivé' : (account.hasPassword ? 'Actif' : 'En attente')} />
          {account.lastLoginAt ? (
            <Row label="Dernière connexion" value={new Date(account.lastLoginAt).toLocaleString('fr-FR')} />
          ) : null}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Actions</Text>

          {!account.hasPassword && (
            <TouchableOpacity style={styles.actionRow} onPress={invite} activeOpacity={0.7}>
              <Text style={[styles.actionLabel, { color: colors.accent }]}>✉️ Inviter</Text>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>
          )}

          {account.active ? (
            <TouchableOpacity style={styles.actionRow} onPress={revoke} activeOpacity={0.7}>
              <Text style={[styles.actionLabel, { color: colors.warning }]}>🚫 Désactiver</Text>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.actionRow} onPress={reactivate} activeOpacity={0.7}>
              <Text style={[styles.actionLabel, { color: colors.success }]}>✓ Réactiver</Text>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>
          )}
        </Card>

        <Text style={styles.sectionTitleOutside}>Devis ({quotes.length})</Text>
        {quotes.length === 0 ? (
          <Card><Text style={styles.empty}>Aucun devis.</Text></Card>
        ) : (
          quotes.slice(0, 10).map((q) => (
            <TouchableOpacity key={q.id}
              onPress={() => router.push(`/quote/${q.id}`)}
              activeOpacity={0.7}
              style={styles.itemRow}
            >
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.itemTitle}>{q.quoteNumber}</Text>
                <Text style={styles.itemSub}>{q.issueDate}</Text>
              </View>
              <Text style={styles.itemAmount}>{fmt(q.total)}</Text>
            </TouchableOpacity>
          ))
        )}

        <Text style={styles.sectionTitleOutside}>Factures ({invoices.length})</Text>
        {invoices.length === 0 ? (
          <Card><Text style={styles.empty}>Aucune facture.</Text></Card>
        ) : (
          invoices.slice(0, 10).map((inv) => (
            <TouchableOpacity key={inv.id}
              onPress={() => router.push(`/invoice/${inv.id}`)}
              activeOpacity={0.7}
              style={styles.itemRow}
            >
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.itemTitle}>{inv.invoiceNumber}</Text>
                <Text style={styles.itemSub}>{inv.issueDate}</Text>
              </View>
              <Text style={styles.itemAmount}>{fmt(inv.total)}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={3}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700', marginBottom: spacing.md },
  sectionTitleOutside: {
    color: colors.text, fontSize: fontSize.md, fontWeight: '700',
    marginTop: spacing.lg, marginBottom: spacing.md,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, gap: spacing.md },
  label: { color: colors.textSecondary, fontSize: fontSize.sm },
  value: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500', flexShrink: 1, textAlign: 'right' },
  actionRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: colors.border,
  },
  actionLabel: { color: colors.text, fontSize: fontSize.sm, fontWeight: '500' },
  actionArrow: { color: colors.textMuted, fontSize: 20, fontWeight: '300' },
  itemRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.md, paddingHorizontal: spacing.lg,
    borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.md,
  },
  itemTitle: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600' },
  itemSub: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },
  itemAmount: { color: colors.accent, fontSize: fontSize.sm, fontWeight: '700' },
  empty: { color: colors.textMuted, fontSize: fontSize.sm, fontStyle: 'italic', textAlign: 'center', paddingVertical: spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorText: { color: colors.error, fontSize: fontSize.md, textAlign: 'center', marginBottom: spacing.lg },
});