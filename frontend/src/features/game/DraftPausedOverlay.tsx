import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PauseCircle, LayoutPanelLeft, PlayCircle } from 'lucide-react';
import type { Room } from '@shared/types';

interface DraftPausedOverlayProps {
  room: Room;
  playerId: string | null;
  onOpenReview: () => void;
  onResume: () => void;
}

export const DraftPausedOverlay: React.FC<DraftPausedOverlayProps> = ({
  room,
  playerId,
  onOpenReview,
  onResume
}) => {
  const isHost = room.hostPlayerId === playerId;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[800] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl w-full h-full p-6"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-2xl landscape:max-w-5xl flex flex-col landscape:flex-row items-center justify-center gap-12 landscape:gap-12 space-y-6 landscape:space-y-0"
      >
        {/* AREA MESSAGGIO */}
        <div className="flex flex-col items-center justify-center text-center space-y-6 landscape:flex-1 shrink-0">
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <PauseCircle className="w-20 h-20 landscape:w-24 landscape:h-24 text-amber-500 mx-auto" />
          </motion.div>
          
          <div className="space-y-2">
            <h2 className="text-4xl sm:text-6xl font-black text-white uppercase tracking-tighter">Partita in <span className="text-amber-500">Pausa</span></h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] sm:text-sm max-w-md mx-auto leading-relaxed">
              La draft è stata sospesa. Le carte e il timer sono bloccati per tutti i partecipanti.
            </p>
          </div>
        </div>

        {/* AREA AZIONI E GIOCATORI */}
        <div className="flex flex-col items-center gap-6 landscape:gap-6 landscape:flex-1 w-full max-w-md">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full bg-slate-900/60 border border-indigo-500/20 rounded-3xl p-4 flex flex-col gap-2 shadow-inner min-h-0"
          >
            <div className="flex items-center justify-between mb-2 px-2 shrink-0">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stato Giocatori</h3>
              <span className="text-[8px] font-black text-indigo-400/80 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">Lobby Globale</span>
            </div>
            
            <div className="flex flex-col gap-1.5 max-h-[35vh] landscape:max-h-[30vh] overflow-y-auto pr-1 custom-scrollbar shrink min-h-0">
              <AnimatePresence mode="popLayout">
                {room.players.map((p, idx) => (
                  <motion.div 
                    key={p.playerId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.05 }}
                    className="flex items-center justify-between px-4 py-2.5 bg-slate-950/60 rounded-xl border border-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-slate-700 bg-slate-800 shrink-0">
                        <img src={`/avatars/${p.avatar || 'ajani.png'}`} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[11px] font-black text-white uppercase tracking-tight">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${p.online ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-600'}`} />
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{p.online ? 'Connesso' : 'Disconnesso'}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
            <button 
              onClick={onOpenReview}
              className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 transition-all border border-white/5 shadow-xl active:scale-95 group"
            >
              VEDI MAZZO <LayoutPanelLeft className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
            </button>

            {isHost && (
              <button 
                onClick={onResume}
                className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 transition-all shadow-xl shadow-amber-600/20 active:scale-95 group"
              >
                RIPRENDI DRAFT <PlayCircle className="w-5 h-5 fill-current" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
