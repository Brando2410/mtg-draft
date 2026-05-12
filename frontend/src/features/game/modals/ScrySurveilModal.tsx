import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Library, Trash2, ArrowUp, ArrowDown, Check, Eye, EyeOff } from 'lucide-react';
import { GameCard } from '../GameCard';
import { type PlayerState, type GameObject } from '@shared/engine_types';

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
  const [minimized, setMinimized] = useState(false);
  
  const cards: GameObject[] = pendingAction?.data?.lookingCards || [];

  // Initialize all cards to 'Top' on mount
  useEffect(() => {
    if (cards.length > 0 && top.length === 0 && bottom.length === 0 && graveyard.length === 0) {
        setTop(cards.map(c => c.id));
    }
  }, [cards]);

  if ((!isScry && !isSurveil) || pendingAction.playerId !== me?.id) return null;

  const handleMove = (id: string, destination: 'top' | 'bottom' | 'graveyard') => {
    setTop(prev => prev.filter(i => i !== id));
    setBottom(prev => prev.filter(i => i !== id));
    setGraveyard(prev => prev.filter(i => i !== id));

    if (destination === 'top') setTop(prev => [...prev, id]); // Put at the end of the list
    if (destination === 'bottom') setBottom(prev => [...prev, id]);
    if (destination === 'graveyard') setGraveyard(prev => [...prev, id]);
  };

  const handleConfirm = () => {

    onResolve({ top, bottom, graveyard });
  };

  const CardItem = ({ id, zone }: { id: string, zone: 'top' | 'bottom' | 'graveyard' }) => {
    const c = cards.find(card => card.id === id);
    if (!c) return null;

    return (
      <Reorder.Item 
        value={id}
        id={id}
        layoutId={id} // Crucial for interpolation between lists
        dragListener={true}
        // Vertical drag moves to other zone
        onDragEnd={(_, info) => {
            if (info.offset.y > 100 && zone === 'top') {
               handleMove(id, isScry ? 'bottom' : 'graveyard');
            } else if (info.offset.y < -100 && zone !== 'top') {
               handleMove(id, 'top');
            }
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative group w-32 h-44 cursor-grab active:cursor-grabbing shrink-0"
      >
        <GameCard obj={c} variant="hand" />
        
        {/* INTERACTION HINT */}
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg ring-2 ring-white/10 pointer-events-none" />

        {/* ORDER BADGE (Only for TOP zone) */}
        {zone === 'top' && top.length > 1 && (
             <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-indigo-600 border-4 border-slate-900 flex items-center justify-center text-xs font-black text-white shadow-xl z-20">
                {top.indexOf(id) + 1}
             </div>
        )}

        {/* DRAG HANDLES (Bottom dots) */}
        <div className="absolute inset-x-0 -bottom-4 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
        </div>
      </Reorder.Item>
    );
  };

  return (
    <>
      <AnimatePresence>
        {!minimized && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} 
              animate={{ scale: 1, y: 0 }}
              className="bg-slate-900 border border-white/10 rounded-[4rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] max-w-7xl w-full max-h-[95vh] flex flex-col overflow-hidden relative"
            >
              {/* MINIMIZE BUTTON */}
              <button 
                onClick={() => setMinimized(true)}
                className="absolute top-4 left-1/2 -translate-x-1/2 p-2 px-4 bg-white/5 hover:bg-white/10 rounded-full text-slate-500 hover:text-white transition-all flex items-center gap-2 text-[10px] font-black z-30 tracking-[0.2em]"
              >
                <EyeOff className="w-3.5 h-3.5" />
                SHOW BATTLEFIELD
              </button>
          {/* HEADER */}
          <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
             <div className="flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${isScry ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
                    {isScry ? <Library className="w-8 h-8 text-white" /> : <Trash2 className="w-8 h-8 text-white" />}
                </div>
                <div className="text-left">
                    <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">
                        {isScry ? "Scry" : "Surveil"} <span className={isScry ? 'text-indigo-400' : 'text-emerald-400'}>{cards.length}</span>
                    </h3>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">
                        Drag LEFT/RIGHT to reorder. Drag UP/DOWN to change zone.
                    </p>
                </div>
             </div>

             <button
               onClick={handleConfirm}
               className="btn-premium-primary max-w-[calc(var(--u)*40)]"
             >
               <Check className="w-6 h-6" />
               Confirm Order
             </button>
          </div>

          {/* CONTENT: TWO HORIZONTAL ROWS */}
          <div className="flex-1 overflow-hidden p-10 flex flex-col gap-8 bg-black/40">
              
              {/* TOP ZONE */}
              <div className="flex-1 flex flex-col gap-4 min-h-0">
                  <div className="flex items-center gap-4 px-6 py-3 bg-indigo-500/10 rounded-3xl border border-indigo-500/20 w-fit">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                      <h4 className="text-sm font-black uppercase italic tracking-widest text-white">Top of Library <span className="text-indigo-400 ml-2">({top.length})</span></h4>
                  </div>
                  <Reorder.Group 
                    axis="x" 
                    values={top} 
                    onReorder={setTop}
                    className="flex-1 overflow-x-auto overflow-y-hidden px-10 py-6 bg-indigo-500/[0.03] border border-indigo-500/10 rounded-[3rem] flex flex-row gap-12 items-center custom-scrollbar-horizontal"
                  >
                      {top.map(id => <CardItem key={id} id={id} zone="top" />)}
                      {top.length === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-white/5">
                            <ArrowUp className="w-16 h-16" />
                            <span className="text-sm font-black uppercase tracking-[0.2em]">Keep on Top</span>
                        </div>
                      )}
                  </Reorder.Group>
              </div>

              {/* BOTTOM ZONE */}
              <div className="flex-1 flex flex-col gap-4 min-h-0">
                  <div className={`flex items-center gap-4 px-6 py-3 ${isScry ? 'bg-slate-500/10 border-white/10' : 'bg-emerald-500/10 border-emerald-500/20'} rounded-3xl border w-fit`}>
                      <div className={`w-2.5 h-2.5 rounded-full ${isScry ? 'bg-slate-500' : 'bg-emerald-500'}`} />
                      <h4 className={`text-sm font-black uppercase italic tracking-widest text-white`}>
                        {isScry ? "Bottom of Library" : "Graveyard"} 
                        <span className={`ml-2 ${isScry ? 'text-slate-400' : 'text-emerald-400'}`}>({isScry ? bottom.length : graveyard.length})</span>
                      </h4>
                  </div>
                  <Reorder.Group 
                    axis="x" 
                    values={isScry ? bottom : graveyard} 
                    onReorder={isScry ? setBottom : setGraveyard}
                    className={`flex-1 overflow-x-auto overflow-y-hidden px-10 py-6 ${isScry ? 'bg-white/5 border-white/10' : 'bg-emerald-500/[0.03] border-emerald-500/10'} rounded-[3rem] flex flex-row gap-12 items-center custom-scrollbar-horizontal`}
                  >
                      {(isScry ? bottom : graveyard).map(id => (
                          <CardItem key={id} id={id} zone={isScry ? 'bottom' : 'graveyard'} />
                      ))}
                      {(isScry ? bottom.length : graveyard.length) === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-white/5">
                            <ArrowDown className="w-16 h-16" />
                            <span className="text-sm font-black uppercase tracking-[0.2em]">{isScry ? "Bottom" : "Graveyard"}</span>
                        </div>
                      )}
                  </Reorder.Group>
              </div>

          </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MINIMIZED VIEW */}
      <AnimatePresence>
        {minimized && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-32 left-1/2 -translate-x-1/2 z-[1100]"
          >
            <button 
              onClick={() => setMinimized(false)}
              className="h-[calc(var(--u)*7.5)] px-[var(--sp-12)] btn-premium-primary"
            >
              <Eye className="w-5 h-5" />
              Return to Choice
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
