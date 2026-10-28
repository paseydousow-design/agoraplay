import React, { useState, useEffect } from 'react';
import {
  AnyGameState,
  BotDifficulty,
  ChessPieceType,
  GameRoom,
  GameType,
  Player,
} from '../types/game';
import { CheckersMove } from '../game-engines/checkers';
import { ChessBoard } from './games/ChessBoard';
import { CheckersBoard } from './games/CheckersBoard';
import { LudoBoard } from './games/LudoBoard';
import { Connect4Board } from './games/Connect4Board';
import { TicTacToeBoard } from './games/TicTacToeBoard';
import { ThreeMorrisBoard } from './games/ThreeMorrisBoard';
import { ChatPanel } from './ChatPanel';
import { ShareModal } from './ShareModal';
import { GameGuideModal } from './GameGuideModal';
import { ThemeCustomizerModal } from './ThemeCustomizerModal';
import {
  RotateCcw,
  Share2,
  LogOut,
  Users,
  Lock,
  Bot,
  ScrollText,
  Volume2,
  VolumeX,
  MessageSquare,
  Swords,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Radio,
  BookOpen,
  Palette,
} from 'lucide-react';
import { sounds } from '../services/sound';
import confetti from 'canvas-confetti';
import { loadUserThemes, saveUserThemes, UserThemesState } from '../types/themes';

interface HistorySnapshot {
  turnNumber: number;
  moveStr: string;
  state: AnyGameState;
}

interface RoomViewProps {
  room: GameRoom;
  currentUser: { id: string; name: string };
  isBotMode?: boolean;
  onSendAction: (action: Record<string, unknown>) => void;
  onSendChat: (text: string) => void;
  onRequestRematch: () => void;
  onSwitchGame: (gameType: GameType) => void;
  onLeaveRoom: () => void;
  onAddBotOpponent?: () => void;
  onChangeBotDifficulty?: (difficulty: BotDifficulty) => void;
}

export const RoomView: React.FC<RoomViewProps> = ({
  room,
  currentUser,
  isBotMode = false,
  onSendAction,
  onSendChat,
  onRequestRematch,
  onSwitchGame,
  onLeaveRoom,
  onAddBotOpponent,
  onChangeBotDifficulty,
}) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [userThemes, setUserThemes] = useState<UserThemesState>(loadUserThemes);
  const [activeSideTab, setActiveSideTab] = useState<'chat' | 'history'>('chat');
  const [mobileTab, setMobileTab] = useState<'board' | 'chat' | 'players'>('board');
  const [soundMuted, setSoundMuted] = useState(false);

  const handleUpdateThemes = (newThemes: Partial<UserThemesState>) => {
    setUserThemes((prev) => {
      const updated = { ...prev, ...newThemes };
      saveUserThemes(updated);
      return updated;
    });
  };

  // Move Replay & History Snapshots State
  const [snapshots, setSnapshots] = useState<HistorySnapshot[]>([]);
  const [replayIndex, setReplayIndex] = useState<number | null>(null);

  const { config, players, gameState, chat, rematchVotes } = room;

  // Track & accumulate board snapshots for replay
  useEffect(() => {
    setSnapshots((prev) => {
      // If empty or freshly reset, capture initial board
      if (prev.length === 0 || (gameState.turnNumber <= 1 && gameState.moveHistory.length === 0)) {
        return [
          {
            turnNumber: 0,
            moveStr: 'Position de départ',
            state: JSON.parse(JSON.stringify(gameState)),
          },
        ];
      }

      const currentHistoryLen = gameState.moveHistory.length;
      // If new moves occurred, append the state
      if (currentHistoryLen >= prev.length) {
        const lastMoveStr =
          gameState.moveHistory[currentHistoryLen - 1] || `Coup #${gameState.turnNumber}`;
        return [
          ...prev,
          {
            turnNumber: gameState.turnNumber,
            moveStr: lastMoveStr,
            state: JSON.parse(JSON.stringify(gameState)),
          },
        ];
      }

      return prev;
    });
  }, [gameState.moveHistory.length, gameState.turnNumber, config.key, config.gameType]);

  // If in live mode or user makes move, auto-return to live board
  const isReplaying = replayIndex !== null;
  const displayedState = isReplaying && snapshots[replayIndex] ? snapshots[replayIndex].state : gameState;

  // Identify local player
  const localPlayer = players.find((p) => p.id === currentUser.id);
  const isHost = localPlayer?.isHost ?? false;

  // Turn check (disabled during past replay)
  const isMyTurn =
    !isReplaying &&
    gameState.status === 'PLAYING' &&
    (isBotMode
      ? gameState.currentTurnPlayerId === currentUser.id
      : gameState.currentTurnPlayerId === currentUser.id ||
        (players.length === 1 && isHost)); // allow solo testing on board if waiting

  // Trigger celebratory confetti on victory
  useEffect(() => {
    if (gameState.status === 'FINISHED' && gameState.winnerPlayerId && gameState.winnerPlayerId !== 'DRAW') {
      sounds.playVictory();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore if canvas unavailable
      }
    }
  }, [gameState.status, gameState.winnerPlayerId]);

  // Handle Chess move
  const handleChessMove = (
    from: [number, number],
    to: [number, number],
    promotion?: ChessPieceType
  ) => {
    if (isReplaying) setReplayIndex(null);
    onSendAction({
      from,
      to,
      promotion: promotion || 'q',
    });
  };

  // Handle Checkers move
  const handleCheckersMove = (move: CheckersMove) => {
    if (isReplaying) setReplayIndex(null);
    onSendAction({ move });
  };

  // Handle Ludo actions
  const handleLudoRollDice = () => {
    if (isReplaying) setReplayIndex(null);
    onSendAction({ type: 'roll_dice' });
  };

  const handleLudoMoveToken = (tokenId: number) => {
    if (isReplaying) setReplayIndex(null);
    onSendAction({ type: 'move_token', tokenId });
  };

  // Handle Connect 4
  const handleConnect4Drop = (colIndex: number) => {
    if (isReplaying) setReplayIndex(null);
    onSendAction({ colIndex });
  };

  // Handle Tic-Tac-Toe
  const handleTicTacToePlay = (cellIndex: number) => {
    if (isReplaying) setReplayIndex(null);
    onSendAction({ cellIndex });
  };

  // Handle Jeu des 3 Pions (Marelle à 3 / Achi)
  const handleThreeMorrisPlacement = (cellIndex: number) => {
    if (isReplaying) setReplayIndex(null);
    onSendAction({ type: 'placement', cellIndex });
  };

  const handleThreeMorrisMovement = (fromIndex: number, toIndex: number) => {
    if (isReplaying) setReplayIndex(null);
    onSendAction({ type: 'movement', from: fromIndex, to: toIndex });
  };

  // Replay Navigation Handlers
  const handleReplayFirst = () => {
    if (snapshots.length > 0) {
      setReplayIndex(0);
      sounds.playMove();
    }
  };

  const handleReplayPrev = () => {
    if (snapshots.length <= 1) return;
    if (replayIndex === null) {
      setReplayIndex(Math.max(0, snapshots.length - 2));
    } else {
      setReplayIndex(Math.max(0, replayIndex - 1));
    }
    sounds.playMove();
  };

  const handleReplayNext = () => {
    if (replayIndex === null) return;
    if (replayIndex >= snapshots.length - 1) {
      setReplayIndex(null); // return to live
    } else {
      setReplayIndex(replayIndex + 1);
    }
    sounds.playMove();
  };

  const handleReplayLive = () => {
    setReplayIndex(null);
    sounds.playMove();
  };

  const gameTitles: Record<GameType, string> = {
    chess: 'Échecs',
    checkers: 'Jeu de Dames',
    ludo: 'Ludo (Petits Chevaux)',
    connect4: 'Puissance 4',
    tictactoe: 'Morpion',
    three_morris: 'Jeu des 3 Pions',
  };

  const hasVotedRematch = rematchVotes.includes(currentUser.id);
  const currentDiff = room.botDifficulty || 'medium';

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Game Header Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Room info, Key badge & Game Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-amber-400/10 border border-amber-400/30 rounded-xl text-amber-300 hover:bg-amber-400/20 transition-colors group"
              title="Cliquer pour partager le code du salon"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono font-bold text-xs sm:text-sm tracking-wider">
                {config.key}
              </span>
              <Share2 className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform ml-0.5" />
            </button>

            <div className="h-4 w-[1px] bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="font-['Outfit'] font-bold text-white text-sm sm:text-base">
                {gameTitles[config.gameType]}
              </span>
              {isBotMode && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Bot className="w-3 h-3" />
                    Solo IA
                  </span>

                  {/* Difficulty selector pills during Solo match */}
                  {onChangeBotDifficulty && (
                    <div className="hidden sm:flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                      <button
                        type="button"
                        onClick={() => onChangeBotDifficulty('easy')}
                        className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                          currentDiff === 'easy'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'text-slate-400 hover:text-white'
                        }`}
                        title="Niveau Débutant"
                      >
                        Facile
                      </button>
                      <button
                        type="button"
                        onClick={() => onChangeBotDifficulty('medium')}
                        className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                          currentDiff === 'medium'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'text-slate-400 hover:text-white'
                        }`}
                        title="Niveau Équilibré"
                      >
                        Moyen
                      </button>
                      <button
                        type="button"
                        onClick={() => onChangeBotDifficulty('hard')}
                        className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                          currentDiff === 'hard'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'text-slate-400 hover:text-white'
                        }`}
                        title="Niveau Expert / Maître"
                      >
                        Difficile
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Header actions */}
          <div className="flex items-center gap-2">
            {/* Theme & Palette Button */}
            <button
              onClick={() => setIsThemeModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 rounded-xl text-xs font-semibold transition-colors shadow-sm"
              title="Personnaliser les textures de planche et les couleurs des pions"
            >
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Planches &amp; Pions</span>
            </button>

            {/* Guide & Astuces Button */}
            <button
              onClick={() => setIsGuideOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 hover:text-amber-200 text-xs font-semibold rounded-xl border border-amber-400/30 transition-all shadow-sm"
              title="Voir les règles et les astuces stratégiques"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Astuces &amp; Démos</span>
            </button>

            <button
              onClick={() => {
                setSoundMuted(!soundMuted);
                sounds.enabled = soundMuted;
              }}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title={soundMuted ? 'Activer le son' : 'Couper le son'}
            >
              {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              Inviter un Ami
            </button>

            <button
              onClick={onLeaveRoom}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-950/40 border border-rose-900/40 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Quitter
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Segmented Navigation Bar */}
      <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-3 py-2 sticky top-16 z-30">
        <div className="flex items-center justify-around gap-1 max-w-md mx-auto bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setMobileTab('board')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              mobileTab === 'board'
                ? 'bg-amber-400 text-slate-950 shadow font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Plateau</span>
          </button>

          <button
            onClick={() => setMobileTab('chat')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              mobileTab === 'chat'
                ? 'bg-amber-400 text-slate-950 shadow font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Discussion</span>
            {chat.length > 0 && (
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                mobileTab === 'chat' ? 'bg-slate-900 text-amber-300' : 'bg-slate-800 text-slate-300'
              }`}>
                {chat.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setMobileTab('players')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              mobileTab === 'players'
                ? 'bg-amber-400 text-slate-950 shadow font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Salon ({players.length})</span>
          </button>
        </div>
      </div>

      {/* Main Playing Grid */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-2 sm:p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* Left / Center Area: Board, Replay & Status */}
        <div className={`lg:col-span-8 flex flex-col items-center ${mobileTab === 'board' ? 'flex' : 'hidden lg:flex'}`}>
          {/* Waiting for opponent notice if only 1 player */}
          {players.length === 1 && !isBotMode && (
            <div className="w-full mb-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div>
                <h4 className="text-sm font-semibold text-amber-300 font-['Outfit']">
                  En attente de votre adversaire...
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Partagez la clé <strong>{config.key}</strong> pour qu&apos;un ami vous rejoigne en temps réel.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="px-3 py-1.5 bg-amber-400 text-slate-950 text-xs font-semibold rounded-lg hover:bg-amber-300 transition-colors"
                >
                  Copier la Clé
                </button>
                {onAddBotOpponent && (
                  <button
                    onClick={onAddBotOpponent}
                    className="px-3 py-1.5 bg-slate-800 text-slate-200 hover:text-white border border-slate-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    Jouer contre un Bot IA
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Replay Banner Notification when inspecting past moves */}
          {isReplaying && (
            <div className="w-full max-w-xl mb-3 p-3 bg-amber-500/20 border-2 border-amber-400/60 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-200 shadow-xl animate-fade-in">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                <span>
                  Visionnage du coup <strong>#{replayIndex}</strong> :{' '}
                  <span className="text-white font-mono font-bold">
                    {snapshots[replayIndex]?.moveStr || 'Position historique'}
                  </span>
                </span>
              </div>
              <button
                type="button"
                onClick={handleReplayLive}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow transition-transform active:scale-95 shrink-0 flex items-center gap-1"
              >
                <Radio className="w-3 h-3 text-red-600 animate-pulse" />
                Revenir au direct
              </button>
            </div>
          )}

          {/* Active Game Board Render (Shows historical snapshot if replaying, or live board) */}
          <div className="w-full flex justify-center py-2 relative">
            {config.gameType === 'chess' && (
              <ChessBoard
                state={displayedState as AnyGameState & { gameType: 'chess' }}
                localPlayer={localPlayer}
                isMyTurn={isMyTurn}
                onMove={handleChessMove}
                flipBoard={localPlayer?.color === 'black'}
              />
            )}

            {config.gameType === 'checkers' && (
              <CheckersBoard
                state={displayedState as AnyGameState & { gameType: 'checkers' }}
                localPlayer={localPlayer}
                isMyTurn={isMyTurn}
                onMove={handleCheckersMove}
                onChangeVariant={(variant) => onSendAction({ type: 'change_variant', variant })}
                onChangeBoardSize={(size) => onSendAction({ type: 'change_board_size', size })}
                boardThemeId={userThemes.boardTheme}
                pieceThemeId={userThemes.checkersPieceTheme}
                onOpenThemes={() => setIsThemeModalOpen(true)}
                flipBoard={localPlayer?.color === 'red'}
              />
            )}

            {config.gameType === 'ludo' && (
              <LudoBoard
                state={displayedState as AnyGameState & { gameType: 'ludo' }}
                localPlayer={localPlayer}
                isMyTurn={isMyTurn}
                onRollDice={handleLudoRollDice}
                onMoveToken={handleLudoMoveToken}
                onChangeMode={(mode) => onSendAction({ type: 'change_ludo_mode', mode })}
              />
            )}

            {config.gameType === 'connect4' && (
              <Connect4Board
                state={displayedState as AnyGameState & { gameType: 'connect4' }}
                localPlayer={localPlayer}
                isMyTurn={isMyTurn}
                onDropDisc={handleConnect4Drop}
              />
            )}

            {config.gameType === 'tictactoe' && (
              <TicTacToeBoard
                state={displayedState as AnyGameState & { gameType: 'tictactoe' }}
                localPlayer={localPlayer}
                isMyTurn={isMyTurn}
                onPlayMove={handleTicTacToePlay}
              />
            )}

            {config.gameType === 'three_morris' && (
              <ThreeMorrisBoard
                state={displayedState as AnyGameState & { gameType: 'three_morris' }}
                localPlayer={localPlayer}
                isMyTurn={isMyTurn}
                onPlayPlacement={handleThreeMorrisPlacement}
                onPlayMovement={handleThreeMorrisMovement}
              />
            )}
          </div>

          {/* Interactive Move Replay Controller Bar */}
          <div className="w-full max-w-xl mt-3 p-3 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-2 shadow-lg">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleReplayFirst}
                disabled={snapshots.length <= 1 || replayIndex === 0}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Premier coup (Position de départ)"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleReplayPrev}
                disabled={snapshots.length <= 1 || replayIndex === 0}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors text-xs font-semibold"
                title="Coup précédent"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Précédent</span>
              </button>
            </div>

            {/* Replay Position Indicator */}
            <div className="text-center px-2">
              <span className="text-xs font-mono font-bold text-amber-300">
                {replayIndex !== null
                  ? `Coup #${replayIndex} / ${Math.max(1, snapshots.length - 1)}`
                  : `Direct (${gameState.moveHistory.length} coups)`}
              </span>
              <div className="text-[10px] text-slate-400">
                {replayIndex !== null ? 'Mode Replay' : 'Partie en direct'}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleReplayNext}
                disabled={replayIndex === null || replayIndex >= snapshots.length - 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors text-xs font-semibold"
                title="Coup suivant"
              >
                <span>Suivant</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleReplayLive}
                disabled={replayIndex === null}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                  replayIndex !== null
                    ? 'bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-md animate-pulse'
                    : 'bg-slate-950 border border-slate-800 text-slate-500 opacity-40 cursor-default'
                }`}
                title="Revenir au coup direct le plus récent"
              >
                <span>Direct</span>
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Rematch & Controls Bar */}
          {gameState.status === 'FINISHED' && (
            <div className="mt-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in shadow-xl">
              <div>
                <span className="text-xs text-slate-400">La partie est finie !</span>
                <p className="text-sm font-semibold text-white">
                  Prêt pour la revanche ?
                </p>
              </div>

              <button
                onClick={onRequestRematch}
                disabled={hasVotedRematch}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-['Outfit'] font-semibold text-sm transition-all shadow-md ${
                  hasVotedRematch
                    ? 'bg-slate-800 text-slate-400 cursor-default'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950 animate-pulse'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                {hasVotedRematch ? 'Revanche demandée...' : 'Demander la Revanche'}
              </button>
            </div>
          )}
        </div>

        {/* Right Sidebar: Players, Moves, & Chat */}
        <div className={`lg:col-span-4 flex flex-col gap-4 w-full ${mobileTab !== 'board' ? 'flex' : 'hidden lg:flex'}`}>
          {/* Players List Card */}
          <div className={`bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-lg ${
            mobileTab === 'chat' ? 'hidden lg:block' : 'block'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white font-['Outfit']">
                  Joueurs dans le Salon ({players.length}/{config.maxPlayers})
                </h3>
              </div>
            </div>

            <div className="space-y-2">
              {players.map((p, idx) => {
                const isCurrentTurn = gameState.currentTurnPlayerId === p.id;
                const isMe = p.id === currentUser.id;

                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      isCurrentTurn
                        ? 'bg-amber-400/10 border-amber-400/40 ring-1 ring-amber-400/30'
                        : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                          idx === 0
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                        }`}
                      >
                        {p.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-white">
                          <span>{p.name}</span>
                          {isMe && <span className="text-[10px] text-amber-400">(Vous)</span>}
                          {p.isHost && (
                            <span className="text-[10px] text-amber-400" title="Hôte du salon">
                              ★
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {p.color ? `Camp : ${p.color}` : `Joueur #${idx + 1}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs">
                      {isCurrentTurn && (
                        <span className="text-[10px] text-amber-400 font-semibold bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30">
                          Au tour
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Host Game Switcher */}
            {isHost && (
              <div className="mt-4 pt-3 border-t border-slate-800">
                <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
                  Changer de jeu pour le salon :
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['chess', 'checkers', 'ludo', 'connect4', 'tictactoe'] as GameType[]).map(
                    (g) => (
                      <button
                        key={g}
                        onClick={() => onSwitchGame(g)}
                        className={`text-[11px] py-1 px-2 rounded-lg font-medium transition-colors border ${
                          config.gameType === g
                            ? 'bg-amber-400 text-slate-950 border-amber-400 font-semibold'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                        }`}
                      >
                        {g === 'chess'
                          ? 'Échecs'
                          : g === 'checkers'
                          ? 'Dames'
                          : g === 'ludo'
                          ? 'Ludo'
                          : g === 'connect4'
                          ? 'P4'
                          : 'Morpion'}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Chat & Interactive Move History Container */}
          <div className={`flex flex-col gap-4 ${mobileTab === 'players' ? 'hidden lg:flex' : 'flex'}`}>
            {/* Side Tabs: Chat vs Move History */}
            <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveSideTab('chat')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  activeSideTab === 'chat'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Discussion ({chat.length})
              </button>
              <button
                onClick={() => setActiveSideTab('history')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                  activeSideTab === 'history'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ScrollText className="w-3.5 h-3.5" />
                <span>Historique & Replay ({gameState.moveHistory.length})</span>
              </button>
            </div>

            {activeSideTab === 'chat' ? (
              <ChatPanel
                messages={chat}
                currentUserId={currentUser.id}
                onSendMessage={onSendChat}
              />
            ) : (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-lg min-h-[260px] max-h-[380px] overflow-y-auto">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-slate-300 font-['Outfit']">
                    Coups Joués (Cliquez pour revoir)
                  </h4>
                  {replayIndex !== null && (
                    <button
                      type="button"
                      onClick={handleReplayLive}
                      className="text-[10px] text-amber-400 hover:underline font-semibold"
                    >
                      Quitter le Replay
                    </button>
                  )}
                </div>

                {gameState.moveHistory.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-6 text-center">
                    Aucun coup joué pour le moment.
                  </p>
                ) : (
                  <div className="space-y-1.5 font-mono text-xs">
                    {/* Position 0 button */}
                    <button
                      type="button"
                      onClick={handleReplayFirst}
                      className={`w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg border text-left transition-all ${
                        replayIndex === 0
                          ? 'bg-amber-400/20 border-amber-400 text-amber-300 ring-1 ring-amber-400/40'
                          : 'bg-slate-950/40 text-slate-400 border-slate-800/40 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-[11px] font-sans text-slate-400">Position initiale</span>
                      {replayIndex === 0 && <Eye className="w-3.5 h-3.5 text-amber-400" />}
                    </button>

                    {/* Move items */}
                    {gameState.moveHistory.map((m, i) => {
                      const isCurrentStep = replayIndex === i + 1;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setReplayIndex(i + 1);
                            sounds.playMove();
                          }}
                          className={`w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg border text-left transition-all ${
                            isCurrentStep
                              ? 'bg-amber-400/25 border-amber-400 text-amber-200 ring-1 ring-amber-400/50 font-bold'
                              : 'bg-slate-950/40 text-slate-300 border-slate-800/40 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <span className="text-slate-500">#{i + 1}</span>
                          <span className={isCurrentStep ? 'text-amber-300' : 'text-slate-200'}>{m}</span>
                          {isCurrentStep ? (
                            <Eye className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <span className="text-[10px] text-slate-600">Revoir</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Private Room Modal */}
      <ShareModal
        config={config}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* Interactive Rules & Tips Modal */}
      <GameGuideModal
        initialGame={config.gameType}
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Board & Pieces Theme Customizer Modal */}
      <ThemeCustomizerModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        activeGame={config.gameType}
        currentThemes={userThemes}
        onUpdateThemes={handleUpdateThemes}
        checkersBoardSize={(gameState as any).boardSize || 8}
        onChangeCheckersSize={(size) => onSendAction({ type: 'change_board_size', size })}
      />
    </div>
  );
};
