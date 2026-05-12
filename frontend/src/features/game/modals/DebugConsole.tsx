import { 
  Terminal, Play, ChevronLeft, Layers, Users, 
  Heart, Plus, Minus, MousePointer2, Save, History, Zap, Search,
  Activity, Cpu, Database
} from 'lucide-react';
import { type GameState } from '@shared/types';
import { socket } from '../../../services/socket';
import { useEffect, useRef, useState } from 'react';

interface DebugConsoleProps {
  gameState: GameState;
  playerId: string;
  effectivePlayerId: string;
  opponentId: string | undefined;
  roomId: string;
  onClose: () => void;
  onSwapControl: (newId: string) => void;
  room?: any;
}

export const DebugConsole = ({ 
  gameState, 
  playerId, 
  effectivePlayerId, 
  opponentId, 
  roomId, 
  onClose,
  onSwapControl,
  room
}: DebugConsoleProps) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [cardSearch, setCardSearch] = useState('');

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [gameState.logs]);

  const pState = gameState.players[effectivePlayerId];

  return (
    <div className="w-[420px] border-r border-white/10 bg-[#07090f]/98 backdrop-blur-2xl flex flex-col z-30 shadow-[30px_0_60px_rgba(0,0,0,0.7)] h-full overflow-hidden pointer-events-auto">
       
       {/* COMPACT DASHBOARD HEADER */}
       <div className="flex items-center justify-between px-6 py-4 bg-white/[0.02] border-b border-white/5">
          <div className="flex items-center gap-2.5">
             <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                <Cpu className="w-4 h-4 text-indigo-400" />
             </div>
             <div>
                <h3 className="text-sm font-black uppercase italic tracking-wider text-white flex items-center gap-2">
                   System <span className="text-indigo-400">Debugger</span>
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{roomId.split('-')[0]} // LIVE</span>
                </div>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all text-slate-400 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
       </div>

       <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-6">
            
            {/* 1. STATE MANAGEMENT (CHECKPOINTS) */}
            <div className="space-y-3">
               <div className="flex items-center gap-2 mb-1">
                  <Database className="w-3 h-3 text-slate-500" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">State Persistence</span>
               </div>
               <div className="grid grid-cols-2 gap-2">
                  <button 
                      onClick={() => socket.emit('save_checkpoint', { roomId })}
                      className="flex items-center justify-center gap-2 py-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-[10px] font-black uppercase text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all active:scale-[0.97]"
                  >
                      <Save className="w-3.5 h-3.5" /> Save
                  </button>
                  <button 
                      onClick={() => socket.emit('load_checkpoint', { roomId })}
                      disabled={!room?.checkpoint}
                      className={`flex items-center justify-center gap-2 py-2.5 border rounded-lg text-[10px] font-black uppercase transition-all active:scale-[0.97]
                        ${room?.checkpoint 
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-white' 
                            : 'bg-slate-900 border-white/5 text-slate-700 opacity-50 cursor-not-allowed'}`}
                  >
                      <History className="w-3.5 h-3.5" /> Restore
                  </button>
               </div>
            </div>

            {/* 2. LIVE TELEMETRY (STATUS) */}
            <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-900/50 border border-white/5 rounded-xl p-3 flex flex-col gap-1">
                    <span className="text-[7px] font-bold text-slate-500 uppercase tracking-tighter">Priority</span>
                    <span className="text-[9px] font-black uppercase italic text-indigo-300">
                        {gameState.priorityPlayerId === effectivePlayerId ? 'Yours' : 'Opponent'}
                    </span>
                </div>
                <div className="bg-slate-900/50 border border-white/5 rounded-xl p-3 flex flex-col gap-1">
                    <span className="text-[7px] font-bold text-slate-500 uppercase tracking-tighter">Active Step</span>
                    <span className="text-[9px] font-black uppercase italic text-cyan-400 text-ellipsis overflow-hidden whitespace-nowrap">
                        {gameState.currentStep}
                    </span>
                </div>
                <div className="bg-slate-900/50 border border-white/5 rounded-xl p-3 flex flex-col gap-1">
                    <span className="text-[7px] font-bold text-slate-500 uppercase tracking-tighter">Control</span>
                    <span className={`text-[9px] font-black uppercase italic ${gameState.activePlayerId === effectivePlayerId ? 'text-emerald-400' : 'text-orange-400'}`}>
                        {gameState.activePlayerId === effectivePlayerId ? 'PLAYER' : 'OPPONENT'}
                    </span>
                </div>
            </div>

            {/* 3. CARD LAB (SEARCH & TUTOR) */}
            <div className="space-y-3">
               <div className="flex justify-between items-center px-1">
                  <div className="flex items-center gap-2">
                      <Search className="w-3 h-3 text-slate-500" />
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Card Lab</span>
                  </div>
                  <span className="text-[8px] font-black text-indigo-400 bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10">
                     {pState?.library.length || 0} LIBRARY
                  </span>
               </div>
               
               <div className="relative">
                  <input 
                     type="text" 
                     value={cardSearch}
                     onChange={(e) => setCardSearch(e.target.value)}
                     placeholder="Search library to tutor card..."
                     className="w-full bg-slate-900/80 border border-white/10 rounded-xl py-3 pl-4 pr-3 text-[11px] text-white focus:outline-none focus:border-indigo-500/50 transition-colors shadow-inner"
                  />
                  
                  {cardSearch.length >= 2 && (
                     <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl max-h-[220px] overflow-y-auto custom-scrollbar">
                        {pState?.library
                           .filter(c => c.definition.name.toLowerCase().includes(cardSearch.toLowerCase()))
                           .map((card, idx) => (
                              <button
                                 key={`${card.id}-${idx}`}
                                 onClick={() => {
                                    socket.emit('debug_move_card_from_library', { roomId, playerId: effectivePlayerId, cardId: card.id });
                                    setCardSearch('');
                                 }}
                                 className="w-full text-left p-3 hover:bg-indigo-600/20 border-b border-white/5 last:border-0 flex items-center justify-between group transition-colors"
                              >
                                 <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-200 uppercase group-hover:text-white">{card.definition.name}</span>
                                    <span className="text-[7px] font-bold text-slate-600 uppercase italic">Tutor to hand</span>
                                 </div>
                                 <Plus className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400" />
                              </button>
                           ))
                        }
                     </div>
                  )}
               </div>
            </div>

            {/* 4. PLAYER MANIPULATION (LIFE & STATS) */}
            <div className="bg-slate-950/50 border border-white/5 rounded-2xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Heart className="w-3 h-3 text-rose-500" />
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Vital Signs</span>
                    </div>
                    <span className="text-[11px] font-black text-rose-500 tabular-nums">{pState?.life ?? 20} <span className="text-[8px] text-slate-600">HP</span></span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                    <button 
                        onClick={() => socket.emit('debug_add_life', { roomId, playerId: effectivePlayerId, amount: 5 })}
                        className="flex items-center justify-center gap-2 py-2 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[9px] font-black uppercase text-emerald-400 transition-all active:scale-95"
                    >
                        <Plus className="w-3 h-3" /> 5 Life
                    </button>
                    <button 
                        onClick={() => socket.emit('debug_add_life', { roomId, playerId: effectivePlayerId, amount: -5 })}
                        className="flex items-center justify-center gap-2 py-2 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 rounded-lg text-[9px] font-black uppercase text-rose-400 transition-all active:scale-95"
                    >
                        <Minus className="w-3 h-3" /> 5 Life
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
                    <button 
                        onClick={() => socket.emit('debug_draw_card', { roomId, playerId: effectivePlayerId })}
                        className="flex flex-col items-center gap-1.5 p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all group"
                        title="Draw Card"
                    >
                        <Plus className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                        <span className="text-[7px] font-black uppercase text-slate-600 group-hover:text-emerald-400">Draw</span>
                    </button>
                    <button 
                        onClick={() => socket.emit('toggle_mana_cheat', { roomId, playerId: effectivePlayerId })}
                        className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all group ${pState?.manaCheat ? 'bg-emerald-500/20 border border-emerald-500/50' : 'bg-white/5 hover:bg-white/10'}`}
                        title="Infinite Mana"
                    >
                        <Zap className={`w-4 h-4 ${pState?.manaCheat ? 'text-emerald-400 animate-pulse' : 'text-slate-500 group-hover:text-amber-400'}`} />
                        <span className={`text-[7px] font-black uppercase ${pState?.manaCheat ? 'text-emerald-400' : 'text-slate-600'}`}>Mana</span>
                    </button>
                    <button 
                        onClick={() => socket.emit('toggle_full_control', { roomId, playerId: effectivePlayerId })}
                        className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all group ${pState?.fullControl ? 'bg-amber-500/20 border border-amber-500/50' : 'bg-white/5 hover:bg-white/10'}`}
                        title="Full Control"
                    >
                        <MousePointer2 className={`w-4 h-4 ${pState?.fullControl ? 'text-amber-400 shadow-glow' : 'text-slate-500 group-hover:text-indigo-400'}`} />
                        <span className={`text-[7px] font-black uppercase ${pState?.fullControl ? 'text-amber-400' : 'text-slate-600'}`}>Control</span>
                    </button>
                </div>
            </div>

            {/* 5. ENGINE UTILITIES */}
            <div className="grid grid-cols-2 gap-2">
                <button 
                    onClick={() => socket.emit('pass_priority', { roomId, playerId: effectivePlayerId })}
                    className="flex flex-col items-start gap-1 p-3 bg-slate-900 border border-white/5 rounded-xl hover:bg-indigo-600/20 transition-all group active:scale-95"
                >
                    <Play className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400" />
                    <span className="text-[8px] font-black uppercase tracking-wider text-slate-500 group-hover:text-white">Pass Priority</span>
                </button>
                <button 
                    onClick={() => opponentId && onSwapControl(effectivePlayerId === playerId ? opponentId : playerId)}
                    className="flex flex-col items-start gap-1 p-3 bg-slate-900 border border-white/5 rounded-xl hover:bg-orange-600/20 transition-all group active:scale-95"
                >
                    <Users className="w-3.5 h-3.5 text-slate-500 group-hover:text-orange-400" />
                    <span className="text-[8px] font-black uppercase tracking-wider text-slate-500 group-hover:text-white">Swap View</span>
                </button>
            </div>

            {/* 6. LOGS & REGISTRY (Scrollable Bottom Sections) */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity className="w-3 h-3 text-emerald-500" />
                        <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Combat Registry</span>
                    </div>
                </div>

                <div className="max-h-[220px] overflow-hidden flex flex-col border border-white/5 rounded-2xl bg-slate-950/80 backdrop-blur-md">
                    <div className="p-3 bg-white/[0.02] border-b border-white/5 flex items-center gap-2">
                        <Layers className="w-3 h-3 text-indigo-400" />
                        <span className="text-[8px] font-black uppercase text-slate-500 italic">Continuous Effects Registry</span>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                        {gameState.ruleRegistry.continuousEffects.length === 0 ? (
                            <div className="py-8 text-center bg-slate-900/40 m-2 rounded-xl border border-dashed border-white/5">
                                <span className="text-[9px] font-bold text-slate-700 uppercase tracking-widest italic">Stable - No Active Effects</span>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {gameState.ruleRegistry.continuousEffects.map((effect, idx) => {
                                    const allObjects = [
                                        ...gameState.battlefield,
                                        ...gameState.exile,
                                        ...Object.values(gameState.players).flatMap(p => [...p.graveyard, ...p.hand])
                                    ];
                                    const source = allObjects.find(o => o.id === effect.sourceId);
                                    const sourceName = source?.definition.name || 'Floating Effect';

                                    return (
                                        <div key={effect.id || idx} className="p-3 hover:bg-white/[0.03] transition-colors group">
                                            <div className="flex justify-between items-start mb-1.5">
                                                <span className="text-[9px] font-black text-indigo-300 uppercase italic truncate max-w-[160px]">
                                                    {sourceName}
                                                </span>
                                                <span className="text-[7px] font-black text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded border border-white/5 uppercase">
                                                    Lay. {effect.layer}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {effect.powerModifier !== undefined && (
                                                    <span className="text-[8px] font-black text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/10">
                                                        {Number(effect.powerModifier) > 0 ? '+' : ''}{effect.powerModifier}/{effect.toughnessModifier ?? 0}
                                                    </span>
                                                )}
                                                {effect.abilitiesToAdd?.map((ability, aIdx) => {
                                                    const abilityName = typeof ability === 'string' ? ability : (ability.name || (ability as any).type || 'Ability');
                                                    return (
                                                        <span key={`${abilityName}-${aIdx}`} className="text-[8px] font-black text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/10 uppercase">
                                                            {abilityName}
                                                        </span>
                                                    );
                                                })}
                                                <span className="text-[7px] font-bold text-slate-600 uppercase ml-auto">
                                                    {effect.duration.type.replace('Until', '')}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 7. TERMINAL OUTPUT */}
            <div className="flex flex-col rounded-2xl border border-white/10 bg-slate-950 overflow-hidden shadow-2xl">
                <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Terminal className="w-3 h-3 text-emerald-500" />
                        <span className="text-[8px] font-black uppercase text-emerald-500/70 tracking-widest">Engine Stream</span>
                    </div>
                    <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50" />
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                    </div>
                </div>
                <div 
                    ref={terminalRef}
                    className="p-4 text-[10px] font-mono text-slate-400 leading-relaxed font-semibold h-[180px] overflow-y-auto custom-scrollbar bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.03),transparent)]"
                >
                    {(gameState.logs || []).length === 0 && <span className="text-slate-700 italic block">{`// Awaiting engine initialization...`}</span>}
                    {(gameState.logs || []).map((logLine, index) => (
                    <div key={index} className="flex gap-2 group mb-1 last:mb-0">
                        <span className="text-emerald-500/30 font-bold shrink-0">{(index + 1).toString().padStart(3, '0')}</span>
                        <span className="text-slate-300 group-hover:text-white transition-colors break-words">{logLine}</span>
                    </div>
                    ))}
                </div>
            </div>

          </div>
       </div>
    </div>
  );
};
