import { exec } from 'child_process';
import { ComputerService } from './computer.service';

export class SystemService {
  private static instance: SystemService;
  private computerService: ComputerService;

  private constructor() {
    this.computerService = ComputerService.getInstance();
  }

  static getInstance(): SystemService {
    if (!SystemService.instance) {
      SystemService.instance = new SystemService();
    }
    return SystemService.instance;
  }

  async shutdownSystem(): Promise<{ success: boolean; error?: string }> {
    try {
      // Önce bilgisayarı offline yap
      await this.computerService.setComputerOffline();

      const platform = process.platform;
      let shutdownSuccess = false;

      if (platform === 'darwin') {
        try {
          await this.executeCommand('osascript -e \'tell app "System Events" to shut down\'');
          shutdownSuccess = true;
        } catch (error) {
          console.log('First macOS shutdown method failed, trying alternative...');
          try {
            await this.executeCommand('sudo shutdown -h now');
            shutdownSuccess = true;
          } catch (sudoError) {
            throw new Error('All macOS shutdown methods failed');
          }
        }
      } else if (platform === 'win32') {
        try {
          await this.executeCommand('shutdown /s /f /t 0');
          shutdownSuccess = true;
        } catch (error) {
          console.log('First Windows shutdown method failed, trying alternative...');
          try {
            await this.executeCommand('powershell -Command "Stop-Computer -Force"');
            shutdownSuccess = true;
          } catch (psError) {
            throw new Error('All Windows shutdown methods failed');
          }
        }
      } else {
        // Linux için
        try {
          await this.executeCommand('systemctl poweroff');
          shutdownSuccess = true;
        } catch (error) {
          try {
            await this.executeCommand('sudo shutdown -h now');
            shutdownSuccess = true;
          } catch (sudoError) {
            throw new Error('All Linux shutdown methods failed');
          }
        }
      }

      return { success: shutdownSuccess };
    } catch (error: any) {
      console.error('Shutdown error:', error);
      return { success: false, error: error.message };
    }
  }

  private executeCommand(command: string): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Command execution error: ${error.message}`);
          console.error(`stderr: ${stderr}`);
          reject(error);
        } else {
          console.log(`Command output: ${stdout}`);
          resolve();
        }
      });
    });
  }

  async restartSystem(): Promise<{ success: boolean; error?: string }> {
    try {
      const platform = process.platform;
      const command = platform === 'darwin'
        ? 'osascript -e \'tell app "System Events" to restart\''
        : platform === 'win32'
          ? 'shutdown /r /t 0'
          : 'systemctl reboot';

      await this.executeCommand(command);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async logoutUser(): Promise<{ success: boolean; error?: string }> {
    try {
      const platform = process.platform;
      const command = platform === 'darwin'
        ? 'osascript -e \'tell app "System Events" to log out\''
        : platform === 'win32'
          ? 'shutdown /l'
          : 'systemctl logout';

      await this.executeCommand(command);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}