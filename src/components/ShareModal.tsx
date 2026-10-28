import React, { useState } from 'react';
import { Copy, Check, Lock, X, Share2 } from 'lucide-react';
import { RoomConfig } from '../types/game';

interface ShareModalProps {
  config: RoomConfig;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ config, isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}?salon=${config.key}`
    : `https://agoraplay.onrender.com?salon=${config.key}`;

  const copyToClipboard = async (text: string, type: 'key' | 'link') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'key') {
        setCopiedKey(true);
        setTimeout(() => setCopiedKey(false), 2000);
      } else {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `AgoraPlay — Rejoins mon salon ${config.key}`,
          text: `Rejoins ma partie sur AgoraPlay avec la clé : ${config.key}`,
          url: inviteUrl,
        });
      } catch {
        // cancelled
      }
    } else {
      copyToClipboard(inviteUrl, 'link');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-4 sm:p-6 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5 sm:mb-6">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center mx-auto mb-2.5">
            <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white font-['Outfit']">
            Partager votre Salon Privé
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Donnez cette clé ou ce lien à votre ami pour qu&apos;il rejoigne votre partie en direct.
          </p>
        </div>

        {/* Room Key Box */}
        <div className="mb-3.5">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Clé d&apos;accès exclusive
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 font-mono text-center text-base sm:text-lg font-bold text-amber-400 tracking-wider">
              {config.key}
            </div>
            <button
              onClick={() => copyToClipboard(config.key, 'key')}
              className="px-3.5 py-2.5 sm:px-4 sm:py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold rounded-xl transition-colors flex items-center gap-1.5 text-xs shrink-0"
            >
              {copiedKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedKey ? 'Copié' : 'Copier'}
            </button>
          </div>
        </div>

        {/* Full Link Box */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Lien direct d&apos;invitation
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={inviteUrl}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono truncate"
            />
            <button
              onClick={() => copyToClipboard(inviteUrl, 'link')}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition-colors flex items-center gap-1 text-xs shrink-0"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copiedLink ? 'Copié' : 'Copier'}
            </button>
          </div>
        </div>

        {/* Native Mobile Share Button */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            onClick={handleNativeShare}
            className="w-full mb-3 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Partager via WhatsApp, SMS, Réseaux...
          </button>
        )}

        {/* Passcode notice */}
        {config.hasPasscode && (
          <div className="p-3 bg-amber-950/30 border border-amber-900/50 rounded-xl text-xs text-amber-300 mb-4 flex items-start gap-2">
            <Lock className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Salon protégé par mot de passe :</span>{' '}
              N&apos;oubliez pas de transmettre également votre mot de passe à votre invité.
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
        >
          Fermer et retourner au jeu
        </button>
      </div>
    </div>
  );
};
