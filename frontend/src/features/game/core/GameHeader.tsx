import { memo } from 'react';
import { Settings, ShieldAlert, Eye } from 'lucide-react';
import { type Player } from '@shared/types';

interface GameHeaderProps {
  onOpenDebug: () => void;
  onOpenMenu: () => void;
  spectators: Player[];
  spectatorCount: number;
}

export const GameHeader = memo(({ onOpenDebug, onOpenMenu, spectators, spectatorCount }: GameHeaderProps) => {
  return (
    <div className="fixed top-[calc(var(--u)*4.4)] left-[calc(var(--u)*4.4)] flex items-center gap-[var(--sp-4)] z-[400]">
      <button
        onClick={onOpenDebug}
        className="p-3 bg-white/5 hover:bg-indigo-500/20 rounded-2xl border border-white/5 transition-all group"
        title="Open Debug Console (Key: D)"
      >
        <ShieldAlert className="w-5 h-5 text-indigo-400 transition-transform" />
      </button>
      
      <button
        onClick={onOpenMenu}
        className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group"
        title="Game Menu (Key: ESC)"
      >
        <Settings className="w-5 h-5 text-white/40 group-hover:text-white transition-colors rotate-90" />
      </button>

      {spectatorCount > 0 && (
        <div 
          className="flex items-center gap-2 px-3 py-3 bg-indigo-600/20 rounded-2xl border border-indigo-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(79,70,229,0.2)] animate-in fade-in slide-in-from-left-2 duration-500 group/specs relative"
        >
          <Eye className="w-5 h-5 text-indigo-400" />
          <span className="text-xs font-black text-indigo-300 tabular-nums">{spectatorCount}</span>

          {/* Spectator List Tooltip */}
          <div className="absolute top-full left-0 mt-2 opacity-0 translate-y-2 pointer-events-none group-hover/specs:opacity-100 group-hover/specs:translate-y-0 transition-all duration-300 z-[1000]">
            <div className="bg-[#0f111a]/95 border border-white/10 rounded-2xl p-3 shadow-2xl backdrop-blur-xl min-w-[150px]">
              <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 px-1">Spectators</div>
              <div className="flex flex-col gap-1.5">
                {spectators.map((s, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 rounded-lg transition-colors">
                    <div className="w-4 h-4 rounded-full bg-slate-800 border border-white/10 overflow-hidden">
                      <img src={`/avatars/${s.avatar || 'ajani.png'}`} className="w-full h-full object-cover" alt="" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-300 truncate">{s.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
