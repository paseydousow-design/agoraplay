import React from 'react';
import { Swords, Plus, Volume2, VolumeX } from 'lucide-react';
import { sounds } from '../services/sound';

interface HeaderProps {
  onCreateRoomClick: () => void;
  onNavigate: (view: 'lobby' | 'rules') => void;
  activeView: 'lobby' | 'rules';
  soundMuted: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onCreateRoomClick,
  onNavigate,
  activeView,
  soundMuted,
  onToggleSound,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Wordmark */}
        <button
          onClick={() => onNavigate('lobby')}
          className="flex items-center gap-2.5 text-left group transition-opacity hover:opacity-90"
        >
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
            <Swords className="w-5 h-5" />
          </div>
          <span className="font-['Outfit'] font-bold text-xl text-white tracking-tight whitespace-nowrap shrink-0">
            AgoraPlay
          </span>
        </button>

        {/* Zone 2: Single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <button
            onClick={() => onNavigate('lobby')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeView === 'lobby' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            Jeux Disponibles
          </button>
          <button
            onClick={() => onNavigate('rules')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeView === 'rules' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            Règles & Astuces
          </button>
          <a
            href="#faq"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('rules');
            }}
            className="transition-colors whitespace-nowrap shrink-0 hover:text-white"
          >
            Salons Privés Sécurisés
          </a>
        </nav>

        {/* Zone 3: 1 primary action + sound toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              onToggleSound();
              sounds.enabled = soundMuted; // Toggle next
            }}
            title={soundMuted ? 'Activer le son' : 'Couper le son'}
            className="p-2 text-slate-400 hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-800"
            aria-label="Contrôle du son"
          >
            {soundMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-amber-400" />}
          </button>

          <button
            onClick={onCreateRoomClick}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 font-['Outfit'] font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Créer un Salon</span>
            <span className="sm:hidden">Salon</span>
          </button>
        </div>
      </div>
    </header>
  );
};
