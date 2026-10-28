import React, { useState } from 'react';
import { CheckerPieceColor, CheckersGameState, CheckersVariant, Player } from '../../types/game';
import {
  CheckersMove,
  getAllCheckersMoves,
} from '../../game-engines/checkers';
import { Crown, Trophy, Zap, Sparkles, Palette, Layers } from 'lucide-react';
import { sounds } from '../../services/sound';
import { BOARD_THEMES, CHECKERS_PIECE_THEMES } from '../../types/themes';

interface CheckersBoardProps {
  state: CheckersGameState;
  localPlayer?: Player;
  isMyTurn: boolean;
  onMove: (move: CheckersMove) => void;
  onChangeVariant?: (variant: CheckersVariant) => void;
  onChangeBoardSize?: (size: 8 | 10) => void;
  boardThemeId?: string;
  pieceThemeId?: string;
  onOpenThemes?: () => void;
  flipBoard?: boolean;
}

export const CheckersBoard: React.FC<CheckersBoardProps> = ({
  state,
  localPlayer,
  isMyTurn,
  onMove,
  onChangeVariant,
  onChangeBoardSize,
  boardThemeId = 'wood_classic',
  pieceThemeId = 'ruby_carbon',
  onOpenThemes,
  flipBoard = false,
}) => {
  const [selectedPos, setSelectedPos] = useState<[number, number] | null>(null);

  const {
    board,
    activeColor,
    capturedRed,
    capturedBlack,
    consecutiveJumpPiecePos,
    status,
    winnerPlayerId,
  } = state;

  const size = board.length; // 8 or 10
  const totalPieces = size === 10 ? 20 : 12;
  const variant: CheckersVariant = state.variant || 'senegalese';

  // Resolved themes
  const activeBoardTheme = BOARD_THEMES[boardThemeId] || BOARD_THEMES.wood_classic;
  const activePieceTheme =
    CHECKERS_PIECE_THEMES.find((p) => p.id === pieceThemeId) || CHECKERS_PIECE_THEMES[0];

  // All legal moves for the current active turn
  const legalMoves = getAllCheckersMoves(board, activeColor, consecutiveJumpPiecePos, variant);

  // Targets available for the currently selected piece
  const selectedTargets = selectedPos
    ? legalMoves.filter(
        (m) => m.from[0] === selectedPos[0] && m.from[1] === selectedPos[1]
      )
    : [];

  const selectedPiece = selectedPos ? board[selectedPos[0]][selectedPos[1]] : null;

  // Check if selected piece has backward jump (Senegalese rule)
  const hasBackwardJump = selectedTargets.some((m) => {
    if (!m.isJump) return false;
    const isMovingBack =
      activeColor === 'black'
        ? m.to[0] > m.from[0] // black usually moves up (-), so > is moving backward!
        : m.to[0] < m.from[0]; // red usually moves down (+), so < is moving backward!
    return isMovingBack;
  });

  const handleSquareClick = (r: number, c: number) => {
    if (!isMyTurn || status === 'FINISHED') return;

    const piece = board[r][c];

    // If a piece is already selected, check if user clicked a valid landing square
    if (selectedPos) {
      const targetMove = selectedTargets.find(
        (m) => m.to[0] === r && m.to[1] === c
      );

      if (targetMove) {
        onMove(targetMove);
        if (targetMove.isJump) sounds.playCapture();
        else sounds.playMove();
        setSelectedPos(null);
        return;
      }
    }

    // If consecutive jump active, can only click that piece
    if (consecutiveJumpPiecePos) {
      if (consecutiveJumpPiecePos[0] === r && consecutiveJumpPiecePos[1] === c) {
        setSelectedPos([r, c]);
      }
      return;
    }

    // Select piece
    if (piece && piece.color === activeColor) {
      // Check player color lock
      if (localPlayer?.color) {
        const myColor: CheckerPieceColor = localPlayer.color === 'white' ? 'black' : 'red';
        if (piece.color !== myColor) return;
      }

      // Only allow selecting pieces that actually have legal moves
      const pieceMoves = legalMoves.filter(
        (m) => m.from[0] === r && m.from[1] === c
      );
      if (pieceMoves.length > 0) {
        setSelectedPos([r, c]);
        sounds.playMove();
      }
    } else {
      setSelectedPos(null);
    }
  };

  // Generate coordinate indices dynamically
  const indices = Array.from({ length: size }, (_, i) => i);
  const rows = flipBoard ? [...indices].reverse() : indices;
  const cols = flipBoard ? [...indices].reverse() : indices;

  return (
    <div className="flex flex-col items-center select-none w-full max-w-xl mx-auto">
      {/* Top Controls: Format 10x10 vs 8x8 & Variants & Palette Button */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 p-1.5 bg-slate-900 rounded-2xl border border-slate-800 mb-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Format size toggle */}
          {onChangeBoardSize && (
            <div className="flex items-center bg-slate-950 p-0.5 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => onChangeBoardSize(10)}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  size === 10
                    ? 'bg-amber-400 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Grand Damier 10x10 avec 20 pions (Format roi au Sénégal)"
              >
                <span className="hidden sm:inline">🇸🇳 10x10 (20 pions)</span>
                <span className="sm:hidden">🇸🇳 10x10</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeBoardSize(8)}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  size === 8
                    ? 'bg-amber-400 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Damier 8x8 avec 12 pions"
              >
                <span className="hidden sm:inline">8x8 (12 pions)</span>
                <span className="sm:hidden">8x8</span>
              </button>
            </div>
          )}

          {/* Variant toggle */}
          {onChangeVariant && (
            <button
              type="button"
              onClick={() => onChangeVariant(variant === 'senegalese' ? 'classic' : 'senegalese')}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1 ${
                variant === 'senegalese'
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}
              title="Cliquer pour basculer les règles"
            >
              <span>{variant === 'senegalese' ? '🇸🇳 Règles Sénégalaises' : '♟️ Règles Classiques'}</span>
            </button>
          )}
        </div>

        {/* Theme Palette Button */}
        {onOpenThemes && (
          <button
            type="button"
            onClick={onOpenThemes}
            className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-amber-400/10 border border-amber-400/30 text-amber-300 hover:bg-amber-400/20 transition-all flex items-center gap-1.5 shadow-sm"
            title="Changer la planche ou la couleur des pions"
          >
            <Palette className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Planche & Pions</span>
          </button>
        )}
      </div>

      {/* Top player capture bar */}
      <div className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Pions Rouges capturés :</span>
          <span className="font-mono font-bold text-rose-400">
            {capturedRed} / {totalPieces}
          </span>
        </div>
        <span className="font-mono">
          {activeColor === 'red' && status !== 'FINISHED' && (
            <span className="text-rose-400 font-medium">Trait aux Rouges</span>
          )}
        </span>
      </div>

      {/* Main Board Container */}
      <div
        className={`relative p-1.5 sm:p-3 rounded-2xl sm:rounded-3xl shadow-2xl border ${activeBoardTheme.borderColor} ${activeBoardTheme.frameBg} w-full aspect-square max-w-[min(100vw-1.5rem,500px)]`}
      >
        {/* SVG Trajectory Lines Overlay for visual jump path */}
        {selectedTargets.length > 0 && (
          <svg className="absolute inset-2 sm:inset-3 w-[calc(100%-1rem)] sm:w-[calc(100%-1.5rem)] h-[calc(100%-1rem)] sm:h-[calc(100%-1.5rem)] pointer-events-none z-30">
            {selectedTargets.map((m, idx) => {
              if (!m.isJump || !m.jumpedPiecePos) return null;
              const startCol = flipBoard ? size - 1 - m.from[1] : m.from[1];
              const startRow = flipBoard ? size - 1 - m.from[0] : m.from[0];
              const midCol = flipBoard ? size - 1 - m.jumpedPiecePos[1] : m.jumpedPiecePos[1];
              const midRow = flipBoard ? size - 1 - m.jumpedPiecePos[0] : m.jumpedPiecePos[0];
              const endCol = flipBoard ? size - 1 - m.to[1] : m.to[1];
              const endRow = flipBoard ? size - 1 - m.to[0] : m.to[0];

              const cellPercent = 100 / size;
              const startX = (startCol + 0.5) * cellPercent;
              const startY = (startRow + 0.5) * cellPercent;
              const midX = (midCol + 0.5) * cellPercent;
              const midY = (midRow + 0.5) * cellPercent;
              const endX = (endCol + 0.5) * cellPercent;
              const endY = (endRow + 0.5) * cellPercent;

              return (
                <g key={idx}>
                  {/* Line from origin to captured piece */}
                  <line
                    x1={`${startX}%`}
                    y1={`${startY}%`}
                    x2={`${midX}%`}
                    y2={`${midY}%`}
                    stroke="#f43f5e"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeDasharray="5 3"
                    className="opacity-90"
                  />
                  {/* Line from captured piece to landing spot */}
                  <line
                    x1={`${midX}%`}
                    y1={`${midY}%`}
                    x2={`${endX}%`}
                    y2={`${endY}%`}
                    stroke="#10b981"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  {/* Capture ring on jumped piece */}
                  <circle
                    cx={`${midX}%`}
                    cy={`${midY}%`}
                    r={size === 10 ? '9' : '12'}
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="2.5"
                    className="animate-ping"
                  />
                  {/* Target landing spot */}
                  <circle
                    cx={`${endX}%`}
                    cy={`${endY}%`}
                    r={size === 10 ? '6' : '8'}
                    fill="#10b981"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                </g>
              );
            })}
          </svg>
        )}

        {/* Dynamic Grid of Squares */}
        <div
          className="grid w-full h-full rounded-2xl overflow-hidden border border-stone-950 shadow-inner"
          style={{
            gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`,
            gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
          }}
        >
          {rows.map((r) =>
            cols.map((c) => {
              const piece = board[r][c];
              const isDarkSquare = (r + c) % 2 === 1;
              const isSelected = selectedPos && selectedPos[0] === r && selectedPos[1] === c;
              const isTargetMove = selectedTargets.find((m) => m.to[0] === r && m.to[1] === c);
              const pieceHasMoves =
                piece &&
                piece.color === activeColor &&
                legalMoves.some((m) => m.from[0] === r && m.from[1] === c);

              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  onClick={() => handleSquareClick(r, c)}
                  disabled={!isDarkSquare}
                  className={`relative flex items-center justify-center p-0.5 focus:outline-none transition-colors ${
                    isDarkSquare ? activeBoardTheme.darkSquare : activeBoardTheme.lightSquare
                  } ${isSelected ? '!bg-amber-900/60 ring-2 ring-amber-400' : ''}`}
                >
                  {/* Target square indicator */}
                  {isTargetMove && (
                    <div
                      className={`absolute z-20 rounded-full ${
                        size === 10 ? 'w-3 h-3' : 'w-4 h-4'
                      } ${
                        isTargetMove.isJump
                          ? 'bg-rose-500/90 animate-ping ring-2 ring-white'
                          : 'bg-emerald-400/80 shadow-md'
                      }`}
                    />
                  )}

                  {/* Checker Piece with selected theme */}
                  {piece && (
                    <div
                      className={`relative z-10 w-9/12 h-9/12 rounded-full flex items-center justify-center transition-all duration-150 shadow-md ${
                        piece.color === 'red'
                          ? activePieceTheme.previewP1
                          : activePieceTheme.previewP2
                      } ${isSelected ? 'scale-110 ring-4 ring-amber-400' : ''} ${
                        pieceHasMoves && !isSelected && isMyTurn ? 'ring-2 ring-emerald-400/60' : ''
                      }`}
                    >
                      {/* Inner concentric ring for classic draughts texture */}
                      <div className="w-8/12 h-8/12 rounded-full border border-white/20 flex items-center justify-center">
                        {piece.isKing && (
                          <Crown className={`${size === 10 ? 'w-3 h-3' : 'w-4 h-4'} text-amber-300 drop-shadow`} />
                        )}
                      </div>
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Victory Overlay */}
        {status === 'FINISHED' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-40 p-6 text-center">
            <Trophy className="w-12 h-12 text-amber-400 mb-2" />
            <h3 className="text-xl font-bold text-white font-['Outfit'] mb-1">
              Partie Terminée !
            </h3>
            <p className="text-sm text-slate-300">
              {winnerPlayerId
                ? `Victoire des pions ${activeColor === 'red' ? 'Noirs' : 'Rouges'} !`
                : 'Partie terminée'}
            </p>
          </div>
        )}
      </div>

      {/* Bottom player capture bar */}
      <div className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Pions Noirs capturés :</span>
          <span className="font-mono font-bold text-stone-300">
            {capturedBlack} / {totalPieces}
          </span>
        </div>
        <span className="font-mono">
          {activeColor === 'black' && status !== 'FINISHED' && (
            <span className="text-emerald-400 font-medium">Trait aux Noirs</span>
          )}
        </span>
      </div>

      {/* Tactical Status Badges for Senegalese Rules */}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-xs">
        {selectedPiece?.isKing && variant === 'senegalese' && (
          <div className="flex items-center gap-1.5 text-amber-300 bg-amber-950/60 border border-amber-800/60 px-3 py-1 rounded-full animate-pulse font-medium">
            <Crown className="w-3.5 h-3.5" />
            <span>Dame Volante : Capture à distance & atterrissage libre !</span>
          </div>
        )}

        {hasBackwardJump && (
          <div className="flex items-center gap-1.5 text-emerald-300 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-full animate-bounce font-medium">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Prise en arrière possible (Règles Sénégalaises) !</span>
          </div>
        )}

        {legalMoves.length > 0 && legalMoves[0].isJump && status === 'PLAYING' && (
          <div className="flex items-center gap-1 text-rose-400 bg-rose-950/40 border border-rose-800/40 px-3 py-1 rounded-full font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Prise obligatoire en cours</span>
          </div>
        )}
      </div>
    </div>
  );
};
