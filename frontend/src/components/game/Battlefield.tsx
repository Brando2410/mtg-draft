import { Heart } from 'lucide-react';
import { type PlayerState, type GameObject } from '@shared/engine_types';
import { motion } from 'framer-motion';

interface BattlefieldProps {
  me: PlayerState | undefined;
  opponent: PlayerState | null | undefined;
  battlefield: GameObject[];
}

export const Battlefield = ({ me, opponent, battlefield }: BattlefieldProps) => {
  const myPermanents = battlefield.filter(obj => obj.controllerId === me?.id);
  const opponentPermanents = battlefield.filter(obj => obj.controllerId === opponent?.id);

  const CardElement = ({ obj }: { obj: GameObject }) => (
    <motion.div
      layoutId={obj.id}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1, rotate: obj.isTapped ? 90 : 0 }}
      whileHover={{ scale: 1.1, zIndex: 10 }}
      className="relative w-24 h-34 shrink-0 shadow-2xl rounded-lg cursor-pointer transition-all"
    >
      <img 
        src={obj.definition.image_url} 
        alt={obj.definition.name}
        className="w-full h-full object-cover rounded-lg border border-white/20"
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://gamepedia.cursecdn.com/mtgsalvation_gamepedia/f/f8/Magic_card_back.jpg';
        }}
      />
      {obj.damageMarked > 0 && (
        <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-white/20 shadow-lg">
          {obj.damageMarked}
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="flex-1 relative flex flex-col items-center justify-center p-4 overflow-hidden">
      
      {/* OPPONENT AREA */}
      <div className="w-full max-w-6xl h-1/2 flex flex-col items-center justify-center gap-6 border-b border-white/5 pb-4">
        <div className="flex items-center gap-8 opacity-40 hover:opacity-100 transition-opacity">
          <div className="bg-slate-900/80 px-6 py-3 rounded-3xl border border-white/5 flex items-center gap-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-red-500" />
              <span className="text-4xl font-black italic tracking-tighter">{opponent?.life ?? 20}</span>
            </div>
          </div>
          <div className="text-center font-black uppercase tracking-[0.2em] italic text-slate-500 text-xs">
            {opponent?.id.substring(0, 8) || 'AVVERSARIO'}
          </div>
        </div>

        {/* Opponent Battlefield Zone */}
        <div className="w-full flex-1 flex flex-wrap items-center justify-center gap-4 px-10">
          {opponentPermanents.length === 0 ? (
            <div className="w-full h-32 flex items-center justify-center border border-dashed border-white/5 rounded-[2.5rem]">
               <span className="text-[10px] font-bold text-slate-800 uppercase tracking-widest italic">Campo Avversario Vuoto</span>
            </div>
          ) : (
            opponentPermanents.map(obj => <CardElement key={obj.id} obj={obj} />)
          )}
        </div>
      </div>

      {/* MY AREA */}
      <div className="w-full max-w-6xl h-1/2 flex flex-col items-center justify-center gap-6 pt-4">
        {/* My Battlefield Zone */}
        <div className="w-full flex-1 flex flex-wrap items-center justify-center gap-4 px-10">
          {myPermanents.length === 0 ? (
            <div className="w-full h-40 bg-indigo-500/5 rounded-[2.5rem] border border-dashed border-indigo-500/20 flex flex-col items-center justify-center gap-2 group hover:bg-indigo-500/10 transition-all duration-500">
              <span className="text-[10px] font-bold text-indigo-500/40 uppercase tracking-[0.3em] text-center italic leading-relaxed">
                Trascina qui le tue magie
              </span>
              <div className="w-1 h-1 bg-indigo-500/20 rounded-full group-hover:w-12 transition-all" />
            </div>
          ) : (
            myPermanents.map(obj => <CardElement key={obj.id} obj={obj} />)
          )}
        </div>

        <div className="flex items-center gap-8">
          <div className="text-center font-black uppercase tracking-[0.2em] italic text-indigo-500 text-xs">Giocatore</div>
          <div className="bg-indigo-600 px-6 py-3 rounded-3xl border border-indigo-400/30 flex items-center gap-4 shadow-2xl shadow-indigo-600/40">
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-white animate-pulse" />
              <span className="text-4xl font-black italic tracking-tighter">{me?.life ?? 20}</span>
            </div>
          </div>
          {/* MANA POOL */}
          <div className="flex gap-2 bg-slate-900/50 p-2 rounded-full border border-white/5">
            {['W', 'U', 'B', 'R', 'G', 'C'].map(c => {
              const amount = (me?.manaPool as any)?.[c] || 0;
              return (
                <div key={c} className={`w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${amount > 0 ? 'bg-indigo-500 text-white shadow-lg' : 'bg-slate-800 text-slate-600 opacity-20'}`}>
                  {amount > 0 ? amount : c}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
