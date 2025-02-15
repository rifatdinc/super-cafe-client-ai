import { supabase } from '../lib/supabase';

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

class MetricsService {
  private computerId: string | null = null;
  private updateInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.setupMetricsListener();
  }

  async initialize(computerId: string) {
    this.computerId = computerId;
    await this.updateComputerInfo();
  }

  private setupMetricsListener() {
    // Sistem metriklerini dinle
    window.electron.systemMetrics.onUpdate(async (metrics: SystemMetrics) => {
      if (this.computerId) {
        await this.sendMetrics(metrics);
      }
    });
  }

  private async updateComputerInfo() {
    if (!this.computerId) return;

    try {
      // Network bilgilerini al
      const metrics = await window.electron.systemMetrics.get();
      
      if (metrics?.network) {
        // Computer bilgilerini güncelle
        const { error } = await supabase
          .from('computers')
          .update({
            ip_address: metrics.network.ip,
            mac_address: metrics.network.mac,
            status: 'online',
            last_seen: new Date().toISOString()
          })
          .eq('id', this.computerId);

        if (error) {
          console.error('Error updating computer info:', error);
        }
      }
    } catch (error) {
      console.error('Error in updateComputerInfo:', error);
    }
  }

  private async sendMetrics(metrics: SystemMetrics) {
    if (!this.computerId) return;

    try {
      // Metrikleri güncelle
      const { error } = await supabase
        .from('computers')
        .update({
          metrics: {
            cpu: metrics.cpu,
            memory: metrics.memory,
            processes: metrics.processes
          },
          last_seen: metrics.timestamp
        })
        .eq('id', this.computerId);

      if (error) {
        console.error('Error sending metrics:', error);
      }
    } catch (error) {
      console.error('Error in sendMetrics:', error);
    }
  }

  // Bilgisayar kapatılırken veya uyku moduna geçerken çağrılacak
  async updateStatus(status: 'offline' | 'sleeping') {
    if (!this.computerId) return;

    try {
      const { error } = await supabase
        .from('computers')
        .update({
          status,
          last_seen: new Date().toISOString()
        })
        .eq('id', this.computerId);

      if (error) {
        console.error('Error updating status:', error);
      }
    } catch (error) {
      console.error('Error in updateStatus:', error);
    }
  }

  // Servisi temizle
  dispose() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}

export const metricsService = new MetricsService();
