import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

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
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        webSecurity: true,
        preload: path.join(__dirname, 'preload.js') // Yolu düzelttik
      },
      titleBarStyle: isMac ? 'hidden' : 'default',
      autoHideMenuBar: true,
      backgroundColor: '#020817',
    });

    console.log('Current NODE_ENV:', process.env.NODE_ENV);
    console.log('isDev:', isDev);

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

// App lifecycle
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
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
