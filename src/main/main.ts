import { app, BrowserWindow, ipcMain, shell } from 'electron';
import fastDeepEqual from 'fast-deep-equal';
import updateElectronApp from 'update-electron-app';

declare const APP_WEBPACK_ENTRY: string;
declare const APP_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

updateElectronApp();

const createWindow = (
  url: string = APP_WEBPACK_ENTRY,
  parentWindow?: BrowserWindow,
): void => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 500,
    x: parentWindow ? parentWindow.getBounds().x + 20 : undefined,
    y: parentWindow ? parentWindow.getBounds().y + 20 : undefined,
    resizable: true,
    maximizable: true,
    minimizable: true,
    frame: false,

    webPreferences: {
      allowRunningInsecureContent: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: APP_PRELOAD_WEBPACK_ENTRY,
      nativeWindowOpen: true,
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      nodeIntegrationInSubFrames: false,
      safeDialogs: true,
      sandbox: true,
      webSecurity: false, // Needed to bypass CORS requests---could replace this with a proxied fetch in the future
      webviewTag: false,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(url);

  if (process.env.NODE_ENV === 'development') {
    // Open the DevTools.
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }
  let lastWindowState: unknown;
  function updateWindowState() {
    const windowState = {
      maximized: mainWindow.isMaximized(),
      fullscreen: mainWindow.isFullScreen(),
      fullscreenable: mainWindow.isFullScreenable(),
    };
    if (!fastDeepEqual(lastWindowState, windowState)) {
      lastWindowState = windowState;
      mainWindow.webContents.send('window-state', windowState);
    }
  }
  mainWindow.on('maximize', updateWindowState);
  mainWindow.on('resize', updateWindowState);
  mainWindow.on('minimize', updateWindowState);
  mainWindow.on('enter-full-screen', updateWindowState);
  mainWindow.on('enter-html-full-screen', updateWindowState);
  mainWindow.on('leave-full-screen', updateWindowState);
  mainWindow.on('leave-html-full-screen', updateWindowState);
  mainWindow.on('restore', updateWindowState);
  mainWindow.webContents.once('did-finish-load', updateWindowState);
};

app.on('web-contents-created', (event, contents) => {
  contents
    .on('new-window', (event, url) => {
      event.preventDefault();
      if (url.startsWith('https://')) {
        shell.openExternal(url);
      } else {
        if (
          url.startsWith(APP_WEBPACK_ENTRY) ||
          decodeURIComponent(url).startsWith(APP_WEBPACK_ENTRY)
        ) {
          createWindow(url, getContentsWin(contents));
        } else {
          console.warn(
            `cannot handle ${url}: APP_WEBPACK_ENTRY=${APP_WEBPACK_ENTRY}`,
          );
        }
      }
    })
    .on('will-navigate', (event, navigationUrl) => {
      event.preventDefault();
    });
});

function getWin(event: Electron.IpcMainInvokeEvent) {
  return getContentsWin(event.sender);
}
function getContentsWin(contents: Electron.WebContents) {
  return BrowserWindow.getAllWindows().find(
    (win) => win.webContents === contents,
  );
}

ipcMain.handle('minimize', (event) => {
  getWin(event)?.minimize();
});
ipcMain.handle('restore', (event) => {
  getWin(event)?.restore();
});
ipcMain.handle('maximize', (event) => {
  getWin(event)?.maximize();
});
ipcMain.handle('unmaximize', (event) => {
  getWin(event)?.unmaximize();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => createWindow());

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
if (process.platform !== 'darwin') {
  app.on('window-all-closed', () => {
    app.quit();
  });
  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}
