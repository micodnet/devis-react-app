import { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, FlatList,
  TouchableOpacity, ActivityIndicator, RefreshControl,
  TextInput, KeyboardAvoidingView, Platform, Alert, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { clientsApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import ListItem from '../../components/ListItem';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';

export default function ClientsScreen() {
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const loadClients = async () => {
    try {
      setError('');
      const data = await clientsApi.list();
      setClients(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadClients();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadClients();
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.contactName || '').toLowerCase().includes(q)
    );
  }, [clients, search]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header
        title="Clients"
        right={
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => router.push('/export')}
              style={styles.iconBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.iconBtnText}>⬇</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/import/clients')}
              style={styles.iconBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.iconBtnText}>⬆</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/client/new')}
              style={styles.newBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.newBtnText}>+ Nouveau</Text>
            </TouchableOpacity>
          </View>
        }
      />
      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="🔍 Rechercher un client..."
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <Button title="Réessayer" onPress={loadClients} variant="secondary" />
        </View>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="👥"
          title={search ? 'Aucun résultat' : 'Aucun client'}
          message={
            search
              ? 'Essayez un autre terme de recherche.'
              : 'Ajoutez vos clients depuis l\'application web pour les retrouver ici.'
          }
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <ListItem
              icon="👤"
              title={item.name || 'Sans nom'}
              subtitle={item.email || item.contactName || item.phone || '—'}
              onPress={() => router.push(`/client/${item.id}`)}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
          ListFooterComponent={
            <Text style={styles.footer}>
              {filtered.length} client{filtered.length > 1 ? 's' : ''}
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.md,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  footer: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
    newBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  newBtnText: {
    color: '#0b1120',
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconBtn: {
    width: 36, height: 36, borderRadius: radius.full,
    backgroundColor: colors.bgInput, borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center', justifyContent: 'center',
  },
  iconBtnText: { color: colors.text, fontSize: 16, fontWeight: '700' },
});