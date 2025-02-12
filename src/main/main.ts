import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import SystemMonitor from './services/SystemMonitor';
import { desktopCapturer } from 'electron';
import * as os from 'os';

let mainWindow: BrowserWindow | null = null;

// Set environment variables
const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined;
const isMac = process.platform === 'darwin';

async function tryConnectDevServer(retries = 3, delay = 1000): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    try {
      if (mainWindow) {
        const response = await fetch('http://localhost:9002');
        if (response.ok) {
          await mainWindow.loadURL('http://localhost:9002');
          console.log('Successfully connected to dev server');
          return true;
        }
      } 
    } catch (err) {
      console.log(`Dev server connection attempt ${i + 1}/${retries} failed`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return false;
}

async function showErrorPage() {
  const errorPagePath = isDev 
    ? path.join(__dirname, '..', 'src', 'main', 'error.html')
    : path.join(__dirname, 'error.html');

  console.log('Attempting to load error page from:', errorPagePath);
  
  if (fs.existsSync(errorPagePath)) {
    await mainWindow?.loadFile(errorPagePath);
  } else {
    // Fallback to inline error HTML if file not found
    await mainWindow?.loadURL(`data:text/html,
      <html>
        <body style="background: #020817; color: #fff; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
          <div style="text-align: center; padding: 20px;">
            <h1>Development Server Not Available</h1>
            <p>Please ensure the development server is running at http://localhost:9002</p>
            <p>Run <code>npm run dev:vite</code> to start the development server.</p>
          </div>
        </body>
      </html>
    `);
  }
}

async function createWindow() {
  try {
    // Create the browser window.
    mainWindow = new BrowserWindow({
      width: 1280,
      height: 720,
      minWidth: 1024,
      minHeight: 768,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js')
      },
      titleBarStyle: isMac ? 'hidden' : 'default',
      autoHideMenuBar: true,
      backgroundColor: '#020817',
    });

    console.log('Current NODE_ENV:', process.env.NODE_ENV);
    console.log('isDev:', isDev);

    // Ekran paylaşımı için izin ver
    mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
      const allowedPermissions = ['media'];
      if (allowedPermissions.includes(permission)) {
        callback(true);
      } else {
        callback(false);
      }
    });

    // Load the app
    if (isDev) {
      console.log('Starting in development mode...');
      const devServerConnected = await tryConnectDevServer();
      if (!devServerConnected) {
        console.log('Dev server connection failed, showing error page');
        await showErrorPage();
      } else {
        mainWindow?.webContents.openDevTools();
      }
    } else {
      console.log('Starting in production mode...');
      await loadProductionBuild();
    }

    // Window cleanup
    mainWindow.on('closed', () => {
      mainWindow = null;
    });

    // Window controls for non-macOS
    if (!isMac) {
      mainWindow.on('maximize', () => {
        mainWindow?.webContents.send('window-state-change', 'maximized');
      });

      mainWindow.on('unmaximize', () => {
        mainWindow?.webContents.send('window-state-change', 'normal');
      });
    }

    return mainWindow;
  } catch (err) {
    console.error('Failed to create window:', err);
    if (mainWindow) {
      mainWindow.destroy();
      mainWindow = null;
    }
    app.quit();
  }
}

async function loadProductionBuild() {
  const possiblePaths = [
    path.join(__dirname, '../renderer/index.html'),
    path.join(__dirname, '../../renderer/index.html'),
    path.join(app.getAppPath(), 'renderer/index.html')
  ];

  for (const prodPath of possiblePaths) {
    console.log('Checking production build path:', prodPath);
    if (fs.existsSync(prodPath)) {
      console.log('Found production build at:', prodPath);
      try {
        await mainWindow?.loadFile(prodPath);
        return;
      } catch (err) {
        console.error(`Failed to load production build from ${prodPath}:`, err);
      }
    }
  }

  throw new Error('Could not find production build. Make sure to run the build command first.');
}

// SystemMonitor instance'ını oluştur
const systemMonitor = new SystemMonitor();

app.whenReady().then(() => {
  createWindow();
  
  // Sistem metriklerini toplamaya başla
  systemMonitor.start();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Sistem metriklerini durdur
  systemMonitor.stop();
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Window control handlers
ipcMain.on('minimize-window', () => {
  mainWindow?.minimize();
});

ipcMain.on('maximize-window', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.on('close-window', () => {
  mainWindow?.close();
});

// IP adresi almak için IPC handler
ipcMain.handle('get-ip-address', async () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      // IPv4 ve local olmayan adresi bul
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  throw new Error('No IP address found');
});

// WebRTC bağlantısı için IPC handler
ipcMain.handle('connect-to-stream', async (event, { computerId, ipAddress, port }) => {
  try {
    // WebRTC bağlantısını kur
    // TODO: WebRTC bağlantı kodunu ekle
    return {
      stream: null // WebRTC stream'i döndür
    };
  } catch (error) {
    console.error('Failed to connect to stream:', error);
    throw error;
  }
});

// Streaming işlemleri için IPC handlers
ipcMain.handle('start-streaming', async (_event, id: string) => {
  try {
    // TODO: Implement VNC or RDP connection
    console.log('Starting stream for computer:', id)
    return { success: true }
  } catch (error) {
    console.error('Error starting stream:', error)
    return { success: false, error }
  }
})

ipcMain.handle('stop-streaming', async (_event, id: string) => {
  try {
    // TODO: Implement VNC or RDP disconnection
    console.log('Stopping stream for computer:', id)
    return { success: true }
  } catch (error) {
    console.error('Error stopping stream:', error)
    return { success: false, error }
  }
})
