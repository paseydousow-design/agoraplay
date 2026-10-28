export type GameType = 'chess' | 'checkers' | 'ludo' | 'connect4' | 'tictactoe' | 'three_morris';

export type GameMode = 'multiplayer' | 'bot' | 'local';

export type BotDifficulty = 'easy' | 'medium' | 'hard';

export interface Player {
  id: string;
  name: string;
  avatarSeed?: string;
  isReady: boolean;
  isConnected: boolean;
  color?: string; // 'white' | 'black' | 'red' | 'green' | 'yellow' | 'blue'
  seatIndex: number;
  isHost?: boolean;
  score?: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface RoomConfig {
  key: string; // e.g. "SALON-8392" or custom name
  name: string;
  gameType: GameType;
  maxPlayers: number;
  hasPasscode: boolean;
  passcode?: string;
  turnTimeLimitSeconds?: number; // 0 for unlimited, 30, 60, etc.
  allowSpectators: boolean;
}

export interface BaseGameState {
  gameType: GameType;
  status: 'WAITING' | 'PLAYING' | 'FINISHED';
  currentTurnPlayerId: string;
  winnerPlayerId?: string | 'DRAW' | null;
  turnNumber: number;
  lastMoveTimestamp?: number;
  moveHistory: string[];
}

// ----------------- CHESS -----------------
export type ChessPieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type ChessPieceColor = 'w' | 'b';

export interface ChessPiece {
  type: ChessPieceType;
  color: ChessPieceColor;
  hasMoved?: boolean;
}

export type ChessBoardGrid = (ChessPiece | null)[][]; // 8x8: [row 0-7][col 0-7]

export interface ChessGameState extends BaseGameState {
  gameType: 'chess';
  board: ChessBoardGrid;
  activeColor: ChessPieceColor;
  inCheck: boolean;
  checkmate: boolean;
  stalemate: boolean;
  capturedByWhite: ChessPieceType[];
  capturedByBlack: ChessPieceType[];
  enPassantTarget?: [number, number] | null;
}

// ----------------- CHECKERS (DAMES) -----------------
export type CheckerPieceColor = 'red' | 'black'; // red (top) vs black (bottom) or white/black
export interface CheckerPiece {
  id: string;
  color: CheckerPieceColor;
  isKing: boolean;
}

export type CheckersGrid = (CheckerPiece | null)[][]; // 8x8

export type CheckersVariant = 'senegalese' | 'classic' | 'international';

export interface CheckersGameState extends BaseGameState {
  gameType: 'checkers';
  board: CheckersGrid;
  boardSize?: 8 | 10; // 8x8 (12 pions) or 10x10 (20 pions, grand damier sénégalais / international)
  activeColor: CheckerPieceColor;
  capturedRed: number;
  capturedBlack: number;
  variant: CheckersVariant;
  consecutiveJumpPiecePos?: [number, number] | null; // For multi-jumps
}

// ----------------- LUDO -----------------
export type LudoColor = 'red' | 'green' | 'yellow' | 'blue';

export interface LudoToken {
  id: number; // 0..3
  color: LudoColor;
  position: number; // -1: in yard/stable, 0..51: track, 100..105: home stretch, 999: reached center/goal
}

export type LudoMode = 'classic' | 'quick' | 'master';

export interface LudoGameState extends BaseGameState {
  gameType: 'ludo';
  playerColors: LudoColor[];
  tokens: Record<LudoColor, LudoToken[]>;
  diceValue: number | null;
  hasRolledDice: boolean;
  canRollDice: boolean;
  activeColorIndex: number;
  lastDiceRolls: number[];
  finishedRank: LudoColor[]; // 1st, 2nd, 3rd, 4th
  ludoMode?: LudoMode; // 'classic' (4 pions), 'quick' (1 pion), 'master' (capture requise)
  targetTokensToWin?: number; // 4 or 1
  hasCapturedOpponent?: Record<LudoColor, boolean>;
  consecutiveSixCount?: number;
  bonusRollEarned?: boolean;
}

// ----------------- CONNECT 4 -----------------
export type Connect4Disc = 'red' | 'yellow' | null;

export interface Connect4GameState extends BaseGameState {
  gameType: 'connect4';
  grid: Connect4Disc[][]; // 6 rows x 7 cols
  activeDisc: 'red' | 'yellow';
  winningCoords?: [number, number][];
}

// ----------------- TIC-TAC-TOE -----------------
export type TicTacToeSymbol = 'X' | 'O' | null;

export interface TicTacToeGameState extends BaseGameState {
  gameType: 'tictactoe';
  board: TicTacToeSymbol[]; // 9 cells
  activeSymbol: 'X' | 'O';
  winningLine?: number[];
}

// ----------------- JEU DES 3 PIONS (MARELLE À 3 / ACHI) -----------------
export type ThreeMorrisPiece = 'P1' | 'P2' | null;

export interface ThreeMorrisGameState extends BaseGameState {
  gameType: 'three_morris';
  board: ThreeMorrisPiece[]; // 9 cells (0 to 8)
  phase: 'placement' | 'movement';
  placedPieces: {
    P1: number; // max 3
    P2: number; // max 3
  };
  activePlayerSymbol: 'P1' | 'P2';
  playerIds: {
    P1: string;
    P2: string;
  };
  selectedCell: number | null;
  winningLine?: number[];
  blockedPlayer?: 'P1' | 'P2' | null;
}

export type AnyGameState =
  | ChessGameState
  | CheckersGameState
  | LudoGameState
  | Connect4GameState
  | TicTacToeGameState
  | ThreeMorrisGameState;

export interface GameRoom {
  config: RoomConfig;
  players: Player[];
  spectators: Player[];
  gameState: AnyGameState;
  chat: ChatMessage[];
  rematchVotes: string[]; // playerIds that agreed to rematch
  botDifficulty?: BotDifficulty;
  createdAt: number;
  updatedAt: number;
}
