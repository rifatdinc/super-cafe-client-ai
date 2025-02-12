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

interface Window {
  electron: {
    systemMetrics: {
      get: () => Promise<SystemMetrics>;
      onUpdate: (callback: (metrics: SystemMetrics) => void) => () => void;
    };
  };
}
