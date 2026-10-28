import React, { useState } from 'react';
import { GameType } from '../types/game';
import { Crown, Swords, Dices, Grid3X3, Sparkles, BookOpen, ChevronRight, CircleDot } from 'lucide-react';

interface RulesViewProps {
  onBack: () => void;
  onSelectGame: (type: GameType) => void;
}

export const RulesView: React.FC<RulesViewProps> = ({ onBack, onSelectGame }) => {
  const [activeGame, setActiveGame] = useState<GameType>('checkers');

  const rulesData: Record<
    GameType,
    {
      title: string;
      icon: React.ReactNode;
      overview: string;
      rules: string[];
      tips: string[];
    }
  > = {
    checkers: {
      title: 'Jeu de Dames (Règles Sénégalaises & Classiques)',
      icon: <Crown className="w-5 h-5 text-rose-400" />,
      overview:
        'Le jeu de dames au Sénégal est une fierté nationale (rendu célèbre par des grands maîtres comme Baba Sy). Deux variantes sont sélectionnables en 1 clic.',
      rules: [
        '🇸🇳 Règles Sénégalaises (Actives par défaut) : Les pions simples avancent vers l’avant, mais ils ont le droit de CAPTURER EN ARRIÈRE comme en avant !',
        '⚡ Rafles Gigantesques (1, 2, 3, 4, 5 pions ou plus !) : Lorsqu’un saut est initié, si une autre prise se présente depuis la case d’atterrissage (en avant ou en arrière), la capture continue obligatoirement ! Un seul pion peut décimer 3, 4, 5 pions d’affilée en zigzag.',
        '👑 Dames Volantes (Sénégal) : Lorsqu’un pion devient Dame (Roi), il peut parcourir toute la diagonale, capturer un pion adverse situé LOIN à distance, et choisir d’atterrir sur n’importe quelle case libre située derrière !',
        '🇸🇳 Formats de Damier disponibles : Choisissez en 1 clic entre le Grand Damier 10x10 (20 pions par joueur, 100 cases, très populaire au Sénégal) et le Damier Standard 8x8 (12 pions par joueur).',
        '🎨 Personnalisation : Changez la texture du damier (Téranga Sénégalaise, Bois sculpté, Émeraude, etc.) et les couleurs des pions dans la palette.',
        '♟️ Variante Classique : Les pions simples ne peuvent capturer que vers l’avant, et les dames ne se déplacent que d’une case.',
        'Condition de victoire : Capturer toutes les pièces adverses ou bloquer l’adversaire sans aucun coup légal.',
      ],
      tips: [
        '🇸🇳 Au Sénégal, les rafles de 4 ou 5 pions sont courantes : construisez des sacrifices délibérés pour forcer l’adversaire dans votre piège !',
        'Surveillez toujours vos arrières : un pion adverse peut vous sauter par derrière !',
        'Une Dame volante contrôle toute la diagonale : placez-la au centre pour balayer le damier à distance.',
      ],
    },
    chess: {
      title: 'Jeu d’Échecs (Chess)',
      icon: <Swords className="w-5 h-5 text-amber-400" />,
      overview:
        'Le jeu de réflexion par excellence. 16 pièces par camp : 8 pions, 2 cavaliers, 2 fous, 2 tours, 1 dame et 1 roi.',
      rules: [
        'Le Pion avance d’une case (ou deux au premier coup) et capture en diagonale d’une case.',
        'Le Cavalier se déplace en "L" (2 cases dans une direction puis 1 perpendiculaire) et peut sauter par-dessus les autres pièces.',
        'Le Fou se déplace de n’importe quel nombre de cases en diagonale.',
        'La Tour se déplace horizontalement ou verticalement.',
        'La Dame combine les pouvoirs de la Tour et du Fou.',
        'Le Roi se déplace d’une case dans n’importe quelle direction. Il ne peut jamais se mettre en échec.',
        'Échec et Mat : Le Roi adverse est attaqué et ne peut ni fuir, ni interposer une pièce, ni capturer l’attaquant. C’est la victoire !',
      ],
      tips: [
        'Développez vos pièces mineures (cavaliers et fous) rapidement.',
        'Mettez votre roi en sécurité grâce au roque.',
        'Ne sortez pas votre reine trop tôt au risque de la rendre vulnérable.',
      ],
    },
    ludo: {
      title: 'Ludo (Style Ludo King)',
      icon: <Dices className="w-5 h-5 text-emerald-400" />,
      overview:
        'Le jeu de société culte de 2 à 4 joueurs façon Ludo King : chaque couleur possède sa propre écurie, sa case de sortie dédiée avec flèche, des cases étoiles refuges et plusieurs modes de jeu (Classique, Rapide 1 pion, Maître).',
      rules: [
        'Chacun sa Case de Sortie : Rouge (flèche droite), Vert (flèche bas), Jaune (flèche gauche), Bleu (flèche haut). Obtenir un 6 fait sortir un pion de l’écurie directement sur cette case attitrée !',
        'Le 6 Magique & Re-lancers Bonus : Faire un 6 donne un nouveau lancer immédiat. Capturer un pion adverse ou faire rentrer un pion dans la maison centrale offre également un lancer bonus !',
        'Règle Anti-Chance des 3 Six : Obtenir 3 fois d’affilée un 6 annule le 3e coup et passe la main au joueur suivant.',
        'Capture & Cases Étoiles : Atterrir sur une case occupée par un adversaire (hors étoiles et cases de départ) le renvoie à son écurie ! Les 4 cases de départ et les 4 étoiles sont des zones sécurisées invulnérables.',
        'Modes de Jeu : 👑 Classique (les 4 pions doivent faire le tour), ⚡ Rapide (1 seul pion rentré = Victoire !), 🎯 Maître (capture obligatoire d’un pion adverse pour entrer dans la maison finale).',
      ],
      tips: [
        'Sortez plusieurs pions dès que vous faites des 6 pour multiplier vos choix.',
        'Chassez activement les pions adverses pour les renvoyer à l’écurie et empocher un tour bonus.',
        'Mettez vos pions à l’abri sur les cases étoiles (★) pour attendre le bon moment.',
      ],
    },
    connect4: {
      title: 'Puissance 4',
      icon: <Grid3X3 className="w-5 h-5 text-sky-400" />,
      overview:
        'Grille verticale de 7 colonnes et 6 rangées. Les jetons tombent par gravité au fond de la colonne choisie.',
      rules: [
        'Chaque joueur dépose un jeton de sa couleur à tour de rôle.',
        'Le premier joueur qui aligne 4 jetons consécutivement (horizontalement, verticalement ou en diagonale) gagne immédiatement.',
        'Si la grille est pleine sans alignement de 4, match nul.',
      ],
      tips: [
        'La colonne centrale (colonne 4) est stratégique : elle permet de construire plus d’alignements que les bords.',
        'Créez des "double-menaces" : deux alignements simultanés que l’adversaire ne peut pas parer en un seul coup.',
      ],
    },
    tictactoe: {
      title: 'Morpion',
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      overview:
        'Grille 3x3 rapide et intense. Un joueur joue les Croix (X) et l’autre les Ronds (O).',
      rules: [
        'Placez votre symbole dans une case vide.',
        'Alignez 3 symboles identiques sur une ligne, une colonne ou une diagonale pour gagner.',
        'Si toutes les cases sont remplies sans gagnant, match nul.',
      ],
      tips: [
        'Prendre la case centrale ou les 4 coins offre le meilleur contrôle.',
      ],
    },
    three_morris: {
      title: 'Jeu des 3 Pions (Marelle à 3 • Achi)',
      icon: <CircleDot className="w-5 h-5 text-amber-400" />,
      overview:
        'Le jeu ancestral des 3 pions (Three Men’s Morris / Achi / 3 Cailloux) : chaque joueur a 3 pions et doit les déplacer vers une case vide voisine pour en aligner 3. Fini les matchs nuls du morpion !',
      rules: [
        'Phase 1 : Pose des 3 pions : La grille de 9 cases commence vide. Les joueurs posent un pion à tour de rôle (3 pions chacun). Si un joueur aligne 3 pions pendant la pose, il gagne immédiatement !',
        'Phase 2 : Glissement d’une case : Une fois les 6 pions posés, chaque joueur fait glisser à son tour un pion vers une case vide reliée par un trait tracé.',
        '⛔ RÈGLE CLÉ : AUCUN SAUT AUTORISÉ ! Il est strictement interdit de sauter par-dessus un pion adverse ou son propre pion. Le pion ne peut que glisser sur une case adjacente vide.',
        'Condition de Victoire : Le premier qui aligne ses 3 pions gagne. Si un joueur est totalement encerclé et bloqué sans aucun déplacement possible, il perd par étouffement.',
      ],
      tips: [
        'Occupez impérativement le Centre (Case 4) : relié aux 8 autres cases, il offre une mobilité et une puissance d’alignement maximales !',
        'Créez une fourchette / tenaille : positionnez vos pions pour menacer deux cases gagnantes à la fois.',
        'Attention à ne pas vous faire acculer : gardez toujours des cases libres pour vos pions.',
      ],
    },
  };

  const current = rulesData[activeGame];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white font-['Outfit']">
              Règles Officielles &amp; Conseils Stratégiques
            </h1>
            <p className="text-xs text-slate-400">
              Maîtrisez les subtilités de chaque jeu pour remporter vos duels en salon.
            </p>
          </div>
        </div>

        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
        >
          Retour au Salon
        </button>
      </div>

      {/* Game Selector Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {(['checkers', 'chess', 'ludo', 'connect4', 'tictactoe', 'three_morris'] as GameType[]).map((g) => {
          const item = rulesData[g];
          const isSelected = activeGame === g;
          return (
            <button
              key={g}
              onClick={() => setActiveGame(g)}
              className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                isSelected
                  ? 'bg-amber-400/10 border-amber-400 text-white shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                {item.icon}
              </div>
              <span className="text-xs font-bold font-['Outfit'] truncate">
                {item.title.split(' (')[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Rules Content Detail Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              {current.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-['Outfit']">
                {current.title}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">{current.overview}</p>
            </div>
          </div>

          <button
            onClick={() => onSelectGame(activeGame)}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl font-['Outfit'] transition-colors flex items-center gap-1 shrink-0"
          >
            Lancer ce jeu
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Rules breakdown */}
        <div>
          <h3 className="text-sm font-bold text-amber-400 font-['Outfit'] mb-3">
            Règles fondamentales :
          </h3>
          <ul className="space-y-2.5">
            {current.rules.map((rule, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/60"
              >
                <span className="w-5 h-5 rounded-md bg-amber-400/10 text-amber-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Tips breakdown */}
        <div className="p-4 bg-amber-950/20 border border-amber-900/40 rounded-2xl">
          <h3 className="text-xs font-bold text-amber-300 font-['Outfit'] mb-2">
            Astuces de champion :
          </h3>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {current.tips.map((tip, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="text-amber-400">✦</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
