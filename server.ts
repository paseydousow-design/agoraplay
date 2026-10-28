import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocket, WebSocketServer } from 'ws';
import {
  executeChessMove,
  createInitialChessState,
} from './src/game-engines/chess.ts';
import {
  executeCheckersMove,
  createInitialCheckersState,
  createInitialCheckersBoard,
} from './src/game-engines/checkers.ts';
import {
  executeLudoDiceRoll,
  executeLudoTokenMove,
  createInitialLudoState,
  LUDO_COLORS,
} from './src/game-engines/ludo.ts';
import {
  dropConnect4Disc,
  createInitialConnect4State,
} from './src/game-engines/connect4.ts';
import {
  playTicTacToeMove,
  createInitialTicTacToeState,
} from './src/game-engines/tictactoe.ts';
import {
  createInitialThreeMorrisState,
  playThreeMorrisPlacement,
  playThreeMorrisMovement,
} from './src/game-engines/three_morris.ts';
import {
  AnyGameState,
  ChatMessage,
  GameRoom,
  GameType,
  Player,
  RoomConfig,
} from './src/types/game.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.json());

// In-memory store for active private game rooms
const rooms = new Map<string, GameRoom>();

// Track socket to room & player mapping
interface SocketMeta {
  ws: WebSocket;
  roomKey?: string;
  playerId?: string;
}
const clientSockets = new Map<WebSocket, SocketMeta>();

function createDefaultGameState(gameType: GameType, players: Player[]): AnyGameState {
  const p1 = players[0]?.id || 'p1';
  const playerIds = players.map((p) => p.id);

  switch (gameType) {
    case 'chess':
      return createInitialChessState(p1);
    case 'checkers':
      return createInitialCheckersState(p1);
    case 'ludo':
      return createInitialLudoState(playerIds.length ? playerIds : ['p1', 'p2'], LUDO_COLORS.slice(0, Math.max(2, playerIds.length)));
    case 'connect4':
      return createInitialConnect4State(p1);
    case 'tictactoe':
      return createInitialTicTacToeState(p1);
    case 'three_morris':
      return createInitialThreeMorrisState(p1, players[1]?.id || 'p2');
  }
}

function broadcastToRoom(roomKey: string, message: object) {
  const payload = JSON.stringify(message);
  for (const [, meta] of clientSockets.entries()) {
    if (meta.roomKey === roomKey && meta.ws.readyState === WebSocket.OPEN) {
      meta.ws.send(payload);
    }
  }
}

// REST API
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', activeRooms: rooms.size });
});

app.get('/api/rooms', (_req, res) => {
  const publicRooms = Array.from(rooms.values())
    .filter((r) => !r.config.hasPasscode)
    .map((r) => ({
      key: r.config.key,
      name: r.config.name,
      gameType: r.config.gameType,
      playersCount: r.players.length,
      maxPlayers: r.config.maxPlayers,
      status: r.gameState.status,
      createdAt: r.createdAt,
    }));
  res.json({ rooms: publicRooms });
});

app.post('/api/rooms', (req, res) => {
  const { key, name, gameType, passcode, turnTimeLimitSeconds } = req.body;

  const roomKey = (key || `SALON-${Math.floor(1000 + Math.random() * 9000)}`)
    .trim()
    .toUpperCase();

  if (rooms.has(roomKey)) {
    return res.status(400).json({ error: 'Ce code de salon est déjà utilisé' });
  }

  const maxPlayers = gameType === 'ludo' ? 4 : 2;

  const config: RoomConfig = {
    key: roomKey,
    name: name || `Salon ${roomKey}`,
    gameType: gameType || 'chess',
    maxPlayers,
    hasPasscode: !!passcode,
    passcode: passcode || undefined,
    turnTimeLimitSeconds: turnTimeLimitSeconds || 0,
    allowSpectators: true,
  };

  const newRoom: GameRoom = {
    config,
    players: [],
    spectators: [],
    gameState: createDefaultGameState(config.gameType, []),
    chat: [
      {
        id: `sys-${Date.now()}`,
        senderId: 'system',
        senderName: 'AgoraPlay',
        text: `Bienvenue dans le salon ${roomKey} ! Donnez cette clé à vos amis pour jouer.`,
        timestamp: Date.now(),
        isSystem: true,
      },
    ],
    rematchVotes: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  rooms.set(roomKey, newRoom);
  res.json({ success: true, roomKey, room: newRoom });
});

app.get('/api/rooms/:key', (req, res) => {
  const roomKey = req.params.key.trim().toUpperCase();
  const room = rooms.get(roomKey);
  if (!room) {
    return res.status(404).json({ error: 'Salon introuvable' });
  }

  res.json({
    key: room.config.key,
    name: room.config.name,
    gameType: room.config.gameType,
    playersCount: room.players.length,
    maxPlayers: room.config.maxPlayers,
    hasPasscode: room.config.hasPasscode,
    status: room.gameState.status,
  });
});

// WebSocket real-time events
wss.on('connection', (ws) => {
  const meta: SocketMeta = { ws };
  clientSockets.set(ws, meta);

  ws.on('message', (raw) => {
    try {
      const data = JSON.parse(raw.toString());
      const { type } = data;

      switch (type) {
        case 'join_room': {
          const roomKey = (data.roomKey || '').trim().toUpperCase();
          const { playerId, playerName, passcode, gameType } = data;

          let room = rooms.get(roomKey);
          if (!room) {
            // Auto-create room if it didn't exist
            const chosenGame: GameType = gameType || 'chess';
            room = {
              config: {
                key: roomKey,
                name: `Salon ${roomKey}`,
                gameType: chosenGame,
                maxPlayers: chosenGame === 'ludo' ? 4 : 2,
                hasPasscode: false,
                allowSpectators: true,
              },
              players: [],
              spectators: [],
              gameState: createDefaultGameState(chosenGame, []),
              chat: [
                {
                  id: `sys-${Date.now()}`,
                  senderId: 'system',
                  senderName: 'AgoraPlay',
                  text: `Salon ${roomKey} créé. Partagez ce code avec vos amis !`,
                  timestamp: Date.now(),
                  isSystem: true,
                },
              ],
              rematchVotes: [],
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };
            rooms.set(roomKey, room);
          }

          // Check passcode
          if (room.config.hasPasscode && room.config.passcode && room.config.passcode !== passcode) {
            ws.send(JSON.stringify({ type: 'error', message: 'Mot de passe du salon incorrect' }));
            return;
          }

          meta.roomKey = roomKey;
          meta.playerId = playerId;

          // Check if player already in room
          let existingPlayer = room.players.find((p) => p.id === playerId);
          if (existingPlayer) {
            existingPlayer.isConnected = true;
            existingPlayer.name = playerName || existingPlayer.name;
          } else {
            // Add as player if room not full, else spectator
            if (room.players.length < room.config.maxPlayers) {
              const seatIndex = room.players.length;
              const color =
                room.config.gameType === 'ludo'
                  ? LUDO_COLORS[seatIndex]
                  : seatIndex === 0
                  ? 'white'
                  : 'black';

              const newPlayer: Player = {
                id: playerId,
                name: playerName || `Joueur ${seatIndex + 1}`,
                seatIndex,
                color,
                isReady: true,
                isConnected: true,
                isHost: seatIndex === 0,
              };
              room.players.push(newPlayer);

              // If enough players, start/refresh game state if WAITING
              if (room.players.length >= 2 && room.gameState.status === 'WAITING') {
                room.gameState = createDefaultGameState(room.config.gameType, room.players);
              } else if (room.players.length === 1 && room.gameState.status !== 'PLAYING') {
                room.gameState.currentTurnPlayerId = room.players[0].id;
              }
            } else {
              // Spectator
              const spec: Player = {
                id: playerId,
                name: playerName || 'Spectateur',
                seatIndex: -1,
                isReady: false,
                isConnected: true,
              };
              room.spectators.push(spec);
            }
          }

          room.updatedAt = Date.now();

          // Send current state to newly joined client
          ws.send(
            JSON.stringify({
              type: 'room_state',
              room,
            })
          );

          // Broadcast to others
          broadcastToRoom(roomKey, {
            type: 'room_state',
            room,
          });

          break;
        }

        case 'game_action': {
          const { roomKey, playerId, action } = data;
          const room = rooms.get((roomKey || '').toUpperCase());
          if (!room) return;

          const player = room.players.find((p) => p.id === playerId);
          if (!player) return;

          // Server-authoritative move handling
          const nextTurnPlayer = () => {
            const nextIdx = (player.seatIndex + 1) % room.players.length;
            return room.players[nextIdx]?.id || player.id;
          };

          if (room.config.gameType === 'chess' && room.gameState.gameType === 'chess') {
            const { from, to, promotion } = action;
            const nextState = executeChessMove(
              room.gameState,
              from,
              to,
              promotion || 'q',
              nextTurnPlayer()
            );
            if (nextState) {
              room.gameState = nextState;
              room.updatedAt = Date.now();
              broadcastToRoom(room.config.key, { type: 'room_state', room });
            }
          } else if (room.config.gameType === 'checkers' && room.gameState.gameType === 'checkers') {
            if (action.type === 'change_variant' && action.variant) {
              room.gameState.variant = action.variant;
              const variantName = action.variant === 'senegalese'
                ? '🇸🇳 Dames Sénégalaises (Prise arrière + Dames volantes)'
                : '♟️ Dames Classiques (Prise avant seulement)';
              room.chat.push({
                id: `sys-${Date.now()}`,
                senderId: 'system',
                senderName: 'AgoraPlay',
                text: `Règles appliquées : ${variantName}`,
                timestamp: Date.now(),
                isSystem: true,
              });
              room.updatedAt = Date.now();
              broadcastToRoom(room.config.key, { type: 'room_state', room });
              return;
            }

            if (action.type === 'change_board_size' && (action.size === 8 || action.size === 10)) {
              const size = action.size as 8 | 10;
              room.gameState.boardSize = size;
              room.gameState.board = createInitialCheckersBoard(size);
              room.gameState.capturedRed = 0;
              room.gameState.capturedBlack = 0;
              room.gameState.consecutiveJumpPiecePos = null;
              room.gameState.activeColor = 'black';
              room.gameState.status = 'PLAYING';
              room.gameState.winnerPlayerId = null;
              room.gameState.turnNumber = 1;
              room.gameState.moveHistory = [];
              const sizeLabel =
                size === 10
                  ? '🇸🇳 Grand Damier 10x10 (20 pions par joueur, 100 cases)'
                  : 'Damier Standard 8x8 (12 pions par joueur, 64 cases)';
              room.chat.push({
                id: `sys-${Date.now()}`,
                senderId: 'system',
                senderName: 'AgoraPlay',
                text: `Format du damier : ${sizeLabel}`,
                timestamp: Date.now(),
                isSystem: true,
              });
              room.updatedAt = Date.now();
              broadcastToRoom(room.config.key, { type: 'room_state', room });
              return;
            }

            const { move } = action;
            const nextState = executeCheckersMove(
              room.gameState,
              move,
              nextTurnPlayer()
            );
            if (nextState) {
              room.gameState = nextState;
              room.updatedAt = Date.now();
              broadcastToRoom(room.config.key, { type: 'room_state', room });
            }
          } else if (room.config.gameType === 'ludo' && room.gameState.gameType === 'ludo') {
            if (action.type === 'change_ludo_mode' && action.mode) {
              room.gameState.ludoMode = action.mode as any;
              room.gameState.targetTokensToWin = action.mode === 'quick' ? 1 : 4;
              const modeLabel =
                action.mode === 'quick'
                  ? '⚡ Mode Rapide (1 seul pion au centre pour gagner)'
                  : action.mode === 'master'
                  ? '🎯 Mode Maître (Capture obligatoire pour rentrer)'
                  : '👑 Mode Classique (Les 4 pions doivent faire le tour)';
              room.chat.push({
                id: `sys-${Date.now()}`,
                senderId: 'system',
                senderName: 'AgoraPlay',
                text: `Règles Ludo King : ${modeLabel}`,
                timestamp: Date.now(),
                isSystem: true,
              });
              room.updatedAt = Date.now();
              broadcastToRoom(room.config.key, { type: 'room_state', room });
              return;
            } else if (action.type === 'roll_dice') {
              const playerIds = room.players.map((p) => p.id);
              const { nextState } = executeLudoDiceRoll(room.gameState, undefined, playerIds);
              room.gameState = nextState;
              room.updatedAt = Date.now();
              broadcastToRoom(room.config.key, { type: 'room_state', room });
            } else if (action.type === 'move_token') {
              const playerIds = room.players.map((p) => p.id);
              const nextState = executeLudoTokenMove(room.gameState, action.tokenId, playerIds);
              room.gameState = nextState;
              room.updatedAt = Date.now();
              broadcastToRoom(room.config.key, { type: 'room_state', room });
            }
          } else if (room.config.gameType === 'connect4' && room.gameState.gameType === 'connect4') {
            const { colIndex } = action;
            const nextState = dropConnect4Disc(room.gameState, colIndex, nextTurnPlayer());
            if (nextState) {
              room.gameState = nextState;
              room.updatedAt = Date.now();
              broadcastToRoom(room.config.key, { type: 'room_state', room });
            }
          } else if (room.config.gameType === 'tictactoe' && room.gameState.gameType === 'tictactoe') {
            const { cellIndex } = action;
            const nextState = playTicTacToeMove(room.gameState, cellIndex, nextTurnPlayer());
            if (nextState) {
              room.gameState = nextState;
              room.updatedAt = Date.now();
              broadcastToRoom(room.config.key, { type: 'room_state', room });
            }
          } else if (room.config.gameType === 'three_morris' && room.gameState.gameType === 'three_morris') {
            let nextState = null;
            if (action.type === 'placement' || (action.cellIndex !== undefined && action.from === undefined)) {
              nextState = playThreeMorrisPlacement(room.gameState, action.cellIndex, nextTurnPlayer());
            } else if (action.type === 'movement' || (action.from !== undefined && action.to !== undefined)) {
              nextState = playThreeMorrisMovement(room.gameState, action.from, action.to, nextTurnPlayer());
            }
            if (nextState) {
              room.gameState = nextState;
              room.updatedAt = Date.now();
              broadcastToRoom(room.config.key, { type: 'room_state', room });
            }
          }

          break;
        }

        case 'chat_message': {
          const { roomKey, playerId, playerName, text } = data;
          const room = rooms.get((roomKey || '').toUpperCase());
          if (!room || !text?.trim()) return;

          const msg: ChatMessage = {
            id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            senderId: playerId,
            senderName: playerName || 'Joueur',
            text: text.trim().slice(0, 300),
            timestamp: Date.now(),
          };

          room.chat = [...room.chat.slice(-49), msg];
          broadcastToRoom(room.config.key, { type: 'chat_broadcast', message: msg });
          break;
        }

        case 'rematch_request': {
          const { roomKey, playerId } = data;
          const room = rooms.get((roomKey || '').toUpperCase());
          if (!room) return;

          if (!room.rematchVotes.includes(playerId)) {
            room.rematchVotes.push(playerId);
          }

          // If all active players voted rematch, reset game
          if (room.rematchVotes.length >= Math.min(2, room.players.length)) {
            room.gameState = createDefaultGameState(room.config.gameType, room.players);
            room.rematchVotes = [];
            room.chat.push({
              id: `sys-${Date.now()}`,
              senderId: 'system',
              senderName: 'AgoraPlay',
              text: 'Nouvelle manche commencée ! Bonne chance !',
              timestamp: Date.now(),
              isSystem: true,
            });
          }

          broadcastToRoom(room.config.key, { type: 'room_state', room });
          break;
        }

        case 'switch_game': {
          const { roomKey, playerId, newGameType } = data;
          const room = rooms.get((roomKey || '').toUpperCase());
          if (!room) return;
          const player = room.players.find((p) => p.id === playerId);
          if (!player || !player.isHost) return;

          room.config.gameType = newGameType;
          room.config.maxPlayers = newGameType === 'ludo' ? 4 : 2;
          room.gameState = createDefaultGameState(newGameType, room.players);
          room.rematchVotes = [];
          room.chat.push({
            id: `sys-${Date.now()}`,
            senderId: 'system',
            senderName: 'AgoraPlay',
            text: `Le jeu a été changé pour : ${newGameType.toUpperCase()}`,
            timestamp: Date.now(),
            isSystem: true,
          });

          broadcastToRoom(room.config.key, { type: 'room_state', room });
          break;
        }
      }
    } catch (err) {
      console.error('WebSocket message parsing error:', err);
    }
  });

  ws.on('close', () => {
    const meta = clientSockets.get(ws);
    if (meta && meta.roomKey && meta.playerId) {
      const room = rooms.get(meta.roomKey);
      if (room) {
        const player = room.players.find((p) => p.id === meta.playerId);
        if (player) {
          player.isConnected = false;
        }
        room.updatedAt = Date.now();
        broadcastToRoom(meta.roomKey, { type: 'room_state', room });
      }
    }
    clientSockets.delete(ws);
  });
});

// Periodic garbage collection: Clean up rooms with no connected players after 30 minutes, or older than 2 hours
setInterval(() => {
  const now = Date.now();
  for (const [key, room] of rooms.entries()) {
    const hasActivePlayers = room.players.some((p) => p.isConnected);
    const isInactive = now - room.updatedAt > 30 * 60 * 1000;
    const isVeryOld = now - room.createdAt > 2 * 60 * 60 * 1000;

    if (!hasActivePlayers && (isInactive || isVeryOld)) {
      rooms.delete(key);
    }
  }
}, 5 * 60 * 1000);

// Configure Vite or Static Serve
async function setupServer() {
  const isProd = process.env.NODE_ENV === 'production' || process.env.PROD === 'true';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  // Parse CLI args or Cloud Platform environment variables (Render, Railway, Cloud Run use PORT)
  const args = process.argv.slice(2);
  let PORT = 3000;
  const portIndex = args.indexOf('--port');
  if (portIndex !== -1 && args[portIndex + 1]) {
    PORT = parseInt(args[portIndex + 1], 10);
  } else if (process.env.PORT) {
    PORT = parseInt(process.env.PORT, 10);
  } else if (process.env.DEFAULT_APP_PORT) {
    PORT = parseInt(process.env.DEFAULT_APP_PORT, 10);
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`AgoraPlay Game Server running on port ${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start server:', err);
});
