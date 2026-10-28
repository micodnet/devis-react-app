// // lib/notifications.js
// // Helper pour la gestion des notifications push (Expo)

// import * as Notifications from 'expo-notifications';
// import * as Device from 'expo-device';
// import Constants from 'expo-constants';
// import { Platform } from 'react-native';
// import { pushApi } from './api';

// // Configuration : afficher les notifications même quand l'app est ouverte
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: true,
//   }),
// });

// /**
//  * Demande la permission d'envoyer des notifications.
//  * Retourne true si accordée, false sinon.
//  */
// export async function requestPermission() {
//   if (!Device.isDevice) {
//     return { granted: false, reason: 'physical_device_required' };
//   }

//   const { status: existingStatus } = await Notifications.getPermissionsAsync();
//   let finalStatus = existingStatus;

//   if (existingStatus !== 'granted') {
//     const { status } = await Notifications.requestPermissionsAsync();
//     finalStatus = status;
//   }

//   if (finalStatus !== 'granted') {
//     return { granted: false, reason: 'denied' };
//   }

//   // Canal Android (obligatoire depuis Android 8)
//   if (Platform.OS === 'android') {
//     await Notifications.setNotificationChannelAsync('default', {
//       name: 'default',
//       importance: Notifications.AndroidImportance.MAX,
//       vibrationPattern: [0, 250, 250, 250],
//       lightColor: '#f97316',
//     });
//   }

//   return { granted: true };
// }

// /**
//  * Récupère le token Expo Push de l'appareil.
//  * Nécessite un projectId EAS configuré dans app.json.
//  */
// export async function getExpoPushToken() {
//   try {
//     const projectId =
//       Constants.expoConfig?.extra?.eas?.projectId ||
//       Constants.easConfig?.projectId;

//     if (!projectId) {
//       throw new Error(
//         'projectId EAS manquant. Lance "npx eas init" dans le projet.'
//       );
//     }

//     const tokenData = await Notifications.getExpoPushTokenAsync({
//       projectId,
//     });
//     return tokenData.data;
//   } catch (err) {
//     console.warn('Erreur getExpoPushToken:', err.message);
//     throw err;
//   }
// }

// /**
//  * Enregistre l'appareil auprès du backend.
//  * Envoie le token Expo Push + des métadonnées (device, OS).
//  */
// export async function registerDevice() {
//   const permission = await requestPermission();
//   if (!permission.granted) {
//     return { success: false, reason: permission.reason };
//   }

//   const token = await getExpoPushToken();

//   await pushApi.subscribe({
//     endpoint: token,
//     deviceLabel: Device.modelName || 'Appareil inconnu',
//     userAgent: `${Platform.OS} ${Platform.Version}`,
//     p256dh: null,
//     auth: null,
//   });

//   return { success: true, token };
// }

// /**
//  * Configure un listener pour les notifications reçues pendant que l'app est ouverte.
//  */
// export function addNotificationListener(handler) {
//   return Notifications.addNotificationReceivedListener(handler);
// }

// /**
//  * Configure un listener pour les notifications tapées par l'utilisateur.
//  */
// export function addResponseListener(handler) {
//   return Notifications.addNotificationResponseReceivedListener(handler);
// }

// lib/notifications.js
// Version placeholder — les notifications push complètes nécessitent un dev build
// (Expo SDK 53+ a retiré les push Expo Go)

import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { pushApi } from './api';

/**
 * Vérifie si les push sont supportées dans l'environnement actuel.
 */
export function isPushSupported() {
  // Les push ne fonctionnent que dans un dev build ou une production, pas Expo Go
  if (Constants.appOwnership === 'expo') {
    return false;
  }
  return Platform.OS === 'android' || Platform.OS === 'ios';
}

/**
 * Placeholder — ne fait rien pour l'instant.
 */
export async function requestPermission() {
  return { granted: false, reason: 'dev_build_required' };
}

export async function getExpoPushToken() {
  throw new Error('Nécessite un development build (pas Expo Go)');
}

export async function registerDevice() {
  return { success: false, reason: 'dev_build_required' };
}

export function addNotificationListener() {
  return null;
}

export function addResponseListener() {
  return null;
}