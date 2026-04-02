import { 
  Terminal, Play, ChevronRight, Layers, Users, RotateCcw, 
  Heart, Plus, Minus, MousePointer2, Save, History, Zap, Search 
} from 'lucide-react';
import { type GameState } from '@shared/types';
import { socket } from '../../services/socket';
import { useEffect, useRef, useState } from 'react';

interface DebugConsoleProps {
  gameState: GameState;
  playerId: string;
  effectivePlayerId: string;
  opponentId: string | undefined;
  roomId: string;
  onClose: () => void;
  onSwapControl: (newId: string) => void;
  room?: any; // To check for checkpoints
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
    <div className="w-[400px] border-l border-white/5 bg-[#0a0f1e]/95 backdrop-blur-xl flex flex-col p-6 z-30 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] h-full overflow-hidden">
       <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <div className="flex items-center gap-3">
             <Terminal className="w-5 h-5 text-indigo-500" />
             <h3 className="text-xl font-black uppercase italic tracking-tighter">Debug <span className="text-indigo-500">Console</span></h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            title="Chiudi Console"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
       </div>

       <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8 pb-10">
          
          {/* SNAPSHOT SYSTEM */}
          <div className="grid grid-cols-2 gap-3">
             <button 
                onClick={() => socket.emit('save_checkpoint', { roomId })}
                className="flex items-center justify-center gap-2 py-3 bg-indigo-600/10 border border-indigo-500/30 rounded-xl text-[9px] font-black uppercase text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all shadow-lg active:scale-95"
             >
                <Save className="w-3 h-3" /> Save Checkpoint
             </button>
             <button 
                onClick={() => socket.emit('load_checkpoint', { roomId })}
                disabled={!room?.checkpoint}
                className={`flex items-center justify-center gap-2 py-3 border rounded-xl text-[9px] font-black uppercase transition-all shadow-lg active:scale-95 ${room?.checkpoint ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400 hover:bg-amber-600 hover:text-white hover:border-amber-400' : 'bg-slate-900 border-white/5 text-slate-700 opacity-50 cursor-not-allowed'}`}
             >
                <History className="w-3 h-3" /> Restore State
             </button>
          </div>

          {/* STATUS CARD */}
          <div className="bg-slate-900/80 border border-white/5 rounded-2xl p-4 space-y-3 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-colors" />
             
             <div className="flex justify-between relative">
                <span className="text-[10px] font-bold uppercase text-slate-500">Priority</span>
                <span className="text-[10px] font-black uppercase text-indigo-400 italic">
                   {gameState.priorityPlayerId === effectivePlayerId ? 'Tu' : 'Avversario'}
                </span>
             </div>
             <div className="flex justify-between relative">
                <span className="text-[10px] font-bold uppercase text-slate-500">Step</span>
                <span className="text-[10px] font-black uppercase text-indigo-400 italic">{gameState.currentStep}</span>
             </div>
             <div className="flex justify-between relative">
                <span className="text-[10px] font-bold uppercase text-slate-500">PROPRIETARIO TURNO</span>
                <span className={`text-[10px] font-black uppercase italic ${gameState.activePlayerId === effectivePlayerId ? 'text-emerald-400' : 'text-orange-400'}`}>
                   {gameState.activePlayerId === effectivePlayerId ? 'TU' : 'AVVERSARIO'} 
                </span>
             </div>
          </div>

          <div className="space-y-4">
             <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Card Lab</h4>
                <span className="text-[8px] font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded uppercase">
                   {pState?.library.length || 0} in Library
                </span>
             </div>
             
             <div className="bg-slate-950 border border-white/5 rounded-2xl p-4 space-y-4 relative">
                <div className="relative">
                   <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
                      <input 
                         type="text" 
                         value={cardSearch}
                         onChange={(e) => setCardSearch(e.target.value)}
                         placeholder="Cerca nella tua Library..."
                         className="w-full bg-slate-900 border border-white/10 rounded-lg py-2 pl-8 pr-3 text-[10px] text-white focus:outline-none focus:border-indigo-500/50"
                      />
                   </div>

                   {/* AUTOCOMPLETE DROPDOWN */}
                   {cardSearch.length >= 2 && (
                      <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl max-h-[200px] overflow-y-auto custom-scrollbar">
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
                                  <span className="text-[10px] font-bold text-slate-300 group-hover:text-white transition-colors">
                                     {card.definition.name}
                                  </span>
                                  <Plus className="w-3 h-3 text-slate-600 group-hover:text-indigo-400" />
                               </button>
                            ))
                         }
                         {pState?.library.filter(c => c.definition.name.toLowerCase().includes(cardSearch.toLowerCase())).length === 0 && (
                            <div className="p-4 text-center">
                               <span className="text-[9px] font-bold text-slate-600 uppercase italic">Nessun match trovato</span>
                            </div>
                         )}
                      </div>
                   )}
                </div>
               
             </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="space-y-4">
             <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Comandi Rapidi</h4>
             <div className="grid grid-cols-2 gap-3">
                <button 
                    onClick={() => socket.emit('pass_priority', { roomId, playerId: effectivePlayerId })}
                    className="flex items-center gap-2 p-3 bg-slate-900 border border-white/5 rounded-xl text-[9px] font-black uppercase text-slate-400 hover:bg-indigo-600 hover:text-white transition-all shadow-lg active:scale-95"
                 >
                    <Play className="w-3 h-3" /> Passa Priorità
                 </button>
                 <button 
                    onClick={() => opponentId && onSwapControl(effectivePlayerId === playerId ? opponentId : playerId)}
                    className="flex items-center gap-2 p-3 bg-slate-900 border border-white/5 rounded-xl text-[9px] font-black uppercase text-slate-400 hover:bg-orange-600 hover:text-white transition-all shadow-lg active:scale-95"
                 >
                    <Users className="w-3 h-3" /> Inverti Controllo
                 </button>
                 <button 
                    onClick={() => socket.emit('toggle_mana_cheat', { roomId, playerId: effectivePlayerId })}
                    className={`flex items-center gap-2 p-3 border rounded-xl text-[9px] font-black uppercase transition-all shadow-lg active:scale-95 ${pState?.manaCheat ? 'bg-emerald-500 text-white border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-900 border-white/5 text-slate-400 hover:bg-slate-700'}`}
                 >
                    <Zap className="w-3 h-3" /> Infinite Mana
                 </button>
                 <button 
                    onClick={() => socket.emit('debug_draw_card', { roomId, playerId: effectivePlayerId })}
                    className="flex items-center gap-2 p-3 bg-slate-900 border border-white/5 rounded-xl text-[9px] font-black uppercase text-slate-400 hover:bg-emerald-600 hover:text-white transition-all shadow-lg active:scale-95"
                 >
                    <Plus className="w-3 h-3" /> Pesca Carta
                 </button>
                 <button 
                    onClick={() => socket.emit('toggle_full_control', { roomId, playerId: effectivePlayerId })}
                    className={`flex items-center gap-2 p-3 border rounded-xl text-[9px] font-black uppercase transition-all shadow-lg active:scale-95 ${pState?.fullControl ? 'bg-amber-500 text-white border-amber-400' : 'bg-slate-900 border-white/5 text-slate-400 hover:bg-slate-700'}`}
                 >
                    <MousePointer2 className="w-3 h-3" /> Full Control
                 </button>
                 <button 
                    onClick={() => socket.emit('debug_swap_hand', { roomId, playerId: effectivePlayerId })}
                    className="flex items-center gap-2 p-3 bg-slate-900 border border-white/5 rounded-xl text-[9px] font-black uppercase text-slate-400 hover:bg-purple-600 hover:text-white transition-all shadow-lg active:scale-95"
                 >
                    <Layers className="w-3 h-3" /> Cambia Mano
                 </button>
                 
                 <div className="col-span-2 grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
                    <button 
                        onClick={() => socket.emit('debug_add_life', { roomId, playerId: effectivePlayerId, amount: 5 })}
                        className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[9px] font-black uppercase text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all shadow-lg active:scale-95"
                    >
                        <Heart className="w-3 h-3" /> +5 Life
                    </button>
                    <button 
                        onClick={() => socket.emit('debug_add_life', { roomId, playerId: effectivePlayerId, amount: -5 })}
                        className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[9px] font-black uppercase text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-lg active:scale-95"
                    >
                        <Minus className="w-3 h-3" /> -5 Life
                    </button>
                 </div>

                 <button 
                    onClick={() => {
                        if (confirm('Sicuro di voler resettare il match?')) {
                            socket.emit('debug_reset_game', { roomId });
                        }
                    }}
                    className="col-span-2 flex items-center justify-center gap-3 p-4 bg-red-600/10 border border-red-600/40 rounded-xl text-[10px] font-black uppercase text-red-500 hover:bg-red-600 hover:text-white transition-all shadow-[0_0_20px_rgba(220,38,38,0.2)] active:scale-[0.98] mt-2 group"
                 >
                    <RotateCcw className="w-4 h-4 group-hover:rotate-[-45deg] transition-transform" /> 
                    Reset Match (Full)
                 </button>
             </div>
          </div>



          {/* EFFECT WHITEBOARD */}
          <div className="space-y-4">
             <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Effect Whiteboard</h4>
                <span className="text-[9px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                   {gameState.ruleRegistry.continuousEffects.length} Active
                </span>
             </div>
             
             <div className="min-h-[100px] border border-white/5 bg-slate-900/50 rounded-2xl overflow-hidden">
                {gameState.ruleRegistry.continuousEffects.length === 0 ? (
                   <div className="h-[100px] flex items-center justify-center p-4">
                      <span className="text-[9px] font-bold text-slate-700 uppercase tracking-widest italic">Nessun Effetto Attivo</span>
                   </div>
                ) : (
                   <div className="divide-y divide-white/5">
                      {gameState.ruleRegistry.continuousEffects.map((effect, idx) => {
                         // Attempt to find the source name
                         const allObjects = [
                            ...gameState.battlefield,
                            ...gameState.exile,
                            ...Object.values(gameState.players).flatMap(p => [...p.graveyard, ...p.hand])
                         ];
                         const source = allObjects.find(o => o.id === effect.sourceId);
                         const sourceName = source?.definition.name || 'Unknown Source';

                         return (
                            <div key={effect.id || idx} className="p-3 hover:bg-white/5 transition-colors group">
                               <div className="flex justify-between items-start mb-1">
                                  <span className="text-[10px] font-black text-indigo-300 uppercase italic truncate max-w-[180px]">
                                     {sourceName}
                                  </span>
                                  <span className="text-[8px] font-bold text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded uppercase">
                                     Layer {effect.layer}
                                  </span>
                               </div>
                               <div className="flex flex-wrap gap-1.5 mt-2">
                                  {effect.powerModifier !== undefined && (
                                     <span className="text-[8px] font-black text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                        {effect.powerModifier > 0 ? '+' : ''}{effect.powerModifier}/{effect.toughnessModifier ?? 0}
                                     </span>
                                  )}
                                  {effect.abilitiesToAdd?.map(ability => (
                                     <span key={ability} className="text-[8px] font-black text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 uppercase">
                                        +{ability}
                                     </span>
                                  ))}
                                  <span className="text-[8px] font-bold text-slate-600 uppercase ml-auto self-center">
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

          {/* TERMINAL LOG */}
          <div className="border border-white/5 bg-slate-950 p-4 rounded-2xl">
             <div className="flex items-center gap-2 mb-2">
                <Terminal className="w-3 h-3 text-emerald-500" />
                <span className="text-[9px] font-black uppercase text-emerald-500/70">Terminal Log</span>
             </div>
             <div 
                ref={terminalRef}
                className="text-[10px] font-mono text-slate-300 leading-tight space-y-1.5 overflow-y-auto max-h-[150px] custom-scrollbar pt-1 pr-2"
             >
                {(gameState.logs || []).length === 0 && <span className="text-slate-600 italic">{`> Awaiting logs...`}</span>}
                {(gameState.logs || []).map((logLine, index) => (
                   <div key={index} className="break-words leading-relaxed border-l border-emerald-500/20 pl-2 opacity-80 hover:opacity-100 transition-opacity">
                      {logLine}
                   </div>
                ))}
             </div>
          </div>

       </div>
       
       {/* FOOTER */}
       <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[8px] font-black text-emerald-500 uppercase">Live Sync</span>
          </div>
          <span className="text-[8px] font-bold text-slate-600 uppercase">MTG Engine v0.1-poc</span>
       </div>
    </div>
  );
};
