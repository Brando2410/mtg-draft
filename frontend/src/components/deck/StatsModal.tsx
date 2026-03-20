import React from 'react';
import { X } from 'lucide-react';

interface StatsModalProps {
  stats: {
    creatures: number;
    nonCreatures: number;
    manaCurve: number[];
    colorSymbols: Record<string, number>;
    colorPercentages: Record<string, string>;
    avgCmc: string;
  };
  onClose: () => void;
  manaSymbols: Record<string, string>;
}

export const StatsModal: React.FC<StatsModalProps> = ({ stats, onClose, manaSymbols }) => (
  <div className="fixed inset-0 z-[600] flex items-center justify-center p-2 sm:p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}>
    <div className="relative w-full max-w-xl sm:landscape:max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl sm:rounded-[3rem] shadow-2xl h-auto max-h-[95vh]" onClick={e => e.stopPropagation()}>
      <button 
        onClick={onClose} 
        className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 p-3 sm:p-4 bg-slate-800 hover:bg-red-500/20 hover:text-red-500 rounded-full transition-all z-[700] shadow-2xl border border-white/10 group active:scale-90"
      >
        <X className="w-4 h-4 sm:w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
      </button>
      
      <div className="p-6 sm:p-10 flex flex-col sm:landscape:flex-row gap-6 sm:landscape:gap-10 overflow-y-auto max-h-[90vh] custom-scrollbar">
        {/* Colonna Sinistra / Superiore: Conteggi e Mana Curve */}
        <div className="flex-1 space-y-6 sm:space-y-10">
          {/* Conteggi Generiche */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="flex items-center justify-between bg-slate-950/40 px-4 sm:px-5 py-3 sm:py-4 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-orange-500 rounded-sm shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
                <span className="text-white font-black uppercase text-[8px] sm:text-[10px] tracking-widest leading-none">Creatures</span>
              </div>
              <span className="text-xl sm:text-2xl font-black text-white">{stats.creatures}</span>
            </div>
            <div className="flex items-center justify-between bg-slate-950/40 px-4 sm:px-5 py-3 sm:py-4 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-sky-500 rounded-sm shadow-[0_0_8px_rgba(14,165,233,0.4)]" />
                <span className="text-white font-black uppercase text-[8px] sm:text-[10px] tracking-widest leading-none">Non-Creatures</span>
              </div>
              <span className="text-xl sm:text-2xl font-black text-white">{stats.nonCreatures}</span>
            </div>
          </div>
          
          {/* Mana Curve */}
          <div className="flex items-end justify-between h-24 sm:h-32 bg-slate-950/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-800/50 gap-1 sm:gap-2">
            {stats.manaCurve.map((count: number, i: number) => {
              const max = Math.max(...stats.manaCurve, 1);
              const height = (count / max) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group/col">
                  <div 
                    className="w-full bg-indigo-500 rounded-t-sm sm:rounded-t-md transition-all duration-1000 ease-out origin-bottom animate-in slide-in-from-bottom relative flex flex-col items-center justify-start pt-1" 
                    style={{ height: `${height}%`, minHeight: count > 0 ? '2px' : '0' }} 
                  >
                    {count > 0 && (
                      <span className={`text-[7px] sm:text-[9px] font-black text-white drop-shadow-md transition-opacity duration-500 ${height < 20 ? 'absolute -top-4 text-slate-400' : ''}`}>
                        {count}
                      </span>
                    )}
                  </div>
                  <span className="text-[7px] sm:text-[9px] font-black text-slate-600 leading-none mt-1">{i}{i === 8 ? '+' : ''}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Colonna Destra / Inferiore: Avg CMC e Colori */}
        <div className="flex flex-col sm:landscape:w-64 gap-6 sm:landscape:gap-8 justify-center sm:landscape:border-l sm:landscape:border-white/5 sm:landscape:pl-10">
          <div className="text-center bg-slate-950/30 p-4 rounded-2xl border border-slate-800 flex-1 sm:landscape:flex-none">
            <span className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Avg CMC</span>
            <div className="text-3xl sm:text-4xl text-white font-black tracking-tighter mt-1">{stats.avgCmc}</div>
          </div>
          <div className="grid grid-cols-5 sm:landscape:grid-cols-2 gap-2 flex-[2] sm:landscape:flex-none">
            {['W','U','B','R','G'].map(c => (
              <div key={c} className="flex flex-col sm:landscape:flex-row items-center justify-center gap-2 p-2 sm:p-3 bg-slate-950/40 rounded-xl sm:rounded-2xl border border-slate-800/30">
                <img src={manaSymbols[c]} alt={c} className="w-4 h-4 sm:w-6 sm:h-6 opacity-80" />
                <div className="flex flex-col items-center">
                  <span className="text-xs sm:text-sm font-black text-white">{stats.colorPercentages[c]}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);
