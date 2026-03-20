import { useState, useMemo } from 'react';
import { ArrowRightLeft, ChevronLeft, ChevronRight, Split, MoveVertical, LayoutGrid, Clock, Activity, PauseCircle } from 'lucide-react';
import type { SimplifiedCard } from '../services/scryfall';

interface DeckReviewProps {
  pool: SimplifiedCard[];
  onClose: () => void;
  onUpdatePool: (newPool: SimplifiedCard[]) => void;
  onPoolUpdate?: (main: SimplifiedCard[], side: SimplifiedCard[]) => void;
  timeLeft?: number | null;
  isPaused?: boolean;
  isHost?: boolean;
  onTogglePause?: () => void;
}

export const DeckReviewView = ({ 
  pool, 
  onClose, 
  onUpdatePool, 
  onPoolUpdate, 
  timeLeft, 
  isPaused, 
  isHost, 
  onTogglePause
}: DeckReviewProps) => {
  // Cerchiamo di distinguere main e side dal pool se possibile, o iniziamo col pool nel main
  // Per ora, assumiamo che tutto il pool arrivi inizialmente come "deck"
  const [mainboard, setMainboard] = useState<SimplifiedCard[]>(pool);
  const [sideboard, setSideboard] = useState<SimplifiedCard[]>([]);
  const [draggedCardIndex, setDraggedCardIndex] = useState<{ index: number, source: 'main' | 'side' } | null>(null);
  const [isSideboardCollapsed, setIsSideboardCollapsed] = useState(false);
  const [separateByType, setSeparateByType] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  // Raggruppiamo le carte per CMC e per Tipo
  const columns = useMemo(() => {
    const cols: Record<number, { creatures: SimplifiedCard[], others: SimplifiedCard[], all: SimplifiedCard[] }> = {};
    for (let i = 0; i <= 6; i++) cols[i] = { creatures: [], others: [], all: [] };

    mainboard.forEach(card => {
      const cmc = Math.min(card.cmc, 6);
      const isCreature = card.type_line?.toLowerCase().includes('creature');
      if (isCreature) cols[cmc].creatures.push(card);
      else cols[cmc].others.push(card);
      cols[cmc].all.push(card);
    });
    return cols;
  }, [mainboard]);

  // 📊 Calcolo Statistiche basato SOLO sulla MAINBOARD
  const stats = useMemo(() => {
    const creatures = mainboard.filter((c: any) => c.type_line?.toLowerCase().includes('creature')).length;
    const nonCreatures = mainboard.length - creatures;
    const manaCurve = new Array(9).fill(0); // 0, 1, 2, 3, 4, 5, 6, 7, 8+
    
    mainboard.forEach((c: any) => {
      const cmc = Math.floor(c.cmc || 0);
      const idx = Math.min(cmc, 8);
      manaCurve[idx]++;
    });

    const colorSymbols: Record<string, number> = { W: 0, U: 0, B: 0, R: 0, G: 0 };
    let totalColorSymbols = 0;

    mainboard.forEach((c: any) => {
      const manaCost = c.mana_cost || "";
      const matches = manaCost.match(/\{([^}]+)\}/g) || [];
      matches.forEach((sym: string) => {
         const s = sym.replace(/[{}]/g, '');
         // Gestisce simboli base e hybrid semplici
         ['W','U','B','R','G'].forEach(col => {
            if (s.includes(col)) {
               colorSymbols[col]++;
               totalColorSymbols++;
            }
         });
      });
    });

    const colorPercentages: Record<string, string> = { W: "0", U: "0", B: "0", R: "0", G: "0" };
    if (totalColorSymbols > 0) {
       Object.keys(colorSymbols).forEach(col => {
          colorPercentages[col] = ((colorSymbols[col] / totalColorSymbols) * 100).toFixed(1);
       });
    }

    const totalCmc = mainboard.reduce((acc: number, c: any) => acc + (c.cmc || 0), 0);
    const avgCmc = mainboard.length > 0 ? (totalCmc / mainboard.length).toFixed(1) : "0.0";
    
    return { creatures, nonCreatures, manaCurve, colorSymbols, colorPercentages, avgCmc };
  }, [mainboard]);

  const activeCmcs = useMemo(() => {
    return [0, 1, 2, 3, 4, 5, 6].filter(cmc => columns[cmc].all.length > 0);
  }, [columns]);

  // Sincronizza il pool totale con DraftPackView
  const syncPool = (newMain: SimplifiedCard[], newSide: SimplifiedCard[]) => {
    onUpdatePool([...newMain, ...newSide]);
    if (onPoolUpdate) onPoolUpdate(newMain, newSide);
  };

  // --- AZIONI SPOSTAMENTO ---
  const moveToSideboard = (index: number) => {
    const card = mainboard[index];
    const newMain = mainboard.filter((_, i) => i !== index);
    const newSide = [...sideboard, card];
    setMainboard(newMain);
    setSideboard(newSide);
    syncPool(newMain, newSide);
  };

  const moveToMainboard = (index: number) => {
    const card = sideboard[index];
    const newSide = sideboard.filter((_, i) => i !== index);
    const newMain = [...mainboard, card];
    setSideboard(newSide);
    setMainboard(newMain);
    syncPool(newMain, newSide);
  };

  const handleDragStart = (index: number, source: 'main' | 'side') => {
    setDraggedCardIndex({ index, source });
  };

  const handleDrop = (e: React.DragEvent, target: 'main' | 'side') => {
    e.preventDefault();
    if (!draggedCardIndex) return;

    if (draggedCardIndex.source === 'main' && target === 'side') {
      moveToSideboard(draggedCardIndex.index);
    } else if (draggedCardIndex.source === 'side' && target === 'main') {
      moveToMainboard(draggedCardIndex.index);
    }
    setDraggedCardIndex(null);
  };

  const renderManaSymbols = (manaCost: string) => {
    if (!manaCost) return <span className="text-[8px] text-slate-600 font-bold uppercase">No Cost</span>;
    // Pulisce la stringa e trova i simboli tra parentesi graffe
    const symbols = manaCost.match(/\{([^}]+)\}/g) || [];
    return (
      <div className="flex items-center gap-0.5">
        {symbols.map((sym, i) => {
          const s = sym.replace(/[{}]/g, '').replace('/', ''); // Gestisce simboli hybrid base es. {B/P} -> BP
          return (
            <img 
              key={i} 
              src={`https://svgs.scryfall.io/card-symbols/${s}.svg`} 
              alt={s} 
              className="w-3.5 h-3.5 drop-shadow shadow-black" 
            />
          );
        })}
      </div>
    );
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[500] bg-slate-950 flex flex-col animate-in fade-in duration-500 overflow-hidden font-sans pt-safe">
      
      {/* Header Deck Builder - Responsive high-density */}
      <div className="h-auto sm:h-16 flex flex-col sm:flex-row items-center justify-between px-3 sm:px-6 py-2 sm:py-0 bg-slate-900 border-b border-white/5 shadow-2xl z-20 gap-2">
         <div className="flex items-center justify-between w-full sm:w-auto gap-4">
            <div className="flex items-center gap-3">
               <h2 className="text-base sm:text-xl font-black text-white uppercase tracking-tighter leading-none">Revisiona</h2>
               {isPaused && (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg animate-pulse">
                     <PauseCircle className="w-2.5 h-2.5 text-amber-500" />
                     <span className="text-[7px] sm:text-[9px] font-black text-amber-500 uppercase tracking-widest leading-none">Pausa</span>
                  </div>
               )}
            </div>
            
            <div className="flex items-center gap-2">
               <button 
                 onClick={() => setSeparateByType(!separateByType)}
                 className={`flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[7px] sm:text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 ${
                   separateByType ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-500/20' : 'bg-slate-800 text-slate-500 border-slate-700/50 hover:text-white'
                 }`}
               >
                 <Split className="w-3 h-3" />
                 <span>{separateByType ? 'Separa' : 'Stack'}</span>
               </button>
               
               <button 
                 onClick={() => setIsStatsOpen(true)}
                 className="flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-slate-950/40 hover:bg-slate-800 text-indigo-400 hover:text-white rounded-lg border border-white/5 transition-all shadow-inner group shrink-0"
               >
                 <Activity className="w-3 h-3 group-hover:scale-110 transition-transform" />
                 <span className="text-[7px] sm:text-[10px] font-black uppercase tracking-widest">Stats</span>
               </button>
            </div>
         </div>

         <div className="flex items-center justify-between w-full sm:w-auto gap-3 sm:gap-6 border-t border-white/5 sm:border-0 pt-2 sm:pt-0">
            {timeLeft !== null && timeLeft !== undefined && (
               <div className="flex items-center gap-2 px-3 py-1 bg-slate-950/60 rounded-xl border border-white/5 shadow-inner">
                  <Clock className={`w-3 h-3 ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-slate-500'}`} />
                  <span className={`text-sm sm:text-lg font-black tabular-nums tracking-tighter ${timeLeft <= 10 ? 'text-red-500 font-black' : 'text-white/90'}`}>
                    {formatTime(timeLeft)}
                  </span>
               </div>
            )}
            
            <div className="flex items-center gap-2 grow sm:grow-0 justify-end">
               {isPaused && isHost && (
                  <button 
                    onClick={onTogglePause}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[7px] sm:text-[9px] font-black uppercase rounded-lg transition-all active:scale-95 shadow-lg shadow-amber-500/20"
                  >
                    Riprendi
                  </button>
               )}
               <button 
                 onClick={onClose} 
                 className="px-5 sm:px-8 py-1.5 sm:py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-[8px] sm:text-[10px] tracking-widest rounded-lg transition-all shadow-xl active:scale-95 border border-indigo-400/20"
               >
                 {timeLeft === null ? 'Torna alla Home' : 'Chiudi'}
               </button>
            </div>
         </div>
      </div>

      {/* Main Builder Area */}
      <div className="flex-1 flex overflow-hidden relative">
         
         {/* Grid Principale - Mainboard */}
         <div 
           className="flex-1 overflow-x-auto overflow-y-hidden p-6 sm:p-10 flex gap-6 sm:gap-8 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/40 via-slate-950 to-slate-950 scrollbar-thin"
           onDragOver={e => e.preventDefault()}
           onDrop={(e) => handleDrop(e, 'main')}
         >
            {activeCmcs.map(cmc => (
               <div key={cmc} className="flex-1 min-w-[150px] max-w-[200px] flex flex-col gap-6">
                  <div className="h-12 flex flex-col items-center justify-center font-black text-slate-600 bg-slate-900/40 rounded-2xl uppercase text-[9px] tracking-widest border border-white/5 shadow-inner">
                     <span>Costo {cmc}{cmc === 6 ? '+' : ''}</span>
                  </div>
                  
                  <div className="flex-1 flex flex-col gap-12">
                     <div className="relative flex-1">
                        {(separateByType ? columns[cmc].creatures : columns[cmc].all).map((card, i) => {
                           const idx = mainboard.findIndex(m => m === card);
                           return (
                             <div 
                                key={`${card.scryfall_id}-${i}`}
                                draggable
                                onDragStart={() => handleDragStart(idx, 'main')}
                                onClick={() => moveToSideboard(idx)}
                                className="absolute w-full aspect-[2.5/3.5] rounded-2xl overflow-hidden shadow-2xl border border-white/5 hover:ring-2 hover:ring-indigo-500 transition-all cursor-pointer group bg-slate-900 hover:scale-125 hover:!z-[100]"
                                style={{ top: `${i * (separateByType ? 28 : 45)}px`, zIndex: i }}
                             >
                                <img src={card.image_url} alt={card.name} className="w-full h-full object-cover transition-transform duration-500" />
                             </div>
                           );
                        })}
                     </div>

                     {separateByType && (
                        <div className="relative flex-1 pt-6 border-t border-slate-900">
                           {columns[cmc].others.map((card, i) => {
                              const idx = mainboard.findIndex(m => m === card);
                              return (
                                 <div 
                                   key={`${card.scryfall_id}-${i}`}
                                   draggable
                                   onDragStart={() => handleDragStart(idx, 'main')}
                                   onClick={() => moveToSideboard(idx)}
                                   className="absolute w-full aspect-[2.5/3.5] rounded-2xl overflow-hidden shadow-2xl border border-white/5 hover:ring-2 hover:ring-indigo-500 transition-all cursor-pointer group bg-slate-900 hover:scale-125 hover:!z-[100]"
                                   style={{ top: `${i * 28}px`, zIndex: i }}
                                 >
                                    <img src={card.image_url} alt={card.name} className="w-full h-full object-cover transition-transform duration-500" />
                                 </div>
                              );
                           })}
                        </div>
                     )}
                  </div>
               </div>
            ))}
            {activeCmcs.length === 0 && (
               <div className="flex-1 flex flex-col items-center justify-center opacity-20">
                  <LayoutGrid className="w-16 h-16 mb-6 text-slate-700" />
                  <p className="font-black uppercase tracking-[0.4em] text-xs text-slate-700">Tutto in Sideboard</p>
               </div>
            )}
         </div>

         {/* Sideboard Container */}
         <div 
           className={`relative bg-slate-900 border-l border-white/5 transition-all duration-700 ease-in-out flex flex-col shadow-2xl z-10 ${isSideboardCollapsed ? 'w-1 sm:w-14' : 'w-80'}`}
           onDragOver={e => e.preventDefault()}
           onDrop={(e) => handleDrop(e, 'side')}
         >
            <button 
               onClick={() => setIsSideboardCollapsed(!isSideboardCollapsed)}
               className={`absolute top-1/2 -translate-y-1/2 flex items-center justify-center transition-all shadow-2xl z-20 ${
                 isSideboardCollapsed 
                   ? '-left-5' 
                   : '-left-6'
               } w-8 h-12 bg-slate-900 border-l border-y border-white/10 rounded-l-2xl text-white hover:bg-slate-800`}
            >
               {isSideboardCollapsed ? <ChevronLeft className="w-5 h-5 ml-1" /> : <ChevronRight className="w-5 h-5 ml-1" />}
            </button>

            {!isSideboardCollapsed && (
               <div className="p-8 border-b border-white/5 flex items-center justify-between shrink-0">
                  <h3 className="font-black text-white uppercase text-sm tracking-widest">Sideboard</h3>
                  <div className="px-4 py-1.5 bg-slate-950 rounded-full text-indigo-400 font-black text-[12px] border border-white/5 shadow-inner">{sideboard.length}</div>
               </div>
            )}

            <div className={`flex-1 overflow-y-auto custom-scrollbar p-5 space-y-3 transition-opacity duration-300 ${isSideboardCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                {sideboard.map((card, i) => (
                   <div 
                     key={i}
                     draggable
                     onDragStart={() => handleDragStart(i, 'side')}
                     onClick={() => moveToMainboard(i)}
                     className="relative h-14 rounded-2xl overflow-hidden border border-white/5 group bg-slate-950/80 shadow-xl flex items-center px-4 hover:border-indigo-500/50 transition-all cursor-pointer"
                   >
                     <img src={card.image_url} alt={card.name} className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale group-hover:grayscale-0 group-hover:opacity-60 transition-all pointer-events-none" />
                     <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent" />
                     
                     <div className="relative z-10 flex justify-between items-center w-full min-w-0 pr-6">
                        <span className="text-[10px] font-bold text-white truncate mr-3 drop-shadow-lg">{card.name}</span>
                        <div className="shrink-0 scale-90 sm:scale-100">
                           {renderManaSymbols(card.mana_cost)}
                        </div>
                     </div>
                     <ArrowRightLeft className="absolute right-4 w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                   </div>
                ))}
                 {sideboard.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-slate-800/40 rounded-[3rem] opacity-20 group-hover:opacity-40 transition-opacity">
                       <MoveVertical className="w-10 h-10 mb-4" />
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed">Trascina o clicca qui per svuotare il mazzo</p>
                    </div>
                 )}
             </div>
          </div>
       </div>
       
       {isStatsOpen && (
          <StatsModal 
            stats={stats} 
            onClose={() => setIsStatsOpen(false)} 
            manaSymbols={{
              'W': 'https://svgs.scryfall.io/card-symbols/W.svg',
              'U': 'https://svgs.scryfall.io/card-symbols/U.svg',
              'B': 'https://svgs.scryfall.io/card-symbols/B.svg',
              'R': 'https://svgs.scryfall.io/card-symbols/R.svg',
              'G': 'https://svgs.scryfall.io/card-symbols/G.svg',
            }}
          />
       )}
    </div>
  );
};

// Componente Locale per le Statistiche (usato sia in Draft che in Deck Review)
import { X } from 'lucide-react';

export const StatsModal = ({ stats, onClose, manaSymbols }: any) => (
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
