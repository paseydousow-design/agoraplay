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
  private currentName: string = '';
  private reconnectTimeout: number | null = null;
  public isConnected: boolean = false;

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const url = `${protocol}//${host}`;

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.isConnected = true;
        // If we were already in a room, re-join seamlessly
        if (this.currentRoomKey && this.currentPlayerId) {
          this.send({
            type: 'join_room',
            roomKey: this.currentRoomKey,
            playerId: this.currentPlayerId,
            playerName: this.currentName,
            passcode: this.currentPasscode,
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

    this.connect();

    this.send({
      type: 'join_room',
      roomKey: this.currentRoomKey,
      playerId,
      playerName,
      passcode,
      gameType,
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
    this.send({
      type: 'switch_game',
      roomKey: roomKey.trim().toUpperCase(),
      playerId,
      newGameType,
    });
  }

  private send(data: object) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      // If not yet open, retry shortly
      setTimeout(() => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify(data));
        }
      }, 300);
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
