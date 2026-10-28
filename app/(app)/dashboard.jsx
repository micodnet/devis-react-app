// // import { useState, useCallback } from 'react';
// // import {
// //   View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl,
// // } from 'react-native';
// // import { SafeAreaView } from 'react-native-safe-area-context';
// // import { useFocusEffect } from 'expo-router';
// // import { dashboardApi } from '../../lib/api';
// // import { colors, spacing, fontSize, radius } from '../../lib/theme';
// // import Header from '../../components/Header';
// // import Card from '../../components/Card';

// // export default function DashboardScreen() {
// //   const [summary, setSummary] = useState(null);
// //   const [loading, setLoading] = useState(true);
// //   const [refreshing, setRefreshing] = useState(false);
// //   const [error, setError] = useState('');

// //   const loadStats = async () => {
// //     try {
// //       setError('');
// //       const data = await dashboardApi.summary();
// //       setSummary(data);
// //     } catch (err) {
// //       setError(err.response?.data?.error || err.message || 'Erreur de chargement');
// //     } finally {
// //       setLoading(false);
// //       setRefreshing(false);
// //     }
// //   };

// //   useFocusEffect(
// //     useCallback(() => {
// //       loadStats();
// //     }, [])
// //   );

// //   const onRefresh = () => {
// //     setRefreshing(true);
// //     loadStats();
// //   };

// //   const fmtMoney = (n) =>
// //     new Intl.NumberFormat('fr-FR', {
// //       style: 'currency',
// //       currency: 'EUR',
// //       minimumFractionDigits: 2,
// //     }).format(n || 0);

// //   if (loading) {
// //     return (
// //       <SafeAreaView style={styles.safe} edges={['top']}>
// //         <Header title="Tableau de bord" />
// //         <View style={styles.center}>
// //           <ActivityIndicator size="large" color={colors.accent} />
// //         </View>
// //       </SafeAreaView>
// //     );
// //   }

// //   return (
// //     <SafeAreaView style={styles.safe} edges={['top']}>
// //       <Header title="Tableau de bord" />
// //       <ScrollView
// //         contentContainerStyle={styles.scroll}
// //         refreshControl={
// //           <RefreshControl
// //             refreshing={refreshing}
// //             onRefresh={onRefresh}
// //             tintColor={colors.accent}
// //             colors={[colors.accent]}
// //           />
// //         }
// //       >
// //         {error ? (
// //           <Card>
// //             <Text style={styles.errorText}>⚠️ {error}</Text>
// //           </Card>
// //         ) : null}

// //         {/* KPI Cards */}
// //         <View style={styles.statsGrid}>
// //           <View style={styles.statCard}>
// //             <Text style={styles.statNumber}>{summary?.totalQuotes || 0}</Text>
// //             <Text style={styles.statLabel}>Devis générés</Text>
// //           </View>
// //           <View style={styles.statCard}>
// //             <Text style={[styles.statNumber, { color: colors.accent }]}>
// //               {fmtMoney(summary?.totalAmount)}
// //             </Text>
// //             <Text style={styles.statLabel}>Montant total</Text>
// //           </View>
// //         </View>

// //         {/* Top produits */}
// //         <Card>
// //           <Text style={styles.sectionTitle}>🏆 Top produits</Text>
// //           {!summary?.topProducts || summary.topProducts.length === 0 ? (
// //             <Text style={styles.empty}>Aucune donnée pour le moment.</Text>
// //           ) : (
// //             summary.topProducts.map((p, i) => (
// //               <View key={i} style={styles.productRow}>
// //                 <View style={styles.productRank}>
// //                   <Text style={styles.productRankText}>{i + 1}</Text>
// //                 </View>
// //                 <Text style={styles.productName} numberOfLines={1}>
// //                   {p.name}
// //                 </Text>
// //                 <Text style={styles.productQty}>{p.qty} u.</Text>
// //               </View>
// //             ))
// //           )}
// //         </Card>

// //         <Text style={styles.footer}>Tire pour rafraîchir ↓</Text>
// //       </ScrollView>
// //     </SafeAreaView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   safe: { flex: 1, backgroundColor: colors.bg },
// //   scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
// //   center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
// //   statsGrid: {
// //     flexDirection: 'row',
// //     gap: spacing.md,
// //     marginBottom: spacing.lg,
// //   },
// //   statCard: {
// //     flex: 1,
// //     backgroundColor: colors.bgCard,
// //     borderRadius: radius.lg,
// //     padding: spacing.lg,
// //     borderWidth: 1,
// //     borderColor: colors.border,
// //     alignItems: 'center',
// //   },
// //   statNumber: {
// //     color: colors.text,
// //     fontSize: fontSize.xxl,
// //     fontWeight: '800',
// //     marginBottom: 4,
// //   },
// //   statLabel: {
// //     color: colors.textSecondary,
// //     fontSize: fontSize.xs,
// //     textAlign: 'center',
// //   },
// //   sectionTitle: {
// //     color: colors.text,
// //     fontSize: fontSize.md,
// //     fontWeight: '700',
// //     marginBottom: spacing.md,
// //   },
// //   productRow: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     paddingVertical: spacing.md,
// //     borderBottomWidth: 1,
// //     borderBottomColor: colors.border,
// //     gap: spacing.md,
// //   },
// //   productRank: {
// //     width: 28,
// //     height: 28,
// //     borderRadius: radius.full,
// //     backgroundColor: colors.bgInput,
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //   },
// //   productRankText: {
// //     color: colors.accent,
// //     fontSize: fontSize.xs,
// //     fontWeight: '800',
// //   },
// //   productName: {
// //     flex: 1,
// //     color: colors.text,
// //     fontSize: fontSize.sm,
// //     fontWeight: '500',
// //   },
// //   productQty: {
// //     color: colors.textSecondary,
// //     fontSize: fontSize.xs,
// //   },
// //   empty: {
// //     color: colors.textMuted,
// //     fontSize: fontSize.sm,
// //     fontStyle: 'italic',
// //     textAlign: 'center',
// //     paddingVertical: spacing.lg,
// //   },
// //   errorText: {
// //     color: colors.error,
// //     fontSize: fontSize.sm,
// //   },
// //   footer: {
// //     color: colors.textMuted,
// //     fontSize: fontSize.xs,
// //     textAlign: 'center',
// //     marginTop: spacing.xl,
// //   },
// // });

// import { useState, useCallback } from 'react';
// import {
//   View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useFocusEffect, useRouter } from 'expo-router';
// import { dashboardApi, onboardingApi } from '../../lib/api';
// import { colors, spacing, fontSize, radius } from '../../lib/theme';
// import Header from '../../components/Header';
// import Card from '../../components/Card';
// import SimpleBarChart from '../../components/SimpleBarChart';
// import SimpleLineChart from '../../components/SimpleLineChart';

// export default function DashboardScreen() {
//   const router = useRouter();
//   const [summary, setSummary] = useState(null);
//   const [charts, setCharts] = useState(null);
//   const [onboarding, setOnboarding] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState('');

//   const loadAll = async () => {
//     try {
//       setError('');
//       const [s, c, o] = await Promise.all([
//         dashboardApi.summary().catch(() => null),
//         dashboardApi.charts().catch(() => null),
//         onboardingApi.get().catch(() => null),
//       ]);
//       setSummary(s);
//       setCharts(c);
//       setOnboarding(o);
//     } catch (err) {
//       setError(err.response?.data?.error || err.message || 'Erreur');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useFocusEffect(useCallback(() => { loadAll(); }, []));

//   const onRefresh = () => { setRefreshing(true); loadAll(); };

//   const fmtMoney = (n) =>
//     new Intl.NumberFormat('fr-FR', {
//       style: 'currency', currency: 'EUR', minimumFractionDigits: 2,
//     }).format(n || 0);

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.safe} edges={['top']}>
//         <Header title="Tableau de bord" />
//         <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>
//       </SafeAreaView>
//     );
//   }

//   const revenueData = (charts?.months || []).map((m) => ({
//     label: m.label || m.month,
//     value: m.revenue || 0,
//   }));

//   const statusData = charts?.statuses
//     ? [
//         { label: 'Brouillons', value: charts.statuses.draft || 0 },
//         { label: 'Envoyés', value: charts.statuses.sent || 0 },
//         { label: 'Acceptés', value: charts.statuses.accepted || 0 },
//         { label: 'Refusés', value: charts.statuses.refused || 0 },
//       ]
//     : [];

//   const completedSteps = onboarding?.completedSteps || [];
//   const totalSteps = onboarding?.totalSteps || 0;
//   const showOnboarding =
//     onboarding && completedSteps.length < totalSteps && !onboarding.checklistDismissed;

//   return (
//     <SafeAreaView style={styles.safe} edges={['top']}>
//       <Header title="Tableau de bord" />
//       <ScrollView
//         contentContainerStyle={styles.scroll}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
//             tintColor={colors.accent} colors={[colors.accent]} />
//         }
//       >
//         {!!error && (<Card><Text style={styles.errorText}>⚠️ {error}</Text></Card>)}

//         {showOnboarding && (
//           <Card style={styles.onboardingCard}>
//             <View style={styles.onboardingHeader}>
//               <Text style={styles.onboardingTitle}>
//                 🚀 Configuration ({completedSteps.length}/{totalSteps})
//               </Text>
//               <TouchableOpacity
//                 onPress={async () => {
//                   try { await onboardingApi.dismissChecklist(); await loadAll(); } catch (e) {}
//                 }}
//               >
//                 <Text style={styles.onboardingDismiss}>✕</Text>
//               </TouchableOpacity>
//             </View>
//             <View style={styles.progressBar}>
//               <View
//                 style={[
//                   styles.progressFill,
//                   { width: `${totalSteps ? (completedSteps.length / totalSteps) * 100 : 0}%` },
//                 ]}
//               />
//             </View>
//             {onboarding.steps?.map((step) => {
//               const done = completedSteps.includes(step.key);
//               return (
//                 <TouchableOpacity
//                   key={step.key}
//                   style={styles.stepRow}
//                   onPress={() => {
//                     if (done) return;
//                     if (step.tab) router.push(step.tab);
//                   }}
//                   activeOpacity={0.7}
//                 >
//                   <View style={[styles.stepCircle, done && styles.stepCircleDone]}>
//                     <Text style={[styles.stepCircleText, done && styles.stepCircleTextDone]}>
//                       {done ? '✓' : '○'}
//                     </Text>
//                   </View>
//                   <View style={{ flex: 1 }}>
//                     <Text style={[styles.stepTitle, done && styles.stepTitleDone]}>
//                       {step.title}
//                     </Text>
//                     <Text style={styles.stepDesc} numberOfLines={2}>{step.description}</Text>
//                   </View>
//                 </TouchableOpacity>
//               );
//             })}
//           </Card>
//         )}

//         <View style={styles.kpiGrid}>
//           <View style={styles.kpiCard}>
//             <Text style={styles.kpiNumber}>{summary?.totalQuotes || 0}</Text>
//             <Text style={styles.kpiLabel}>Devis générés</Text>
//           </View>
//           <View style={styles.kpiCard}>
//             <Text style={[styles.kpiNumber, { color: colors.accent }]}>
//               {fmtMoney(summary?.totalAmount)}
//             </Text>
//             <Text style={styles.kpiLabel}>Montant total</Text>
//           </View>
//         </View>

//         {revenueData.length > 0 && (
//           <>
//             <Text style={styles.sectionTitleOutside}>📈 Chiffre d'affaires (12 mois)</Text>
//             <Card>
//               <SimpleBarChart
//                 data={revenueData}
//                 height={180}
//                 barColor={colors.accent}
//                 valueSuffix="€"
//               />
//             </Card>
//           </>
//         )}

//         {statusData.length > 0 && (
//           <>
//             <Text style={styles.sectionTitleOutside}>🥧 Répartition des statuts</Text>
//             <Card>
//               <SimpleBarChart
//                 data={statusData}
//                 horizontal
//                 barColor="#3b82f6"
//               />
//             </Card>
//           </>
//         )}

//         <Card>
//           <Text style={styles.sectionTitle}>🏆 Top produits</Text>
//           {!summary?.topProducts || summary.topProducts.length === 0 ? (
//             <Text style={styles.empty}>Aucune donnée.</Text>
//           ) : (
//             summary.topProducts.map((p, i) => (
//               <View key={i} style={styles.productRow}>
//                 <View style={styles.productRank}>
//                   <Text style={styles.productRankText}>{i + 1}</Text>
//                 </View>
//                 <Text style={styles.productName} numberOfLines={1}>{p.name}</Text>
//                 <Text style={styles.productQty}>{p.qty} u.</Text>
//               </View>
//             ))
//           )}
//         </Card>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: colors.bg },
//   scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
//   sectionTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700', marginBottom: spacing.md },
//   sectionTitleOutside: {
//     color: colors.text, fontSize: fontSize.md, fontWeight: '700',
//     marginTop: spacing.lg, marginBottom: spacing.md,
//   },
//   kpiGrid: { flexDirection: 'row', gap: spacing.md },
//   kpiCard: {
//     flex: 1, backgroundColor: colors.bgCard,
//     borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border,
//     padding: spacing.lg, alignItems: 'center',
//   },
//   kpiNumber: {
//     color: colors.text, fontSize: fontSize.xl, fontWeight: '800', marginBottom: 4,
//   },
//   kpiLabel: {
//     color: colors.textSecondary, fontSize: fontSize.xs, textAlign: 'center',
//   },
//   onboardingCard: {
//     borderColor: colors.accent, borderWidth: 2,
//     backgroundColor: 'rgba(249,115,22,0.06)',
//   },
//   onboardingHeader: {
//     flexDirection: 'row', justifyContent: 'space-between',
//     alignItems: 'center', marginBottom: spacing.md,
//   },
//   onboardingTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '800' },
//   onboardingDismiss: { color: colors.textMuted, fontSize: 20, fontWeight: '700', paddingHorizontal: 8 },
//   progressBar: {
//     height: 6, borderRadius: 3, backgroundColor: colors.bgInput, overflow: 'hidden', marginBottom: spacing.md,
//   },
//   progressFill: { height: '100%', backgroundColor: colors.accent },
//   stepRow: {
//     flexDirection: 'row', alignItems: 'flex-start',
//     gap: spacing.md, paddingVertical: spacing.sm,
//   },
//   stepCircle: {
//     width: 24, height: 24, borderRadius: 12, borderWidth: 2,
//     borderColor: colors.borderLight, alignItems: 'center', justifyContent: 'center',
//   },
//   stepCircleDone: {
//     backgroundColor: 'rgba(34,197,94,0.15)', borderColor: colors.success,
//   },
//   stepCircleText: { color: colors.textMuted, fontSize: 12, fontWeight: '800' },
//   stepCircleTextDone: { color: colors.success },
//   stepTitle: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600' },
//   stepTitleDone: { color: colors.success, textDecorationLine: 'line-through' },
//   stepDesc: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },
//   productRow: {
//     flexDirection: 'row', alignItems: 'center',
//     paddingVertical: spacing.md, borderBottomWidth: 1,
//     borderBottomColor: colors.border, gap: spacing.md,
//   },
//   productRank: {
//     width: 28, height: 28, borderRadius: 14,
//     backgroundColor: colors.bgInput,
//     alignItems: 'center', justifyContent: 'center',
//   },
//   productRankText: { color: colors.accent, fontSize: fontSize.xs, fontWeight: '800' },
//   productName: { flex: 1, color: colors.text, fontSize: fontSize.sm, fontWeight: '500' },
//   productQty: { color: colors.textSecondary, fontSize: fontSize.xs },
//   empty: {
//     color: colors.textMuted, fontSize: fontSize.sm,
//     fontStyle: 'italic', textAlign: 'center', paddingVertical: spacing.lg,
//   },
//   errorText: { color: colors.error, fontSize: fontSize.sm },
//   center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
// });

import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl,
  TouchableOpacity, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { dashboardApi, onboardingApi } from '../../lib/api';
import { colors, spacing, fontSize, radius } from '../../lib/theme';
import Header from '../../components/Header';
import Card from '../../components/Card';
import SimpleBarChart from '../../components/SimpleBarChart';

export default function DashboardScreen() {
  const router = useRouter();
  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState(null);
  const [onboarding, setOnboarding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [welcomeOpen, setWelcomeOpen] = useState(false);

  const loadAll = async () => {
    try {
      setError('');
      const [s, c, o] = await Promise.all([
        dashboardApi.summary().catch(() => null),
        dashboardApi.charts().catch(() => null),
        onboardingApi.get().catch(() => null),
      ]);
      setSummary(s);
      setCharts(c);
      setOnboarding(o);

      // Afficher welcome modal si première visite
      if (o && !o.welcomeSeen && !o.tourCompleted) {
        setWelcomeOpen(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { loadAll(); }, []));

  const onRefresh = () => { setRefreshing(true); loadAll(); };

  const handleWelcomeStart = async () => {
    try {
      await onboardingApi.welcomeSeen();
    } catch (err) { /* silent */ }
    setWelcomeOpen(false);
    router.push('/(app)/onboarding-tour');
  };

  const handleWelcomeSkip = async () => {
    try {
      await onboardingApi.welcomeSeen();
      await onboardingApi.tourCompleted();
    } catch (err) { /* silent */ }
    setWelcomeOpen(false);
    await loadAll();
  };

  const fmtMoney = (n) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency', currency: 'EUR', minimumFractionDigits: 2,
    }).format(n || 0);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Tableau de bord" />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>
      </SafeAreaView>
    );
  }

  const revenueData = (charts?.months || []).map((m) => ({
    label: m.label || m.month, value: m.revenue || 0,
  }));

  const statusData = charts?.statuses
    ? [
        { label: 'Brouillons', value: charts.statuses.draft || 0 },
        { label: 'Envoyés', value: charts.statuses.sent || 0 },
        { label: 'Acceptés', value: charts.statuses.accepted || 0 },
        { label: 'Refusés', value: charts.statuses.refused || 0 },
      ]
    : [];

  const completedSteps = onboarding?.completedSteps || [];
  const totalSteps = onboarding?.totalSteps || 0;
  const showOnboarding = onboarding && completedSteps.length < totalSteps && !onboarding.checklistDismissed;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Tableau de bord" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
            tintColor={colors.accent} colors={[colors.accent]} />
        }
      >
        {!!error && (<Card><Text style={styles.errorText}>⚠️ {error}</Text></Card>)}

        {showOnboarding && (
          <Card style={styles.onboardingCard}>
            <View style={styles.onboardingHeader}>
              <Text style={styles.onboardingTitle}>
                🚀 Configuration ({completedSteps.length}/{totalSteps})
              </Text>
              <TouchableOpacity
                onPress={async () => {
                  try { await onboardingApi.dismissChecklist(); await loadAll(); } catch (e) {}
                }}
              >
                <Text style={styles.onboardingDismiss}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill,
                { width: `${totalSteps ? (completedSteps.length / totalSteps) * 100 : 0}%` }]} />
            </View>
            {onboarding.steps?.map((step) => {
              const done = completedSteps.includes(step.key);
              return (
                <TouchableOpacity
                  key={step.key}
                  style={styles.stepRow}
                  onPress={() => { if (!done && step.tab) router.push(step.tab); }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.stepCircle, done && styles.stepCircleDone]}>
                    <Text style={[styles.stepCircleText, done && styles.stepCircleTextDone]}>
                      {done ? '✓' : '○'}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.stepTitle, done && styles.stepTitleDone]}>
                      {step.title}
                    </Text>
                    <Text style={styles.stepDesc} numberOfLines={2}>{step.description}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={styles.tourBtn}
              onPress={() => router.push('/(app)/onboarding-tour')}
              activeOpacity={0.7}
            >
              <Text style={styles.tourBtnText}>🎓 Lancer la visite guidée</Text>
            </TouchableOpacity>
          </Card>
        )}

        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiNumber}>{summary?.totalQuotes || 0}</Text>
            <Text style={styles.kpiLabel}>Devis générés</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={[styles.kpiNumber, { color: colors.accent }]}>
              {fmtMoney(summary?.totalAmount)}
            </Text>
            <Text style={styles.kpiLabel}>Montant total</Text>
          </View>
        </View>

        {revenueData.length > 0 && (
          <>
            <Text style={styles.sectionTitleOutside}>📈 Chiffre d'affaires (12 mois)</Text>
            <Card>
              <SimpleBarChart data={revenueData} height={180} barColor={colors.accent} valueSuffix="€" />
            </Card>
          </>
        )}

        {statusData.length > 0 && (
          <>
            <Text style={styles.sectionTitleOutside}>🥧 Répartition des statuts</Text>
            <Card>
              <SimpleBarChart data={statusData} horizontal barColor="#3b82f6" />
            </Card>
          </>
        )}

        <Card>
          <Text style={styles.sectionTitle}>🏆 Top produits</Text>
          {!summary?.topProducts || summary.topProducts.length === 0 ? (
            <Text style={styles.empty}>Aucune donnée.</Text>
          ) : (
            summary.topProducts.map((p, i) => (
              <View key={i} style={styles.productRow}>
                <View style={styles.productRank}>
                  <Text style={styles.productRankText}>{i + 1}</Text>
                </View>
                <Text style={styles.productName} numberOfLines={1}>{p.name}</Text>
                <Text style={styles.productQty}>{p.qty} u.</Text>
              </View>
            ))
          )}
        </Card>
      </ScrollView>

      {/* Welcome modal */}
      <Modal visible={welcomeOpen} transparent animationType="fade"
        onRequestClose={() => setWelcomeOpen(false)}>
        <View style={styles.welcomeOverlay}>
          <View style={styles.welcomeBox}>
            <Text style={styles.welcomeTitle}>Bienvenue sur <Text style={styles.welcomeAccent}>Devis Express Pro</Text></Text>
            <Text style={styles.welcomeSub}>
              Votre assistant pour créer des devis en 10 secondes au lieu de 3 heures.
            </Text>

            <View style={styles.welcomeFeature}>
              <Text style={styles.welcomeFeatureIcon}>🤖</Text>
              <Text style={styles.welcomeFeatureText}>
                <Text style={styles.bold}>Assistant IA</Text> — dictez un chantier, l'IA fait le reste.
              </Text>
            </View>
            <View style={styles.welcomeFeature}>
              <Text style={styles.welcomeFeatureIcon}>📄</Text>
              <Text style={styles.welcomeFeatureText}>
                <Text style={styles.bold}>Devis depuis un fichier</Text> — glissez un PDF, l'IA extrait les articles.
              </Text>
            </View>
            <View style={styles.welcomeFeature}>
              <Text style={styles.welcomeFeatureIcon}>✍️</Text>
              <Text style={styles.welcomeFeatureText}>
                <Text style={styles.bold}>Signature électronique</Text> — le client signe en ligne.
              </Text>
            </View>

            <View style={styles.welcomeActions}>
              <TouchableOpacity style={[styles.welcomeBtn, styles.welcomeBtnPrimary]}
                onPress={handleWelcomeStart} activeOpacity={0.7}>
                <Text style={styles.welcomeBtnPrimaryText}>🎓 Visite guidée</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.welcomeBtn, styles.welcomeBtnSecondary]}
                onPress={handleWelcomeSkip} activeOpacity={0.7}>
                <Text style={styles.welcomeBtnSecondaryText}>Explorer seul</Text>
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
  sectionTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '700', marginBottom: spacing.md },
  sectionTitleOutside: {
    color: colors.text, fontSize: fontSize.md, fontWeight: '700',
    marginTop: spacing.lg, marginBottom: spacing.md,
  },
  kpiGrid: { flexDirection: 'row', gap: spacing.md },
  kpiCard: {
    flex: 1, backgroundColor: colors.bgCard,
    borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border,
    padding: spacing.lg, alignItems: 'center',
  },
  kpiNumber: { color: colors.text, fontSize: fontSize.xl, fontWeight: '800', marginBottom: 4 },
  kpiLabel: { color: colors.textSecondary, fontSize: fontSize.xs, textAlign: 'center' },
  onboardingCard: {
    borderColor: colors.accent, borderWidth: 2,
    backgroundColor: 'rgba(249,115,22,0.06)',
  },
  onboardingHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: spacing.md,
  },
  onboardingTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '800' },
  onboardingDismiss: { color: colors.textMuted, fontSize: 20, fontWeight: '700', paddingHorizontal: 8 },
  progressBar: {
    height: 6, borderRadius: 3, backgroundColor: colors.bgInput,
    overflow: 'hidden', marginBottom: spacing.md,
  },
  progressFill: { height: '100%', backgroundColor: colors.accent },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, paddingVertical: spacing.sm },
  stepCircle: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 2,
    borderColor: colors.borderLight, alignItems: 'center', justifyContent: 'center',
  },
  stepCircleDone: { backgroundColor: 'rgba(34,197,94,0.15)', borderColor: colors.success },
  stepCircleText: { color: colors.textMuted, fontSize: 12, fontWeight: '800' },
  stepCircleTextDone: { color: colors.success },
  stepTitle: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600' },
  stepTitleDone: { color: colors.success, textDecorationLine: 'line-through' },
  stepDesc: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },
  tourBtn: {
    marginTop: spacing.md, paddingVertical: 10,
    borderRadius: radius.full, backgroundColor: colors.accent,
    alignItems: 'center',
  },
  tourBtnText: { color: '#0b1120', fontSize: fontSize.sm, fontWeight: '700' },
  productRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.md, borderBottomWidth: 1,
    borderBottomColor: colors.border, gap: spacing.md,
  },
  productRank: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.bgInput, alignItems: 'center', justifyContent: 'center',
  },
  productRankText: { color: colors.accent, fontSize: fontSize.xs, fontWeight: '800' },
  productName: { flex: 1, color: colors.text, fontSize: fontSize.sm, fontWeight: '500' },
  productQty: { color: colors.textSecondary, fontSize: fontSize.xs },
  empty: {
    color: colors.textMuted, fontSize: fontSize.sm,
    fontStyle: 'italic', textAlign: 'center', paddingVertical: spacing.lg,
  },
  errorText: { color: colors.error, fontSize: fontSize.sm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bold: { color: colors.text, fontWeight: '700' },
  // Welcome modal
  welcomeOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center', alignItems: 'center', padding: spacing.lg,
  },
  welcomeBox: {
    backgroundColor: colors.bgCard, borderRadius: radius.xl,
    padding: spacing.xl, width: '100%', maxWidth: 480,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  welcomeTitle: {
    color: colors.text, fontSize: fontSize.xl, fontWeight: '800',
    textAlign: 'center', marginBottom: spacing.sm,
  },
  welcomeAccent: { color: colors.accent },
  welcomeSub: {
    color: colors.textSecondary, fontSize: fontSize.sm,
    textAlign: 'center', marginBottom: spacing.lg, lineHeight: 20,
  },
  welcomeFeature: {
    flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start',
    paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  welcomeFeatureIcon: { fontSize: 24 },
  welcomeFeatureText: {
    flex: 1, color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 20,
  },
  welcomeActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  welcomeBtn: {
    flex: 1, paddingVertical: 14, borderRadius: radius.full,
    alignItems: 'center', justifyContent: 'center', minHeight: 44,
  },
  welcomeBtnPrimary: { backgroundColor: colors.accent },
  welcomeBtnPrimaryText: { color: '#0b1120', fontSize: fontSize.sm, fontWeight: '700' },
  welcomeBtnSecondary: {
    backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.borderLight,
  },
  welcomeBtnSecondaryText: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600' },
});