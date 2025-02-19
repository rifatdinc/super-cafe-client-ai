import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import { machineIdSync } from 'node-machine-id';
import os from 'os';
import * as si from 'systeminformation';
import { exec } from 'child_process';
import { io, Socket } from 'socket.io-client';

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

export const supabase = createClient(supabaseUrl, supabaseKey)

let mainWindow: BrowserWindow | null = null;
let currentComputerId: string | null = null;

// Socket.IO client bağlantısı
let socket: Socket | null = null;

// Socket error handler
ipcMain.on('socket-error', (_, error) => {
  console.error('Socket error received:', error);
  mainWindow?.webContents.send('show-notification', {
    type: 'error',
    title: 'Bağlantı Hatası',
    message: error.message || 'Sunucu ile bağlantı kurulamadı'
  });
});

function initializeSocketClient() {
  if (!socket) {
    socket = io('http://localhost:8080', {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      mainWindow?.webContents.send('show-notification', {
        type: 'success',
        title: 'Bağlantı Başarılı',
        message: 'Sunucu ile bağlantı kuruldu'
      });
      // Bilgisayar kimliğini sunucuya gönder
      socket.emit('register', { machineId: machineIdSync() });
    });

    socket.on('command', async (data) => {
      console.log('Received command:', data);
      try {
        if (data.type === 'shutdown') {
          const platform = process.platform;
          let command = '';

          switch (platform) {
            case 'win32':
              command = 'shutdown /s /t 0';
              break;
            case 'darwin':
              command = 'osascript -e \'tell app "System Events" to shut down\'';
              break;
            case 'linux':
              command = 'systemctl poweroff';
              break;
            default:
              throw new Error('Unsupported platform for shutdown');
          }

          // Önce offline durumuna geç
          await setComputerOffline();

          // Kapatma komutunu çalıştır
          exec(command, (error) => {
            if (error) {
              console.error('Shutdown error:', error);
              socket?.emit('command_response', {
                success: false,
                error: error.message,
                type: 'shutdown'
              });
              return;
            }
            
            socket?.emit('command_response', {
              success: true,
              message: 'Shutdown initiated',
              type: 'shutdown'
            });

            // Uygulamayı kapat
            setTimeout(() => {
              app.quit();
            }, 1000);
          });
        }
      } catch (error: any) {
        console.error('Command execution error:', error);
        socket?.emit('command_response', {
          success: false,
          error: error.message,
          type: data.type
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      mainWindow?.webContents.send('show-notification', {
        type: 'error',
        title: 'Bağlantı Hatası',
        message: 'Sunucu ile bağlantı kurulamadı: ' + error.message
      });
    });
  }
  return socket;
}

// Set environment variables
const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined;
const isMac = process.platform === 'darwin';

// IPC Handlers
ipcMain.handle('get-machine-id', () => {
  return machineIdSync();
});

ipcMain.handle('get-system-info', async () => {
  return {
    os: await si.osInfo(),
    cpu: await si.cpu(),
    mem: await si.mem(),
    disk: await si.diskLayout(),
    graphics: await si.graphics()
  };
});

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

function getLocalIpAddress(): string {
  const interfaces = os.networkInterfaces();
  for (const netInterface of Object.values(interfaces)) {
    if (!netInterface) continue;
    
    for (const config of netInterface) {
      if (config.family === 'IPv4' && !config.internal) {
        return config.address;
      }
    }
  }
  return 'localhost';
}

function getMacAddress(): string | null {
  const interfaces = os.networkInterfaces();
  for (const netInterface of Object.values(interfaces)) {
    if (!netInterface) continue;
    
    for (const config of netInterface) {
      // Only get the MAC address of the Ethernet interface that's not internal
      if (config.family === 'IPv4' && !config.internal && config.mac) {
        return config.mac;
      }
    }
  }
  return null;
}

// Function to register computer and manage status
async function registerComputer() {
  try {
    const machineId = machineIdSync();
    const hostname = os.hostname();
    const ipAddress = getLocalIpAddress();
    const macAddress = getMacAddress();
    
    // Get system information
    const specs = {
      platform: os.platform(),
      release: os.release(),
      arch: os.arch(),
      cpus: os.cpus().map(cpu => ({
        model: cpu.model,
        speed: cpu.speed
      })),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem()
    };

    // Check if computer already exists
    const { data: existingComputer, error: fetchError } = await supabase
      .from('computers')
      .select('id, computer_number')
      .eq('machine_id', machineId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking computer existence:', fetchError);
      return;
    }

    if (!existingComputer) {
      // Get the next available computer number
      const { data: computers } = await supabase
        .from('computers')
        .select('computer_number')
        .order('computer_number', { ascending: true });

      let nextNumber = 1;
      if (computers && computers.length > 0) {
        const existingNumbers = computers
          .map(c => parseInt(c.computer_number.replace('PC', '')))
          .filter(n => !isNaN(n));
        if (existingNumbers.length > 0) {
          nextNumber = Math.max(...existingNumbers) + 1;
        }
      }

      // Register the computer if it doesn't exist
      const { data: newComputer, error: insertError } = await supabase
        .from('computers')
        .insert({
          machine_id: machineId,
          computer_number: `PC${nextNumber.toString().padStart(3, '0')}`,
          name: hostname,
          status: 'available',
          location: 'Main Area', // Default location
          ip_address: ipAddress,
          mac_address: macAddress,
          specifications: specs,
          last_maintenance: new Date().toISOString(),
          last_seen: new Date().toISOString()
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('Error registering computer:', insertError);
        return;
      }

      currentComputerId = newComputer.id;
      console.log('Computer registered successfully');
    } else {
      currentComputerId = existingComputer.id;
      // Update status and specifications
      const { error: updateError } = await supabase
        .from('computers')
        .update({
          name: hostname,
          status: 'available',
          ip_address: ipAddress,
          mac_address: macAddress,
          specifications: specs,
          last_seen: new Date().toISOString()
        })
        .eq('id', currentComputerId);

      if (updateError) {
        console.error('Error updating computer:', updateError);
        return;
      }
      console.log('Computer information updated');
    }

    // Set up status update interval
    setInterval(async () => {
      if (currentComputerId) {
        const { error: updateError } = await supabase
          .from('computers')
          .update({
            last_seen: new Date().toISOString(),
            ip_address: ipAddress, // Update IP in case it changed
            mac_address: macAddress,
            specifications: {
              ...specs,
              freeMemory: os.freemem() // Update current free memory
            }
          })
          .eq('id', currentComputerId);

        if (updateError) {
          console.error('Error updating computer status:', updateError);
        }
      }
    }, 30000); // Update every 30 seconds
  } catch (error) {
    console.error('Error managing computer status:', error);
  }
}

// Function to set computer offline
async function setComputerOffline() {
  if (currentComputerId) {
    try {
      const { error } = await supabase
        .from('computers')
        .update({
          status: 'available',
          current_session_id: null,
          last_seen: new Date().toISOString()
        })
        .eq('id', currentComputerId);

      if (error) throw error;
      console.log('Computer status reset to available');
    } catch (error) {
      console.error('Error setting computer status:', error);
    }
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
      icon: path.join(__dirname, '../../public/logo.png'),
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
      movable: true,
      center: true,
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

    // Initialize Socket.IO client
    initializeSocketClient();
    
    await registerComputer();

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

app.on('window-all-closed', async () => {
  await setComputerOffline();
  if (socket) {
    socket.disconnect();
  }
  if (!isMac) {
    app.quit();
  }
});

app.on('before-quit', async (event) => {
  event.preventDefault();
  await setComputerOffline();
  if (socket) {
    socket.disconnect();
  }
  app.exit();
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

// System shutdown handler
ipcMain.on('system-shutdown', () => {
  const platform = process.platform;
  let command = '';

  switch (platform) {
    case 'win32':
      command = 'shutdown /s /t 0';
      break;
    case 'darwin':
      command = 'sudo shutdown -h now';
      break;
    case 'linux':
      command = 'sudo shutdown -h now';
      break;
    default:
      console.error('Unsupported platform for shutdown');
      return;
  }

  exec(command, (error) => {
    if (error) {
      console.error('Shutdown error:', error);
      return;
    }
    console.log('System shutdown initiated');
  });
});
