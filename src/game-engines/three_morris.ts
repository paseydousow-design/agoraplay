import {
  ThreeMorrisGameState,
  ThreeMorrisPiece,
  BotDifficulty,
} from '../types/game';

// Adjacency connections on the 3x3 board along the 8 alignment lines
// Crucial rule: NO JUMPING over pieces! Only direct connected empty neighbor.
export const THREE_MORRIS_ADJACENCY: Record<number, number[]> = {
  0: [1, 3, 4],
  1: [0, 2, 4],
  2: [1, 4, 5],
  3: [0, 4, 6],
  4: [0, 1, 2, 3, 5, 6, 7, 8], // Center connects to all 8 points
  5: [2, 4, 8],
  6: [3, 4, 7],
  7: [6, 4, 8],
  8: [5, 4, 7],
};

export const THREE_MORRIS_WINNING_LINES = [
  // Rows
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  // Columns
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  // Diagonals
  [0, 4, 8],
  [2, 4, 6],
];

export function createInitialThreeMorrisState(
  p1Id: string,
  p2Id: string = 'p2'
): ThreeMorrisGameState {
  return {
    gameType: 'three_morris',
    status: 'PLAYING',
    currentTurnPlayerId: p1Id,
    turnNumber: 1,
    board: Array(9).fill(null),
    phase: 'placement',
    placedPieces: {
      P1: 0,
      P2: 0,
    },
    activePlayerSymbol: 'P1',
    playerIds: {
      P1: p1Id,
      P2: p2Id,
    },
    selectedCell: null,
    moveHistory: [],
    lastMoveTimestamp: Date.now(),
  };
}

export function checkThreeMorrisWin(board: ThreeMorrisPiece[]): {
  winner: 'P1' | 'P2' | null;
  line?: number[];
} {
  for (const line of THREE_MORRIS_WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  return { winner: null };
}

export function getValidDestinations(board: ThreeMorrisPiece[], fromIndex: number): number[] {
  if (fromIndex < 0 || fromIndex >= 9) return [];
  const neighbors = THREE_MORRIS_ADJACENCY[fromIndex] || [];
  // Only empty neighboring connected cells (no jumping over any piece!)
  return neighbors.filter((idx) => board[idx] === null);
}

export function getLegalMovesForSymbol(
  board: ThreeMorrisPiece[],
  symbol: 'P1' | 'P2',
  phase: 'placement' | 'movement',
  placedCount: number
): { from?: number; to: number }[] {
  if (phase === 'placement' && placedCount < 3) {
    const moves: { to: number }[] = [];
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) moves.push({ to: i });
    }
    return moves;
  }

  // Movement phase: must slide one of the player's 3 pieces to a connected empty neighbor
  const moves: { from: number; to: number }[] = [];
  for (let i = 0; i < 9; i++) {
    if (board[i] === symbol) {
      const dests = getValidDestinations(board, i);
      for (const d of dests) {
        moves.push({ from: i, to: d });
      }
    }
  }
  return moves;
}

export function playThreeMorrisPlacement(
  state: ThreeMorrisGameState,
  cellIndex: number,
  nextTurnPlayerId: string
): ThreeMorrisGameState | null {
  if (state.phase !== 'placement') return null;
  if (cellIndex < 0 || cellIndex >= 9) return null;
  if (state.board[cellIndex] !== null) return null;

  const currentSym = state.activePlayerSymbol;
  const nextBoard = [...state.board];
  nextBoard[cellIndex] = currentSym;

  const updatedPlaced = {
    ...state.placedPieces,
    [currentSym]: state.placedPieces[currentSym] + 1,
  };

  // Check if placement caused instant win
  const winCheck = checkThreeMorrisWin(nextBoard);
  if (winCheck.winner) {
    return {
      ...state,
      board: nextBoard,
      status: 'FINISHED',
      winnerPlayerId: state.currentTurnPlayerId,
      winningLine: winCheck.line,
      turnNumber: state.turnNumber + 1,
      moveHistory: [
        ...state.moveHistory,
        `${currentSym === 'P1' ? 'Joueur 1 (Or)' : 'Joueur 2 (Bleu)'} a posé en case ${cellIndex + 1} - Victoire !`,
      ],
      lastMoveTimestamp: Date.now(),
    };
  }

  // Check if both players placed all 3 pieces
  const isBothPlaced = updatedPlaced.P1 === 3 && updatedPlaced.P2 === 3;
  const nextPhase: 'placement' | 'movement' = isBothPlaced ? 'movement' : 'placement';
  const nextSym: 'P1' | 'P2' = currentSym === 'P1' ? 'P2' : 'P1';

  return {
    ...state,
    board: nextBoard,
    phase: nextPhase,
    placedPieces: updatedPlaced,
    activePlayerSymbol: nextSym,
    currentTurnPlayerId: nextTurnPlayerId,
    selectedCell: null,
    turnNumber: state.turnNumber + 1,
    moveHistory: [
      ...state.moveHistory,
      `${currentSym === 'P1' ? 'Joueur 1 (Or)' : 'Joueur 2 (Bleu)'} a posé en case ${cellIndex + 1}`,
    ],
    lastMoveTimestamp: Date.now(),
  };
}

export function playThreeMorrisMovement(
  state: ThreeMorrisGameState,
  fromIndex: number,
  toIndex: number,
  nextTurnPlayerId: string
): ThreeMorrisGameState | null {
  if (state.phase !== 'movement') return null;
  if (fromIndex < 0 || fromIndex >= 9 || toIndex < 0 || toIndex >= 9) return null;

  const currentSym = state.activePlayerSymbol;
  if (state.board[fromIndex] !== currentSym) return null;
  if (state.board[toIndex] !== null) return null;

  // Verify adjacency (strictly no jumping!)
  const allowedNeighbors = THREE_MORRIS_ADJACENCY[fromIndex] || [];
  if (!allowedNeighbors.includes(toIndex)) return null;

  const nextBoard = [...state.board];
  nextBoard[fromIndex] = null;
  nextBoard[toIndex] = currentSym;

  // Check victory
  const winCheck = checkThreeMorrisWin(nextBoard);
  if (winCheck.winner) {
    return {
      ...state,
      board: nextBoard,
      status: 'FINISHED',
      winnerPlayerId: state.currentTurnPlayerId,
      winningLine: winCheck.line,
      selectedCell: null,
      turnNumber: state.turnNumber + 1,
      moveHistory: [
        ...state.moveHistory,
        `${currentSym === 'P1' ? 'Joueur 1 (Or)' : 'Joueur 2 (Bleu)'} déplace de ${fromIndex + 1} vers ${toIndex + 1} - Victoire !`,
      ],
      lastMoveTimestamp: Date.now(),
    };
  }

  const nextSym: 'P1' | 'P2' = currentSym === 'P1' ? 'P2' : 'P1';

  // Check if next player is completely trapped/blocked (no legal sliding moves)
  const nextPlayerMoves = getLegalMovesForSymbol(
    nextBoard,
    nextSym,
    'movement',
    state.placedPieces[nextSym]
  );

  if (nextPlayerMoves.length === 0) {
    // Next player is immobilized! Current player wins by immobilization
    return {
      ...state,
      board: nextBoard,
      status: 'FINISHED',
      winnerPlayerId: state.currentTurnPlayerId, // current player wins by blocking opponent
      blockedPlayer: nextSym,
      selectedCell: null,
      turnNumber: state.turnNumber + 1,
      moveHistory: [
        ...state.moveHistory,
        `${currentSym === 'P1' ? 'Joueur 1' : 'Joueur 2'} a bloqué tous les pions adverses ! Victoire par étouffement.`,
      ],
      lastMoveTimestamp: Date.now(),
    };
  }

  return {
    ...state,
    board: nextBoard,
    activePlayerSymbol: nextSym,
    currentTurnPlayerId: nextTurnPlayerId,
    selectedCell: null,
    turnNumber: state.turnNumber + 1,
    moveHistory: [
      ...state.moveHistory,
      `${currentSym === 'P1' ? 'Joueur 1' : 'Joueur 2'} déplace de ${fromIndex + 1} vers ${toIndex + 1}`,
    ],
    lastMoveTimestamp: Date.now(),
  };
}

// ----------------- BOT AI -----------------
export function getThreeMorrisBotMove(
  state: ThreeMorrisGameState,
  botSymbol: 'P1' | 'P2',
  difficulty: BotDifficulty = 'medium'
): { action: 'placement'; cell: number } | { action: 'movement'; from: number; to: number } | null {
  const oppSymbol = botSymbol === 'P1' ? 'P2' : 'P1';
  const { board, phase, placedPieces } = state;

  // === 1. PLACEMENT PHASE ===
  if (phase === 'placement') {
    const empties: number[] = [];
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) empties.push(i);
    }
    if (empties.length === 0) return null;

    if (difficulty === 'easy' && Math.random() < 0.65) {
      return {
        action: 'placement',
        cell: empties[Math.floor(Math.random() * empties.length)],
      };
    }

    // A. Can bot win immediately with 3 aligned?
    for (const cell of empties) {
      const testBoard = [...board];
      testBoard[cell] = botSymbol;
      if (checkThreeMorrisWin(testBoard).winner === botSymbol) {
        return { action: 'placement', cell };
      }
    }

    // B. Block opponent from aligning 3?
    for (const cell of empties) {
      const testBoard = [...board];
      testBoard[cell] = oppSymbol;
      if (checkThreeMorrisWin(testBoard).winner === oppSymbol) {
        return { action: 'placement', cell };
      }
    }

    // C. Center priority (case 4 is the most connected node in Three Men's Morris)
    if (board[4] === null) {
      return { action: 'placement', cell: 4 };
    }

    // D. Corners priority
    const corners = [0, 2, 6, 8].filter((c) => board[c] === null);
    if (corners.length > 0) {
      return {
        action: 'placement',
        cell: corners[Math.floor(Math.random() * corners.length)],
      };
    }

    return {
      action: 'placement',
      cell: empties[Math.floor(Math.random() * empties.length)],
    };
  }

  // === 2. MOVEMENT PHASE ===
  const legalMoves = getLegalMovesForSymbol(
    board,
    botSymbol,
    'movement',
    placedPieces[botSymbol]
  );
  if (legalMoves.length === 0) return null;

  if (difficulty === 'easy' && Math.random() < 0.6) {
    const chosen = legalMoves[Math.floor(Math.random() * legalMoves.length)];
    return { action: 'movement', from: chosen.from!, to: chosen.to };
  }

  // A. Check immediate winning move
  for (const move of legalMoves) {
    const testBoard = [...board];
    testBoard[move.from!] = null;
    testBoard[move.to] = botSymbol;
    if (checkThreeMorrisWin(testBoard).winner === botSymbol) {
      return { action: 'movement', from: move.from!, to: move.to };
    }
  }

  // B. Block opponent immediate win:
  // Check if opponent can win next turn, and whether bot can occupy that target cell
  const oppWinningDestinations: number[] = [];
  const oppMoves = getLegalMovesForSymbol(board, oppSymbol, 'movement', placedPieces[oppSymbol]);
  for (const oppMove of oppMoves) {
    const testBoard = [...board];
    testBoard[oppMove.from!] = null;
    testBoard[oppMove.to] = oppSymbol;
    if (checkThreeMorrisWin(testBoard).winner === oppSymbol) {
      oppWinningDestinations.push(oppMove.to);
    }
  }

  if (oppWinningDestinations.length > 0) {
    for (const move of legalMoves) {
      if (oppWinningDestinations.includes(move.to)) {
        return { action: 'movement', from: move.from!, to: move.to };
      }
    }
  }

  // C. Favor moves that move to center (4) or control center
  const centerMoves = legalMoves.filter((m) => m.to === 4);
  if (centerMoves.length > 0 && Math.random() < 0.8) {
    return { action: 'movement', from: centerMoves[0].from!, to: centerMoves[0].to };
  }

  // D. Evaluate mobility and threats
  let bestScore = -9999;
  let bestMove = legalMoves[0];

  for (const move of legalMoves) {
    const testBoard = [...board];
    testBoard[move.from!] = null;
    testBoard[move.to] = botSymbol;

    let score = 0;
    if (move.to === 4) score += 5; // Center bonus
    // Bonus for having adjacent open neighbors (mobility)
    score += getValidDestinations(testBoard, move.to).length * 2;

    // Penalty if leaving a piece undefended or allowing opponent win
    const oppResponses = getLegalMovesForSymbol(testBoard, oppSymbol, 'movement', 3);
    for (const resp of oppResponses) {
      const oppBoard = [...testBoard];
      oppBoard[resp.from!] = null;
      oppBoard[resp.to] = oppSymbol;
      if (checkThreeMorrisWin(oppBoard).winner === oppSymbol) {
        score -= 50; // Opponent can win!
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return { action: 'movement', from: bestMove.from!, to: bestMove.to };
}
