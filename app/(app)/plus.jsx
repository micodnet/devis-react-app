// import { ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useRouter } from 'expo-router';
// import { useAuth } from '../../lib/auth';
// import { colors, spacing, fontSize, radius } from '../../lib/theme';
// import Header from '../../components/Header';
// import Card from '../../components/Card';
// import Button from '../../components/Button';

// const MENU_SECTIONS = [
//   {
//     title: 'Ventes',
//     items: [
//       { icon: '🧾', label: 'Factures', route: '/(app)/factures' },
//       { icon: '📋', label: 'Modèles', route: '/(app)/templates' },
//       { icon: '🔁', label: 'Récurrentes', route: '/(app)/recurring' },
//     ],
//   },
//   {
//     title: 'Catalogue & stock',
//     items: [
//       { icon: '🔧', label: 'Services', route: '/(app)/services' },
//       { icon: '📦', label: 'Stock', route: '/(app)/stock' },
//       { icon: '🚚', label: 'Fournisseurs', route: '/(app)/suppliers' },
//       { icon: '🛒', label: 'Bons de commande', route: '/(app)/purchase-orders' },
//     ],
//   },
//   {
//     title: 'Chantiers',
//     items: [
//       { icon: '🏗️', label: 'Chantiers', route: '/(app)/chantiers' },
//       { icon: '🔨', label: 'Sous-traitants', route: '/(app)/subcontractors' },
//       { icon: '📋', label: 'Toutes les missions', route: '/(app)/assignments' },
//     ],
//   },
//   {
//     title: 'Outils IA',
//     items: [
//       { icon: '📷', label: 'Analyse image', route: '/(app)/vision' },
//       { icon: '✨', label: 'Assistant proactif', route: '/(app)/proactive' },
//     ],
//   },
//   {
//     title: 'Communication',
//     items: [
//       { icon: '💬', label: 'Messages clients', route: '/(app)/chat' },
//       { icon: '📧', label: 'Import email', route: '/(app)/email-import' },
//       { icon: '📱', label: 'SMS', route: '/(app)/sms' },
//     ],
//   },
//   {
//     title: 'Pilotage',
//     items: [
//       { icon: '📊', label: 'Tableau de bord', route: '/(app)/dashboard' },
//       { icon: '📈', label: 'Analytics', route: '/(app)/analytics' },
//       { icon: '📄', label: 'Rapports', route: '/(app)/reports' },
//       { icon: '📅', label: 'Rendez-vous', route: '/(app)/appointments' },
//       { icon: '👥', label: 'Portail client', route: '/(app)/client-portal' },
//       { icon: '💳', label: 'Paiements', route: '/(app)/online-payments' },
//       { icon: '🏦', label: 'Banque', route: '/(app)/bank' },
//     ],
//   },
//   {
//     title: 'Développeur',
//     items: [
//       { icon: '🗃', label: 'Clés API', route: '/(app)/api-keys' },
//       { icon: '🔔', label: 'Webhooks', route: '/(app)/webhooks' },
//       { icon: '🔐', label: 'OAuth', route: '/(app)/oauth' },
//     ],
//   },
//   {
//     title: 'Paramètres avancés',
//     items: [
//       { icon: '💳', label: 'Abonnement', route: '/(app)/subscription' },
//       { icon: '📨', label: 'Peppol', route: '/(app)/peppol-settings' },
//       { icon: '🎬', label: 'Démo & Onboarding', route: '/(app)/demo' },
//     ],
//   },
//   {
//     title: 'Compte',
//     items: [
//       { icon: '⚙️', label: 'Paramètres', route: '/(app)/settings' },
//       { icon: '🔔', label: 'Notifications', route: '/(app)/notifications' },
//       { icon: '👥', label: 'Équipe', route: '/(app)/team' },
//     ],
//   },
// ];

// export default function PlusScreen() {
//   const router = useRouter();
//   const { user, logout } = useAuth();

//   return (
//     <SafeAreaView style={styles.safe} edges={['top']}>
//       <Header
//         title="Plus"
//         right={<Text style={styles.email}>{user?.email}</Text>}
//       />

//       <ScrollView contentContainerStyle={styles.scroll}>
//         {MENU_SECTIONS.map((section) => (
//           <Card key={section.title}>
//             <Text style={styles.sectionTitle}>{section.title}</Text>
//             <View style={styles.menuGrid}>
//               {section.items.map((item) => (
//                 <TouchableOpacity
//                   key={item.route}
//                   style={styles.menuItem}
//                   onPress={() => router.push(item.route)}
//                   activeOpacity={0.7}
//                 >
//                   <Text style={styles.menuIcon}>{item.icon}</Text>
//                   <Text style={styles.menuLabel}>{item.label}</Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           </Card>
//         ))}

//         <Card>
//           <Text style={styles.sectionTitle}>Session</Text>
//           <View style={styles.userInfo}>
//             <Text style={styles.userEmail}>{user?.email}</Text>
//             <Text style={styles.userRole}>Rôle : {user?.role || 'owner'}</Text>
//           </View>
//           <View style={{ height: spacing.md }} />
//           <Button title="Se déconnecter" onPress={logout} variant="secondary" />
//         </Card>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: colors.bg },
//   scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
//   email: { color: colors.textSecondary, fontSize: fontSize.xs },
//   sectionTitle: {
//     color: colors.text,
//     fontSize: fontSize.md,
//     fontWeight: '700',
//     marginBottom: spacing.md,
//   },
//   menuGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: spacing.sm,
//   },
//   menuItem: {
//     width: '47%',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: spacing.lg,
//     borderRadius: radius.md,
//     borderWidth: 1,
//     borderColor: colors.borderLight,
//     backgroundColor: colors.bgInput,
//     gap: spacing.sm,
//   },
//   menuIcon: { fontSize: 28 },
//   menuLabel: {
//     color: colors.text,
//     fontSize: fontSize.sm,
//     fontWeight: '600',
//     textAlign: 'center',
//   },
//   userInfo: {
//     padding: spacing.md,
//     borderRadius: radius.md,
//     backgroundColor: colors.bgInput,
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
// });

import { ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';

const MENU_SECTIONS = [
  {
    title: 'Ventes',
    items: [
      { icon: '🧾', label: 'Factures', route: '/(app)/factures' },
      { icon: '📋', label: 'Modèles', route: '/(app)/templates' },
      { icon: '🔁', label: 'Récurrentes', route: '/(app)/recurring' },
    ],
  },
  {
    title: 'Catalogue & stock',
    items: [
      { icon: '🔧', label: 'Services', route: '/(app)/services' },
      { icon: '📦', label: 'Stock', route: '/(app)/stock' },
      { icon: '🚚', label: 'Fournisseurs', route: '/(app)/suppliers' },
      { icon: '🛒', label: 'Bons de commande', route: '/(app)/purchase-orders' },
    ],
  },
  {
    title: 'Chantiers',
    items: [
      { icon: '🏗️', label: 'Chantiers', route: '/(app)/chantiers' },
      { icon: '🔨', label: 'Sous-traitants', route: '/(app)/subcontractors' },
      { icon: '📋', label: 'Missions', route: '/(app)/assignments' },
    ],
  },
  {
    title: 'Communication',
    items: [
      { icon: '💬', label: 'Messages clients', route: '/(app)/chat' },
      { icon: '📧', label: 'Import email', route: '/(app)/email-import' },
      { icon: '📱', label: 'SMS', route: '/(app)/sms' },
    ],
  },
  {
    title: 'Outils IA',
    items: [
      { icon: '📷', label: 'Analyse image', route: '/(app)/vision' },
      { icon: '✨', label: 'Assistant proactif', route: '/(app)/proactive' },
    ],
  },
  {
    title: 'Pilotage',
    items: [
      { icon: '📊', label: 'Tableau de bord', route: '/(app)/dashboard' },
      { icon: '📈', label: 'Analytics', route: '/(app)/analytics' },
      { icon: '📄', label: 'Rapports', route: '/(app)/reports' },
      { icon: '📅', label: 'Rendez-vous', route: '/(app)/appointments' },
      { icon: '👥', label: 'Portail client', route: '/(app)/client-portal' },
      { icon: '💳', label: 'Paiements en ligne', route: '/(app)/online-payments' },
      { icon: '🏦', label: 'Banque', route: '/(app)/bank' },
    ],
  },
  {
    title: 'Développeur',
    items: [
      { icon: '🗃', label: 'Clés API', route: '/(app)/api-keys' },
      { icon: '🔔', label: 'Webhooks', route: '/(app)/webhooks' },
      { icon: '🔐', label: 'OAuth', route: '/(app)/oauth' },
    ],
  },
  {
    title: 'Paramètres avancés',
    items: [
      { icon: '💳', label: 'Abonnement', route: '/(app)/subscription' },
      { icon: '📨', label: 'Peppol', route: '/(app)/peppol-settings' },
      { icon: '💱', label: 'Devises', route: '/(app)/currency' },
      { icon: '📥', label: 'Export RGPD', route: '/(app)/export-data' },
      { icon: '🎬', label: 'Démo & Onboarding', route: '/(app)/demo' },
      { icon: '🎓', label: 'Visite guidée', route: '/(app)/onboarding-tour' },
    ],
  },
  {
    title: 'Compte',
    items: [
      { icon: '⚙️', label: 'Paramètres', route: '/(app)/settings' },
      { icon: '🔔', label: 'Notifications', route: '/(app)/notifications' },
      { icon: '👥', label: 'Équipe', route: '/(app)/team' },
    ],
  },
];

export default function PlusScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header
        title="Plus"
        right={<Text style={styles.email}>{user?.email}</Text>}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        {MENU_SECTIONS.map((section) => (
          <Card key={section.title}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuGrid}>
              {section.items.map((item) => (
                <TouchableOpacity
                  key={item.route}
                  style={styles.menuItem}
                  onPress={() => router.push(item.route)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        ))}

        <Card>
          <Text style={styles.sectionTitle}>Session</Text>
          <View style={styles.userInfo}>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <Text style={styles.userRole}>Rôle : {user?.role || 'owner'}</Text>
          </View>
          <View style={{ height: spacing.md }} />
          <Button
            title="Se déconnecter"
            onPress={async () => {
              await logout();
              router.replace('/(auth)/login');
            }}
            variant="secondary"
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  email: { color: colors.textSecondary, fontSize: fontSize.xs },
  sectionTitle: {
    color: colors.text, fontSize: fontSize.md, fontWeight: '700', marginBottom: spacing.md,
  },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  menuItem: {
    width: '47%', alignItems: 'center', justifyContent: 'center',
    paddingVertical: spacing.lg, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.borderLight,
    backgroundColor: colors.bgInput, gap: spacing.sm,
  },
  menuIcon: { fontSize: 28 },
  menuLabel: {
    color: colors.text, fontSize: fontSize.sm, fontWeight: '600', textAlign: 'center',
  },
  userInfo: {
    padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.bgInput,
  },
  userEmail: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600' },
  userRole: { color: colors.accent, fontSize: fontSize.xs, marginTop: 4, fontWeight: '600' },
});