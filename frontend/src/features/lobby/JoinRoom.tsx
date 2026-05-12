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
      if (cleaned) {
        setCode(cleaned);
      }
    } catch (err) {
      console.error('Failed to read clipboard', err);
    }
  };

  return (
    <PageLayout variant="emerald" className="flex items-center justify-center p-6">
      <div className="relative z-10 w-full max-w-sm sm:max-w-md lg:max-w-sm flex flex-col items-center justify-center p-6 lg:p-0 gap-8 animate-in zoom-in-95 slide-in-from-bottom-6 duration-700">

        {/* Header */}
        <div className="text-center flex flex-col items-center gap-4 shrink-0">
          <div className="inline-flex w-16 h-16 bg-emerald-500/10 rounded-[2rem] border border-emerald-500/20 items-center justify-center text-emerald-500 mb-2 shrink-0">
            <Key className="w-8 h-8" />
          </div>
          <div className="space-y-1 text-center">
            <h2 className="text-4xl lg:text-4xl font-black text-white uppercase tracking-tighter italic whitespace-nowrap leading-none">Partecipa <span className="text-emerald-500">Draft</span></h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Inserisci il codice della stanza</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleJoin} className="w-full space-y-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">1. Il Tuo Nome</label>
            <input
              type="text"
              maxLength={15}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Es: Chandra"
              className="w-full bg-slate-900 border-2 border-white/5 text-white px-6 py-4 rounded-2xl outline-none focus:border-emerald-500/50 transition-all font-bold placeholder:text-slate-700 text-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">2. Codice Stanza</label>
            <div className="relative group/code">
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ABC-123"
                className="w-full bg-slate-900 border-2 border-white/5 text-white text-center text-2xl tracking-[0.3em] px-6 py-5 rounded-2xl outline-none focus:border-emerald-500/50 transition-all font-black placeholder:text-slate-700 uppercase pr-16"
                required
              />
              <button
                type="button"
                onClick={handlePaste}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all border border-white/5 active:scale-90 shadow-xl"
                title="Incolla dagli appunti"
              >
                <ClipboardPaste className="w-5 h-5" />
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 animate-in shake duration-500">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <p className="text-[10px] font-bold text-red-400 uppercase tracking-tight">{error}</p>
            </div>
          )}

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onBack}
              className="p-5 bg-slate-900/50 hover:bg-slate-800 text-slate-500 hover:text-white rounded-2xl border border-white/5 transition-all shadow-xl group active:scale-95 flex items-center justify-center shrink-0"
            >
              <Home className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>

            <button
              type="submit"
              disabled={loading || code.length < 6 || !name.trim()}
              className={`flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 transition-all active:scale-95 group whitespace-nowrap ${loading || code.length < 6 || !name.trim() ? 'shadow-none' : 'shadow-xl shadow-emerald-600/20'}`}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Entra nella Stanza <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
            </button>
          </div>
        </form>

      </div>
    </PageLayout>
  );
};
