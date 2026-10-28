// // lib/api.js
// import axios from 'axios';
// import * as SecureStore from 'expo-secure-store';
// import { Platform } from 'react-native';
// import Constants from 'expo-constants';

// const API_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:3000';

// const api = axios.create({
//   baseURL: API_URL,
//   timeout: 30000,
//   headers: { 'Content-Type': 'application/json' },
// });

// // Wrapper cross-platform
// export const storage = {
//   getItem: async (key) => {
//     if (Platform.OS === 'web') return localStorage.getItem(key);
//     return await SecureStore.getItemAsync(key);
//   },
//   setItem: async (key, value) => {
//     if (Platform.OS === 'web') return localStorage.setItem(key, value);
//     return await SecureStore.setItemAsync(key, value);
//   },
//   removeItem: async (key) => {
//     if (Platform.OS === 'web') return localStorage.removeItem(key);
//     return await SecureStore.deleteItemAsync(key);
//   },
// };

// api.interceptors.request.use(async (config) => {
//   const token = await storage.getItem('devis_token');
//   if (token) config.headers.Authorization = 'Bearer ' + token;
//   return config;
// });

// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     if (error.response?.status === 401) {
//       await storage.removeItem('devis_token');
//       await storage.removeItem('devis_user');
//     }
//     return Promise.reject(error);
//   }
// );

// // ------------------------------------------------------------
// // API DEVIS
// // ------------------------------------------------------------
// export const quotesApi = {
//   // Liste (via /api/history)
//   list: () => api.get('/api/history').then((r) => r.data),

//   // Détail
//   get: (id) => api.get(`/api/quotes/${id}`).then((r) => r.data),

//   // Changer le statut
//   setStatus: (id, status) =>
//     api.put(`/api/quotes/${id}/status`, { status }).then((r) => r.data),

//   // Supprimer
//   remove: (id) => api.delete(`/api/quotes/${id}`).then((r) => r.data),

//   // Dupliquer
//   duplicate: (id) => api.post(`/api/quotes/${id}/duplicate`).then((r) => r.data),

//   // ------------------------------------------------------------
//   // Génération d'un devis depuis un fichier (IA)
//   // @param file: { uri, name, mimeType } ou File (web)
//   // @param clientId (optionnel)
//   // @param currency (optionnel, défaut EUR)
//   // ------------------------------------------------------------
//   generateFromFile: async ({ file, clientId, currency = 'EUR' }) => {
//     const formData = new FormData();

//     // Sur web : file est un File natif → on l'ajoute directement
//     // Sur mobile : file est un objet { uri, name, mimeType } → on l'ajoute au format RN
//     if (Platform.OS === 'web') {
//       const actualFile = file.file || file;
//       formData.append('file', actualFile, actualFile.name || 'document');
//     } else {
//       formData.append('file', {
//         uri: file.uri,
//         name: file.name || 'document.pdf',
//         type: file.mimeType || 'application/octet-stream',
//       });
//     }

//     if (clientId) formData.append('clientId', String(clientId));
//     formData.append('currency', currency);

//     const res = await api.post('/api/generate-quote', formData, {
//       headers: { 'Content-Type': 'multipart/form-data' },
//       timeout: 120000, // 2 min pour l'IA
//     });
//     return res.data;
//   },
// };

// // ------------------------------------------------------------
// // API DASHBOARD
// // ------------------------------------------------------------
// export const dashboardApi = {
//   summary: () => api.get('/api/dashboard').then((r) => r.data),
//   charts: () => api.get('/api/dashboard/charts').then((r) => r.data),
// };

// // ------------------------------------------------------------
// // CLIENTS
// // ------------------------------------------------------------
// export const clientsApi = {
//   list: () => api.get('/api/clients').then((r) => r.data),
//   get: (id) => api.get(`/api/clients/${id}`).then((r) => r.data),
//   create: (data) => api.post('/api/clients', data).then((r) => r.data),
//   update: (id, data) => api.put(`/api/clients/${id}`, data).then((r) => r.data),
//   remove: (id) => api.delete(`/api/clients/${id}`).then((r) => r.data),
// };

// // ------------------------------------------------------------
// // CATALOGUE PRODUITS
// // ------------------------------------------------------------
// export const productsApi = {
//   list: () => api.get('/api/products').then((r) => r.data),
//   get: (id) => api.get(`/api/products/${id}`).then((r) => r.data),
//   create: (data) => api.post('/api/products', data).then((r) => r.data),
//   update: (id, data) => api.put(`/api/products/${id}`, data).then((r) => r.data),
//   remove: (id) => api.delete(`/api/products/${id}`).then((r) => r.data),
// };

// // ------------------------------------------------------------
// // SERVICES
// // ------------------------------------------------------------
// export const servicesApi = {
//   list: () => api.get('/api/services').then((r) => r.data),
//   get: (id) => api.get(`/api/services/${id}`).then((r) => r.data),
//   create: (data) => api.post('/api/services', data).then((r) => r.data),
//   update: (id, data) => api.put(`/api/services/${id}`, data).then((r) => r.data),
//   remove: (id) => api.delete(`/api/services/${id}`).then((r) => r.data),
// };
// // ------------------------------------------------------------
// // STOCK
// // ------------------------------------------------------------
// export const stockApi = {
//   // Alertes
//   alerts: () => api.get('/api/stock/alerts').then((r) => r.data),

//   // Mouvements
//   movements: (limit = 100) =>
//     api.get(`/api/stock/movements?limit=${limit}`).then((r) => r.data),
//   createMovement: (data) =>
//     api.post('/api/stock/movements', data).then((r) => r.data),

//   // Produits avec stock (via /api/products, filtré côté client)
//   productsWithStock: async () => {
//     const products = await api.get('/api/products').then((r) => r.data);
//     return Array.isArray(products) ? products.filter((p) => p.trackStock === true) : [];
//   },
// };

// // ------------------------------------------------------------
// // FOURNISSEURS
// // ------------------------------------------------------------
// export const suppliersApi = {
//   list: () => api.get('/api/suppliers').then((r) => r.data),
//   get: (id) => api.get(`/api/suppliers/${id}`).then((r) => r.data),
//   create: (data) => api.post('/api/suppliers', data).then((r) => r.data),
//   update: (id, data) => api.put(`/api/suppliers/${id}`, data).then((r) => r.data),
//   remove: (id) => api.delete(`/api/suppliers/${id}`).then((r) => r.data),
// };

// // ------------------------------------------------------------
// // FACTURES
// // ------------------------------------------------------------
// export const invoicesApi = {
//   list: () => api.get('/api/invoices').then((r) => r.data),
//   get: (id) => api.get(`/api/invoices/${id}`).then((r) => r.data),
//   setStatus: (id, status, paymentMethod) =>
//     api
//       .put(`/api/invoices/${id}/status`, { status, paymentMethod })
//       .then((r) => r.data),
//   remove: (id) => api.delete(`/api/invoices/${id}`).then((r) => r.data),

//   listPayments: (id) =>
//     api.get(`/api/invoices/${id}/payments`).then((r) => r.data),
//   recordPayment: (id, data) =>
//     api.post(`/api/invoices/${id}/payments`, data).then((r) => r.data),
// };

// // ------------------------------------------------------------
// // CHANTIERS
// // ------------------------------------------------------------
// export const chantiersApi = {
//   list: () => api.get('/api/chantiers').then((r) => r.data),
//   get: (id) => api.get(`/api/chantiers/${id}`).then((r) => r.data),
//   stats: (id) => api.get(`/api/chantiers/${id}/stats`).then((r) => r.data),
//   quotes: (id) => api.get(`/api/chantiers/${id}/quotes`).then((r) => r.data),
//   invoices: (id) => api.get(`/api/chantiers/${id}/invoices`).then((r) => r.data),
//   events: (id) => api.get(`/api/chantiers/${id}/events`).then((r) => r.data),
// };

// // ------------------------------------------------------------
// // CHAT CLIENT
// // ------------------------------------------------------------
// export const chatApi = {
//   conversations: (filter) =>
//     api
//       .get('/api/chat/conversations' + (filter ? `?filter=${filter}` : ''))
//       .then((r) => r.data),
//   conversation: (id) =>
//     api.get(`/api/chat/conversations/${id}`).then((r) => r.data),
//   sendMessage: (conversationId, body) =>
//     api
//       .post(`/api/chat/conversations/${conversationId}/messages`, { body })
//       .then((r) => r.data),
//   stats: () => api.get('/api/chat/stats').then((r) => r.data),
// };

// // ------------------------------------------------------------
// // ASSISTANT IA
// // ------------------------------------------------------------
// export const assistantApi = {
//   chat: (message, history = []) =>
//     api
//       .post('/api/assistant/chat', { message, history })
//       .then((r) => r.data),
//   confirm: (draft) =>
//     api.post('/api/assistant/confirm', { draft }).then((r) => r.data),
//   suggestions: () => api.get('/api/assistant/suggestions').then((r) => r.data),
//   acceptSuggestion: (id) =>
//     api.post(`/api/assistant/suggestions/${id}/accept`).then((r) => r.data),
//   dismissSuggestion: (id) =>
//     api.post(`/api/assistant/suggestions/${id}/dismiss`).then((r) => r.data),
// };

// // ------------------------------------------------------------
// // PARAMÈTRES ENTREPRISE
// // ------------------------------------------------------------
// export const settingsApi = {
//   get: () => api.get('/api/settings').then((r) => r.data),
//   update: (data) => api.post('/api/settings', data).then((r) => r.data),
// };

// // ------------------------------------------------------------
// // SÉCURITÉ COMPTE
// // ------------------------------------------------------------
// export const accountApi = {
//   changePassword: (currentPassword, newPassword) =>
//     api
//       .post('/api/auth/change-password', { currentPassword, newPassword })
//       .then((r) => r.data),

//   deleteAccount: (password) =>
//     api
//       .delete('/api/account', {
//         data: { password, confirm: 'DELETE_MY_ACCOUNT' },
//       })
//       .then((r) => r.data),

//   exportData: () => api.get('/api/export-data').then((r) => r.data),
// };

// // ------------------------------------------------------------
// // NOTIFICATIONS PUSH
// // ------------------------------------------------------------
// export const pushApi = {
//   vapidKey: () => api.get('/api/push/vapid-key').then((r) => r.data),
//   subscribe: (subscription) =>
//     api.post('/api/push/subscribe', subscription).then((r) => r.data),
//   subscriptions: () => api.get('/api/push/subscriptions').then((r) => r.data),
//   test: () => api.post('/api/push/test').then((r) => r.data),
// };

// // ------------------------------------------------------------
// // MODÈLES DE DEVIS
// // ------------------------------------------------------------
// export const templatesApi = {
//   list: (params = {}) => {
//     const qs = new URLSearchParams();
//     if (params.category) qs.set('category', params.category);
//     if (params.search) qs.set('search', params.search);
//     const suffix = qs.toString() ? `?${qs.toString()}` : '';
//     return api.get(`/api/quote-templates${suffix}`).then((r) => r.data);
//   },

//   categories: () => api.get('/api/quote-templates/categories').then((r) => r.data),

//   get: (id) => api.get(`/api/quote-templates/${id}`).then((r) => r.data),

//   create: (data) => api.post('/api/quote-templates', data).then((r) => r.data),

//   update: (id, data) =>
//     api.put(`/api/quote-templates/${id}`, data).then((r) => r.data),

//   remove: (id) =>
//     api.delete(`/api/quote-templates/${id}`).then((r) => r.data),

//   duplicate: (id) =>
//     api.post(`/api/quote-templates/${id}/duplicate`).then((r) => r.data),

//   // Utiliser un modèle → crée un nouveau devis
//   use: (id) => api.post(`/api/quote-templates/${id}/use`).then((r) => r.data),

//   // Sauvegarder un devis existant comme modèle
//   fromQuote: (quoteId, data) =>
//     api
//       .post(`/api/quote-templates/from-quote/${quoteId}`, data)
//       .then((r) => r.data),
// };

// // ------------------------------------------------------------
// // DEVIS RÉCURRENTS
// // ------------------------------------------------------------
// export const recurringApi = {
//   list: (status) => {
//     const suffix = status && status !== 'all' ? `?status=${status}` : '';
//     return api.get(`/api/recurring${suffix}`).then((r) => r.data);
//   },

//   meta: () => api.get('/api/recurring/meta').then((r) => r.data),

//   get: (id) => api.get(`/api/recurring/${id}`).then((r) => r.data),

//   create: (data) => api.post('/api/recurring', data).then((r) => r.data),

//   update: (id, data) => api.put(`/api/recurring/${id}`, data).then((r) => r.data),

//   remove: (id) => api.delete(`/api/recurring/${id}`).then((r) => r.data),

//   pause: (id) => api.post(`/api/recurring/${id}/pause`).then((r) => r.data),

//   resume: (id) => api.post(`/api/recurring/${id}/resume`).then((r) => r.data),

//   // Force l'émission des factures dues maintenant
//   process: () => api.post('/api/recurring/process').then((r) => r.data),
// };

// // ------------------------------------------------------------
// // BONS DE COMMANDE FOURNISSEURS
// // ------------------------------------------------------------
// export const purchaseOrdersApi = {
//   list: (status) => {
//     const suffix = status && status !== 'all' ? `?status=${status}` : '';
//     return api.get(`/api/purchase-orders${suffix}`).then((r) => r.data);
//   },

//   get: (id) => api.get(`/api/purchase-orders/${id}`).then((r) => r.data),

//   create: (data) => api.post('/api/purchase-orders', data).then((r) => r.data),

//   update: (id, data) =>
//     api.put(`/api/purchase-orders/${id}`, data).then((r) => r.data),

//   remove: (id) => api.delete(`/api/purchase-orders/${id}`).then((r) => r.data),

//   validate: (id) =>
//     api.post(`/api/purchase-orders/${id}/validate`).then((r) => r.data),

//   cancel: (id) =>
//     api.post(`/api/purchase-orders/${id}/cancel`).then((r) => r.data),

//   // Réceptionner → met à jour le stock
//   receive: (id) =>
//     api.post(`/api/purchase-orders/${id}/receive`).then((r) => r.data),

//   sendByEmail: (id, email) =>
//     api
//       .post(`/api/purchase-orders/${id}/send-email`, { email })
//       .then((r) => r.data),

//   // Scanner les stocks et générer les BC automatiquement
//   scanStock: () =>
//     api.post('/api/purchase-orders/scan-stock').then((r) => r.data),

//   // Logs d'un BC
//   logs: (id) => api.get(`/api/purchase-orders/${id}/logs`).then((r) => r.data),
// };
// // ------------------------------------------------------------
// // BONS DE COMMANDE
// // ------------------------------------------------------------
// // export const purchaseOrdersApi = {
// //   list: () => api.get('/api/stock/purchase-orders').then((r) => r.data),
// //   get: (id) => api.get(`/api/stock/purchase-orders/${id}`).then((r) => r.data),
// //   create: (data) =>
// //     api.post('/api/stock/purchase-orders', data).then((r) => r.data),
// //   updateStatus: (id, status) =>
// //     api
// //       .put(`/api/stock/purchase-orders/${id}/status`, { status })
// //       .then((r) => r.data),
// //   remove: (id) =>
// //     api.delete(`/api/stock/purchase-orders/${id}`).then((r) => r.data),
// // };

// // ------------------------------------------------------------
// // ANALYTICS / STATISTIQUES
// // ------------------------------------------------------------
// export const statsApi = {
//   kpi: () => api.get('/api/stats/kpi').then((r) => r.data),
//   treasury: () => api.get('/api/stats/treasury').then((r) => r.data),

//   profitabilityByMetier: (params = {}) => {
//     const qs = new URLSearchParams();
//     if (params.from) qs.set('from', params.from);
//     if (params.to) qs.set('to', params.to);
//     const suffix = qs.toString() ? `?${qs.toString()}` : '';
//     return api.get(`/api/stats/profitability/by-metier${suffix}`).then((r) => r.data);
//   },

//   profitabilityByClient: (params = {}) => {
//     const qs = new URLSearchParams();
//     if (params.from) qs.set('from', params.from);
//     if (params.to) qs.set('to', params.to);
//     if (params.limit) qs.set('limit', params.limit);
//     const suffix = qs.toString() ? `?${qs.toString()}` : '';
//     return api.get(`/api/stats/profitability/by-client${suffix}`).then((r) => r.data);
//   },

//   conversion: (params = {}) => {
//     const qs = new URLSearchParams();
//     if (params.from) qs.set('from', params.from);
//     if (params.to) qs.set('to', params.to);
//     const suffix = qs.toString() ? `?${qs.toString()}` : '';
//     return api.get(`/api/stats/conversion${suffix}`).then((r) => r.data);
//   },

//   topProducts: (params = {}) => {
//     const qs = new URLSearchParams();
//     if (params.from) qs.set('from', params.from);
//     if (params.to) qs.set('to', params.to);
//     if (params.limit) qs.set('limit', params.limit);
//     const suffix = qs.toString() ? `?${qs.toString()}` : '';
//     return api.get(`/api/stats/top-products${suffix}`).then((r) => r.data);
//   },

//   temporal: (params = {}) => {
//     const qs = new URLSearchParams();
//     if (params.from) qs.set('from', params.from);
//     if (params.to) qs.set('to', params.to);
//     const suffix = qs.toString() ? `?${qs.toString()}` : '';
//     return api.get(`/api/stats/temporal${suffix}`).then((r) => r.data);
//   },
// };

// // ------------------------------------------------------------
// // RAPPORTS PDF
// // ------------------------------------------------------------
// export const reportsApi = {
//   // Renvoie un Blob (PDF) — à utiliser avec responseType: 'blob'
//   downloadPdf: (from, to) =>
//     api
//       .get(`/api/reports/pdf?from=${from}&to=${to}`, {
//         responseType: 'arraybuffer',
//         timeout: 120000,
//       })
//       .then((r) => r.data),
// };

// // ------------------------------------------------------------
// // ANALYSE IMAGE (VISION IA)
// // ------------------------------------------------------------
// export const visionApi = {
//   // Envoie une image pour analyse IA
//   // file : { uri, name, mimeType }
//   analyze: async ({ file, prompt }) => {
//     const formData = new FormData();

//     if (Platform.OS === 'web') {
//       const actualFile = file.file || file;
//       formData.append('image', actualFile, actualFile.name || 'image.jpg');
//     } else {
//       formData.append('image', {
//         uri: file.uri,
//         name: file.name || 'image.jpg',
//         type: file.mimeType || 'image/jpeg',
//       });
//     }

//     if (prompt) formData.append('prompt', prompt);

//     const res = await api.post('/api/vision/analyze', formData, {
//       headers: { 'Content-Type': 'multipart/form-data' },
//       timeout: 120000,
//     });
//     return res.data;
//   },

//   history: (limit = 50) =>
//     api.get(`/api/vision/history?limit=${limit}`).then((r) => r.data),

//   get: (id) => api.get(`/api/vision/${id}`).then((r) => r.data),

//   remove: (id) => api.delete(`/api/vision/${id}`).then((r) => r.data),

//   // Convertit une analyse en devis
//   convertToQuote: (id, data) =>
//     api
//       .post(`/api/vision/${id}/convert-to-quote`, data)
//       .then((r) => r.data),
// };

// // ------------------------------------------------------------
// // IMPORT EMAIL
// // ------------------------------------------------------------
// export const emailImportApi = {
//   // Analyse un texte d'email
//   // data: { text, fromName, fromEmail, subject }
//   analyze: (data) =>
//     api.post('/api/email-import/analyze', data).then((r) => r.data),

//   list: () => api.get('/api/email-import').then((r) => r.data),

//   get: (id) => api.get(`/api/email-import/${id}`).then((r) => r.data),

//   remove: (id) => api.delete(`/api/email-import/${id}`).then((r) => r.data),

//   // Convertit un import en devis
//   convert: (id, data = {}) =>
//     api.post(`/api/email-import/${id}/convert`, data).then((r) => r.data),
// };

// // ------------------------------------------------------------
// // RENDEZ-VOUS
// // ------------------------------------------------------------
// export const appointmentsApi = {
//   list: (params = {}) => {
//     const qs = new URLSearchParams();
//     if (params.status) qs.set('status', params.status);
//     if (params.upcoming) qs.set('upcoming', 'true');
//     if (params.from) qs.set('from', params.from);
//     if (params.to) qs.set('to', params.to);
//     const suffix = qs.toString() ? `?${qs.toString()}` : '';
//     return api.get(`/api/appointments${suffix}`).then((r) => r.data);
//   },

//   get: (id) => api.get(`/api/appointments/${id}`).then((r) => r.data),

//   create: (data) => api.post('/api/appointments', data).then((r) => r.data),

//   update: (id, data) =>
//     api.put(`/api/appointments/${id}`, data).then((r) => r.data),

//   setStatus: (id, status, reason) =>
//     api
//       .put(`/api/appointments/${id}/status`, { status, reason })
//       .then((r) => r.data),

//   remove: (id) => api.delete(`/api/appointments/${id}`).then((r) => r.data),

//   // Config booking
//   config: () => api.get('/api/appointments/config').then((r) => r.data),
//   updateConfig: (data) =>
//     api.post('/api/appointments/config', data).then((r) => r.data),

//   // Disponibilités
//   availability: () =>
//     api.get('/api/appointments/availability').then((r) => r.data),
//   addAvailability: (data) =>
//     api.post('/api/appointments/availability', data).then((r) => r.data),
//   removeAvailability: (id) =>
//     api.delete(`/api/appointments/availability/${id}`).then((r) => r.data),
// };

// // ------------------------------------------------------------
// // SMS
// // ------------------------------------------------------------
// export const smsApi = {
//   config: () => api.get('/api/sms/config').then((r) => r.data),
//   updateConfig: (data) => api.post('/api/sms/config', data).then((r) => r.data),
//   test: (to) => api.post('/api/sms/test', { to }).then((r) => r.data),
//   stats: () => api.get('/api/sms/stats').then((r) => r.data),
//   logs: (limit = 100) =>
//     api.get(`/api/sms/logs?limit=${limit}`).then((r) => r.data),
// };

// // ------------------------------------------------------------
// // ASSISTANT PROACTIF
// // ------------------------------------------------------------
// export const proactiveApi = {
//   suggestions: () => api.get('/api/proactive/suggestions').then((r) => r.data),
//   count: () => api.get('/api/proactive/count').then((r) => r.data),
//   run: () => api.post('/api/proactive/run').then((r) => r.data),
//   dismiss: (id) =>
//     api.post(`/api/proactive/suggestions/${id}/dismiss`).then((r) => r.data),
//   actioned: (id) =>
//     api.post(`/api/proactive/suggestions/${id}/actioned`).then((r) => r.data),
//   settings: () => api.get('/api/proactive/settings').then((r) => r.data),
//   updateSettings: (data) =>
//     api.post('/api/proactive/settings', data).then((r) => r.data),
// };

// // ------------------------------------------------------------
// // ÉQUIPE
// // ------------------------------------------------------------
// export const teamApi = {
//   members: () => api.get('/api/team/members').then((r) => r.data),
//   invitations: () => api.get('/api/team/invitations').then((r) => r.data),
//   invite: (email, role) =>
//     api.post('/api/team/invite', { email, role }).then((r) => r.data),
//   changeRole: (id, role) =>
//     api.put(`/api/team/members/${id}/role`, { role }).then((r) => r.data),
//   remove: (id) => api.delete(`/api/team/members/${id}`).then((r) => r.data),
//   cancelInvitation: (id) =>
//     api.delete(`/api/team/invitations/${id}`).then((r) => r.data),
// };

// // ------------------------------------------------------------
// // PORTAIL CLIENT
// // ------------------------------------------------------------
// export const clientPortalApi = {
//   accounts: () => api.get('/api/client-portal/accounts').then((r) => r.data),

//   invite: (clientId, email) =>
//     api
//       .post(`/api/client-portal/invite/${clientId}`, { email: email || null })
//       .then((r) => r.data),

//   revoke: (clientId) =>
//     api
//       .post(`/api/client-portal/accounts/${clientId}/revoke`)
//       .then((r) => r.data),

//   reactivate: (clientId) =>
//     api
//       .post(`/api/client-portal/accounts/${clientId}/reactivate`)
//       .then((r) => r.data),
// };

// // ------------------------------------------------------------
// // PAIEMENTS EN LIGNE (Stripe)
// // ------------------------------------------------------------
// export const onlinePaymentsApi = {
//   config: () => api.get('/api/online-payments/config').then((r) => r.data),
//   updateConfig: (data) =>
//     api.post('/api/online-payments/config', data).then((r) => r.data),
//   test: () => api.post('/api/online-payments/test').then((r) => r.data),
//   stats: () => api.get('/api/online-payments/stats').then((r) => r.data),
//   list: (limit = 100) =>
//     api.get(`/api/online-payments/list?limit=${limit}`).then((r) => r.data),

//   // Génère un lien de paiement pour une facture
//   createCheckout: (invoiceId) =>
//     api
//       .post(`/api/online-payments/invoices/${invoiceId}/checkout`)
//       .then((r) => r.data),
// };

// // ------------------------------------------------------------
// // RAPPROCHEMENT BANCAIRE
// // ------------------------------------------------------------
// export const bankApi = {
//   stats: () => api.get('/api/bank/stats').then((r) => r.data),

//   transactions: (status) => {
//     const suffix = status && status !== 'all' ? `?status=${status}` : '';
//     return api.get(`/api/bank/transactions${suffix}`).then((r) => r.data);
//   },

//   imports: () => api.get('/api/bank/imports').then((r) => r.data),

//   // Importe un relevé (multipart)
//   importFile: async (file) => {
//     const formData = new FormData();
//     if (Platform.OS === 'web') {
//       const actualFile = file.file || file;
//       formData.append('file', actualFile, actualFile.name || 'statement.csv');
//     } else {
//       formData.append('file', {
//         uri: file.uri,
//         name: file.name || 'statement.csv',
//         type: file.mimeType || 'application/octet-stream',
//       });
//     }
//     const res = await api.post('/api/bank/import', formData, {
//       headers: { 'Content-Type': 'multipart/form-data' },
//       timeout: 120000,
//     });
//     return res.data;
//   },

//   // Récupère les correspondances proposées pour une transaction
//   matches: (txId) =>
//     api.get(`/api/bank/transactions/${txId}/matches`).then((r) => r.data),

//   // Valide un rapprochement avec une facture
//   validate: (txId, invoiceId) =>
//     api
//       .post(`/api/bank/transactions/${txId}/validate`, { invoiceId })
//       .then((r) => r.data),

//   ignore: (txId) =>
//     api.post(`/api/bank/transactions/${txId}/ignore`).then((r) => r.data),

//   remove: (txId) =>
//     api.delete(`/api/bank/transactions/${txId}`).then((r) => r.data),

//   rematch: () => api.post('/api/bank/rematch').then((r) => r.data),
// };

// // ------------------------------------------------------------
// // CLÉS API
// // ------------------------------------------------------------
// export const apiKeysApi = {
//   list: () => api.get('/api/api-keys').then((r) => r.data),
//   create: (data) => api.post('/api/api-keys', data).then((r) => r.data),
//   revoke: (id) => api.post(`/api/api-keys/${id}/revoke`).then((r) => r.data),
//   remove: (id) => api.delete(`/api/api-keys/${id}`).then((r) => r.data),
//   stats: () => api.get('/api/api-keys/stats').then((r) => r.data),
//   logs: (limit = 100) => api.get(`/api/api-keys/logs?limit=${limit}`).then((r) => r.data),
// };

// // ------------------------------------------------------------
// // WEBHOOKS
// // ------------------------------------------------------------
// export const webhooksApi = {
//   list: () => api.get('/api/webhooks').then((r) => r.data),
//   events: () => api.get('/api/webhooks/events').then((r) => r.data),
//   get: (id) => api.get(`/api/webhooks/${id}`).then((r) => r.data),
//   create: (data) => api.post('/api/webhooks', data).then((r) => r.data),
//   update: (id, data) => api.put(`/api/webhooks/${id}`, data).then((r) => r.data),
//   remove: (id) => api.delete(`/api/webhooks/${id}`).then((r) => r.data),
//   test: (id) => api.post(`/api/webhooks/${id}/test`).then((r) => r.data),
//   deliveries: (id) => api.get(`/api/webhooks/${id}/deliveries`).then((r) => r.data),
// };

// // ------------------------------------------------------------
// // OAUTH
// // ------------------------------------------------------------
// export const oauthApi = {
//   clients: () => api.get('/api/oauth/clients').then((r) => r.data),
//   scopes: () => api.get('/api/oauth/scopes').then((r) => r.data),
//   createClient: (data) => api.post('/api/oauth/clients', data).then((r) => r.data),
//   removeClient: (id) => api.delete(`/api/oauth/clients/${id}`).then((r) => r.data),
//   tokens: () => api.get('/api/oauth/tokens').then((r) => r.data),
//   revokeToken: (id) => api.post(`/api/oauth/tokens/${id}/revoke`).then((r) => r.data),
// };

// // ------------------------------------------------------------
// // ABONNEMENT (Stripe)
// // ------------------------------------------------------------
// export const subscriptionApi = {
//   get: () => api.get('/api/stripe/subscription').then((r) => r.data),
//   checkout: (plan) =>
//     api.post('/api/stripe/create-checkout-session', { plan }).then((r) => r.data),
//   portal: () => api.post('/api/stripe/create-portal-session').then((r) => r.data),
// };

// // ------------------------------------------------------------
// // PEPPOL
// // ------------------------------------------------------------
// export const peppolApi = {
//   test: () => api.post('/api/peppol/test-connection').then((r) => r.data),
//   sendInvoice: (invoiceId) =>
//     api.post(`/api/invoices/${invoiceId}/send-peppol`).then((r) => r.data),
//   invoiceStatus: (invoiceId) =>
//     api.get(`/api/invoices/${invoiceId}/peppol-status`).then((r) => r.data),
// };

// // ------------------------------------------------------------
// // ONBOARDING + DEMO
// // ------------------------------------------------------------
// export const onboardingApi = {
//   get: () => api.get('/api/onboarding').then((r) => r.data),
//   step: (step) => api.post('/api/onboarding/step', { step }).then((r) => r.data),
//   welcomeSeen: () => api.post('/api/onboarding/welcome-seen').then((r) => r.data),
//   tourCompleted: () => api.post('/api/onboarding/tour-completed').then((r) => r.data),
//   dismissChecklist: () => api.post('/api/onboarding/dismiss-checklist').then((r) => r.data),
//   reset: () => api.post('/api/onboarding/reset').then((r) => r.data),
//   autoDetect: () => api.post('/api/onboarding/auto-detect').then((r) => r.data),
// };

// export const demoApi = {
//   start: () => api.post('/api/demo/start').then((r) => r.data),
//   status: () => api.get('/api/demo/status').then((r) => r.data),
// };

// // ------------------------------------------------------------
// // SOUS-TRAITANTS + MISSIONS
// // ------------------------------------------------------------
// export const subcontractorsApi = {
//   // ----------------------------------------------------------
//   // Sous-traitants
//   // ----------------------------------------------------------
//   list: () => api.get('/api/subcontractors').then((r) => r.data),
//   get: (id) => api.get(`/api/subcontractors/${id}`).then((r) => r.data),
//   create: (data) => api.post('/api/subcontractors', data).then((r) => r.data),
//   update: (id, data) =>
//     api.put(`/api/subcontractors/${id}`, data).then((r) => r.data),
//   remove: (id) => api.delete(`/api/subcontractors/${id}`).then((r) => r.data),

//   // ----------------------------------------------------------
//   // Missions (assignments)
//   // ----------------------------------------------------------
//   // Toutes les missions
//   allAssignments: () =>
//     api.get('/api/subcontractors/assignments/all').then((r) => r.data),

//   // Missions d'un sous-traitant
//   assignments: (subcontractorId) =>
//     api
//       .get(`/api/subcontractors/${subcontractorId}/assignments`)
//       .then((r) => r.data),

//   // Créer une mission
//   createAssignment: (subcontractorId, data) =>
//     api
//       .post(`/api/subcontractors/${subcontractorId}/assignments`, data)
//       .then((r) => r.data),

//   // Récupérer / modifier / supprimer une mission
//   getAssignment: (id) =>
//     api.get(`/api/subcontractors/assignments/${id}`).then((r) => r.data),
//   updateAssignment: (id, data) =>
//     api.put(`/api/subcontractors/assignments/${id}`, data).then((r) => r.data),
//   removeAssignment: (id) =>
//     api.delete(`/api/subcontractors/assignments/${id}`).then((r) => r.data),

//   // Actions
//   completeAssignment: (id, actualHours) =>
//     api
//       .post(`/api/subcontractors/assignments/${id}/complete`, { actualHours })
//       .then((r) => r.data),

//   invoiceAssignment: (id, data) =>
//     api
//       .post(`/api/subcontractors/assignments/${id}/invoice`, data)
//       .then((r) => r.data),

//   payAssignment: (id, paymentMethod) =>
//     api
//       .post(`/api/subcontractors/assignments/${id}/pay`, { paymentMethod })
//       .then((r) => r.data),
// };

// // ------------------------------------------------------------
// // SIGNATURE DE DEVIS
// // ------------------------------------------------------------
// export const signatureApi = {
//   sign: (quoteId, data) =>
//     api.post(`/api/quotes/${quoteId}/sign`, data).then((r) => r.data),

//   // Certificat de signature
//   certificate: (quoteId) =>
//     api.get(`/api/signature/quotes/${quoteId}/certificate`).then((r) => r.data),

//   // Vérifier l'intégrité
//   verify: (quoteId) =>
//     api.get(`/api/signature/quotes/${quoteId}/verify`).then((r) => r.data),
// };

// // ------------------------------------------------------------
// // VARIANTES (multi-options)
// // ------------------------------------------------------------
// export const variantsApi = {
//   list: (quoteId) =>
//     api.get(`/api/quotes/${quoteId}/variants`).then((r) => r.data),
//   save: (quoteId, variants) =>
//     api.post(`/api/quotes/${quoteId}/variants`, { variants }).then((r) => r.data),
//   select: (quoteId, variantIndex) =>
//     api.post(`/api/quotes/${quoteId}/select-variant`, { variantIndex }).then((r) => r.data),
// };

// // ------------------------------------------------------------
// // PHOTOS CHANTIER
// // ------------------------------------------------------------
// export const chantierPhotosApi = {
//   list: (chantierId) =>
//     api.get(`/api/chantiers/${chantierId}/photos`).then((r) => r.data),

//   upload: async (chantierId, file, caption) => {
//     const formData = new FormData();
//     if (Platform.OS === 'web') {
//       const actualFile = file.file || file;
//       formData.append('photo', actualFile, actualFile.name || 'photo.jpg');
//     } else {
//       formData.append('photo', {
//         uri: file.uri,
//         name: file.name || 'photo.jpg',
//         type: file.mimeType || 'image/jpeg',
//       });
//     }
//     if (caption) formData.append('caption', caption);

//     const res = await api.post(`/api/chantiers/${chantierId}/photos`, formData, {
//       headers: { 'Content-Type': 'multipart/form-data' },
//       timeout: 120000,
//     });
//     return res.data;
//   },

//   remove: (chantierId, photoId) =>
//     api.delete(`/api/chantiers/${chantierId}/photos/${photoId}`).then((r) => r.data),
// };

// // ------------------------------------------------------------
// // CHANTIER : actions avancées
// // ------------------------------------------------------------
// export const chantierActionsApi = {
//   detachQuote: (chantierId, quoteId) =>
//     api.post(`/api/chantiers/${chantierId}/detach-quote/${quoteId}`).then((r) => r.data),

//   attachQuote: (chantierId, quoteId) =>
//     api.post(`/api/chantiers/${chantierId}/attach-quote/${quoteId}`).then((r) => r.data),

//   facturerTout: (chantierId) =>
//     api.post(`/api/chantiers/${chantierId}/facturer-tout`).then((r) => r.data),

//   updateNotes: (chantierId, notes) =>
//     api.post(`/api/chantiers/${chantierId}/notes`, { notes }).then((r) => r.data),

//   allQuotes: (chantierId) =>
//     api.get(`/api/chantiers/${chantierId}/all-quotes`).then((r) => r.data),
// };

// // ------------------------------------------------------------
// // FACTURE : création manuelle + plan de paiement
// // ------------------------------------------------------------
// export const invoiceAdvancedApi = {
//   createManual: (data) =>
//     api.post('/api/invoices', data).then((r) => r.data),

//   // Plan de paiement
//   scheduleList: (invoiceId) =>
//     api.get(`/api/payment-schedules/invoice/${invoiceId}`).then((r) => r.data),

//   scheduleGenerate: (invoiceId, data) =>
//     api.post(`/api/payment-schedules/invoice/${invoiceId}/generate`, data).then((r) => r.data),

//   scheduleCreateManual: (invoiceId, entries) =>
//     api.post(`/api/payment-schedules/invoice/${invoiceId}`, { entries }).then((r) => r.data),

//   scheduleRemove: (invoiceId) =>
//     api.delete(`/api/payment-schedules/invoice/${invoiceId}`).then((r) => r.data),

//   scheduleEntryPay: (entryId, data) =>
//     api.post(`/api/payment-schedules/entries/${entryId}/pay`, data).then((r) => r.data),
// };

// export default api;
// export { API_URL };

// lib/api.js
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

export const storage = {
  getItem: async (key) => {
    if (Platform.OS === 'web') return localStorage.getItem(key);
    return await SecureStore.getItemAsync(key);
  },
  setItem: async (key, value) => {
    if (Platform.OS === 'web') return localStorage.setItem(key, value);
    return await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key) => {
    if (Platform.OS === 'web') return localStorage.removeItem(key);
    return await SecureStore.deleteItemAsync(key);
  },
};

api.interceptors.request.use(async (config) => {
  const token = await storage.getItem('devis_token');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await storage.removeItem('devis_token');
      await storage.removeItem('devis_user');
    }
    return Promise.reject(error);
  }
);

// ------------------------------------------------------------
// DEVIS
// ------------------------------------------------------------
export const quotesApi = {
  list: () => api.get('/api/history').then((r) => r.data),
  get: (id) => api.get(`/api/quotes/${id}`).then((r) => r.data),
  setStatus: (id, status) =>
    api.put(`/api/quotes/${id}/status`, { status }).then((r) => r.data),
  remove: (id) => api.delete(`/api/quotes/${id}`).then((r) => r.data),
  duplicate: (id) => api.post(`/api/quotes/${id}/duplicate`).then((r) => r.data),
  update: (id, data) => api.put(`/api/quotes/${id}`, data).then((r) => r.data),
  sendToClient: (id, email) =>
    api.post(`/api/quotes/${id}/send-to-client`, { email }).then((r) => r.data),
  sign: (id, data) => api.post(`/api/quotes/${id}/sign`, data).then((r) => r.data),

  generateFromFile: async ({ file, clientId, currency = 'EUR' }) => {
    const formData = new FormData();
    if (Platform.OS === 'web') {
      const actualFile = file.file || file;
      formData.append('file', actualFile, actualFile.name || 'document');
    } else {
      formData.append('file', {
        uri: file.uri,
        name: file.name || 'document.pdf',
        type: file.mimeType || 'application/octet-stream',
      });
    }
    if (clientId) formData.append('clientId', String(clientId));
    formData.append('currency', currency);
    const res = await api.post('/api/generate-quote', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
    return res.data;
  },
};

// ------------------------------------------------------------
// DASHBOARD
// ------------------------------------------------------------
export const dashboardApi = {
  summary: () => api.get('/api/dashboard').then((r) => r.data),
  charts: () => api.get('/api/dashboard/charts').then((r) => r.data),
};

// ------------------------------------------------------------
// CLIENTS
// ------------------------------------------------------------
export const clientsApi = {
  list: () => api.get('/api/clients').then((r) => r.data),
  get: (id) => api.get(`/api/clients/${id}`).then((r) => r.data),
  create: (data) => api.post('/api/clients', data).then((r) => r.data),
  update: (id, data) => api.put(`/api/clients/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/api/clients/${id}`).then((r) => r.data),
};

// ------------------------------------------------------------
// PRODUITS
// ------------------------------------------------------------
export const productsApi = {
  list: () => api.get('/api/products').then((r) => r.data),
  get: (id) => api.get(`/api/products/${id}`).then((r) => r.data),
  create: (data) => api.post('/api/products', data).then((r) => r.data),
  update: (id, data) => api.put(`/api/products/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/api/products/${id}`).then((r) => r.data),
};

// ------------------------------------------------------------
// SERVICES
// ------------------------------------------------------------
export const servicesApi = {
  list: () => api.get('/api/services').then((r) => r.data),
  get: (id) => api.get(`/api/services/${id}`).then((r) => r.data),
  create: (data) => api.post('/api/services', data).then((r) => r.data),
  update: (id, data) => api.put(`/api/services/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/api/services/${id}`).then((r) => r.data),
};

// ------------------------------------------------------------
// STOCK
// ------------------------------------------------------------
export const stockApi = {
  alerts: () => api.get('/api/stock/alerts').then((r) => r.data),
  movements: (limit = 100) =>
    api.get(`/api/stock/movements?limit=${limit}`).then((r) => r.data),
  createMovement: (data) => api.post('/api/stock/movements', data).then((r) => r.data),
  productsWithStock: async () => {
    const products = await api.get('/api/products').then((r) => r.data);
    return Array.isArray(products) ? products.filter((p) => p.trackStock === true) : [];
  },
};

// ------------------------------------------------------------
// FOURNISSEURS
// ------------------------------------------------------------
export const suppliersApi = {
  list: () => api.get('/api/suppliers').then((r) => r.data),
  get: (id) => api.get(`/api/suppliers/${id}`).then((r) => r.data),
  create: (data) => api.post('/api/suppliers', data).then((r) => r.data),
  update: (id, data) => api.put(`/api/suppliers/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/api/suppliers/${id}`).then((r) => r.data),
};

// ------------------------------------------------------------
// BONS DE COMMANDE
// ------------------------------------------------------------
export const purchaseOrdersApi = {
  list: (status) => {
    const suffix = status && status !== 'all' ? `?status=${status}` : '';
    return api.get(`/api/purchase-orders${suffix}`).then((r) => r.data);
  },
  get: (id) => api.get(`/api/purchase-orders/${id}`).then((r) => r.data),
  create: (data) => api.post('/api/purchase-orders', data).then((r) => r.data),
  update: (id, data) => api.put(`/api/purchase-orders/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/api/purchase-orders/${id}`).then((r) => r.data),
  validate: (id) => api.post(`/api/purchase-orders/${id}/validate`).then((r) => r.data),
  cancel: (id) => api.post(`/api/purchase-orders/${id}/cancel`).then((r) => r.data),
  receive: (id) => api.post(`/api/purchase-orders/${id}/receive`).then((r) => r.data),
  sendByEmail: (id, email) =>
    api.post(`/api/purchase-orders/${id}/send-email`, { email }).then((r) => r.data),
  scanStock: () => api.post('/api/purchase-orders/scan-stock').then((r) => r.data),
  logs: (id) => api.get(`/api/purchase-orders/${id}/logs`).then((r) => r.data),
};

// ------------------------------------------------------------
// FACTURES
// ------------------------------------------------------------
export const invoicesApi = {
  list: () => api.get('/api/invoices').then((r) => r.data),
  get: (id) => api.get(`/api/invoices/${id}`).then((r) => r.data),
  setStatus: (id, status, paymentMethod) =>
    api.put(`/api/invoices/${id}/status`, { status, paymentMethod }).then((r) => r.data),
  remove: (id) => api.delete(`/api/invoices/${id}`).then((r) => r.data),
  listPayments: (id) => api.get(`/api/invoices/${id}/payments`).then((r) => r.data),
  recordPayment: (id, data) =>
    api.post(`/api/invoices/${id}/payments`, data).then((r) => r.data),
  sendReminder: (id) => api.post(`/api/invoices/${id}/remind`).then((r) => r.data),
  duplicate: (id) => api.post(`/api/invoices/${id}/duplicate`).then((r) => r.data),
  createCreditNote: (id, data) =>
    api.post(`/api/invoices/${id}/credit-note`, data).then((r) => r.data),
};

// ------------------------------------------------------------
// CHANTIERS
// ------------------------------------------------------------
export const chantiersApi = {
  list: () => api.get('/api/chantiers').then((r) => r.data),
  get: (id) => api.get(`/api/chantiers/${id}`).then((r) => r.data),
  stats: (id) => api.get(`/api/chantiers/${id}/stats`).then((r) => r.data),
  quotes: (id) => api.get(`/api/chantiers/${id}/quotes`).then((r) => r.data),
  invoices: (id) => api.get(`/api/chantiers/${id}/invoices`).then((r) => r.data),
  events: (id) => api.get(`/api/chantiers/${id}/events`).then((r) => r.data),
  create: (data) => api.post('/api/chantiers', data).then((r) => r.data),
  update: (id, data) => api.put(`/api/chantiers/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/api/chantiers/${id}`).then((r) => r.data),
};

// ------------------------------------------------------------
// CHAT CLIENT
// ------------------------------------------------------------
export const chatApi = {
  conversations: (filter) =>
    api.get('/api/chat/conversations' + (filter ? `?filter=${filter}` : '')).then((r) => r.data),
  conversation: (id) => api.get(`/api/chat/conversations/${id}`).then((r) => r.data),
  sendMessage: (conversationId, body) =>
    api.post(`/api/chat/conversations/${conversationId}/messages`, { body }).then((r) => r.data),
  stats: () => api.get('/api/chat/stats').then((r) => r.data),
};

// ------------------------------------------------------------
// ASSISTANT IA
// ------------------------------------------------------------
export const assistantApi = {
  chat: (message, history = []) =>
    api.post('/api/assistant/chat', { message, history }).then((r) => r.data),
  confirm: (draft) => api.post('/api/assistant/confirm', { draft }).then((r) => r.data),
  suggestions: () => api.get('/api/assistant/suggestions').then((r) => r.data),
  acceptSuggestion: (id) =>
    api.post(`/api/assistant/suggestions/${id}/accept`).then((r) => r.data),
  dismissSuggestion: (id) =>
    api.post(`/api/assistant/suggestions/${id}/dismiss`).then((r) => r.data),
};

// ------------------------------------------------------------
// PARAMÈTRES + COMPTE + SÉCURITÉ
// ------------------------------------------------------------
export const settingsApi = {
  get: () => api.get('/api/settings').then((r) => r.data),
  update: (data) => api.post('/api/settings', data).then((r) => r.data),
};

export const accountApi = {
  changePassword: (currentPassword, newPassword) =>
    api.post('/api/auth/change-password', { currentPassword, newPassword }).then((r) => r.data),
  deleteAccount: (password) =>
    api.delete('/api/account', { data: { password, confirm: 'DELETE_MY_ACCOUNT' } }).then((r) => r.data),
  exportData: () => api.get('/api/export-data').then((r) => r.data),
};

// ------------------------------------------------------------
// NOTIFICATIONS PUSH
// ------------------------------------------------------------
export const pushApi = {
  vapidKey: () => api.get('/api/push/vapid-key').then((r) => r.data),
  subscribe: (subscription) => api.post('/api/push/subscribe', subscription).then((r) => r.data),
  subscriptions: () => api.get('/api/push/subscriptions').then((r) => r.data),
  test: () => api.post('/api/push/test').then((r) => r.data),
};

// ------------------------------------------------------------
// MODÈLES DE DEVIS
// ------------------------------------------------------------
export const templatesApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.category) qs.set('category', params.category);
    if (params.search) qs.set('search', params.search);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return api.get(`/api/quote-templates${suffix}`).then((r) => r.data);
  },
  categories: () => api.get('/api/quote-templates/categories').then((r) => r.data),
  get: (id) => api.get(`/api/quote-templates/${id}`).then((r) => r.data),
  create: (data) => api.post('/api/quote-templates', data).then((r) => r.data),
  update: (id, data) => api.put(`/api/quote-templates/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/api/quote-templates/${id}`).then((r) => r.data),
  duplicate: (id) => api.post(`/api/quote-templates/${id}/duplicate`).then((r) => r.data),
  use: (id) => api.post(`/api/quote-templates/${id}/use`).then((r) => r.data),
  fromQuote: (quoteId, data) =>
    api.post(`/api/quote-templates/from-quote/${quoteId}`, data).then((r) => r.data),
};

// ------------------------------------------------------------
// DEVIS RÉCURRENTS
// ------------------------------------------------------------
export const recurringApi = {
  list: (status) => {
    const suffix = status && status !== 'all' ? `?status=${status}` : '';
    return api.get(`/api/recurring${suffix}`).then((r) => r.data);
  },
  meta: () => api.get('/api/recurring/meta').then((r) => r.data),
  get: (id) => api.get(`/api/recurring/${id}`).then((r) => r.data),
  create: (data) => api.post('/api/recurring', data).then((r) => r.data),
  update: (id, data) => api.put(`/api/recurring/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/api/recurring/${id}`).then((r) => r.data),
  pause: (id) => api.post(`/api/recurring/${id}/pause`).then((r) => r.data),
  resume: (id) => api.post(`/api/recurring/${id}/resume`).then((r) => r.data),
  process: () => api.post('/api/recurring/process').then((r) => r.data),
};

// ------------------------------------------------------------
// ANALYTICS
// ------------------------------------------------------------
export const statsApi = {
  kpi: () => api.get('/api/stats/kpi').then((r) => r.data),
  treasury: () => api.get('/api/stats/treasury').then((r) => r.data),
  profitabilityByMetier: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.from) qs.set('from', params.from);
    if (params.to) qs.set('to', params.to);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return api.get(`/api/stats/profitability/by-metier${suffix}`).then((r) => r.data);
  },
  profitabilityByClient: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.from) qs.set('from', params.from);
    if (params.to) qs.set('to', params.to);
    if (params.limit) qs.set('limit', params.limit);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return api.get(`/api/stats/profitability/by-client${suffix}`).then((r) => r.data);
  },
  conversion: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.from) qs.set('from', params.from);
    if (params.to) qs.set('to', params.to);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return api.get(`/api/stats/conversion${suffix}`).then((r) => r.data);
  },
  topProducts: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.from) qs.set('from', params.from);
    if (params.to) qs.set('to', params.to);
    if (params.limit) qs.set('limit', params.limit);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return api.get(`/api/stats/top-products${suffix}`).then((r) => r.data);
  },
  temporal: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.from) qs.set('from', params.from);
    if (params.to) qs.set('to', params.to);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return api.get(`/api/stats/temporal${suffix}`).then((r) => r.data);
  },
};

// ------------------------------------------------------------
// RAPPORTS
// ------------------------------------------------------------
export const reportsApi = {
  downloadPdf: (from, to) =>
    api.get(`/api/reports/pdf?from=${from}&to=${to}`, {
      responseType: 'arraybuffer',
      timeout: 120000,
    }).then((r) => r.data),
};

// ------------------------------------------------------------
// VISION IA
// ------------------------------------------------------------
export const visionApi = {
  analyze: async ({ file, prompt }) => {
    const formData = new FormData();
    if (Platform.OS === 'web') {
      const actualFile = file.file || file;
      formData.append('image', actualFile, actualFile.name || 'image.jpg');
    } else {
      formData.append('image', {
        uri: file.uri, name: file.name || 'image.jpg',
        type: file.mimeType || 'image/jpeg',
      });
    }
    if (prompt) formData.append('prompt', prompt);
    const res = await api.post('/api/vision/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
    return res.data;
  },
  history: (limit = 50) => api.get(`/api/vision/history?limit=${limit}`).then((r) => r.data),
  get: (id) => api.get(`/api/vision/${id}`).then((r) => r.data),
  remove: (id) => api.delete(`/api/vision/${id}`).then((r) => r.data),
  convertToQuote: (id, data) =>
    api.post(`/api/vision/${id}/convert-to-quote`, data).then((r) => r.data),
};

// ------------------------------------------------------------
// IMPORT EMAIL
// ------------------------------------------------------------
export const emailImportApi = {
  analyze: (data) => api.post('/api/email-import/analyze', data).then((r) => r.data),
  list: () => api.get('/api/email-import').then((r) => r.data),
  get: (id) => api.get(`/api/email-import/${id}`).then((r) => r.data),
  remove: (id) => api.delete(`/api/email-import/${id}`).then((r) => r.data),
  convert: (id, data = {}) =>
    api.post(`/api/email-import/${id}/convert`, data).then((r) => r.data),
};

// ------------------------------------------------------------
// RENDEZ-VOUS
// ------------------------------------------------------------
export const appointmentsApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.status) qs.set('status', params.status);
    if (params.upcoming) qs.set('upcoming', 'true');
    if (params.from) qs.set('from', params.from);
    if (params.to) qs.set('to', params.to);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return api.get(`/api/appointments${suffix}`).then((r) => r.data);
  },
  get: (id) => api.get(`/api/appointments/${id}`).then((r) => r.data),
  create: (data) => api.post('/api/appointments', data).then((r) => r.data),
  update: (id, data) => api.put(`/api/appointments/${id}`, data).then((r) => r.data),
  setStatus: (id, status, reason) =>
    api.put(`/api/appointments/${id}/status`, { status, reason }).then((r) => r.data),
  remove: (id) => api.delete(`/api/appointments/${id}`).then((r) => r.data),
  config: () => api.get('/api/appointments/config').then((r) => r.data),
  updateConfig: (data) => api.post('/api/appointments/config', data).then((r) => r.data),
  availability: () => api.get('/api/appointments/availability').then((r) => r.data),
  addAvailability: (data) =>
    api.post('/api/appointments/availability', data).then((r) => r.data),
  removeAvailability: (id) =>
    api.delete(`/api/appointments/availability/${id}`).then((r) => r.data),
};

// ------------------------------------------------------------
// SMS
// ------------------------------------------------------------
export const smsApi = {
  config: () => api.get('/api/sms/config').then((r) => r.data),
  updateConfig: (data) => api.post('/api/sms/config', data).then((r) => r.data),
  test: (to) => api.post('/api/sms/test', { to }).then((r) => r.data),
  stats: () => api.get('/api/sms/stats').then((r) => r.data),
  logs: (limit = 100) => api.get(`/api/sms/logs?limit=${limit}`).then((r) => r.data),
};

// ------------------------------------------------------------
// ASSISTANT PROACTIF
// ------------------------------------------------------------
export const proactiveApi = {
  suggestions: () => api.get('/api/proactive/suggestions').then((r) => r.data),
  count: () => api.get('/api/proactive/count').then((r) => r.data),
  run: () => api.post('/api/proactive/run').then((r) => r.data),
  dismiss: (id) => api.post(`/api/proactive/suggestions/${id}/dismiss`).then((r) => r.data),
  actioned: (id) => api.post(`/api/proactive/suggestions/${id}/actioned`).then((r) => r.data),
  settings: () => api.get('/api/proactive/settings').then((r) => r.data),
  updateSettings: (data) => api.post('/api/proactive/settings', data).then((r) => r.data),
};

// ------------------------------------------------------------
// ÉQUIPE
// ------------------------------------------------------------
export const teamApi = {
  members: () => api.get('/api/team/members').then((r) => r.data),
  invitations: () => api.get('/api/team/invitations').then((r) => r.data),
  invite: (email, role) => api.post('/api/team/invite', { email, role }).then((r) => r.data),
  changeRole: (id, role) => api.put(`/api/team/members/${id}/role`, { role }).then((r) => r.data),
  remove: (id) => api.delete(`/api/team/members/${id}`).then((r) => r.data),
  cancelInvitation: (id) => api.delete(`/api/team/invitations/${id}`).then((r) => r.data),
};

// ------------------------------------------------------------
// PORTAIL CLIENT
// ------------------------------------------------------------
export const clientPortalApi = {
  accounts: () => api.get('/api/client-portal/accounts').then((r) => r.data),
  invite: (clientId, email) =>
    api.post(`/api/client-portal/invite/${clientId}`, { email: email || null }).then((r) => r.data),
  revoke: (clientId) =>
    api.post(`/api/client-portal/accounts/${clientId}/revoke`).then((r) => r.data),
  reactivate: (clientId) =>
    api.post(`/api/client-portal/accounts/${clientId}/reactivate`).then((r) => r.data),
};

// ------------------------------------------------------------
// PAIEMENTS EN LIGNE
// ------------------------------------------------------------
export const onlinePaymentsApi = {
  config: () => api.get('/api/online-payments/config').then((r) => r.data),
  updateConfig: (data) => api.post('/api/online-payments/config', data).then((r) => r.data),
  test: () => api.post('/api/online-payments/test').then((r) => r.data),
  stats: () => api.get('/api/online-payments/stats').then((r) => r.data),
  list: (limit = 100) => api.get(`/api/online-payments/list?limit=${limit}`).then((r) => r.data),
  createCheckout: (invoiceId) =>
    api.post(`/api/online-payments/invoices/${invoiceId}/checkout`).then((r) => r.data),
};

// ------------------------------------------------------------
// BANQUE
// ------------------------------------------------------------
export const bankApi = {
  stats: () => api.get('/api/bank/stats').then((r) => r.data),
  transactions: (status) => {
    const suffix = status && status !== 'all' ? `?status=${status}` : '';
    return api.get(`/api/bank/transactions${suffix}`).then((r) => r.data);
  },
  imports: () => api.get('/api/bank/imports').then((r) => r.data),
  importFile: async (file) => {
    const formData = new FormData();
    if (Platform.OS === 'web') {
      const actualFile = file.file || file;
      formData.append('file', actualFile, actualFile.name || 'statement.csv');
    } else {
      formData.append('file', {
        uri: file.uri, name: file.name || 'statement.csv',
        type: file.mimeType || 'application/octet-stream',
      });
    }
    const res = await api.post('/api/bank/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
    return res.data;
  },
  matches: (txId) => api.get(`/api/bank/transactions/${txId}/matches`).then((r) => r.data),
  validate: (txId, invoiceId) =>
    api.post(`/api/bank/transactions/${txId}/validate`, { invoiceId }).then((r) => r.data),
  ignore: (txId) => api.post(`/api/bank/transactions/${txId}/ignore`).then((r) => r.data),
  remove: (txId) => api.delete(`/api/bank/transactions/${txId}`).then((r) => r.data),
  rematch: () => api.post('/api/bank/rematch').then((r) => r.data),
};

// ------------------------------------------------------------
// CLÉS API
// ------------------------------------------------------------
export const apiKeysApi = {
  list: () => api.get('/api/api-keys').then((r) => r.data),
  create: (data) => api.post('/api/api-keys', data).then((r) => r.data),
  revoke: (id) => api.post(`/api/api-keys/${id}/revoke`).then((r) => r.data),
  remove: (id) => api.delete(`/api/api-keys/${id}`).then((r) => r.data),
  stats: () => api.get('/api/api-keys/stats').then((r) => r.data),
  logs: (limit = 100) => api.get(`/api/api-keys/logs?limit=${limit}`).then((r) => r.data),
};

// ------------------------------------------------------------
// WEBHOOKS
// ------------------------------------------------------------
export const webhooksApi = {
  list: () => api.get('/api/webhooks').then((r) => r.data),
  events: () => api.get('/api/webhooks/events').then((r) => r.data),
  get: (id) => api.get(`/api/webhooks/${id}`).then((r) => r.data),
  create: (data) => api.post('/api/webhooks', data).then((r) => r.data),
  update: (id, data) => api.put(`/api/webhooks/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/api/webhooks/${id}`).then((r) => r.data),
  test: (id) => api.post(`/api/webhooks/${id}/test`).then((r) => r.data),
  deliveries: (id) => api.get(`/api/webhooks/${id}/deliveries`).then((r) => r.data),
};

// ------------------------------------------------------------
// OAUTH
// ------------------------------------------------------------
export const oauthApi = {
  clients: () => api.get('/api/oauth/clients').then((r) => r.data),
  scopes: () => api.get('/api/oauth/scopes').then((r) => r.data),
  createClient: (data) => api.post('/api/oauth/clients', data).then((r) => r.data),
  removeClient: (id) => api.delete(`/api/oauth/clients/${id}`).then((r) => r.data),
  tokens: () => api.get('/api/oauth/tokens').then((r) => r.data),
  revokeToken: (id) => api.post(`/api/oauth/tokens/${id}/revoke`).then((r) => r.data),
};

// ------------------------------------------------------------
// ABONNEMENT
// ------------------------------------------------------------
export const subscriptionApi = {
  get: () => api.get('/api/stripe/subscription').then((r) => r.data),
  checkout: (plan) =>
    api.post('/api/stripe/create-checkout-session', { plan }).then((r) => r.data),
  portal: () => api.post('/api/stripe/create-portal-session').then((r) => r.data),
};

// ------------------------------------------------------------
// PEPPOL
// ------------------------------------------------------------
export const peppolApi = {
  test: () => api.post('/api/peppol/test-connection').then((r) => r.data),
  sendInvoice: (invoiceId) =>
    api.post(`/api/invoices/${invoiceId}/send-peppol`).then((r) => r.data),
  invoiceStatus: (invoiceId) =>
    api.get(`/api/invoices/${invoiceId}/peppol-status`).then((r) => r.data),
};

// ------------------------------------------------------------
// ONBOARDING + DEMO
// ------------------------------------------------------------
export const onboardingApi = {
  get: () => api.get('/api/onboarding').then((r) => r.data),
  step: (step) => api.post('/api/onboarding/step', { step }).then((r) => r.data),
  welcomeSeen: () => api.post('/api/onboarding/welcome-seen').then((r) => r.data),
  tourCompleted: () => api.post('/api/onboarding/tour-completed').then((r) => r.data),
  dismissChecklist: () => api.post('/api/onboarding/dismiss-checklist').then((r) => r.data),
  reset: () => api.post('/api/onboarding/reset').then((r) => r.data),
  autoDetect: () => api.post('/api/onboarding/auto-detect').then((r) => r.data),
};

export const demoApi = {
  start: () => api.post('/api/demo/start').then((r) => r.data),
  status: () => api.get('/api/demo/status').then((r) => r.data),
};

// ------------------------------------------------------------
// SOUS-TRAITANTS + MISSIONS
// ------------------------------------------------------------
export const subcontractorsApi = {
  list: () => api.get('/api/subcontractors').then((r) => r.data),
  get: (id) => api.get(`/api/subcontractors/${id}`).then((r) => r.data),
  create: (data) => api.post('/api/subcontractors', data).then((r) => r.data),
  update: (id, data) => api.put(`/api/subcontractors/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/api/subcontractors/${id}`).then((r) => r.data),

  allAssignments: () => api.get('/api/subcontractors/assignments/all').then((r) => r.data),
  assignments: (subId) => api.get(`/api/subcontractors/${subId}/assignments`).then((r) => r.data),
  createAssignment: (subId, data) =>
    api.post(`/api/subcontractors/${subId}/assignments`, data).then((r) => r.data),
  getAssignment: (id) => api.get(`/api/subcontractors/assignments/${id}`).then((r) => r.data),
  updateAssignment: (id, data) =>
    api.put(`/api/subcontractors/assignments/${id}`, data).then((r) => r.data),
  removeAssignment: (id) =>
    api.delete(`/api/subcontractors/assignments/${id}`).then((r) => r.data),
  completeAssignment: (id, actualHours) =>
    api.post(`/api/subcontractors/assignments/${id}/complete`, { actualHours }).then((r) => r.data),
  invoiceAssignment: (id, data) =>
    api.post(`/api/subcontractors/assignments/${id}/invoice`, data).then((r) => r.data),
  payAssignment: (id, paymentMethod) =>
    api.post(`/api/subcontractors/assignments/${id}/pay`, { paymentMethod }).then((r) => r.data),
};

// ------------------------------------------------------------
// SIGNATURE DEVIS
// ------------------------------------------------------------
export const signatureApi = {
  sign: (quoteId, data) =>
    api.post(`/api/quotes/${quoteId}/sign`, data).then((r) => r.data),
  certificate: (quoteId) =>
    api.get(`/api/signature/quotes/${quoteId}/certificate`).then((r) => r.data),
  verify: (quoteId) =>
    api.get(`/api/signature/quotes/${quoteId}/verify`).then((r) => r.data),
};

// ------------------------------------------------------------
// VARIANTES
// ------------------------------------------------------------
export const variantsApi = {
  list: (quoteId) => api.get(`/api/quotes/${quoteId}/variants`).then((r) => r.data),
  save: (quoteId, variants) =>
    api.post(`/api/quotes/${quoteId}/variants`, { variants }).then((r) => r.data),
  select: (quoteId, variantIndex) =>
    api.post(`/api/quotes/${quoteId}/select-variant`, { variantIndex }).then((r) => r.data),
};

// ------------------------------------------------------------
// PHOTOS CHANTIER
// ------------------------------------------------------------
export const chantierPhotosApi = {
  list: (chantierId) =>
    api.get(`/api/chantiers/${chantierId}/photos`).then((r) => r.data),
  upload: async (chantierId, file, caption) => {
    const formData = new FormData();
    if (Platform.OS === 'web') {
      const actualFile = file.file || file;
      formData.append('photo', actualFile, actualFile.name || 'photo.jpg');
    } else {
      formData.append('photo', {
        uri: file.uri, name: file.name || 'photo.jpg',
        type: file.mimeType || 'image/jpeg',
      });
    }
    if (caption) formData.append('caption', caption);
    const res = await api.post(`/api/chantiers/${chantierId}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
    return res.data;
  },
  remove: (chantierId, photoId) =>
    api.delete(`/api/chantiers/${chantierId}/photos/${photoId}`).then((r) => r.data),
};

// ------------------------------------------------------------
// CHANTIER : actions avancées
// ------------------------------------------------------------
export const chantierActionsApi = {
  detachQuote: (chantierId, quoteId) =>
    api.post(`/api/chantiers/${chantierId}/detach-quote/${quoteId}`).then((r) => r.data),
  attachQuote: (chantierId, quoteId) =>
    api.post(`/api/chantiers/${chantierId}/attach-quote/${quoteId}`).then((r) => r.data),
  facturerTout: (chantierId) =>
    api.post(`/api/chantiers/${chantierId}/facturer-tout`).then((r) => r.data),
  updateNotes: (chantierId, notes) =>
    api.post(`/api/chantiers/${chantierId}/notes`, { notes }).then((r) => r.data),
  allQuotes: (chantierId) =>
    api.get(`/api/chantiers/${chantierId}/all-quotes`).then((r) => r.data),
};

// ------------------------------------------------------------
// FACTURE : création manuelle + plan de paiement
// ------------------------------------------------------------
export const invoiceAdvancedApi = {
  createManual: (data) => api.post('/api/invoices', data).then((r) => r.data),
  scheduleList: (invoiceId) =>
    api.get(`/api/payment-schedules/invoice/${invoiceId}`).then((r) => r.data),
  scheduleGenerate: (invoiceId, data) =>
    api.post(`/api/payment-schedules/invoice/${invoiceId}/generate`, data).then((r) => r.data),
  scheduleCreateManual: (invoiceId, entries) =>
    api.post(`/api/payment-schedules/invoice/${invoiceId}`, { entries }).then((r) => r.data),
  scheduleRemove: (invoiceId) =>
    api.delete(`/api/payment-schedules/invoice/${invoiceId}`).then((r) => r.data),
  scheduleEntryPay: (entryId, data) =>
    api.post(`/api/payment-schedules/entries/${entryId}/pay`, data).then((r) => r.data),
};

// ------------------------------------------------------------
// EXCEL — Import / Export
// ------------------------------------------------------------
export const excelApi = {
  // Exports (retournent des ArrayBuffer)
  exportQuotes: () =>
    api.get('/api/excel/quotes', { responseType: 'arraybuffer' }).then((r) => r.data),
  exportInvoices: () =>
    api.get('/api/excel/invoices', { responseType: 'arraybuffer' }).then((r) => r.data),
  exportProducts: () =>
    api.get('/api/excel/products', { responseType: 'arraybuffer' }).then((r) => r.data),
  exportClients: () =>
    api.get('/api/excel/clients', { responseType: 'arraybuffer' }).then((r) => r.data),
  exportChantiers: () =>
    api.get('/api/excel/chantiers', { responseType: 'arraybuffer' }).then((r) => r.data),
  exportAll: () =>
    api.get('/api/excel/all', { responseType: 'arraybuffer' }).then((r) => r.data),

  // Imports (multipart)
  importProducts: async (file) => {
    const formData = new FormData();
    if (Platform.OS === 'web') {
      const actualFile = file.file || file;
      formData.append('file', actualFile, actualFile.name || 'products.csv');
    } else {
      formData.append('file', {
        uri: file.uri, name: file.name || 'products.csv',
        type: file.mimeType || 'application/octet-stream',
      });
    }
    const res = await api.post('/api/products/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
    return res.data;
  },

  importServices: async (file) => {
    const formData = new FormData();
    if (Platform.OS === 'web') {
      const actualFile = file.file || file;
      formData.append('file', actualFile, actualFile.name || 'services.csv');
    } else {
      formData.append('file', {
        uri: file.uri, name: file.name || 'services.csv',
        type: file.mimeType || 'application/octet-stream',
      });
    }
    const res = await api.post('/api/services/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
    return res.data;
  },

  importClients: async (file) => {
    const formData = new FormData();
    if (Platform.OS === 'web') {
      const actualFile = file.file || file;
      formData.append('file', actualFile, actualFile.name || 'clients.csv');
    } else {
      formData.append('file', {
        uri: file.uri, name: file.name || 'clients.csv',
        type: file.mimeType || 'application/octet-stream',
      });
    }
    const res = await api.post('/api/clients/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
    return res.data;
  },
};

// ------------------------------------------------------------
// DEVISES (multi-devises)
// ------------------------------------------------------------
export const currencyApi = {
  list: () => api.get('/api/currency/list').then((r) => r.data),
  config: () => api.get('/api/currency/config').then((r) => r.data),
  updateConfig: (data) => api.post('/api/currency/config', data).then((r) => r.data),
  rates: () => api.get('/api/currency/rates').then((r) => r.data),
};

// ------------------------------------------------------------
// PHOTOS DEVIS
// ------------------------------------------------------------
export const quotePhotosApi = {
  list: (quoteId) =>
    api.get(`/api/quotes/${quoteId}/photos`).then((r) => r.data),
  upload: async (quoteId, file, caption) => {
    const formData = new FormData();
    if (Platform.OS === 'web') {
      const actualFile = file.file || file;
      formData.append('photo', actualFile, actualFile.name || 'photo.jpg');
    } else {
      formData.append('photo', {
        uri: file.uri, name: file.name || 'photo.jpg',
        type: file.mimeType || 'image/jpeg',
      });
    }
    if (caption) formData.append('caption', caption);
    const res = await api.post(`/api/quotes/${quoteId}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
    return res.data;
  },
  remove: (quoteId, photoId) =>
    api.delete(`/api/quotes/${quoteId}/photos/${photoId}`).then((r) => r.data),
};

// ------------------------------------------------------------
// HISTORIQUE SERVICE
// ------------------------------------------------------------
export const serviceHistoryApi = {
  // Tous les devis contenant ce service
  usage: (serviceId) =>
    api.get(`/api/services/${serviceId}/usage`).then((r) => r.data),
};

// ------------------------------------------------------------
// RÉCEPTION BC (partielle)
// ------------------------------------------------------------
export const poReceiveApi = {
  // Récupérer le détail des items pour réception
  getReceiveData: (poId) =>
    api.get(`/api/purchase-orders/${poId}/receive-data`).then((r) => r.data),

  // Réceptionner partiellement (quantités par item)
  receivePartial: (poId, items) =>
    api.post(`/api/purchase-orders/${poId}/receive-partial`, { items }).then((r) => r.data),
};

// ------------------------------------------------------------
// CONVERSION DE DEVIS (devises)
// ------------------------------------------------------------
export const quoteConvertApi = {
  convert: (quoteId, targetCurrency) =>
    api
      .post(`/api/quotes/${quoteId}/convert-currency`, { targetCurrency })
      .then((r) => r.data),

  preview: (quoteId, targetCurrency) =>
    api
      .get(`/api/quotes/${quoteId}/convert-currency/preview?targetCurrency=${targetCurrency}`)
      .then((r) => r.data),
};

// ------------------------------------------------------------
// ASSISTANT PROACTIF — actions détaillées
// ------------------------------------------------------------
export const proactiveActionsApi = {
  // Détails d'une suggestion (avec liste des entités concernées)
  details: (suggestionId) =>
    api.get(`/api/proactive/suggestions/${suggestionId}/details`).then((r) => r.data),

  // Envoyer les relances pour une suggestion "factures en retard"
  sendReminders: (suggestionId) =>
    api.post(`/api/proactive/suggestions/${suggestionId}/send-reminders`).then((r) => r.data),

  // Relancer un client pour un devis dormant
  followUpQuote: (suggestionId) =>
    api.post(`/api/proactive/suggestions/${suggestionId}/follow-up`).then((r) => r.data),

  // Générer les BC pour une suggestion "stock bas"
  generatePurchaseOrders: (suggestionId) =>
    api.post(`/api/proactive/suggestions/${suggestionId}/generate-purchase-orders`).then((r) => r.data),
};

export default api;
export { API_URL };