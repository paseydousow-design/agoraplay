import React, { useState } from 'react';
import { Player, ThreeMorrisGameState, ThreeMorrisPiece } from '../../types/game';
import {
  Trophy,
  Sparkles,
  Info,
  CircleDot,
  ShieldAlert,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import {
  THREE_MORRIS_ADJACENCY,
  getValidDestinations,
} from '../../game-engines/three_morris';
import { sounds } from '../../services/sound';

interface ThreeMorrisBoardProps {
  state: ThreeMorrisGameState;
  localPlayer?: Player;
  isMyTurn: boolean;
  onPlayPlacement: (cellIndex: number) => void;
  onPlayMovement: (fromIndex: number, toIndex: number) => void;
}

export const ThreeMorrisBoard: React.FC<ThreeMorrisBoardProps> = ({
  state,
  localPlayer,
  isMyTurn,
  onPlayPlacement,
  onPlayMovement,
}) => {
  const {
    board,
    phase,
    placedPieces,
    activePlayerSymbol,
    status,
    winningLine,
    winnerPlayerId,
    blockedPlayer,
  } = state;

  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);

  // Helper to determine which symbol corresponds to the local player
  const mySymbol: 'P1' | 'P2' =
    localPlayer?.id === state.playerIds.P2 ? 'P2' : 'P1';

  // Allowed destinations if a piece is selected during movement phase
  const validDests =
    selectedCell !== null ? getValidDestinations(board, selectedCell) : [];

  const handleCellClick = (cellIndex: number) => {
    if (!isMyTurn || status === 'FINISHED') return;
    setWarningMsg(null);

    // === PHASE 1: PLACEMENT ===
    if (phase === 'placement') {
      if (board[cellIndex] !== null) {
        setWarningMsg('Cette case est déjà occupée ! Choisissez une intersection libre.');
        return;
      }
      onPlayPlacement(cellIndex);
      sounds.playMove();
      return;
    }

    // === PHASE 2: MOVEMENT ===
    const cellValue = board[cellIndex];

    // Case A: Clicking on own piece to select/reselect it
    if (cellValue === activePlayerSymbol) {
      if (selectedCell === cellIndex) {
        // Deselect
        setSelectedCell(null);
      } else {
        const dests = getValidDestinations(board, cellIndex);
        if (dests.length === 0) {
          setWarningMsg('Ce pion est complètement bloqué ! Choisissez un autre pion.');
        }
        setSelectedCell(cellIndex);
        sounds.playMove();
      }
      return;
    }

    // Case B: Piece already selected, clicking on an empty cell
    if (selectedCell !== null && cellValue === null) {
      if (validDests.includes(cellIndex)) {
        // Valid sliding move! (Adjacent & connected, no jump)
        onPlayMovement(selectedCell, cellIndex);
        setSelectedCell(null);
        sounds.playMove();
      } else {
        // Attempted jump or non-connected move!
        const isNeighbor = THREE_MORRIS_ADJACENCY[selectedCell]?.includes(cellIndex);
        if (!isNeighbor) {
          setWarningMsg('⛔ Règle des 3 Pions : Aucun saut autorisé ! Vous ne pouvez glisser que vers une case directement reliée.');
        } else {
          setWarningMsg('Déplacement invalide.');
        }
      }
      return;
    }

    // Case C: Clicking on opponent's piece or empty cell without selection
    if (cellValue !== null && cellValue !== activePlayerSymbol) {
      setWarningMsg("C'est le pion de votre adversaire ! Vous ne pouvez déplacer que vos propres pions.");
      return;
    }

    if (selectedCell === null && cellValue === null) {
      setWarningMsg("Sélectionnez d'abord l'un de vos pions pour le déplacer.");
    }
  };

  // Node positions in percentage for SVG drawing and button placement
  // 3x3 grid: cols [15%, 50%, 85%], rows [15%, 50%, 85%]
  const nodePositions = [
    { x: 15, y: 15 }, // 0: Top-Left
    { x: 50, y: 15 }, // 1: Top-Center
    { x: 85, y: 15 }, // 2: Top-Right
    { x: 15, y: 50 }, // 3: Middle-Left
    { x: 50, y: 50 }, // 4: Center
    { x: 85, y: 50 }, // 5: Middle-Right
    { x: 15, y: 85 }, // 6: Bottom-Left
    { x: 50, y: 85 }, // 7: Bottom-Center
    { x: 85, y: 85 }, // 8: Bottom-Right
  ];

  return (
    <div className="flex flex-col items-center select-none w-full max-w-md mx-auto">
      {/* Game Phase & Turn Header Banner */}
      <div className="w-full bg-slate-900/90 backdrop-blur border border-slate-800 rounded-2xl p-3.5 mb-3.5 shadow-xl">
        <div className="flex items-center justify-between gap-2 mb-2">
          {/* Phase Badge */}
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                phase === 'placement'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              <CircleDot className="w-3.5 h-3.5 animate-pulse" />
              {phase === 'placement' ? '1. Phase de Pose' : '2. Phase de Déplacement'}
            </span>
          </div>

          {/* Turn indicator */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300">
              Tour :{' '}
              <strong
                className={
                  activePlayerSymbol === 'P1' ? 'text-amber-400' : 'text-sky-400'
                }
              >
                {activePlayerSymbol === 'P1' ? 'Joueur 1 (Or)' : 'Joueur 2 (Bleu)'}
              </strong>
            </span>
            <div
              className={`w-3.5 h-3.5 rounded-full border shadow-sm ${
                activePlayerSymbol === 'P1'
                  ? 'bg-amber-400 border-amber-200'
                  : 'bg-sky-400 border-sky-200'
              }`}
            />
          </div>
        </div>

        {/* Pieces Count or Action Hint */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          {phase === 'placement' ? (
            <div className="flex items-center justify-between w-full">
              <span>
                Pions posés :{' '}
                <span className="text-amber-400 font-bold font-mono">
                  Or {placedPieces.P1}/3
                </span>{' '}
                •{' '}
                <span className="text-sky-400 font-bold font-mono">
                  Bleu {placedPieces.P2}/3
                </span>
              </span>
              <span className="text-slate-300 font-medium">
                {isMyTurn ? '👉 Posez un pion' : 'Attente...'}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <span className="text-slate-300">
                {selectedCell === null
                  ? '👉 Cliquez sur un pion pour le choisir'
                  : '👉 Cliquez sur une case reliée vide'}
              </span>
              <span className="text-emerald-400 font-medium text-[11px] bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-md">
                Glissement libre
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Board Arena with SVG Connection Lines */}
      <div className="relative p-3 sm:p-4 bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl shadow-2xl border-2 border-slate-800 w-full aspect-square max-w-[min(100vw-2rem,390px)] flex items-center justify-center">
        {/* SVG Alignment Lines (The 8 Connecting Paths) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none p-4"
          viewBox="0 0 100 100"
        >
          {/* Outer Border Square */}
          <rect
            x="15"
            y="15"
            width="70"
            height="70"
            fill="none"
            stroke="#334155"
            strokeWidth="2.5"
            rx="4"
          />

          {/* Horizontal Middle Line */}
          <line x1="15" y1="50" x2="85" y2="50" stroke="#334155" strokeWidth="2.5" />

          {/* Vertical Middle Line */}
          <line x1="50" y1="15" x2="50" y2="85" stroke="#334155" strokeWidth="2.5" />

          {/* Diagonal 1: Top-Left to Bottom-Right */}
          <line x1="15" y1="15" x2="85" y2="85" stroke="#334155" strokeWidth="2" strokeDasharray="1 0" />

          {/* Diagonal 2: Top-Right to Bottom-Left */}
          <line x1="85" y1="15" x2="15" y2="85" stroke="#334155" strokeWidth="2" strokeDasharray="1 0" />

          {/* Winning Line Glow Highlight */}
          {winningLine && (
            <line
              x1={nodePositions[winningLine[0]].x}
              y1={nodePositions[winningLine[0]].y}
              x2={nodePositions[winningLine[2]].x}
              y2={nodePositions[winningLine[2]].y}
              stroke="#fbbf24"
              strokeWidth="5"
              strokeLinecap="round"
              className="animate-pulse"
            />
          )}

          {/* Valid Destination Path Glow from selected piece */}
          {selectedCell !== null &&
            validDests.map((destIdx) => (
              <line
                key={`line-${selectedCell}-${destIdx}`}
                x1={nodePositions[selectedCell].x}
                y1={nodePositions[selectedCell].y}
                x2={nodePositions[destIdx].x}
                y2={nodePositions[destIdx].y}
                stroke="#10b981"
                strokeWidth="3"
                strokeDasharray="2 2"
                className="animate-pulse"
              />
            ))}
        </svg>

        {/* 9 Interactive Points / Intersections */}
        <div className="absolute inset-0 p-4">
          {nodePositions.map((pos, idx) => {
            const piece = board[idx];
            const isSelected = selectedCell === idx;
            const isValidDestination = validDests.includes(idx);
            const isWinningNode = winningLine?.includes(idx);

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleCellClick(idx)}
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                disabled={!isMyTurn || status === 'FINISHED'}
                className={`absolute w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-200 outline-none ${
                  isValidDestination
                    ? 'ring-4 ring-emerald-400 bg-emerald-500/20 scale-105 cursor-pointer z-20'
                    : isSelected
                    ? 'ring-4 ring-amber-400 bg-amber-400/20 scale-110 z-20 shadow-lg shadow-amber-500/30'
                    : isWinningNode
                    ? 'ring-4 ring-amber-300 bg-amber-500/30 scale-110 z-20'
                    : 'hover:scale-105 z-10'
                }`}
                title={`Case ${idx + 1}`}
              >
                {/* Node Target Hole on board */}
                <div
                  className={`w-4 h-4 rounded-full border-2 transition-colors ${
                    isValidDestination
                      ? 'bg-emerald-400 border-emerald-200 animate-ping'
                      : piece
                      ? 'hidden'
                      : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                  }`}
                />

                {/* Valid Destination Indicator */}
                {isValidDestination && !piece && (
                  <div className="absolute w-6 h-6 rounded-full bg-emerald-400/80 border-2 border-white shadow-md animate-pulse flex items-center justify-center text-[10px] font-bold text-slate-950">
                    +
                  </div>
                )}

                {/* The Piece Token */}
                {piece === 'P1' && (
                  <div
                    className={`w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 border-2 border-amber-200 shadow-xl flex items-center justify-center text-slate-950 font-black font-['Outfit'] transition-transform ${
                      isSelected ? 'scale-110' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full border border-amber-200/50 flex items-center justify-center shadow-inner">
                      <span className="text-xs sm:text-sm drop-shadow">Or</span>
                    </div>
                  </div>
                )}

                {piece === 'P2' && (
                  <div
                    className={`w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-gradient-to-br from-sky-300 via-sky-500 to-sky-700 border-2 border-sky-200 shadow-xl flex items-center justify-center text-slate-950 font-black font-['Outfit'] transition-transform ${
                      isSelected ? 'scale-110' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full border border-sky-200/50 flex items-center justify-center shadow-inner">
                      <span className="text-xs sm:text-sm drop-shadow">Bleu</span>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Victory Modal Overlay */}
        {status === 'FINISHED' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center z-30 p-6 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center mb-3">
              <Trophy className="w-9 h-9 text-amber-400 animate-bounce" />
            </div>
            <h3 className="text-xl font-black text-white font-['Outfit'] mb-1">
              Victoire !
            </h3>
            <p className="text-sm text-slate-300 font-medium mb-1">
              {blockedPlayer
                ? `Tous les pions adverses (${blockedPlayer === 'P1' ? 'Or' : 'Bleu'}) ont été bloqués !`
                : `Alignement de 3 pions réussi par ${
                    winnerPlayerId === state.playerIds.P1 ? 'Joueur 1 (Or)' : 'Joueur 2 (Bleu)'
                  } !`}
            </p>
            <span className="text-xs text-amber-400 font-semibold mt-2">
              Partie terminée • Bravo aux joueurs !
            </span>
          </div>
        )}
      </div>

      {/* Warning / Rule Banner (Explaining No Jump) */}
      {warningMsg ? (
        <div className="w-full mt-3 p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl flex items-center gap-2.5 text-xs text-rose-300 animate-fade-in shadow-md">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
          <p className="flex-1 font-medium">{warningMsg}</p>
        </div>
      ) : (
        <div className="w-full mt-3 p-2.5 bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-center justify-between gap-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              <strong>Règle d&apos;or :</strong> Aucun saut autorisé. Glissement uniquement vers une case reliée vide.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
