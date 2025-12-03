const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

// set session dir to userData to persist sessions across installs
const userDataPath = app.getPath('userData');
process.env.WHATSAPP_SESSION_DIR = path.join(userDataPath, 'sessions');

// Start backend server in same Node process
const serverModule = require('../src/index');

let mainWindow;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'build', 'index.html'));
  }
}

app.whenReady().then(async () => {
  // start the express server and services
  try {
    await serverModule.startServer();
    console.log('Backend server started');
  } catch (e) {
    console.error('Failed to start backend', e);
  }

  await createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// allow renderer to ask for QR
ipcMain.handle('get-qr', async () => {
  return { ready: serverModule.isReady(), qr: serverModule.getLastQr() };
});
