import { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, FlatList,
  TouchableOpacity, ActivityIndicator, RefreshControl,
  TextInput, KeyboardAvoidingView, Platform, Alert, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { suppliersApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import ListItem from '../../components/ListItem';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';

export default function SuppliersScreen() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const loadSuppliers = async () => {
    try {
      setError('');
      const data = await suppliersApi.list();
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSuppliers();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadSuppliers();
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return suppliers;
    return suppliers.filter(
      (s) =>
        (s.name || '').toLowerCase().includes(q) ||
        (s.email || '').toLowerCase().includes(q) ||
        (s.category || '').toLowerCase().includes(q)
    );
  }, [suppliers, search]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
          <Header
        title="Fournisseurs"
        right={
          <TouchableOpacity
            onPress={() => router.push('/supplier/new')}
            style={styles.newBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.newBtnText}>+ Nouveau</Text>
          </TouchableOpacity>
        }
      />
      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="🔍 Rechercher un fournisseur..."
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <Button title="Réessayer" onPress={loadSuppliers} variant="secondary" />
        </View>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="🚚"
          title={search ? 'Aucun résultat' : 'Aucun fournisseur'}
          message={
            search
              ? 'Essayez un autre terme.'
              : 'Ajoutez vos fournisseurs depuis l\'application web.'
          }
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <ListItem
              icon="🚚"
              title={item.name}
              subtitle={item.email || item.contactName || item.phone || '—'}
              onPress={() => router.push(`/supplier/${item.id}`)}
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
              {filtered.length} fournisseur{filtered.length > 1 ? 's' : ''}
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
});