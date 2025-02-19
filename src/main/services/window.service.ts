import { BrowserWindow, app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { config } from '../core/config';

export class WindowService {
  private static instance: WindowService;
  private mainWindow: BrowserWindow | null = null;
  private isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined;
  private isMac = process.platform === 'darwin';

  private constructor() {}

  static getInstance(): WindowService {
    if (!WindowService.instance) {
      WindowService.instance = new WindowService();
    }
    return WindowService.instance;
  }

  async createMainWindow(): Promise<BrowserWindow> {
    try {
      this.mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        minWidth: 1024,
        minHeight: 768,
        icon: path.join(__dirname, '../../../public/logo.png'),
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          sandbox: true,
          webSecurity: true,
          preload: path.join(__dirname, '../preload.js')
        },
        titleBarStyle: this.isMac ? 'hidden' : 'default',
        autoHideMenuBar: true,
        backgroundColor: '#020817',
        movable: true,
        center: true,
      });

      // Load application
      if (this.isDev) {
        console.log('Starting in development mode...');
        const devServerConnected = await this.tryConnectDevServer();
        if (!devServerConnected) {
          console.log('Dev server connection failed, showing error page');
          await this.showErrorPage();
        } else {
          this.mainWindow.webContents.openDevTools();
        }
      } else {
        console.log('Starting in production mode...');
        await this.loadProductionBuild();
      }

      // Window event handlers
      this.setupWindowEventHandlers();

      return this.mainWindow;
    } catch (error) {
      console.error('Failed to create window:', error);
      if (this.mainWindow) {
        this.mainWindow.destroy();
        this.mainWindow = null;
      }
      app.quit();
      throw error;
    }
  }

  private async tryConnectDevServer(retries = 3, delay = 1000): Promise<boolean> {
    for (let i = 0; i < retries; i++) {
      try {
        if (this.mainWindow) {
          const response = await fetch(config.dev.serverUrl);
          if (response.ok) {
            await this.mainWindow.loadURL(config.dev.serverUrl);
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

  private async showErrorPage(): Promise<void> {
    const errorPagePath = this.isDev
      ? path.join(__dirname, '../../error.html')
      : path.join(__dirname, '../error.html');

    console.log('Attempting to load error page from:', errorPagePath);

    if (fs.existsSync(errorPagePath)) {
      await this.mainWindow?.loadFile(errorPagePath);
    } else {
      await this.mainWindow?.loadURL(`data:text/html,
        <html>
          <body style="background: #020817; color: #fff; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
            <div style="text-align: center; padding: 20px;">
              <h1>Development Server Not Available</h1>
              <p>Please ensure the development server is running at ${config.dev.serverUrl}</p>
              <p>Run <code>npm run dev:vite</code> to start the development server.</p>
            </div>
          </body>
        </html>
      `);
    }
  }

  private async loadProductionBuild(): Promise<void> {
    const possiblePaths = [
      path.join(__dirname, '../../renderer/index.html'),
      path.join(__dirname, '../../../renderer/index.html'),
      path.join(app.getAppPath(), 'renderer/index.html')
    ];

    for (const prodPath of possiblePaths) {
      console.log('Checking production build path:', prodPath);
      if (fs.existsSync(prodPath)) {
        console.log('Found production build at:', prodPath);
        try {
          await this.mainWindow?.loadFile(prodPath);
          return;
        } catch (err) {
          console.error(`Failed to load production build from ${prodPath}:`, err);
        }
      }
    }

    throw new Error('Could not find production build. Make sure to run the build command first.');
  }

  private setupWindowEventHandlers(): void {
    if (!this.mainWindow) return;

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    if (!this.isMac) {
      this.mainWindow.on('maximize', () => {
        this.mainWindow?.webContents.send('window-state-change', 'maximized');
      });

      this.mainWindow.on('unmaximize', () => {
        this.mainWindow?.webContents.send('window-state-change', 'normal');
      });
    }
  }

  getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  closeMainWindow(): void {
    if (this.mainWindow) {
      this.mainWindow.close();
      this.mainWindow = null;
    }
  }

  minimizeMainWindow(): void {
    this.mainWindow?.minimize();
  }

  maximizeMainWindow(): void {
    if (this.mainWindow?.isMaximized()) {
      this.mainWindow.unmaximize();
    } else {
      this.mainWindow?.maximize();
    }
  }
}