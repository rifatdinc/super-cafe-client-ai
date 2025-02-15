import { Peer } from 'peerjs';
import { supabase } from '../lib/supabase';

interface StreamOptions {
  onError?: (error: Error) => void;
  onClose?: () => void;
}

class StreamClientService {
  private peer?: Peer;
  private stream?: MediaStream;
  private options?: StreamOptions;
  private channel: RealtimeChannel;

  constructor(options?: StreamOptions) {
    this.options = options;
    
    // Channel'ı oluştur ve subscribe ol
    this.channel = supabase.channel('stream_commands');
    
    // Subscribe to changes
    this.channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'stream_commands'
      },
      async (payload) => {
        const { event, payload: commandPayload } = payload.new;
        
        if (event === 'stream-start') {
          console.log('📡 Received stream start command:', commandPayload);
          const { adminPeerId } = commandPayload;
          await this.startStream(adminPeerId);
        } 
        else if (event === 'stream-stop') {
          console.log('🛑 Received stream stop command');
          this.stopStream();
        }
      }
    ).subscribe();
    
    console.log('🎯 Subscribed to stream commands');
  }

  private async getScreenStream() {
    try {
      const sources = await window.electron?.getDesktopSources();
      if (!sources || sources.length === 0) {
        throw new Error('No screen source found');
      }

      const source = sources[0];
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: source.id,
            maxWidth: 1920,
            maxHeight: 1080,
            frameRate: 30
          }
        } as any
      });

      return stream;
    } catch (error) {
      console.error('Failed to get screen stream:', error);
      throw error;
    }
  }

  private async startStream(adminPeerId: string) {
    try {
      console.log('🎬 Starting stream to admin:', adminPeerId);
      
      // Eğer önceki stream varsa temizle
      this.stopStream();

      // Yeni peer oluştur
      this.peer = new Peer();

      // Peer bağlantısını bekle
      await new Promise<void>((resolve, reject) => {
        this.peer?.on('open', () => {
          console.log('🔗 Peer connection opened');
          resolve();
        });
        
        this.peer?.on('error', (err) => {
          console.error('❌ Peer error:', err);
          reject(err);
        });
      });

      // Ekran paylaşımını başlat
      this.stream = await this.getScreenStream();
      console.log('📺 Got screen stream');

      // Admin'e stream'i gönder
      const call = this.peer?.call(adminPeerId, this.stream);
      console.log('📞 Calling admin with stream');

      // Hata durumlarını dinle
      call?.on('error', (error) => {
        console.error('❌ Call error:', error);
        if (this.options?.onError) {
          this.options.onError(error);
        }
      });

      call?.on('close', () => {
        console.log('📞 Call closed');
        if (this.options?.onClose) {
          this.options.onClose();
        }
      });

    } catch (error) {
      console.error('Failed to start stream:', error);
      if (this.options?.onError) {
        this.options.onError(error as Error);
      }
      throw error;
    }
  }

  private stopStream() {
    console.log('🛑 Stopping stream...');
    
    // Stream'i durdur
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = undefined;
    }

    // Peer'i kapat
    if (this.peer) {
      this.peer.destroy();
      this.peer = undefined;
    }
  }
}

// Singleton instance
export const streamClientService = new StreamClientService();
