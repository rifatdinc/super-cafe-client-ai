import { Peer } from 'peerjs';

interface StreamOptions {
  computerId: string;
  onStream?: (stream: MediaStream) => void;
}

class StreamService {
  private peer?: Peer;
  private connection?: any;

  async startStream(options: StreamOptions) {
    try {
      // WebRTC için peer oluştur
      this.peer = new Peer();

      // Bağlantı kur
      this.connection = this.peer.connect(options.computerId);

      // Bağlantı kurulduğunda
      this.connection.on('open', () => {
        // Stream iste
        this.connection.send('request-stream');
      });

      // Stream geldiğinde
      this.peer.on('call', (call) => {
        // Stream'i al
        call.answer(null);
        
        // Stream hazır olduğunda
        call.on('stream', (remoteStream) => {
          if (options.onStream) {
            options.onStream(remoteStream);
          }
        });
      });

    } catch (error) {
      console.error('Failed to start stream:', error);
    }
  }

  stopStream() {
    // WebRTC bağlantısını kapat
    this.connection?.close();
    this.peer?.destroy();

    // Referansları temizle
    this.peer = undefined;
    this.connection = undefined;
  }
}

export const streamService = new StreamService();
