import { app, BrowserWindow, nativeTheme, shell, } from 'electron';
import { readFileSync, } from 'node:fs';
import path from 'node:path';

const CHATGPT_URL = 'https://chatgpt.com';

function getBackgroundColor(): `#${string}` {
  return nativeTheme.shouldUseDarkColors ? '#212121' : '#FFFFFF';
}

function loadStyles(): string {
  const stylesDir = path.join(__dirname, 'styles',);
  const files = ['chatgpt.css',];
  return files
    .map((file,) => {
      try {
        return readFileSync(path.join(stylesDir, file,), 'utf-8',);
      } catch {
        return '';
      }
    },)
    .join('\n',);
}

function createWindow(): BrowserWindow {
  const bgColor = getBackgroundColor();
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16, },
    backgroundColor: bgColor,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js',),
      contextIsolation: true,
      nodeIntegration: false,
    },
  },);

  win.webContents.on('dom-ready', () => {
    const css = loadStyles();
    if (css) {
      win.webContents.insertCSS(css,);
    }
    win.webContents.insertCSS(`html, body { background-color: ${getBackgroundColor()} !important; }`,);
  },);

  win.once('ready-to-show', () => {
    win.show();
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

  nativeTheme.on('updated', () => {
    const bgColor = getBackgroundColor();
    for (const win of BrowserWindow.getAllWindows()) {
      win.setBackgroundColor(bgColor,);
      win.webContents.insertCSS(`html, body { background-color: ${bgColor} !important; }`,);
    }
  },);
},);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
},);
