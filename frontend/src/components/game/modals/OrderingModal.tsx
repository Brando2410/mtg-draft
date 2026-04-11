import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Eye, EyeOff } from 'lucide-react';
import { GameCard } from '../GameCard';
import { type GameObject, type PlayerState } from '@shared/engine_types';

interface OrderingModalProps {
  pendingAction: any;
  me: PlayerState | undefined;
  battlefield: GameObject[];
  orderingList: string[];
  onOrderClick: (id: string) => void;
}

export const OrderingModal = ({ pendingAction, me, battlefield, orderingList, onOrderClick }: OrderingModalProps) => {
  const [minimized, setMinimized] = useState(false);
  const isOrdering = pendingAction?.type === 'ORDER_BLOCKERS' || pendingAction?.type === 'ORDER_ATTACKERS';
  
  if (!isOrdering || pendingAction.playerId !== me?.id) return null;

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
              className="bg-slate-900 border border-white/10 p-10 rounded-[3rem] shadow-2xl max-w-4xl w-full flex flex-col items-center gap-8 text-center relative"
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
                <div className="w-16 h-16 bg-amber-600 rounded-2xl flex items-center justify-center mb-2 shadow-lg ring-4 ring-amber-500/20">
                  <RefreshCw className="w-8 h-8 text-white animate-spin-slow" />
                </div>
                <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                  {pendingAction.type === 'ORDER_BLOCKERS' ? "Order Blockers" : "Order Attackers"}
                </h3>
                <p className="text-slate-400 text-sm font-medium max-w-sm">
                  Select creatures in the order you want to assign damage (the first one receives damage first).
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-6 p-6 bg-black/40 rounded-3xl border border-white/5">
                {pendingAction.data?.ids?.map((id: string) => {
                  const obj = battlefield.find(o => o.id === id);
                  const orderIdx = orderingList.indexOf(id);
                  return (
                    <div key={id} className="relative group cursor-pointer" onClick={() => onOrderClick(id)}>
                      <div className={`transition-all duration-300 ${orderIdx !== -1 ? 'opacity-40 grayscale scale-95' : 'hover:scale-105'}`}>
                        {obj && <GameCard obj={obj} variant="battlefield" />}
                      </div>
                      {orderIdx !== -1 && (
                        <div className="absolute inset-x-0 top-0 flex items-center justify-center">
                          <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center border-4 border-white shadow-2xl text-2xl font-black italic text-white -translate-y-1/2">
                            {orderIdx + 1}
                          </div>
                        </div>
                      )}
                      {orderIdx === -1 && (
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-indigo-500 text-[10px] font-black px-3 py-1 rounded-full shadow-xl text-white">
                          Select Next
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {orderingList.length > 0 && (
                <button 
                  onClick={() => onOrderClick?.('RESET')}
                  className="px-6 py-2 bg-white/5 hover:bg-white/10 text-slate-400 text-[10px] font-black uppercase rounded-lg border border-white/5"
                >
                  Reset Order
                </button>
              )}
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
