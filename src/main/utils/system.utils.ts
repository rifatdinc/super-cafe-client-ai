import { exec } from 'child_process';
import os from 'os';
import * as si from 'systeminformation';
import { ComputerSpecs } from '../core/types/computer.types';

export async function getSystemInfo(): Promise<ComputerSpecs> {
  return {
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
}

export async function shutdownSystem(): Promise<{ success: boolean; error?: string }> {
  try {
    const platform = process.platform;
    let shutdownSuccess = false;

    if (platform === 'darwin') {
      try {
        await new Promise((resolve, reject) => {
          exec('osascript -e \'tell app "System Events" to shut down\'', (error) => {
            if (error) {
              console.log('osascript shutdown failed, trying alternative method...');
              reject(error);
            } else {
              shutdownSuccess = true;
              resolve(true);
            }
          });
        });
      } catch (error) {
        await new Promise((resolve, reject) => {
          exec('osascript -e \'tell application "Finder" to shut down\'', (error) => {
            if (error) {
              reject(error);
            } else {
              shutdownSuccess = true;
              resolve(true);
            }
          });
        });
      }
    } else {
      const command = platform === 'win32' 
        ? 'shutdown /s /t 0' 
        : 'systemctl poweroff';

      await new Promise((resolve, reject) => {
        exec(command, (error) => {
          if (error) reject(error);
          else {
            shutdownSuccess = true;
            resolve(true);
          }
        });
      });
    }

    return { success: shutdownSuccess };
  } catch (error: any) {
    console.error('Shutdown error:', error);
    return { success: false, error: error.message };
  }
}