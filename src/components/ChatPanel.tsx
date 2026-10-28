import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types/game';
import { Send, MessageSquare } from 'lucide-react';
import { sounds } from '../services/sound';

interface ChatPanelProps {
  messages: ChatMessage[];
  currentUserId: string;
  onSendMessage: (text: string) => void;
}

const QUICK_REACTIONS = [
  'Bien joué !',
  'À toi de jouer',
  'Joli coup !',
  'Revanche ?',
  'Bien vu !',
];

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  currentUserId,
  onSendMessage,
}) => {
  const [inputText, setInputText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    sounds.playChat();
    setInputText('');
  };

  const handleQuickReaction = (text: string) => {
    onSendMessage(text);
    sounds.playChat();
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
      {/* Chat Header */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-white font-['Outfit']">
            Discussion du Salon
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {messages.length} messages
        </span>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[160px] max-h-[300px] lg:max-h-[380px]">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;

          if (msg.isSystem) {
            return (
              <div
                key={msg.id}
                className="text-center text-xs text-slate-400 py-1 px-3 bg-slate-950/40 rounded-lg border border-slate-800/40 my-1"
              >
                {msg.text}
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-0.5 px-1">
                <span className="font-medium text-slate-400">{isMe ? 'Vous' : msg.senderName}</span>
                <span aria-hidden="true">·</span>
                <span>
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div
                className={`max-w-[85%] px-3 py-2 rounded-xl text-xs sm:text-sm leading-relaxed ${
                  isMe
                    ? 'bg-amber-400 text-slate-950 font-medium rounded-tr-none'
                    : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/60'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Quick Reactions Bar */}
      <div className="px-3 py-2 border-t border-slate-800/80 bg-slate-950/40 flex items-center gap-1.5 overflow-x-auto">
        {QUICK_REACTIONS.map((reaction) => (
          <button
            key={reaction}
            type="button"
            onClick={() => handleQuickReaction(reaction)}
            className="text-[11px] px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 whitespace-nowrap transition-colors shrink-0"
          >
            {reaction}
          </button>
        ))}
      </div>

      {/* Send Input Bar */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Envoyer un message au salon..."
          maxLength={200}
          className="flex-1 bg-slate-950 text-white placeholder-slate-500 text-xs sm:text-sm px-3.5 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-400 transition-colors"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2 bg-amber-400 text-slate-950 hover:bg-amber-300 disabled:opacity-40 disabled:hover:bg-amber-400 rounded-lg transition-colors shrink-0"
          aria-label="Envoyer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
