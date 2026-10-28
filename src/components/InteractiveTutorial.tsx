import React, { useState, useEffect, useRef } from 'react';
import { GameType } from '../types/game';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Crown,
  Sparkles,
  Swords,
  Dices,
  Grid3X3,
  Info,
  CheckCircle2,
  AlertCircle,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { ChessPieceIcon } from './games/ChessPieces';
import { sounds } from '../services/sound';

export interface TutorialStep {
  title: string;
  badge?: string;
  explanation: string;
  highlightSquares?: {
    row: number;
    col: number;
    type: 'source' | 'target' | 'captured' | 'danger' | 'focus';
    label?: string;
  }[];
  // Arrow from [r, c] to [r, c]
  arrow?: {
    from: [number, number];
    to: [number, number];
    label?: string;
    curved?: boolean;
  };
  // Custom board state
  pieces: {
    id: string;
    row: number;
    col: number;
    type?: string;
    color: string;
    isKing?: boolean;
    isCaptured?: boolean;
    label?: string;
  }[];
  // Sound trigger on entering this step
  soundType?: 'move' | 'capture' | 'win' | 'dice';
}

export interface TutorialScenario {
  id: string;
  game: GameType;
  title: string;
  tag: string;
  difficulty: 'Débutant' | 'Intermédiaire' | 'Maître';
  description: string;
  rows: number;
  cols: number;
  boardTheme: 'checkers' | 'chess' | 'connect4' | 'ludo' | 'tictactoe';
  steps: TutorialStep[];
}

export const TUTORIAL_SCENARIOS: TutorialScenario[] = [
  // ==================== DAMES SÉNÉGALAISES ====================
  {
    id: 'checkers_senegal_back',
    game: 'checkers',
    title: '🇸🇳 La Prise en Arrière (Pion Simple)',
    tag: 'Règle Fétiche du Sénégal',
    difficulty: 'Débutant',
    description:
      'Au Sénégal, un simple pion PEUT CAPTURER EN ARRIÈRE en diagonale ! Découvrez comment surprendre votre adversaire.',
    rows: 6,
    cols: 6,
    boardTheme: 'checkers',
    steps: [
      {
        title: 'Étape 1 : Le pion adverse s’infiltre derrière',
        badge: 'Observation',
        explanation:
          'Le pion noir (adversaire) s’est placé en diagonale juste derrière votre pion blanc. Dans les règles internationales classiques, le pion blanc serait impuissant car incapable de reculer.',
        highlightSquares: [
          { row: 3, col: 2, type: 'source', label: 'Votre pion' },
          { row: 4, col: 3, type: 'danger', label: 'Pion noir' },
          { row: 5, col: 4, type: 'target', label: 'Case libre' },
        ],
        pieces: [
          { id: 'w1', row: 3, col: 2, color: 'white', isKing: false },
          { id: 'b1', row: 4, col: 3, color: 'black', isKing: false },
        ],
        soundType: 'move',
      },
      {
        title: 'Étape 2 : 🇸🇳 Règle Sénégalaise active !',
        badge: 'Action Légale',
        explanation:
          'Sous les règles sénégalaises officielles, les pions simples avancent droit mais mangent dans TOUTES les directions diagonales, y compris en arrière ! La case arrière (5, 4) est libre.',
        highlightSquares: [
          { row: 3, col: 2, type: 'source' },
          { row: 4, col: 3, type: 'captured', label: 'Saut !' },
          { row: 5, col: 4, type: 'target', label: 'Atterrissage' },
        ],
        arrow: { from: [3, 2], to: [5, 4], label: 'Saut arrière !', curved: true },
        pieces: [
          { id: 'w1', row: 3, col: 2, color: 'white', isKing: false },
          { id: 'b1', row: 4, col: 3, color: 'black', isKing: false },
        ],
        soundType: 'move',
      },
      {
        title: 'Étape 3 : Saut et Capture arrière accomplis !',
        badge: 'Capture Réussie',
        explanation:
          'Le pion blanc bondit en arrière par-dessus le pion noir et atterrit sur la case (5, 4). Le pion noir est éliminé et retiré du damier.',
        highlightSquares: [
          { row: 5, col: 4, type: 'focus', label: 'Nouveau poste' },
          { row: 4, col: 3, type: 'captured', label: 'Éliminé' },
        ],
        pieces: [
          { id: 'w1', row: 5, col: 4, color: 'white', isKing: false },
          { id: 'b1', row: 4, col: 3, color: 'black', isKing: false, isCaptured: true },
        ],
        soundType: 'capture',
      },
      {
        title: 'Étape 4 : Position finale avantageuse',
        badge: 'Victoire Tactique',
        explanation:
          'Le pion noir a disparu. Morale : Avec les règles sénégalaises, ne croyez jamais un pion à l’abri simplement parce qu’il se trouve derrière un pion adverse !',
        highlightSquares: [{ row: 5, col: 4, type: 'focus' }],
        pieces: [{ id: 'w1', row: 5, col: 4, color: 'white', isKing: false }],
        soundType: 'win',
      },
    ],
  },
  {
    id: 'checkers_flying_queen',
    game: 'checkers',
    title: '👑 Dame Volante : Prise à Distance (Longue Portée)',
    tag: 'Spécificité Sénégalaise',
    difficulty: 'Intermédiaire',
    description:
      'Une Dame sénégalaise (couronnée) parcourt toute la diagonale, saute un pion éloigné et choisit sa case d’atterrissage.',
    rows: 6,
    cols: 6,
    boardTheme: 'checkers',
    steps: [
      {
        title: 'Étape 1 : La Dame volante domine la diagonale',
        badge: 'Grande Diagonale',
        explanation:
          'Votre Dame volante (couronnée) se trouve en (5, 0). Un pion noir adverse est situé loin au milieu en (2, 3). Les cases derrière lui sont dégagées.',
        highlightSquares: [
          { row: 5, col: 0, type: 'source', label: 'Dame volante' },
          { row: 2, col: 3, type: 'danger', label: 'Cible lointaine' },
        ],
        pieces: [
          { id: 'qw', row: 5, col: 0, color: 'white', isKing: true },
          { id: 'b1', row: 2, col: 3, color: 'black', isKing: false },
        ],
        soundType: 'move',
      },
      {
        title: 'Étape 2 : Trajectoire et choix de la case',
        badge: 'Vol Plané',
        explanation:
          'Contrairement aux dames classiques où l’on doit s’arrêter juste derrière la pièce mangée, la Dame volante sénégalaise peut choisir d’atterrir en (1, 4) OU en (0, 5) au bout du damier !',
        highlightSquares: [
          { row: 5, col: 0, type: 'source' },
          { row: 2, col: 3, type: 'captured', label: 'Sauté à distance' },
          { row: 1, col: 4, type: 'target', label: 'Option 1' },
          { row: 0, col: 5, type: 'target', label: 'Option 2 (Idéal)' },
        ],
        arrow: { from: [5, 0], to: [0, 5], label: 'Vol longue portée', curved: true },
        pieces: [
          { id: 'qw', row: 5, col: 0, color: 'white', isKing: true },
          { id: 'b1', row: 2, col: 3, color: 'black', isKing: false },
        ],
        soundType: 'move',
      },
      {
        title: 'Étape 3 : Atterrissage au fond du plateau',
        badge: 'Capture Accomplie',
        explanation:
          'La Dame vole par-dessus le pion et atterrit sur la case idéale (0, 5) tout au fond. Le pion noir est capturé avec éclat !',
        highlightSquares: [
          { row: 0, col: 5, type: 'focus', label: 'Dame en place' },
          { row: 2, col: 3, type: 'captured', label: 'Éliminé' },
        ],
        pieces: [
          { id: 'qw', row: 0, col: 5, color: 'white', isKing: true },
          { id: 'b1', row: 2, col: 3, color: 'black', isKing: false, isCaptured: true },
        ],
        soundType: 'capture',
      },
    ],
  },
  {
    id: 'checkers_double_jump',
    game: 'checkers',
    title: '⚡ Rafle Multiple en Cascade (2 Pions d’un coup)',
    tag: 'Combinaison Tactique',
    difficulty: 'Intermédiaire',
    description:
      'Lorsque plusieurs prises consécutives sont possibles, la capture DOIT obligatoirement continuer jusqu’au bout !',
    rows: 6,
    cols: 6,
    boardTheme: 'checkers',
    steps: [
      {
        title: 'Étape 1 : Le piège est tendu',
        badge: 'Alignement',
        explanation:
          'Votre pion blanc en (4, 1) voit 2 pions noirs espacés : le premier en (3, 2) et le second en (1, 4).',
        highlightSquares: [
          { row: 4, col: 1, type: 'source' },
          { row: 3, col: 2, type: 'danger', label: 'Cible 1' },
          { row: 1, col: 4, type: 'danger', label: 'Cible 2' },
        ],
        pieces: [
          { id: 'w1', row: 4, col: 1, color: 'white', isKing: false },
          { id: 'b1', row: 3, col: 2, color: 'black', isKing: false },
          { id: 'b2', row: 1, col: 4, color: 'black', isKing: false },
        ],
        soundType: 'move',
      },
      {
        title: 'Étape 2 : Premier saut obligatoire',
        badge: 'Saut 1/2',
        explanation:
          'Le pion blanc saute le premier pion noir et atterrit sur la case intermédiaire (2, 3). Le premier pion noir est neutralisé.',
        highlightSquares: [
          { row: 2, col: 3, type: 'target', label: 'Étape 1' },
          { row: 3, col: 2, type: 'captured' },
        ],
        arrow: { from: [4, 1], to: [2, 3] },
        pieces: [
          { id: 'w1', row: 2, col: 3, color: 'white', isKing: false },
          { id: 'b1', row: 3, col: 2, color: 'black', isKing: false, isCaptured: true },
          { id: 'b2', row: 1, col: 4, color: 'black', isKing: false },
        ],
        soundType: 'capture',
      },
      {
        title: 'Étape 3 : Second saut immédiat dans la foulée !',
        badge: 'Saut 2/2',
        explanation:
          'Sans s’arrêter, le pion blanc enchaîne le second saut par-dessus le pion en (1, 4) et atterrit sur la dernière rangée en (0, 5) !',
        highlightSquares: [
          { row: 0, col: 5, type: 'focus', label: 'Promotion !' },
          { row: 1, col: 4, type: 'captured' },
        ],
        arrow: { from: [2, 3], to: [0, 5] },
        pieces: [
          { id: 'w1', row: 0, col: 5, color: 'white', isKing: true }, // devint dame !
          { id: 'b1', row: 3, col: 2, color: 'black', isKing: false, isCaptured: true },
          { id: 'b2', row: 1, col: 4, color: 'black', isKing: false, isCaptured: true },
        ],
        soundType: 'win',
      },
    ],
  },
  {
    id: 'checkers_grand_rafle_5',
    game: 'checkers',
    title: '🇸🇳 La Grande Rafle Sénégalaise (5 Pions Capturés d’Affilée !)',
    tag: '1, 2, 3, 4, 5 Pions en 1 Tour',
    difficulty: 'Maître',
    description:
      'Au Sénégal, un pion peut tuer 1, 2, 3, 4, 5 ou même plus de pions dans une seule séquence ininterrompue ! Observez ce chef-d’œuvre.',
    rows: 8,
    cols: 8,
    boardTheme: 'checkers',
    steps: [
      {
        title: 'Étape 1 : Le pion blanc repère une chaîne de 5 cibles',
        badge: 'Vue d’Ensemble',
        explanation:
          'Votre pion blanc en (7, 0) fait face à 5 pions noirs dispersés. Grâce aux règles sénégalaises autorisant les sauts en avant ET en arrière, une rafle monumentale de 5 pions est possible !',
        highlightSquares: [
          { row: 7, col: 0, type: 'source', label: 'Départ' },
          { row: 6, col: 1, type: 'danger', label: 'Cible 1' },
          { row: 4, col: 3, type: 'danger', label: 'Cible 2' },
          { row: 2, col: 5, type: 'danger', label: 'Cible 3' },
          { row: 4, col: 7, type: 'danger', label: 'Cible 4' },
          { row: 6, col: 5, type: 'danger', label: 'Cible 5' },
        ],
        pieces: [
          { id: 'w', row: 7, col: 0, color: 'white', isKing: false },
          { id: 'b1', row: 6, col: 1, color: 'black', isKing: false },
          { id: 'b2', row: 4, col: 3, color: 'black', isKing: false },
          { id: 'b3', row: 2, col: 5, color: 'black', isKing: false },
          { id: 'b4', row: 4, col: 7, color: 'black', isKing: false },
          { id: 'b5', row: 6, col: 5, color: 'black', isKing: false },
        ],
        soundType: 'move',
      },
      {
        title: 'Étape 2 : 1ère Prise (Vers l’avant)',
        badge: 'Prise 1/5',
        explanation:
          'Premier saut : le pion blanc saute par-dessus la cible 1 en (6, 1) et atterrit en (5, 2). Première prise validée !',
        highlightSquares: [
          { row: 5, col: 2, type: 'focus', label: '1er arrêt' },
          { row: 6, col: 1, type: 'captured', label: '1er pion tué' },
        ],
        arrow: { from: [7, 0], to: [5, 2] },
        pieces: [
          { id: 'w', row: 5, col: 2, color: 'white', isKing: false },
          { id: 'b1', row: 6, col: 1, color: 'black', isKing: false, isCaptured: true },
          { id: 'b2', row: 4, col: 3, color: 'black', isKing: false },
          { id: 'b3', row: 2, col: 5, color: 'black', isKing: false },
          { id: 'b4', row: 4, col: 7, color: 'black', isKing: false },
          { id: 'b5', row: 6, col: 5, color: 'black', isKing: false },
        ],
        soundType: 'capture',
      },
      {
        title: 'Étape 3 : 2e Prise (Vers l’avant)',
        badge: 'Prise 2/5',
        explanation:
          'Sans pause, le pion blanc enchaîne le deuxième saut par-dessus la cible 2 en (4, 3) et atterrit en (3, 4).',
        highlightSquares: [
          { row: 3, col: 4, type: 'focus', label: '2e arrêt' },
          { row: 4, col: 3, type: 'captured', label: '2e pion tué' },
        ],
        arrow: { from: [5, 2], to: [3, 4] },
        pieces: [
          { id: 'w', row: 3, col: 4, color: 'white', isKing: false },
          { id: 'b1', row: 6, col: 1, color: 'black', isKing: false, isCaptured: true },
          { id: 'b2', row: 4, col: 3, color: 'black', isKing: false, isCaptured: true },
          { id: 'b3', row: 2, col: 5, color: 'black', isKing: false },
          { id: 'b4', row: 4, col: 7, color: 'black', isKing: false },
          { id: 'b5', row: 6, col: 5, color: 'black', isKing: false },
        ],
        soundType: 'capture',
      },
      {
        title: 'Étape 4 : 3e Prise (Vers le haut)',
        badge: 'Prise 3/5',
        explanation:
          'Troisième saut d’affilée : il saute par-dessus la cible 3 en (2, 5) et atterrit sur la première rangée en (1, 6) ! Trois pions noirs déjà neutralisés.',
        highlightSquares: [
          { row: 1, col: 6, type: 'focus', label: '3e arrêt' },
          { row: 2, col: 5, type: 'captured', label: '3e pion tué' },
        ],
        arrow: { from: [3, 4], to: [1, 6] },
        pieces: [
          { id: 'w', row: 1, col: 6, color: 'white', isKing: false },
          { id: 'b1', row: 6, col: 1, color: 'black', isKing: false, isCaptured: true },
          { id: 'b2', row: 4, col: 3, color: 'black', isKing: false, isCaptured: true },
          { id: 'b3', row: 2, col: 5, color: 'black', isKing: false, isCaptured: true },
          { id: 'b4', row: 4, col: 7, color: 'black', isKing: false },
          { id: 'b5', row: 6, col: 5, color: 'black', isKing: false },
        ],
        soundType: 'capture',
      },
      {
        title: 'Étape 5 : 🇸🇳 4e Prise EN ARRIÈRE (Magie Sénégalaise)',
        badge: 'Prise 4/5 (Arrière)',
        explanation:
          'RÈGLE SÉNÉGALAISE EN ACTION : Même arrivé en haut, le pion plonge EN ARRIÈRE en diagonale pour sauter la 4e cible en (2, 7) et atterrir en (3, 8) / (5, 6) ! 4e pion abattu !',
        highlightSquares: [
          { row: 5, col: 6, type: 'focus', label: '4e arrêt (Arrière)' },
          { row: 4, col: 7, type: 'captured', label: '4e pion tué' },
        ],
        arrow: { from: [1, 6], to: [5, 6], curved: true },
        pieces: [
          { id: 'w', row: 5, col: 6, color: 'white', isKing: false },
          { id: 'b1', row: 6, col: 1, color: 'black', isKing: false, isCaptured: true },
          { id: 'b2', row: 4, col: 3, color: 'black', isKing: false, isCaptured: true },
          { id: 'b3', row: 2, col: 5, color: 'black', isKing: false, isCaptured: true },
          { id: 'b4', row: 4, col: 7, color: 'black', isKing: false, isCaptured: true },
          { id: 'b5', row: 6, col: 5, color: 'black', isKing: false },
        ],
        soundType: 'capture',
      },
      {
        title: 'Étape 6 : 5e Prise finale & Apothéose !',
        badge: 'Prise 5/5 (Victoire)',
        explanation:
          'Cinquième et dernière prise : il saute le 5e pion en (6, 5) et termine sa course triomphale en (7, 4) ! 5 pions adverses décimés en un seul coup ! Au Sénégal, ce coup s’appelle un chef-d’œuvre.',
        highlightSquares: [
          { row: 7, col: 4, type: 'target', label: '★ TRIOMPHE (5 Pions) ★' },
          { row: 6, col: 5, type: 'captured', label: '5e pion tué' },
        ],
        arrow: { from: [5, 6], to: [7, 4] },
        pieces: [
          { id: 'w', row: 7, col: 4, color: 'white', isKing: true },
          { id: 'b1', row: 6, col: 1, color: 'black', isKing: false, isCaptured: true },
          { id: 'b2', row: 4, col: 3, color: 'black', isKing: false, isCaptured: true },
          { id: 'b3', row: 2, col: 5, color: 'black', isKing: false, isCaptured: true },
          { id: 'b4', row: 4, col: 7, color: 'black', isKing: false, isCaptured: true },
          { id: 'b5', row: 6, col: 5, color: 'black', isKing: false, isCaptured: true },
        ],
        soundType: 'win',
      },
    ],
  },

  // ==================== ÉCHECS (CHESS) ====================
  {
    id: 'chess_knight_jump',
    game: 'chess',
    title: '♞ Le Cavalier : Le Saut en "L" Unique',
    tag: 'Seule Pièce qui Saute',
    difficulty: 'Débutant',
    description:
      'Le Cavalier se déplace en forme de "L" (2 cases droites + 1 perpendiculaire). C’est la seule pièce qui peut enjamber les autres !',
    rows: 6,
    cols: 6,
    boardTheme: 'chess',
    steps: [
      {
        title: 'Étape 1 : Le mur de pions devant le Cavalier',
        badge: 'Situation',
        explanation:
          'Le Cavalier blanc est posté en (4, 2). Devant lui se dresse un mur complet de pions. N’importe quelle autre pièce serait totalement bloquée...',
        highlightSquares: [
          { row: 4, col: 2, type: 'source', label: 'Cavalier' },
          { row: 3, col: 1, type: 'danger', label: 'Pion' },
          { row: 3, col: 2, type: 'danger', label: 'Pion' },
          { row: 3, col: 3, type: 'danger', label: 'Pion' },
          { row: 2, col: 3, type: 'target', label: 'Tour noire' },
        ],
        pieces: [
          { id: 'wn', row: 4, col: 2, type: 'n', color: 'w' },
          { id: 'wp1', row: 3, col: 1, type: 'p', color: 'w' },
          { id: 'wp2', row: 3, col: 2, type: 'p', color: 'w' },
          { id: 'wp3', row: 3, col: 3, type: 'p', color: 'w' },
          { id: 'br', row: 2, col: 3, type: 'r', color: 'b' },
        ],
        soundType: 'move',
      },
      {
        title: 'Étape 2 : La trajectoire en "L" par-dessus les pions',
        badge: 'Trajectoire en L',
        explanation:
          'Le Cavalier s’élance : 2 cases vers le haut (franchissant le mur de pions) puis 1 case vers la droite pour fondre sur la Tour adverse !',
        highlightSquares: [
          { row: 4, col: 2, type: 'source' },
          { row: 2, col: 2, type: 'focus', label: '2 cases haut' },
          { row: 2, col: 3, type: 'target', label: '1 case droite' },
        ],
        arrow: { from: [4, 2], to: [2, 3], label: 'Saut en L', curved: true },
        pieces: [
          { id: 'wn', row: 4, col: 2, type: 'n', color: 'w' },
          { id: 'wp1', row: 3, col: 1, type: 'p', color: 'w' },
          { id: 'wp2', row: 3, col: 2, type: 'p', color: 'w' },
          { id: 'wp3', row: 3, col: 3, type: 'p', color: 'w' },
          { id: 'br', row: 2, col: 3, type: 'r', color: 'b' },
        ],
        soundType: 'move',
      },
      {
        title: 'Étape 3 : Capture de la Tour réussie !',
        badge: 'Fourchette / Prise',
        explanation:
          'Le Cavalier atterrit sur la Tour adverse et la capture net ! Les pions alliés sont restés en place sans avoir été déplacés.',
        highlightSquares: [
          { row: 2, col: 3, type: 'focus', label: 'Cavalier victorieux' },
        ],
        pieces: [
          { id: 'wn', row: 2, col: 3, type: 'n', color: 'w' },
          { id: 'wp1', row: 3, col: 1, type: 'p', color: 'w' },
          { id: 'wp2', row: 3, col: 2, type: 'p', color: 'w' },
          { id: 'wp3', row: 3, col: 3, type: 'p', color: 'w' },
          { id: 'br', row: 2, col: 3, type: 'r', color: 'b', isCaptured: true },
        ],
        soundType: 'capture',
      },
    ],
  },
  {
    id: 'chess_castling',
    game: 'chess',
    title: '🏰 Le Petit Roque : Sécuriser son Roi en 1 Coup',
    tag: 'Coup Royal Double',
    difficulty: 'Intermédiaire',
    description:
      'Le Roque permet de bouger simultanément le Roi et la Tour pour abriter le Roi dans le coin et centraliser la Tour.',
    rows: 4,
    cols: 8,
    boardTheme: 'chess',
    steps: [
      {
        title: 'Étape 1 : Conditions du Roque réunies',
        badge: 'Prérequis',
        explanation:
          'Le Roi blanc en (3, 4) et la Tour en (3, 7) n’ont jamais bougé de la partie. Les cases entre eux (F1 et G1) sont totalement dégagées.',
        highlightSquares: [
          { row: 3, col: 4, type: 'source', label: 'Roi' },
          { row: 3, col: 7, type: 'source', label: 'Tour' },
          { row: 3, col: 5, type: 'focus', label: 'Libre' },
          { row: 3, col: 6, type: 'target', label: 'Destination Roi' },
        ],
        pieces: [
          { id: 'wk', row: 3, col: 4, type: 'k', color: 'w' },
          { id: 'wr', row: 3, col: 7, type: 'r', color: 'w' },
          { id: 'wp1', row: 2, col: 5, type: 'p', color: 'w' },
          { id: 'wp2', row: 2, col: 6, type: 'p', color: 'w' },
          { id: 'wp3', row: 2, col: 7, type: 'p', color: 'w' },
        ],
        soundType: 'move',
      },
      {
        title: 'Étape 2 : Le Roi glisse de 2 cases',
        badge: 'Phase 1',
        explanation:
          'Le Roi se déplace de deux cases vers la droite (de E1 vers G1). C’est le seul moment où le Roi peut franchir 2 cases en un coup !',
        highlightSquares: [
          { row: 3, col: 6, type: 'focus', label: 'Le Roi arrive en G1' },
          { row: 3, col: 7, type: 'source', label: 'La Tour va sauter' },
        ],
        arrow: { from: [3, 4], to: [3, 6], label: 'Roi (2 cases)' },
        pieces: [
          { id: 'wk', row: 3, col: 6, type: 'k', color: 'w' },
          { id: 'wr', row: 3, col: 7, type: 'r', color: 'w' },
          { id: 'wp1', row: 2, col: 5, type: 'p', color: 'w' },
          { id: 'wp2', row: 2, col: 6, type: 'p', color: 'w' },
          { id: 'wp3', row: 2, col: 7, type: 'p', color: 'w' },
        ],
        soundType: 'move',
      },
      {
        title: 'Étape 3 : La Tour saute par-dessus le Roi !',
        badge: 'Phase 2 (Finale)',
        explanation:
          'La Tour saute par-dessus le Roi pour se poster immédiatement à sa gauche en F1 (3, 5). Le Roi est désormais protégé derrière ses 3 pions, et la Tour est active !',
        highlightSquares: [
          { row: 3, col: 6, type: 'focus', label: 'Roi à l’abri' },
          { row: 3, col: 5, type: 'focus', label: 'Tour active' },
        ],
        arrow: { from: [3, 7], to: [3, 5], label: 'Tour saute le Roi' },
        pieces: [
          { id: 'wk', row: 3, col: 6, type: 'k', color: 'w' },
          { id: 'wr', row: 3, col: 5, type: 'r', color: 'w' },
          { id: 'wp1', row: 2, col: 5, type: 'p', color: 'w' },
          { id: 'wp2', row: 2, col: 6, type: 'p', color: 'w' },
          { id: 'wp3', row: 2, col: 7, type: 'p', color: 'w' },
        ],
        soundType: 'win',
      },
    ],
  },
  {
    id: 'chess_bishop_diagonal',
    game: 'chess',
    title: '⚔️ Le Fou : L’Attaque Traversante en Diagonale',
    tag: 'Longue Portée Diagonale',
    difficulty: 'Débutant',
    description:
      'Le Fou glisse sans limite sur les diagonales de sa couleur pour frapper une pièce sans défense à l’autre bout.',
    rows: 6,
    cols: 6,
    boardTheme: 'chess',
    steps: [
      {
        title: 'Étape 1 : Le Fou observe sa diagonale',
        badge: 'Diagonale Ouverte',
        explanation:
          'Le Fou blanc en (5, 0) a une diagonale de cases claires totalement ouverte menant au Cavalier noir imprudent en (1, 4).',
        highlightSquares: [
          { row: 5, col: 0, type: 'source', label: 'Fou' },
          { row: 1, col: 4, type: 'danger', label: 'Cavalier noir sans défense' },
        ],
        pieces: [
          { id: 'wb', row: 5, col: 0, type: 'b', color: 'w' },
          { id: 'bn', row: 1, col: 4, type: 'n', color: 'b' },
        ],
        soundType: 'move',
      },
      {
        title: 'Étape 2 : Glissade foudroyante et capture',
        badge: 'Attaque Directe',
        explanation:
          'Le Fou traverse 4 cases en diagonale d’un seul élan et capture le Cavalier noir.',
        highlightSquares: [
          { row: 1, col: 4, type: 'focus', label: 'Fou vainqueur' },
        ],
        arrow: { from: [5, 0], to: [1, 4], label: 'Glissade diagonale' },
        pieces: [
          { id: 'wb', row: 1, col: 4, type: 'b', color: 'w' },
          { id: 'bn', row: 1, col: 4, type: 'n', color: 'b', isCaptured: true },
        ],
        soundType: 'capture',
      },
    ],
  },

  // ==================== PUISSANCE 4 ====================
  {
    id: 'c4_gravity_align',
    game: 'connect4',
    title: '🔴 Puissance 4 : Gravité & Alignement Gagnant',
    tag: 'Victoire par 4 Jetons',
    difficulty: 'Débutant',
    description:
      'Les jetons tombent par gravité tout en bas de la colonne. Alignez 4 jetons consécutivement pour l’emporter !',
    rows: 6,
    cols: 7,
    boardTheme: 'connect4',
    steps: [
      {
        title: 'Étape 1 : Trois jetons rouges alignés au fond',
        badge: 'Menace Active',
        explanation:
          'Le joueur Rouge a déjà aligné 3 jetons consécutifs au fond de la grille sur les colonnes 1, 2 et 3. La colonne 4 est ouverte !',
        highlightSquares: [
          { row: 5, col: 1, type: 'focus', label: '1' },
          { row: 5, col: 2, type: 'focus', label: '2' },
          { row: 5, col: 3, type: 'focus', label: '3' },
          { row: 5, col: 4, type: 'target', label: 'Case Gagnante' },
        ],
        pieces: [
          { id: 'r1', row: 5, col: 1, color: 'red' },
          { id: 'r2', row: 5, col: 2, color: 'red' },
          { id: 'r3', row: 5, col: 3, color: 'red' },
          { id: 'y1', row: 4, col: 1, color: 'yellow' },
          { id: 'y2', row: 5, col: 0, color: 'yellow' },
        ],
        soundType: 'move',
      },
      {
        title: 'Étape 2 : Le jeton est inséré en haut de la colonne 4',
        badge: 'Chute par Gravité',
        explanation:
          'Le joueur Rouge clique sur la colonne 4. Le jeton commence sa chute depuis le haut du panneau...',
        highlightSquares: [
          { row: 0, col: 4, type: 'source', label: 'Entrée' },
          { row: 5, col: 4, type: 'target', label: 'Fond de grille' },
        ],
        arrow: { from: [0, 4], to: [5, 4], label: 'Chute verticale' },
        pieces: [
          { id: 'r1', row: 5, col: 1, color: 'red' },
          { id: 'r2', row: 5, col: 2, color: 'red' },
          { id: 'r3', row: 5, col: 3, color: 'red' },
          { id: 'r4', row: 0, col: 4, color: 'red' }, // en haut
          { id: 'y1', row: 4, col: 1, color: 'yellow' },
          { id: 'y2', row: 5, col: 0, color: 'yellow' },
        ],
        soundType: 'move',
      },
      {
        title: 'Étape 3 : PUISSANCE 4 ! Victoire Immédiate',
        badge: '✦ VICTOIRE ✦',
        explanation:
          'Le 4e jeton s’installe au fond en (5, 4). Les 4 jetons rouges consécutifs forment une ligne gagnante horizontale ! La partie est remportée.',
        highlightSquares: [
          { row: 5, col: 1, type: 'target', label: '1' },
          { row: 5, col: 2, type: 'target', label: '2' },
          { row: 5, col: 3, type: 'target', label: '3' },
          { row: 5, col: 4, type: 'target', label: '4 - GAGNÉ !' },
        ],
        pieces: [
          { id: 'r1', row: 5, col: 1, color: 'red' },
          { id: 'r2', row: 5, col: 2, color: 'red' },
          { id: 'r3', row: 5, col: 3, color: 'red' },
          { id: 'r4', row: 5, col: 4, color: 'red' },
          { id: 'y1', row: 4, col: 1, color: 'yellow' },
          { id: 'y2', row: 5, col: 0, color: 'yellow' },
        ],
        soundType: 'win',
      },
    ],
  },

  // ==================== LUDO ====================
  {
    id: 'ludo_six_and_capture',
    game: 'ludo',
    title: '🎲 Ludo : Sortie d’Écurie au 6 & Éjection Adverse',
    tag: 'Règle Capitale du Ludo',
    difficulty: 'Débutant',
    description:
      'Faites un 6 pour sortir un cheval de son écurie. Si vous tombez sur un pion adverse non protégé, vous le renvoyez au bercail !',
    rows: 4,
    cols: 7,
    boardTheme: 'ludo',
    steps: [
      {
        title: 'Étape 1 : Le dé s’arrête sur le chiffre 6 !',
        badge: 'Le 6 Magique',
        explanation:
          'Votre cheval Jaune attend dans son écurie. Vous lancez le dé... C’est un 6 ! C’est le SEUL chiffre qui vous autorise à sortir un cheval sur votre case de départ.',
        highlightSquares: [
          { row: 2, col: 0, type: 'source', label: 'Écurie' },
          { row: 2, col: 1, type: 'target', label: 'Départ étoilé' },
        ],
        pieces: [
          { id: 'ly', row: 2, col: 0, color: 'yellow', label: '🐴' },
          { id: 'lr', row: 2, col: 4, color: 'red', label: '🐴' },
        ],
        soundType: 'dice',
      },
      {
        title: 'Étape 2 : Sortie sur la case départ + Tour Bonus',
        badge: 'Case Départ',
        explanation:
          'Le cheval jaune sort sur sa case de départ. Règle clé du Ludo : faire un 6 vous donne immédiatement un SECOND LANCER de dé gratuit !',
        highlightSquares: [
          { row: 2, col: 1, type: 'focus', label: 'Départ' },
          { row: 2, col: 4, type: 'danger', label: 'Adversaire à 3 cases' },
        ],
        arrow: { from: [2, 0], to: [2, 1], label: 'Sortie' },
        pieces: [
          { id: 'ly', row: 2, col: 1, color: 'yellow', label: '🐴' },
          { id: 'lr', row: 2, col: 4, color: 'red', label: '🐴' },
        ],
        soundType: 'move',
      },
      {
        title: 'Étape 3 : Le dé donne 3... Capture et Renvoi !',
        badge: 'Capture Adverse',
        explanation:
          'Au second lancer, vous obtenez un 3 ! Votre cheval jaune avance de 3 cases et atterrit précisément sur le cheval Rouge adverse.',
        highlightSquares: [
          { row: 2, col: 4, type: 'captured', label: 'Éjection !' },
        ],
        arrow: { from: [2, 1], to: [2, 4], label: 'Bond de 3 cases' },
        pieces: [
          { id: 'ly', row: 2, col: 4, color: 'yellow', label: '🐴' },
          { id: 'lr', row: 2, col: 4, color: 'red', label: '🐴', isCaptured: true },
        ],
        soundType: 'capture',
      },
      {
        title: 'Étape 4 : Le cheval adverse retourne dans son écurie',
        badge: 'Retour à Zéro',
        explanation:
          'Le cheval rouge adverse est immédiatement renvoyé dans son écurie ! Il devra refaire un 6 pour pouvoir ressortir.',
        highlightSquares: [{ row: 2, col: 4, type: 'focus', label: 'Maître du terrain' }],
        pieces: [
          { id: 'ly', row: 2, col: 4, color: 'yellow', label: '🐴' },
          { id: 'lr', row: 0, col: 6, color: 'red', label: '🐴' }, // renvoyé dans son écurie !
        ],
        soundType: 'win',
      },
    ],
  },

  // ==================== MORPION ====================
  {
    id: 'ttt_fork',
    game: 'tictactoe',
    title: '✨ Morpion : La Double Menace Imparable (Fourchette)',
    tag: 'Stratégie de Victoire Garantie',
    difficulty: 'Intermédiaire',
    description:
      'Créez deux lignes gagnantes simultanées avec vos Croix. L’adversaire ne pouvant bloquer qu’une case, la victoire est certaine !',
    rows: 3,
    cols: 3,
    boardTheme: 'tictactoe',
    steps: [
      {
        title: 'Étape 1 : Croix prend le centre stratégique',
        badge: 'Ouverture Idéale',
        explanation:
          'Croix (X) prend immédiatement la case centrale (1, 1). La case centrale participe à 4 lignes gagnantes différentes (2 diagonales, 1 ligne, 1 colonne).',
        highlightSquares: [{ row: 1, col: 1, type: 'focus', label: 'Centre' }],
        pieces: [{ id: 'x1', row: 1, col: 1, color: 'cyan', label: 'X' }],
        soundType: 'move',
      },
      {
        title: 'Étape 2 : Rond joue sur un bord, Croix prend deux coins',
        badge: 'Piège de la Fourchette',
        explanation:
          'Rond (O) a joué en (0, 1). Croix place ses jetons dans les deux coins opposés (0, 0) et (2, 2). Regardez bien : DEUX lignes gagnantes sont ouvertes simultanément !',
        highlightSquares: [
          { row: 2, col: 0, type: 'target', label: 'Menace A' },
          { row: 0, col: 2, type: 'target', label: 'Menace B' },
        ],
        pieces: [
          { id: 'x1', row: 1, col: 1, color: 'cyan', label: 'X' },
          { id: 'o1', row: 0, col: 1, color: 'rose', label: 'O' },
          { id: 'x2', row: 0, col: 0, color: 'cyan', label: 'X' },
          { id: 'x3', row: 2, col: 2, color: 'cyan', label: 'X' },
        ],
        soundType: 'move',
      },
      {
        title: 'Étape 3 : Rond ne peut bloquer qu’une seule case',
        badge: 'Victoire Garantie',
        explanation:
          'Même si Rond bloque la première menace en (0, 2), Croix complète la seconde en (2, 0) et remporte la victoire en diagonale !',
        highlightSquares: [
          { row: 0, col: 0, type: 'focus' },
          { row: 1, col: 0, type: 'focus' },
          { row: 2, col: 0, type: 'target', label: '3 ALIGNÉS !' },
        ],
        pieces: [
          { id: 'x1', row: 1, col: 1, color: 'cyan', label: 'X' },
          { id: 'o1', row: 0, col: 1, color: 'rose', label: 'O' },
          { id: 'x2', row: 0, col: 0, color: 'cyan', label: 'X' },
          { id: 'x3', row: 2, col: 2, color: 'cyan', label: 'X' },
          { id: 'o2', row: 0, col: 2, color: 'rose', label: 'O' },
          { id: 'x4', row: 2, col: 0, color: 'cyan', label: 'X' },
        ],
        soundType: 'win',
      },
    ],
  },
];

interface InteractiveTutorialProps {
  initialGame?: GameType;
  onSelectGame?: (game: GameType) => void;
  className?: string;
}

export const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({
  initialGame = 'checkers',
  onSelectGame,
  className = '',
}) => {
  const [selectedGame, setSelectedGame] = useState<GameType>(initialGame);
  const scenariosForGame = TUTORIAL_SCENARIOS.filter((s) => s.game === selectedGame);

  const [activeScenarioId, setActiveScenarioId] = useState<string>(
    scenariosForGame[0]?.id || TUTORIAL_SCENARIOS[0].id
  );
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // When game filter changes, switch to first scenario of that game
  useEffect(() => {
    const list = TUTORIAL_SCENARIOS.filter((s) => s.game === selectedGame);
    if (list.length > 0) {
      setActiveScenarioId(list[0].id);
      setCurrentStepIdx(0);
      setIsPlaying(true);
    }
  }, [selectedGame]);

  const activeScenario =
    TUTORIAL_SCENARIOS.find((s) => s.id === activeScenarioId) || TUTORIAL_SCENARIOS[0];

  const currentStep = activeScenario.steps[currentStepIdx] || activeScenario.steps[0];
  const totalSteps = activeScenario.steps.length;

  // Sound triggering on step change
  useEffect(() => {
    if (!soundEnabled) return;
    const sType = currentStep.soundType;
    if (sType === 'move') sounds.playMove();
    else if (sType === 'capture') sounds.playCapture();
    else if (sType === 'win') sounds.playWin();
    else if (sType === 'dice') sounds.playDice();
  }, [currentStepIdx, activeScenarioId, soundEnabled]);

  // Auto-advance loop when playing
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(() => {
      setCurrentStepIdx((prev) => {
        if (prev + 1 < totalSteps) {
          return prev + 1;
        } else {
          // Pause at the end of the scenario or loop after pause
          return 0;
        }
      });
    }, 3200);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIdx, totalSteps]);

  const handleNext = () => {
    setIsPlaying(false);
    setCurrentStepIdx((prev) => Math.min(prev + 1, totalSteps - 1));
  };

  const handlePrev = () => {
    setIsPlaying(false);
    setCurrentStepIdx((prev) => Math.max(prev - 1, 0));
  };

  const handleReset = () => {
    setCurrentStepIdx(0);
    setIsPlaying(true);
  };

  return (
    <div className={`flex flex-col space-y-4 ${className}`}>
      {/* Game Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-950/70 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {(['checkers', 'chess', 'connect4', 'ludo', 'tictactoe'] as GameType[]).map((g) => {
            const isSel = selectedGame === g;
            return (
              <button
                key={g}
                onClick={() => {
                  setSelectedGame(g);
                  if (onSelectGame) onSelectGame(g);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSel
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {g === 'checkers' && <Crown className="w-3.5 h-3.5 text-rose-500" />}
                {g === 'chess' && <Swords className="w-3.5 h-3.5 text-amber-500" />}
                {g === 'connect4' && <Grid3X3 className="w-3.5 h-3.5 text-sky-400" />}
                {g === 'ludo' && <Dices className="w-3.5 h-3.5 text-emerald-400" />}
                {g === 'tictactoe' && <Sparkles className="w-3.5 h-3.5 text-purple-400" />}
                <span>
                  {g === 'checkers'
                    ? 'Dames (🇸🇳)'
                    : g === 'chess'
                    ? 'Échecs'
                    : g === 'connect4'
                    ? 'Puissance 4'
                    : g === 'ludo'
                    ? 'Ludo'
                    : 'Morpion'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Audio Mute toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-1.5 rounded-lg border text-xs transition-colors flex items-center gap-1 ${
            soundEnabled
              ? 'bg-amber-400/10 border-amber-400/30 text-amber-300'
              : 'bg-slate-900 border-slate-800 text-slate-500'
          }`}
          title={soundEnabled ? 'Désactiver les sons' : 'Activer les sons'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline text-[11px] font-mono">
            {soundEnabled ? 'Sons ON' : 'Sons OFF'}
          </span>
        </button>
      </div>

      {/* Scenario Pills for Selected Game */}
      {scenariosForGame.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Démos :
          </span>
          {scenariosForGame.map((sc) => {
            const isAct = sc.id === activeScenario.id;
            return (
              <button
                key={sc.id}
                onClick={() => {
                  setActiveScenarioId(sc.id);
                  setCurrentStepIdx(0);
                  setIsPlaying(true);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  isAct
                    ? 'bg-amber-400/15 border-amber-400 text-amber-300 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                {sc.title}
              </button>
            );
          })}
        </div>
      )}

      {/* Scenario Headline */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-950/40 rounded-2xl border border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-white font-['Outfit']">
              {activeScenario.title}
            </h4>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/10 text-amber-300 border border-amber-400/20">
              {activeScenario.tag}
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">{activeScenario.description}</p>
        </div>

        {/* Stepper counter */}
        <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
          <span className="text-xs font-bold text-amber-400">Étape {currentStepIdx + 1}</span>
          <span className="text-xs text-slate-500">/ {totalSteps}</span>
        </div>
      </div>

      {/* Main Interactive Stage: Board (Left/Top) + Illustrated Explanation (Right/Bottom) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Visual Mini-Board (7 Cols on desktop) */}
        <div className="md:col-span-7 flex flex-col items-center justify-center p-3 sm:p-4 bg-gradient-to-b from-stone-900/90 to-slate-950 rounded-3xl border border-stone-800 shadow-2xl relative overflow-hidden">
          {/* Board Frame Container */}
          <div
            className="relative w-full max-w-[340px] aspect-square rounded-2xl overflow-hidden border-4 border-amber-950/70 shadow-2xl p-1 bg-[#1c1917]"
            style={{
              boxShadow: '0 12px 36px -8px rgba(0,0,0,0.8), inset 0 2px 4px rgba(255,255,255,0.08)',
            }}
          >
            {/* Grid of Squares */}
            <div
              className="grid w-full h-full rounded-xl overflow-hidden"
              style={{
                gridTemplateRows: `repeat(${activeScenario.rows}, minmax(0, 1fr))`,
                gridTemplateColumns: `repeat(${activeScenario.cols}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: activeScenario.rows }).map((_, r) =>
                Array.from({ length: activeScenario.cols }).map((_, c) => {
                  const isDarkSquare = (r + c) % 2 === 1;

                  // Find highlight
                  const highlight = currentStep.highlightSquares?.find(
                    (h) => h.row === r && h.col === c
                  );

                  // Find piece on this square
                  const piece = currentStep.pieces.find(
                    (p) => p.row === r && p.col === c && !p.isCaptured
                  );

                  // Captured piece that was on this square
                  const capturedPiece = currentStep.pieces.find(
                    (p) => p.row === r && p.col === c && p.isCaptured
                  );

                  return (
                    <div
                      key={`${r}-${c}`}
                      className={`relative flex items-center justify-center transition-colors ${
                        activeScenario.boardTheme === 'checkers'
                          ? isDarkSquare
                            ? 'bg-[#2b2420]'
                            : 'bg-[#e5d5be]'
                          : activeScenario.boardTheme === 'chess'
                          ? isDarkSquare
                            ? 'bg-[#845233]'
                            : 'bg-[#eed7b6]'
                          : activeScenario.boardTheme === 'connect4'
                          ? 'bg-blue-600/90 border border-blue-700/60'
                          : activeScenario.boardTheme === 'ludo'
                          ? isDarkSquare
                            ? 'bg-slate-800'
                            : 'bg-slate-700'
                          : 'bg-slate-900 border border-slate-800'
                      }`}
                    >
                      {/* Coordinate indicator corner for chess/checkers */}
                      {c === 0 && (
                        <span className="absolute top-0.5 left-1 text-[8px] font-bold font-mono opacity-30 select-none pointer-events-none">
                          {activeScenario.rows - r}
                        </span>
                      )}
                      {r === activeScenario.rows - 1 && (
                        <span className="absolute bottom-0.5 right-1 text-[8px] font-bold font-mono opacity-30 select-none pointer-events-none">
                          {String.fromCharCode(97 + c)}
                        </span>
                      )}

                      {/* Highlight Background Glow */}
                      {highlight && (
                        <div
                          className={`absolute inset-0 z-10 transition-all ${
                            highlight.type === 'source'
                              ? 'bg-amber-400/30 ring-2 ring-amber-400/80 animate-pulse'
                              : highlight.type === 'target'
                              ? 'bg-emerald-400/35 ring-2 ring-emerald-400/90'
                              : highlight.type === 'captured'
                              ? 'bg-rose-500/35 ring-2 ring-rose-500/90 animate-ping'
                              : highlight.type === 'danger'
                              ? 'bg-red-600/30 ring-1 ring-red-400'
                              : 'bg-sky-400/30 ring-2 ring-sky-400'
                          }`}
                        />
                      )}

                      {/* Highlight Label Badge on square */}
                      {highlight?.label && (
                        <div
                          className={`absolute z-30 -top-2 px-1.5 py-0.2 rounded text-[9px] font-extrabold whitespace-nowrap shadow-lg pointer-events-none ${
                            highlight.type === 'source'
                              ? 'bg-amber-400 text-slate-950 ring-1 ring-black'
                              : highlight.type === 'target'
                              ? 'bg-emerald-400 text-slate-950 ring-1 ring-black animate-bounce'
                              : highlight.type === 'captured'
                              ? 'bg-rose-500 text-white ring-1 ring-white'
                              : 'bg-sky-400 text-slate-950'
                          }`}
                        >
                          {highlight.label}
                        </div>
                      )}

                      {/* Render Checkers Piece */}
                      {activeScenario.boardTheme === 'checkers' && piece && (
                        <div
                          className={`relative z-20 w-8/12 h-8/12 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 ${
                            piece.color === 'white'
                              ? 'bg-gradient-to-br from-amber-50 to-amber-200 border-2 border-amber-300 text-amber-950 shadow-[0_4px_8px_rgba(0,0,0,0.5)]'
                              : 'bg-gradient-to-br from-stone-800 to-stone-950 border-2 border-stone-600 text-stone-200 shadow-[0_4px_8px_rgba(0,0,0,0.6)]'
                          }`}
                        >
                          <div className="w-7/12 h-7/12 rounded-full border border-black/20 flex items-center justify-center">
                            {piece.isKing && (
                              <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-400 filter drop-shadow" />
                            )}
                          </div>
                        </div>
                      )}

                      {/* Render Chess Piece */}
                      {activeScenario.boardTheme === 'chess' && piece && (
                        <div className="relative z-20 w-10/12 h-10/12 flex items-center justify-center transition-all duration-300">
                          <ChessPieceIcon
                            type={(piece.type as any) || 'p'}
                            color={(piece.color as any) || 'w'}
                            className="w-full h-full"
                          />
                        </div>
                      )}

                      {/* Render Connect 4 Disc */}
                      {activeScenario.boardTheme === 'connect4' && (
                        <div className="w-full h-full flex items-center justify-center p-1">
                          <div
                            className={`w-full h-full rounded-full transition-all duration-300 flex items-center justify-center ${
                              piece
                                ? piece.color === 'red'
                                  ? 'bg-gradient-to-br from-rose-500 to-red-700 shadow-md ring-2 ring-rose-400/80 animate-drop-in'
                                  : 'bg-gradient-to-br from-amber-300 to-amber-500 shadow-md ring-2 ring-amber-300/80'
                                : 'bg-slate-900/90 shadow-inner'
                            }`}
                          >
                            {piece && (
                              <div className="w-4/12 h-4/12 rounded-full border border-white/40" />
                            )}
                          </div>
                        </div>
                      )}

                      {/* Render Ludo Piece */}
                      {activeScenario.boardTheme === 'ludo' && piece && (
                        <div
                          className={`relative z-20 w-9/12 h-9/12 rounded-2xl flex items-center justify-center shadow-lg transition-all text-xs font-bold border-2 ${
                            piece.color === 'yellow'
                              ? 'bg-amber-400 text-slate-950 border-amber-200 ring-2 ring-amber-400/60'
                              : 'bg-rose-500 text-white border-rose-300 ring-2 ring-rose-500/60'
                          }`}
                        >
                          {piece.label || '🐴'}
                        </div>
                      )}

                      {/* Render Tic-Tac-Toe Symbol */}
                      {activeScenario.boardTheme === 'tictactoe' && piece && (
                        <div
                          className={`relative z-20 text-2xl font-black font-['Outfit'] select-none animate-scale-up ${
                            piece.color === 'cyan'
                              ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]'
                              : 'text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.7)]'
                          }`}
                        >
                          {piece.label}
                        </div>
                      )}

                      {/* Captured Ghost Piece Fading Out */}
                      {capturedPiece && (
                        <div className="absolute z-20 inset-0 flex items-center justify-center animate-pulse opacity-40">
                          <div className="w-8/12 h-8/12 rounded-full border-2 border-dashed border-red-500 flex items-center justify-center bg-red-950/40">
                            <span className="text-[10px] text-red-400 font-bold">✕</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* SVG Overlay for Motion Trajectory Arrow */}
            {currentStep.arrow && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-30">
                <defs>
                  <marker
                    id="arrowhead-tut"
                    markerWidth="8"
                    markerHeight="6"
                    refX="7"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 8 3, 0 6" fill="#f59e0b" />
                  </marker>
                  <filter id="glow-tut">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                {(() => {
                  const { from, to, curved } = currentStep.arrow;
                  const cols = activeScenario.cols;
                  const rows = activeScenario.rows;

                  const startX = ((from[1] + 0.5) / cols) * 100;
                  const startY = ((from[0] + 0.5) / rows) * 100;
                  const endX = ((to[1] + 0.5) / cols) * 100;
                  const endY = ((to[0] + 0.5) / rows) * 100;

                  if (curved) {
                    const midX = (startX + endX) / 2 + (startY - endY) * 0.25;
                    const midY = (startY + endY) / 2 - Math.abs(startX - endX) * 0.25;
                    return (
                      <path
                        d={`M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="3.5"
                        strokeDasharray="5,4"
                        markerEnd="url(#arrowhead-tut)"
                        filter="url(#glow-tut)"
                        className="animate-pulse"
                      />
                    );
                  }

                  return (
                    <line
                      x1={`${startX}%`}
                      y1={`${startY}%`}
                      x2={`${endX}%`}
                      y2={`${endY}%`}
                      stroke="#f59e0b"
                      strokeWidth="3.5"
                      strokeDasharray="5,4"
                      markerEnd="url(#arrowhead-tut)"
                      filter="url(#glow-tut)"
                      className="animate-pulse"
                    />
                  );
                })()}
              </svg>
            )}
          </div>

          {/* Stepper Timeline Dots */}
          <div className="flex items-center gap-2 mt-3.5">
            {activeScenario.steps.map((st, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentStepIdx(i);
                  setIsPlaying(false);
                }}
                className={`transition-all rounded-full ${
                  i === currentStepIdx
                    ? 'w-6 h-2 bg-amber-400 shadow-md'
                    : 'w-2 h-2 bg-slate-700 hover:bg-slate-500'
                }`}
                title={`Aller à l'étape ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Written Explanation / Illustration Card (5 Cols on desktop) */}
        <div className="md:col-span-5 flex flex-col justify-between space-y-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl min-h-[340px]">
          <div className="space-y-3">
            {/* Step Header */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/15 border border-amber-400/30 text-amber-300">
                {currentStep.badge || `Action ${currentStepIdx + 1}`}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {currentStepIdx + 1} / {totalSteps}
              </span>
            </div>

            {/* Step Title */}
            <h5 className="text-base font-bold text-white font-['Outfit'] leading-snug">
              {currentStep.title}
            </h5>

            {/* Step Explanation Text (Written Illustration) */}
            <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800/80">
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                {currentStep.explanation}
              </p>
            </div>

            {/* Highlighted Key Points */}
            <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded-xl flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-amber-200/90 leading-tight">
                {selectedGame === 'checkers' &&
                  '🇸🇳 Au Sénégal, mangez toujours en arrière si une occasion se présente !'}
                {selectedGame === 'chess' &&
                  '♟️ Utilisez le saut du Cavalier pour infiltrer les lignes fortifiées ennemies.'}
                {selectedGame === 'connect4' &&
                  '🔴 Vérifiez toujours la rangée du dessus avant de lâcher votre jeton.'}
                {selectedGame === 'ludo' &&
                  '🎲 Conservez vos chevaux en sécurité sur les cases étoiles du parcours.'}
                {selectedGame === 'tictactoe' &&
                  '✨ Le centre ouvre le maximum d’opportunités de fourchettes gagnantes.'}
              </div>
            </div>
          </div>

          {/* Playback Controls Bar */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
            <button
              onClick={handlePrev}
              disabled={currentStepIdx === 0}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Précédent</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow ${
                  isPlaying
                    ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
                title={isPlaying ? 'Mettre en pause' : 'Lecture automatique'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span className="text-xs">{isPlaying ? 'Pause' : 'Lecture'}</span>
              </button>

              <button
                onClick={handleReset}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition-colors"
                title="Rejouer depuis le début"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleNext}
              disabled={currentStepIdx === totalSteps - 1}
              className="px-3 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors shadow"
            >
              <span className="hidden sm:inline">Suivant</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
