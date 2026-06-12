const { app, BrowserWindow, Menu, powerSaveBlocker, shell, ipcMain } = require('electron');
const path = require('path');

app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-background-timer-throttling');

function createWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 900,
    fullscreen: true,
    backgroundColor: '#0f0f0f',
    autoHideMenuBar: true,
    webPreferences: {
      backgroundThrottling: false,
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.cjs'),
      sandbox: true,
    },
  });

  window.removeMenu();
  Menu.setApplicationMenu(null);

  const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
  window.loadFile(indexPath);

  window.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

let powerSaveBlockerId = null;

ipcMain.on('window:exit-fullscreen', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (window && !window.isDestroyed()) {
    window.setFullScreen(false);
  }
});

app.whenReady().then(() => {
  powerSaveBlockerId = powerSaveBlocker.start('prevent-app-suspension');
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (powerSaveBlockerId !== null && powerSaveBlocker.isStarted(powerSaveBlockerId)) {
    powerSaveBlocker.stop(powerSaveBlockerId);
    powerSaveBlockerId = null;
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});
