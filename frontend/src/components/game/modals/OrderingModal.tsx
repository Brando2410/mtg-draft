import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { BattlefieldCard } from '../BattlefieldCard';
import { type GameObject, type PlayerState } from '@shared/engine_types';

interface OrderingModalProps {
  pendingAction: any;
  me: PlayerState | undefined;
  battlefield: GameObject[];
  orderingList: string[];
  onOrderClick: (id: string) => void;
}

export const OrderingModal = ({ pendingAction, me, battlefield, orderingList, onOrderClick }: OrderingModalProps) => {
  const isOrdering = pendingAction?.type === 'ORDER_BLOCKERS' || pendingAction?.type === 'ORDER_ATTACKERS';
  if (!isOrdering || pendingAction.playerId !== me?.id) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }} 
          animate={{ scale: 1, y: 0 }}
          className="bg-slate-900 border border-white/10 p-10 rounded-[3rem] shadow-2xl max-w-4xl w-full flex flex-col items-center gap-8 text-center"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-amber-600 rounded-2xl flex items-center justify-center mb-2 shadow-lg ring-4 ring-amber-500/20">
              <RefreshCw className="w-8 h-8 text-white animate-spin-slow" />
            </div>
            <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">
              {pendingAction.type === 'ORDER_BLOCKERS' ? "Ordina i Bloccanti" : "Ordina gli Attaccanti"}
            </h3>
            <p className="text-slate-400 text-sm font-medium max-w-sm">
              Seleziona le creature nell'ordine in cui vuoi assegnare il danno (la prima riceve il danno per prima).
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 p-6 bg-black/40 rounded-3xl border border-white/5">
            {pendingAction.data?.ids?.map((id: string) => {
              const obj = battlefield.find(o => o.id === id);
              const orderIdx = orderingList.indexOf(id);
              return (
                <div key={id} className="relative group cursor-pointer" onClick={() => onOrderClick(id)}>
                  <div className={`transition-all duration-300 ${orderIdx !== -1 ? 'opacity-40 grayscale scale-95' : 'hover:scale-105'}`}>
                    {obj && <BattlefieldCard obj={obj} size="normal" />}
                  </div>
                  {orderIdx !== -1 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center border-4 border-white shadow-2xl text-2xl font-black italic text-white">
                        {orderIdx + 1}
                      </div>
                    </div>
                  )}
                  {orderIdx === -1 && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-indigo-500 text-[10px] font-black px-3 py-1 rounded-full shadow-xl text-white">
                      SCEGLI POS. {orderingList.length + 1}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-1">
              {pendingAction.data?.ids?.map((_: any, i: number) => (
                <div key={i} className={`w-8 h-1 rounded-full transition-all duration-500 ${i < orderingList.length ? 'bg-indigo-500 w-12' : 'bg-slate-800'}`} />
              ))}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              {orderingList.length} di {pendingAction.data?.ids?.length} selezionati
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
