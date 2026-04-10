import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Library, Trash2, ArrowUp, ArrowDown, Check } from 'lucide-react';
import { BattlefieldCard } from '../BattlefieldCard';
import { type PlayerState } from '@shared/engine_types';

interface ScrySurveilModalProps {
  pendingAction: any;
  me: PlayerState | undefined;
  onResolve: (payload: any) => void;
}

export const ScrySurveilModal = ({ pendingAction, me, onResolve }: ScrySurveilModalProps) => {
  const isScry = pendingAction?.type === 'SCRY';
  const isSurveil = pendingAction?.type === 'SURVEIL';
  
  const [top, setTop] = useState<string[]>([]);
  const [bottom, setBottom] = useState<string[]>([]);
  const [graveyard, setGraveyard] = useState<string[]>([]);
  
  // Initial cards that haven't been moved yet
  const cards = pendingAction?.data?.lookingCards || [];
  const assignedIds = [...top, ...bottom, ...graveyard];
  const unassignedCards = cards.filter((c: any) => !assignedIds.includes(c.id));

  if ((!isScry && !isSurveil) || pendingAction.playerId !== me?.id) return null;

  const handleMove = (id: string, destination: 'top' | 'bottom' | 'graveyard') => {
    // Remove from other piles
    setTop(prev => prev.filter(i => i !== id));
    setBottom(prev => prev.filter(i => i !== id));
    setGraveyard(prev => prev.filter(i => i !== id));

    if (destination === 'top') setTop(prev => [...prev, id]);
    if (destination === 'bottom') setBottom(prev => [...prev, id]);
    if (destination === 'graveyard') setGraveyard(prev => [...prev, id]);
  };

  const handleReset = (id: string) => {
    setTop(prev => prev.filter(i => i !== id));
    setBottom(prev => prev.filter(i => i !== id));
    setGraveyard(prev => prev.filter(i => i !== id));
  };

  const handleConfirm = () => {
    onResolve({ top, bottom, graveyard });
  };

  const isComplete = unassignedCards.length === 0;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[150] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-8"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }} 
          animate={{ scale: 1, y: 0 }}
          className="bg-slate-900 border border-white/10 rounded-[3rem] shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ring-4 ring-offset-4 ring-offset-slate-900 ${isScry ? 'bg-indigo-600 ring-indigo-500/20' : 'bg-emerald-600 ring-emerald-500/20'}`}>
                {isScry ? <Library className="w-8 h-8 text-white" /> : <Trash2 className="w-8 h-8 text-white" />}
              </div>
              <div className="text-left">
                <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">
                  {isScry ? "Scrutina" : "Sopralluogo"} <span className={isScry ? 'text-indigo-400' : 'text-emerald-400'}>{cards.length}</span>
                </h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">
                  {isScry ? "Scegli l'ordine per la cima e il fondo mazzo" : "Scegli cosa mandare al cimitero o in cima"}
                </p>
              </div>
            </div>

            <button
              onClick={handleConfirm}
              disabled={!isComplete}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase italic tracking-wider transition-all
                ${isComplete 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 cursor-pointer' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
            >
              <Check className="w-5 h-5" />
              Conferma Ordine
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* SOURCE / UNASSIGNED */}
              <div className="lg:col-span-3 bg-black/40 rounded-[2rem] p-6 border border-white/5 flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Carte da Assegnare ({unassignedCards.length})</h4>
                  {unassignedCards.length > 0 && <p className="text-[10px] font-bold text-amber-500 italic">Scegli una destinazione per ogni carta</p>}
                </div>
                <div className="flex flex-wrap justify-center gap-6 py-4">
                  {unassignedCards.map((c: any) => (
                    <div key={c.id} className="group relative">
                      <BattlefieldCard obj={c} size="normal" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 backdrop-blur-sm transition-all rounded-xl flex flex-col items-center justify-center gap-3 p-4">
                        <button 
                          onClick={() => handleMove(c.id, 'top')}
                          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg text-[10px] font-black uppercase italic shadow-lg"
                        >
                          <ArrowUp className="w-3 h-3" /> Cima
                        </button>
                        {isScry && (
                          <button 
                            onClick={() => handleMove(c.id, 'bottom')}
                            className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-[10px] font-black uppercase italic shadow-lg"
                          >
                            <ArrowDown className="w-3 h-3" /> Fondo
                          </button>
                        )}
                        {isSurveil && (
                          <button 
                            onClick={() => handleMove(c.id, 'graveyard')}
                            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg text-[10px] font-black uppercase italic shadow-lg"
                          >
                            <Trash2 className="w-3 h-3" /> Cimitero
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {unassignedCards.length === 0 && (
                    <div className="py-10 text-slate-600 italic font-medium flex flex-col items-center gap-2">
                       <Check className="w-6 h-6 text-indigo-500/40" />
                       Tutte le carte assegnate
                    </div>
                  )}
                </div>
              </div>

              {/* TOP PILE */}
              <div className="bg-indigo-500/5 rounded-[2.5rem] p-6 border border-indigo-500/10 flex flex-col gap-4">
                <div className="flex items-center gap-3 px-2">
                  <ArrowUp className="w-4 h-4 text-indigo-400" />
                  <h4 className="text-sm font-black uppercase italic tracking-tighter text-indigo-300">Cima del Mazzo</h4>
                </div>
                <div className="flex flex-col gap-4">
                  {top.map((id, idx) => {
                    const c = cards.find((card: any) => card.id === id);
                    return (
                      <motion.div 
                        layoutId={id}
                        key={id} 
                        className="flex items-center gap-4 bg-slate-950/80 p-3 rounded-2xl border border-white/5 group shadow-xl"
                      >
                         <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-black text-indigo-400 border border-indigo-500/30">
                            {idx + 1}
                         </div>
                         <span className="flex-1 font-bold text-slate-300 text-sm truncate">{c?.definition.name}</span>
                         <button 
                          onClick={() => handleReset(id)}
                          className="opacity-0 group-hover:opacity-100 p-2 hover:bg-white/10 rounded-lg transition-all text-slate-500 hover:text-white"
                         >
                            <ArrowDown className="w-4 h-4 rotate-45" />
                         </button>
                      </motion.div>
                    )
                  })}
                  {top.length === 0 && <div className="h-32 rounded-2xl border-2 border-dashed border-white/5 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-700 italic">Vuoto</div>}
                </div>
              </div>

              {/* BOTTOM / GRAVEYARD PILE */}
              <div className={`${isScry ? 'bg-slate-500/5 border-white/10' : 'bg-emerald-500/5 border-emerald-500/10'} rounded-[2.5rem] p-6 border flex flex-col gap-4`}>
                <div className="flex items-center gap-3 px-2">
                  {isScry ? <ArrowDown className="w-4 h-4 text-slate-400" /> : <Trash2 className="w-4 h-4 text-emerald-400" />}
                  <h4 className={`text-sm font-black uppercase italic tracking-tighter ${isScry ? 'text-slate-300' : 'text-emerald-300'}`}>
                    {isScry ? "Fondo del Mazzo" : "Cimitero"}
                  </h4>
                </div>
                <div className="flex flex-col gap-4">
                  {(isScry ? bottom : graveyard).map((id, idx) => {
                    const c = cards.find((card: any) => card.id === id);
                    return (
                      <motion.div 
                        layoutId={id}
                        key={id} 
                        className="flex items-center gap-4 bg-slate-950/80 p-3 rounded-2xl border border-white/5 group shadow-xl"
                      >
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border ${isScry ? 'bg-slate-500/20 text-slate-400 border-slate-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
                            {idx + 1}
                         </div>
                         <span className="flex-1 font-bold text-slate-300 text-sm truncate">{c?.definition.name}</span>
                         <button 
                          onClick={() => handleReset(id)}
                          className="opacity-0 group-hover:opacity-100 p-2 hover:bg-white/10 rounded-lg transition-all text-slate-500 hover:text-white"
                         >
                            <ArrowDown className="w-4 h-4 rotate-45" />
                         </button>
                      </motion.div>
                    )
                  })}
                  {(isScry ? bottom : graveyard).length === 0 && <div className="h-32 rounded-2xl border-2 border-dashed border-white/5 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-700 italic">Vuoto</div>}
                </div>
              </div>

              {/* INFO SECTION */}
              <div className="bg-slate-950/40 rounded-[2.5rem] p-8 border border-white/5 flex flex-col gap-6 justify-center">
                 <div className="flex flex-col gap-2">
                    <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest leading-normal">Come funziona</p>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      {isScry 
                        ? "Sposta le carte in cima o in fondo. Se sposti più carte in cima, la prima della lista sarà la prima che pescherai."
                        : "Sposta le carte in cima o al cimitero. Surveil ti permette di filtrare il mazzo mandando carte inutili via."}
                    </p>
                 </div>
                 <div className="w-full h-px bg-white/5" />
                 <div className="flex flex-col gap-3">
                   <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-bold uppercase tracking-widest">Totale Carte</span>
                      <span className="text-white font-black italic">{cards.length}</span>
                   </div>
                   <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-bold uppercase tracking-widest">Assegnate</span>
                      <span className={`${isComplete ? 'text-emerald-400' : 'text-amber-500'} font-black italic shrink-0`}>
                        {assignedIds.length} / {cards.length}
                      </span>
                   </div>
                 </div>
              </div>

            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
