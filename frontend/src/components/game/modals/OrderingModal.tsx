import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { GameCard } from '../GameCard';
import { type GameObject, type PlayerState, ActionType } from '@shared/engine_types';

interface OrderingModalProps {
  pendingAction: any;
  me: PlayerState | undefined;
  battlefield: GameObject[];
  onOrderClick: (id: string, fullOrder?: string[]) => void;
}

export const OrderingModal = ({ pendingAction, me, battlefield, onOrderClick }: OrderingModalProps) => {
  const [minimized, setMinimized] = useState(false);
  const [items, setItems] = useState<string[]>([]);
  
  const isOrdering = pendingAction?.type === ActionType.OrderBlockers || pendingAction?.type === ActionType.OrderAttackers;
  
  // Sync items when pendingAction changes
  useEffect(() => {
    if (pendingAction?.data?.ids) {
      setItems(pendingAction.data.ids);
    }
  }, [pendingAction?.data?.ids]);

  if (!isOrdering || pendingAction.playerId !== me?.id) return null;

  const handleConfirm = () => {
    onOrderClick('CONFIRM', items);
  };

  return (
    <>
      <AnimatePresence>
        {!minimized && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }}
              className="bg-slate-900 border border-white/10 p-10 rounded-[3rem] shadow-2xl max-w-5xl w-full flex flex-col items-center gap-10 text-center relative"
            >
              {/* MINIMIZE BUTTON */}
              <button 
                onClick={() => setMinimized(true)}
                className="absolute top-4 left-1/2 -translate-x-1/2 p-2 px-4 bg-white/5 hover:bg-white/10 rounded-full text-slate-500 hover:text-white transition-all flex items-center gap-2 text-[10px] font-black z-30 tracking-[0.2em]"
              >
                <EyeOff className="w-3.5 h-3.5" />
                SHOW BATTLEFIELD
              </button>

              <div className="flex flex-col items-center gap-2">
                <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white">
                  {pendingAction.type === ActionType.OrderBlockers ? "Assign Damage Order" : "Order Attackers"}
                </h3>
                <p className="text-slate-400 text-sm font-medium max-w-sm">
                  Drag and slide cards to reorder. Damage will be assigned from left to right.
                </p>
              </div>

              {/* REORDER GROUP */}
              <div className="w-full overflow-x-auto pb-4 pt-4 scrollbar-hide">
                <Reorder.Group 
                  axis="x" 
                  values={items} 
                  onReorder={setItems}
                  className="flex justify-center gap-6 min-w-max px-10"
                >
                  {(() => {
                    const attacker = battlefield.find(o => o.id === pendingAction.sourceId);
                    const attackerPower = parseInt(String(attacker?.effectiveStats?.power ?? 0));
                    let remainingPower = attackerPower;

                    return items.map((id, index) => {
                      const obj = battlefield.find(o => o.id === id);
                      if (!obj) return null;

                      const toughness = Math.max(0, parseInt(String(obj.effectiveStats?.toughness ?? 0)) - (obj.damageMarked || 0));
                      const isLast = index === items.length - 1;
                      const damageDealt = isLast ? remainingPower : Math.min(remainingPower, toughness);
                      const isLethal = damageDealt >= toughness && toughness > 0;
                      remainingPower = Math.max(0, remainingPower - damageDealt);

                      return (
                        <Reorder.Item 
                          key={id} 
                          value={id}
                          className="relative group cursor-grab active:cursor-grabbing"
                        >
                          {/* LETHAL INDICATOR - Subtle Ring */}
                          {isLethal && (
                            <div className="absolute inset-0 z-10 border-4 border-red-500/50 rounded-sm pointer-events-none animate-pulse" />
                          )}

                          {/* ORDER NUMBER BADGE */}
                          <div className="absolute top-1 left-1 z-[120] pointer-events-none">
                              <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-xl text-sm font-black italic text-white ring-2 ring-indigo-500/20">
                                  {index + 1}
                              </div>
                          </div>

                          <div className="transition-transform duration-200 hover:scale-[1.02] pointer-events-none group-hover:drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                            <GameCard 
                                obj={obj} 
                                variant="battlefield" 
                                damagePreview={damageDealt}
                                isTargetable={isLethal} // Visual hint
                            />
                          </div>
                        </Reorder.Item>
                      );
                    });
                  })()}
                </Reorder.Group>
              </div>

              <div className="flex flex-col items-center gap-6 w-full">
                  <div className="h-px w-full max-w-md bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  
                  <button 
                    onClick={handleConfirm}
                    className="group relative px-16 py-5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl transition-all shadow-2xl shadow-indigo-600/20 active:scale-95"
                  >
                    <div className="absolute inset-x-0 -bottom-2 h-4 bg-indigo-900/50 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="text-xl font-black italic uppercase tracking-widest text-white">Confirm Order</span>
                  </button>

                  <button 
                    onClick={() => setItems(pendingAction.data.ids)}
                    className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-[0.2em] transition-colors"
                  >
                    Reset to Default
                  </button>
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
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black italic uppercase tracking-widest shadow-2xl shadow-indigo-600/40 border border-white/20 flex items-center gap-3 animate-bounce-subtle"
            >
              <Eye className="w-5 h-5" />
              Return to Ordering
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
