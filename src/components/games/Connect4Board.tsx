import React, { useState } from 'react';
import { Connect4GameState, Player } from '../../types/game';
import { C4_COLS, C4_ROWS } from '../../game-engines/connect4';
import { Trophy } from 'lucide-react';
import { sounds } from '../../services/sound';

interface Connect4BoardProps {
  state: Connect4GameState;
  localPlayer?: Player;
  isMyTurn: boolean;
  onDropDisc: (colIndex: number) => void;
}

export const Connect4Board: React.FC<Connect4BoardProps> = ({
  state,
  localPlayer,
  isMyTurn,
  onDropDisc,
}) => {
  const [hoverCol, setHoverCol] = useState<number | null>(null);
  const { grid, activeDisc, status, winningCoords, winnerPlayerId } = state;

  const handleColClick = (c: number) => {
    if (!isMyTurn || status === 'FINISHED') return;
    if (grid[0][c] !== null) return; // Column full

    onDropDisc(c);
    sounds.playMove();
  };

  const isWinningCell = (r: number, c: number) => {
    return winningCoords?.some(([wr, wc]) => wr === r && wc === c);
  };

  return (
    <div className="flex flex-col items-center select-none w-full max-w-lg mx-auto">
      {/* Turn indicator */}
      <div className="w-full flex items-center justify-between px-3 py-2 bg-slate-900 rounded-xl border border-slate-800 mb-3 text-xs">
        <div className="flex items-center gap-2">
          <div
            className={`w-3.5 h-3.5 rounded-full ${
              activeDisc === 'red' ? 'bg-rose-500' : 'bg-amber-400'
            } shadow`}
          />
          <span className="text-white font-medium">
            Tour :{' '}
            <span
              className={
                activeDisc === 'red' ? 'text-rose-400 font-bold' : 'text-amber-300 font-bold'
              }
            >
              {activeDisc === 'red' ? 'Rouge' : 'Jaune'}
            </span>
          </span>
        </div>
        <span className="text-slate-400 font-mono">
          {isMyTurn ? 'À vous de jouer !' : 'En attente de l’adversaire...'}
        </span>
      </div>

      {/* Main Connect 4 Vertical Board */}
      <div className="relative p-2.5 sm:p-4 bg-blue-900 rounded-2xl shadow-2xl border-4 border-blue-950 w-full max-w-[min(100vw-1.5rem,460px)]">
        {/* Column Drop Indicator Strip */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2 px-1">
          {Array.from({ length: C4_COLS }).map((_, c) => (
            <button
              key={`drop-btn-${c}`}
              type="button"
              onClick={() => handleColClick(c)}
              onMouseEnter={() => setHoverCol(c)}
              onMouseLeave={() => setHoverCol(null)}
              disabled={!isMyTurn || status === 'FINISHED' || grid[0][c] !== null}
              className={`h-8 sm:h-7 rounded-lg flex items-center justify-center transition-colors ${
                isMyTurn && status !== 'FINISHED' && grid[0][c] === null
                  ? 'bg-blue-950/60 hover:bg-blue-950 text-blue-300 cursor-pointer active:scale-90'
                  : 'opacity-40 cursor-not-allowed'
              }`}
              title={`Déposer en colonne ${c + 1}`}
            >
              <div
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full transition-transform ${
                  hoverCol === c && isMyTurn && status !== 'FINISHED' && grid[0][c] === null
                    ? activeDisc === 'red'
                      ? 'bg-rose-500 scale-110 shadow'
                      : 'bg-amber-400 scale-110 shadow'
                    : 'bg-blue-700/60'
                }`}
              />
            </button>
          ))}
        </div>

        {/* 6 Rows x 7 Columns Board Grid */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3 p-2 bg-blue-800 rounded-xl shadow-inner border border-blue-700">
          {Array.from({ length: C4_ROWS }).map((_, r) =>
            Array.from({ length: C4_COLS }).map((_, c) => {
              const disc = grid[r][c];
              const isWin = isWinningCell(r, c);

              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  onClick={() => handleColClick(c)}
                  onMouseEnter={() => setHoverCol(c)}
                  onMouseLeave={() => setHoverCol(null)}
                  disabled={!isMyTurn || status === 'FINISHED'}
                  className={`aspect-square rounded-full flex items-center justify-center focus:outline-none transition-all ${
                    disc === null
                      ? 'bg-blue-950/90 shadow-inner hover:bg-blue-950'
                      : disc === 'red'
                      ? 'bg-gradient-to-br from-rose-500 to-rose-700 shadow-md border-2 border-rose-400'
                      : 'bg-gradient-to-br from-amber-300 to-amber-500 shadow-md border-2 border-amber-200'
                  } ${isWin ? 'ring-4 ring-white animate-pulse scale-105 z-10' : ''}`}
                >
                  {/* Subtle inner concentric disc depth */}
                  {disc && (
                    <div className="w-8/12 h-8/12 rounded-full border border-black/15 shadow-inner" />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Victory Overlay */}
        {status === 'FINISHED' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-30 p-6 text-center animate-fade-in">
            <Trophy className="w-12 h-12 text-amber-400 mb-2" />
            <h3 className="text-xl font-bold text-white font-['Outfit'] mb-1">
              {winnerPlayerId === 'DRAW' ? 'Égalité parfaite !' : 'Puissance 4 !'}
            </h3>
            <p className="text-sm text-slate-300">
              {winnerPlayerId === 'DRAW'
                ? 'La grille est pleine.'
                : `Victoire des jetons ${activeDisc === 'red' ? 'Jaunes' : 'Rouges'} !`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
