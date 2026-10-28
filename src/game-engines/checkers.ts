import {
  CheckerPieceColor,
  CheckersGameState,
  CheckersGrid,
  CheckersVariant,
  BotDifficulty,
} from '../types/game';

/**
 * Creates initial checkers board.
 * - 8x8 (Standard 64 cases) : 3 rows of 4 pawns = 12 pawns per player
 * - 10x10 (Grand Damier Sénégalais / International 100 cases) : 4 rows of 5 pawns = 20 pawns per player
 */
export function createInitialCheckersBoard(size: 8 | 10 = 8): CheckersGrid {
  const board: CheckersGrid = Array(size)
    .fill(null)
    .map(() => Array(size).fill(null));

  const rowsPerSide = size === 10 ? 4 : 3;

  // Red at top rows on dark squares ((r + c) % 2 === 1)
  for (let r = 0; r < rowsPerSide; r++) {
    for (let c = 0; c < size; c++) {
      if ((r + c) % 2 === 1) {
        board[r][c] = { id: `r-${r}-${c}`, color: 'red', isKing: false };
      }
    }
  }

  // Black at bottom rows on dark squares
  for (let r = size - rowsPerSide; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if ((r + c) % 2 === 1) {
        board[r][c] = { id: `b-${r}-${c}`, color: 'black', isKing: false };
      }
    }
  }

  return board;
}

export function createInitialCheckersState(
  blackPlayerId: string,
  variant: CheckersVariant = 'senegalese',
  size: 8 | 10 = 8
): CheckersGameState {
  return {
    gameType: 'checkers',
    status: 'PLAYING',
    currentTurnPlayerId: blackPlayerId,
    turnNumber: 1,
    boardSize: size,
    board: createInitialCheckersBoard(size),
    activeColor: 'black',
    variant,
    capturedRed: 0,
    capturedBlack: 0,
    consecutiveJumpPiecePos: null,
    moveHistory: [],
  };
}

export interface CheckersMove {
  from: [number, number];
  to: [number, number];
  isJump: boolean;
  jumpedPiecePos?: [number, number];
}

export function cloneCheckersBoard(board: CheckersGrid): CheckersGrid {
  return board.map((row) =>
    row.map((cell) => (cell ? { ...cell } : null))
  );
}

// Get all possible jumps for a piece at [r, c]
export function getPieceJumps(
  board: CheckersGrid,
  r: number,
  c: number,
  variant: CheckersVariant = 'senegalese'
): CheckersMove[] {
  const piece = board[r][c];
  if (!piece) return [];
  const jumps: CheckersMove[] = [];
  const oppColor: CheckerPieceColor = piece.color === 'black' ? 'red' : 'black';
  const size = board.length;

  // 1. Simple pawn (non-king)
  if (!piece.isKing) {
    // In Senegalese / International draughts: pawns capture BOTH forward AND backward!
    // In Classic Anglo-American: pawns capture only forward.
    const directions =
      variant === 'classic'
        ? piece.color === 'black'
          ? [[-1, -1], [-1, 1]] // forward up
          : [[1, -1], [1, 1]]   // forward down
        : [[-1, -1], [-1, 1], [1, -1], [1, 1]]; // ALL 4 diagonals (forward AND backward)

    for (const [dr, dc] of directions) {
      const midR = r + dr;
      const midC = c + dc;
      const landR = r + 2 * dr;
      const landC = c + 2 * dc;

      if (landR >= 0 && landR < size && landC >= 0 && landC < size) {
        const midPiece = board[midR][midC];
        const landCell = board[landR][landC];

        if (midPiece && midPiece.color === oppColor && !landCell) {
          jumps.push({
            from: [r, c],
            to: [landR, landC],
            isJump: true,
            jumpedPiecePos: [midR, midC],
          });
        }
      }
    }
  } else {
    // 2. King piece
    if (variant === 'classic') {
      const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
      for (const [dr, dc] of directions) {
        const midR = r + dr;
        const midC = c + dc;
        const landR = r + 2 * dr;
        const landC = c + 2 * dc;

        if (landR >= 0 && landR < size && landC >= 0 && landC < size) {
          const midPiece = board[midR][midC];
          const landCell = board[landR][landC];

          if (midPiece && midPiece.color === oppColor && !landCell) {
            jumps.push({
              from: [r, c],
              to: [landR, landC],
              isJump: true,
              jumpedPiecePos: [midR, midC],
            });
          }
        }
      }
    } else {
      // Flying King (Dame Volante) in Senegalese & International rules:
      // Can slide along diagonal, jump over 1 opponent piece at any distance,
      // and land on ANY empty square behind it!
      const dirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
      for (const [dr, dc] of dirs) {
        let step = 1;
        let foundOpponentPos: [number, number] | null = null;

        while (true) {
          const checkR = r + step * dr;
          const checkC = c + step * dc;
          if (checkR < 0 || checkR >= size || checkC < 0 || checkC >= size) break;

          const cellPiece = board[checkR][checkC];

          if (!foundOpponentPos) {
            if (cellPiece) {
              if (cellPiece.color === oppColor) {
                foundOpponentPos = [checkR, checkC];
              } else {
                // Own piece blocks diagonal
                break;
              }
            }
          } else {
            // Already leaped over opponent piece; can land on any subsequent free cell
            if (!cellPiece) {
              jumps.push({
                from: [r, c],
                to: [checkR, checkC],
                isJump: true,
                jumpedPiecePos: foundOpponentPos,
              });
            } else {
              // Blocked by another piece beyond
              break;
            }
          }
          step++;
        }
      }
    }
  }

  return jumps;
}

// Get non-jump regular moves for piece
export function getPieceSimpleMoves(
  board: CheckersGrid,
  r: number,
  c: number,
  variant: CheckersVariant = 'senegalese'
): CheckersMove[] {
  const piece = board[r][c];
  if (!piece) return [];
  const moves: CheckersMove[] = [];
  const size = board.length;

  if (!piece.isKing) {
    const directions =
      piece.color === 'black'
        ? [[-1, -1], [-1, 1]] // forward up
        : [[1, -1], [1, 1]];  // forward down

    for (const [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
        if (!board[nr][nc]) {
          moves.push({
            from: [r, c],
            to: [nr, nc],
            isJump: false,
          });
        }
      }
    }
  } else {
    // King piece
    if (variant === 'classic') {
      const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
      for (const [dr, dc] of directions) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size && !board[nr][nc]) {
          moves.push({
            from: [r, c],
            to: [nr, nc],
            isJump: false,
          });
        }
      }
    } else {
      // Flying King slide (Dame Volante)
      const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
      for (const [dr, dc] of directions) {
        let step = 1;
        while (true) {
          const nr = r + step * dr;
          const nc = c + step * dc;
          if (nr < 0 || nr >= size || nc < 0 || nc >= size) break;
          if (board[nr][nc]) break; // blocked
          moves.push({
            from: [r, c],
            to: [nr, nc],
            isJump: false,
          });
          step++;
        }
      }
    }
  }

  return moves;
}

// Get all legal moves for active color (jumps mandatory if any exists)
export function getAllCheckersMoves(
  board: CheckersGrid,
  color: CheckerPieceColor,
  consecutivePos?: [number, number] | null,
  variant: CheckersVariant = 'senegalese'
): CheckersMove[] {
  // If in consecutive jump, only that piece can move
  if (consecutivePos) {
    return getPieceJumps(board, consecutivePos[0], consecutivePos[1], variant);
  }

  const allJumps: CheckersMove[] = [];
  const allSimple: CheckersMove[] = [];
  const size = board.length;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const p = board[r][c];
      if (p && p.color === color) {
        allJumps.push(...getPieceJumps(board, r, c, variant));
        allSimple.push(...getPieceSimpleMoves(board, r, c, variant));
      }
    }
  }

  // Mandatory capture rule: if any jump is possible, only jumps are legal
  if (allJumps.length > 0) {
    return allJumps;
  }
  return allSimple;
}

export function executeCheckersMove(
  state: CheckersGameState,
  move: CheckersMove,
  nextPlayerId: string
): CheckersGameState | null {
  const variant = state.variant || 'senegalese';
  const size = state.board.length;
  const legalMoves = getAllCheckersMoves(
    state.board,
    state.activeColor,
    state.consecutiveJumpPiecePos,
    variant
  );

  const isValid = legalMoves.some(
    (m) =>
      m.from[0] === move.from[0] &&
      m.from[1] === move.from[1] &&
      m.to[0] === move.to[0] &&
      m.to[1] === move.to[1]
  );
  if (!isValid) return null;

  const nextBoard = cloneCheckersBoard(state.board);
  const movingPiece = { ...nextBoard[move.from[0]][move.from[1]]! };
  nextBoard[move.from[0]][move.from[1]] = null;

  let capturedRed = state.capturedRed;
  let capturedBlack = state.capturedBlack;

  if (move.isJump && move.jumpedPiecePos) {
    const jumped = nextBoard[move.jumpedPiecePos[0]][move.jumpedPiecePos[1]];
    if (jumped) {
      if (jumped.color === 'red') capturedRed++;
      else capturedBlack++;
      nextBoard[move.jumpedPiecePos[0]][move.jumpedPiecePos[1]] = null;
    }
  }

  // King promotion: row 0 for black, row size - 1 for red
  const promoRow = movingPiece.color === 'black' ? 0 : size - 1;
  let promoted = false;
  if (!movingPiece.isKing && move.to[0] === promoRow) {
    movingPiece.isKing = true;
    promoted = true;
  }

  nextBoard[move.to[0]][move.to[1]] = movingPiece;

  // Check for consecutive jump if it was a jump and not just promoted
  let consecutiveJumpPos: [number, number] | null = null;
  if (move.isJump && !promoted) {
    const nextJumps = getPieceJumps(nextBoard, move.to[0], move.to[1], variant);
    if (nextJumps.length > 0) {
      consecutiveJumpPos = move.to;
    }
  }

  const oppColor: CheckerPieceColor = state.activeColor === 'black' ? 'red' : 'black';
  const hasConsecutive = consecutiveJumpPos !== null;

  const activeColor = hasConsecutive ? state.activeColor : oppColor;
  const currentTurnPlayerId = hasConsecutive ? state.currentTurnPlayerId : nextPlayerId;

  // Check if oppColor has moves left (or if someone won)
  const oppMoves = getAllCheckersMoves(nextBoard, oppColor, null, variant);
  let remainingRed = 0;
  let remainingBlack = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const p = nextBoard[r][c];
      if (p?.color === 'red') remainingRed++;
      if (p?.color === 'black') remainingBlack++;
    }
  }

  let status: 'PLAYING' | 'FINISHED' = 'PLAYING';
  let winnerPlayerId: string | null = null;

  if (remainingRed === 0 || (oppColor === 'red' && !hasConsecutive && oppMoves.length === 0)) {
    status = 'FINISHED';
    winnerPlayerId = state.activeColor === 'black' ? state.currentTurnPlayerId : nextPlayerId;
  } else if (remainingBlack === 0 || (oppColor === 'black' && !hasConsecutive && oppMoves.length === 0)) {
    status = 'FINISHED';
    winnerPlayerId = state.activeColor === 'red' ? state.currentTurnPlayerId : nextPlayerId;
  }

  const colLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const moveStr = `${colLetters[move.from[1]]}${size - move.from[0]}${move.isJump ? 'x' : '-'}${colLetters[move.to[1]]}${size - move.to[0]}`;

  return {
    gameType: 'checkers',
    status,
    currentTurnPlayerId,
    winnerPlayerId,
    turnNumber: hasConsecutive ? state.turnNumber : state.turnNumber + 1,
    board: nextBoard,
    boardSize: size as 8 | 10,
    activeColor,
    variant,
    capturedRed,
    capturedBlack,
    consecutiveJumpPiecePos: consecutiveJumpPos,
    moveHistory: [...state.moveHistory, moveStr],
    lastMoveTimestamp: Date.now(),
  };
}

export function getCheckersBotMove(
  board: CheckersGrid,
  color: CheckerPieceColor,
  consecutivePos?: [number, number] | null,
  variant: CheckersVariant = 'senegalese',
  difficulty: BotDifficulty = 'medium'
): CheckersMove | null {
  const legalMoves = getAllCheckersMoves(board, color, consecutivePos, variant);
  if (legalMoves.length === 0) return null;
  const size = board.length;

  // Easy mode: 50% chance to select a random move
  if (difficulty === 'easy' && Math.random() < 0.5) {
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }

  let bestScore = -Infinity;
  let bestMove = legalMoves[0];

  for (const m of legalMoves) {
    let score = 0;
    if (m.isJump) score += 60;
    const promoRow = color === 'black' ? 0 : size - 1;
    if (m.to[0] === promoRow) score += 35;

    // Favor center control
    const centerDist = Math.abs((size / 2 - 0.5) - m.to[1]);
    score += (size / 2 - centerDist) * 3;

    // Hard mode: Avoid leaving piece vulnerable and preserve back row defense
    if (difficulty === 'hard') {
      // Protect back row
      if ((color === 'red' && m.from[0] === 0) || (color === 'black' && m.from[0] === size - 1)) {
        score -= 10;
      }

      // Edge safety bonus
      if (m.to[1] === 0 || m.to[1] === size - 1) {
        score += 8;
      }

      // Multi-jump setup preference
      if (m.isJump) {
        score += 25;
      }
    }

    const noise = difficulty === 'hard' ? 2 : difficulty === 'easy' ? 20 : 6;
    score += Math.random() * noise;

    if (score > bestScore) {
      bestScore = score;
      bestMove = m;
    }
  }

  return bestMove;
}
