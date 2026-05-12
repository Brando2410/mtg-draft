
import { useState, useEffect } from 'react';
import { Clock, Users, ChevronRight, X, LayoutPanelLeft, Trash2 } from 'lucide-react';
import { DeckReviewView } from '../deck-builder/DeckReviewView';
import { LimitedEventOver } from '../game/modals/LimitedEventOver';
import { TournamentBracket } from '../lobby/TournamentBracket';
import { useDraftStore } from '../../store/useDraftStore';

interface DraftRecord {
  id: string;
  roomId: string;
  date: string;
  cubeName: string;
  playerPool: any[];
  playerCount: number;
  stats: any;
  type?: 'draft' | 'tournament';
  roomSnapshot?: any;
}

interface DraftHistoryProps {
  onBack: () => void;
}

export const DraftHistory = ({ onBack }: DraftHistoryProps) => {
  const [history, setHistory] = useState<DraftRecord[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<DraftRecord | null>(null);
  const [showBracket, setShowBracket] = useState(false);
  const { playerId } = useDraftStore();

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
    if (selectedDraft.type === 'tournament' && selectedDraft.roomSnapshot) {
      if (showBracket) {
        return (
          <TournamentBracket 
            room={selectedDraft.roomSnapshot}
            playerId={playerId || ''}
            onBack={() => setShowBracket(false)}
            onEditDeck={() => setShowBracket(false)}
          />
        );
      }
      return (
        <LimitedEventOver 
          room={selectedDraft.roomSnapshot}
          playerId={playerId || ''}
          onBack={() => setSelectedDraft(null)}
          onViewTournament={() => setShowBracket(true)}
        />
      );
    }

    return (
      <DeckReviewView
        pool={selectedDraft.playerPool}
        onClose={() => setSelectedDraft(null)}
        onPoolUpdate={() => { }} // Sola lettura
        onUpdatePool={() => { }}
        timeLeft={null}
        isPaused={false}
        isHost={false}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[150] bg-slate-950 flex flex-col items-center p-[clamp(1rem,4vw,3rem)] animate-in fade-in duration-700 overflow-y-auto selection:bg-indigo-500/30 custom-scrollbar">
      <div className="w-full max-w-[clamp(18rem,95vw,1000px)] space-y-[clamp(2rem,6vh,4rem)]">
        {/* Header - Fluid Proportions */}
        <div className="flex items-center justify-between py-[clamp(2rem,4vh,3rem)] border-b border-white/5">
          <div className="flex flex-col space-y-[clamp(0.25rem,0.5vw,0.5rem)]">
            <h2 className="text-[clamp(2rem,6vw,4.5rem)] font-black text-white uppercase tracking-tighter italic leading-none">
              Storico <span className="text-indigo-500 drop-shadow-[0_0_15px_rgba(79,70,229,0.3)]">Eventi</span>
            </h2>
            <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[clamp(8px,1vw,11px)] ml-1 opacity-60">Cronologia delle tue battaglie passate</p>
          </div>
          <button
            onClick={onBack}
            className="p-[clamp(1rem,2vw,1.5rem)] bg-slate-900/60 backdrop-blur-xl hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-[clamp(1rem,1.5vw,2rem)] border border-white/10 transition-all shadow-2xl active:scale-90"
          >
            <X className="w-[clamp(1.25rem,2vw,1.75rem)] h-[clamp(1.25rem,2vw,1.75rem)]" />
          </button>
        </div>

        {history.length === 0 ? (
          <div className="py-[clamp(5rem,15vh,10rem)] text-center space-y-8 opacity-40">
            <div className="w-[clamp(4rem,10vw,6rem)] h-[clamp(4rem,10vw,6rem)] bg-slate-900/50 rounded-full flex items-center justify-center mx-auto border border-white/10 shadow-2xl">
              <Clock className="w-[50%] h-[50%] text-slate-500" />
            </div>
            <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-[clamp(9px,1.2vw,11px)]">Nessuna draft conclusa trovata.</p>
          </div>
        ) : (
          <div className="grid gap-[clamp(1rem,2vw,1.5rem)] pb-10">
            {history.map((record) => (
              <div
                key={record.id}
                onClick={() => setSelectedDraft(record)}
                className="group relative flex flex-col sm:flex-row items-center justify-between p-[clamp(1.5rem,3vw,2.5rem)] bg-slate-900/40 backdrop-blur-md hover:bg-slate-900 border border-white/5 hover:border-indigo-500/30 rounded-[clamp(1.5rem,2.5vw,3rem)] transition-all duration-500 cursor-pointer overflow-hidden shadow-3xl hover:-translate-y-1 active:scale-[0.99]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/0 via-indigo-600/0 to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="flex items-center gap-[clamp(1.5rem,3vw,2.5rem)] w-full sm:w-auto relative z-10">
                  {/* Data Badge - Premium Design */}
                  <div className="w-[clamp(3.5rem,8vw,4.5rem)] h-[clamp(3.5rem,8vw,4.5rem)] rounded-[clamp(1rem,2vw,1.5rem)] bg-slate-950/80 border border-white/10 flex flex-col items-center justify-center shrink-0 shadow-inner group-hover:border-indigo-500/30 transition-colors">
                    <span className="text-[clamp(14px,1.5vw,18px)] font-black text-indigo-400 uppercase leading-none mb-1">
                      {new Date(record.date).toLocaleDateString('it-IT', { day: '2-digit' })}
                    </span>
                    <span className="text-[clamp(8px,0.8vw,10px)] font-bold text-slate-500 uppercase leading-none tracking-widest">
                      {new Date(record.date).toLocaleDateString('it-IT', { month: 'short' })}
                    </span>
                  </div>

                  <div className="flex flex-col text-left space-y-[clamp(0.25rem,0.5vh,0.5rem)]">
                    <div className="flex items-center gap-3">
                      <h3 className="text-[clamp(1.25rem,3vw,2rem)] font-black text-white uppercase tracking-tighter truncate max-w-[200px] sm:max-w-md group-hover:text-indigo-400 transition-colors italic leading-none">{record.cubeName}</h3>
                      {record.type === 'tournament' && (
                        <span className="px-[clamp(0.5rem,1vw,0.75rem)] py-[clamp(0.2rem,0.4vh,0.25rem)] bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-[clamp(0.25rem,0.5vw,0.5rem)] text-[clamp(8px,0.8vw,10px)] font-black uppercase tracking-[0.2em] shadow-lg shadow-amber-500/10 animate-pulse">Torneo</span>
                      )}
                    </div>
                    <div className="flex items-center gap-[clamp(1rem,2vw,1.5rem)] opacity-40 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-2">
                        <LayoutPanelLeft className="w-[clamp(12px,1.2vw,14px)] h-[clamp(12px,1.2vw,14px)] text-slate-400" />
                        <span className="text-[clamp(8px,1vw,10px)] font-bold text-slate-400 uppercase tracking-widest">{record.playerPool.length} Cards</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-[clamp(12px,1.2vw,14px)] h-[clamp(12px,1.2vw,14px)] text-slate-400" />
                        <span className="text-[clamp(8px,1vw,10px)] font-bold text-slate-400 uppercase tracking-widest">{record.playerCount} Players</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-[clamp(0.75rem,2vw,1.5rem)] mt-[clamp(1.5rem,3vh,0rem)] w-full sm:w-auto relative z-10">
                  <button
                    onClick={(e) => deleteRecord(record.id, e)}
                    className="p-[clamp(0.75rem,1.5vw,1rem)] hover:bg-red-500/10 text-slate-600 hover:text-red-500 rounded-[clamp(0.75rem,1vw,1.25rem)] transition-all border border-transparent hover:border-red-500/20 active:scale-90"
                    title="Elimina"
                  >
                    <Trash2 className="w-[clamp(14px,1.5vw,18px)] h-[clamp(14px,1.5vw,18px)]" />
                  </button>
                  <div className="flex-1 sm:flex-none">
                    <button 
                      onClick={() => setSelectedDraft(record)}
                      className="w-full sm:w-auto px-[clamp(1.5rem,3vw,2.5rem)] py-[clamp(0.75rem,1.5vh,1.25rem)] bg-indigo-500/10 group-hover:bg-indigo-600 text-indigo-400 group-hover:text-white rounded-[clamp(0.75rem,1.5vw,1.25rem)] font-black uppercase tracking-[0.2em] text-[clamp(9px,1vw,11px)] flex items-center justify-center gap-3 transition-all shadow-xl hover:scale-105"
                    >
                      {record.type === 'tournament' ? 'Visualizza Risultati' : 'Visualizza Mazzo'}
                      <ChevronRight className="w-[clamp(14px,1.5vw,18px)] h-[clamp(14px,1.5vw,18px)] translate-x-0 group-hover:translate-x-1.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
};
