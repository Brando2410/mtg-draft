import { memo } from 'react';
import { Zap } from 'lucide-react';
import { type GameObject, type PlayerState } from '@shared/engine_types';
import { motion, AnimatePresence } from 'framer-motion';

export interface BattlefieldCardProps {
  obj: GameObject;
  onTapCard?: (id: string) => void;
  size?: 'normal' | 'small' | 'tiny';
  isTargetable?: boolean;
  isSelected?: boolean;
  onHoverStart?: (obj: GameObject) => void;
  onHoverEnd?: () => void;
  me?: PlayerState;
  forceNormal?: boolean;
}

export const BattlefieldCard = memo(({ 
  obj, 
  onTapCard, 
  size = 'normal',
  isTargetable = false,
  isSelected = false,
  onHoverStart,
  onHoverEnd,
  me,
  forceNormal = false
}: BattlefieldCardProps) => {
  const isTapped = !forceNormal && obj.isTapped;
  const isPhasedOut = !forceNormal && obj.isPhasedOut;
  const width = size === 'tiny' ? 'w-10' : size === 'small' ? 'w-16' : 'w-24';
  const height = size === 'tiny' ? 'h-14' : size === 'small' ? 'h-22' : 'h-34';
  
  const stats = obj.effectiveStats;
  const baseP = parseInt(obj.definition.power || '0');
  const baseT = parseInt(obj.definition.toughness || '0');
  
  const isBuffedP = stats && stats.power > baseP;
  const isNerfedP = stats && stats.power < baseP;
  const isBuffedT = stats && stats.toughness > baseT;
  const isNerfedT = stats && stats.toughness < baseT;

  const isCreature = obj.definition.types.includes('Creature');

  return (
    <motion.div
      layoutId={forceNormal ? `modal-${obj.id}` : obj.id}
      id={`card-${obj.id}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ 
        scale: isSelected ? 1.1 : 1, 
        opacity: 1, 
        rotate: isTapped ? 90 : 0,
        filter: `${isTapped ? 'brightness(0.7)' : 'brightness(1)'} ${isPhasedOut ? 'grayscale(1) opacity(0.2) blur(1px)' : ''}`,
        backgroundColor: '#0f172a', // Solid fallback background
        boxShadow: isTargetable 
          ? '0 0 20px rgba(239, 68, 68, 0.8)' // Red glow for targets
          : (stats?.isPlayable && obj.controllerId === me?.id)
            ? '0 0 15px rgba(34, 211, 238, 0.9)' // Cyan glow for playables (ONLY MINE)
            : 'none'
      }}
      whileHover={{ scale: 1.05, zIndex: 10 }}
      onMouseEnter={() => onHoverStart?.(obj)}
      onMouseLeave={() => onHoverEnd?.()}
      onClick={() => onTapCard?.(obj.id)}
      className={`relative shrink-0 shadow-2xl rounded-lg cursor-pointer transition-all ${width} ${height} 
        ${isTargetable ? 'ring-4 ring-red-500 animate-pulse' : ''} 
        ${(stats?.isPlayable && obj.controllerId === me?.id) ? 'ring-2 ring-cyan-400' : ''} 
        ${isSelected ? 'ring-4 ring-yellow-400 z-50' : ''}`}
    >
      {/* ENHANCED DEFENSIVE EFFECTS */}
      <AnimatePresence>
        {(stats?.keywords.includes('Hexproof') || stats?.keywords.some(k => k.toLowerCase().startsWith('hexproof from'))) && (
           <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }}
             className="absolute inset-0 rounded-lg pointer-events-none z-10 bg-cyan-400/5 ring-1 ring-inset ring-cyan-400/30"
             style={{ boxShadow: 'inset 0 0 15px rgba(34, 211, 238, 0.1)' }}
           />
        )}
        {(stats?.keywords.includes('Indestructible') || stats?.keywords.some(k => k.toLowerCase().startsWith('protection from'))) && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute inset-x-[-2px] inset-y-[-2px] border-2 border-amber-400/40 rounded-[10px] pointer-events-none z-10"
              style={{ boxShadow: '0 0 10px rgba(245, 158, 11, 0.1)' }}
            />
        )}
      </AnimatePresence>

      <img 
        src={obj.definition.image_url} 
        alt={obj.definition.name}
        className="w-full h-full object-cover rounded-lg border border-white/20 select-none pointer-events-none"
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://cards.scryfall.io/large/front/2/d/2dfe1926-c0d5-40a2-b1aa-988524aefc31.jpg';
        }}
      />

      {/* SUMMONING SICKNESS TAG (ZZZ in bottom-left) */}
      {isCreature && obj.summoningSickness && !obj.isTapped && (
        <div className="absolute bottom-1 left-1 pointer-events-none z-30">
           <div className="bg-black/60 backdrop-blur-sm border border-indigo-400/30 rounded px-1.5 py-0.5 flex items-center gap-1 shadow-lg">
              <span className="text-[10px] font-black text-indigo-300 tracking-widest animate-pulse">ZZZ</span>
           </div>
        </div>
      )}
      
      {/* KEYWORD BAR (Top Left) */}
      <div className="absolute top-1 left-1 flex flex-col gap-0.5 z-20">
          {stats?.keywords.includes('Flying') && <div title="Flying" className="w-4 h-4 bg-blue-500/90 rounded shadow-lg flex items-center justify-center text-[8px] font-bold">🕊️</div>}
          {stats?.keywords.includes('Reach') && <div title="Reach" className="w-4 h-4 bg-emerald-600/90 rounded shadow-lg flex items-center justify-center text-[8px] font-bold">🏹</div>}
          {stats?.keywords.includes('Deathtouch') && <div title="Deathtouch" className="w-4 h-4 bg-purple-900/90 rounded shadow-lg flex items-center justify-center text-[8px] font-bold text-white">☠️</div>}
          {stats?.keywords.includes('Trample') && <div title="Trample" className="w-4 h-4 bg-orange-700/90 rounded shadow-lg flex items-center justify-center text-[8px] font-bold">🐘</div>}
          {stats?.keywords.includes('Menace') && <div title="Menace" className="w-4 h-4 bg-red-900/90 rounded shadow-lg flex items-center justify-center text-[8px] font-bold">🎭</div>}
          {stats?.keywords.includes('Vigilance') && <div title="Vigilance" className="w-4 h-4 bg-indigo-500/90 rounded shadow-lg flex items-center justify-center text-[8px] font-bold">👁️</div>}
          {stats?.keywords.includes('Lifelink') && <div title="Lifelink" className="w-4 h-4 bg-red-600/90 rounded shadow-lg flex items-center justify-center text-[8px] font-bold">❤️</div>}
      </div>

      {/* DEFENSIVE BADGES (Top Right) */}
      <div className="absolute top-1 right-1 flex flex-col gap-0.5 z-20 items-end">
          {stats?.keywords.includes('Indestructible') && (
            <div title="Indestructible" className="w-4 h-4 bg-amber-500 border border-amber-300/50 rounded shadow-lg flex items-center justify-center text-[8px] font-bold ring-1 ring-black/40">
                <span className="text-black">🛡️</span>
            </div>
          )}
          
          {stats?.keywords.includes('Hexproof') ? (
            <div title="Hexproof" className="w-4 h-4 bg-cyan-400 border border-cyan-200/50 rounded shadow-lg flex items-center justify-center text-[8px] font-bold ring-1 ring-black/40">
                <span className="text-black">💠</span>
            </div>
          ) : (
            <>
              {[...new Set(stats?.keywords.filter(k => k.toLowerCase().startsWith('hexproof from ')).map(k => k.toLowerCase()))].map((k, i) => {
                  const quality = k.replace('hexproof from ', '').trim();
                  const colors: Record<string, string> = { 
                    white: 'bg-slate-100', blue: 'bg-blue-500', black: 'bg-slate-950', 
                    red: 'bg-red-500', green: 'bg-emerald-500', multi: 'bg-gradient-to-br from-red-500 via-blue-500 to-green-500',
                    colorless: 'bg-slate-400', opponent: 'bg-purple-600', creatures: 'bg-amber-700'
                  };
                  const colorClass = colors[quality] || (quality.includes('demon') ? 'bg-red-950' : 'bg-cyan-600');
                  return (
                    <div key={i} title={k} className={`w-4 h-4 ${colorClass} border border-white/40 rounded shadow-lg flex items-center justify-center text-[8px] font-bold ring-1 ring-black/40`}>
                        <span className="scale-75">💠</span>
                    </div>
                  );
              })}
            </>
          )}

          {[...new Set(stats?.keywords.filter(k => k.toLowerCase().startsWith('protection from ')).map(k => k.toLowerCase()))].map((k, i) => {
              const quality = k.toLowerCase().replace('protection from ', '').trim();
              const colors: Record<string, string> = { 
                white: 'bg-slate-100', blue: 'bg-blue-500', black: 'bg-slate-950', 
                red: 'bg-red-500', green: 'bg-emerald-500', multi: 'bg-gradient-to-br from-red-500 via-blue-500 to-green-500',
                colorless: 'bg-slate-400', opponent: 'bg-purple-600', everything: 'bg-gradient-to-r from-amber-200 via-yellow-500 to-amber-200 animate-pulse',
                creatures: 'bg-amber-700'
              };
              const colorClass = colors[quality] || (quality.includes('demon') ? 'bg-red-950 text-white' : 'bg-amber-600');
              return (
                <div key={i} title={k} className={`w-4 h-4 ${colorClass} border border-white/40 rounded shadow-lg flex items-center justify-center text-[8px] font-bold ring-1 ring-black/40`}>
                    <span className="scale-[0.6] grayscale contrast-200 brightness-0">🛡️</span>
                </div>
              );
          })}
          
          {(obj as any).isRevealed && (
            <div title="Revealed to Opponent" className="w-4 h-4 bg-purple-600 border border-purple-400/50 rounded shadow-lg flex items-center justify-center text-[8px] font-bold ring-1 ring-black/40 animate-pulse">
                <span className="text-white scale-75">👁️</span>
            </div>
          )}
      </div>

      {isCreature && (
        <div className="absolute bottom-1 right-1 bg-black border border-white/40 rounded shadow-[0_0_10px_rgba(0,0,0,0.8)] px-2 py-0.5 flex items-center justify-center gap-1 z-50 min-w-[38px]">
            <span className={`text-[14px] font-black tracking-tighter ${isBuffedP || (obj.counters['+1/+1'] > 0) ? 'text-emerald-400' : isNerfedP ? 'text-red-400' : 'text-white'}`}>
                {(stats ? stats.power : (parseInt(obj.definition.power || '0') || 0))}
            </span>
            <span className="text-[10px] text-white/40 font-light">/</span>
            <span className={`text-[14px] font-black tracking-tighter ${(isNerfedT || obj.damageMarked > 0) ? 'text-red-400' : (isBuffedT || obj.counters['+1/+1'] > 0) ? 'text-emerald-400' : 'text-white'}`}>
                {(stats ? stats.toughness : (parseInt(obj.definition.toughness || '0') || 0)) - obj.damageMarked}
            </span>
        </div>
      )}

      {obj.definition.types.some(t => t.toLowerCase() === 'planeswalker') && (
        <div className="absolute bottom-1 right-1 bg-indigo-900 border border-indigo-400/80 rounded shadow-[0_0_10px_rgba(0,0,0,0.8)] px-2 py-1 flex items-center justify-center z-50 min-w-[30px]">
            <Zap className="w-2.5 h-2.5 text-amber-400 mr-1" />
            <span className="text-[14px] font-black text-white leading-none">
                {obj.counters.loyalty || 0}
            </span>
        </div>
      )}
    </motion.div>
  );
});
