import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

export function loadEnvironmentVariables() {
  const envPath = path.join(process.cwd(), '.env.electron');
  
  if (fs.existsSync(envPath)) {
    const result = dotenv.config({ path: envPath });
    
    if (result.error) {
      console.error('Error loading .env.electron file:', result.error);
      return;
    }
    
    console.log('Environment variables loaded successfully from .env.electron');
  } else {
    console.warn('.env.electron file not found at:', envPath);
  }
}