import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Play, Eye, Map, Layers } from 'lucide-react';
import type { Room } from '@shared/types';

interface TournamentBracketProps {
  room: Room;
  playerId: string;
  onSpectate: (matchIndex: number) => void;
  onJoinMatch: (matchIndex: number) => void;
  onBack: () => void;
}

export const TournamentBracket: React.FC<TournamentBracketProps> = ({ 
  room, 
  playerId, 
  onSpectate, 
  onJoinMatch,
  onBack 
}) => {
  const matches = room.matches || [];
  
  // Find if player is in any active match
  const myMatchIndex = matches.findIndex(m => m.players.includes(playerId) && m.status === 'active');

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 lg:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500/20 rounded-2xl">
                <Trophy className="w-8 h-8 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-black uppercase italic tracking-tighter">
                  Tournament <span className="text-indigo-500">Bracket</span>
                </h1>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">MTG Draft Engine - Status: {room.status}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="px-8 py-4 bg-slate-900 hover:bg-slate-800 border border-white/5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all"
            >
              Back to Menu
            </button>
            {myMatchIndex !== -1 && (
              <button 
                onClick={() => onJoinMatch(myMatchIndex)}
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/20 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" /> Return to My Match
              </button>
            )}
          </div>
        </div>

        {/* BRACKET LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* ACTIVE MATCHES */}
          <div className="space-y-6">
            <h2 className="flex items-center gap-3 text-xl font-black uppercase italic tracking-tight text-white/50">
              <Play className="w-5 h-5" /> Current Round
            </h2>
            
            <div className="space-y-4">
              {matches.length === 0 ? (
                <div className="p-12 bg-white/5 border border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center text-center gap-4">
                   <Users className="w-12 h-12 text-slate-700" />
                   <p className="text-slate-500 font-black uppercase tracking-widest text-sm">No matches started yet</p>
                </div>
              ) : (
                matches.map((match, idx) => {
                  const p1 = room.players.find(p => p.playerId === match.players[0]);
                  const p2 = room.players.find(p => p.playerId === match.players[1]);
                  const isMyMatch = match.players.includes(playerId);
                  const isP1 = p1?.playerId === playerId;
                  
                  return (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`relative group bg-[#0a0f1e] border-2 rounded-[2rem] p-8 overflow-hidden transition-all
                        ${isMyMatch ? 'border-indigo-500 shadow-2xl shadow-indigo-950/50' : 'border-white/5 hover:border-white/10'}
                      `}
                    >
                      {/* Decorative elements */}
                      <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Map className="w-24 h-24" />
                      </div>
                      
                      <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
                        {/* Player 1 */}
                        <div className={`flex flex-col items-center gap-3 flex-1 ${isP1 ? 'text-indigo-400' : 'text-white'}`}>
                           <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-white/10 overflow-hidden">
                              <img src={`/avatars/${(p1 as any)?.avatar || 'ajani.png'}`} className="w-full h-full object-cover" />
                           </div>
                           <span className="font-black uppercase italic tracking-tight text-lg">{p1?.name || 'Player 1'}</span>
                           <div className="flex gap-1">
                              {[...Array(match.wins[p1?.playerId || ''] || 0)].map((_, i) => (
                                <div key={i} className="w-4 h-1 bg-emerald-500 rounded-full" />
                              ))}
                           </div>
                        </div>

                        {/* VS Divider */}
                        <div className="flex flex-col items-center gap-2">
                          <div className="px-5 py-2 bg-slate-900 border border-white/10 rounded-full font-black text-xs text-slate-500 italic uppercase">
                            VS
                          </div>
                          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Best of 3</p>
                        </div>

                        {/* Player 2 */}
                        <div className={`flex flex-col items-center gap-3 flex-1 ${!isP1 && isMyMatch ? 'text-indigo-400' : 'text-white'}`}>
                           <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-white/10 overflow-hidden">
                              <img src={`/avatars/${(p2 as any)?.avatar || 'ajani.png'}`} className="w-full h-full object-cover" />
                           </div>
                           <span className="font-black uppercase italic tracking-tight text-lg">{p2?.name || 'Player 2'}</span>
                           <div className="flex gap-1">
                              {[...Array(match.wins[p2?.playerId || ''] || 0)].map((_, i) => (
                                <div key={i} className="w-4 h-1 bg-emerald-500 rounded-full" />
                              ))}
                           </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-8 flex gap-3">
                         {isMyMatch ? (
                           <button 
                             onClick={() => onJoinMatch(idx)}
                             className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-xs tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                           >
                             <Play className="w-4 h-4 fill-current" /> Play Match
                           </button>
                         ) : (
                           <button 
                             onClick={() => onSpectate(idx)}
                             className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-slate-300 font-black uppercase text-xs tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 border border-white/5"
                           >
                             <Eye className="w-4 h-4" /> Spectate
                           </button>
                         )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* STANDINGS / STATS */}
          <div className="space-y-6">
            <h2 className="flex items-center gap-3 text-xl font-black uppercase italic tracking-tight text-white/50">
              <Layers className="w-5 h-5" /> Standings
            </h2>
            
            <div className="bg-[#0a0f1e] border border-white/5 rounded-[2.5rem] overflow-hidden">
               <table className="w-full text-left">
                  <thead className="bg-white/5 border-b border-white/5">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Player</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">W-L</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Games</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {room.players.map((p, idx) => {
                      const wins = matches.filter(m => m.status === 'completed' && m.wins[p.playerId] > 1).length;
                      const gameWins = matches.reduce((sum, m) => sum + (m.wins[p.playerId] || 0), 0);
                      
                      return (
                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                          <td className="px-8 py-5 flex items-center gap-4">
                            <span className="text-slate-600 font-black text-sm italic">#{idx + 1}</span>
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800">
                               <img src={`/avatars/${(p as any)?.avatar || 'ajani.png'}`} className="w-full h-full object-cover" />
                            </div>
                            <span className="font-black uppercase tracking-tight">{p.name} {p.playerId === playerId && "(You)"}</span>
                          </td>
                          <td className="px-8 py-5 font-black italic text-indigo-400">{wins} - 0</td>
                          <td className="px-8 py-5 font-bold text-slate-400 text-sm">{gameWins} Wins</td>
                        </tr>
                      );
                    })}
                  </tbody>
               </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
