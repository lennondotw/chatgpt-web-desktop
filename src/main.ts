import { app, BrowserWindow, shell, } from 'electron';
import path from 'node:path';

const CHATGPT_URL = 'https://chatgpt.com';

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16, },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js',),
      contextIsolation: true,
      nodeIntegration: false,
    },
  },);

  win.loadURL(CHATGPT_URL,);

  // Open external links in system browser
  win.webContents.setWindowOpenHandler(({ url, },) => {
    if (!url.startsWith(CHATGPT_URL,)) {
      shell.openExternal(url,);
      return { action: 'deny', };
    }
    return { action: 'allow', };
  },);

  return win;
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  },);
},);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
},);
