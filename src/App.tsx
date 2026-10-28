/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { GameRoom, GameType, Player, BotDifficulty } from './types/game';
import { socketClient } from './services/socket';
import { Header } from './components/Header';
import { Lobby } from './components/Lobby';
import { RoomView } from './components/RoomView';
import { RulesView } from './components/RulesView';
import { GameGuideModal } from './components/GameGuideModal';
import {
  createInitialChessState,
  executeChessMove,
  getChessBotMove,
} from './game-engines/chess';
import {
  createInitialCheckersBoard,
  createInitialCheckersState,
  executeCheckersMove,
  getCheckersBotMove,
} from './game-engines/checkers';
import {
  createInitialLudoState,
  executeLudoDiceRoll,
  executeLudoTokenMove,
  chooseLudoBotToken,
} from './game-engines/ludo';
import {
  createInitialConnect4State,
  dropConnect4Disc,
  getConnect4BotCol,
} from './game-engines/connect4';
import {
  createInitialTicTacToeState,
  playTicTacToeMove,
  getTicTacToeBotMove,
} from './game-engines/tictactoe';
import {
  createInitialThreeMorrisState,
  playThreeMorrisPlacement,
  playThreeMorrisMovement,
  getThreeMorrisBotMove,
} from './game-engines/three_morris';
import { sounds } from './services/sound';

export default function App() {
  const [currentUser] = useState<{ id: string; name: string }>(() => {
    let id = '';
    let name = '';
    if (typeof window !== 'undefined') {
      id = localStorage.getItem('agoraplay_user_id') || '';
      name = localStorage.getItem('agoraplay_user_name') || '';
      if (!id) {
        id = `u_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        localStorage.setItem('agoraplay_user_id', id);
      }
      if (!name) {
        name = `Joueur ${Math.floor(100 + Math.random() * 900)}`;
        localStorage.setItem('agoraplay_user_name', name);
      }
    }
    return { id: id || 'u_guest', name: name || 'Invité' };
  });

  const [activeView, setActiveView] = useState<'lobby' | 'room' | 'rules'>('lobby');
  const [activeRoom, setActiveRoom] = useState<GameRoom | null>(null);
  const [isBotMode, setIsBotMode] = useState<boolean>(false);
  const [botOpponentId] = useState<string>('bot_ai_master');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [initialUrlKey, setInitialUrlKey] = useState<string>('');
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);
  const [guideGame, setGuideGame] = useState<GameType>('chess');

  const botTimerRef = useRef<number | null>(null);

  // Check URL query params for ?salon=KEY or ?room=KEY on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const salonParam = params.get('salon') || params.get('room') || params.get('key');
      if (salonParam) {
        setInitialUrlKey(salonParam.toUpperCase());
      }
    }
  }, []);

  // Setup WebSocket listeners
  useEffect(() => {
    const unsubRoom = socketClient.onRoomState((room) => {
      setActiveRoom(room);
      setActiveView('room');
      setIsBotMode(false);
    });

    const unsubError = socketClient.onError((err) => {
      setErrorMessage(err);
      setTimeout(() => setErrorMessage(null), 5000);
    });

    const unsubChat = socketClient.onChatMessage((msg) => {
      setActiveRoom((prev) => {
        if (!prev) return null;
        if (prev.chat.some((m) => m.id === msg.id)) return prev;
        return {
          ...prev,
          chat: [...prev.chat, msg],
        };
      });
    });

    return () => {
      unsubRoom();
      unsubError();
      unsubChat();
    };
  }, []);

  // Handle Join or Create Room via WebSocket
  const handleCreateRoom = ({
    key,
    gameType,
    passcode,
    playerName,
  }: {
    key: string;
    gameType: GameType;
    passcode?: string;
    playerName: string;
  }) => {
    localStorage.setItem('agoraplay_user_name', playerName);
    currentUser.name = playerName;

    socketClient.joinRoom(key, currentUser.id, playerName, passcode, gameType);
  };

  const handleJoinRoom = ({
    key,
    passcode,
    playerName,
  }: {
    key: string;
    passcode?: string;
    playerName: string;
  }) => {
    localStorage.setItem('agoraplay_user_name', playerName);
    currentUser.name = playerName;

    socketClient.joinRoom(key, currentUser.id, playerName, passcode);
  };

  // Solo vs Bot IA mode
  const handleStartSoloBot = (
    gameType: GameType,
    playerName: string,
    difficulty: BotDifficulty = 'medium'
  ) => {
    currentUser.name = playerName;
    setIsBotMode(true);

    const difficultyLabel =
      difficulty === 'easy'
        ? 'Débutant'
        : difficulty === 'medium'
        ? 'Intermédiaire'
        : 'Expert';

    const p1: Player = {
      id: currentUser.id,
      name: playerName,
      color: gameType === 'ludo' ? 'red' : 'white',
      seatIndex: 0,
      isReady: true,
      isConnected: true,
      isHost: true,
    };

    const pBot: Player = {
      id: botOpponentId,
      name: `Bot IA (${difficultyLabel})`,
      color: gameType === 'ludo' ? 'green' : 'black',
      seatIndex: 1,
      isReady: true,
      isConnected: true,
    };

    let initialGameState;
    switch (gameType) {
      case 'chess':
        initialGameState = createInitialChessState(p1.id);
        break;
      case 'checkers':
        initialGameState = createInitialCheckersState(p1.id);
        break;
      case 'ludo':
        initialGameState = createInitialLudoState([p1.id, pBot.id], ['red', 'green']);
        break;
      case 'connect4':
        initialGameState = createInitialConnect4State(p1.id);
        break;
      case 'tictactoe':
        initialGameState = createInitialTicTacToeState(p1.id);
        break;
      case 'three_morris':
        initialGameState = createInitialThreeMorrisState(p1.id, pBot.id);
        break;
    }

    const soloRoom: GameRoom = {
      config: {
        key: `SOLO-${Math.floor(1000 + Math.random() * 9000)}`,
        name: `Entraînement Solo (${gameType.toUpperCase()})`,
        gameType,
        maxPlayers: 2,
        hasPasscode: false,
        allowSpectators: false,
      },
      players: [p1, pBot],
      spectators: [],
      gameState: initialGameState,
      botDifficulty: difficulty,
      chat: [
        {
          id: `sys-${Date.now()}`,
          senderId: 'system',
          senderName: 'AgoraPlay',
          text: `Partie Solo contre le Bot IA (${difficultyLabel}) commencée. À vous de jouer !`,
          timestamp: Date.now(),
          isSystem: true,
        },
      ],
      rematchVotes: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setActiveRoom(soloRoom);
    setActiveView('room');
  };

  // Change Bot Difficulty on the fly in Solo Room
  const handleChangeBotDifficulty = (newDiff: BotDifficulty) => {
    setActiveRoom((prev) => {
      if (!prev) return null;
      const difficultyLabel =
        newDiff === 'easy'
          ? 'Débutant'
          : newDiff === 'medium'
          ? 'Intermédiaire'
          : 'Expert';
      const updatedPlayers = prev.players.map((p) =>
        p.id === botOpponentId ? { ...p, name: `Bot IA (${difficultyLabel})` } : p
      );
      sounds.playMove();
      return {
        ...prev,
        botDifficulty: newDiff,
        players: updatedPlayers,
        chat: [
          ...prev.chat,
          {
            id: `sys-${Date.now()}`,
            senderId: 'system',
            senderName: 'AgoraPlay',
            text: `🎯 Niveau du Bot IA ajusté : ${difficultyLabel}`,
            timestamp: Date.now(),
            isSystem: true,
          },
        ],
      };
    });
  };

  // Bot Turn Automation Effect (with realistic thinking delay and difficulty level)
  useEffect(() => {
    if (!isBotMode || !activeRoom) return;
    const { gameState, config } = activeRoom;
    if (gameState.status !== 'PLAYING') return;

    if (gameState.currentTurnPlayerId === botOpponentId) {
      if (botTimerRef.current) window.clearTimeout(botTimerRef.current);

      const botDiff = activeRoom.botDifficulty || 'medium';

      botTimerRef.current = window.setTimeout(() => {
        if (config.gameType === 'chess' && gameState.gameType === 'chess') {
          const botMove = getChessBotMove(
            gameState.board,
            'b',
            gameState.enPassantTarget || null,
            botDiff
          );
          if (botMove) {
            const next = executeChessMove(gameState, botMove.from, botMove.to, 'q', currentUser.id);
            if (next) {
              sounds.playMove();
              if (gameState.board[botMove.to[0]][botMove.to[1]]) sounds.playCapture();
              setActiveRoom((prev) => (prev ? { ...prev, gameState: next } : null));
            }
          }
        } else if (config.gameType === 'checkers' && gameState.gameType === 'checkers') {
          const botMove = getCheckersBotMove(
            gameState.board,
            'red',
            gameState.consecutiveJumpPiecePos,
            gameState.variant || 'senegalese',
            botDiff
          );
          if (botMove) {
            const next = executeCheckersMove(gameState, botMove, currentUser.id);
            if (next) {
              if (botMove.isJump) sounds.playCapture();
              else sounds.playMove();
              setActiveRoom((prev) => (prev ? { ...prev, gameState: next } : null));
            }
          }
        } else if (config.gameType === 'ludo' && gameState.gameType === 'ludo') {
          // 1. Roll dice if can roll
          if (gameState.canRollDice) {
            sounds.playDice();
            const { nextState, mustChooseToken } = executeLudoDiceRoll(gameState);
            if (mustChooseToken && nextState.diceValue) {
              const bestTokenId = chooseLudoBotToken(
                nextState.tokens,
                'green',
                nextState.diceValue,
                botDiff
              );
              if (bestTokenId !== null) {
                setTimeout(() => {
                  const finalState = executeLudoTokenMove(nextState, bestTokenId, [currentUser.id, botOpponentId]);
                  sounds.playMove();
                  setActiveRoom((prev) => (prev ? { ...prev, gameState: finalState } : null));
                }, 400);
                return;
              }
            }
            setActiveRoom((prev) => (prev ? { ...prev, gameState: nextState } : null));
          }
        } else if (config.gameType === 'connect4' && gameState.gameType === 'connect4') {
          const botCol = getConnect4BotCol(gameState.grid, 'yellow', botDiff);
          const next = dropConnect4Disc(gameState, botCol, currentUser.id);
          if (next) {
            sounds.playMove();
            setActiveRoom((prev) => (prev ? { ...prev, gameState: next } : null));
          }
        } else if (config.gameType === 'tictactoe' && gameState.gameType === 'tictactoe') {
          const botCell = getTicTacToeBotMove(gameState.board, 'O', botDiff);
          const next = playTicTacToeMove(gameState, botCell, currentUser.id);
          if (next) {
            sounds.playMove();
            setActiveRoom((prev) => (prev ? { ...prev, gameState: next } : null));
          }
        } else if (config.gameType === 'three_morris' && gameState.gameType === 'three_morris') {
          const botMove = getThreeMorrisBotMove(gameState, 'P2', botDiff);
          if (botMove) {
            if (botMove.action === 'placement') {
              const next = playThreeMorrisPlacement(gameState, botMove.cell, currentUser.id);
              if (next) {
                sounds.playMove();
                setActiveRoom((prev) => (prev ? { ...prev, gameState: next } : null));
              }
            } else if (botMove.action === 'movement') {
              const next = playThreeMorrisMovement(gameState, botMove.from, botMove.to, currentUser.id);
              if (next) {
                sounds.playMove();
                setActiveRoom((prev) => (prev ? { ...prev, gameState: next } : null));
              }
            }
          }
        }
      }, 700);
    }

    return () => {
      if (botTimerRef.current) window.clearTimeout(botTimerRef.current);
    };
  }, [isBotMode, activeRoom?.gameState.currentTurnPlayerId, activeRoom?.gameState.status, activeRoom?.botDifficulty]);

  // Dispatch Action (handles online websocket or local bot state update)
  const handleSendAction = (action: Record<string, unknown>) => {
    if (!activeRoom) return;

    if (isBotMode) {
      // Local state progression
      const { gameState, config } = activeRoom;
      if (config.gameType === 'chess' && gameState.gameType === 'chess') {
        const next = executeChessMove(
          gameState,
          action.from as [number, number],
          action.to as [number, number],
          (action.promotion as any) || 'q',
          botOpponentId
        );
        if (next) {
          setActiveRoom((prev) => (prev ? { ...prev, gameState: next } : null));
        }
      } else if (config.gameType === 'checkers' && gameState.gameType === 'checkers') {
        if (action.type === 'change_variant' && action.variant) {
          setActiveRoom((prev) =>
            prev && prev.gameState.gameType === 'checkers'
              ? { ...prev, gameState: { ...prev.gameState, variant: action.variant as any } }
              : prev
          );
          return;
        }
        if (action.type === 'change_board_size' && (action.size === 8 || action.size === 10)) {
          const newSize = action.size as 8 | 10;
          setActiveRoom((prev) => {
            if (!prev || prev.gameState.gameType !== 'checkers') return prev;
            return {
              ...prev,
              gameState: {
                ...prev.gameState,
                boardSize: newSize,
                board: createInitialCheckersBoard(newSize),
                capturedRed: 0,
                capturedBlack: 0,
                consecutiveJumpPiecePos: null,
                activeColor: 'black',
                status: 'PLAYING',
                winnerPlayerId: null,
                turnNumber: 1,
                moveHistory: [],
              },
            };
          });
          return;
        }
        const next = executeCheckersMove(gameState, action.move as any, botOpponentId);
        if (next) {
          setActiveRoom((prev) => (prev ? { ...prev, gameState: next } : null));
        }
      } else if (config.gameType === 'ludo' && gameState.gameType === 'ludo') {
        if (action.type === 'change_ludo_mode' && action.mode) {
          setActiveRoom((prev) =>
            prev && prev.gameState.gameType === 'ludo'
              ? {
                  ...prev,
                  gameState: {
                    ...prev.gameState,
                    ludoMode: action.mode as any,
                    targetTokensToWin: action.mode === 'quick' ? 1 : 4,
                  },
                }
              : prev
          );
          return;
        } else if (action.type === 'roll_dice') {
          const { nextState } = executeLudoDiceRoll(gameState);
          setActiveRoom((prev) => (prev ? { ...prev, gameState: nextState } : null));
        } else if (action.type === 'move_token') {
          const next = executeLudoTokenMove(gameState, action.tokenId as number, [currentUser.id, botOpponentId]);
          setActiveRoom((prev) => (prev ? { ...prev, gameState: next } : null));
        }
      } else if (config.gameType === 'connect4' && gameState.gameType === 'connect4') {
        const next = dropConnect4Disc(gameState, action.colIndex as number, botOpponentId);
        if (next) {
          setActiveRoom((prev) => (prev ? { ...prev, gameState: next } : null));
        }
      } else if (config.gameType === 'tictactoe' && gameState.gameType === 'tictactoe') {
        const next = playTicTacToeMove(gameState, action.cellIndex as number, botOpponentId);
        if (next) {
          setActiveRoom((prev) => (prev ? { ...prev, gameState: next } : null));
        }
      } else if (config.gameType === 'three_morris' && gameState.gameType === 'three_morris') {
        let next = null;
        if (action.type === 'placement' || (action.cellIndex !== undefined && action.from === undefined)) {
          next = playThreeMorrisPlacement(gameState, action.cellIndex as number, botOpponentId);
        } else if (action.type === 'movement' || (action.from !== undefined && action.to !== undefined)) {
          next = playThreeMorrisMovement(gameState, action.from as number, action.to as number, botOpponentId);
        }
        if (next) {
          setActiveRoom((prev) => (prev ? { ...prev, gameState: next } : null));
        }
      }
    } else {
      // Real-time server-authoritative broadcast
      socketClient.sendGameAction(activeRoom.config.key, currentUser.id, action);
    }
  };

  const handleSendChat = (text: string) => {
    if (!activeRoom) return;
    if (isBotMode) {
      const msg = {
        id: `msg-${Date.now()}`,
        senderId: currentUser.id,
        senderName: currentUser.name,
        text,
        timestamp: Date.now(),
      };
      const botReply = {
        id: `bot-${Date.now() + 1}`,
        senderId: botOpponentId,
        senderName: 'Bot IA',
        text: 'Bien reçu ! Concentrons-nous sur le plateau ♟️',
        timestamp: Date.now() + 500,
      };
      setActiveRoom((prev) =>
        prev ? { ...prev, chat: [...prev.chat, msg, botReply] } : null
      );
    } else {
      socketClient.sendChatMessage(
        activeRoom.config.key,
        currentUser.id,
        currentUser.name,
        text
      );
    }
  };

  const handleRequestRematch = () => {
    if (!activeRoom) return;
    if (isBotMode) {
      handleStartSoloBot(
        activeRoom.config.gameType,
        currentUser.name,
        activeRoom.botDifficulty || 'medium'
      );
    } else {
      socketClient.requestRematch(activeRoom.config.key, currentUser.id);
    }
  };

  const handleSwitchGame = (newGameType: GameType) => {
    if (!activeRoom) return;
    if (isBotMode) {
      handleStartSoloBot(
        newGameType,
        currentUser.name,
        activeRoom.botDifficulty || 'medium'
      );
    } else {
      socketClient.switchGame(activeRoom.config.key, currentUser.id, newGameType);
    }
  };

  const handleLeaveRoom = () => {
    setActiveRoom(null);
    setIsBotMode(false);
    setActiveView('lobby');
  };

  return (
    <div className="min-h-screen bg-slate-950 font-['Plus_Jakarta_Sans'] text-slate-100 flex flex-col antialiased">
      {/* Top Bar Contract Header */}
      <Header
        onCreateRoomClick={() => {
          setActiveView('lobby');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigate={(view) => {
          if (view === 'rules') {
            setGuideGame(activeRoom?.config.gameType || 'checkers');
            setIsGuideModalOpen(true);
          } else {
            setActiveView(view);
          }
        }}
        activeView={activeView === 'rules' ? 'rules' : 'lobby'}
        soundMuted={soundMuted}
        onToggleSound={() => {
          setSoundMuted(!soundMuted);
          sounds.enabled = soundMuted;
        }}
      />

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="bg-rose-950/80 border-b border-rose-800 text-rose-200 px-4 py-2.5 text-xs text-center font-medium animate-fade-in flex items-center justify-center gap-2">
          <span>⚠️ {errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-white underline ml-2"
          >
            Fermer
          </button>
        </div>
      )}

      {/* View routing */}
      <main className="flex-1 flex flex-col">
        {activeView === 'lobby' && (
          <Lobby
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            onStartSoloBot={handleStartSoloBot}
            onOpenGuide={(g) => {
              setGuideGame(g || 'chess');
              setIsGuideModalOpen(true);
            }}
            defaultRoomKey={initialUrlKey}
          />
        )}

        {activeView === 'room' && activeRoom && (
          <RoomView
            room={activeRoom}
            currentUser={currentUser}
            isBotMode={isBotMode}
            onSendAction={handleSendAction}
            onSendChat={handleSendChat}
            onRequestRematch={handleRequestRematch}
            onSwitchGame={handleSwitchGame}
            onLeaveRoom={handleLeaveRoom}
            onAddBotOpponent={() =>
              handleStartSoloBot(
                activeRoom.config.gameType,
                currentUser.name,
                activeRoom.botDifficulty || 'medium'
              )
            }
            onChangeBotDifficulty={handleChangeBotDifficulty}
          />
        )}

        {activeView === 'rules' && (
          <RulesView
            onBack={() => setActiveView('lobby')}
            onSelectGame={(g) => {
              setActiveView('lobby');
              handleStartSoloBot(g, currentUser.name, 'medium');
            }}
          />
        )}
      </main>

      {/* Global Interactive Guide & Rules Modal */}
      <GameGuideModal
        initialGame={guideGame}
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      {/* Subdued Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>AgoraPlay · Plateforme de jeux de société multijoueurs en temps réel</span>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => {
                setGuideGame(activeRoom?.config.gameType || 'checkers');
                setIsGuideModalOpen(true);
              }}
              className="hover:text-white transition-colors"
            >
              Règles & Astuces du jeu
            </button>
            <span aria-hidden="true">·</span>
            <span>Salons Privés Sécurisés</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
