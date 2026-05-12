
import { useState } from 'react';
import { Home, Key, ArrowRight, Loader2, AlertCircle, ClipboardPaste } from 'lucide-react';
import { PageLayout } from '../../components/shared/PageLayout';

interface JoinRoomProps {
  onBack: () => void;
  onJoin: (roomCode: string, playerName: string) => void;
  error?: string | null;
  loading?: boolean;
}

export const JoinRoom = ({ onBack, onJoin, error, loading }: JoinRoomProps) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState(localStorage.getItem('mtg_player_name') || 'Giocatore');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6 && name.trim()) {
      localStorage.setItem('mtg_player_name', name);
      onJoin(code.toUpperCase(), name);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const cleaned = text.trim().toUpperCase().substring(0, 6);
      if (cleaned) setCode(cleaned);
    } catch (err) {
      console.error('Failed to read clipboard', err);
    }
  };

  return (
    <PageLayout variant="emerald" className="flex items-center justify-center p-[clamp(1rem,4vw,3rem)] selection:bg-emerald-500/30 overflow-hidden">
      <div className="relative z-10 w-full max-w-[clamp(18rem,85vw,450px)] flex flex-col items-center justify-center gap-[clamp(2rem,6vh,4rem)] animate-in zoom-in-95 slide-in-from-bottom-10 duration-1000">

        {/* Header - Fluid Proportions */}
        <div className="text-center flex flex-col items-center gap-[clamp(1rem,3vh,2rem)] shrink-0">
          <div className="inline-flex w-[clamp(4rem,10vw,6rem)] h-[clamp(4rem,10vw,6rem)] bg-emerald-500/10 rounded-[clamp(1.5rem,3vw,2.5rem)] border border-emerald-500/20 items-center justify-center text-emerald-500 shadow-2xl shadow-emerald-500/10 shrink-0">
            <Key className="w-[50%] h-[50%]" />
          </div>
          <div className="space-y-[clamp(0.25rem,0.5vh,0.75rem)] text-center">
            <h2 className="text-[clamp(2rem,6vw,3.5rem)] font-black text-white uppercase tracking-tighter italic leading-none">
              Join <span className="text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">Draft</span>
            </h2>
          </div>
        </div>

        {/* Form - Premium Inputs */}
        <form onSubmit={handleJoin} className="w-full space-y-[clamp(1rem,2.5vh,2rem)]">
          <div className="space-y-[clamp(0.5rem,1vh,0.75rem)]">
            <label className="text-[clamp(9px,1vw,11px)] font-black text-emerald-400/80 uppercase tracking-[0.2em] ml-4 italic">Your Name</label>
            <input
              type="text"
              maxLength={15}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full bg-slate-900/60 backdrop-blur-md border-2 border-white/5 text-white px-[clamp(1rem,2vw,1.5rem)] py-[clamp(1rem,2vh,1.25rem)] rounded-[clamp(1rem,2vw,1.5rem)] outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold placeholder:text-slate-700 text-[clamp(12px,1.2vw,14px)]"
              required
            />
          </div>

          <div className="space-y-[clamp(0.5rem,1vh,0.75rem)]">
            <label className="text-[clamp(9px,1vw,11px)] font-black text-emerald-400/80 uppercase tracking-[0.2em] ml-4 italic">Room Code</label>
            <div className="relative group/code">
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="xxxxxx"
                className="w-full bg-slate-900/60 backdrop-blur-md border-2 border-white/5 text-white text-center text-[clamp(1.5rem,4vw,2.5rem)] tracking-[0.3em] px-[clamp(1rem,2vw,1.5rem)] py-[clamp(1.25rem,2.5vh,1.75rem)] rounded-[clamp(1rem,2vw,1.5rem)] outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all font-black placeholder:text-slate-800 uppercase pr-[clamp(3.5rem,8vw,4.5rem)]"
                required
              />
              <button
                type="button"
                onClick={handlePaste}
                className="absolute right-[clamp(0.5rem,1vw,0.75rem)] top-1/2 -translate-y-1/2 p-[clamp(0.5rem,1vw,0.75rem)] bg-slate-800/80 hover:bg-emerald-600 text-slate-400 hover:text-white rounded-[clamp(0.5rem,1vw,0.75rem)] transition-all border border-white/5 active:scale-90 shadow-xl"
                title="Incolla dagli appunti"
              >
                <ClipboardPaste className="w-[clamp(16px,1.8vw,22px)] h-[clamp(16px,1.8vw,22px)]" />
              </button>
            </div>
          </div>

          {error && (
            <div className="p-[clamp(0.75rem,2vh,1rem)] bg-red-500/10 border border-red-500/20 rounded-[clamp(0.75rem,1vw,1rem)] flex items-center gap-3 animate-in shake duration-500">
              <AlertCircle className="w-[clamp(14px,1.5vw,18px)] h-[clamp(14px,1.5vw,18px)] text-red-500 shrink-0" />
              <p className="text-[clamp(9px,1vw,11px)] font-bold text-red-400 uppercase tracking-tight">{error}</p>
            </div>
          )}

          <div className="pt-[clamp(0.5rem,2vh,1rem)] flex gap-[clamp(0.5rem,1.5vw,1rem)]">
            <button
              type="button"
              onClick={onBack}
              className="p-[clamp(1.25rem,2.5vw,1.75rem)] bg-slate-900/60 backdrop-blur-xl hover:bg-slate-800 text-slate-500 hover:text-white rounded-[clamp(1rem,2vw,1.5rem)] border border-white/10 transition-all shadow-xl group active:scale-95 flex items-center justify-center shrink-0"
            >
              <Home className="w-[clamp(1.25rem,2vw,1.75rem)] h-[clamp(1.25rem,2vw,1.75rem)] group-hover:scale-110 transition-transform" />
            </button>

            <button
              type="submit"
              disabled={loading || code.length < 6 || !name.trim()}
              className={`flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800/50 disabled:text-slate-700 text-white rounded-[clamp(1rem,2vw,1.5rem)] font-black uppercase tracking-[0.2em] text-[clamp(9px,1.2vw,11px)] flex items-center justify-center gap-3 transition-all active:scale-[0.98] group whitespace-nowrap overflow-hidden ${loading || code.length < 6 || !name.trim() ? 'shadow-none' : 'shadow-2xl shadow-emerald-600/30'}`}
            >
              {loading ? <Loader2 className="w-[clamp(14px,1.8vw,20px)] h-[clamp(14px,1.8vw,20px)] animate-spin" /> : <> Join Lobby <ArrowRight className="w-[clamp(14px,1.8vw,20px)] h-[clamp(14px,1.8vw,20px)] group-hover:translate-x-2 transition-transform duration-500" /></>}
            </button>
          </div>
        </form>

      </div>
    </PageLayout>
  );
};
