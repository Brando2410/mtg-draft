import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ChevronLeft, Shield } from 'lucide-react';
import type { Room } from '@shared/types';
import { PageLayout } from '../../components/shared/PageLayout';

interface TournamentBracketProps {
  room: Room;
  playerId: string;
  onSpectate?: (matchIndex: number) => void;
  onJoinMatch?: (matchIndex: number) => void;
  onEditDeck: () => void;
  onBack: () => void;
}

interface MatchNodeProps {
  match: any;
  players: any[];
  isMyMatch: boolean;
  canJoin: boolean;
  onJoin: () => void;
  onSpectate: () => void;
  label?: string;
  type?: 'winner' | 'loser' | 'final';
}

interface TypeStyle {
  winner: string;
  loser: string;
  final: string;
}

const MatchBox: React.FC<MatchNodeProps> = ({ match, players, isMyMatch, canJoin, onJoin, onSpectate, label, type = 'winner' }) => {
  const p1Id = match?.players?.[0];
  const p2Id = match?.players?.[1];
  const p1 = players.find(p => p.playerId === p1Id);
  const p2 = players.find(p => p.playerId === p2Id);
  const score1 = match?.wins?.[p1Id] ?? 0;
  const score2 = match?.wins?.[p2Id] ?? 0;

  const isCompleted = match?.status === 'completed';
  const winnerId = isCompleted ? (score1 > score2 ? p1Id : p2Id) : null;

  const typeStyles: TypeStyle = {
    winner: 'border-green-500/30 text-green-400 bg-green-500',
    loser: 'border-orange-500/30 text-orange-400 bg-orange-500',
    final: 'border-amber-500/30 text-amber-400 bg-amber-500'
  };

  const isFinal = type === 'final';

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full h-full relative">
      {label && (
        <div className={`absolute left-0 flex items-center gap-1.5 ${isFinal ? '-top-[2.5rem]' : '-top-[1.5rem]'}`}>
           <div className={`rounded-full ${typeStyles[type as keyof TypeStyle].split(' ')[2]} ${isFinal ? 'w-1.5 h-6' : 'w-1 h-3'}`} />
           <span className={`font-black text-slate-500 uppercase tracking-widest ${isFinal ? 'text-sm' : 'text-[10px]'}`}>{label}</span>
        </div>
      )}

      {isFinal && (
        <>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="absolute -inset-24 border border-amber-500/10 rounded-full border-dashed pointer-events-none" />
          <div className="absolute -inset-8 bg-amber-500/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
             <motion.div 
               animate={{ 
                 y: [0, -15, 0],
                 filter: ["drop-shadow(0 0 10px rgba(245,158,11,0.3))", "drop-shadow(0 0 30px rgba(245,158,11,0.8))", "drop-shadow(0 0 10px rgba(245,158,11,0.3))"]
               }} 
               transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
             >
                <Trophy className="w-16 h-16 text-amber-500" />
             </motion.div>
          </div>
        </>
      )}

      <div className={`relative h-full w-full overflow-hidden transition-all duration-300 bg-slate-950/95 backdrop-blur-3xl
        ${isFinal ? 'rounded-[32px] border-4 border-amber-500/70 shadow-[0_0_80px_rgba(245,158,11,0.3)]' : 'rounded-xl border-2 border-white/5 hover:border-white/10'}
        ${isMyMatch && !isFinal ? 'border-orange-500 shadow-[0_0_40px_rgba(249,115,22,0.3)]' : ''}
      `}>
        <div className="flex flex-col h-full divide-y divide-white/5">
          {[p1, p2].map((p, i) => {
            const isWinner = (i === 0 ? winnerId === p1Id : winnerId === p2Id);
            const score = (i === 0 ? score1 : score2);
            return (
              <div key={i} className={`flex items-center w-full h-1/2 ${isFinal ? 'px-8' : 'px-3'}`}>
                <div className="flex-1 flex items-center gap-4 min-w-0">
                  <div className={`rounded bg-slate-800 border ${isWinner ? typeStyles[type as keyof TypeStyle].split(' ')[0] : 'border-white/5'} overflow-hidden shrink-0 ${isFinal ? 'w-20 h-20 border-2' : 'w-7 h-7'}`}>
                    {p ? <img src={`/avatars/${p.avatar || 'ajani.png'}`} className="w-full h-full object-cover" alt={p.name} /> : <Shield className="w-full h-full p-2 text-slate-700" />}
                  </div>
                  <span className={`font-black uppercase truncate ${isWinner ? typeStyles[type as keyof TypeStyle].split(' ')[1] : 'text-slate-400'} ${isFinal ? 'text-2xl' : 'text-[10px]'}`}>
                    {p?.name || 'TBD'}
                  </span>
                </div>
                <div className={`flex items-center justify-center font-black border-l border-white/5 ${isWinner ? typeStyles[type as keyof TypeStyle].split(' ')[2] + ' text-black' : 'bg-slate-900/30 text-slate-600'} ${isFinal ? 'w-32 text-5xl h-full' : 'w-9 text-xs h-full'}`}>
                  {p ? score : '--'}
                </div>
              </div>
            );
          })}
        </div>

        <AnimatePresence>
          {!isCompleted && match && (
            <motion.div initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 z-20 p-4 text-center">
              {isMyMatch ? (
                canJoin ? (
                  <button onClick={onJoin} className={`font-black uppercase tracking-widest transition-all ${isFinal ? 'px-12 py-4 rounded-2xl text-lg' : 'px-4 py-1.5 rounded-lg text-[9px]'} bg-white text-black hover:scale-105 shadow-2xl`}>
                    ENTER MATCH
                  </button>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                     <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded text-[8px] font-black text-amber-500 uppercase tracking-widest">Awaiting Phase Conclusion</div>
                     <span className="text-[10px] font-bold text-slate-500 uppercase italic">Locked</span>
                  </div>
                )
              ) : (
                <button onClick={onSpectate} className={`font-black uppercase tracking-widest transition-all ${isFinal ? 'px-12 py-4 rounded-2xl text-lg' : 'px-4 py-1.5 rounded-lg text-[9px]'} bg-slate-800 text-white hover:bg-slate-700`}>
                  WATCH
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export const TournamentBracket: React.FC<TournamentBracketProps> = ({ room, playerId, onSpectate, onJoinMatch, onEditDeck, onBack }) => {
  const matches = room.matches || [];
  const players = room.players;
  const isCompleted = (idx: number) => matches[idx]?.status === 'completed';

  // THE GRID (Using 0-100 logic synchronized with CSS %)
  const COL_W = 18;
  const COL_H = 10;
  const FINAL_W = 34;
  const FINAL_H = 24;

  const C1_X = 0;
  const C2_X = 28;
  const C3_X = 56;

  const ROW_Y = [5, 22, 39, 56]; 
  const SEMI_Y = [13.5, 47.5];   
  const LOSER_Y = [70, 85];      
  const FINAL_Y = 22;          
  const PLACE_Y = [62, 75, 88];  

  // HELPERS (0-100 system)
  const rX = (x: number, w: number = COL_W) => x + w;
  const cY = (y: number, h: number = COL_H) => y + (h / 2);

  // PHASE LOGIC
  const phase1Finished = [0, 1, 2, 3].every(idx => matches[idx]?.status === 'completed');
  const phase2Finished = phase1Finished && [4, 5, 6, 7].every(idx => matches[idx]?.status === 'completed');

  const getCanJoin = (matchIndex: number) => {
    if (matchIndex <= 3) return true; // Quarters always joinable
    if (matchIndex <= 7) return phase1Finished; // Semis/Consolation need Quarters done
    return phase2Finished; // Finals need Semis done
  };

  const getPhaseLabel = () => {
    if (phase2Finished) return "Phase 03: Final";
    if (phase1Finished) return "Phase 02: Semifinals";
    return "Phase 01: Qualifiers";
  };

  return (
    <PageLayout variant="slate">
      <header className="relative z-50 px-10 py-6 bg-slate-950/50 backdrop-blur-xl border-b border-white/10 flex items-center justify-between shrink-0 overflow-hidden">
        {/* Animated Background Flare */}
        <div className="absolute top-0 left-1/4 w-96 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent shadow-[0_0_20px_rgba(249,115,22,0.5)]" />
        
        <div className="flex items-center gap-8">
           <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-0.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,1)] animate-pulse" />
                 <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em]">Limited Event</span>
              </div>
              <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none select-none">
                Sealed <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/40">Tournament</span>
              </h1>
           </div>
        </div>

        {/* Central Progress Hub */}
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
           <div className="flex items-center gap-12">
               <div className="flex flex-col items-center">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</span>
                  <span className="text-sm font-black text-white uppercase tracking-tighter italic">{getPhaseLabel()}</span>
               </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="flex flex-col items-center">
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Completion</span>
                 <span className="text-sm font-black text-orange-400 uppercase tracking-tighter italic">
                   {Math.round((matches.filter(m => m.status === 'completed').length / (matches.length || 1)) * 100)}%
                 </span>
              </div>
           </div>
           <div className="w-64 h-1 bg-slate-900 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${(matches.filter(m => m.status === 'completed').length / (matches.length || 1)) * 100}%` }} 
                className="h-full bg-gradient-to-r from-orange-600 to-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.6)]" 
              />
           </div>
        </div>

        <div className="flex items-center gap-4">
           <motion.button 
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             onClick={onEditDeck} 
             className="flex items-center gap-2 px-6 py-2.5 bg-white/5 border border-white/10 hover:border-orange-500/50 rounded-2xl transition-all"
           >
             <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Edit Deck</span>
           </motion.button>

           <motion.button 
             whileHover={{ x: 4 }}
             onClick={onBack} 
             className="group flex items-center gap-3 px-6 py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 rounded-2xl shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] transition-all duration-500"
           >
             <span className="text-xs font-black text-white uppercase tracking-widest">Back</span>
             <ChevronLeft className="w-5 h-5 transition-transform group-hover:translate-x-1 rotate-180" />
           </motion.button>
        </div>
      </header>

      <div className="flex-1 relative bg-slate-950 select-none flex items-center justify-center p-8 overflow-hidden">
        {/* ASPECT RATIO LOCKER */}
        <div className="relative w-full h-full max-w-[1500px] aspect-video">
          
          {/* THE SVG (Crucial: preserveAspectRatio="none" to match CSS stretching) */}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
             <defs>
                <filter id="neon" x="-20%" y="-20%" width="140%" height="140%">
                   <feGaussianBlur stdDeviation="0.4" result="blur" />
                   <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
             </defs>

             {/* R1 -> R2 (Winners to Semis) */}
             {[0, 1, 2, 3].map(i => {
                const x1 = rX(C1_X);
                const y1 = cY(ROW_Y[i]);
                const y2 = cY(i < 2 ? SEMI_Y[0] : SEMI_Y[1]);
                const midX = x1 + (C2_X - x1) / 2;
                const done = isCompleted(i);
                return <path key={`w1-${i}`} d={`M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${C2_X} ${y2}`} stroke={done ? "#22c55e" : "rgba(255,255,255,0.08)"} strokeWidth={done ? "0.4" : "0.2"} fill="none" filter={done ? "url(#neon)" : ""} />;
             })}

             {/* R1 -> LOSER (Losers to Consolation) */}
             {[0, 1, 2, 3].map(i => {
                const x1 = rX(C1_X);
                const y1 = cY(ROW_Y[i]);
                const y2 = cY(i < 2 ? LOSER_Y[0] : LOSER_Y[1]);
                const midX = x1 + (C2_X - x1) * 0.2;
                return <path key={`l1-${i}`} d={`M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${C2_X} ${y2}`} stroke="rgba(249,115,22,0.2)" strokeWidth="0.2" fill="none" strokeDasharray="1 1" />;
             })}

             {/* SEMI -> FINAL (Winners to Final) */}
             {[4, 5].map(i => {
                const x1 = rX(C2_X);
                const y1 = cY(i === 4 ? SEMI_Y[0] : SEMI_Y[1]);
                const y2 = cY(FINAL_Y, FINAL_H);
                const midX = x1 + (C3_X - x1) / 2;
                const done = isCompleted(i);
                return <path key={`w2-${i}`} d={`M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${C3_X} ${y2}`} stroke={done ? "#fbbf24" : "rgba(255,255,255,0.1)"} strokeWidth={done ? "0.5" : "0.25"} fill="none" filter={done ? "url(#neon)" : ""} />;
             })}

             {/* SEMI -> 3RD PLACE (Losers from Semis) */}
             {[4, 5].map(i => {
                const x1 = rX(C2_X);
                const y1 = cY(i === 4 ? SEMI_Y[0] : SEMI_Y[1]);
                const y2 = cY(PLACE_Y[0]);
                const midX = x1 + (C3_X - x1) * 0.4;
                return <path key={`l3rd-${i}`} d={`M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${C3_X} ${y2}`} stroke="rgba(249,115,22,0.2)" strokeWidth="0.2" fill="none" strokeDasharray="1 1" />;
             })}

             {/* CONSOLATION -> 5TH PLACE (Winners from Consolation) */}
             {[6, 7].map(i => {
                const x1 = rX(C2_X);
                const y1 = cY(i === 6 ? LOSER_Y[0] : LOSER_Y[1]);
                const y2 = cY(PLACE_Y[1]);
                const midX = x1 + (C3_X - x1) * 0.6;
                const done = isCompleted(i);
                return <path key={`w5th-${i}`} d={`M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${C3_X} ${y2}`} stroke={done ? "#f97316" : "rgba(255,255,255,0.08)"} strokeWidth={done ? "0.4" : "0.2"} fill="none" filter={done ? "url(#neon)" : ""} />;
             })}

             {/* CONSOLATION -> 7TH PLACE (Losers from Consolation) */}
             {[6, 7].map(i => {
                const x1 = rX(C2_X);
                const y1 = cY(i === 6 ? LOSER_Y[0] : LOSER_Y[1]);
                const y2 = cY(PLACE_Y[2]);
                const midX = x1 + (C3_X - x1) * 0.2;
                return <path key={`l7th-${i}`} d={`M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${C3_X} ${y2}`} stroke="rgba(249,115,22,0.2)" strokeWidth="0.2" fill="none" strokeDasharray="1 1" />;
             })}
          </svg>

          {/* THE MATCHES (Using same 0-100 System) */}
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="absolute" style={{ left: `${C1_X}%`, top: `${ROW_Y[i]}%`, width: `${COL_W}%`, height: `${COL_H}%` }}>
              <MatchBox 
                match={matches[i]} 
                players={players} 
                isMyMatch={!!matches[i]?.players.includes(playerId)} 
                canJoin={getCanJoin(i)}
                onJoin={() => onJoinMatch?.(i)} 
                onSpectate={() => onSpectate?.(i)} 
                label="QUALIFIER" 
              />
            </div>
          ))}

          <div className="absolute" style={{ left: `${C2_X}%`, top: `${SEMI_Y[0]}%`, width: `${COL_W}%`, height: `${COL_H}%` }}>
            <MatchBox 
              match={matches[4]} 
              players={players} 
              isMyMatch={!!matches[4]?.players.includes(playerId)} 
              canJoin={getCanJoin(4)}
              onJoin={() => onJoinMatch?.(4)} 
              onSpectate={() => onSpectate?.(4)} 
              label="SEMI" 
            />
          </div>
          <div className="absolute" style={{ left: `${C2_X}%`, top: `${SEMI_Y[1]}%`, width: `${COL_W}%`, height: `${COL_H}%` }}>
            <MatchBox 
              match={matches[5]} 
              players={players} 
              isMyMatch={!!matches[5]?.players.includes(playerId)} 
              canJoin={getCanJoin(5)}
              onJoin={() => onJoinMatch?.(5)} 
              onSpectate={() => onSpectate?.(5)} 
              label="SEMI" 
            />
          </div>
          <div className="absolute" style={{ left: `${C2_X}%`, top: `${LOSER_Y[0]}%`, width: `${COL_W}%`, height: `${COL_H}%` }}>
            <MatchBox 
              match={matches[6]} 
              players={players} 
              isMyMatch={!!matches[6]?.players.includes(playerId)} 
              canJoin={getCanJoin(6)}
              onJoin={() => onJoinMatch?.(6)} 
              onSpectate={() => onSpectate?.(6)} 
              label="CONSOLATION" 
              type="loser" 
            />
          </div>
          <div className="absolute" style={{ left: `${C2_X}%`, top: `${LOSER_Y[1]}%`, width: `${COL_W}%`, height: `${COL_H}%` }}>
            <MatchBox 
              match={matches[7]} 
              players={players} 
              isMyMatch={!!matches[7]?.players.includes(playerId)} 
              canJoin={getCanJoin(7)}
              onJoin={() => onJoinMatch?.(7)} 
              onSpectate={() => onSpectate?.(7)} 
              label="CONSOLATION" 
              type="loser" 
            />
          </div>

          <div className="absolute" style={{ left: `${C3_X}%`, top: `${FINAL_Y}%`, width: `${FINAL_W}%`, height: `${FINAL_H}%` }}>
            <MatchBox 
              match={matches[8]} 
              players={players} 
              isMyMatch={!!matches[8]?.players.includes(playerId)} 
              canJoin={getCanJoin(8)}
              onJoin={() => onJoinMatch?.(8)} 
              onSpectate={() => onSpectate?.(8)} 
              label="FINAL" 
              type="final" 
            />
          </div>

          <div className="absolute" style={{ left: `${C3_X}%`, top: `${PLACE_Y[0]}%`, width: `${COL_W}%`, height: `${COL_H}%` }}>
            <MatchBox match={matches[9]} players={players} isMyMatch={!!matches[9]?.players.includes(playerId)} canJoin={getCanJoin(9)} onJoin={() => onJoinMatch?.(9)} onSpectate={() => onSpectate?.(9)} label="3RD" type="loser" />
          </div>
          <div className="absolute" style={{ left: `${C3_X}%`, top: `${PLACE_Y[1]}%`, width: `${COL_W}%`, height: `${COL_H}%` }}>
            <MatchBox match={matches[10]} players={players} isMyMatch={!!matches[10]?.players.includes(playerId)} canJoin={getCanJoin(10)} onJoin={() => onJoinMatch?.(10)} onSpectate={() => onSpectate?.(10)} label="5TH" type="loser" />
          </div>
          <div className="absolute" style={{ left: `${C3_X}%`, top: `${PLACE_Y[2]}%`, width: `${COL_W}%`, height: `${COL_H}%` }}>
            <MatchBox match={matches[11]} players={players} isMyMatch={!!matches[11]?.players.includes(playerId)} canJoin={getCanJoin(11)} onJoin={() => onJoinMatch?.(11)} onSpectate={() => onSpectate?.(11)} label="7TH" type="loser" />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};
