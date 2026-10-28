import React from 'react';
import { Player, TicTacToeGameState } from '../../types/game';
import { Trophy, X as XIcon, Circle } from 'lucide-react';
import { sounds } from '../../services/sound';

interface TicTacToeBoardProps {
  state: TicTacToeGameState;
  localPlayer?: Player;
  isMyTurn: boolean;
  onPlayMove: (cellIndex: number) => void;
}

export const TicTacToeBoard: React.FC<TicTacToeBoardProps> = ({
  state,
  localPlayer,
  isMyTurn,
  onPlayMove,
}) => {
  const { board, activeSymbol, status, winningLine, winnerPlayerId } = state;

  const handleCellClick = (index: number) => {
    if (!isMyTurn || status === 'FINISHED') return;
    if (board[index] !== null) return;

    onPlayMove(index);
    sounds.playMove();
  };

  return (
    <div className="flex flex-col items-center select-none w-full max-w-sm mx-auto">
      {/* Turn indicator */}
      <div className="w-full flex items-center justify-between px-3 py-2 bg-slate-900 rounded-xl border border-slate-800 mb-4 text-xs">
        <div className="flex items-center gap-2">
          {activeSymbol === 'X' ? (
            <XIcon className="w-4 h-4 text-amber-400" />
          ) : (
            <Circle className="w-4 h-4 text-sky-400" />
          )}
          <span className="text-white font-medium">
            Tour : <span className="font-bold">{activeSymbol}</span>
          </span>
        </div>
        <span className="text-slate-400 font-mono">
          {isMyTurn ? 'À votre tour' : 'Attente joueur...'}
        </span>
      </div>

      {/* Main 3x3 Grid */}
      <div className="relative p-3 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 w-full aspect-square max-w-[340px]">
        <div className="grid grid-cols-3 grid-rows-3 gap-2.5 w-full h-full">
          {board.map((cell, idx) => {
            const isWinningCell = winningLine?.includes(idx);

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleCellClick(idx)}
                disabled={!isMyTurn || status === 'FINISHED' || cell !== null}
                className={`rounded-xl flex items-center justify-center text-4xl font-bold transition-all ${
                  cell === null
                    ? 'bg-slate-800/80 hover:bg-slate-800 border border-slate-700/50 cursor-pointer'
                    : 'bg-slate-950 border border-slate-800 cursor-default'
                } ${isWinningCell ? '!bg-amber-500/20 ring-2 ring-amber-400 animate-pulse' : ''}`}
              >
                {cell === 'X' && (
                  <XIcon className="w-12 h-12 text-amber-400 drop-shadow-md transition-transform scale-100" />
                )}
                {cell === 'O' && (
                  <Circle className="w-11 h-11 text-sky-400 drop-shadow-md transition-transform scale-100" />
                )}
              </button>
            );
          })}
        </div>

        {/* Victory Overlay */}
        {status === 'FINISHED' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-30 p-6 text-center animate-fade-in">
            <Trophy className="w-10 h-10 text-amber-400 mb-2" />
            <h3 className="text-lg font-bold text-white font-['Outfit'] mb-1">
              {winnerPlayerId === 'DRAW' ? 'Match Nul !' : 'Victoire !'}
            </h3>
            <p className="text-xs text-slate-300">
              {winnerPlayerId === 'DRAW'
                ? 'Aucun alignement trouvé.'
                : `Victoire du joueur ${activeSymbol === 'X' ? 'O' : 'X'} !`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
