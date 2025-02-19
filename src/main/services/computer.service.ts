import { createClient } from '@supabase/supabase-js';
import { config } from '../core/config';
import { machineIdSync } from 'node-machine-id';
import os from 'os';
import { getLocalIpAddress, getMacAddress } from '../utils/network.utils';
import { getSystemInfo } from '../utils/system.utils';
import { COMPUTER_STATUS, UPDATE_INTERVALS, ERROR_MESSAGES } from '../core/constants';
import type { ComputerSpecs } from '../core/types/computer.types';

export class ComputerService {
  private static instance: ComputerService;
  private supabase = createClient(config.supabase.url, config.supabase.anonKey);
  private currentComputerId: string | null = null;
  private updateInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): ComputerService {
    if (!ComputerService.instance) {
      ComputerService.instance = new ComputerService();
    }
    return ComputerService.instance;
  }

  async registerComputer(): Promise<void> {
    try {
      const machineId = machineIdSync();
      const hostname = os.hostname();
      const ipAddress = getLocalIpAddress();
      const macAddress = getMacAddress();
      const specs = await getSystemInfo();

      // Check if computer exists
      const { data: existingComputer, error: fetchError } = await this.supabase
        .from('computers')
        .select('id, computer_number')
        .eq('machine_id', machineId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw new Error(ERROR_MESSAGES.REGISTRATION_FAILED);
      }

      if (!existingComputer) {
        // Get next available computer number
        const { data: computers } = await this.supabase
          .from('computers')
          .select('computer_number')
          .order('computer_number');

        let nextNumber = 1;
        const usedNumbers = new Set(
          computers?.map(c => parseInt(c.computer_number.replace(/\D/g, ''))) || []
        );

        while (usedNumbers.has(nextNumber)) {
          nextNumber++;
        }

        const computerNumber = `PC${nextNumber.toString().padStart(3, '0')}`;
        
        // Register new computer
        const { data: newComputer, error: insertError } = await this.supabase
          .from('computers')
          .insert({
            machine_id: machineId,
            computer_number: computerNumber,
            name: hostname,
            status: COMPUTER_STATUS.AVAILABLE,
            ip_address: ipAddress,
            mac_address: macAddress,
            specifications: specs,
            last_maintenance: new Date().toISOString(),
            last_seen: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) throw new Error(ERROR_MESSAGES.REGISTRATION_FAILED);
        this.currentComputerId = newComputer.id;
      } else {
        this.currentComputerId = existingComputer.id;
        // Update existing computer
        const { error: updateError } = await this.supabase
          .from('computers')
          .update({
            name: hostname,
            status: COMPUTER_STATUS.AVAILABLE,
            ip_address: ipAddress,
            mac_address: macAddress,
            specifications: specs,
            last_seen: new Date().toISOString()
          })
          .eq('id', this.currentComputerId);

        if (updateError) throw new Error(ERROR_MESSAGES.UPDATE_FAILED);
      }

      // Start status update interval
      this.startUpdateInterval();

    } catch (error) {
      console.error('Error registering computer:', error);
      throw error;
    }
  }

  private startUpdateInterval(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(async () => {
      if (this.currentComputerId) {
        try {
          const specs = await getSystemInfo();
          const { error: updateError } = await this.supabase
            .from('computers')
            .update({
              last_seen: new Date().toISOString(),
              ip_address: getLocalIpAddress(),
              mac_address: getMacAddress(),
              specifications: specs
            })
            .eq('id', this.currentComputerId);

          if (updateError) {
            console.error(ERROR_MESSAGES.SPECS_UPDATE_FAILED, updateError);
          }
        } catch (error) {
          console.error('Error in status update interval:', error);
        }
      }
    }, UPDATE_INTERVALS.STATUS);
  }

  async setComputerOffline(): Promise<void> {
    if (this.currentComputerId) {
      try {
        const { error } = await this.supabase
          .from('computers')
          .update({
            status: COMPUTER_STATUS.OFFLINE,
            current_session_id: null,
            last_seen: new Date().toISOString()
          })
          .eq('id', this.currentComputerId);

        if (error) throw new Error(ERROR_MESSAGES.OFFLINE_FAILED);

        if (this.updateInterval) {
          clearInterval(this.updateInterval);
          this.updateInterval = null;
        }
      } catch (error) {
        console.error('Error setting computer offline:', error);
        throw error;
      }
    }
  }

  async getCurrentSpecs(): Promise<ComputerSpecs> {
    try {
      const specs = await getSystemInfo();
      
      if (this.currentComputerId) {
        const { error } = await this.supabase
          .from('computers')
          .update({
            specifications: specs,
            last_seen: new Date().toISOString()
          })
          .eq('id', this.currentComputerId);

        if (error) {
          console.error(ERROR_MESSAGES.SPECS_UPDATE_FAILED, error);
        }
      }

      return specs;
    } catch (error) {
      console.error('Error getting current specs:', error);
      throw error;
    }
  }

  getCurrentComputerId(): string | null {
    return this.currentComputerId;
  }
}