import { GameType } from './game';

export interface BoardTheme {
  id: string;
  name: string;
  category: 'checkers_chess' | 'connect4' | 'tictactoe' | 'ludo';
  darkSquare: string; // CSS class or hex
  lightSquare: string;
  borderColor: string;
  frameBg: string;
  previewBg: string;
}

export interface PieceTheme {
  id: string;
  name: string;
  game: GameType;
  primaryColor: string; // Hex or CSS description
  secondaryColor: string;
  label: string;
  previewP1: string;
  previewP2: string;
}

export const BOARD_THEMES: Record<string, BoardTheme> = {
  // Checkers & Chess boards
  wood_classic: {
    id: 'wood_classic',
    name: 'Buis & Ébène Précieux',
    category: 'checkers_chess',
    darkSquare: 'bg-[#2b2420]',
    lightSquare: 'bg-[#e5d5be]',
    borderColor: 'border-[#452c1e]',
    frameBg: 'bg-[#1c1613]',
    previewBg: 'linear-gradient(135deg, #2b2420 50%, #e5d5be 50%)',
  },
  teranga_senegal: {
    id: 'teranga_senegal',
    name: '🇸🇳 Téranga Sénégalaise (Sable & Acajou)',
    category: 'checkers_chess',
    darkSquare: 'bg-[#5c2415]',
    lightSquare: 'bg-[#f4dfb8]',
    borderColor: 'border-[#7a321d]',
    frameBg: 'bg-[#2e120a]',
    previewBg: 'linear-gradient(135deg, #5c2415 50%, #f4dfb8 50%)',
  },
  emerald_tournament: {
    id: 'emerald_tournament',
    name: 'Émeraude & Nacre Tournoi',
    category: 'checkers_chess',
    darkSquare: 'bg-[#1e4e3d]',
    lightSquare: 'bg-[#f3f0e6]',
    borderColor: 'border-[#133529]',
    frameBg: 'bg-[#0b1c15]',
    previewBg: 'linear-gradient(135deg, #1e4e3d 50%, #f3f0e6 50%)',
  },
  dark_slate: {
    id: 'dark_slate',
    name: 'Ardoise Moderne & Marbre Noir',
    category: 'checkers_chess',
    darkSquare: 'bg-[#1e293b]',
    lightSquare: 'bg-[#cbd5e1]',
    borderColor: 'border-[#334155]',
    frameBg: 'bg-[#0f172a]',
    previewBg: 'linear-gradient(135deg, #1e293b 50%, #cbd5e1 50%)',
  },
  royal_sapphire: {
    id: 'royal_sapphire',
    name: 'Nuit Saphir & Argent Glacé',
    category: 'checkers_chess',
    darkSquare: 'bg-[#1e3a5f]',
    lightSquare: 'bg-[#e0e7ff]',
    borderColor: 'border-[#2d4d7a]',
    frameBg: 'bg-[#0d1b2a]',
    previewBg: 'linear-gradient(135deg, #1e3a5f 50%, #e0e7ff 50%)',
  },
};

export const CHECKERS_PIECE_THEMES: PieceTheme[] = [
  {
    id: 'ivory_ebony',
    name: 'Ivoire Naturel & Ébène Sombre',
    game: 'checkers',
    primaryColor: '#fef08a',
    secondaryColor: '#1c1917',
    label: 'Classique Tournoi',
    previewP1: 'bg-gradient-to-br from-amber-50 to-amber-200 border-amber-300 text-amber-950',
    previewP2: 'bg-gradient-to-br from-stone-800 to-stone-950 border-stone-600 text-stone-200',
  },
  {
    id: 'ruby_carbon',
    name: 'Rouge Rubis & Noir Carbone',
    game: 'checkers',
    primaryColor: '#f43f5e',
    secondaryColor: '#09090b',
    label: 'Dames Africaines Vives',
    previewP1: 'bg-gradient-to-br from-rose-500 to-rose-700 border-rose-300/40 text-white',
    previewP2: 'bg-gradient-to-br from-stone-900 to-black border-stone-700 text-stone-100',
  },
  {
    id: 'imperial_gold',
    name: 'Or Impérial & Bronze Doré',
    game: 'checkers',
    primaryColor: '#f59e0b',
    secondaryColor: '#78350f',
    label: 'Luxe Royal',
    previewP1: 'bg-gradient-to-br from-amber-300 to-yellow-600 border-yellow-200 text-slate-950',
    previewP2: 'bg-gradient-to-br from-amber-950 to-stone-900 border-amber-700 text-amber-200',
  },
  {
    id: 'emerald_walnut',
    name: 'Vert Émeraude & Noyer Fumé',
    game: 'checkers',
    primaryColor: '#10b981',
    secondaryColor: '#292524',
    label: 'Club Élite',
    previewP1: 'bg-gradient-to-br from-emerald-400 to-emerald-700 border-emerald-300 text-white',
    previewP2: 'bg-gradient-to-br from-stone-800 to-stone-950 border-stone-600 text-stone-200',
  },
];

export const CHESS_PIECE_THEMES: PieceTheme[] = [
  {
    id: 'boxwood_walnut',
    name: 'Buis Poli & Noyer Artisanal (Bois 3D)',
    game: 'chess',
    primaryColor: '#fef3c7',
    secondaryColor: '#451a03',
    label: 'Sculpture Staunton Réelle',
    previewP1: 'bg-amber-100 border-amber-300',
    previewP2: 'bg-stone-800 border-amber-900',
  },
  {
    id: 'gold_silver',
    name: 'Or Brillant & Argent Platine',
    game: 'chess',
    primaryColor: '#facc15',
    secondaryColor: '#94a3b8',
    label: 'Métal Précieux',
    previewP1: 'bg-amber-400 border-amber-200',
    previewP2: 'bg-slate-300 border-slate-400',
  },
  {
    id: 'marble_obsidian',
    name: 'Marbre Blanc & Obsidienne Volcanique',
    game: 'chess',
    primaryColor: '#f8fafc',
    secondaryColor: '#020617',
    label: 'Minéral Prestige',
    previewP1: 'bg-white border-slate-200',
    previewP2: 'bg-slate-950 border-slate-700',
  },
];

export const CONNECT4_THEMES = [
  {
    id: 'classic_blue',
    name: 'Arcade Bleue (Rouge vs Jaune)',
    frame: 'bg-blue-600 border-blue-700',
    disc1: 'bg-gradient-to-br from-rose-500 to-red-700',
    disc2: 'bg-gradient-to-br from-amber-300 to-amber-500',
  },
  {
    id: 'cyber_neon',
    name: 'Cyberpunk Néon (Cyan vs Magenta)',
    frame: 'bg-slate-900 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]',
    disc1: 'bg-gradient-to-br from-fuchsia-500 to-rose-600',
    disc2: 'bg-gradient-to-br from-cyan-300 to-blue-500',
  },
  {
    id: 'casino_gold',
    name: 'Casino Royal (Or & Émeraude)',
    frame: 'bg-stone-900 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.3)]',
    disc1: 'bg-gradient-to-br from-amber-300 to-amber-600',
    disc2: 'bg-gradient-to-br from-emerald-400 to-emerald-700',
  },
];

export const TICTACTOE_THEMES = [
  {
    id: 'cyber_glow',
    name: 'Néon Cyber (Cyan X & Rose O)',
    colorX: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]',
    colorO: 'text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.7)]',
  },
  {
    id: 'gold_silver',
    name: 'Or & Platine Royal',
    colorX: 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.7)]',
    colorO: 'text-slate-200 drop-shadow-[0_0_8px_rgba(226,232,240,0.7)]',
  },
  {
    id: 'emerald_amethyst',
    name: 'Émeraude & Pourpre Mystique',
    colorX: 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.7)]',
    colorO: 'text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.7)]',
  },
];

export interface UserThemesState {
  boardTheme: string;
  checkersPieceTheme: string;
  chessPieceTheme: string;
  connect4Theme: string;
  tictactoeTheme: string;
}

const STORAGE_KEY = 'agoraplay_user_themes_v1';

export function loadUserThemes(): UserThemesState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // fallback
  }
  return {
    boardTheme: 'wood_classic',
    checkersPieceTheme: 'ruby_carbon',
    chessPieceTheme: 'boxwood_walnut',
    connect4Theme: 'classic_blue',
    tictactoeTheme: 'cyber_glow',
  };
}

export function saveUserThemes(themes: UserThemesState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(themes));
  } catch {
    // ignore
  }
}
