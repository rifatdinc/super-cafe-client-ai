import { ipcMain } from 'electron';
import si from 'systeminformation';
import { networkInterfaces } from 'os';

interface SystemMetrics {
  cpu: {
    usage: number;
    temperature: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
  };
  processes: number;
  network: {
    ip: string;
    mac: string;
  };
  timestamp: string;
}

class SystemMonitor {
  private updateInterval: ReturnType<typeof setInterval> | null = null;
  private metrics: SystemMetrics | null = null;

  constructor(private intervalMs: number = 5000) {}

  async start() {
    if (this.updateInterval) {
      return;
    }

    // İlk metrikleri topla
    await this.collectMetrics();

    // Periyodik güncelleme başlat
    this.updateInterval = setInterval(async () => {
      await this.collectMetrics();
    }, this.intervalMs);

    // IPC handlers'ları kaydet
    this.setupIpcHandlers();
  }

  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  private async collectMetrics(): Promise<void> {
    try {
      // CPU kullanımı ve sıcaklık
      const [cpuLoad, cpuTemp] = await Promise.all([
        si.currentLoad(),
        si.cpuTemperature()
      ]);

      // Bellek kullanımı
      const memory = await si.mem();

      // Çalışan process sayısı
      const processes = await si.processes();

      // Ağ bilgileri
      const networkInfo = this.getNetworkInfo();

      this.metrics = {
        cpu: {
          usage: Math.round(cpuLoad.currentLoad),
          temperature: Math.round(cpuTemp.main || 0)
        },
        memory: {
          total: memory.total,
          used: memory.used,
          free: memory.free
        },
        processes: processes.all,
        network: networkInfo,
        timestamp: new Date().toISOString()
      };

      // Metrikleri renderer process'e gönder
      this.broadcastMetrics();
    } catch (error) {
      console.error('Error collecting metrics:', error);
    }
  }

  private getNetworkInfo() {
    const interfaces = networkInterfaces();
    let ip = '';
    let mac = '';

    // İlk aktif interface'i bul
    for (const [name, addrs] of Object.entries(interfaces)) {
      if (!addrs) continue;

      for (const addr of addrs) {
        if (addr.family === 'IPv4' && !addr.internal) {
          ip = addr.address;
          mac = addr.mac;
          break;
        }
      }
      if (ip && mac) break;
    }

    return { ip, mac };
  }

  private broadcastMetrics() {
    if (this.metrics) {
      ipcMain.emit('system-metrics-update', this.metrics);
    }
  }

  private setupIpcHandlers() {
    // Anlık metrikleri al
    ipcMain.handle('get-system-metrics', () => {
      return this.metrics;
    });
  }
}

export default SystemMonitor;
