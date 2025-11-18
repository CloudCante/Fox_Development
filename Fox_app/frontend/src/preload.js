const { contextBridge, ipcRenderer } = require('electron');
const { version } = require('../package.json'); 

// Expose the app version
contextBridge.exposeInMainWorld('electronApp', {
  getVersion: () => version
});

// Expose backend API functions
contextBridge.exposeInMainWorld('api', {
  // Fixtures
  getFixtures: async () => {
    const response = await fetch('http://localhost:5000/fixtures'); 
    return response.json();
  },

  // Health
  getHealth: async () => {
    const response = await fetch('http://localhost:5000/health');
    return response.json();
  },

  // Usage
  getUsage: async () => {
    const response = await fetch('http://localhost:5000/usage');
    return response.json();
  },

  // Fixture Maintenance
  getFixtureMaintenance: async () => {
    const response = await fetch('http://localhost:5000/fixture-maintenance');
    return response.json();
  },

  // Users
  getUsers: async () => {
    const response = await fetch('http://localhost:5000/users');
    return response.json();
  }
});

// Optional: keep commented Electron update API if needed
// contextBridge.exposeInMainWorld('electronAPI', {
//   onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
//   onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback),
//   triggerInstall: () => ipcRenderer.send('install-update'),
//   triggerDownload: () => ipcRenderer.send('download-update')
// });
