import { useState, useEffect } from 'react';
import { Clock, Users, ChevronRight, X, LayoutPanelLeft, Trash2 } from 'lucide-react';
import { DeckReviewView } from './DeckReviewView';

interface DraftRecord {
  id: string;
  roomId: string;
  date: string;
  cubeName: string;
  playerPool: any[];
  playerCount: number;
  stats: any;
}

interface DraftHistoryProps {
  onBack: () => void;
}

export const DraftHistory = ({ onBack }: DraftHistoryProps) => {
  const [history, setHistory] = useState<DraftRecord[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<DraftRecord | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('mtg_draft_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing history:', e);
      }
    }
  }, []);

  const deleteRecord = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.prompt('Per eliminare questa draft scrivi "ELIMINA":');
    if (confirmed === 'ELIMINA') {
      const updated = history.filter(r => r.id !== id);
      setHistory(updated);
      localStorage.setItem('mtg_draft_history', JSON.stringify(updated));
    }
  };

  if (selectedDraft) {
    return (
      <DeckReviewView 
        pool={selectedDraft.playerPool}
        onClose={() => setSelectedDraft(null)}
        onPoolUpdate={() => {}} // Sola lettura
        onUpdatePool={() => {}}
        timeLeft={null}
        isPaused={false}
        isHost={false}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[150] bg-slate-950 flex flex-col items-center p-4 sm:p-10 animate-in fade-in duration-500 overflow-y-auto">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-12 sm:mb-20">
           <div className="flex flex-col">
              <h2 className="text-4xl sm:text-6xl font-black text-white uppercase tracking-tighter italic">Storico <span className="text-indigo-500">Draft</span></h2>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">I tuoi mazzi scolpiti nella pietra</p>
           </div>
           <button 
             onClick={onBack}
             className="p-4 bg-slate-900 hover:bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all border border-white/5 active:scale-90"
           >
             <X className="w-6 h-6" />
           </button>
        </div>

        {history.length === 0 ? (
          <div className="py-20 text-center space-y-6 opacity-40">
             <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto border border-white/5">
                <Clock className="w-10 h-10 text-slate-500" />
             </div>
             <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Nessuna draft conclusa trovata.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {history.map((record) => (
              <div 
                key={record.id}
                onClick={() => setSelectedDraft(record)}
                className="group relative flex flex-col sm:flex-row items-center justify-between p-6 bg-slate-900/40 hover:bg-slate-900 border border-white/5 hover:border-indigo-500/30 rounded-3xl transition-all cursor-pointer overflow-hidden shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/0 via-indigo-600/0 to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-center gap-6 w-full sm:w-auto relative z-10">
                   {/* Data Badge */}
                   <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-white/5 flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] font-black text-indigo-400 uppercase leading-none mb-1">
                        {new Date(record.date).toLocaleDateString('it-IT', { day: '2-digit' })}
                      </span>
                      <span className="text-[8px] font-bold text-slate-500 uppercase leading-none">
                        {new Date(record.date).toLocaleDateString('it-IT', { month: 'short' })}
                      </span>
                   </div>
                   
                   <div className="flex flex-col text-left">
                      <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter truncate max-w-[200px] sm:max-w-xs">{record.cubeName}</h3>
                      <div className="flex items-center gap-4 mt-1">
                         <div className="flex items-center gap-1.5 opacity-60">
                            <LayoutPanelLeft className="w-3 h-3 text-slate-400" />
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{record.playerPool.length} Carte</span>
                         </div>
                         <div className="flex items-center gap-1.5 opacity-60">
                            <Users className="w-3 h-3 text-slate-400" />
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{record.playerCount} Giocatori</span>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-3 mt-6 sm:mt-0 w-full sm:w-auto relative z-10">
                   <button 
                      onClick={(e) => deleteRecord(record.id, e)}
                      className="p-3 hover:bg-red-500/10 text-slate-600 hover:text-red-500 rounded-xl transition-all border border-transparent hover:border-red-500/20"
                      title="Elimina"
                   >
                      <Trash2 className="w-4 h-4" />
                   </button>
                   <div className="flex-1 sm:flex-none">
                      <button className="w-full sm:w-auto px-6 py-3 bg-indigo-500/10 group-hover:bg-indigo-600 text-indigo-400 group-hover:text-white rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 transition-all">
                        Visualizza Mazzo
                        <ChevronRight className="w-4 h-4 translate-x-0 group-hover:translate-x-1 transition-transform" />
                      </button>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
