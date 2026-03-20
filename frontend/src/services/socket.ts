import { io, Socket } from 'socket.io-client';

const URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

class SocketService {
  private static instance: SocketService;
  public socket: Socket;

  private constructor() {
    this.socket = io(URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.setupDefaultHandlers();
  }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  private setupDefaultHandlers() {
    this.socket.on('connect', () => {
      console.log('🔌 [SOCKET] Connesso al server:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 [SOCKET] Disconnesso dal server:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 [SOCKET] Errore di connessione:', error);
    });
  }

  public emit(event: string, data?: any) {
    this.socket.emit(event, data);
  }

  public on(event: string, callback: (data: any) => void) {
    this.socket.on(event, callback);
  }

  public off(event: string) {
    this.socket.off(event);
  }
}

export const socketService = SocketService.getInstance();
export const socket = socketService.socket;
