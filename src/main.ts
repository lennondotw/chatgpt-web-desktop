import { app, BrowserWindow, nativeTheme, shell, } from 'electron';
import chokidar from 'chokidar';
import { readFileSync, } from 'node:fs';
import path from 'node:path';

const CHATGPT_URL = 'https://chatgpt.com';
const STYLE_ID = 'chatgpt-desktop-styles';

function getBackgroundColor(): `#${string}` {
  return nativeTheme.shouldUseDarkColors ? '#212121' : '#FFFFFF';
}

function loadStyles(): string {
  const stylesDir = app.isPackaged
    ? path.join(__dirname, 'styles')
    : path.join(__dirname, '../src/styles');
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

function injectCSS(win: BrowserWindow, css: string): void {
  win.webContents.executeJavaScript(`
    (function() {
      let style = document.getElementById('${STYLE_ID}');
      if (!style) {
        style = document.createElement('style');
        style.id = '${STYLE_ID}';
        document.head.appendChild(style);
      }
      style.textContent = ${JSON.stringify(css)};
    })();
  `);
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
      injectCSS(win, css);
    }
    win.webContents.insertCSS(
      `html, body { background-color: ${getBackgroundColor()} !important; }`,
    );
  },);

  win.once('ready-to-show', () => {
    win.show();
  },);

  // CSS hot reload in development mode
  if (!app.isPackaged) {
    const stylesPath = path.join(__dirname, '../src/styles');
    chokidar.watch(stylesPath, { ignoreInitial: true, }).on('change', (filePath,) => {
      const css = loadStyles();
      injectCSS(win, css);
      console.log(`[CSS HMR] Reloaded: ${path.basename(filePath)}`);
    },);
  }

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
