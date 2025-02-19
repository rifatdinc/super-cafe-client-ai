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

  initialize(): Socket {
    if (!this.socket) {
      this.socket = io(config.socket.url, config.socket.options);
      this.setupEventHandlers();
    }
    return this.socket;
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on(SOCKET_EVENTS.CONNECT, () => {
      console.log('Connected to Socket.IO server');
      this.notifyUI('success', 'Bağlantı Başarılı', 'Sunucu ile bağlantı kuruldu');
      this.socket?.emit(SOCKET_EVENTS.REGISTER, { machineId: machineIdSync() });
    });

    this.socket.on(SOCKET_EVENTS.COMMAND, async (data) => {
      console.log('Received command:', data);
      try {
        if (data.type === 'shutdown') {
          const result = await this.systemService.shutdownSystem();
          if (result.success) {
            this.socket?.emit(SOCKET_EVENTS.COMMAND_RESPONSE, {
              success: true,
              message: 'Shutdown initiated',
              type: 'shutdown'
            });
          } else {
            throw new Error(result.error || 'Shutdown failed');
          }
        }
      } catch (error: any) {
        console.error('Command execution error:', error);
        this.socket?.emit(SOCKET_EVENTS.COMMAND_RESPONSE, {
          success: false,
          error: error.message,
          type: data.type
        });
      }
    });

    this.socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      console.log('Disconnected from Socket.IO server');
      this.notifyUI('error', 'Bağlantı Kesildi', 'Sunucu bağlantısı kesildi');
    });

    this.socket.on(SOCKET_EVENTS.CONNECT_ERROR, (error) => {
      console.error('Connection error:', error);
      this.notifyUI('error', 'Bağlantı Hatası', 'Sunucu ile bağlantı kurulamadı: ' + error.message);
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
    this.mainWindow?.webContents.send(IPC_CHANNELS.SHOW_NOTIFICATION, { type, title, message });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}