import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Bot } from 'lucide-react';
import type { Room, Player, Card } from '@shared/types';

interface BotPoolsModalProps {
  room: Room;
  onClose: () => void;
}

export const BotPoolsModal: React.FC<BotPoolsModalProps> = ({ room, onClose }) => {
  const bots = room.players.filter(p => p.isBot);
  const [selectedBot, setSelectedBot] = useState<Player | null>(bots[0] || null);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed inset-0 z-[1000] bg-slate-950/98 backdrop-blur-3xl flex flex-col pt-safe"
    >
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-indigo-500/20 bg-slate-900/50 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/30">
            <Bot className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl sm:text-3xl font-black text-white uppercase tracking-widest italic leading-none">Debug Bots</h2>
            <p className="text-indigo-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Ispeziona le pick dell'IA</p>
          </div>
        </div>
        <button onClick={onClose} className="p-3 sm:p-4 text-slate-400 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700 transition-colors border border-white/5 active:scale-95">
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <div className="flex flex-1 overflow-hidden flex-col sm:flex-row">
        {/* Sidebar Bot List */}
        <div className="w-full sm:w-72 border-b sm:border-b-0 sm:border-r border-indigo-500/20 bg-slate-900/30 overflow-y-auto sm:overflow-y-auto overflow-x-auto p-4 flex sm:flex-col flex-row gap-3 h-24 sm:h-auto shrink-0">
          {bots.map((bot, index) => (
            <button 
              key={bot.playerId || bot.id || `bot-${index}`}
              onClick={() => setSelectedBot(bot)}
              className={`p-3 sm:p-4 rounded-xl sm:rounded-[2rem] text-left border shrink-0 transition-all ${
                selectedBot?.playerId === bot.playerId 
                  ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/20 scale-100' 
                  : 'bg-slate-900/50 border-white/5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 scale-95 hover:scale-100'
              }`}
            >
              <div className="font-black flex items-center gap-3 tracking-widest text-sm uppercase">
                <img src={`/avatars/${bot.avatar}`} alt={bot.name} className="w-8 h-8 rounded-full border-2 border-white/10" />
                {bot.name}
              </div>
            </button>
          ))}
          {bots.length === 0 && <div className="text-slate-500 text-sm p-4 uppercase font-bold tracking-widest">Nessun bot presente in questa draft</div>}
        </div>
        
        {/* Card Grid by CMC */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-4 sm:p-8 bg-slate-950">
          {selectedBot && (() => {
            const getColorGroup = (card: Card) => {
               const colors = card.card_colors || (card.color ? [card.color] : []);
               if (colors.length > 1) return 'M';
               if (colors.length === 1) return colors[0];
               return 'C';
            };
            const colorOrder: Record<string, number> = { 'W': 1, 'U': 2, 'B': 3, 'R': 4, 'G': 5, 'M': 6, 'C': 7 };

            const columns: Record<number, Card[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
            
            selectedBot.pool.forEach(card => {
               let cmc = Math.floor(card.cmc || 0);
               if (cmc > 6) cmc = 6;
               // Raggruppa i drop a 0 o le terre fisse (anche se di base le basic lands non si draftano) con i drop a 1,
               // oppure li teniamo a 0 se esistono.
               columns[cmc].push(card);
            });

            return (
              <div className="flex gap-4 sm:gap-6 min-w-max pb-20 items-start">
                {[0, 1, 2, 3, 4, 5, 6].map(cmc => {
                  const colCards = columns[cmc];
                  if (colCards.length === 0) return null;

                  colCards.sort((a, b) => {
                     const groupA = colorOrder[getColorGroup(a)] || 8;
                     const groupB = colorOrder[getColorGroup(b)] || 8;
                     return groupA - groupB;
                  });

                  return (
                    <div key={cmc} className="flex flex-col gap-3 sm:gap-4 w-32 sm:w-44 shrink-0">
                      <div className="flex items-center justify-between px-2 bg-slate-900/50 rounded-lg py-1 border border-white/5">
                         <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">
                           Costo {cmc === 6 ? '6+' : cmc}
                         </span>
                         <span className="text-indigo-400 font-black text-xs">
                           {colCards.length}
                         </span>
                      </div>
                      <div className="flex flex-col gap-2 sm:gap-3">
                        {colCards.map((card, i) => {
                          const url = card.image_uris?.normal || (card as any).image_url;
                          return (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.03 }}
                              key={`card-${card.id || 'botcard'}-${cmc}-${i}`}
                              className="relative group hover:z-20 transition-all cursor-pointer"
                            >
                              <img 
                                src={url} 
                                alt={card.name} 
                                className="w-full rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.5)] border border-white/5 group-hover:scale-110 group-hover:-translate-y-2 transition-transform duration-200 group-hover:shadow-[0_10px_30px_rgba(99,102,241,0.5)]"
                              />
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>
    </motion.div>
  );
};
