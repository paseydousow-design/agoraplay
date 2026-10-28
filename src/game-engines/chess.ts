import {
  ChessBoardGrid,
  ChessGameState,
  ChessPiece,
  ChessPieceColor,
  ChessPieceType,
  BotDifficulty,
} from '../types/game';

export function createInitialChessBoard(): ChessBoardGrid {
  const board: ChessBoardGrid = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  const backRow: ChessPieceType[] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];

  // Black pieces (top: row 0 & 1)
  for (let c = 0; c < 8; c++) {
    board[0][c] = { type: backRow[c], color: 'b', hasMoved: false };
    board[1][c] = { type: 'p', color: 'b', hasMoved: false };
  }

  // White pieces (bottom: row 7 & 6)
  for (let c = 0; c < 8; c++) {
    board[7][c] = { type: backRow[c], color: 'w', hasMoved: false };
    board[6][c] = { type: 'p', color: 'w', hasMoved: false };
  }

  return board;
}

export function createInitialChessState(whitePlayerId: string): ChessGameState {
  return {
    gameType: 'chess',
    status: 'PLAYING',
    currentTurnPlayerId: whitePlayerId,
    turnNumber: 1,
    board: createInitialChessBoard(),
    activeColor: 'w',
    inCheck: false,
    checkmate: false,
    stalemate: false,
    capturedByWhite: [],
    capturedByBlack: [],
    enPassantTarget: null,
    moveHistory: [],
  };
}

export function cloneChessBoard(board: ChessBoardGrid): ChessBoardGrid {
  return board.map((row) =>
    row.map((cell) => (cell ? { ...cell } : null))
  );
}

// Find king pos
export function findKing(board: ChessBoardGrid, color: ChessPieceColor): [number, number] | null {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.type === 'k' && p.color === color) {
        return [r, c];
      }
    }
  }
  return null;
}

// Check if square is attacked by opposite color
export function isSquareAttacked(
  board: ChessBoardGrid,
  r: number,
  c: number,
  byColor: ChessPieceColor
): boolean {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === byColor) {
        const moves = getPseudoLegalMoves(board, row, col, null, false);
        if (moves.some(([mr, mc]) => mr === r && mc === c)) {
          return true;
        }
      }
    }
  }
  return false;
}

// Check if a color is in check
export function isColorInCheck(board: ChessBoardGrid, color: ChessPieceColor): boolean {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;
  const oppColor: ChessPieceColor = color === 'w' ? 'b' : 'w';
  return isSquareAttacked(board, kingPos[0], kingPos[1], oppColor);
}

// Pseudo-legal moves
export function getPseudoLegalMoves(
  board: ChessBoardGrid,
  r: number,
  c: number,
  enPassantTarget: [number, number] | null = null,
  includeCastling: boolean = true
): [number, number][] {
  const piece = board[r][c];
  if (!piece) return [];
  const moves: [number, number][] = [];
  const color = piece.color;
  const oppColor: ChessPieceColor = color === 'w' ? 'b' : 'w';

  const inBounds = (nr: number, nc: number) => nr >= 0 && nr < 8 && nc >= 0 && nc < 8;

  switch (piece.type) {
    case 'p': {
      const dir = color === 'w' ? -1 : 1;
      const startRow = color === 'w' ? 6 : 1;
      // 1 square forward
      const f1 = r + dir;
      if (inBounds(f1, c) && !board[f1][c]) {
        moves.push([f1, c]);
        // 2 squares forward from start
        const f2 = r + 2 * dir;
        if (r === startRow && inBounds(f2, c) && !board[f2][c]) {
          moves.push([f2, c]);
        }
      }
      // Diagonal captures
      for (const dc of [-1, 1]) {
        const nr = r + dir;
        const nc = c + dc;
        if (inBounds(nr, nc)) {
          const target = board[nr][nc];
          if (target && target.color === oppColor) {
            moves.push([nr, nc]);
          } else if (enPassantTarget && enPassantTarget[0] === nr && enPassantTarget[1] === nc) {
            moves.push([nr, nc]);
          }
        }
      }
      break;
    }

    case 'n': {
      const jumps = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1],
      ];
      for (const [dr, dc] of jumps) {
        const nr = r + dr;
        const nc = c + dc;
        if (inBounds(nr, nc)) {
          const target = board[nr][nc];
          if (!target || target.color === oppColor) {
            moves.push([nr, nc]);
          }
        }
      }
      break;
    }

    case 'b':
    case 'r':
    case 'q': {
      const dirs: [number, number][] = [];
      if (piece.type === 'b' || piece.type === 'q') {
        dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
      }
      if (piece.type === 'r' || piece.type === 'q') {
        dirs.push([-1, 0], [1, 0], [0, -1], [0, 1]);
      }
      for (const [dr, dc] of dirs) {
        let nr = r + dr;
        let nc = c + dc;
        while (inBounds(nr, nc)) {
          const target = board[nr][nc];
          if (!target) {
            moves.push([nr, nc]);
          } else {
            if (target.color === oppColor) {
              moves.push([nr, nc]);
            }
            break;
          }
          nr += dr;
          nc += dc;
        }
      }
      break;
    }

    case 'k': {
      const dirs = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1],
      ];
      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (inBounds(nr, nc)) {
          const target = board[nr][nc];
          if (!target || target.color === oppColor) {
            moves.push([nr, nc]);
          }
        }
      }

      // Castling
      if (includeCastling && !piece.hasMoved && !isColorInCheck(board, color)) {
        const kingRow = color === 'w' ? 7 : 0;
        if (r === kingRow && c === 4) {
          // King-side
          const rookK = board[kingRow][7];
          if (
            rookK &&
            rookK.type === 'r' &&
            !rookK.hasMoved &&
            !board[kingRow][5] &&
            !board[kingRow][6] &&
            !isSquareAttacked(board, kingRow, 5, oppColor) &&
            !isSquareAttacked(board, kingRow, 6, oppColor)
          ) {
            moves.push([kingRow, 6]);
          }
          // Queen-side
          const rookQ = board[kingRow][0];
          if (
            rookQ &&
            rookQ.type === 'r' &&
            !rookQ.hasMoved &&
            !board[kingRow][1] &&
            !board[kingRow][2] &&
            !board[kingRow][3] &&
            !isSquareAttacked(board, kingRow, 2, oppColor) &&
            !isSquareAttacked(board, kingRow, 3, oppColor)
          ) {
            moves.push([kingRow, 2]);
          }
        }
      }
      break;
    }
  }

  return moves;
}

// Get fully legal moves (cannot leave own king in check)
export function getLegalMoves(
  board: ChessBoardGrid,
  r: number,
  c: number,
  enPassantTarget: [number, number] | null = null
): [number, number][] {
  const piece = board[r][c];
  if (!piece) return [];
  const pseudoMoves = getPseudoLegalMoves(board, r, c, enPassantTarget, true);

  return pseudoMoves.filter(([toR, toC]) => {
    const nextBoard = cloneChessBoard(board);
    // Simulate move
    const movingPiece = nextBoard[r][c]!;
    nextBoard[r][c] = null;

    // En passant capture removal
    if (
      movingPiece.type === 'p' &&
      enPassantTarget &&
      toR === enPassantTarget[0] &&
      toC === enPassantTarget[1]
    ) {
      const capR = movingPiece.color === 'w' ? toR + 1 : toR - 1;
      nextBoard[capR][toC] = null;
    }

    nextBoard[toR][toC] = movingPiece;

    // Check if own king is safe
    return !isColorInCheck(nextBoard, movingPiece.color);
  });
}

// Has any legal moves
export function getAllLegalMoves(
  board: ChessBoardGrid,
  color: ChessPieceColor,
  enPassantTarget: [number, number] | null = null
): { from: [number, number]; to: [number, number] }[] {
  const allMoves: { from: [number, number]; to: [number, number] }[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === color) {
        const legals = getLegalMoves(board, r, c, enPassantTarget);
        for (const to of legals) {
          allMoves.push({ from: [r, c], to });
        }
      }
    }
  }
  return allMoves;
}

// Algebraic notation
export function toAlgebraic(
  board: ChessBoardGrid,
  from: [number, number],
  to: [number, number],
  promotionPiece?: ChessPieceType
): string {
  const piece = board[from[0]][from[1]];
  if (!piece) return '';
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  // Castling
  if (piece.type === 'k' && Math.abs(to[1] - from[1]) === 2) {
    return to[1] > from[1] ? 'O-O' : 'O-O-O';
  }

  const destSquare = `${files[to[1]]}${ranks[to[0]]}`;
  const isCapture = !!board[to[0]][to[1]];

  let notation = '';
  if (piece.type === 'p') {
    if (isCapture || from[1] !== to[1]) {
      notation = `${files[from[1]]}x${destSquare}`;
    } else {
      notation = destSquare;
    }
    if (promotionPiece) {
      notation += `=${promotionPiece.toUpperCase()}`;
    }
  } else {
    notation = `${piece.type.toUpperCase()}${isCapture ? 'x' : ''}${destSquare}`;
  }

  return notation;
}

// Execute move and return new state
export function executeChessMove(
  state: ChessGameState,
  from: [number, number],
  to: [number, number],
  promotionPiece: ChessPieceType = 'q',
  nextPlayerId: string
): ChessGameState | null {
  const piece = state.board[from[0]][from[1]];
  if (!piece || piece.color !== state.activeColor) return null;

  const legalMoves = getLegalMoves(state.board, from[0], from[1], state.enPassantTarget);
  const isValid = legalMoves.some(([r, c]) => r === to[0] && c === to[1]);
  if (!isValid) return null;

  const nextBoard = cloneChessBoard(state.board);
  const capturedByWhite = [...state.capturedByWhite];
  const capturedByBlack = [...state.capturedByBlack];
  let nextEnPassant: [number, number] | null = null;

  const movingPiece = { ...piece, hasMoved: true };
  nextBoard[from[0]][from[1]] = null;

  // Capture
  const targetPiece = nextBoard[to[0]][to[1]];
  if (targetPiece) {
    if (movingPiece.color === 'w') {
      capturedByWhite.push(targetPiece.type);
    } else {
      capturedByBlack.push(targetPiece.type);
    }
  }

  // En passant capture
  if (
    movingPiece.type === 'p' &&
    state.enPassantTarget &&
    to[0] === state.enPassantTarget[0] &&
    to[1] === state.enPassantTarget[1]
  ) {
    const capR = movingPiece.color === 'w' ? to[0] + 1 : to[0] - 1;
    const enPassantPawn = nextBoard[capR][to[1]];
    if (enPassantPawn) {
      if (movingPiece.color === 'w') capturedByWhite.push('p');
      else capturedByBlack.push('p');
      nextBoard[capR][to[1]] = null;
    }
  }

  // Pawn 2-square step -> set en passant target
  if (movingPiece.type === 'p' && Math.abs(to[0] - from[0]) === 2) {
    nextEnPassant = [(from[0] + to[0]) / 2, from[1]];
  }

  // Castling rook move
  if (movingPiece.type === 'k' && Math.abs(to[1] - from[1]) === 2) {
    const row = to[0];
    if (to[1] === 6) {
      // King-side
      const rook = nextBoard[row][7];
      if (rook) {
        nextBoard[row][7] = null;
        nextBoard[row][5] = { ...rook, hasMoved: true };
      }
    } else if (to[1] === 2) {
      // Queen-side
      const rook = nextBoard[row][0];
      if (rook) {
        nextBoard[row][0] = null;
        nextBoard[row][3] = { ...rook, hasMoved: true };
      }
    }
  }

  // Promotion
  const promoRow = movingPiece.color === 'w' ? 0 : 7;
  const isPromoted = movingPiece.type === 'p' && to[0] === promoRow;
  if (isPromoted) {
    movingPiece.type = promotionPiece;
  }

  nextBoard[to[0]][to[1]] = movingPiece;

  const oppColor: ChessPieceColor = state.activeColor === 'w' ? 'b' : 'w';
  const oppInCheck = isColorInCheck(nextBoard, oppColor);
  const oppLegalMoves = getAllLegalMoves(nextBoard, oppColor, nextEnPassant);

  const checkmate = oppInCheck && oppLegalMoves.length === 0;
  const stalemate = !oppInCheck && oppLegalMoves.length === 0;

  const moveNot =
    toAlgebraic(state.board, from, to, isPromoted ? promotionPiece : undefined) +
    (checkmate ? '#' : oppInCheck ? '+' : '');

  let status: 'WAITING' | 'PLAYING' | 'FINISHED' = 'PLAYING';
  let winnerPlayerId: string | 'DRAW' | null = null;

  if (checkmate) {
    status = 'FINISHED';
    winnerPlayerId = state.currentTurnPlayerId;
  } else if (stalemate) {
    status = 'FINISHED';
    winnerPlayerId = 'DRAW';
  }

  return {
    gameType: 'chess',
    status,
    currentTurnPlayerId: nextPlayerId,
    winnerPlayerId,
    turnNumber: state.turnNumber + 1,
    board: nextBoard,
    activeColor: oppColor,
    inCheck: oppInCheck,
    checkmate,
    stalemate,
    capturedByWhite,
    capturedByBlack,
    enPassantTarget: nextEnPassant,
    moveHistory: [...state.moveHistory, moveNot],
    lastMoveTimestamp: Date.now(),
  };
}

// AI Minimax evaluation
const pieceWeights: Record<ChessPieceType, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

export function getChessBotMove(
  board: ChessBoardGrid,
  color: ChessPieceColor,
  enPassantTarget: [number, number] | null,
  difficulty: BotDifficulty = 'medium'
): { from: [number, number]; to: [number, number] } | null {
  const legalMoves = getAllLegalMoves(board, color, enPassantTarget);
  if (legalMoves.length === 0) return null;

  // Easy mode: 60% chance to pick a random move without evaluation
  if (difficulty === 'easy') {
    if (Math.random() < 0.6) {
      return legalMoves[Math.floor(Math.random() * legalMoves.length)];
    }
  }

  const oppColor: ChessPieceColor = color === 'w' ? 'b' : 'w';
  let bestScore = -Infinity;
  let bestMove = legalMoves[0];

  for (const m of legalMoves) {
    let score = 0;
    const movingPiece = board[m.from[0]][m.from[1]];
    const target = board[m.to[0]][m.to[1]];

    if (target) {
      score += pieceWeights[target.type] * 10;
    }

    // Favor center control
    const distToCenter = Math.abs(3.5 - m.to[0]) + Math.abs(3.5 - m.to[1]);
    score += (7 - distToCenter) * 3;

    // Hard mode: Advanced safety & tactical lookahead
    if (difficulty === 'hard') {
      // Check if destination square is attacked by opponent
      if (isSquareAttacked(board, m.to[0], m.to[1], oppColor)) {
        if (movingPiece) {
          // Penalize giving away piece without capture compensation
          score -= pieceWeights[movingPiece.type] * 8;
        }
      }

      // Check if moving piece leaves check on opponent
      const simulatedBoard = cloneChessBoard(board);
      simulatedBoard[m.to[0]][m.to[1]] = simulatedBoard[m.from[0]][m.from[1]];
      simulatedBoard[m.from[0]][m.from[1]] = null;
      if (isColorInCheck(simulatedBoard, oppColor)) {
        score += 80; // Bonus for checking opponent
      }

      // Bonus for pawn advancement towards promotion
      if (movingPiece?.type === 'p') {
        const advancement = color === 'b' ? m.to[0] : 7 - m.to[0];
        score += advancement * 12;
      }
    }

    // Small random factor so game is not completely deterministic
    const noise = difficulty === 'hard' ? 3 : difficulty === 'easy' ? 25 : 8;
    score += Math.random() * noise;

    if (score > bestScore) {
      bestScore = score;
      bestMove = m;
    }
  }

  return bestMove;
}
