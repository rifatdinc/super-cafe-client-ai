export interface ComputerSpecs {
  platform: string;
  release: string;
  arch: string;
  cpus: Array<{
    model: string;
    speed: number;
  }>;
  totalMemory: number;
  freeMemory: number;
}

export interface ComputerInfo {
  machineId: string;
  hostname: string;
  ipAddress: string;
  macAddress: string | null;
  specs: ComputerSpecs;
}