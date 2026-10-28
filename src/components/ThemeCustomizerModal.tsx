import React from 'react';
import {
  X,
  Palette,
  Check,
  Crown,
  Swords,
  Grid3X3,
  Sparkles,
  Layers,
} from 'lucide-react';
import {
  BOARD_THEMES,
  CHECKERS_PIECE_THEMES,
  CHESS_PIECE_THEMES,
  CONNECT4_THEMES,
  TICTACTOE_THEMES,
  UserThemesState,
} from '../types/themes';
import { GameType } from '../types/game';

interface ThemeCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeGame: GameType;
  currentThemes: UserThemesState;
  onUpdateThemes: (newThemes: Partial<UserThemesState>) => void;
  checkersBoardSize?: 8 | 10;
  onChangeCheckersSize?: (size: 8 | 10) => void;
}

export const ThemeCustomizerModal: React.FC<ThemeCustomizerModalProps> = ({
  isOpen,
  onClose,
  activeGame,
  currentThemes,
  onUpdateThemes,
  checkersBoardSize = 8,
  onChangeCheckersSize,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-300">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white font-['Outfit']">
                Personnalisation de la Planche & des Pions
              </h3>
              <p className="text-xs text-slate-400">
                Modifiez les textures de plateau, les couleurs de pions et le format de jeu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* SECTION: CHECKERS BOARD SIZE & PAWNS COUNT (IF CHECKERS) */}
          {activeGame === 'checkers' && onChangeCheckersSize && (
            <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs sm:text-sm font-bold text-white font-['Outfit']">
                    Nombre de Pions & Format du Damier
                  </h4>
                </div>
                <span className="text-[10px] uppercase font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                  {checkersBoardSize === 10 ? '20 Pions / Joueur' : '12 Pions / Joueur'}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Au Sénégal et en Afrique de l’Ouest, le <strong>Grand Damier 10x10 à 20 pions</strong> (100 cases) est le format roi des grands maîtres !
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* 10x10 button */}
                <button
                  type="button"
                  onClick={() => onChangeCheckersSize(10)}
                  className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                    checkersBoardSize === 10
                      ? 'bg-amber-400/15 border-amber-400 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-amber-400 text-slate-950 font-black text-xs font-mono shrink-0">
                    10x10
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold font-['Outfit'] text-white">
                        🇸🇳 Grand Damier Sénégalais
                      </span>
                      {checkersBoardSize === 10 && (
                        <Check className="w-3.5 h-3.5 text-amber-400" />
                      )}
                    </div>
                    <span className="text-[11px] text-amber-200/80 block mt-0.5">
                      20 pions vs 20 pions (100 cases)
                    </span>
                  </div>
                </button>

                {/* 8x8 button */}
                <button
                  type="button"
                  onClick={() => onChangeCheckersSize(8)}
                  className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                    checkersBoardSize === 8
                      ? 'bg-amber-400/15 border-amber-400 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-slate-800 text-amber-300 font-black text-xs font-mono shrink-0">
                    8x8
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold font-['Outfit'] text-white">
                        Damier Standard
                      </span>
                      {checkersBoardSize === 8 && (
                        <Check className="w-3.5 h-3.5 text-amber-400" />
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      12 pions vs 12 pions (64 cases)
                    </span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* SECTION: BOARD (PLANCHE) THEMES FOR CHECKERS & CHESS */}
          {(activeGame === 'checkers' || activeGame === 'chess') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-bold text-white font-['Outfit'] flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400" />
                  Texture & Teinte de la Planche (Damier / Échiquier)
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {Object.values(BOARD_THEMES).map((th) => {
                  const isSel = currentThemes.boardTheme === th.id;
                  return (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => onUpdateThemes({ boardTheme: th.id })}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                        isSel
                          ? 'bg-amber-400/15 border-amber-400 text-white shadow-md ring-1 ring-amber-400/50'
                          : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {/* Mini preview tile */}
                      <div
                        className="w-10 h-10 rounded-xl border border-white/20 shadow-inner shrink-0"
                        style={{ background: th.previewBg }}
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold block truncate text-white">
                          {th.name}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          Style bois noble & finitions
                        </span>
                      </div>
                      {isSel && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION: CHECKERS PIECES COLORS */}
          {activeGame === 'checkers' && (
            <div className="space-y-3">
              <h4 className="text-xs sm:text-sm font-bold text-white font-['Outfit'] flex items-center gap-2">
                <Palette className="w-4 h-4 text-rose-400" />
                Couleurs & Finition des Pions de Dames
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {CHECKERS_PIECE_THEMES.map((pt) => {
                  const isSel = currentThemes.checkersPieceTheme === pt.id;
                  return (
                    <button
                      key={pt.id}
                      type="button"
                      onClick={() => onUpdateThemes({ checkersPieceTheme: pt.id })}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                        isSel
                          ? 'bg-amber-400/15 border-amber-400 text-white shadow-md ring-1 ring-amber-400/50'
                          : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {/* 2 pawns preview */}
                      <div className="flex items-center gap-1 shrink-0 p-1 bg-slate-900 rounded-xl border border-slate-800">
                        <div
                          className={`w-6 h-6 rounded-full border shadow-sm ${pt.previewP1}`}
                        />
                        <div
                          className={`w-6 h-6 rounded-full border shadow-sm ${pt.previewP2}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold block truncate text-white">
                          {pt.name}
                        </span>
                        <span className="text-[10px] text-amber-300 block truncate font-mono">
                          {pt.label}
                        </span>
                      </div>
                      {isSel && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION: CHESS PIECES STYLE */}
          {activeGame === 'chess' && (
            <div className="space-y-3">
              <h4 className="text-xs sm:text-sm font-bold text-white font-['Outfit'] flex items-center gap-2">
                <Swords className="w-4 h-4 text-amber-400" />
                Finition des Pièces d’Échecs
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {CHESS_PIECE_THEMES.map((pt) => {
                  const isSel = currentThemes.chessPieceTheme === pt.id;
                  return (
                    <button
                      key={pt.id}
                      type="button"
                      onClick={() => onUpdateThemes({ chessPieceTheme: pt.id })}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                        isSel
                          ? 'bg-amber-400/15 border-amber-400 text-white shadow-md ring-1 ring-amber-400/50'
                          : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1 shrink-0 p-1 bg-slate-900 rounded-xl border border-slate-800">
                        <div
                          className={`w-6 h-6 rounded-md border flex items-center justify-center font-bold text-[10px] text-slate-900 ${pt.previewP1}`}
                        >
                          ♞
                        </div>
                        <div
                          className={`w-6 h-6 rounded-md border flex items-center justify-center font-bold text-[10px] text-white ${pt.previewP2}`}
                        >
                          ♞
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold block truncate text-white">
                          {pt.name}
                        </span>
                        <span className="text-[10px] text-amber-300 block truncate">
                          {pt.label}
                        </span>
                      </div>
                      {isSel && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION: CONNECT 4 THEMES */}
          {activeGame === 'connect4' && (
            <div className="space-y-3">
              <h4 className="text-xs sm:text-sm font-bold text-white font-['Outfit'] flex items-center gap-2">
                <Grid3X3 className="w-4 h-4 text-sky-400" />
                Thèmes de Cadre & Jetons (Puissance 4)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {CONNECT4_THEMES.map((c4) => {
                  const isSel = currentThemes.connect4Theme === c4.id;
                  return (
                    <button
                      key={c4.id}
                      type="button"
                      onClick={() => onUpdateThemes({ connect4Theme: c4.id })}
                      className={`p-3 rounded-2xl border text-left flex flex-col gap-2 transition-all ${
                        isSel
                          ? 'bg-amber-400/15 border-amber-400 text-white shadow-md ring-1 ring-amber-400/50'
                          : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold truncate text-white">{c4.name}</span>
                        {isSel && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                      </div>
                      <div className={`p-2 rounded-xl flex items-center justify-around ${c4.frame}`}>
                        <div className={`w-5 h-5 rounded-full shadow ${c4.disc1}`} />
                        <div className={`w-5 h-5 rounded-full shadow ${c4.disc2}`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION: TIC-TAC-TOE THEMES */}
          {activeGame === 'tictactoe' && (
            <div className="space-y-3">
              <h4 className="text-xs sm:text-sm font-bold text-white font-['Outfit'] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Styles de Symboles X et O (Morpion)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {TICTACTOE_THEMES.map((tt) => {
                  const isSel = currentThemes.tictactoeTheme === tt.id;
                  return (
                    <button
                      key={tt.id}
                      type="button"
                      onClick={() => onUpdateThemes({ tictactoeTheme: tt.id })}
                      className={`p-3 rounded-2xl border text-left flex flex-col gap-2 transition-all ${
                        isSel
                          ? 'bg-amber-400/15 border-amber-400 text-white shadow-md ring-1 ring-amber-400/50'
                          : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold truncate text-white">{tt.name}</span>
                        {isSel && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                      </div>
                      <div className="p-2.5 bg-slate-950 rounded-xl flex items-center justify-around border border-slate-800">
                        <span className={`text-xl font-black ${tt.colorX}`}>X</span>
                        <span className={`text-xl font-black ${tt.colorO}`}>O</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Vos préférences esthétiques sont automatiquement enregistrées.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors"
          >
            Appliquer & Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
