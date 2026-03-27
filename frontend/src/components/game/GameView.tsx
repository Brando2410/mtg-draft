import { Phase, type Room } from '@shared/types';
import { Terminal, Shield, Heart, Zap, Play, ChevronRight, X, Layers } from 'lucide-react';
import { useState } from 'react';

interface GameViewProps {
  room: Room;
  playerId: string;
  onBack: () => void;
}

export const GameView = ({ room, playerId, onBack }: GameViewProps) => {
  const [showDebug, setShowDebug] = useState(true);
  
  const gameState = room.gameState;
  const me = gameState?.players[playerId];
  const opponentId = Object.keys(gameState?.players || {}).find(id => id !== playerId);
  const opponent = opponentId ? gameState?.players[opponentId] : null;

  if (!gameState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-10">
        <Layers className="w-12 h-12 text-indigo-500 animate-pulse mb-6" />
        <h2 className="text-3xl font-black uppercase italic tracking-tighter">Inizializzazione Motore di Gioco...</h2>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#020617] text-slate-200 flex overflow-hidden font-sans">
      
      {/* MAIN BATTLEFIELD AREA */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* PHASE BAR */}
        <div className="h-12 bg-slate-900/80 border-b border-white/5 backdrop-blur-md flex items-center justify-between px-6 z-20">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Turno</span>
                <span className="text-sm font-black text-indigo-400 italic">#{gameState.turnNumber}</span>
             </div>
             <div className="h-4 w-px bg-white/10" />
             <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${gameState.currentPhase === Phase.Beginning ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-500'}`}>Beginning</span>
                <ChevronRight className="w-3 h-3 text-slate-700" />
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${gameState.currentPhase === Phase.PreCombatMain ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-500'}`}>Main 1</span>
                <ChevronRight className="w-3 h-3 text-slate-700" />
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${gameState.currentPhase === Phase.Combat ? 'bg-red-500/20 text-red-400' : 'text-slate-500'}`}>Combat</span>
             </div>
          </div>

          <div className="flex items-center gap-3">
             <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
             </button>
          </div>
        </div>

        {/* BATTLEFIELD GRID */}
        <div className="flex-1 relative flex flex-col items-center justify-center p-4">
          
          {/* OPPONENT AREA */}
          <div className="w-full max-w-5xl h-1/2 border-b border-white/5 flex flex-col items-center justify-center gap-4 opacity-60">
             <div className="flex items-center gap-6 mb-8">
                <div className="bg-slate-900/80 p-4 rounded-3xl border border-white/5 flex items-center gap-4 shadow-2xl">
                   <div className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-500" />
                      <span className="text-3xl font-black italic">{opponent?.life || 20}</span>
                   </div>
                </div>
                <div className="text-center font-black uppercase tracking-tighter italic text-slate-500">{opponent?.id.substring(0,8) || 'AVVERSARIO'}</div>
             </div>
             {/* Opponent Battlefield Zone */}
             <div className="w-full h-32 bg-slate-900/20 rounded-[2rem] border border-dashed border-white/5 flex items-center justify-center">
                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Campo Avversario</span>
             </div>
          </div>

          {/* MY AREA */}
          <div className="w-full max-w-5xl h-1/2 flex flex-col items-center justify-center gap-4">
             {/* My Battlefield Zone */}
             <div className="w-full h-32 bg-indigo-500/5 rounded-[2rem] border border-dashed border-indigo-500/20 flex items-center justify-center mb-8">
                <span className="text-[10px] font-bold text-indigo-500/30 uppercase tracking-widest text-center italic leading-relaxed">Trasura qui le carte dalla tua mano<br/>per lanciarle sul campo di battaglia</span>
             </div>

             <div className="flex items-center gap-6">
                <div className="text-center font-black uppercase tracking-tighter italic text-indigo-500">Tu</div>
                <div className="bg-indigo-600 p-4 rounded-3xl border border-indigo-400/30 flex items-center gap-4 shadow-2xl shadow-indigo-600/20">
                   <div className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-white" />
                      <span className="text-3xl font-black italic">{me?.life || 20}</span>
                   </div>
                </div>
                {/* MANA POOL */}
                <div className="flex gap-2">
                   {['W','U','B','R','G','C'].map(c => (
                     <div key={c} className="w-10 h-10 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-[10px] font-black opacity-30">
                        {c}
                     </div>
                   ))}
                </div>
             </div>
          </div>

        </div>

        {/* MY HAND - COMPACT PREVIEW */}
        <div className="h-40 bg-slate-900/90 border-t border-white/10 backdrop-blur-xl flex items-center justify-center px-10 gap-4 z-20">
           {me?.hand.length === 0 ? (
             <div className="text-slate-600 font-black uppercase text-[10px] tracking-widest italic">La tua mano è vuota</div>
           ) : (
             me?.hand.map((card, i) => (
               <div key={i} className="w-24 h-36 bg-slate-800 rounded-lg border border-white/10 shadow-xl flex flex-col items-center justify-center p-2 text-center group cursor-pointer hover:-translate-y-4 transition-transform duration-300">
                  <div className="text-[8px] font-black uppercase tracking-tight">{card.definition.name}</div>
               </div>
             ))
           )}
        </div>

      </div>

      {/* DEBUG CONSOLE SIDEBAR */}
      {showDebug && (
        <div className="w-[400px] border-l border-white/5 bg-[#0a0f1e]/95 backdrop-blur-xl flex flex-col p-6 z-30 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]">
           <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                 <Terminal className="w-5 h-5 text-indigo-500" />
                 <h3 className="text-xl font-black uppercase italic tracking-tighter">Debug <span className="text-indigo-500">Console</span></h3>
              </div>
              <button 
                onClick={() => setShowDebug(false)}
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
                       {gameState.priorityPlayerId === playerId ? 'Tu' : 'Avversario'}
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
              </div>

              {/* QUICK ACTIONS */}
              <div className="space-y-4">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Comandi Rapidi</h4>
                 <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center gap-2 p-3 bg-slate-900 border border-white/5 rounded-xl text-[9px] font-black uppercase text-slate-400 hover:bg-indigo-600 hover:text-white transition-all shadow-lg active:scale-95">
                       <Play className="w-3 h-3" /> Passa Priorità
                    </button>
                    <button className="flex items-center gap-2 p-3 bg-slate-900 border border-white/5 rounded-xl text-[9px] font-black uppercase text-slate-400 hover:bg-red-600 hover:text-white transition-all shadow-lg active:scale-95">
                       <Shield className="w-3 h-3" /> Cambia Life
                    </button>
                    <button className="flex items-center gap-2 p-3 bg-slate-900 border border-white/5 rounded-xl text-[9px] font-black uppercase text-slate-400 hover:bg-emerald-600 hover:text-white transition-all shadow-lg active:scale-95">
                       <Zap className="w-3 h-3" /> Mana Cheat
                    </button>
                    <button className="flex items-center gap-2 p-3 bg-slate-900 border border-white/5 rounded-xl text-[9px] font-black uppercase text-slate-400 hover:bg-purple-600 hover:text-white transition-all shadow-lg active:scale-95">
                       <Layers className="w-3 h-3" /> Pesca Carta
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

              {/* TRIGGER CONSOLE COMMAND */}
              <div className="border border-white/5 bg-slate-950 p-4 rounded-2xl">
                 <div className="flex items-center gap-2 mb-2">
                    <Terminal className="w-3 h-3 text-emerald-500" />
                    <span className="text-[9px] font-black uppercase text-emerald-500/70">Terminal Log</span>
                 </div>
                 <div className="text-[10px] font-mono text-slate-500 leading-tight">
                    {`> [GameEngine] Init successful`}<br/>
                    {`> [Socket] Subscribed to match events`}<br/>
                    {`> Ready for user input...`}
                 </div>
              </div>

           </div>
           
           {/* CONSOLE FOOTER */}
           <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[8px] font-black text-emerald-500 uppercase">Live Sync</span>
              </div>
              <span className="text-[8px] font-bold text-slate-600 uppercase">MTG Engine v0.1-poc</span>
           </div>
        </div>
      )}

      {/* FLOATING DEBUG TOGGLE (WHEN CONSOLE HIDDEN) */}
      {!showDebug && (
        <button 
          onClick={() => setShowDebug(true)}
          className="fixed top-20 right-0 p-3 bg-indigo-600 text-white rounded-l-2xl shadow-2xl shadow-indigo-600/40 hover:pr-5 transition-all active:scale-90 z-[35]"
        >
          <Terminal className="w-5 h-5" />
        </button>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>

    </div>
  );
};
