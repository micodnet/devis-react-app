// // // import { Tabs } from 'expo-router';
// // // import { Ionicons } from '@expo/vector-icons';
// // // import { colors } from '../../lib/theme';

// // // export default function AppLayout() {
// // //   return (
// // //     <Tabs
// // //       screenOptions={{
// // //         headerShown: false,
// // //         tabBarActiveTintColor: colors.accent,
// // //         tabBarInactiveTintColor: colors.textMuted,
// // //         tabBarStyle: {
// // //           backgroundColor: colors.bgCard,
// // //           borderTopColor: colors.border,
// // //           borderTopWidth: 1,
// // //           height: 64,
// // //           paddingBottom: 8,
// // //           paddingTop: 6,
// // //         },
// // //         tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
// // //       }}
// // //     >
// // //       <Tabs.Screen
// // //         name="devis"
// // //         options={{
// // //           title: 'Devis',
// // //           tabBarIcon: ({ color, size }) => (
// // //             <Ionicons name="document-text-outline" size={size} color={color} />
// // //           ),
// // //         }}
// // //       />
// // //       <Tabs.Screen
// // //         name="clients"
// // //         options={{
// // //           title: 'Clients',
// // //           tabBarIcon: ({ color, size }) => (
// // //             <Ionicons name="people-outline" size={size} color={color} />
// // //           ),
// // //         }}
// // //       />
// // //       <Tabs.Screen
// // //         name="catalogue"
// // //         options={{
// // //           title: 'Produits',
// // //           tabBarIcon: ({ color, size }) => (
// // //             <Ionicons name="cube-outline" size={size} color={color} />
// // //           ),
// // //         }}
// // //       />
// // //       <Tabs.Screen
// // //         name="assistant"
// // //         options={{
// // //           title: 'Assistant',
// // //           tabBarIcon: ({ color, size }) => (
// // //             <Ionicons name="sparkles-outline" size={size} color={color} />
// // //           ),
// // //         }}
// // //       />
// // //       <Tabs.Screen
// // //         name="plus"
// // //         options={{
// // //           title: 'Plus',
// // //           tabBarIcon: ({ color, size }) => (
// // //             <Ionicons
// // //               name="ellipsis-horizontal-circle-outline"
// // //               size={size}
// // //               color={color}
// // //             />
// // //           ),
// // //         }}
// // //       />

// // //       {/* ===== ROUTES CACHÉES ===== */}
// // //       {/* Ventes */}
// // //       <Tabs.Screen name="factures" options={{ href: null }} />
// // //       <Tabs.Screen name="templates" options={{ href: null }} />
// // //       <Tabs.Screen name="recurring" options={{ href: null }} />
// // //       <Tabs.Screen name="purchase-orders" options={{ href: null }} />

// // //       {/* Catalogue & stock */}
// // //       <Tabs.Screen name="services" options={{ href: null }} />
// // //       <Tabs.Screen name="stock" options={{ href: null }} />
// // //       <Tabs.Screen name="suppliers" options={{ href: null }} />

// // //       {/* Chantiers */}
// // //       <Tabs.Screen name="chantiers" options={{ href: null }} />
// // //       <Tabs.Screen name="subcontractors" options={{ href: null }} />
// // //       <Tabs.Screen name="assignments" options={{ href: null }} />

// // //       {/* Communication */}
// // //       <Tabs.Screen name="chat" options={{ href: null }} />
// // //       <Tabs.Screen name="email-import" options={{ href: null }} />
// // //       <Tabs.Screen name="sms" options={{ href: null }} />

// // //       {/* Outils IA */}
// // //       <Tabs.Screen name="vision" options={{ href: null }} />
// // //       <Tabs.Screen name="proactive" options={{ href: null }} />

// // //       {/* Pilotage */}
// // //       <Tabs.Screen name="dashboard" options={{ href: null }} />
// // //       <Tabs.Screen name="analytics" options={{ href: null }} />
// // //       <Tabs.Screen name="reports" options={{ href: null }} />
// // //       <Tabs.Screen name="appointments" options={{ href: null }} />
// // //       <Tabs.Screen name="availability" options={{ href: null }} />
// // //       <Tabs.Screen name="booking-settings" options={{ href: null }} />
// // //       <Tabs.Screen name="client-portal" options={{ href: null }} />
// // //       <Tabs.Screen name="online-payments" options={{ href: null }} />
// // //       <Tabs.Screen name="bank" options={{ href: null }} />
      
// // //       {/* Compte */}
// // //       <Tabs.Screen name="settings" options={{ href: null }} />
// // //       <Tabs.Screen name="notifications" options={{ href: null }} />
// // //       <Tabs.Screen name="change-password" options={{ href: null }} />
// // //       <Tabs.Screen name="delete-account" options={{ href: null }} />
// // //       <Tabs.Screen name="team" options={{ href: null }} />

// // //       {/* Développeur */}
// // //       <Tabs.Screen name="api-keys" options={{ href: null }} />
// // //       <Tabs.Screen name="webhooks" options={{ href: null }} />
// // //       <Tabs.Screen name="oauth" options={{ href: null }} />

// // //       {/* Paramètres avancés */}
// // //       <Tabs.Screen name="subscription" options={{ href: null }} />
// // //       <Tabs.Screen name="peppol-settings" options={{ href: null }} />
// // //       <Tabs.Screen name="demo" options={{ href: null }} />
// // //       {/* <Tabs.Screen name="client/new" options={{ href: null }} />
// // //       <Tabs.Screen name="client/edit" options={{ href: null }} />
// // //       <Tabs.Screen name="product/new" options={{ href: null }} />
// // //       <Tabs.Screen name="product/edit" options={{ href: null }} />
// // //       <Tabs.Screen name="service/new" options={{ href: null }} />
// // //       <Tabs.Screen name="service/edit" options={{ href: null }} />
// // //       <Tabs.Screen name="supplier/new" options={{ href: null }} /> */}
// // //     </Tabs>
// // //   );
// // // }

// // import { Tabs } from 'expo-router';
// // import { Ionicons } from '@expo/vector-icons';
// // import { colors } from '../../lib/theme';

// // export default function AppLayout() {
// //   return (
// //     <Tabs
// //       screenOptions={{
// //         headerShown: false,
// //         tabBarActiveTintColor: colors.accent,
// //         tabBarInactiveTintColor: colors.textMuted,
// //         tabBarStyle: {
// //           backgroundColor: colors.bgCard,
// //           borderTopColor: colors.border,
// //           borderTopWidth: 1,
// //           height: 64,
// //           paddingBottom: 8,
// //           paddingTop: 6,
// //         },
// //         tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
// //       }}
// //     >
// //       <Tabs.Screen
// //         name="devis"
// //         options={{
// //           title: 'Devis',
// //           tabBarIcon: ({ color, size }) => <Ionicons name="document-text-outline" size={size} color={color} />,
// //         }}
// //       />
// //       <Tabs.Screen
// //         name="clients"
// //         options={{
// //           title: 'Clients',
// //           tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} />,
// //         }}
// //       />
// //       <Tabs.Screen
// //         name="catalogue"
// //         options={{
// //           title: 'Produits',
// //           tabBarIcon: ({ color, size }) => <Ionicons name="cube-outline" size={size} color={color} />,
// //         }}
// //       />
// //       <Tabs.Screen
// //         name="assistant"
// //         options={{
// //           title: 'Assistant',
// //           tabBarIcon: ({ color, size }) => <Ionicons name="sparkles-outline" size={size} color={color} />,
// //         }}
// //       />
// //       <Tabs.Screen
// //         name="plus"
// //         options={{
// //           title: 'Plus',
// //           tabBarIcon: ({ color, size }) => <Ionicons name="ellipsis-horizontal-circle-outline" size={size} color={color} />,
// //         }}
// //       />

// //       {/* ===== TOUTES LES ROUTES CACHÉES ===== */}
// //       <Tabs.Screen name="factures" options={{ href: null }} />
// //       <Tabs.Screen name="templates" options={{ href: null }} />
// //       <Tabs.Screen name="recurring" options={{ href: null }} />
// //       <Tabs.Screen name="purchase-orders" options={{ href: null }} />
// //       <Tabs.Screen name="services" options={{ href: null }} />
// //       <Tabs.Screen name="stock" options={{ href: null }} />
// //       <Tabs.Screen name="suppliers" options={{ href: null }} />
// //       <Tabs.Screen name="chantiers" options={{ href: null }} />
// //       <Tabs.Screen name="subcontractors" options={{ href: null }} />
// //       <Tabs.Screen name="assignments" options={{ href: null }} />
// //       <Tabs.Screen name="chat" options={{ href: null }} />
// //       <Tabs.Screen name="email-import" options={{ href: null }} />
// //       <Tabs.Screen name="sms" options={{ href: null }} />
// //       <Tabs.Screen name="vision" options={{ href: null }} />
// //       <Tabs.Screen name="proactive" options={{ href: null }} />
// //       <Tabs.Screen name="dashboard" options={{ href: null }} />
// //       <Tabs.Screen name="analytics" options={{ href: null }} />
// //       <Tabs.Screen name="reports" options={{ href: null }} />
// //       <Tabs.Screen name="appointments" options={{ href: null }} />
// //       <Tabs.Screen name="availability" options={{ href: null }} />
// //       <Tabs.Screen name="booking-settings" options={{ href: null }} />
// //       <Tabs.Screen name="client-portal" options={{ href: null }} />
// //       <Tabs.Screen name="online-payments" options={{ href: null }} />
// //       <Tabs.Screen name="bank" options={{ href: null }} />
// //       <Tabs.Screen name="api-keys" options={{ href: null }} />
// //       <Tabs.Screen name="webhooks" options={{ href: null }} />
// //       <Tabs.Screen name="oauth" options={{ href: null }} />
// //       <Tabs.Screen name="subscription" options={{ href: null }} />
// //       <Tabs.Screen name="peppol-settings" options={{ href: null }} />
// //       <Tabs.Screen name="currency" options={{ href: null }} />
// //       <Tabs.Screen name="export-data" options={{ href: null }} />
// //       <Tabs.Screen name="demo" options={{ href: null }} />
// //       <Tabs.Screen name="settings" options={{ href: null }} />
// //       <Tabs.Screen name="notifications" options={{ href: null }} />
// //       <Tabs.Screen name="change-password" options={{ href: null }} />
// //       <Tabs.Screen name="delete-account" options={{ href: null }} />
// //       <Tabs.Screen name="team" options={{ href: null }} />
// //     </Tabs>
// //   );
// // }

// import { useEffect } from 'react';
// import { Tabs, useRouter } from 'expo-router';
// import { useAuth } from '../../lib/auth';
// import { Ionicons } from '@expo/vector-icons';
// import { colors } from '../../lib/theme';

// export default function AppLayout() {
//   const router = useRouter();
//   const token = useAuth((s) => s.token);
//   const isLoading = useAuth((s) => s.isLoading);

//   useEffect(() => {
//     if (!isLoading && !token) {
//       router.replace('/(auth)/login');
//     }
//   }, [token, isLoading]);
  
//   return (
//     <Tabs
//       screenOptions={{
//         headerShown: false,
//         tabBarActiveTintColor: colors.accent,
//         tabBarInactiveTintColor: colors.textMuted,
//         tabBarStyle: {
//           backgroundColor: colors.bgCard,
//           borderTopColor: colors.border,
//           borderTopWidth: 1,
//           height: 64,
//           paddingBottom: 8,
//           paddingTop: 6,
//         },
//         tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
//       }}
//     >
//       <Tabs.Screen name="devis" options={{ title: 'Devis', tabBarIcon: ({ color, size }) => <Ionicons name="document-text-outline" size={size} color={color} /> }} />
//       <Tabs.Screen name="clients" options={{ title: 'Clients', tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} /> }} />
//       <Tabs.Screen name="catalogue" options={{ title: 'Produits', tabBarIcon: ({ color, size }) => <Ionicons name="cube-outline" size={size} color={color} /> }} />
//       <Tabs.Screen name="assistant" options={{ title: 'Assistant', tabBarIcon: ({ color, size }) => <Ionicons name="sparkles-outline" size={size} color={color} /> }} />
//       <Tabs.Screen name="plus" options={{ title: 'Plus', tabBarIcon: ({ color, size }) => <Ionicons name="ellipsis-horizontal-circle-outline" size={size} color={color} /> }} />

//       {/* ===== Routes cachées ===== */}
//       <Tabs.Screen name="factures" options={{ href: null }} />
//       <Tabs.Screen name="templates" options={{ href: null }} />
//       <Tabs.Screen name="recurring" options={{ href: null }} />
//       <Tabs.Screen name="purchase-orders" options={{ href: null }} />
//       <Tabs.Screen name="services" options={{ href: null }} />
//       <Tabs.Screen name="stock" options={{ href: null }} />
//       <Tabs.Screen name="suppliers" options={{ href: null }} />
//       <Tabs.Screen name="chantiers" options={{ href: null }} />
//       <Tabs.Screen name="subcontractors" options={{ href: null }} />
//       <Tabs.Screen name="assignments" options={{ href: null }} />
//       <Tabs.Screen name="chat" options={{ href: null }} />
//       <Tabs.Screen name="email-import" options={{ href: null }} />
//       <Tabs.Screen name="sms" options={{ href: null }} />
//       <Tabs.Screen name="vision" options={{ href: null }} />
//       <Tabs.Screen name="proactive" options={{ href: null }} />
//       <Tabs.Screen name="dashboard" options={{ href: null }} />
//       <Tabs.Screen name="analytics" options={{ href: null }} />
//       <Tabs.Screen name="reports" options={{ href: null }} />
//       <Tabs.Screen name="appointments" options={{ href: null }} />
//       <Tabs.Screen name="availability" options={{ href: null }} />
//       <Tabs.Screen name="booking-settings" options={{ href: null }} />
//       <Tabs.Screen name="client-portal" options={{ href: null }} />
//       <Tabs.Screen name="online-payments" options={{ href: null }} />
//       <Tabs.Screen name="bank" options={{ href: null }} />
//       <Tabs.Screen name="api-keys" options={{ href: null }} />
//       <Tabs.Screen name="webhooks" options={{ href: null }} />
//       <Tabs.Screen name="oauth" options={{ href: null }} />
//       <Tabs.Screen name="subscription" options={{ href: null }} />
//       <Tabs.Screen name="peppol-settings" options={{ href: null }} />
//       <Tabs.Screen name="currency" options={{ href: null }} />
//       <Tabs.Screen name="export-data" options={{ href: null }} />
//       <Tabs.Screen name="demo" options={{ href: null }} />
//       <Tabs.Screen name="onboarding-tour" options={{ href: null }} />
//       <Tabs.Screen name="settings" options={{ href: null }} />
//       <Tabs.Screen name="notifications" options={{ href: null }} />
//       <Tabs.Screen name="change-password" options={{ href: null }} />
//       <Tabs.Screen name="delete-account" options={{ href: null }} />
//       <Tabs.Screen name="team" options={{ href: null }} />
//       {/* <Tabs.Screen name="stock-product" options={{ href: null }} /> */}
//     </Tabs>
//   );
// }

import { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../lib/auth';
import { colors } from '../../lib/theme';

export default function AppLayout() {
  const router = useRouter();
  const token = useAuth((s) => s.token);
  const isLoading = useAuth((s) => s.isLoading);

  // Rediriger vers login dès que le token disparaît
  useEffect(() => {
    if (!isLoading && !token) {
      router.replace('/(auth)/login');
    }
  }, [token, isLoading]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.bgCard,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="devis" options={{ title: 'Devis', tabBarIcon: ({ color, size }) => <Ionicons name="document-text-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="clients" options={{ title: 'Clients', tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="catalogue" options={{ title: 'Produits', tabBarIcon: ({ color, size }) => <Ionicons name="cube-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="assistant" options={{ title: 'Assistant', tabBarIcon: ({ color, size }) => <Ionicons name="sparkles-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="plus" options={{ title: 'Plus', tabBarIcon: ({ color, size }) => <Ionicons name="ellipsis-horizontal-circle-outline" size={size} color={color} /> }} />

      {/* Routes cachées */}
      <Tabs.Screen name="factures" options={{ href: null }} />
      <Tabs.Screen name="templates" options={{ href: null }} />
      <Tabs.Screen name="recurring" options={{ href: null }} />
      <Tabs.Screen name="purchase-orders" options={{ href: null }} />
      <Tabs.Screen name="services" options={{ href: null }} />
      <Tabs.Screen name="stock" options={{ href: null }} />
      <Tabs.Screen name="suppliers" options={{ href: null }} />
      <Tabs.Screen name="chantiers" options={{ href: null }} />
      <Tabs.Screen name="subcontractors" options={{ href: null }} />
      <Tabs.Screen name="assignments" options={{ href: null }} />
      <Tabs.Screen name="chat" options={{ href: null }} />
      <Tabs.Screen name="email-import" options={{ href: null }} />
      <Tabs.Screen name="sms" options={{ href: null }} />
      <Tabs.Screen name="vision" options={{ href: null }} />
      <Tabs.Screen name="proactive" options={{ href: null }} />
      <Tabs.Screen name="dashboard" options={{ href: null }} />
      <Tabs.Screen name="analytics" options={{ href: null }} />
      <Tabs.Screen name="reports" options={{ href: null }} />
      <Tabs.Screen name="appointments" options={{ href: null }} />
      <Tabs.Screen name="availability" options={{ href: null }} />
      <Tabs.Screen name="booking-settings" options={{ href: null }} />
      <Tabs.Screen name="client-portal" options={{ href: null }} />
      <Tabs.Screen name="online-payments" options={{ href: null }} />
      <Tabs.Screen name="bank" options={{ href: null }} />
      <Tabs.Screen name="api-keys" options={{ href: null }} />
      <Tabs.Screen name="webhooks" options={{ href: null }} />
      <Tabs.Screen name="oauth" options={{ href: null }} />
      <Tabs.Screen name="subscription" options={{ href: null }} />
      <Tabs.Screen name="peppol-settings" options={{ href: null }} />
      <Tabs.Screen name="currency" options={{ href: null }} />
      <Tabs.Screen name="export-data" options={{ href: null }} />
      <Tabs.Screen name="demo" options={{ href: null }} />
      <Tabs.Screen name="onboarding-tour" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="change-password" options={{ href: null }} />
      <Tabs.Screen name="delete-account" options={{ href: null }} />
      <Tabs.Screen name="team" options={{ href: null }} />
    </Tabs>
  );
}