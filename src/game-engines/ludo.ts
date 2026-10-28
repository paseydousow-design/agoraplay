import { LudoColor, LudoGameState, LudoToken, LudoMode, BotDifficulty } from '../types/game';

export const LUDO_COLORS: LudoColor[] = ['red', 'green', 'yellow', 'blue'];

// Start indices along the 52-square outer track
export const LUDO_START_INDICES: Record<LudoColor, number> = {
  red: 0,     // Row 6, Col 1 (Red exit square with red arrow ->)
  green: 13,  // Row 1, Col 8 (Green exit square with green arrow v)
  yellow: 26, // Row 8, Col 13 (Yellow exit square with yellow arrow <-)
  blue: 39,   // Row 13, Col 6 (Blue exit square with blue arrow ^)
};

// Safe squares: 4 starting squares + 4 intermediate star squares
export const SAFE_SQUARES = [0, 8, 13, 21, 26, 34, 39, 47];

export function createInitialLudoTokens(colors: LudoColor[]): Record<LudoColor, LudoToken[]> {
  const tokens: Record<LudoColor, LudoToken[]> = {
    red: [],
    green: [],
    yellow: [],
    blue: [],
  };

  for (const c of colors) {
    tokens[c] = [0, 1, 2, 3].map((id) => ({
      id,
      color: c,
      position: -1, // -1 means in corner home yard socket
    }));
  }

  return tokens;
}

export function createInitialLudoState(
  playerIds: string[],
  colors: LudoColor[] = ['red', 'green', 'yellow', 'blue'],
  mode: LudoMode = 'classic'
): LudoGameState {
  const chosenColors = colors.slice(0, playerIds.length);
  return {
    gameType: 'ludo',
    status: 'PLAYING',
    currentTurnPlayerId: playerIds[0],
    turnNumber: 1,
    playerColors: chosenColors,
    tokens: createInitialLudoTokens(chosenColors),
    diceValue: null,
    hasRolledDice: false,
    canRollDice: true,
    activeColorIndex: 0,
    lastDiceRolls: [],
    finishedRank: [],
    ludoMode: mode,
    targetTokensToWin: mode === 'quick' ? 1 : 4,
    hasCapturedOpponent: {
      red: false,
      green: false,
      yellow: false,
      blue: false,
    },
    consecutiveSixCount: 0,
    bonusRollEarned: false,
    moveHistory: [],
  };
}

// Convert internal stepsTraveled to board coordinate
// stepsTraveled:
// -1: Yard
// 0..50: Main ring square = (start + steps) % 52
// 51..55: Home runway step (0..4)
// 56 / 999: Reached center goal
export function getLudoBoardSquare(
  color: LudoColor,
  steps: number
): { type: 'yard' | 'track' | 'runway' | 'goal'; index: number } {
  if (steps === -1) return { type: 'yard', index: -1 };
  if (steps >= 56 || steps === 999) return { type: 'goal', index: 999 };
  if (steps >= 51) return { type: 'runway', index: steps - 51 };
  const startIndex = LUDO_START_INDICES[color];
  return { type: 'track', index: (startIndex + steps) % 52 };
}

// Check which tokens of active color can move with given dice roll
export function getPlayableLudoTokens(
  tokens: Record<LudoColor, LudoToken[]>,
  color: LudoColor,
  dice: number,
  ludoMode: LudoMode = 'classic',
  hasCaptured = false
): LudoToken[] {
  const playerTokens = tokens[color] || [];
  const playable: LudoToken[] = [];

  for (const token of playerTokens) {
    // If token in yard: can only exit if dice is 6
    if (token.position === -1) {
      if (dice === 6) {
        playable.push(token);
      }
    } else if (token.position !== 999 && token.position < 56) {
      const nextPos = token.position + dice;

      // In Master mode, must have captured an opponent to enter runway (position > 50)
      if (ludoMode === 'master' && !hasCaptured && nextPos > 50) {
        continue;
      }

      // Token on track or runway: can move if position + dice <= 56
      if (nextPos <= 56) {
        playable.push(token);
      }
    }
  }

  return playable;
}

export function executeLudoDiceRoll(
  state: LudoGameState,
  forcedRoll?: number,
  playerIds?: string[]
): { nextState: LudoGameState; mustChooseToken: boolean } {
  if (!state.canRollDice) return { nextState: state, mustChooseToken: false };

  const roll = forcedRoll || Math.floor(Math.random() * 6) + 1;
  const activeColor = state.playerColors[state.activeColorIndex];
  const hasCaptured = state.hasCapturedOpponent?.[activeColor] || false;
  const mode = state.ludoMode || 'classic';

  // Ludo King rule: Track consecutive sixes
  const prevSixes = state.consecutiveSixCount || 0;
  const newSixes = roll === 6 ? prevSixes + 1 : 0;

  // Ludo King 3 consecutive sixes penalty rule: turn is lost!
  if (newSixes === 3) {
    let nextIndex = (state.activeColorIndex + 1) % state.playerColors.length;
    let loops = 0;
    while (state.finishedRank.includes(state.playerColors[nextIndex]) && loops < state.playerColors.length) {
      nextIndex = (nextIndex + 1) % state.playerColors.length;
      loops++;
    }

    const nextPlayerId =
      playerIds && playerIds.length > 0
        ? playerIds[nextIndex] || playerIds[0]
        : state.currentTurnPlayerId;

    return {
      nextState: {
        ...state,
        diceValue: roll,
        hasRolledDice: false,
        canRollDice: true,
        consecutiveSixCount: 0,
        activeColorIndex: nextIndex,
        currentTurnPlayerId: nextPlayerId,
        lastDiceRolls: [roll, ...state.lastDiceRolls.slice(0, 4)],
        moveHistory: [
          ...state.moveHistory,
          `⚡ ${activeColor.toUpperCase()} a fait 3 Six consécutifs ! Tour annulé (règle Ludo King).`,
        ],
      },
      mustChooseToken: false,
    };
  }

  const playableTokens = getPlayableLudoTokens(
    state.tokens,
    activeColor,
    roll,
    mode,
    hasCaptured
  );

  const updatedState: LudoGameState = {
    ...state,
    diceValue: roll,
    hasRolledDice: true,
    canRollDice: false,
    consecutiveSixCount: newSixes,
    lastDiceRolls: [roll, ...state.lastDiceRolls.slice(0, 4)],
  };

  // If no playable tokens exist, advance turn immediately
  if (playableTokens.length === 0) {
    let nextIndex = (state.activeColorIndex + 1) % state.playerColors.length;
    let loops = 0;
    while (state.finishedRank.includes(state.playerColors[nextIndex]) && loops < state.playerColors.length) {
      nextIndex = (nextIndex + 1) % state.playerColors.length;
      loops++;
    }

    const nextPlayerId =
      playerIds && playerIds.length > 0
        ? playerIds[nextIndex] || playerIds[0]
        : state.currentTurnPlayerId;

    return {
      nextState: {
        ...updatedState,
        canRollDice: true,
        hasRolledDice: false,
        consecutiveSixCount: 0,
        activeColorIndex: nextIndex,
        currentTurnPlayerId: nextPlayerId,
        moveHistory: [
          ...state.moveHistory,
          `${activeColor.toUpperCase()} a fait ${roll} (aucun coup possible) - Tour passé`,
        ],
      },
      mustChooseToken: false,
    };
  }

  return {
    nextState: updatedState,
    mustChooseToken: true,
  };
}

export function executeLudoTokenMove(
  state: LudoGameState,
  tokenId: number,
  playerIds: string[]
): LudoGameState {
  const activeColor = state.playerColors[state.activeColorIndex];
  const roll = state.diceValue;
  if (!roll || !state.hasRolledDice) return state;

  const currentToken = state.tokens[activeColor]?.find((t) => t.id === tokenId);
  if (!currentToken) return state;

  // Clone tokens
  const nextTokens: Record<LudoColor, LudoToken[]> = {
    red: state.tokens.red.map((t) => ({ ...t })),
    green: state.tokens.green.map((t) => ({ ...t })),
    yellow: state.tokens.yellow.map((t) => ({ ...t })),
    blue: state.tokens.blue.map((t) => ({ ...t })),
  };

  const targetToken = nextTokens[activeColor].find((t) => t.id === tokenId)!;
  let newPosition: number;
  let knockedColor: LudoColor | null = null;
  const updatedCaptured: Record<LudoColor, boolean> = {
    red: false,
    green: false,
    yellow: false,
    blue: false,
    ...(state.hasCapturedOpponent || {}),
  };

  if (targetToken.position === -1) {
    if (roll !== 6) return state;
    newPosition = 0; // Exits base directly onto starting square!
  } else {
    newPosition = targetToken.position + roll;
    if (newPosition === 56) {
      newPosition = 999; // Reached center goal/heaven!
    }
  }

  targetToken.position = newPosition;

  // Check capture/knockout if on main track
  const sq = getLudoBoardSquare(activeColor, newPosition);
  if (sq.type === 'track' && !SAFE_SQUARES.includes(sq.index)) {
    for (const otherColor of state.playerColors) {
      if (otherColor === activeColor) continue;
      for (const oppToken of nextTokens[otherColor]) {
        if (oppToken.position >= 0 && oppToken.position < 51) {
          const oppSq = getLudoBoardSquare(otherColor, oppToken.position);
          if (oppSq.type === 'track' && oppSq.index === sq.index) {
            // Knock out back to yard socket!
            oppToken.position = -1;
            knockedColor = otherColor;
            updatedCaptured[activeColor] = true;
          }
        }
      }
    }
  }

  // Count how many tokens reached center goal
  const finishedTokensCount = nextTokens[activeColor].filter((t) => t.position === 999).length;
  const targetWin = state.targetTokensToWin || (state.ludoMode === 'quick' ? 1 : 4);
  const playerHasWon = finishedTokensCount >= targetWin;

  const nextRank = [...state.finishedRank];
  if (playerHasWon && !nextRank.includes(activeColor)) {
    nextRank.push(activeColor);
  }

  const isGameOver = nextRank.length >= state.playerColors.length - 1 || playerHasWon;
  const winnerPlayerId = playerHasWon ? state.currentTurnPlayerId : null;

  // Ludo King Extra Turn Rules:
  // 1) Rolled a 6 -> Extra roll!
  // 2) Knocked an opponent -> Extra roll!
  // 3) Reached the home goal (newPosition === 999) -> Extra roll!
  const hasBonusTurn =
    (roll === 6 || knockedColor !== null || newPosition === 999) && !playerHasWon;

  let nextIndex = state.activeColorIndex;
  if (!hasBonusTurn) {
    nextIndex = (state.activeColorIndex + 1) % state.playerColors.length;
    // Skip players who already finished
    let loops = 0;
    while (nextRank.includes(state.playerColors[nextIndex]) && loops < state.playerColors.length) {
      nextIndex = (nextIndex + 1) % state.playerColors.length;
      loops++;
    }
  }

  const nextPlayerId = playerIds[nextIndex] || playerIds[0];

  let logMsg = `${activeColor.toUpperCase()} : pion #${tokenId + 1} (${roll})`;
  if (targetToken.position === 0) {
    logMsg = `🚀 ${activeColor.toUpperCase()} a sorti un pion de l'écurie sur la case de départ !`;
  }
  if (knockedColor) {
    logMsg += ` ⚔️ et a capturé un pion ${knockedColor.toUpperCase()} (renvoyé à l'écurie) ! Re-lancer bonus !`;
  }
  if (newPosition === 999) {
    logMsg += ` 🏆 PION RENTRÉ AU CENTRE ! Re-lancer bonus !`;
  }

  return {
    ...state,
    tokens: nextTokens,
    status: isGameOver ? 'FINISHED' : 'PLAYING',
    winnerPlayerId: isGameOver ? winnerPlayerId : null,
    turnNumber: state.turnNumber + 1,
    currentTurnPlayerId: nextPlayerId,
    activeColorIndex: nextIndex,
    hasRolledDice: false,
    canRollDice: true,
    diceValue: roll,
    finishedRank: nextRank,
    hasCapturedOpponent: updatedCaptured,
    consecutiveSixCount: hasBonusTurn && roll === 6 ? state.consecutiveSixCount : 0,
    bonusRollEarned: hasBonusTurn,
    moveHistory: [...state.moveHistory, logMsg],
    lastMoveTimestamp: Date.now(),
  };
}

// Bot AI: roll dice & pick best token
export function chooseLudoBotToken(
  tokens: Record<LudoColor, LudoToken[]>,
  color: LudoColor,
  dice: number,
  difficulty: BotDifficulty = 'medium',
  ludoMode: LudoMode = 'classic',
  hasCaptured = false
): number | null {
  const playable = getPlayableLudoTokens(tokens, color, dice, ludoMode, hasCaptured);
  if (playable.length === 0) return null;
  if (playable.length === 1) return playable[0].id;

  // Easy mode: random pick
  if (difficulty === 'easy' && Math.random() < 0.6) {
    return playable[Math.floor(Math.random() * playable.length)].id;
  }

  // 1. Can enter goal (999)? Priority 1!
  const goalToken = playable.find((t) => t.position + dice === 56);
  if (goalToken) return goalToken.id;

  // 2. Can knock out an opponent? Priority 2!
  for (const token of playable) {
    const nextSteps = token.position === -1 ? 0 : token.position + dice;
    const testSq = getLudoBoardSquare(color, nextSteps);
    if (testSq.type === 'track' && !SAFE_SQUARES.includes(testSq.index)) {
      for (const otherColor of LUDO_COLORS) {
        if (otherColor === color) continue;
        for (const opp of tokens[otherColor] || []) {
          if (opp.position >= 0 && opp.position < 51) {
            const oppSq = getLudoBoardSquare(otherColor, opp.position);
            if (oppSq.type === 'track' && oppSq.index === testSq.index) {
              return token.id;
            }
          }
        }
      }
    }
  }

  // 3. Exit from yard on 6? Priority 3!
  const yardToken = playable.find((t) => t.position === -1);
  if (yardToken && dice === 6) {
    return yardToken.id;
  }

  // 4. Move token closest to home or furthest along
  const sorted = [...playable].sort((a, b) => b.position - a.position);
  return sorted[0].id;
}
