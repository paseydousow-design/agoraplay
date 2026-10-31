import { GameRoom, ChatMessage } from '../types/game';

type StateListener = (room: GameRoom) => void;
type ChatListener = (msg: ChatMessage) => void;
type ErrorListener = (error: string) => void;

class SocketClient {
  private ws: WebSocket | null = null;
  private stateListeners: Set<StateListener> = new Set();
  private chatListeners: Set<ChatListener> = new Set();
  private errorListeners: Set<ErrorListener> = new Set();
  private currentRoomKey: string | null = null;
  private currentPlayerId: string | null = null;
  private currentPasscode: string | undefined = undefined;
  private currentGameType: string | undefined = undefined;
  private currentName: string = '';
  private reconnectTimeout: number | null = null;
  private messageQueue: object[] = [];
  public isConnected: boolean = false;

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    let url: string;
    const envWsUrl = import.meta.env.VITE_WS_URL;
    if (envWsUrl) {
      url = envWsUrl;
    } else if (
      typeof window !== 'undefined' &&
      (window.location.hostname.includes('vercel.app') ||
        (window.location.hostname.includes('agoraplay') && !window.location.hostname.includes('onrender.com')))
    ) {
      url = 'wss://agoraplay.onrender.com';
    } else {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      url = `${protocol}//${host}`;
    }

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.isConnected = true;

        // Flush all queued messages first
        if (this.messageQueue.length > 0) {
          const queue = [...this.messageQueue];
          this.messageQueue = [];
          for (const msg of queue) {
            try {
              this.ws?.send(JSON.stringify(msg));
            } catch (err) {
              console.error('Failed to send queued message:', err);
            }
          }
        } else if (this.currentRoomKey && this.currentPlayerId) {
          // If no queue but we were in a room, re-join seamlessly with full params
          this.send({
            type: 'join_room',
            roomKey: this.currentRoomKey,
            playerId: this.currentPlayerId,
            playerName: this.currentName,
            passcode: this.currentPasscode,
            gameType: this.currentGameType,
          });
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'room_state' && data.room) {
            this.stateListeners.forEach((cb) => cb(data.room));
          } else if (data.type === 'chat_broadcast' && data.message) {
            this.chatListeners.forEach((cb) => cb(data.message));
          } else if (data.type === 'error' && data.message) {
            this.errorListeners.forEach((cb) => cb(data.message));
          }
        } catch (err) {
          console.error('Socket message parse error:', err);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        // Attempt reconnect after 1.5s
        if (this.reconnectTimeout) window.clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = window.setTimeout(() => {
          this.connect();
        }, 1500);
      };

      this.ws.onerror = (err) => {
        console.warn('WebSocket warning:', err);
      };
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
    }
  }

  joinRoom(roomKey: string, playerId: string, playerName: string, passcode?: string, gameType?: string) {
    this.currentRoomKey = roomKey.trim().toUpperCase();
    this.currentPlayerId = playerId;
    this.currentName = playerName;
    this.currentPasscode = passcode;
    if (gameType) {
      this.currentGameType = gameType;
    }

    this.connect();

    this.send({
      type: 'join_room',
      roomKey: this.currentRoomKey,
      playerId,
      playerName,
      passcode,
      gameType: this.currentGameType,
    });
  }

  sendGameAction(roomKey: string, playerId: string, action: Record<string, unknown>) {
    this.send({
      type: 'game_action',
      roomKey: roomKey.trim().toUpperCase(),
      playerId,
      action,
    });
  }

  sendChatMessage(roomKey: string, playerId: string, playerName: string, text: string) {
    this.send({
      type: 'chat_message',
      roomKey: roomKey.trim().toUpperCase(),
      playerId,
      playerName,
      text,
    });
  }

  requestRematch(roomKey: string, playerId: string) {
    this.send({
      type: 'rematch_request',
      roomKey: roomKey.trim().toUpperCase(),
      playerId,
    });
  }

  switchGame(roomKey: string, playerId: string, newGameType: string) {
    this.currentGameType = newGameType;
    this.send({
      type: 'switch_game',
      roomKey: roomKey.trim().toUpperCase(),
      playerId,
      newGameType,
    });
  }

  leaveRoom(roomKey: string, playerId: string) {
    this.send({
      type: 'leave_room',
      roomKey: roomKey.trim().toUpperCase(),
      playerId,
    });
    this.currentRoomKey = null;
    this.currentGameType = undefined;
  }

  private send(data: object) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      // Queue message so it sends immediately upon connection
      this.messageQueue.push(data);
      this.connect();
    }
  }

  onRoomState(cb: StateListener) {
    this.stateListeners.add(cb);
    return () => this.stateListeners.delete(cb);
  }

  onChatMessage(cb: ChatListener) {
    this.chatListeners.add(cb);
    return () => this.chatListeners.delete(cb);
  }

  onError(cb: ErrorListener) {
    this.errorListeners.add(cb);
    return () => this.errorListeners.delete(cb);
  }
}

export const socketClient = new SocketClient();
