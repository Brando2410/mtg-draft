import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Play, Eye, ChevronLeft, Shield, Swords, Info } from 'lucide-react';
import type { Room } from '@shared/types';

interface TournamentBracketProps {
  room: Room;
  playerId: string;
  onSpectate: (matchIndex: number) => void;
  onJoinMatch: (matchIndex: number) => void;
  onBack: () => void;
}

interface MatchNodeProps {
  match: any;
  players: any[];
  isMyMatch: boolean;
  onJoin: () => void;
  onSpectate: () => void;
  playerId: string;
  side: 'left' | 'right' | 'center';
  label?: string;
}

const MatchBox: React.FC<MatchNodeProps> = ({ match, players, playerId, isMyMatch, onJoin, onSpectate, side, label }) => {
  const p1Id = match?.players?.[0];
  const p2Id = match?.players?.[1];
  const p1 = players.find(p => p.playerId === p1Id);
  const p2 = players.find(p => p.playerId === p2Id);
  const score1 = match?.wins?.[p1Id] ?? 0;
  const score2 = match?.wins?.[p2Id] ?? 0;

  const isCompleted = match?.status === 'completed';
  const winnerId = isCompleted ? (score1 > score2 ? p1Id : p2Id) : null;

  const renderPlayer = (player: any, score: number, isWinner: boolean, hasJoined: boolean) => (
    <div className={`flex items-center gap-3 w-full px-4 py-2 ${side === 'right' ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-1 flex items-center gap-3 ${side === 'right' ? 'flex-row-reverse text-right' : ''}`}>
        <div className={`relative w-8 h-8 rounded-md overflow-hidden bg-slate-800 border ${isWinner ? 'border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]' : 'border-white/10'}`}>
          {player ? (
            <img src={`/avatars/${player.avatar || 'ajani.png'}`} className="w-full h-full object-cover" alt={player.name} />
          ) : (
            <div className="w-full h-full bg-slate-900/50 flex items-center justify-center">
              <Shield className="w-4 h-4 text-slate-700" />
            </div>
          )}
          {hasJoined && !isCompleted && (
            <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 border border-black rounded-full shadow-[0_0_5px_rgba(34,197,94,0.8)]" />
          )}
        </div>
        <span className={`text-sm font-bold uppercase tracking-tight truncate ${isWinner ? 'text-orange-500' : 'text-slate-300'} ${!player && 'text-slate-600'}`}>
          {player?.name || 'TBD'}
        </span>
      </div>
      <div className={`w-10 h-8 flex items-center justify-center font-black text-lg border-l border-white/5 ${isWinner ? 'bg-orange-500 text-black' : 'bg-slate-900 text-slate-500'}`}>
        {player ? score : '--'}
      </div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative group w-64 ${label ? 'mt-8' : ''}`}
    >
      {label && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] whitespace-nowrap">
          {label}
        </div>
      )}
      
      <div className={`relative overflow-hidden rounded-lg border-2 transition-all duration-300 bg-slate-950/80 backdrop-blur-md
        ${isMyMatch ? 'border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.2)]' : 'border-white/10 hover:border-white/20'}
      `}>
        {/* Progress bar / Accent */}
        <div className={`absolute top-0 left-0 w-1 h-full ${isMyMatch ? 'bg-orange-500' : 'bg-slate-800'}`} />
        
        <div className="divide-y divide-white/5">
          {renderPlayer(p1, score1, winnerId === p1Id, match?.joinedPlayers?.includes(p1Id))}
          {renderPlayer(p2, score2, winnerId === p2Id, match?.joinedPlayers?.includes(p2Id))}
        </div>

        {/* Hover Actions */}
        <AnimatePresence>
          {!isCompleted && match && (
            <motion.div 
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              className="absolute inset-0 bg-orange-500/90 flex items-center justify-center gap-2 opacity-0 transition-opacity"
            >
              {isMyMatch ? (
                <button 
                  onClick={onJoin}
                  className="px-4 py-2 bg-black text-white rounded-md font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-transform flex items-center gap-2"
                >
                  <Play className="w-3 h-3 fill-current" /> 
                  {match.status === 'active' ? 'Enter Arena' : (
                    match.joinedPlayers?.includes(playerId) ? 'Waiting...' : 'Check In'
                  )}
                </button>
              ) : (
                match.status === 'active' ? (
                  <button 
                    onClick={onSpectate}
                    className="px-4 py-2 bg-black text-white rounded-md font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-transform flex items-center gap-2"
                  >
                    <Eye className="w-3 h-3" /> Spectate
                  </button>
                ) : (
                  <div className="text-[10px] font-black uppercase tracking-widest text-black/60 flex items-center gap-2">
                    <Swords className="w-3 h-3" /> Waiting to Start
                  </div>
                )
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export const TournamentBracket: React.FC<TournamentBracketProps> = ({ 
  room, 
  playerId, 
  onSpectate, 
  onJoinMatch,
  onBack 
}) => {
  const matches = room.matches || [];
  const players = room.players;

  const bracketData = useMemo(() => {
    const getMatch = (idx: number) => matches[idx] || null;

    return {
      quarters: [getMatch(0), getMatch(1), getMatch(2), getMatch(3)],
      semis: [getMatch(4), getMatch(5)],
      final: getMatch(8),
      // Consolation
      consSemis: [getMatch(6), getMatch(7)],
      thirdPlace: getMatch(9),
      fifthPlace: getMatch(10),
      seventhPlace: getMatch(11)
    };
  }, [matches]);

  const myMatchIndex = matches.findIndex(m => m.players.includes(playerId) && (m.status === 'active' || m.status === 'pending'));

  return (
    <div className="fixed inset-0 bg-[#05070a] text-white overflow-hidden font-sans select-none">
      {/* BACKGROUND DECORATION */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] opacity-20">
          <svg width="100%" height="100%" viewBox="0 0 1000 1000" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 500 L1000 500 M500 0 L500 1000" stroke="#f97316" strokeWidth="0.5" strokeDasharray="10 20" />
            <circle cx="500" cy="500" r="300" stroke="#f97316" strokeWidth="0.5" opacity="0.5" />
            <circle cx="500" cy="500" r="450" stroke="#f97316" strokeWidth="0.2" opacity="0.3" />
          </svg>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070a] via-transparent to-[#05070a]" />
      </div>

      {/* HEADER */}
      <div className="relative z-20 flex items-center justify-between px-12 py-8 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/5 group"
          >
            <ChevronLeft className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5 text-orange-500" />
              <h1 className="text-2xl font-black uppercase italic tracking-tighter">
                Tournament <span className="text-orange-500">Bracket</span>
              </h1>
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-1">Status: {room.status} • {room.rules.cubeName}</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4 bg-slate-900/50 px-6 py-3 rounded-2xl border border-white/5">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Players</span>
              <span className="text-sm font-black italic">{room.players.length} / {room.rules.playerCount}</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <Swords className="w-5 h-5 text-orange-500/50" />
          </div>
          
          {myMatchIndex !== -1 && (
            <button 
              onClick={() => onJoinMatch(myMatchIndex)}
              className="px-8 py-3 bg-orange-500 hover:bg-orange-400 text-black rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-3 shadow-[0_0_30px_rgba(249,115,22,0.3)] animate-pulse"
            >
              <Play className="w-4 h-4 fill-current" /> Enter Arena
            </button>
          )}
        </div>
      </div>

      {/* BRACKET VIEWPORT */}
      <div className="relative h-[calc(100vh-100px)] w-full overflow-auto p-20 flex flex-col items-center gap-32">
        
        {/* MAIN BRACKET */}
        <div className="relative flex flex-col items-center gap-12">
          <div className="text-xl font-black uppercase italic tracking-[0.4em] text-orange-500/50 mb-4 flex items-center gap-4">
            <div className="h-px w-12 bg-orange-500/20" />
            Main Bracket
            <div className="h-px w-12 bg-orange-500/20" />
          </div>

          <div className="relative flex items-center justify-center gap-12 min-w-[1200px]">
            {/* LEFT SIDE */}
            <div className="flex items-center gap-12">
              <div className="flex flex-col gap-16">
                <MatchBox 
                  match={bracketData.quarters[0]} 
                  players={players} 
                  playerId={playerId}
                  isMyMatch={!!bracketData.quarters[0]?.players.includes(playerId)} 
                  onJoin={() => onJoinMatch(0)}
                  onSpectate={() => onSpectate(0)}
                  side="left"
                  label="Quarter-Final 1"
                />
                <MatchBox 
                  match={bracketData.quarters[1]} 
                  players={players} 
                  playerId={playerId}
                  isMyMatch={!!bracketData.quarters[1]?.players.includes(playerId)} 
                  onJoin={() => onJoinMatch(1)}
                  onSpectate={() => onSpectate(1)}
                  side="left"
                  label="Quarter-Final 2"
                />
              </div>

              <div className="w-16 h-48 relative">
                <svg className="w-full h-full" viewBox="0 0 64 192">
                  <path d="M0 48 L32 48 L32 144 L0 144 M32 96 L64 96" stroke="#f97316" strokeWidth="2" fill="none" opacity="0.3" />
                </svg>
              </div>

              <MatchBox 
                match={bracketData.semis[0]} 
                players={players} 
                playerId={playerId}
                isMyMatch={!!bracketData.semis[0]?.players.includes(playerId)} 
                onJoin={() => onJoinMatch(4)}
                onSpectate={() => onSpectate(4)}
                side="left"
                label="Semi-Final 1"
              />
            </div>

            {/* CENTER */}
            <div className="flex flex-col items-center gap-12 px-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-orange-500 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative flex flex-col items-center text-center">
                   <div className="w-32 h-32 bg-slate-900 rounded-3xl border border-orange-500/50 rotate-45 flex items-center justify-center overflow-hidden mb-6 shadow-2xl">
                      <div className="-rotate-45">
                         <Trophy className="w-16 h-16 text-orange-500" />
                      </div>
                   </div>
                   <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white mb-2">Grand Final</h2>
                </div>
              </div>

              <MatchBox 
                match={bracketData.final} 
                players={players} 
                playerId={playerId}
                isMyMatch={!!bracketData.final?.players.includes(playerId)} 
                onJoin={() => onJoinMatch(8)}
                onSpectate={() => onSpectate(8)}
                side="center"
              />
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-12 flex-row-reverse">
              <div className="flex flex-col gap-16">
                <MatchBox 
                  match={bracketData.quarters[2]} 
                  players={players} 
                  playerId={playerId}
                  isMyMatch={!!bracketData.quarters[2]?.players.includes(playerId)} 
                  onJoin={() => onJoinMatch(2)}
                  onSpectate={() => onSpectate(2)}
                  side="right"
                  label="Quarter-Final 3"
                />
                <MatchBox 
                  match={bracketData.quarters[3]} 
                  players={players} 
                  playerId={playerId}
                  isMyMatch={!!bracketData.quarters[3]?.players.includes(playerId)} 
                  onJoin={() => onJoinMatch(3)}
                  onSpectate={() => onSpectate(3)}
                  side="right"
                  label="Quarter-Final 4"
                />
              </div>

              <div className="w-16 h-48 relative">
                <svg className="w-full h-full" viewBox="0 0 64 192">
                  <path d="M64 48 L32 48 L32 144 L64 144 M32 96 L0 96" stroke="#f97316" strokeWidth="2" fill="none" opacity="0.3" />
                </svg>
              </div>

              <MatchBox 
                match={bracketData.semis[1]} 
                players={players} 
                playerId={playerId}
                isMyMatch={!!bracketData.semis[1]?.players.includes(playerId)} 
                onJoin={() => onJoinMatch(5)}
                onSpectate={() => onSpectate(5)}
                side="right"
                label="Semi-Final 2"
              />
            </div>
          </div>
        </div>

        {/* CONSOLATION BRACKET */}
        {(room.rules.playerCount === 4 || room.rules.playerCount === 8) && (
          <div className="relative flex flex-col items-center gap-12 border-t border-white/5 pt-16 w-full max-w-7xl">
            <div className="text-xl font-black uppercase italic tracking-[0.4em] text-slate-500 mb-4 flex items-center gap-4">
              <div className="h-px w-12 bg-white/10" />
              Consolation Bracket
              <div className="h-px w-12 bg-white/10" />
            </div>

            <div className="flex items-start justify-center gap-24">
               {room.rules.playerCount === 8 ? (
                 <>
                    {/* ROUND 2: CONS SEMIS */}
                    <div className="flex flex-col items-center gap-6">
                       <div className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-2">Round 2</div>
                       <div className="flex flex-col gap-12">
                          <MatchBox 
                            match={bracketData.consSemis[0]} 
                            players={players} 
                            playerId={playerId}
                            isMyMatch={!!bracketData.consSemis[0]?.players.includes(playerId)} 
                            onJoin={() => onJoinMatch(6)}
                            onSpectate={() => onSpectate(6)}
                            side="left"
                            label="Consolation Semi 1"
                          />
                          <MatchBox 
                            match={bracketData.consSemis[1]} 
                            players={players} 
                            playerId={playerId}
                            isMyMatch={!!bracketData.consSemis[1]?.players.includes(playerId)} 
                            onJoin={() => onJoinMatch(7)}
                            onSpectate={() => onSpectate(7)}
                            side="left"
                            label="Consolation Semi 2"
                          />
                       </div>
                    </div>

                    {/* CONNECTOR ARROWS? (Skip for now to keep it clean) */}

                    {/* ROUND 3: PLACEMENT FINALS */}
                    <div className="flex flex-col items-center gap-6">
                       <div className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-2">Round 3 (Placement)</div>
                       <div className="flex flex-col gap-12">
                          {/* 3rd Place - Special prominently placed */}
                          <div className="relative group">
                             <div className="absolute -inset-1 bg-slate-500/10 blur rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                             <MatchBox 
                               match={bracketData.thirdPlace} 
                               players={players} 
                               playerId={playerId}
                               isMyMatch={!!bracketData.thirdPlace?.players.includes(playerId)} 
                               onJoin={() => onJoinMatch(9)}
                               onSpectate={() => onSpectate(9)}
                               side="center"
                               label="3rd Place Match"
                             />
                          </div>
                          
                          <MatchBox 
                            match={bracketData.fifthPlace} 
                            players={players} 
                            playerId={playerId}
                            isMyMatch={!!bracketData.fifthPlace?.players.includes(playerId)} 
                            onJoin={() => onJoinMatch(10)}
                            onSpectate={() => onSpectate(10)}
                            side="center"
                            label="5th Place Match"
                          />
                          
                          <MatchBox 
                            match={bracketData.seventhPlace} 
                            players={players} 
                            playerId={playerId}
                            isMyMatch={!!bracketData.seventhPlace?.players.includes(playerId)} 
                            onJoin={() => onJoinMatch(11)}
                            onSpectate={() => onSpectate(11)}
                            side="center"
                            label="7th Place Match"
                          />
                       </div>
                    </div>
                 </>
               ) : (
                 <div className="flex flex-col items-center gap-6">
                    <div className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-2">Bronze Match</div>
                    <MatchBox 
                      match={bracketData.thirdPlace} // Index 3 for 4-player
                      players={players} 
                      playerId={playerId}
                      isMyMatch={!!room.matches?.[3]?.players.includes(playerId)} 
                      onJoin={() => onJoinMatch(3)}
                      onSpectate={() => onSpectate(3)}
                      side="center"
                      label="3rd Place Match"
                    />
                 </div>
               )}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="absolute bottom-0 left-0 w-full px-12 py-6 bg-slate-950/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-between">
         <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Updates Enabled</span>
            </div>
            <div className="flex items-center gap-3">
               <Info className="w-4 h-4 text-slate-500" />
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Matches are Best of 3</span>
            </div>
         </div>

         <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
            © 2026 MTG Draft Engine - Tournament Edition
         </div>
      </div>

    </div>
  );
};
