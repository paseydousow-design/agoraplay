import React, { useState } from 'react';
import { GameType } from '../types/game';
import {
  X,
  BookOpen,
  Sparkles,
  Crown,
  Swords,
  Dices,
  Grid3X3,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  CircleDot,
} from 'lucide-react';
import { InteractiveTutorial } from './InteractiveTutorial';

interface GameGuideModalProps {
  initialGame?: GameType;
  isOpen: boolean;
  onClose: () => void;
}

export const GameGuideModal: React.FC<GameGuideModalProps> = ({
  initialGame = 'chess',
  isOpen,
  onClose,
}) => {
  const [selectedGame, setSelectedGame] = useState<GameType>(initialGame);
  const [activeTab, setActiveTab] = useState<'tutorial' | 'rules' | 'tips'>('tutorial');


  if (!isOpen) return null;

  const gameInfo: Record<
    GameType,
    {
      title: string;
      badge: string;
      icon: React.ReactNode;
      overview: string;
      rules: { title: string; desc: string }[];
      tips: { title: string; desc: string; type?: 'win' | 'warning' | 'info' }[];
    }
  > = {
    checkers: {
      title: 'Jeu de Dames (Dames Sénégalaises & Classiques)',
      badge: '🇸🇳 Variante Nationale & Classique',
      icon: <Crown className="w-5 h-5 text-rose-400" />,
      overview:
        'Le jeu de dames est une institution au Sénégal et à travers le monde. Deux jeux de règles sont disponibles en 1 clic.',
      rules: [
        {
          title: '🇸🇳 Règle Clé du Sénégal : Prise en Arrière',
          desc: 'Contrairement aux dames traditionnelles européennes, au Sénégal les pions simples PEUVENT CAPTURER EN ARRIÈRE comme en avant ! Ils avancent droit mais mangent dans les deux sens diagonaux.',
        },
        {
          title: '👑 Les Dames Volantes à longue portée',
          desc: 'Lorsqu’un pion atteint la rangée opposée, il est couronné Dame. Une Dame volante peut parcourir toute la diagonale, sauter un pion adverse situé LOIN à distance, et choisir d’atterrir sur n’importe quelle case libre située derrière.',
        },
        {
          title: 'Prises en cascade obligatoires',
          desc: 'Si après un premier saut, un autre saut est disponible, la pièce DOIT continuer sa chaîne de capture jusqu’à épuisement des prises possibles.',
        },
        {
          title: 'Condition de Victoire',
          desc: 'Capturez toutes les pièces adverses ou bloquez complètement l’adversaire de sorte qu’il n’ait plus aucun coup légal.',
        },
      ],
      tips: [
        {
          title: 'Surveillez vos arrières !',
          desc: 'Avec les règles sénégalaises, ne croyez jamais un pion à l’abri simplement parce qu’il se trouve derrière un pion adverse : vous pouvez vous faire capturer par surprise en marche arrière !',
          type: 'warning',
        },
        {
          title: 'Contrôlez les grandes diagonales',
          desc: 'La grande diagonale principale traverse le damier de part en part. Celui qui y installe une Dame volante domine une grande partie de l’espace.',
          type: 'win',
        },
        {
          title: 'Sacrifice tactique (Le « Don »)',
          desc: 'Donner volontairement un pion pour forcer la prise obligatoire de l’adversaire permet souvent d’ouvrir une brèche et d’en capturer 2 ou 3 au coup suivant !',
          type: 'info',
        },
      ],
    },
    chess: {
      title: 'Jeu d’Échecs (Noble Art de la Stratégie)',
      badge: '64 Cases • Pièces en Bois 3D',
      icon: <Swords className="w-5 h-5 text-amber-400" />,
      overview:
        'L’affrontement royal classique. 16 pièces blanches contre 16 pièces noires. Le but ultime est de mater le Roi adverse.',
      rules: [
        {
          title: 'Le Pion',
          desc: 'Avance d’1 case (ou 2 au premier départ). Capture en diagonale d’1 case vers l’avant. Arrivé au bout (8e rangée), il se transforme au choix en Dame, Tour, Fou ou Cavalier.',
        },
        {
          title: 'Le Cavalier (Cheval)',
          desc: 'Se déplace en forme de "L" (2 cases dans un sens puis 1 perpendiculaire). C’est la seule pièce capable de sauter par-dessus d’autres pièces !',
        },
        {
          title: 'Le Fou & La Tour',
          desc: 'Le Fou glisse sur les diagonales de sa couleur. La Tour glisse sur les lignes droites horizontales et verticales.',
        },
        {
          title: 'La Dame (Reine)',
          desc: 'La pièce la plus puissante : elle combine les mouvements de la Tour et du Fou dans toutes les directions.',
        },
        {
          title: 'Le Roi & Le Roque',
          desc: 'Le Roi se déplace d’1 case dans n’importe quelle direction. Il peut roquer avec une Tour si aucune des deux pièces n’a bougé et qu’aucune case traversée n’est attaquée.',
        },
        {
          title: 'Échec et Mat vs Pat',
          desc: 'Échec et mat = le Roi est attaqué et ne peut échapper : Victoire ! Pat = le Roi n’est pas en échec mais aucun coup légal n’est possible : Match nul.',
        },
      ],
      tips: [
        {
          title: 'Contrôlez les 4 cases centrales (e4, d4, e5, d5)',
          desc: 'Occuper le centre avec des pions et des pièces mineures vous donne l’avantage d’espace et plus de mobilité.',
          type: 'win',
        },
        {
          title: 'Roquez tôt pour sécuriser votre Roi',
          desc: 'Ne laissez jamais votre Roi au milieu de l’échiquier trop longtemps, sous peine de subir des attaques foudroyantes sur les colonnes ouvertes.',
          type: 'info',
        },
        {
          title: 'Attention aux pièces non protégées',
          desc: 'Une pièce sans défense est une cible facile pour les fourchettes de cavaliers ou les attaques doubles de la dame.',
          type: 'warning',
        },
      ],
    },
    ludo: {
      title: 'Ludo (Style Ludo King)',
      badge: 'Jusqu’à 4 Joueurs • Lancer de Dé & Cases de Sortie',
      icon: <Dices className="w-5 h-5 text-emerald-400" />,
      overview:
        'Le jeu de Ludo culte style Ludo King : chaque couleur (Rouge, Vert, Jaune, Bleu) dispose de son écurie, de sa propre case de sortie avec flèche, de ses cases étoiles refuges et de modes variés (Classique, Rapide 1 pion, Maître).',
      rules: [
        {
          title: 'Chacun sa Case de Sortie (Flèche colorée)',
          desc: 'Chaque joueur possède sa propre case de départ attitrée : Rouge (flèche droite), Vert (flèche bas), Jaune (flèche gauche), Bleu (flèche haut). Obtenir un 6 permet de sortir un pion de son écurie sur cette case exacte !',
        },
        {
          title: 'Le 6 Magique & Re-lancers Bonus',
          desc: 'Faire un 6 donne un lancer de dé bonus immédiat ! De même, capturer un pion adverse ou faire entrer un pion dans le triangle central offre un re-lancer bonus.',
        },
        {
          title: 'Règle Anti-Chance des 3 Six (Ludo King)',
          desc: 'Obtenir 3 fois d’affilée un 6 annule le 3e coup et passe la main au joueur suivant pour préserver l’équité.',
        },
        {
          title: 'La Capture et les Cases Étoiles Refuges',
          desc: 'Atterrir sur un pion adverse le renvoie directement dans son écurie ! Les 4 cases de départ et les 4 cases marquées d’une étoile (★) sont des refuges invulnérables : impossible d’y être capturé.',
        },
        {
          title: 'Plusieurs Modes de Jeu au Choix',
          desc: '👑 Classique (les 4 pions doivent rentrer), ⚡ Rapide (1 seul pion rentré = Victoire immédiate), ou 🎯 Maître (capture obligatoire d’un pion adverse pour débloquer le couloir final).',
        },
      ],
      tips: [
        {
          title: 'Sortez vos pions dès que vous avez un 6',
          desc: 'Avoir plusieurs pions sur le parcours vous évite d’être coincé si un pion est bloqué ou menacé.',
          type: 'win',
        },
        {
          title: 'Chassez les pions adverses pour gagner des tours bonus',
          desc: 'Capturer un pion adverse l’élimine du plateau ET vous donne un re-lancer immédiat.',
          type: 'info',
        },
        {
          title: 'Réfugiez-vous sur les cases étoiles (★)',
          desc: 'Si un adversaire vous poursuit à moins de 6 cases, cherchez à vous poster sur une étoile pour souffler en toute sécurité.',
          type: 'warning',
        },
      ],
    },
    connect4: {
      title: 'Puissance 4 (Connect 4)',
      badge: 'Grille 7x6 • Alignement Tactique',
      icon: <Grid3X3 className="w-5 h-5 text-sky-400" />,
      overview:
        'Glissez vos jetons dans les colonnes par gravité. Le premier qui aligne 4 jetons consécutifs l’emporte.',
      rules: [
        {
          title: 'Dépôt par gravité',
          desc: 'Chaque joueur choisit une colonne ; le jeton tombe automatiquement sur la rangée la plus basse disponible.',
        },
        {
          title: 'Condition d’alignement',
          desc: 'Alignez 4 jetons de votre couleur horizontalement, verticalement ou en diagonale.',
        },
        {
          title: 'Grille pleine',
          desc: 'Si les 42 cases sont remplies sans aucun alignement de 4, la manche se solde par un match nul.',
        },
      ],
      tips: [
        {
          title: 'La colonne centrale (Colonne 4) est reine',
          desc: 'La colonne centrale offre le plus grand nombre d’alignements potentiels (horizontaux et diagonaux). Prenez-la dès le premier coup si vous avez les Rouges !',
          type: 'win',
        },
        {
          title: 'Construisez des double-menaces (Fourchettes)',
          desc: 'Créez un piège où vous avez 2 alignements de 3 ouverts simultanément. L’adversaire ne pouvant bloquer qu’une seule case par coup, la victoire est assurée.',
          type: 'info',
        },
        {
          title: 'Attention à la case du dessus !',
          desc: 'Avant de jouer dans une colonne, vérifiez si votre coup n’offre pas directement à l’adversaire la case gagnante juste au-dessus.',
          type: 'warning',
        },
      ],
    },
    tictactoe: {
      title: 'Morpion (Tic-Tac-Toe)',
      badge: 'Grille 3x3 • Duels Éclair',
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      overview:
        'Le jeu de duel le plus rapide du monde. Alignez 3 Croix (X) ou 3 Ronds (O).',
      rules: [
        {
          title: 'Placement libre',
          desc: 'À tour de rôle, placez votre symbole sur l’une des 9 cases disponibles.',
        },
        {
          title: 'Alignement gagnant',
          desc: 'Le premier qui aligne 3 symboles sur une ligne horizontale, verticale ou diagonale gagne la partie.',
        },
      ],
      tips: [
        {
          title: 'Prenez le centre ou un coin',
          desc: 'La case centrale participe à 4 lignes gagnantes, et chaque coin participe à 3 lignes. Ce sont les meilleures positions d’ouverture.',
          type: 'win',
        },
        {
          title: 'Bloquez systématiquement à 2 symboles alignés',
          desc: 'Ne laissez jamais votre adversaire poser son 3e symbole libre.',
          type: 'warning',
        },
      ],
    },
    three_morris: {
      title: 'Jeu des 3 Pions (Marelle à 3 • Achi • 3 Cailloux)',
      badge: 'Ancêtre Stratégique du Morpion • Glissement Sans Saut',
      icon: <CircleDot className="w-5 h-5 text-amber-400" />,
      overview:
        'Ce jeu séculaire (joué dans la Rome antique sous le nom de Terni Lapilli et en Afrique de l’Ouest sous le nom d’Achi ou des 3 Cailloux) résout le problème du match nul systématique du Morpion. Chaque joueur ne dispose que de 3 pions et doit les déplacer !',
      rules: [
        {
          title: 'Phase 1 : Pose des 3 pions (1 par 1)',
          desc: 'La grille 3x3 de 9 cases commence vide. Les joueurs posent alternativement un de leurs 3 pions. Si un joueur aligne 3 pions dès cette phase, il gagne immédiatement !',
        },
        {
          title: 'Phase 2 : Déplacement par glissement le long des lignes',
          desc: 'Une fois les 6 pions posés, chaque joueur à son tour fait glisser un de ses pions vers une case directement voisine et libre reliée par un trait tracé.',
        },
        {
          title: '⛔ RÈGLE CLÉ : Aucun saut autorisé !',
          desc: 'On ne peut JAMAIS sauter par-dessus un pion adverse ni par-dessus ses propres pions ! Le chemin doit être directement libre et adjacent.',
        },
        {
          title: 'Condition de Victoire & Écrasement',
          desc: 'Le premier qui aligne ses 3 pions gagne. Si un joueur n’a aucun mouvement légal possible (tous ses 3 pions sont encerclés et bloqués sans case libre), il perd par étouffement !',
        },
      ],
      tips: [
        {
          title: 'Prenez le Centre (Case 4)',
          desc: 'Le centre est la seule case reliée aux 8 autres cases de la grille ! Elle offre une mobilité absolue.',
          type: 'win',
        },
        {
          title: 'Créez une Tenaille (Attaque Double)',
          desc: 'Placez vos pions de manière à avoir 2 cases gagnantes ouvertes simultanément. L’adversaire ne pourra en boucher qu’une.',
          type: 'info',
        },
        {
          title: 'Attention à ne pas vous faire bloquer',
          desc: 'Gardez toujours au moins un pion mobile pour éviter de perdre par immobilisation complète.',
          type: 'warning',
        },
      ],
    },
  };

  const current = gameInfo[selectedGame];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white font-['Outfit']">
                Guide des Jeux & Astuces Stratégiques
              </h3>
              <p className="text-xs text-slate-400">
                Maîtrisez les règles et découvrez les secrets pour remporter vos parties
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

        {/* Game Selector Bar */}
        <div className="px-4 py-2.5 bg-slate-950/70 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto">
          {(['checkers', 'chess', 'ludo', 'connect4', 'tictactoe', 'three_morris'] as GameType[]).map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGame(g)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedGame === g
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {g === 'checkers'
                ? '👑 Dames'
                : g === 'chess'
                ? '♟️ Échecs'
                : g === 'ludo'
                ? '🎲 Ludo King'
                : g === 'connect4'
                ? '🔴 Puissance 4'
                : g === 'tictactoe'
                ? '✨ Morpion'
                : '🎯 3 Pions (Achi)'}
            </button>
          ))}
        </div>

        {/* Sub-Tabs: Démos Animées vs Règles vs Astuces */}
        <div className="px-5 pt-3.5 pb-1 flex items-center gap-2 border-b border-slate-800/80 overflow-x-auto">
          <button
            onClick={() => setActiveTab('tutorial')}
            className={`pb-2.5 px-2 text-xs font-bold transition-all relative flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'tutorial'
                ? 'text-amber-400 border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlayCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Pions en Action (Démos Animées)</span>
            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950">
              Nouveau
            </span>
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`pb-2.5 px-2 text-xs font-bold transition-all relative whitespace-nowrap ${
              activeTab === 'rules'
                ? 'text-amber-400 border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Règles Officielles
          </button>
          <button
            onClick={() => setActiveTab('tips')}
            className={`pb-2.5 px-2 text-xs font-bold transition-all relative flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'tips'
                ? 'text-amber-400 border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            Astuces Gagnantes
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Tab 0: Interactive Tutorial with live pawn animations */}
          {activeTab === 'tutorial' && (
            <div className="space-y-4">
              <InteractiveTutorial
                initialGame={selectedGame}
                onSelectGame={(g) => setSelectedGame(g)}
              />
            </div>
          )}

          {/* Game Overview Header (shown on rules and tips tabs) */}
          {activeTab !== 'tutorial' && (
            <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                {current.icon}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h4 className="text-sm font-bold text-white font-['Outfit']">{current.title}</h4>
                  <span className="text-[11px] font-semibold text-amber-300 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-full">
                    {current.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{current.overview}</p>
              </div>
            </div>
          )}


          {/* Tab 1: Rules */}
          {activeTab === 'rules' && (
            <div className="space-y-3">
              {current.rules.map((rule, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <h5 className="text-xs font-bold text-white font-['Outfit']">{rule.title}</h5>
                  </div>
                  <p className="text-xs text-slate-300 pl-6 leading-relaxed">{rule.desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Tips */}
          {activeTab === 'tips' && (
            <div className="space-y-3">
              {current.tips.map((tip, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    tip.type === 'warning'
                      ? 'bg-rose-950/20 border-rose-800/40 text-rose-200'
                      : tip.type === 'win'
                      ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                      : 'bg-slate-950/40 border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {tip.type === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                    <h5 className="text-xs font-bold font-['Outfit'] text-white">{tip.title}</h5>
                  </div>
                  <p className="text-xs text-slate-300 pl-6 leading-relaxed">{tip.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Astuce : vous pouvez rouvrir ce guide à tout moment pendant la partie.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors"
          >
            Fermer le guide
          </button>
        </div>
      </div>
    </div>
  );
};
