import { Connect4Disc, Connect4GameState, BotDifficulty } from '../types/game';

export const C4_ROWS = 6;
export const C4_COLS = 7;

export function createInitialConnect4Grid(): Connect4Disc[][] {
  return Array(C4_ROWS)
    .fill(null)
    .map(() => Array(C4_COLS).fill(null));
}

export function createInitialConnect4State(redPlayerId: string): Connect4GameState {
  return {
    gameType: 'connect4',
    status: 'PLAYING',
    currentTurnPlayerId: redPlayerId,
    turnNumber: 1,
    grid: createInitialConnect4Grid(),
    activeDisc: 'red',
    moveHistory: [],
  };
}

export function checkConnect4Win(grid: Connect4Disc[][]): { winner: 'red' | 'yellow' | 'DRAW' | null; coords?: [number, number][] } {
  // Check horizontal
  for (let r = 0; r < C4_ROWS; r++) {
    for (let c = 0; c < C4_COLS - 3; c++) {
      const disc = grid[r][c];
      if (disc && disc === grid[r][c + 1] && disc === grid[r][c + 2] && disc === grid[r][c + 3]) {
        return {
          winner: disc,
          coords: [
            [r, c],
            [r, c + 1],
            [r, c + 2],
            [r, c + 3],
          ],
        };
      }
    }
  }

  // Check vertical
  for (let r = 0; r < C4_ROWS - 3; r++) {
    for (let c = 0; c < C4_COLS; c++) {
      const disc = grid[r][c];
      if (disc && disc === grid[r + 1][c] && disc === grid[r + 2][c] && disc === grid[r + 3][c]) {
        return {
          winner: disc,
          coords: [
            [r, c],
            [r + 1, c],
            [r + 2, c],
            [r + 3, c],
          ],
        };
      }
    }
  }

  // Check diagonal down-right
  for (let r = 0; r < C4_ROWS - 3; r++) {
    for (let c = 0; c < C4_COLS - 3; c++) {
      const disc = grid[r][c];
      if (disc && disc === grid[r + 1][c + 1] && disc === grid[r + 2][c + 2] && disc === grid[r + 3][c + 3]) {
        return {
          winner: disc,
          coords: [
            [r, c],
            [r + 1, c + 1],
            [r + 2, c + 2],
            [r + 3, c + 3],
          ],
        };
      }
    }
  }

  // Check diagonal down-left
  for (let r = 0; r < C4_ROWS - 3; r++) {
    for (let c = 3; c < C4_COLS; c++) {
      const disc = grid[r][c];
      if (disc && disc === grid[r + 1][c - 1] && disc === grid[r + 2][c - 2] && disc === grid[r + 3][c - 3]) {
        return {
          winner: disc,
          coords: [
            [r, c],
            [r + 1, c - 1],
            [r + 2, c - 2],
            [r + 3, c - 3],
          ],
        };
      }
    }
  }

  // Check full / draw
  const isFull = grid[0].every((cell) => cell !== null);
  if (isFull) {
    return { winner: 'DRAW' };
  }

  return { winner: null };
}

export function dropConnect4Disc(
  state: Connect4GameState,
  colIndex: number,
  nextPlayerId: string
): Connect4GameState | null {
  if (colIndex < 0 || colIndex >= C4_COLS) return null;
  if (state.grid[0][colIndex] !== null) return null; // column full

  const nextGrid = state.grid.map((row) => [...row]);
  let placedRow = -1;

  for (let r = C4_ROWS - 1; r >= 0; r--) {
    if (nextGrid[r][colIndex] === null) {
      nextGrid[r][colIndex] = state.activeDisc;
      placedRow = r;
      break;
    }
  }

  if (placedRow === -1) return null;

  const winResult = checkConnect4Win(nextGrid);
  const isOver = winResult.winner !== null;

  return {
    gameType: 'connect4',
    status: isOver ? 'FINISHED' : 'PLAYING',
    currentTurnPlayerId: isOver ? state.currentTurnPlayerId : nextPlayerId,
    winnerPlayerId: winResult.winner === 'DRAW' ? 'DRAW' : winResult.winner ? state.currentTurnPlayerId : null,
    winningCoords: winResult.coords,
    turnNumber: state.turnNumber + 1,
    grid: nextGrid,
    activeDisc: state.activeDisc === 'red' ? 'yellow' : 'red',
    moveHistory: [...state.moveHistory, `${state.activeDisc.toUpperCase()} en col ${colIndex + 1}`],
    lastMoveTimestamp: Date.now(),
  };
}

export function getConnect4BotCol(
  grid: Connect4Disc[][],
  disc: 'red' | 'yellow',
  difficulty: BotDifficulty = 'medium'
): number {
  const oppDisc = disc === 'red' ? 'yellow' : 'red';
  const availableCols: number[] = [];
  for (let c = 0; c < C4_COLS; c++) {
    if (grid[0][c] === null) availableCols.push(c);
  }
  if (availableCols.length === 0) return 0;

  // Easy mode: 70% chance of random pick
  if (difficulty === 'easy' && Math.random() < 0.7) {
    return availableCols[Math.floor(Math.random() * availableCols.length)];
  }

  // Helper to find landing row in a column
  const getLandingRow = (g: Connect4Disc[][], c: number) => {
    for (let r = C4_ROWS - 1; r >= 0; r--) {
      if (g[r][c] === null) return r;
    }
    return -1;
  };

  // 1. Check if can win immediately
  for (const c of availableCols) {
    const testGrid = grid.map((r) => [...r]);
    const r = getLandingRow(testGrid, c);
    if (r !== -1) {
      testGrid[r][c] = disc;
      if (checkConnect4Win(testGrid).winner === disc) return c;
    }
  }

  // 2. Block opponent immediate win (unless easy mode)
  if (difficulty !== 'easy' || Math.random() < 0.8) {
    for (const c of availableCols) {
      const testGrid = grid.map((r) => [...r]);
      const r = getLandingRow(testGrid, c);
      if (r !== -1) {
        testGrid[r][c] = oppDisc;
        if (checkConnect4Win(testGrid).winner === oppDisc) return c;
      }
    }
  }

  // 3. Hard mode: Lookahead to avoid blunder (giving opponent a win directly above our piece)
  let safeCols = [...availableCols];
  if (difficulty === 'hard') {
    safeCols = availableCols.filter((c) => {
      const testGrid = grid.map((r) => [...r]);
      const r = getLandingRow(testGrid, c);
      if (r > 0) {
        testGrid[r][c] = disc;
        testGrid[r - 1][c] = oppDisc; // opponent could play directly above!
        if (checkConnect4Win(testGrid).winner === oppDisc) {
          return false; // Dangerous: opponent wins next turn!
        }
      }
      return true;
    });
    if (safeCols.length === 0) safeCols = availableCols; // All cols give win, fall back
  }

  // 4. Prefer center columns
  const priority = [3, 2, 4, 1, 5, 0, 6];
  for (const p of priority) {
    if (safeCols.includes(p)) return p;
  }

  return safeCols[0] ?? availableCols[0];
}
