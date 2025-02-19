import os from 'os';

export function getLocalIpAddress(): string {
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

export function getMacAddress(): string | null {
  const interfaces = os.networkInterfaces();
  for (const netInterface of Object.values(interfaces)) {
    if (!netInterface) continue;
    
    for (const config of netInterface) {
      if (config.family === 'IPv4' && !config.internal && config.mac) {
        return config.mac;
      }
    }
  }
  return null;
}