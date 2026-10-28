import { TicTacToeGameState, TicTacToeSymbol, BotDifficulty } from '../types/game';

export const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function createInitialTicTacToeState(firstPlayerId: string): TicTacToeGameState {
  return {
    gameType: 'tictactoe',
    status: 'PLAYING',
    currentTurnPlayerId: firstPlayerId,
    turnNumber: 1,
    board: Array(9).fill(null),
    activeSymbol: 'X',
    moveHistory: [],
  };
}

export function checkTicTacToeWin(board: TicTacToeSymbol[]): {
  winner: 'X' | 'O' | 'DRAW' | null;
  line?: number[];
} {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }

  if (board.every((cell) => cell !== null)) {
    return { winner: 'DRAW' };
  }

  return { winner: null };
}

export function playTicTacToeMove(
  state: TicTacToeGameState,
  cellIndex: number,
  nextPlayerId: string
): TicTacToeGameState | null {
  if (cellIndex < 0 || cellIndex >= 9) return null;
  if (state.board[cellIndex] !== null) return null;

  const nextBoard = [...state.board];
  nextBoard[cellIndex] = state.activeSymbol;

  const res = checkTicTacToeWin(nextBoard);
  const isOver = res.winner !== null;

  return {
    gameType: 'tictactoe',
    status: isOver ? 'FINISHED' : 'PLAYING',
    currentTurnPlayerId: isOver ? state.currentTurnPlayerId : nextPlayerId,
    winnerPlayerId: res.winner === 'DRAW' ? 'DRAW' : res.winner ? state.currentTurnPlayerId : null,
    winningLine: res.line,
    turnNumber: state.turnNumber + 1,
    board: nextBoard,
    activeSymbol: state.activeSymbol === 'X' ? 'O' : 'X',
    moveHistory: [...state.moveHistory, `${state.activeSymbol} case ${cellIndex + 1}`],
    lastMoveTimestamp: Date.now(),
  };
}

export function getTicTacToeBotMove(
  board: TicTacToeSymbol[],
  symbol: 'X' | 'O',
  difficulty: BotDifficulty = 'medium'
): number {
  const oppSymbol = symbol === 'X' ? 'O' : 'X';
  const empties = board.map((v, i) => (v === null ? i : -1)).filter((i) => i !== -1);
  if (empties.length === 0) return 0;

  // Easy mode: 75% random choice
  if (difficulty === 'easy' && Math.random() < 0.75) {
    return empties[Math.floor(Math.random() * empties.length)];
  }

  // 1. Can win immediately?
  for (const i of empties) {
    const test = [...board];
    test[i] = symbol;
    if (checkTicTacToeWin(test).winner === symbol) return i;
  }

  // 2. Block opponent immediate win?
  if (difficulty !== 'easy' || Math.random() < 0.8) {
    for (const i of empties) {
      const test = [...board];
      test[i] = oppSymbol;
      if (checkTicTacToeWin(test).winner === oppSymbol) return i;
    }
  }

  // 3. Center square priority
  if (board[4] === null) return 4;

  // 4. Corners priority
  const corners = [0, 2, 6, 8].filter((c) => board[c] === null);
  if (corners.length > 0) {
    return corners[Math.floor(Math.random() * corners.length)];
  }

  return empties[0];
}
