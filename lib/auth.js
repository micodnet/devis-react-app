// // lib/auth.js
// import * as SecureStore from 'expo-secure-store';
// import { Platform } from 'react-native';
// import { create } from 'zustand';
// import api from './api';

// // --- Stockage Multi-Plateforme ---
// const storage = {
//   getItem: async (key) => {
//     if (Platform.OS === 'web') return localStorage.getItem(key);
//     return await SecureStore.getItemAsync(key);
//   },
//   setItem: async (key, value) => {
//     if (Platform.OS === 'web') { localStorage.setItem(key, value); return; }
//     await SecureStore.setItemAsync(key, value);
//   },
//   removeItem: async (key) => {
//     if (Platform.OS === 'web') { localStorage.removeItem(key); return; }
//     await SecureStore.deleteItemAsync(key);
//   },
// };

// export const useAuth = create((set, get) => ({
//   user: null,
//   token: null,
//   isLoading: true,
//   isSigningIn: false,

//   loadSession: async () => {
//     try {
//       const token = await storage.getItem('devis_token');
//       const userJson = await storage.getItem('devis_user');
//       if (token && userJson) {
//         set({ token, user: JSON.parse(userJson), isLoading: false });
//       } else {
//         set({ token: null, user: null, isLoading: false });
//       }
//     } catch (err) { set({ token: null, user: null, isLoading: false }); }
//   },

//   login: async (email, password) => {
//     set({ isSigningIn: true });
//     try {
//       const res = await api.post('/api/auth/login', { email, password });
//       const { token, user } = res.data;
//       await storage.setItem('devis_token', token);
//       await storage.setItem('devis_user', JSON.stringify(user));
//       set({ token, user, isSigningIn: false });
//       return user;
//     } catch (err) {
//       set({ isSigningIn: false });
//       throw new Error(err.response?.data?.error || 'Erreur de connexion.');
//     }
//   },

//   // ... (Garde les autres fonctions signup, logout, forgotPassword, resetPassword telles quelles)
// }));
// lib/auth.js
import { create } from 'zustand';
import api, { storage } from './api';

export const useAuth = create((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isSigningIn: false,

  loadSession: async () => {
    try {
      const token = await storage.getItem('devis_token');
      const userJson = await storage.getItem('devis_user');
      if (token && userJson) {
        set({ token, user: JSON.parse(userJson), isLoading: false });
      } else {
        set({ token: null, user: null, isLoading: false });
      }
    } catch (err) {
      set({ token: null, user: null, isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isSigningIn: true });
    try {
      const res = await api.post('/api/auth/login', { email, password });
      const { token, user } = res.data;
      await storage.setItem('devis_token', token);
      await storage.setItem('devis_user', JSON.stringify(user));
      set({ token, user, isSigningIn: false });
      return user;
    } catch (err) {
      set({ isSigningIn: false });
      const msg = err.response?.data?.error || 'Erreur de connexion.';
      throw new Error(msg);
    }
  },

  signup: async (email, password, termsAccepted) => {
    set({ isSigningIn: true });
    try {
      const res = await api.post('/api/auth/signup', { email, password, termsAccepted });
      const { token, user } = res.data;
      await storage.setItem('devis_token', token);
      await storage.setItem('devis_user', JSON.stringify(user));
      set({ token, user, isSigningIn: false });
      return user;
    } catch (err) {
      set({ isSigningIn: false });
      const msg = err.response?.data?.error || 'Erreur lors de l\'inscription.';
      throw new Error(msg);
    }
  },

  logout: async () => {
    // 1. Supprimer le stockage d'abord
    try {
      await storage.removeItem('devis_token');
      await storage.removeItem('devis_user');
    } catch (err) { /* silent */ }
    // 2. Vider le state (déclenche la redirection via _layout)
    set({ token: null, user: null });
  },

  forgotPassword: async (email) => {
    try {
      const res = await api.post('/api/auth/forgot-password', { email });
      return res.data.message || 'Si un compte existe, un email a été envoyé.';
    } catch (err) {
      const msg = err.response?.data?.error || 'Erreur lors de l\'envoi.';
      throw new Error(msg);
    }
  },

  resetPassword: async (token, password) => {
    try {
      const res = await api.post('/api/auth/reset-password', { token, password });
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Erreur lors de la réinitialisation.';
      throw new Error(msg);
    }
  },
}));