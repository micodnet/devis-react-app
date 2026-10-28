// // // import { Stack } from 'expo-router';
// // // import { StatusBar } from 'expo-status-bar';
// // // import { useEffect } from 'react';
// // // import { SafeAreaProvider } from 'react-native-safe-area-context';
// // // import { useAuth } from '../lib/auth';
// // // import { colors } from '../lib/theme';

// // // export default function RootLayout() {
// // //   const loadSession = useAuth((s) => s.loadSession);

// // //   useEffect(() => {
// // //     loadSession();
// // //   }, []);

// // //   return (
// // //     <SafeAreaProvider>
// // //       <StatusBar style="light" />
// // //       <Stack
// // //         screenOptions={{
// // //           headerShown: false,
// // //           contentStyle: { backgroundColor: colors.bg },
// // //           animation: 'slide_from_right',
// // //         }}
// // //       >
// // //         <Stack.Screen name="index" />
// // //         <Stack.Screen name="(auth)" />
// // //         <Stack.Screen name="(app)" />
// // //       </Stack>
// // //     </SafeAreaProvider>
// // //   );
// // // }

// // // import { useEffect } from 'react';
// // // import { Stack } from 'expo-router';
// // // import { StatusBar } from 'expo-status-bar';
// // // import { SafeAreaProvider } from 'react-native-safe-area-context';
// // // import { useAuth } from '../lib/auth';
// // // import { colors } from '../lib/theme';
// // // import { AssistantProvider } from '../components/AssistantProvider';
// // // import AssistantBubble from '../components/AssistantBubble';

// // // export default function RootLayout() {
// // //   const loadSession = useAuth((s) => s.loadSession);
// // //   const token = useAuth((s) => s.token);

// // //   useEffect(() => {
// // //     loadSession();
// // //   }, []);

// // //   return (
// // //     <SafeAreaProvider>
// // //       <StatusBar style="light" />
// // //       <AssistantProvider>
// // //         <Stack
// // //           screenOptions={{
// // //             headerShown: false,
// // //             contentStyle: { backgroundColor: colors.bg },
// // //             animation: 'slide_from_right',
// // //           }}
// // //         />
// // //         {/* Bulle flottante visible partout quand l'utilisateur est connecté */}
// // //         {token ? <AssistantBubble /> : null}
// // //       </AssistantProvider>
// // //     </SafeAreaProvider>
// // //   );
// // // }

// // import { useEffect } from 'react';
// // import { Stack } from 'expo-router';
// // import { StatusBar } from 'expo-status-bar';
// // import { SafeAreaProvider } from 'react-native-safe-area-context';
// // import { useAuth } from '../lib/auth';
// // import { colors } from '../lib/theme';
// // import { AssistantProvider } from '../components/AssistantProvider';
// // import AssistantBubble from '../components/AssistantBubble';

// // export default function RootLayout() {
// //   const loadSession = useAuth((s) => s.loadSession);
// //   const token = useAuth((s) => s.token);

// //   useEffect(() => {
// //     loadSession();
// //   }, []);

// //   return (
// //     <SafeAreaProvider>
// //       <StatusBar style="light" />
// //       <AssistantProvider>
// //         <Stack
// //           screenOptions={{
// //             headerShown: false,
// //             contentStyle: { backgroundColor: colors.bg },
// //             animation: 'slide_from_right',
// //           }}
// //         />
// //         {token ? <AssistantBubble /> : null}
// //       </AssistantProvider>
// //     </SafeAreaProvider>
// //   );
// // }
// import { useEffect } from 'react';
// import { Stack } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { useAuth } from '../lib/auth';
// import { colors } from '../lib/theme';
// import { AssistantProvider } from '../components/AssistantProvider';
// import AssistantBubble from '../components/AssistantBubble';

// export default function RootLayout() {
//   const loadSession = useAuth((s) => s.loadSession);
//   const token = useAuth((s) => s.token);

//   useEffect(() => { loadSession(); }, []);

//   return (
//     <SafeAreaProvider>
//       <StatusBar style="light" />
//       <AssistantProvider>
//         <Stack
//           screenOptions={{
//             headerShown: false,
//             contentStyle: { backgroundColor: colors.bg },
//             animation: 'slide_from_right',
//           }}
//         />
//         {token ? <AssistantBubble /> : null}
//       </AssistantProvider>
//     </SafeAreaProvider>
//   );
// }
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useAuth } from '../lib/auth';
import { colors } from '../lib/theme';
import { AssistantProvider } from '../components/AssistantProvider';
import AssistantBubble from '../components/AssistantBubble';

// Empêcher le splash de se cacher automatiquement
SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore */
});

export default function RootLayout() {
  const loadSession = useAuth((s) => s.loadSession);
  const isLoading = useAuth((s) => s.isLoading);
  const token = useAuth((s) => s.token);
  const [appReady, setAppReady] = useState(false);

  // Charger la session au démarrage
  useEffect(() => {
    loadSession();
  }, []);

  // Cacher le splash une fois que tout est prêt
  useEffect(() => {
    if (!isLoading) {
      // Session chargée
      setTimeout(() => {
        setAppReady(true);
        SplashScreen.hideAsync().catch(() => {
          /* ignore */
        });
      }, 300); // petit délai pour éviter le flash
    }
  }, [isLoading]);

  if (!appReady) {
    // Le splash est encore visible, on ne rend rien
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AssistantProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg },
            animation: 'slide_from_right',
          }}
        />
        {token ? <AssistantBubble /> : null}
      </AssistantProvider>
    </SafeAreaProvider>
  );
}