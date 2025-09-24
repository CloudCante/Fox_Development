// utils/persistence.js
const STORAGE_KEY = 'dashboard_config';

export const persistenceManager = {
  // Local storage methods
  saveLocal: (data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },

  loadLocal: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return null;
    }
  },

  // API methods (optional for server-side persistence)
//   saveRemote: async (userId, data) => {
//     try {
//       await fetch(`${API_BASE}/user-settings/${userId}`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(data)
//       });
//     } catch (error) {
//       console.error('Failed to save to server:', error);
//     }
//   },

//   loadRemote: async (userId) => {
//     try {
//       const response = await fetch(`${API_BASE}/user-settings/${userId}`);
//       return await response.json();
//     } catch (error) {
//       console.error('Failed to load from server:', error);
//       return null;
//     }
//   }
};