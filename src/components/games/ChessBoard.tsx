import React, { useState } from 'react';
import {
  ChessGameState,
  ChessPieceColor,
  ChessPieceType,
  Player,
} from '../../types/game';
import { getLegalMoves } from '../../game-engines/chess';
import { ChessPieceIcon } from './ChessPieces';
import { sounds } from '../../services/sound';
import { ShieldAlert, Award, Box, Eye } from 'lucide-react';

interface ChessBoardProps {
  state: ChessGameState;
  localPlayer?: Player;
  isMyTurn: boolean;
  onMove: (from: [number, number], to: [number, number], promotion?: ChessPieceType) => void;
  flipBoard?: boolean;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  state,
  localPlayer,
  isMyTurn,
  onMove,
  flipBoard = false,
}) => {
  const [selectedPos, setSelectedPos] = useState<[number, number] | null>(null);
  const [is3DMode, setIs3DMode] = useState<boolean>(true);
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: [number, number];
    to: [number, number];
  } | null>(null);

  const { board, activeColor, inCheck, checkmate, stalemate } = state;

  // Determine legal moves for currently selected square
  const legalTargets = selectedPos
    ? getLegalMoves(board, selectedPos[0], selectedPos[1], state.enPassantTarget)
    : [];

  const handleSquareClick = (r: number, c: number) => {
    if (!isMyTurn || checkmate || stalemate) return;

    const piece = board[r][c];

    // If already selected, check if clicked a valid target square
    if (selectedPos) {
      const isTarget = legalTargets.some(([tr, tc]) => tr === r && tc === c);

      if (isTarget) {
        const movingPiece = board[selectedPos[0]][selectedPos[1]];
        const promoRow = movingPiece?.color === 'w' ? 0 : 7;

        // If pawn promotion needed, show modal
        if (movingPiece?.type === 'p' && r === promoRow) {
          setPendingPromotion({ from: selectedPos, to: [r, c] });
          setSelectedPos(null);
          return;
        }

        // Normal move
        onMove(selectedPos, [r, c]);
        sounds.playMove();
        if (board[r][c]) sounds.playCapture();
        setSelectedPos(null);
        return;
      }
    }

    // Select own piece
    if (piece && piece.color === activeColor) {
      // Ensure local player controls this color if assigned
      if (localPlayer?.color) {
        const myChessColor: ChessPieceColor = localPlayer.color === 'white' ? 'w' : 'b';
        if (piece.color !== myChessColor) return;
      }
      setSelectedPos([r, c]);
      sounds.playMove();
    } else {
      setSelectedPos(null);
    }
  };

  const handlePromotionSelect = (type: ChessPieceType) => {
    if (pendingPromotion) {
      onMove(pendingPromotion.from, pendingPromotion.to, type);
      sounds.playMove();
      setPendingPromotion(null);
    }
  };

  const rows = flipBoard ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const cols = flipBoard ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  return (
    <div className="flex flex-col items-center select-none w-full max-w-xl mx-auto px-1 sm:px-2">
      {/* Top Header: Controls & Status */}
      <div className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-300 bg-slate-900/60 rounded-xl mb-2.5 border border-slate-800">
        {/* Black captured pieces bar */}
        <div className="flex items-center gap-1 min-h-[30px] overflow-x-auto max-w-[50%]">
          {state.capturedByWhite.map((type, i) => (
            <ChessPieceIcon key={i} type={type} color="b" className="w-5 h-5 flex-shrink-0" />
          ))}
          {state.capturedByWhite.length === 0 && (
            <span className="text-[11px] text-slate-500 italic">Aucune prise</span>
          )}
        </div>

        {/* 3D View Toggle & Turn Indicator */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIs3DMode(!is3DMode)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shadow-sm ${
              is3DMode
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-amber-950/40'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'
            }`}
            title="Basculer entre la vue perspective 3D et vue plane"
          >
            {is3DMode ? <Box className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{is3DMode ? 'Bois 3D Réel' : 'Vue 2D'}</span>
            <span className="sm:hidden">{is3DMode ? '3D' : '2D'}</span>
          </button>

          <span className="font-mono text-xs font-semibold">
            {activeColor === 'b' && !checkmate && (
              <span className="text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded-md">
                Trait aux Noirs
              </span>
            )}
            {activeColor === 'w' && !checkmate && (
              <span className="text-slate-200 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-md">
                Trait aux Blancs
              </span>
            )}
          </span>
        </div>
      </div>

      {/* 3D Perspective Scene Container */}
      <div
        className="w-full flex items-center justify-center transition-all duration-300 py-1"
        style={{
          perspective: is3DMode ? '1000px' : 'none',
        }}
      >
        {/* Luxury Handcrafted Wooden Chessboard Frame */}
        <div
          className={`relative p-2 sm:p-4 rounded-2xl w-full aspect-square max-w-[min(100vw-1.5rem,500px)] transition-all duration-300 ${
            is3DMode
              ? 'shadow-[0_25px_50px_-12px_rgba(0,0,0,0.85),0_12px_24px_rgba(30,12,4,0.6)]'
              : 'shadow-2xl'
          }`}
          style={{
            transform: is3DMode ? 'rotateX(15deg) scale(0.97)' : 'none',
            transformOrigin: 'center center',
            background: 'linear-gradient(135deg, #44210f 0%, #291206 50%, #170a04 100%)',
            border: '3px solid #6b3d1b',
            outline: '1px solid #1f0b03',
          }}
        >
          {/* Inlaid Wooden Bevel Rim with Golden Marquetry Line */}
          <div className="absolute inset-1.5 sm:inset-2.5 rounded-xl border border-amber-600/30 pointer-events-none" />

          {/* 64 Chess Squares Grid */}
          <div className="grid grid-cols-8 grid-rows-8 w-full h-full rounded-lg overflow-hidden border-2 border-amber-950 shadow-[inset_0_4px_12px_rgba(0,0,0,0.6)]">
            {rows.map((r) =>
              cols.map((c) => {
                const piece = board[r][c];
                const isDarkSquare = (r + c) % 2 === 1;
                const isSelected = selectedPos && selectedPos[0] === r && selectedPos[1] === c;
                const isTarget = legalTargets.some(([tr, tc]) => tr === r && tc === c);
                const isKingInCheck =
                  inCheck && piece?.type === 'k' && piece?.color === activeColor;

                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    onClick={() => handleSquareClick(r, c)}
                    className={`relative flex items-center justify-center p-0 focus:outline-none transition-colors duration-150 ${
                      isDarkSquare
                        ? 'bg-gradient-to-br from-[#b37946] via-[#9e6635] to-[#804f24]'
                        : 'bg-gradient-to-br from-[#fbf1dc] via-[#f0dda9] to-[#dfc791]'
                    } ${isSelected ? '!from-amber-300 !to-amber-500 shadow-[inset_0_0_12px_rgba(217,119,6,0.8)]' : ''}`}
                  >
                    {/* Coordinate labels engraved on border squares */}
                    {c === (flipBoard ? 7 : 0) && (
                      <span
                        className={`absolute top-0.5 left-1 text-[9px] font-mono font-extrabold pointer-events-none opacity-80 ${
                          isDarkSquare ? 'text-[#fbf1dc]' : 'text-[#70421d]'
                        }`}
                      >
                        {8 - r}
                      </span>
                    )}
                    {r === (flipBoard ? 0 : 7) && (
                      <span
                        className={`absolute bottom-0.5 right-1 text-[9px] font-mono font-extrabold pointer-events-none opacity-80 ${
                          isDarkSquare ? 'text-[#fbf1dc]' : 'text-[#70421d]'
                        }`}
                      >
                        {files[c]}
                      </span>
                    )}

                    {/* King check highlight aura */}
                    {isKingInCheck && (
                      <div className="absolute inset-0 bg-red-600/45 animate-pulse rounded-sm ring-2 ring-red-500 inset-ring-2" />
                    )}

                    {/* 3D Wooden Carved Piece */}
                    {piece && (
                      <div
                        className={`relative z-10 w-full h-full flex items-center justify-center transition-all duration-200 pointer-events-none ${
                          isSelected
                            ? '-translate-y-2 scale-110 drop-shadow-[0_16px_12px_rgba(0,0,0,0.6)]'
                            : 'hover:scale-105'
                        }`}
                        style={{
                          transform: is3DMode
                            ? `${isSelected ? 'translateY(-10px) scale(1.15)' : ''} rotateX(-14deg)`
                            : isSelected
                            ? 'translateY(-8px) scale(1.12)'
                            : undefined,
                          transformOrigin: 'bottom center',
                        }}
                      >
                        <ChessPieceIcon
                          type={piece.type}
                          color={piece.color}
                          className="w-[84%] h-[84%] max-w-[52px] max-h-[52px]"
                        />
                      </div>
                    )}

                    {/* Target dot indicator with pulse */}
                    {isTarget && (
                      <div
                        className={`absolute z-20 pointer-events-none ${
                          piece
                            ? 'inset-0 border-3 border-amber-400 bg-amber-400/20 rounded-none animate-pulse'
                            : 'w-3.5 h-3.5 sm:w-4 sm:h-4 bg-amber-900/70 border-2 border-amber-300/80 rounded-full shadow-md animate-pulse'
                        }`}
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Promotion Modal Overlay */}
          {pendingPromotion && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center z-30 p-4 border border-amber-600/40 shadow-2xl">
              <h4 className="text-base font-bold text-amber-200 mb-1 font-['Outfit'] text-center">
                Couronnement du Pion
              </h4>
              <p className="text-xs text-slate-300 mb-4 text-center">
                Choisissez votre nouvelle pièce en bois massif :
              </p>
              <div className="flex gap-3 bg-stone-900/80 p-3 rounded-2xl border border-stone-700/60 shadow-inner">
                {(['q', 'r', 'b', 'n'] as ChessPieceType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => handlePromotionSelect(type)}
                    className="p-3 bg-gradient-to-b from-stone-800 to-stone-900 hover:from-amber-950 hover:to-stone-900 border border-stone-600 hover:border-amber-400 rounded-xl hover:scale-115 active:scale-95 transition-all shadow-md group"
                    title={`Promouvoir en ${
                      type === 'q' ? 'Dame' : type === 'r' ? 'Tour' : type === 'b' ? 'Fou' : 'Cavalier'
                    }`}
                  >
                    <ChessPieceIcon type={type} color={activeColor} className="w-11 h-11" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Game Over Banner Overlay */}
          {(checkmate || stalemate) && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center z-30 p-6 text-center animate-fade-in border border-amber-500/40">
              <div className="p-3 bg-amber-500/20 rounded-2xl border border-amber-500/40 mb-3 shadow-lg">
                <Award className="w-10 h-10 text-amber-400" />
              </div>
              <h3 className="text-2xl font-black text-white font-['Outfit'] mb-1 tracking-tight">
                {checkmate ? 'Échec et Mat !' : 'Partie Nulle (Pat)'}
              </h3>
              <p className="text-sm font-medium text-amber-200 mb-2">
                {checkmate
                  ? `Victoire incontestable des ${activeColor === 'w' ? 'Noirs' : 'Blancs'} !`
                  : 'Aucun coup légal restant — match nul.'}
              </p>
              <p className="text-xs text-slate-400">
                Vous pouvez relancer une nouvelle partie ou changer de jeu depuis le salon.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer: White captured pieces bar */}
      <div className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-300 bg-slate-900/60 rounded-xl mt-2.5 border border-slate-800">
        <div className="flex items-center gap-1 min-h-[30px] overflow-x-auto max-w-[60%]">
          {state.capturedByBlack.map((type, i) => (
            <ChessPieceIcon key={i} type={type} color="w" className="w-5 h-5 flex-shrink-0" />
          ))}
          {state.capturedByBlack.length === 0 && (
            <span className="text-[11px] text-slate-500 italic">Aucune pièce capturée</span>
          )}
        </div>
        <div className="text-[11px] text-amber-400/90 font-medium">
          Bois sculpté • Marqueterie artisanale
        </div>
      </div>

      {/* In-check alert chip if active */}
      {inCheck && !checkmate && (
        <div className="mt-2.5 flex items-center gap-2 text-xs font-bold text-rose-300 bg-rose-950/70 border border-rose-700/60 px-4 py-1.5 rounded-full shadow-lg animate-bounce">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>Échec au Roi ! Protégez votre Roi immédiatement.</span>
        </div>
      )}
    </div>
  );
};
