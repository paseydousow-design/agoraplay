import React, { useState } from 'react';
import { GameType, BotDifficulty } from '../types/game';
import {
  Lock,
  Plus,
  KeyRound,
  Bot,
  Swords,
  Users,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Dices,
  Crown,
  Grid3X3,
  CheckCircle2,
  BookOpen,
  Award,
  Zap,
  CircleDot,
} from 'lucide-react';

interface LobbyProps {
  onCreateRoom: (params: {
    key: string;
    gameType: GameType;
    passcode?: string;
    playerName: string;
  }) => void;
  onJoinRoom: (params: {
    key: string;
    passcode?: string;
    playerName: string;
  }) => void;
  onStartSoloBot: (gameType: GameType, playerName: string, difficulty: BotDifficulty) => void;
  onOpenGuide?: (gameType?: GameType) => void;
  defaultRoomKey?: string;
}

interface GameCardInfo {
  type: GameType;
  title: string;
  category: string;
  playersLabel: string;
  durationLabel: string;
  description: string;
  badgeColor: string;
  icon: React.ReactNode;
}

const AVAILABLE_GAMES: GameCardInfo[] = [
  {
    type: 'checkers',
    title: 'Jeu de Dames',
    category: 'Stratégie classique',
    playersLabel: '2 Joueurs',
    durationLabel: '10–15 min',
    description:
      'Diagonales, prises en rafale obligatoires et promotion en Dame avec couronnement.',
    badgeColor: 'border-rose-500/30 text-rose-400 bg-rose-500/10',
    icon: <Crown className="w-5 h-5 text-rose-400" />,
  },
  {
    type: 'chess',
    title: 'Jeu d’Échecs',
    category: 'Haute réflexion',
    playersLabel: '2 Joueurs',
    durationLabel: '15–30 min',
    description:
      'L’art de la stratégie noble. Roque, prise en passant, promotions et détection d’échec et mat.',
    badgeColor: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
    icon: <Swords className="w-5 h-5 text-amber-400" />,
  },
  {
    type: 'ludo',
    title: 'Ludo (Petits Chevaux)',
    category: 'Familial & Suspense',
    playersLabel: '2 à 4 Joueurs',
    durationLabel: '15–25 min',
    description:
      'Lancez le dé, sortez vos chevaux de l’écurie sur un 6 et renvoyez les adversaires chez eux !',
    badgeColor: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
    icon: <Dices className="w-5 h-5 text-emerald-400" />,
  },
  {
    type: 'connect4',
    title: 'Puissance 4',
    category: 'Duel tactique',
    playersLabel: '2 Joueurs',
    durationLabel: '5–10 min',
    description:
      'Laissez tomber vos jetons dans la grille verticale et alignez-en 4 avant votre adversaire.',
    badgeColor: 'border-sky-500/30 text-sky-400 bg-sky-500/10',
    icon: <Grid3X3 className="w-5 h-5 text-sky-400" />,
  },
  {
    type: 'tictactoe',
    title: 'Morpion',
    category: 'Partie éclair',
    playersLabel: '2 Joueurs',
    durationLabel: '2 min',
    description:
      'Le classique indémodable sur grille 3x3. Idéal pour des revanches rapides et sans attente.',
    badgeColor: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
    icon: <Sparkles className="w-5 h-5 text-purple-400" />,
  },
  {
    type: 'three_morris',
    title: 'Jeu des 3 Pions',
    category: 'Marelle à 3 • Achi (3 Cailloux)',
    playersLabel: '2 Joueurs',
    durationLabel: '3–5 min',
    description:
      'Chacun a 3 pions : posez-les puis glissez vers une case reliée vide pour en aligner 3. Aucun saut autorisé !',
    badgeColor: 'border-amber-500/30 text-amber-300 bg-amber-500/10',
    icon: <CircleDot className="w-5 h-5 text-amber-400" />,
  },
];

export const Lobby: React.FC<LobbyProps> = ({
  onCreateRoom,
  onJoinRoom,
  onStartSoloBot,
  onOpenGuide,
  defaultRoomKey = '',
}) => {
  // Modal / Form states
  const [activeTab, setActiveTab] = useState<'create' | 'join' | 'solo'>('create');
  const [selectedGame, setSelectedGame] = useState<GameType>('chess');
  const [playerName, setPlayerName] = useState('Joueur ' + Math.floor(100 + Math.random() * 900));
  const [customKey, setCustomKey] = useState(
    defaultRoomKey || `SALON-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [joinKey, setJoinKey] = useState(defaultRoomKey || '');
  const [passcode, setPasscode] = useState('');
  const [joinPasscode, setJoinPasscode] = useState('');
  const [usePasscode, setUsePasscode] = useState(false);

  const [soloDifficulty, setSoloDifficulty] = useState<BotDifficulty>('medium');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateRoom({
      key: customKey.trim().toUpperCase(),
      gameType: selectedGame,
      passcode: usePasscode && passcode.trim() ? passcode.trim() : undefined,
      playerName: playerName.trim() || 'Hôte',
    });
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinKey.trim()) return;
    onJoinRoom({
      key: joinKey.trim().toUpperCase(),
      passcode: joinPasscode.trim() || undefined,
      playerName: playerName.trim() || 'Invité',
    });
  };

  const handleSoloSubmit = (gameType: GameType) => {
    onStartSoloBot(gameType, playerName.trim() || 'Joueur', soloDifficulty);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/10 border border-amber-400/30 rounded-full text-xs font-semibold text-amber-300 mb-4">
          <ShieldCheck className="w-3.5 h-3.5" />
          Salons Privés Sécurisés & Temps Réel
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-['Outfit'] tracking-tight leading-tight">
          Jouez à vos jeux de société favoris en salons exclusifs
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
          Créez un salon privé, donnez la clé d&apos;accès à votre ami ou votre entourage,
          et lancez votre duel en temps réel sans inscription préalable.
        </p>
      </div>

      {/* Main Interactive Hub: Create, Join with Key, Solo vs Bot */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-4xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-center p-1 bg-slate-950 rounded-2xl max-w-md mx-auto mb-6 sm:mb-8 border border-slate-800">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-3 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-1 sm:gap-1.5 ${
              activeTab === 'create'
                ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Créer un Salon</span>
            <span className="sm:hidden">Créer</span>
          </button>
          <button
            onClick={() => setActiveTab('join')}
            className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-3 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-1 sm:gap-1.5 ${
              activeTab === 'join'
                ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Rejoindre avec Clé</span>
            <span className="sm:hidden">Rejoindre</span>
          </button>
          <button
            onClick={() => setActiveTab('solo')}
            className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-3 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-1 sm:gap-1.5 ${
              activeTab === 'solo'
                ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Solo vs Bot IA</span>
            <span className="sm:hidden">Solo IA</span>
          </button>
        </div>

        {/* Tab 1: Create Private Room */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreateSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Votre Pseudo
                </label>
                <input
                  type="text"
                  required
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Ex : Alexandre"
                  className="w-full bg-slate-950 text-white px-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Clé du salon (à donner à vos amis)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={customKey}
                    onChange={(e) => setCustomKey(e.target.value.toUpperCase())}
                    placeholder="Ex : SALON-4820"
                    className="flex-1 bg-slate-950 text-amber-400 font-mono font-bold px-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400 text-sm tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setCustomKey(`SALON-${Math.floor(1000 + Math.random() * 9000)}`)
                    }
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-xl border border-slate-700 transition-colors whitespace-nowrap"
                  >
                    Générer
                  </button>
                </div>
              </div>
            </div>

            {/* Game Selection Grid */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Sélectionnez le jeu pour ce salon :
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
                {AVAILABLE_GAMES.map((game, idx) => {
                  const isSelected = selectedGame === game.type;
                  return (
                    <button
                      key={game.type}
                      type="button"
                      onClick={() => setSelectedGame(game.type)}
                      className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                        idx === 4 ? 'col-span-2 sm:col-span-1' : ''
                      } ${
                        isSelected
                          ? 'bg-amber-400/10 border-amber-400 ring-2 ring-amber-400/30'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                          {game.icon}
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-amber-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-white font-['Outfit']">
                          {game.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {game.playersLabel}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Passcode toggle */}
            <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white">
                    Verrouillage exclusif par mot de passe (Optionnel)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Exige un code secret supplémentaire en plus de la clé du salon.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {usePasscode ? (
                  <input
                    type="password"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Mot de passe secret"
                    className="bg-slate-900 border border-slate-700 text-xs px-3 py-1.5 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  />
                ) : null}
                <button
                  type="button"
                  onClick={() => setUsePasscode(!usePasscode)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    usePasscode
                      ? 'bg-rose-950/60 text-rose-300 border border-rose-800'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {usePasscode ? 'Désactiver' : 'Activer'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl shadow-lg transition-all text-sm font-['Outfit'] flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Créer le Salon Privé &amp; Ouvrir l&apos;Arène
            </button>
          </form>
        )}

        {/* Tab 2: Join with Key */}
        {activeTab === 'join' && (
          <form onSubmit={handleJoinSubmit} className="space-y-5 max-w-lg mx-auto">
            <div className="text-center mb-4">
              <KeyRound className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <h3 className="text-base font-bold text-white font-['Outfit']">
                Entrez la clé de salon que votre ami vous a donnée
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Connexion directe et instantanée à la partie en cours.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Votre Pseudo
              </label>
              <input
                type="text"
                required
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Ex : Sophie"
                className="w-full bg-slate-950 text-white px-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Clé d&apos;accès exclusive du salon
              </label>
              <input
                type="text"
                required
                value={joinKey}
                onChange={(e) => setJoinKey(e.target.value.toUpperCase())}
                placeholder="Ex : SALON-4820"
                className="w-full bg-slate-950 text-amber-400 font-mono font-bold px-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400 text-center text-base tracking-widest uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mot de passe (si le salon est protégé)
              </label>
              <input
                type="password"
                value={joinPasscode}
                onChange={(e) => setJoinPasscode(e.target.value)}
                placeholder="Optionnel"
                className="w-full bg-slate-950 text-white px-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={!joinKey.trim()}
              className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold rounded-xl shadow-lg transition-all text-sm font-['Outfit'] flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              Rejoindre le Salon Privé
            </button>
          </form>
        )}

        {/* Tab 3: Solo vs Bot */}
        {activeTab === 'solo' && (
          <div className="space-y-6">
            <div className="text-center max-w-lg mx-auto">
              <Bot className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <h3 className="text-base font-bold text-white font-['Outfit']">
                Entraînement Solo contre un Bot IA
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Choisissez votre niveau de difficulté et affrontez le bot sans attendre d&apos;adversaire.
              </p>

              {/* Difficulty Level Selector */}
              <div className="mt-4 p-1.5 bg-slate-950 rounded-2xl border border-slate-800 grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setSoloDifficulty('easy')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-0.5 ${
                    soloDifficulty === 'easy'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Facile
                  </span>
                  <span className="text-[10px] font-normal text-slate-400">Débutant</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSoloDifficulty('medium')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-0.5 ${
                    soloDifficulty === 'medium'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Moyen
                  </span>
                  <span className="text-[10px] font-normal text-slate-400">Équilibré</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSoloDifficulty('hard')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-0.5 ${
                    soloDifficulty === 'hard'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    Difficile
                  </span>
                  <span className="text-[10px] font-normal text-slate-400">Expert / Maître</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {AVAILABLE_GAMES.map((game) => (
                <div
                  key={game.type}
                  className="p-5 bg-slate-950 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                        {game.icon}
                      </div>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                          soloDifficulty === 'easy'
                            ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40'
                            : soloDifficulty === 'medium'
                            ? 'text-amber-400 bg-amber-950/60 border-amber-800/40'
                            : 'text-rose-400 bg-rose-950/60 border-rose-800/40'
                        }`}
                      >
                        Niveau {soloDifficulty === 'easy' ? 'Facile' : soloDifficulty === 'medium' ? 'Moyen' : 'Difficile'}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-white font-['Outfit']">
                      {game.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      {game.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-900 flex flex-col gap-2">
                    <button
                      onClick={() => handleSoloSubmit(game.type)}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      Jouer en Solo ({soloDifficulty === 'easy' ? 'Facile' : soloDifficulty === 'medium' ? 'Moyen' : 'Difficile'})
                    </button>

                    {onOpenGuide && (
                      <button
                        type="button"
                        onClick={() => onOpenGuide(game.type)}
                        className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-medium rounded-lg border border-slate-800 transition-colors flex items-center justify-center gap-1"
                      >
                        <BookOpen className="w-3 h-3 text-amber-400" />
                        Règles & Astuces de ce jeu
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Showcase Grid of Games */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-['Outfit']">
              Tous les Jeux Multijoueurs
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Règles complètes et gameplay en temps réel sécurisé.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {AVAILABLE_GAMES.map((game) => (
            <div
              key={game.type}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 group-hover:scale-105 transition-transform">
                    {game.icon}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>{game.playersLabel}</span>
                    <span aria-hidden="true">·</span>
                    <span>{game.durationLabel}</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white font-['Outfit']">
                  {game.title}
                </h3>
                <span className="text-xs text-amber-400/90 font-medium block mt-0.5 mb-2.5">
                  {game.category}
                </span>

                <p className="text-xs text-slate-300 leading-relaxed mb-6">
                  {game.description}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-slate-800">
                <button
                  onClick={() => {
                    setSelectedGame(game.type);
                    setActiveTab('create');
                    window.scrollTo({ top: 180, behavior: 'smooth' });
                  }}
                  className="flex-1 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl transition-colors font-['Outfit'] flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Créer un Salon
                </button>
                <button
                  onClick={() => handleSoloSubmit(game.type)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors"
                  title="Jouer contre le Bot IA"
                >
                  <Bot className="w-4 h-4 text-emerald-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security & Private Keys Explainer */}
      <div id="faq" className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <h3 className="text-lg font-bold text-white font-['Outfit'] mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-400" />
          Comment fonctionnent les Salons Privés Sécurisés ?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300 leading-relaxed">
          <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80">
            <span className="font-bold text-amber-400 text-sm block mb-1">
              1. Création de Clé Unique
            </span>
            Chaque salon dispose d&apos;une clé alphanumérique unique (ex: SALON-7842). Vous pouvez
            choisir votre propre nom de clé ou la générer en 1 clic.
          </div>
          <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80">
            <span className="font-bold text-amber-400 text-sm block mb-1">
              2. Partage Exclusif à l&apos;Entourage
            </span>
            Donnez votre clé ou envoyez le lien d&apos;invitation direct à votre ami. Seules les
            personnes possédant la clé peuvent entrer dans votre salon.
          </div>
          <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80">
            <span className="font-bold text-amber-400 text-sm block mb-1">
              3. Protection &amp; Revanche
            </span>
            Activez un mot de passe optionnel pour une sécurité totale. En fin de partie,
            enchaînez les revanches ou changez de jeu sans jamais perdre la connexion.
          </div>
        </div>
      </div>
    </div>
  );
};
