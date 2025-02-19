import { Socket, io } from 'socket.io-client';
import { config } from '../core/config';
import { BrowserWindow } from 'electron';
import { machineIdSync } from 'node-machine-id';
import { SystemService } from './system.service';
import { ComputerService } from './computer.service';
import { SOCKET_EVENTS, IPC_CHANNELS } from '../core/constants';

export class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private mainWindow: BrowserWindow | null = null;
  private systemService: SystemService;
  private computerService: ComputerService;

  private constructor() {
    this.systemService = SystemService.getInstance();
    this.computerService = ComputerService.getInstance();
  }

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  setMainWindow(window: BrowserWindow) {
    this.mainWindow = window;
  }

  initialize() {
    if (this.socket) return;

    console.log('Initializing socket connection...');
    try {
      this.socket = io(config.socket.url, config.socket.options);
      this.setupEventHandlers();
    } catch (error) {
      console.error('Socket initialization error:', error);
      this.notifyUI('error', 'Bağlantı Hatası', 'Socket başlatılamadı');
    }
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on(SOCKET_EVENTS.CONNECT, () => {
      console.log('[SocketService] Connected to Socket.IO server');
      this.notifyUI('success', 'Bağlantı Başarılı', 'Sunucu ile bağlantı kuruldu');
      
      const machineId = machineIdSync();
      console.log('[SocketService] Registering with machine ID:', machineId);
      this.socket?.emit(SOCKET_EVENTS.REGISTER, { machineId });
    });

    this.socket.on(SOCKET_EVENTS.COMMAND, async (data) => {
      console.log('[SocketService] Received command:', data);
      try {
        if (data.type === 'shutdown') {
          console.log('[SocketService] Processing shutdown command...');
          
          // Bilgisayarı offline yap ve servisi durdur
          await this.computerService.setComputerOffline();
          
          // Sistemi kapat
          const result = await this.systemService.shutdownSystem();
          console.log('[SocketService] Shutdown result:', result);
          
          if (result.success) {
            this.socket?.emit(SOCKET_EVENTS.COMMAND_RESPONSE, {
              success: true,
              message: `Shutdown initiated successfully on ${process.platform}`,
              platform: process.platform,
              type: 'shutdown'
            });
          } else {
            throw new Error(result.error || 'Shutdown failed without specific error');
          }
        }
      } catch (error: any) {
        console.error('[SocketService] Command execution error:', error);
        this.socket?.emit(SOCKET_EVENTS.COMMAND_RESPONSE, {
          success: false,
          error: error.message,
          platform: process.platform,
          type: data.type
        });
        
        this.notifyUI('error', 'Kapatma Hatası', `Bilgisayar kapatılamadı: ${error.message}`);
      }
    });

    this.socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      console.log('[SocketService] Disconnected from server');
      this.notifyUI('error', 'Bağlantı Kesildi', 'Sunucu bağlantısı kesildi');
    });

    this.socket.on(SOCKET_EVENTS.CONNECT_ERROR, (error) => {
      console.error('[SocketService] Connection error:', error);
      this.notifyUI('error', 'Bağlantı Hatası', 'Sunucu bağlantısı kurulamadı: ' + error.message);
    });

    this.socket.on(SOCKET_EVENTS.SYSTEM_METRICS, async () => {
      try {
        const specs = await this.computerService.getCurrentSpecs();
        this.socket?.emit(SOCKET_EVENTS.SYSTEM_METRICS_RESPONSE, { 
          success: true, 
          data: specs 
        });
      } catch (error: any) {
        this.socket?.emit(SOCKET_EVENTS.SYSTEM_METRICS_RESPONSE, { 
          success: false, 
          error: error.message 
        });
      }
    });
  }

  private notifyUI(type: 'success' | 'error', title: string, message: string) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('notification', { type, title, message });
    }
  }

  disconnect() {
    if (this.socket) {
      console.log('[SocketService] Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
    }
  }
}