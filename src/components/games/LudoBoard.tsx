import React, { useState, useEffect } from 'react';
import {
  LudoColor,
  LudoGameState,
  LudoMode,
  Player,
} from '../../types/game';
import {
  getLudoBoardSquare,
  getPlayableLudoTokens,
  SAFE_SQUARES,
} from '../../game-engines/ludo';
import {
  Dices,
  Trophy,
  Star,
  Zap,
  Swords,
  Crown,
  Sparkles,
  ArrowRight,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ShieldCheck,
} from 'lucide-react';
import { sounds } from '../../services/sound';

interface LudoBoardProps {
  state: LudoGameState;
  localPlayer?: Player;
  isMyTurn: boolean;
  onRollDice: () => void;
  onMoveToken: (tokenId: number) => void;
  onChangeMode?: (mode: LudoMode) => void;
}

// 15x15 Grid Track Coordinates (Clockwise 52-square loop, indices 0..51)
// Red exits at [6, 1] (arrow ->), Green at [1, 8] (arrow v), Yellow at [8, 13] (arrow <-), Blue at [13, 6] (arrow ^)
const TRACK_COORDS: [number, number][] = [
  // 0..4 (Red arm top row going right)
  [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
  // 5..10 (Turn up towards Green arm left)
  [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
  // 11..12 (Green top cross)
  [0, 7], [0, 8],
  // 13..17 (Green arm right going down)
  [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
  // 18..23 (Turn right towards Yellow arm)
  [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],
  // 24..25 (Yellow right cross)
  [7, 14], [8, 14],
  // 26..30 (Yellow arm bottom going left)
  [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
  // 31..36 (Turn down towards Blue arm)
  [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
  // 37..38 (Blue bottom cross)
  [14, 7], [14, 6],
  // 39..43 (Blue arm left going up)
  [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
  // 44..49 (Turn left towards Red arm bottom)
  [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
  // 50..51 (Red left cross)
  [7, 0], [6, 0],
];

// Colored home runway coordinates leading into center:
const RUNWAY_COORDS: Record<LudoColor, [number, number][]> = {
  red: [
    [7, 1], [7, 2], [7, 3], [7, 4], [7, 5],
  ],
  green: [
    [1, 7], [2, 7], [3, 7], [4, 7], [5, 7],
  ],
  yellow: [
    [7, 13], [7, 12], [7, 11], [7, 10], [7, 9],
  ],
  blue: [
    [13, 7], [12, 7], [11, 7], [10, 7], [9, 7],
  ],
};

// Fixed positions inside the home yards (4 sockets per yard)
const YARD_SOCKET_COORDS: Record<LudoColor, [number, number][]> = {
  red: [
    [1.7, 1.7], [1.7, 3.3],
    [3.3, 1.7], [3.3, 3.3],
  ],
  green: [
    [1.7, 10.7], [1.7, 12.3],
    [3.3, 10.7], [3.3, 12.3],
  ],
  yellow: [
    [10.7, 10.7], [10.7, 12.3],
    [12.3, 10.7], [12.3, 12.3],
  ],
  blue: [
    [10.7, 1.7], [10.7, 3.3],
    [12.3, 1.7], [12.3, 3.3],
  ],
};

// Center goal triangle positions
const GOAL_CENTER_COORDS: Record<LudoColor, [number, number]> = {
  red: [7, 6.35],
  green: [6.35, 7],
  yellow: [7, 7.65],
  blue: [7.65, 7],
};

const COLOR_THEMES: Record<
  LudoColor,
  {
    nameFr: string;
    hex: string;
    primaryBg: string;
    border: string;
    pinBg: string;
    pinInner: string;
    glow: string;
    lightBg: string;
  }
> = {
  red: {
    nameFr: 'Rouge',
    hex: '#ea2e3a',
    primaryBg: 'bg-[#ea2e3a]',
    border: 'border-[#c71f2a]',
    pinBg: 'bg-gradient-to-b from-[#f87171] via-[#ea2e3a] to-[#b91c1c]',
    pinInner: 'bg-[#ef4444]',
    glow: 'shadow-[0_0_16px_rgba(239,68,68,0.8)]',
    lightBg: 'bg-red-50',
  },
  green: {
    nameFr: 'Vert',
    hex: '#0fa958',
    primaryBg: 'bg-[#0fa958]',
    border: 'border-[#0a8242]',
    pinBg: 'bg-gradient-to-b from-[#34d399] via-[#0fa958] to-[#047857]',
    pinInner: 'bg-[#10b981]',
    glow: 'shadow-[0_0_16px_rgba(16,185,129,0.8)]',
    lightBg: 'bg-emerald-50',
  },
  yellow: {
    nameFr: 'Jaune',
    hex: '#f5b800',
    primaryBg: 'bg-[#f5b800]',
    border: 'border-[#d49e00]',
    pinBg: 'bg-gradient-to-b from-[#fde047] via-[#f5b800] to-[#b45309]',
    pinInner: 'bg-[#facc15]',
    glow: 'shadow-[0_0_16px_rgba(234,179,8,0.8)]',
    lightBg: 'bg-amber-50',
  },
  blue: {
    nameFr: 'Bleu',
    hex: '#0088e8',
    primaryBg: 'bg-[#0088e8]',
    border: 'border-[#006ec0]',
    pinBg: 'bg-gradient-to-b from-[#38bdf8] via-[#0088e8] to-[#0369a1]',
    pinInner: 'bg-[#0ea5e9]',
    glow: 'shadow-[0_0_16px_rgba(14,165,233,0.8)]',
    lightBg: 'bg-sky-50',
  },
};

// Authentic Ludo King 3D Pawn Component
const LudoKingPawn: React.FC<{
  color: LudoColor;
  isPlayable?: boolean;
  onClick?: () => void;
  id?: number;
}> = ({ color, isPlayable, onClick, id }) => {
  const theme = COLOR_THEMES[color];

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (isPlayable && onClick) onClick();
      }}
      disabled={!isPlayable}
      className={`relative w-full h-full flex items-center justify-center p-0.5 outline-none select-none transition-transform duration-200 ${
        isPlayable
          ? 'cursor-pointer hover:scale-125 z-40 animate-bounce'
          : 'cursor-default'
      }`}
      title={`Pion ${theme.nameFr}${id !== undefined ? ` #${id + 1}` : ''}${
        isPlayable ? ' (Cliquez pour déplacer)' : ''
      }`}
    >
      {/* Outer Metallic Bezel & Shadow */}
      <div
        className={`w-full h-full rounded-full p-[2px] flex items-center justify-center shadow-lg transition-all ${
          isPlayable
            ? 'bg-gradient-to-b from-white via-amber-200 to-amber-500 ring-2 ring-white ' +
              theme.glow
            : 'bg-gradient-to-b from-white via-slate-200 to-slate-400'
        }`}
      >
        {/* Vibrant Domed Colored Center */}
        <div
          className={`w-full h-full rounded-full ${theme.pinBg} border border-white/70 flex items-center justify-center relative overflow-hidden shadow-inner`}
        >
          {/* Top Gloss Reflection */}
          <div className="absolute top-0.5 left-1/4 w-1/2 h-1/3 bg-white/60 rounded-full blur-[0.4px]" />
          {/* Subtle Center Cap */}
          <div className="w-1.5 h-1.5 rounded-full bg-white/40 shadow-xs" />
        </div>
      </div>

      {/* Ripple Ring when playable */}
      {isPlayable && (
        <span className="absolute -inset-1 rounded-full bg-amber-400/40 animate-ping pointer-events-none" />
      )}
    </button>
  );
};

export const LudoBoard: React.FC<LudoBoardProps> = ({
  state,
  isMyTurn,
  onRollDice,
  onMoveToken,
  onChangeMode,
}) => {
  const [isRollingAnimation, setIsRollingAnimation] = useState(false);
  const [autoMoveSingle] = useState(true);

  const activeColor = state.playerColors[state.activeColorIndex];
  const {
    tokens,
    diceValue,
    canRollDice,
    hasRolledDice,
    status,
    ludoMode = 'classic',
    hasCapturedOpponent,
    bonusRollEarned,
  } = state;

  const playableTokens =
    hasRolledDice && diceValue
      ? getPlayableLudoTokens(
          tokens,
          activeColor,
          diceValue,
          ludoMode,
          hasCapturedOpponent?.[activeColor] || false
        )
      : [];

  // Auto-move single playable token if enabled
  useEffect(() => {
    if (
      isMyTurn &&
      hasRolledDice &&
      playableTokens.length === 1 &&
      autoMoveSingle &&
      status === 'PLAYING'
    ) {
      const timer = setTimeout(() => {
        handleTokenClick(playableTokens[0].id, activeColor);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasRolledDice, playableTokens.length, isMyTurn, status]);

  const handleRollClick = () => {
    if (!isMyTurn || !canRollDice || status === 'FINISHED') return;
    setIsRollingAnimation(true);
    sounds.playDice();
    setTimeout(() => {
      setIsRollingAnimation(false);
      onRollDice();
    }, 450);
  };

  const handleTokenClick = (tokenId: number, color: LudoColor) => {
    if (!isMyTurn || color !== activeColor || !hasRolledDice) return;
    if (playableTokens.some((t) => t.id === tokenId)) {
      // Audio feedback: Check if this move results in a capture
      const currentToken = state.tokens[color]?.find((t) => t.id === tokenId);
      if (currentToken && diceValue) {
        const nextPos =
          currentToken.position === -1 ? 0 : currentToken.position + diceValue;
        const sq = getLudoBoardSquare(color, nextPos);
        let willCapture = false;
        if (sq.type === 'track' && !SAFE_SQUARES.includes(sq.index)) {
          for (const otherColor of state.playerColors) {
            if (otherColor === color) continue;
            for (const opp of state.tokens[otherColor] || []) {
              if (opp.position >= 0 && opp.position < 51) {
                const oppSq = getLudoBoardSquare(otherColor, opp.position);
                if (oppSq.type === 'track' && oppSq.index === sq.index) {
                  willCapture = true;
                  break;
                }
              }
            }
          }
        }

        if (willCapture) {
          sounds.playCapture();
        } else if (nextPos >= 56) {
          sounds.playWin();
        } else {
          sounds.playMove();
        }
      } else {
        sounds.playMove();
      }

      onMoveToken(tokenId);
    }
  };

  // Helper to render die face dots
  const renderDiceDots = (value: number) => {
    return (
      <div className="w-full h-full p-2 flex flex-col justify-between">
        {value === 1 && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-full bg-slate-900 shadow-sm" />
          </div>
        )}
        {value === 2 && (
          <div className="w-full h-full flex justify-between">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 self-end" />
          </div>
        )}
        {value === 3 && (
          <div className="w-full h-full flex justify-between">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 self-center" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 self-end" />
          </div>
        )}
        {value === 4 && (
          <div className="w-full h-full flex flex-col justify-between">
            <div className="flex justify-between">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            </div>
            <div className="flex justify-between">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            </div>
          </div>
        )}
        {value === 5 && (
          <div className="w-full h-full flex flex-col justify-between">
            <div className="flex justify-between">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            </div>
            <div className="flex justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-600" />
            </div>
            <div className="flex justify-between">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            </div>
          </div>
        )}
        {value === 6 && (
          <div className="w-full h-full flex flex-col justify-between">
            <div className="flex justify-between">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            </div>
            <div className="flex justify-between">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            </div>
            <div className="flex justify-between">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            </div>
          </div>
        )}
      </div>
    );
  };

  // Compute position for all 16 tokens (in yard, on track, in runway, in goal)
  interface TokenRenderInfo {
    color: LudoColor;
    tokenId: number;
    row: number;
    col: number;
    isPlayable: boolean;
    isInYard: boolean;
  }

  const allTokensToRender: TokenRenderInfo[] = [];

  state.playerColors.forEach((color) => {
    (tokens[color] || []).forEach((token) => {
      const isPlayable =
        activeColor === color &&
        playableTokens.some((pt) => pt.id === token.id);

      if (token.position === -1) {
        // Token sits in its fixed yard socket
        const [yardRow, yardCol] =
          YARD_SOCKET_COORDS[color][token.id] || [0, 0];
        allTokensToRender.push({
          color,
          tokenId: token.id,
          row: yardRow,
          col: yardCol,
          isPlayable,
          isInYard: true,
        });
      } else {
        const sq = getLudoBoardSquare(color, token.position);
        let row = 7;
        let col = 7;

        if (sq.type === 'track') {
          const coords = TRACK_COORDS[sq.index];
          if (coords) [row, col] = coords;
        } else if (sq.type === 'runway') {
          const runwayCoords = RUNWAY_COORDS[color];
          if (runwayCoords && runwayCoords[sq.index]) {
            [row, col] = runwayCoords[sq.index];
          }
        } else if (sq.type === 'goal') {
          [row, col] = GOAL_CENTER_COORDS[color];
        }

        allTokensToRender.push({
          color,
          tokenId: token.id,
          row,
          col,
          isPlayable,
          isInYard: false,
        });
      }
    });
  });

  // Group tokens sharing the same coordinates to compute visual offsets
  const coordGroups = new Map<string, TokenRenderInfo[]>();
  allTokensToRender.forEach((t) => {
    const key = `${Math.round(t.row * 10) / 10}_${Math.round(t.col * 10) / 10}`;
    const list = coordGroups.get(key) || [];
    list.push(t);
    coordGroups.set(key, list);
  });

  return (
    <div className="flex flex-col items-center select-none w-full max-w-xl mx-auto">
      {/* Mode Selector Bar */}
      <div className="w-full bg-slate-900/90 backdrop-blur border border-slate-800 rounded-2xl p-2 sm:p-3 mb-2.5 sm:mb-3 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Ludo King Game Mode Badges */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] sm:text-xs">
            <button
              type="button"
              onClick={() => onChangeMode && onChangeMode('classic')}
              className={`flex items-center gap-1 px-2 py-1 sm:px-2.5 rounded-lg font-semibold transition-all ${
                ludoMode === 'classic'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Mode Classique : les 4 pions doivent faire le tour"
            >
              <Crown className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Classique (4 Pions)</span>
              <span className="sm:hidden">Classique</span>
            </button>

            <button
              type="button"
              onClick={() => onChangeMode && onChangeMode('quick')}
              className={`flex items-center gap-1 px-2 py-1 sm:px-2.5 rounded-lg font-semibold transition-all ${
                ludoMode === 'quick'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Mode Rapide : 1 seul pion au centre pour gagner !"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="hidden sm:inline">Rapide (1 Pion)</span>
              <span className="sm:hidden">Rapide</span>
            </button>

            <button
              type="button"
              onClick={() => onChangeMode && onChangeMode('master')}
              className={`flex items-center gap-1 px-2 py-1 sm:px-2.5 rounded-lg font-semibold transition-all ${
                ludoMode === 'master'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Mode Maître : Capture d'un pion adverse requise pour rentrer"
            >
              <Swords className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Maître (Chasse)</span>
              <span className="sm:hidden">Maître</span>
            </button>
          </div>

          {/* Bonus Turn / Event notification badge */}
          {bonusRollEarned && isMyTurn && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-400/20 border border-amber-400 text-amber-300 text-[11px] sm:text-xs font-bold animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Re-lancer Bonus !</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Turn Controller & Interactive 3D Dice */}
      <div className="w-full flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-900 rounded-2xl border border-slate-800 mb-2.5 sm:mb-3 shadow-xl">
        {/* Active Player Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full ${COLOR_THEMES[activeColor].primaryBg} ring-2 ring-white shadow-md flex items-center justify-center shrink-0`}
          >
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white/90" />
          </div>
          <div>
            <div className="text-[10px] sm:text-xs text-slate-400 font-medium">Tour en cours</div>
            <div className="text-xs sm:text-base font-bold text-white font-['Outfit'] flex items-center gap-1.5">
              <span>Joueur {COLOR_THEMES[activeColor].nameFr}</span>
              {isMyTurn && (
                <span className="text-[9px] sm:text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono font-bold">
                  VOUS
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Dice Controller with 3D Styled Cube */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleRollClick}
            disabled={!isMyTurn || !canRollDice || status === 'FINISHED'}
            className={`group relative p-0.5 sm:p-1 rounded-2xl transition-all duration-200 outline-none ${
              isMyTurn && canRollDice && status !== 'FINISHED'
                ? 'cursor-pointer hover:scale-105 active:scale-95'
                : 'cursor-not-allowed opacity-80'
            }`}
            title="Cliquez pour lancer le dé"
          >
            {/* 3D Dice Cube */}
            <div
              className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white border-2 border-slate-300 shadow-xl flex items-center justify-center transition-transform ${
                isRollingAnimation ? 'animate-spin' : ''
              } ${
                isMyTurn && canRollDice
                  ? 'ring-4 ring-amber-400 shadow-amber-500/30 animate-pulse'
                  : ''
              }`}
            >
              {diceValue !== null ? (
                renderDiceDots(diceValue)
              ) : (
                <Dices className="w-5 h-5 sm:w-7 sm:h-7 text-slate-700 group-hover:rotate-12 transition-transform" />
              )}
            </div>
          </button>

          <div className="text-left hidden xs:block sm:block">
            <div className="text-xs font-bold text-white">
              {canRollDice
                ? isMyTurn
                  ? '👉 Lancez le dé !'
                  : 'En attente...'
                : hasRolledDice
                ? `Dé : ${diceValue}`
                : 'Attente...'}
            </div>
            <div className="text-[11px] text-slate-400 hidden sm:block">
              {canRollDice && isMyTurn
                ? 'Faites un 6 pour sortir un pion'
                : playableTokens.length > 0
                ? 'Cliquez sur un pion qui clignote'
                : 'Aucun coup disponible'}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          AUTHENTIC 15x15 STATIC LUDO KING BOARD
          - Fixed 15x15 CSS Grid with explicit repeat(15, minmax(0, 1fr))
          - Absolutely decoupled Token Layer on top:
            THE BOARD NEVER SHIFTS, WARPS OR RESIZES WHEN PAWNS MOVE!
          - All 4 Yard Bases have permanent circular sockets.
          - Pawns glide with smooth CSS transitions.
         ======================================================== */}
      <div className="relative p-1.5 sm:p-3 bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl sm:rounded-3xl shadow-2xl border-2 border-slate-800 w-full aspect-square max-w-[min(100vw-1.5rem,500px)]">
        {/* Rigid Board Container */}
        <div className="relative w-full h-full bg-white rounded-2xl overflow-hidden border-2 border-slate-900 shadow-inner">
          
          {/* STATIC BACKGROUND GRID (Never affected by token movement) */}
          <div
            className="w-full h-full"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(15, minmax(0, 1fr))',
              gridTemplateRows: 'repeat(15, minmax(0, 1fr))',
            }}
          >
            {/* 1. RED YARD (Rows 0..5, Cols 0..5 -> grid 1/7, 1/7) */}
            <div
              style={{ gridColumn: '1 / 7', gridRow: '1 / 7' }}
              className="bg-[#ea2e3a] p-2 sm:p-3 flex items-center justify-center border-b-2 border-r-2 border-slate-900"
            >
              <div className="w-full h-full bg-white rounded-xl p-2 sm:p-3 grid grid-cols-2 grid-rows-2 gap-2 shadow-inner border border-slate-200">
                {[0, 1, 2, 3].map((socketId) => (
                  <div
                    key={`red-socket-${socketId}`}
                    className="flex items-center justify-center bg-red-100/70 rounded-full border-2 border-[#ea2e3a]/40 shadow-inner"
                  >
                    <div className="w-4 h-4 rounded-full bg-[#ea2e3a]/25 border border-[#ea2e3a]/50" />
                  </div>
                ))}
              </div>
            </div>

            {/* 2. TOP CROSS ARM: GREEN RUNWAY & EXIT (grid 7/10, 1/7) */}
            <div
              style={{ gridColumn: '7 / 10', gridRow: '1 / 7' }}
              className="grid grid-cols-3 grid-rows-6 border-b-2 border-slate-900 bg-white"
            >
              {Array.from({ length: 18 }).map((_, i) => {
                const col = i % 3;
                const row = Math.floor(i / 3);
                const isRunway = col === 1 && row > 0;
                // Green Start square: Col 8, Row 1 (col=2, row=1)
                const isGreenStart = col === 2 && row === 1;
                // Safe Star on Top arm: Col 6, Row 2 (col=0, row=2)
                const isStar = col === 0 && row === 2;

                return (
                  <div
                    key={`top-cell-${i}`}
                    className={`border-[0.5px] border-slate-300 flex items-center justify-center relative ${
                      isRunway
                        ? 'bg-[#0fa958]'
                        : isGreenStart
                        ? 'bg-[#0fa958] text-white'
                        : 'bg-white'
                    }`}
                  >
                    {isGreenStart && (
                      <ArrowDown className="w-4 h-4 text-white stroke-[3] drop-shadow" />
                    )}
                    {isStar && (
                      <Star className="w-4 h-4 text-amber-500 fill-amber-400 drop-shadow-sm" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* 3. GREEN YARD (Rows 0..5, Cols 9..14 -> grid 10/16, 1/7) */}
            <div
              style={{ gridColumn: '10 / 16', gridRow: '1 / 7' }}
              className="bg-[#0fa958] p-2 sm:p-3 flex items-center justify-center border-b-2 border-l-2 border-slate-900"
            >
              <div className="w-full h-full bg-white rounded-xl p-2 sm:p-3 grid grid-cols-2 grid-rows-2 gap-2 shadow-inner border border-slate-200">
                {[0, 1, 2, 3].map((socketId) => (
                  <div
                    key={`green-socket-${socketId}`}
                    className="flex items-center justify-center bg-emerald-100/70 rounded-full border-2 border-[#0fa958]/40 shadow-inner"
                  >
                    <div className="w-4 h-4 rounded-full bg-[#0fa958]/25 border border-[#0fa958]/50" />
                  </div>
                ))}
              </div>
            </div>

            {/* 4. LEFT CROSS ARM: RED RUNWAY & EXIT (grid 1/7, 7/10) */}
            <div
              style={{ gridColumn: '1 / 7', gridRow: '7 / 10' }}
              className="grid grid-cols-6 grid-rows-3 border-r-2 border-slate-900 bg-white"
            >
              {Array.from({ length: 18 }).map((_, i) => {
                const col = i % 6;
                const row = Math.floor(i / 6);
                const isRunway = row === 1 && col > 0;
                // Red Start square: Col 1, Row 6 (row=0, col=1)
                const isRedStart = row === 0 && col === 1;
                // Safe Star on Left arm: Col 2, Row 8 (row=2, col=2)
                const isStar = row === 2 && col === 2;

                return (
                  <div
                    key={`left-cell-${i}`}
                    className={`border-[0.5px] border-slate-300 flex items-center justify-center relative ${
                      isRunway
                        ? 'bg-[#ea2e3a]'
                        : isRedStart
                        ? 'bg-[#ea2e3a] text-white'
                        : 'bg-white'
                    }`}
                  >
                    {isRedStart && (
                      <ArrowRight className="w-4 h-4 text-white stroke-[3] drop-shadow" />
                    )}
                    {isStar && (
                      <Star className="w-4 h-4 text-amber-500 fill-amber-400 drop-shadow-sm" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* 5. CENTER GOAL: 4 TRIANGLES (grid 7/10, 7/10) */}
            <div
              style={{ gridColumn: '7 / 10', gridRow: '7 / 10' }}
              className="relative bg-white border border-slate-900 overflow-hidden"
            >
              <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Left Triangle: RED */}
                <polygon points="0,0 50,50 0,100" fill="#ea2e3a" />
                {/* Top Triangle: GREEN */}
                <polygon points="0,0 50,50 100,0" fill="#0fa958" />
                {/* Right Triangle: YELLOW */}
                <polygon points="100,0 50,50 100,100" fill="#f5b800" />
                {/* Bottom Triangle: BLUE */}
                <polygon points="0,100 50,50 100,100" fill="#0088e8" />
              </svg>

              {/* Center Trophy */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-6 h-6 rounded-full bg-white/95 shadow-md border border-slate-300 flex items-center justify-center">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                </div>
              </div>
            </div>

            {/* 6. RIGHT CROSS ARM: YELLOW RUNWAY & EXIT (grid 10/16, 7/10) */}
            <div
              style={{ gridColumn: '10 / 16', gridRow: '7 / 10' }}
              className="grid grid-cols-6 grid-rows-3 border-l-2 border-slate-900 bg-white"
            >
              {Array.from({ length: 18 }).map((_, i) => {
                const col = i % 6;
                const row = Math.floor(i / 6);
                const isRunway = row === 1 && col < 5;
                // Yellow Start square: Col 13, Row 8 (row=2, col=4)
                const isYellowStart = row === 2 && col === 4;
                // Safe Star on Right arm: Col 12, Row 6 (row=0, col=3)
                const isStar = row === 0 && col === 3;

                return (
                  <div
                    key={`right-cell-${i}`}
                    className={`border-[0.5px] border-slate-300 flex items-center justify-center relative ${
                      isRunway
                        ? 'bg-[#f5b800]'
                        : isYellowStart
                        ? 'bg-[#f5b800] text-white'
                        : 'bg-white'
                    }`}
                  >
                    {isYellowStart && (
                      <ArrowLeft className="w-4 h-4 text-white stroke-[3] drop-shadow" />
                    )}
                    {isStar && (
                      <Star className="w-4 h-4 text-amber-500 fill-amber-400 drop-shadow-sm" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* 7. BLUE YARD (Rows 9..14, Cols 0..5 -> grid 1/7, 10/16) */}
            <div
              style={{ gridColumn: '1 / 7', gridRow: '10 / 16' }}
              className="bg-[#0088e8] p-2 sm:p-3 flex items-center justify-center border-t-2 border-r-2 border-slate-900"
            >
              <div className="w-full h-full bg-white rounded-xl p-2 sm:p-3 grid grid-cols-2 grid-rows-2 gap-2 shadow-inner border border-slate-200">
                {[0, 1, 2, 3].map((socketId) => (
                  <div
                    key={`blue-socket-${socketId}`}
                    className="flex items-center justify-center bg-sky-100/70 rounded-full border-2 border-[#0088e8]/40 shadow-inner"
                  >
                    <div className="w-4 h-4 rounded-full bg-[#0088e8]/25 border border-[#0088e8]/50" />
                  </div>
                ))}
              </div>
            </div>

            {/* 8. BOTTOM CROSS ARM: BLUE RUNWAY & EXIT (grid 7/10, 10/16) */}
            <div
              style={{ gridColumn: '7 / 10', gridRow: '10 / 16' }}
              className="grid grid-cols-3 grid-rows-6 border-t-2 border-slate-900 bg-white"
            >
              {Array.from({ length: 18 }).map((_, i) => {
                const col = i % 3;
                const row = Math.floor(i / 3);
                const isRunway = col === 1 && row < 5;
                // Blue Start square: Col 6, Row 13 (row=4, col=0)
                const isBlueStart = col === 0 && row === 4;
                // Safe Star on Bottom arm: Col 8, Row 12 (row=3, col=2)
                const isStar = col === 2 && row === 3;

                return (
                  <div
                    key={`bottom-cell-${i}`}
                    className={`border-[0.5px] border-slate-300 flex items-center justify-center relative ${
                      isRunway
                        ? 'bg-[#0088e8]'
                        : isBlueStart
                        ? 'bg-[#0088e8] text-white'
                        : 'bg-white'
                    }`}
                  >
                    {isBlueStart && (
                      <ArrowUp className="w-4 h-4 text-white stroke-[3] drop-shadow" />
                    )}
                    {isStar && (
                      <Star className="w-4 h-4 text-amber-500 fill-amber-400 drop-shadow-sm" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* 9. YELLOW YARD (Rows 9..14, Cols 9..14 -> grid 10/16, 10/16) */}
            <div
              style={{ gridColumn: '10 / 16', gridRow: '10 / 16' }}
              className="bg-[#f5b800] p-2 sm:p-3 flex items-center justify-center border-t-2 border-l-2 border-slate-900"
            >
              <div className="w-full h-full bg-white rounded-xl p-2 sm:p-3 grid grid-cols-2 grid-rows-2 gap-2 shadow-inner border border-slate-200">
                {[0, 1, 2, 3].map((socketId) => (
                  <div
                    key={`yellow-socket-${socketId}`}
                    className="flex items-center justify-center bg-amber-100/70 rounded-full border-2 border-[#f5b800]/40 shadow-inner"
                  >
                    <div className="w-4 h-4 rounded-full bg-[#f5b800]/25 border border-[#f5b800]/50" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* DEDICATED OVERHEAD TOKEN LAYER (Completely independent of grid) */}
          <div className="absolute inset-0 pointer-events-none z-20">
            {allTokensToRender.map((tokenInfo) => {
              const { color, tokenId, row, col, isPlayable, isInYard } =
                tokenInfo;
              const key = `${Math.round(row * 10) / 10}_${
                Math.round(col * 10) / 10
              }`;
              const siblings = coordGroups.get(key) || [tokenInfo];
              const siblingIndex = siblings.findIndex(
                (s) => s.color === color && s.tokenId === tokenId
              );
              const count = siblings.length;

              // Compute smooth offsets if multiple pawns share the exact same spot
              let dx = 0;
              let dy = 0;
              let scale = isInYard ? 0.9 : 0.88;

              if (count === 2 && !isInYard) {
                scale = 0.76;
                dx = siblingIndex === 0 ? -18 : 18;
                dy = siblingIndex === 0 ? -12 : 12;
              } else if (count === 3 && !isInYard) {
                scale = 0.68;
                if (siblingIndex === 0) {
                  dx = -18;
                  dy = -15;
                } else if (siblingIndex === 1) {
                  dx = 18;
                  dy = -15;
                } else {
                  dx = 0;
                  dy = 18;
                }
              } else if (count >= 4 && !isInYard) {
                scale = 0.62;
                if (siblingIndex === 0) {
                  dx = -18;
                  dy = -18;
                } else if (siblingIndex === 1) {
                  dx = 18;
                  dy = -18;
                } else if (siblingIndex === 2) {
                  dx = -18;
                  dy = 18;
                } else {
                  dx = 18;
                  dy = 18;
                }
              }

              const leftPct = (col / 15) * 100;
              const topPct = (row / 15) * 100;
              const widthPct = (1 / 15) * 100;
              const heightPct = (1 / 15) * 100;

              return (
                <div
                  key={`token-overlay-${color}-${tokenId}`}
                  style={{
                    position: 'absolute',
                    left: `${leftPct}%`,
                    top: `${topPct}%`,
                    width: `${widthPct}%`,
                    height: `${heightPct}%`,
                    transform: `translate(${dx}%, ${dy}%) scale(${scale})`,
                    transition:
                      'left 0.35s cubic-bezier(0.25, 1, 0.5, 1), top 0.35s cubic-bezier(0.25, 1, 0.5, 1), transform 0.25s ease',
                    zIndex: isPlayable ? 45 : 30 + Math.floor(row),
                  }}
                  className="flex items-center justify-center pointer-events-auto"
                >
                  <LudoKingPawn
                    color={color}
                    id={tokenId}
                    isPlayable={isPlayable}
                    onClick={() => handleTokenClick(tokenId, color)}
                  />
                </div>
              );
            })}
          </div>

          {/* Victory Modal */}
          {status === 'FINISHED' && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center z-50 p-6 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center mb-3">
                <Trophy className="w-9 h-9 text-amber-400 animate-bounce" />
              </div>
              <h3 className="text-xl font-black text-white font-['Outfit'] mb-1">
                Partie Terminée !
              </h3>
              <p className="text-sm text-slate-300 font-medium mb-1">
                {state.finishedRank.length > 0 ? (
                  <span>
                    Victoire éclatante du joueur{' '}
                    <strong className="text-amber-400 uppercase">
                      {COLOR_THEMES[state.finishedRank[0]].nameFr}
                    </strong>{' '}
                    !
                  </span>
                ) : (
                  'Félicitations pour cette belle partie !'
                )}
              </p>
              <span className="text-xs text-slate-400 mt-2">
                Mode :{' '}
                {ludoMode === 'quick'
                  ? 'Rapide (1 pion)'
                  : ludoMode === 'master'
                  ? 'Maître (Chasse)'
                  : 'Classique (4 pions)'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info & Authentic Rules Reminder */}
      <div className="w-full mt-3 p-3 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 shadow">
        <div className="flex items-center gap-2">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30 shrink-0" />
          <span>
            <strong>Cases Étoiles & Départs :</strong> Refuges sécurisés (aucun pion ne peut y être capturé).
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>
            <strong>Re-lancers bonus :</strong> Obtenez un 6, capturez un pion adverse ou atteignez le centre !
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span>
            <strong>Captures :</strong> Si vous atterrissez sur un pion adverse hors étoile, il retourne en prison !
          </span>
        </div>
      </div>
    </div>
  );
};
