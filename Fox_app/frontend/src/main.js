const { app, BrowserWindow, dialog } = require('electron');
const path = require('node:path');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      webSecurity: false,
    },
    frame: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#1e3a5f',
      symbolColor: '#ffffff',
      height: 30
    },
  });

  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["default-src * 'unsafe-inline' 'unsafe-eval'; connect-src * data:"]
      }
    });
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  mainWindow.webContents.openDevTools();
};

app.whenReady().then(() => {
  createWindow();

  autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'CloudCante',  // your GitHub username/org
    repo: 'Fox_app'       // your repo name
  });

  // configure logging early
  autoUpdater.logger = log;
  autoUpdater.logger.transports.file.level = 'info';

  // event listeners
  autoUpdater.on('checking-for-update', () => log.info('Checking for update...'));
  autoUpdater.on('update-not-available', () => log.info('No updates available.'));
  autoUpdater.on('error', (err) => log.error('Update error:', err));

  autoUpdater.on('update-available', () => {
    log.info('Update available.');
    const result = dialog.showMessageBoxSync({
      type: 'info',
      title: 'Update available',
      message: 'A new version of Fox App is available. Would you like to download it now?',
      buttons: ['Yes', 'Later']
    });

    if (result === 0) {
      autoUpdater.downloadUpdate();
    }
  });

  autoUpdater.on('update-downloaded', () => {
    log.info('Update downloaded.');
    const result = dialog.showMessageBoxSync({
      type: 'question',
      title: 'Update ready',
      message: 'The update has been downloaded. Restart the app to apply it now?',
      buttons: ['Restart', 'Later']
    });

    if (result === 0) {
      autoUpdater.quitAndInstall();
    }
  });

  // only run auto-updater in packaged mode
  if (app.isPackaged) {
    autoUpdater.checkForUpdatesAndNotify();
  } else {
    console.log('Running in development mode, skipping auto-update check.');
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
