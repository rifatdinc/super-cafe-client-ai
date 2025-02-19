import { app, ipcMain } from 'electron';
import { WindowService } from './services/window.service';
import { ComputerService } from './services/computer.service';
import { SystemService } from './services/system.service';
import { SocketService } from './services/socket.service';

// Service instances
const windowService = WindowService.getInstance();
const computerService = ComputerService.getInstance();
const systemService = SystemService.getInstance();
const socketService = SocketService.getInstance();

// IPC Handlers
ipcMain.handle('get-machine-id', () => {
  const { machineIdSync } = require('node-machine-id');
  return machineIdSync();
});

ipcMain.handle('get-system-info', async () => {
  const si = require('systeminformation');
  return {
    os: await si.osInfo(),
    cpu: await si.cpu(),
    mem: await si.mem(),
    disk: await si.diskLayout(),
    graphics: await si.graphics()
  };
});

// System command handlers
ipcMain.handle('system-shutdown', async () => {
  return await systemService.shutdownSystem();
});

ipcMain.handle('system-restart', async () => {
  return await systemService.restartSystem();
});

ipcMain.handle('system-logout', async () => {
  return await systemService.logoutUser();
});

// Window control handlers
ipcMain.on('minimize-window', () => {
  windowService.minimizeMainWindow();
});

ipcMain.on('maximize-window', () => {
  windowService.maximizeMainWindow();
});

ipcMain.on('close-window', () => {
  windowService.closeMainWindow();
});

// App lifecycle
app.whenReady().then(async () => {
  try {
    // Create main window
    const mainWindow = await windowService.createMainWindow();
    
    // Initialize socket service with main window
    socketService.setMainWindow(mainWindow);
    socketService.initialize();

    // Register computer
    await computerService.registerComputer();
  } catch (error) {
    console.error('Error during app initialization:', error);
    app.quit();
  }
});

app.on('window-all-closed', async () => {
  await computerService.setComputerOffline();
  socketService.disconnect();
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', async (event) => {
  event.preventDefault();
  await computerService.setComputerOffline();
  socketService.disconnect();
  app.exit();
});

app.on('activate', async () => {
  if (windowService.getMainWindow() === null) {
    try {
      const mainWindow = await windowService.createMainWindow();
      socketService.setMainWindow(mainWindow);
      await computerService.registerComputer();
    } catch (error) {
      console.error('Error recreating window:', error);
      app.quit();
    }
  }
});
