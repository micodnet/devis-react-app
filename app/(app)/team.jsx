import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity,
  RefreshControl, Alert, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { teamApi } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';

const ROLE_LABELS = { owner: 'Propriétaire', admin: 'Admin', member: 'Membre' };
const ROLE_COLORS = {
  owner: '#f97316',
  admin: '#3b82f6',
  member: '#94a3b8',
};

export default function TeamScreen() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviting, setInviting] = useState(false);

  const loadTeam = async () => {
    try {
      setError('');
      const [membersRes, invsRes] = await Promise.all([
        teamApi.members(),
        teamApi.invitations().catch(() => []),
      ]);
      setData(membersRes);
      setInvitations(Array.isArray(invsRes) ? invsRes : []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTeam();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadTeam();
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      Alert.alert('Erreur', 'Email requis.');
      return;
    }
    setInviting(true);
    try {
      await teamApi.invite(inviteEmail.trim().toLowerCase(), inviteRole);
      Alert.alert('Succès', 'Invitation envoyée !');
      setInviteOpen(false);
      setInviteEmail('');
      setInviteRole('member');
      await loadTeam();
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || err.message);
    } finally {
      setInviting(false);
    }
  };

  const changeRole = (id, currentRole, newRole) => {
    if (newRole === currentRole) return;
    Alert.alert(
      'Changer le rôle',
      `Passer ce membre en "${ROLE_LABELS[newRole]}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Changer',
          onPress: async () => {
            try {
              await teamApi.changeRole(id, newRole);
              await loadTeam();
            } catch (err) {
              Alert.alert('Erreur', err.response?.data?.error || err.message);
            }
          },
        },
      ]
    );
  };

  const removeMember = (id, email) => {
    Alert.alert(
      'Retirer le membre',
      `Retirer ${email} de votre équipe ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Retirer',
          style: 'destructive',
          onPress: async () => {
            try {
              await teamApi.remove(id);
              await loadTeam();
            } catch (err) {
              Alert.alert('Erreur', err.response?.data?.error || err.message);
            }
          },
        },
      ]
    );
  };

  const cancelInvitation = (id) => {
    Alert.alert('Annuler l\'invitation', 'Confirmer ?', [
      { text: 'Non', style: 'cancel' },
      {
        text: 'Oui',
        style: 'destructive',
        onPress: async () => {
          try {
            await teamApi.cancelInvitation(id);
            await loadTeam();
          } catch (err) {
            Alert.alert('Erreur', err.response?.data?.error || err.message);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Équipe" showBack />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>
      </SafeAreaView>
    );
  }

  const members = data?.members || [];
  const myRole = data?.myRole || 'owner';
  const canManage = myRole === 'owner' || myRole === 'admin';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header
        title="Équipe"
        showBack
        right={
          canManage ? (
            <TouchableOpacity
              style={styles.newBtn}
              onPress={() => setInviteOpen(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.newBtnText}>+ Inviter</Text>
            </TouchableOpacity>
          ) : null
        }
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
            tintColor={colors.accent} colors={[colors.accent]} />
        }
      >
        {!!error && (<View style={styles.errorBox}><Text style={styles.errorText}>⚠️ {error}</Text></View>)}

        <Card>
          <Text style={styles.sectionTitle}>👥 Membres ({members.length})</Text>
          {members.length === 0 ? (
            <Text style={styles.empty}>Aucun membre.</Text>
          ) : (
            members.map((m) => {
              const roleColor = ROLE_COLORS[m.role] || '#94a3b8';
              const canModify = canManage && m.role !== 'owner' && !m.isMe;
              return (
                <View key={m.id} style={styles.memberRow}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.memberEmail} numberOfLines={1}>
                      {m.email}
                      {m.isMe ? ' (vous)' : ''}
                    </Text>
                    <Text style={styles.memberDate}>
                      Depuis le {new Date(m.createdAt).toLocaleDateString('fr-FR')}
                    </Text>
                    <View style={[styles.roleBadge, { backgroundColor: roleColor + '22', borderColor: roleColor + '66' }]}>
                      <Text style={[styles.roleBadgeText, { color: roleColor }]}>
                        {ROLE_LABELS[m.role] || m.role}
                      </Text>
                    </View>
                  </View>

                  {canModify && (
                    <View style={styles.memberActions}>
                      <TouchableOpacity
                        style={styles.smallBtn}
                        onPress={() => changeRole(m.id, m.role, m.role === 'admin' ? 'member' : 'admin')}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.smallBtnText}>
                          {m.role === 'admin' ? 'Membre' : 'Admin'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.smallBtn, styles.smallBtnDanger]}
                        onPress={() => removeMember(m.id, m.email)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.smallBtnDangerText}>Retirer</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </Card>

        {invitations.length > 0 && (
          <Card>
            <Text style={styles.sectionTitle}>📨 Invitations en attente ({invitations.length})</Text>
            {invitations.map((inv) => (
              <View key={inv.id} style={styles.invitationRow}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.memberEmail} numberOfLines={1}>{inv.email}</Text>
                  <Text style={styles.memberDate}>
                    {ROLE_LABELS[inv.role] || inv.role} · expire le{' '}
                    {new Date(inv.expiresAt).toLocaleDateString('fr-FR')}
                  </Text>
                </View>
                {canManage && (
                  <TouchableOpacity
                    style={[styles.smallBtn, styles.smallBtnDanger]}
                    onPress={() => cancelInvitation(inv.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.smallBtnDangerText}>Annuler</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </Card>
        )}

        <Card>
          <Text style={styles.sectionTitle}>ℹ️ À propos</Text>
          <Text style={styles.hint}>
            Invitez vos collaborateurs pour travailler ensemble. Ils verront
            les mêmes clients, devis, factures et chantiers que vous.
            {'\n\n'}
            Rôles :
            {'\n'}• <Text style={styles.bold}>Propriétaire</Text> : accès total
            {'\n'}• <Text style={styles.bold}>Admin</Text> : tout sauf gérer l'équipe
            {'\n'}• <Text style={styles.bold}>Membre</Text> : peut créer et modifier les devis
          </Text>
        </Card>
      </ScrollView>

      {/* Modal Invitation */}
      <Modal visible={inviteOpen} transparent animationType="slide" onRequestClose={() => setInviteOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Inviter un membre</Text>
            <Input
              label="Email *"
              value={inviteEmail}
              onChangeText={setInviteEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="collaborateur@entreprise.com"
            />
            <Text style={styles.fieldLabel}>Rôle</Text>
            <View style={styles.roleRow}>
              <TouchableOpacity
                style={[styles.roleBtn, inviteRole === 'admin' && styles.roleBtnActive]}
                onPress={() => setInviteRole('admin')}
                activeOpacity={0.7}
              >
                <Text style={[styles.roleText, inviteRole === 'admin' && styles.roleTextActive]}>
                  Admin
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleBtn, inviteRole === 'member' && styles.roleBtnActive]}
                onPress={() => setInviteRole('member')}
                activeOpacity={0.7}
              >
                <Text style={[styles.roleText, inviteRole === 'member' && styles.roleTextActive]}>
                  Membre
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setInviteOpen(false)} disabled={inviting}>
                <Text style={styles.modalBtnCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnConfirm]}
                onPress={handleInvite} disabled={inviting}>
                <Text style={styles.modalBtnConfirmText}>
                  {inviting ? '...' : 'Inviter'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  newBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md, paddingVertical: 6,
    borderRadius: radius.full,
  },
  newBtnText: { color: '#0b1120', fontSize: fontSize.xs, fontWeight: '700' },
  sectionTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700', marginBottom: spacing.md },
  memberRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md,
    paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  memberEmail: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600' },
  memberDate: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },
  roleBadge: {
    alignSelf: 'flex-start', marginTop: spacing.sm,
    paddingHorizontal: spacing.sm, paddingVertical: 2,
    borderRadius: radius.full, borderWidth: 1,
  },
  roleBadgeText: { fontSize: 10, fontWeight: '700' },
  memberActions: { flexDirection: 'row', gap: spacing.sm, flexShrink: 0 },
  smallBtn: {
    backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.borderLight,
    paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.full,
  },
  smallBtnText: { color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: '600' },
  smallBtnDanger: { backgroundColor: 'rgba(248,113,113,0.1)', borderColor: 'rgba(248,113,113,0.4)' },
  smallBtnDangerText: { color: colors.error, fontSize: fontSize.xs, fontWeight: '600' },
  invitationRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  hint: { color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 20 },
  bold: { color: colors.text, fontWeight: '700' },
  empty: { color: colors.textMuted, fontSize: fontSize.sm, fontStyle: 'italic', textAlign: 'center', paddingVertical: spacing.lg },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  modalBox: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg, padding: spacing.lg,
    width: '100%', maxWidth: 450, borderWidth: 1, borderColor: colors.borderLight,
  },
  modalTitle: { color: colors.text, fontSize: fontSize.lg, fontWeight: '800', marginBottom: spacing.lg },
  fieldLabel: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600', marginTop: spacing.md, marginBottom: spacing.sm },
  roleRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  roleBtn: {
    flex: 1, paddingVertical: 10, borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.borderLight, backgroundColor: colors.bgCard,
    alignItems: 'center',
  },
  roleBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  roleText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600' },
  roleTextActive: { color: '#0b1120' },
  modalActions: { flexDirection: 'row', gap: spacing.sm },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', minHeight: 44 },
  modalBtnCancel: { backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.borderLight },
  modalBtnCancelText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600' },
  modalBtnConfirm: { backgroundColor: colors.accent },
  modalBtnConfirmText: { color: '#0b1120', fontSize: fontSize.sm, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)', borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.lg,
  },
  errorText: { color: colors.error, fontSize: fontSize.sm },
});