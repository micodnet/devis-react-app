import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity,
  RefreshControl, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { clientPortalApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';

export default function ClientPortalScreen() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadAccounts = async () => {
    try {
      setError('');
      const data = await clientPortalApi.accounts();
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAccounts();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadAccounts();
  };

  const handleInvite = (clientId, clientName) => {
    Alert.prompt
      ? Alert.prompt(
          'Inviter au portail',
          `Email pour ${clientName} :`,
          async (email) => {
            try {
              await clientPortalApi.invite(clientId, email?.trim() || null);
              Alert.alert('Succès', 'Invitation envoyée');
              await loadAccounts();
            } catch (err) {
              Alert.alert('Erreur', err.response?.data?.error || err.message);
            }
          }
        )
      : (async () => {
          try {
            await clientPortalApi.invite(clientId, null);
            Alert.alert('Succès', 'Invitation envoyée');
            await loadAccounts();
          } catch (err) {
            Alert.alert('Erreur', err.response?.data?.error || err.message);
          }
        })();
  };

  const handleRevoke = (clientId) => {
    Alert.alert('Désactiver', 'Désactiver l\'accès de ce client ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Désactiver',
        style: 'destructive',
        onPress: async () => {
          try {
            await clientPortalApi.revoke(clientId);
            await loadAccounts();
          } catch (err) {
            Alert.alert('Erreur', err.response?.data?.error || err.message);
          }
        },
      },
    ]);
  };

  const handleReactivate = async (clientId) => {
    try {
      await clientPortalApi.reactivate(clientId);
      await loadAccounts();
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || err.message);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Portail client" showBack />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Portail client" showBack />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
            tintColor={colors.accent} colors={[colors.accent]} />
        }
      >
        {!!error && (<View style={styles.errorBox}><Text style={styles.errorText}>⚠️ {error}</Text></View>)}

        <Card>
          <Text style={styles.hint}>
            Vos clients peuvent accéder à un espace personnel pour consulter
            leurs devis, factures et chantiers. Invitez-les depuis la liste
            ci-dessous.
          </Text>
        </Card>

        {accounts.length === 0 ? (
          <EmptyState
            icon="👥"
            title="Aucun compte client"
            message="Invitez vos clients à créer leur espace personnel."
          />
        ) : (
          <Card>
            <Text style={styles.sectionTitle}>Comptes clients ({accounts.length})</Text>
            {accounts.map((a) => {
              let statusBadge = { text: 'En attente', color: colors.warning };
              if (!a.active) statusBadge = { text: 'Désactivé', color: colors.error };
              else if (a.hasPassword) statusBadge = { text: 'Actif', color: colors.success };

              return (
                <View key={a.clientId} style={styles.accountRow}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.accountName} numberOfLines={1}>
                      {a.clientName}
                    </Text>
                    <Text style={styles.accountEmail} numberOfLines={1}>
                      {a.email || '—'}
                    </Text>
                    <View style={styles.badgeRow}>
                      <View style={[styles.statusBadge, { backgroundColor: statusBadge.color + '22', borderColor: statusBadge.color + '66' }]}>
                        <Text style={[styles.statusText, { color: statusBadge.color }]}>
                          {statusBadge.text}
                        </Text>
                      </View>
                      {a.lastLoginAt && (
                        <Text style={styles.lastLogin}>
                          Dernière connexion : {new Date(a.lastLoginAt).toLocaleDateString('fr-FR')}
                        </Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.actionsCol}>
                    {!a.hasPassword && (
                      <TouchableOpacity
                        style={styles.smallBtn}
                        onPress={() => handleInvite(a.clientId, a.clientName)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.smallBtnText}>
                          {a.invitationSentAt ? 'Renvoyer' : 'Inviter'}
                        </Text>
                      </TouchableOpacity>
                    )}
                    {a.active ? (
                      <TouchableOpacity
                        style={[styles.smallBtn, styles.smallBtnDanger]}
                        onPress={() => handleRevoke(a.clientId)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.smallBtnDangerText}>Désactiver</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[styles.smallBtn, styles.smallBtnSuccess]}
                        onPress={() => handleReactivate(a.clientId)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.smallBtnSuccessText}>Réactiver</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  hint: { color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 20 },
  sectionTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700', marginBottom: spacing.md },
  accountRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md,
    paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  accountName: { color: colors.text, fontSize: fontSize.sm, fontWeight: '700' },
  accountEmail: { color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm, alignItems: 'center' },
  statusBadge: {
    paddingHorizontal: spacing.sm, paddingVertical: 2,
    borderRadius: radius.full, borderWidth: 1,
  },
  statusText: { fontSize: 10, fontWeight: '700' },
  lastLogin: { color: colors.textMuted, fontSize: 10 },
  actionsCol: { flexDirection: 'row', gap: spacing.sm, flexShrink: 0 },
  smallBtn: {
    backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.borderLight,
    paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.full,
  },
  smallBtnText: { color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: '600' },
  smallBtnDanger: { backgroundColor: 'rgba(248,113,113,0.1)', borderColor: 'rgba(248,113,113,0.4)' },
  smallBtnDangerText: { color: colors.error, fontSize: fontSize.xs, fontWeight: '600' },
  smallBtnSuccess: { backgroundColor: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.4)' },
  smallBtnSuccessText: { color: colors.success, fontSize: fontSize.xs, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)', borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.lg,
  },
  errorText: { color: colors.error, fontSize: fontSize.sm },
});