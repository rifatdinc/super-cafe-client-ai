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
        // MacOS için iki farklı yöntem dene
        try {
          await this.executeMacShutdown('tell app "System Events" to shut down');
          shutdownSuccess = true;
        } catch (error) {
          console.log('First shutdown method failed, trying alternative...');
          await this.executeMacShutdown('tell application "Finder" to shut down');
          shutdownSuccess = true;
        }
      } else {
        // Windows ve Linux için
        const command = platform === 'win32' 
          ? 'shutdown /s /t 0' 
          : 'systemctl poweroff';

        await this.executeCommand(command);
        shutdownSuccess = true;
      }

      return { success: shutdownSuccess };
    } catch (error: any) {
      console.error('Shutdown error:', error);
      return { success: false, error: error.message };
    }
  }

  private executeMacShutdown(script: string): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(`osascript -e '${script}'`, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  private executeCommand(command: string): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(command, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  async restartSystem(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.computerService.setComputerOffline();
      
      const platform = process.platform;
      let command = '';

      switch (platform) {
        case 'win32':
          command = 'shutdown /r /t 0';
          break;
        case 'darwin':
          command = 'osascript -e \'tell app "System Events" to restart\'';
          break;
        case 'linux':
          command = 'systemctl reboot';
          break;
        default:
          throw new Error('Unsupported platform for restart');
      }

      await this.executeCommand(command);
      return { success: true };
    } catch (error: any) {
      console.error('Restart error:', error);
      return { success: false, error: error.message };
    }
  }

  async logoutUser(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.computerService.setComputerOffline();
      
      const platform = process.platform;
      let command = '';

      switch (platform) {
        case 'win32':
          command = 'shutdown /l';
          break;
        case 'darwin':
          command = 'osascript -e \'tell app "System Events" to log out\'';
          break;
        case 'linux':
          command = 'gnome-session-quit --logout --force';
          break;
        default:
          throw new Error('Unsupported platform for logout');
      }

      await this.executeCommand(command);
      return { success: true };
    } catch (error: any) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  }
}