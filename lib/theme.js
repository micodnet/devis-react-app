// // lib/theme.js
// // Theme sombre de l'application

// export const colors = {
//   // Backgrounds
//   bg: '#0a0f1a',
//   bgCard: '#111827',
//   bgInput: '#1f2937',
//   bgElevated: '#161f32',

//   // Bordures
//   border: '#1e2a3f',
//   borderLight: '#2a3a55',

//   // Textes
//   text: '#f9fafb',
//   textSecondary: '#9ca3af',
//   textMuted: '#64748b',

//   // Accents
//   primary: '#3b82f6',
//   accent: '#f97316',

//   // Etats
//   success: '#10b981',
//   warning: '#eab308',
//   error: '#ef4444',
//   info: '#3b82f6',
// };

// export const spacing = {
//   xs: 4,
//   sm: 8,
//   md: 12,
//   lg: 16,
//   xl: 24,
//   xxl: 32,
// };

// export const radius = {
//   sm: 6,
//   md: 10,
//   lg: 14,
//   xl: 20,
//   full: 999,
// };

// export const fontSize = {
//   xs: 11,
//   sm: 13,
//   md: 15,
//   lg: 17,
//   xl: 22,
//   xxl: 28,
// };

// export const shadow = {
//   card: {
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 6,
//   },
// };

// lib/theme.js
export const colors = {
  bg: '#0a0f1a',
  bgCard: '#111827',
  bgInput: '#1f2937',
  bgElevated: '#161f32',
  border: '#1e2a3f',
  borderLight: '#2a3a55',
  text: '#f9fafb',
  textSecondary: '#9ca3af',
  textMuted: '#64748b',
  primary: '#3b82f6',
  accent: '#f97316',
  success: '#10b981',
  warning: '#eab308',
  error: '#ef4444',
  info: '#3b82f6',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const radius = { sm: 6, md: 10, lg: 14, xl: 20, full: 999 };

export const fontSize = { xs: 11, sm: 13, md: 15, lg: 17, xl: 22, xxl: 28 };

// Note : on utilise `boxShadow` (nouvelle API RN 0.76+) au lieu de shadow* deprecated.
// Si ton Expo SDK ne supporte pas encore `boxShadow`, garde l'objet vide
// et les cards n'auront simplement pas d'ombre (l'app reste fonctionnelle).
export const shadow = {
  card: {
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
    elevation: 6, // Android fallback (pas deprecated)
  },
};