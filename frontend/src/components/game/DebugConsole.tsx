import { Terminal, RefreshCw, Zap, Play, ChevronRight, Layers, Users } from 'lucide-react';
import { type GameState } from '@shared/types';
import { socket } from '../../services/socket';
import { useEffect, useRef } from 'react';

interface DebugConsoleProps {
  gameState: GameState;
  playerId: string;
  effectivePlayerId: string;
  opponentId: string | undefined;
  roomId: string;
  onClose: () => void;
  onSwapControl: (newId: string) => void;
}

export const DebugConsole = ({ 
  gameState, 
  playerId, 
  effectivePlayerId, 
  opponentId, 
  roomId, 
  onClose,
  onSwapControl 
}: DebugConsoleProps) => {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [gameState.logs]);
  return (
    <div className="w-[400px] border-l border-white/5 bg-[#0a0f1e]/95 backdrop-blur-xl flex flex-col p-6 z-30 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]">
       <div className="flex justify-between items-center mb-8">
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

       <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8">
          
          {/* STATUS CARD */}
          <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-2xl p-4 space-y-3">
             <div className="flex justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-500">Priority</span>
                <span className="text-[10px] font-black uppercase text-indigo-400 italic">
                   {gameState.priorityPlayerId === effectivePlayerId ? 'Tu' : 'Avversario'}
                </span>
             </div>
             <div className="flex justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-500">Step</span>
                <span className="text-[10px] font-black uppercase text-indigo-400 italic">{gameState.currentStep}</span>
             </div>
             <div className="flex justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-500">Stack Size</span>
                <span className="text-[10px] font-black uppercase text-indigo-400 italic">{gameState.stack.length} oggetti</span>
             </div>
             <div className="flex justify-between pt-2 border-t border-white/10">
                <span className="text-[10px] font-bold uppercase text-slate-500">PROPRIETARIO TURNO</span>
                <span className={`text-[10px] font-black uppercase italic ${gameState.activePlayerId === effectivePlayerId ? 'text-emerald-400' : 'text-orange-400'}`}>
                   {gameState.activePlayerId === effectivePlayerId ? 'TU' : 'AVVERSARIO'} 
                   <span className="opacity-40 ml-1 text-[8px]">({gameState.activePlayerId.substring(0, 6)})</span>
                </span>
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
                    onClick={() => socket.emit('shuffle_library', { roomId, playerId: effectivePlayerId })}
                    className="flex items-center gap-2 p-3 bg-slate-900 border border-white/5 rounded-xl text-[9px] font-black uppercase text-slate-400 hover:bg-red-600 hover:text-white transition-all shadow-lg active:scale-95"
                 >
                    <RefreshCw className="w-3 h-3" /> Mescola Mazzo
                 </button>
                 <button className="flex items-center gap-2 p-3 bg-slate-900 border border-white/5 rounded-xl text-[9px] font-black uppercase text-slate-400 hover:bg-emerald-600 hover:text-white transition-all shadow-lg active:scale-95">
                    <Zap className="w-3 h-3" /> Mana Cheat
                 </button>
                 <button 
                    onClick={() => socket.emit('debug_swap_hand', { roomId, playerId: effectivePlayerId })}
                    className="flex items-center gap-2 p-3 bg-slate-900 border border-white/5 rounded-xl text-[9px] font-black uppercase text-slate-400 hover:bg-purple-600 hover:text-white transition-all shadow-lg active:scale-95"
                 >
                    <Layers className="w-3 h-3" /> Cambia Mano
                 </button>
             </div>
          </div>

          {/* STACK LIST */}
          <div className="space-y-4">
             <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">The Stack</h4>
             <div className="min-h-[100px] border-2 border-dashed border-white/5 rounded-2xl flex items-center justify-center p-4">
                <span className="text-[9px] font-bold text-slate-700 uppercase tracking-widest italic">Stack Vuoto</span>
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
