import { memo } from 'react';
import { type GameObject } from '@shared/engine_types';
import { motion } from 'framer-motion';
import { Zap, Box } from 'lucide-react';

export interface GameCardProps {
  obj: GameObject;
  variant?: 'battlefield' | 'hand' | 'stack' | 'zoom' | 'tiny';
  onClick?: (id: string) => void;
  isTargetable?: boolean;
  isSelected?: boolean;
  isPlayable?: boolean;
  onHoverStart?: (obj: GameObject) => void;
  onHoverEnd?: () => void;
  stackSize?: number;
  isAttacking?: boolean;
  isDeclaringAttacks?: boolean;
  isBlocking?: boolean;
  isOpponent?: boolean;
}

/**
 * GameCard is the core visual component for an MTG card.
 * It adapts based on the zone and context (hand vs battlefield vs zoom).
 */
export const GameCard = memo(({ 
  obj, 
  variant = 'battlefield',
  onClick,
  isTargetable = false,
  isSelected = false,
  isPlayable = false,
  onHoverStart,
  onHoverEnd,
  stackSize = 1,
  isAttacking = false,
  isDeclaringAttacks = false,
  isBlocking = false,
  isOpponent = false
}: GameCardProps) => {
  const { definition, effectiveStats, counters, isTapped, isPhasedOut, damageMarked, summoningSickness } = obj;
  const stats = effectiveStats;
  const isCreature = definition.types.includes('Creature');
  const isPlaneswalker = definition.types.includes('Planeswalker');

  const formatName = (name: string) => {
    return name
      .replace(/[^a-zA-Z0-9 ]/g, ' ') // Replace symbols with spaces to prevent merging words
      .split(' ')
      .filter(Boolean) // Remove empty strings from double spaces
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Animation logic: Lunging forward if BLOCKING
  const isCurrentlyDeclaringAttack = isDeclaringAttacks && isAttacking;
  const lungeDirection = isOpponent ? 1 : -1;
  const verticalShift = isBlocking ? (lungeDirection * 25) : 0;
  
  // TAP VISUALS: No rotation, just grayed out + icon
  const rotation = 0; 
  const isActuallyTapped = isTapped && !isCurrentlyDeclaringAttack && variant !== 'zoom';

  // DIMENSIONS
  const dimensions = {
    battlefield: { w: 'w-32', h: 'h-24', rounded: 'rounded-sm' },
    hand: { w: 'w-32', h: 'h-44', rounded: 'rounded-lg' },
    stack: { w: 'w-28', h: 'h-40', rounded: 'rounded-lg' },
    tiny: { w: 'w-12', h: 'h-16', rounded: 'rounded-sm' },
    zoom: { w: 'w-[340px]', h: 'h-auto', rounded: 'rounded-2xl' }
  }[variant];

  // COLORS & STYLING
  const colorMap: Record<string, string> = {
    white: 'border-slate-200 shadow-white/5',
    blue: 'border-blue-500 shadow-blue-500/10',
    black: 'border-slate-800 shadow-black/40',
    red: 'border-red-600 shadow-red-600/10',
    green: 'border-emerald-600 shadow-emerald-500/10',
    multicolor: 'border-amber-400 shadow-amber-400/10',
    colorless: 'border-slate-500 shadow-slate-500/5',
  };

  const cardColor = definition.colors.length > 1 ? 'multicolor' : (definition.colors[0] || 'colorless');
  const borderClass = colorMap[cardColor] || colorMap.colorless;

  // MANA SYMBOLS (Official Scryfall SVGs)
  const ManaSymbols = ({ cost }: { cost: string }) => {
    if (!cost) return null;
    const symbols = cost.match(/\{([^}]+)\}/g)?.map(s => s.slice(1, -1)) || [];
    
    return (
      <div className="flex gap-0.5 items-center">
        {symbols.map((s, i) => (
          <img 
            key={i}
            src={`https://svgs.scryfall.io/card-symbols/${s.toUpperCase()}.svg`}
            alt={s}
            className={`${variant === 'zoom' ? 'w-5 h-5' : 'w-3 h-3'} drop-shadow-sm select-none`}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ))}
      </div>
    );
  };

  // KEYWORD ICONS (Arena-style subset)
  const KeywordIcon = ({ keyword }: { keyword: string }) => {
    const icons: Record<string, string> = {
      'flying': '🕊️', 'reach': '🏹', 'trample': '🐘', 'deathtouch': '☠️', 
      'lifelink': '❤️', 'vigilance': '👁️', 'menace': '🎭', 'haste': '🔥'
    };
    const key = keyword.toLowerCase();
    if (!icons[key]) return null;
    return (
        <div title={keyword} className="w-4 h-4 bg-black/60 backdrop-blur-sm rounded flex items-center justify-center text-[8px] shadow-sm">
            {icons[key]}
        </div>
    );
  };

  const headerColorMap: Record<string, string> = {
    white: 'bg-stone-200/95 border-stone-400 text-stone-900',
    blue: 'bg-blue-900/95 border-blue-400 text-white',
    black: 'bg-slate-900/95 border-slate-700 text-white',
    red: 'bg-red-900/95 border-red-500 text-white',
    green: 'bg-emerald-900/95 border-emerald-500 text-white',
    multicolor: 'bg-amber-700/95 border-amber-400 text-white', 
    colorless: 'bg-slate-800/95 border-slate-600 text-white',
  };

  const headerClass = headerColorMap[cardColor] || headerColorMap.C;

  return (
    <motion.div
      id={`game-card-${obj.id}`}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ 
        scale: isSelected ? 1.05 : 1, 
        opacity: 1, 
        rotate: rotation,
        y: verticalShift,
      }}
      style={{
        minWidth: variant === 'battlefield' ? '8rem' : 'auto',
        minHeight: variant === 'battlefield' ? '6rem' : 'auto'
      }}
      whileHover={{ 
        y: variant === 'hand' ? 0 : (verticalShift - 5),
        scale: 1.02,
      }}
      onMouseEnter={() => onHoverStart?.(obj)}
      onMouseLeave={() => onHoverEnd?.()}
      onClick={() => onClick?.(obj.id)}
      className={`relative shrink-0 cursor-pointer transition-shadow animate-in fade-in duration-300
        flex flex-col
        ${dimensions.w} ${dimensions.h} ${dimensions.rounded} ${variant !== 'zoom' ? `border-[1.5px] ${borderClass} shadow-xl` : ''}
        ${isTargetable ? 'ring-4 ring-red-500 ring-offset-2 ring-offset-slate-900 shadow-[0_0_20px_rgba(239,68,68,0.8)]' : ''} 
        ${isPlayable ? 'ring-2 ring-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.6)]' : ''} 
        ${isSelected ? 'ring-2 ring-yellow-400' : ''}
        ${isCurrentlyDeclaringAttack ? 'ring-4 ring-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.9)] !border-orange-400' : ''}`}
    >
      {/* ARENA ATTACK ARROW - Outside filter to stay vibrant */}
      {isCurrentlyDeclaringAttack && (
          <div className={`absolute left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-2 duration-300
            ${isOpponent ? '-bottom-7 rotate-180' : '-top-7'}
          `}>
             <div className="relative">
                <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[16px] border-b-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,1)]" />
                <div className="absolute top-[2px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[14px] border-b-yellow-400 opacity-50" />
             </div>
          </div>
      )}

      {/* BATTLEFIELD HEADER (Attached above) - Outside filter to stay colored */}
      {variant === 'battlefield' && (
        <div className={`flex-none h-4 flex items-center px-2 border-b overflow-hidden rounded-t-sm z-30 transition-colors
            ${isCurrentlyDeclaringAttack ? 'bg-orange-600 border-orange-400/50 text-white' : headerClass}
        `}>
            <h3 className={`font-black tracking-tighter truncate w-full whitespace-nowrap
                ${definition.name.length > 28 ? 'text-[8px]' : definition.name.length > 20 ? 'text-[9.5px]' : 'text-[11px]'}
            `}>
                {formatName(definition.name)}
            </h3>
        </div>
      )}

      <motion.div 
        className="relative flex-1 flex flex-col items-stretch overflow-hidden"
        animate={{ filter: isActuallyTapped ? 'grayscale(0.95) brightness(0.4)' : (isPhasedOut ? 'grayscale(0.8) opacity(0.5) blur(1px)' : 'grayscale(0) brightness(1)') }}
      >
        {/* ART & CONTENT AREA */}
        <div className={`${(variant === 'battlefield' || variant === 'zoom') ? 'relative flex-1' : 'absolute inset-0'} overflow-hidden ${dimensions.rounded}`}>
          {/* BACKGROUND ART (Only if not zoom) */}
          {variant !== 'zoom' && (
              <div className={`absolute inset-0 w-full h-full overflow-hidden z-0 bg-slate-900`}>
                  <img 
                      src={definition.image_url} 
                      alt={definition.name}
                      className={`w-full h-full object-cover select-none pointer-events-none transition-opacity duration-300
                          ${variant === 'battlefield' ? 'opacity-100' : 'opacity-95'}
                      `}
                      style={{ 
                          objectPosition: variant === 'battlefield' ? 'center 22%' : 'center 20%',
                          transform: variant === 'battlefield' ? 'scale(1.35)' : 'none'
                      }}
                      loading="lazy"
                  />
                  {/* DARK GRADIENT OVERLAYS (Non-battlefield only) */}
                  {variant !== 'battlefield' && (
                      <>
                          {/* Header shroud to hide original printed text */}
                          <div className="absolute inset-x-0 top-0 h-5 bg-slate-950/50 z-10" />
                          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-black/80 via-black/20 to-transparent" />
                          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/90 to-transparent" />
                      </>
                  )}
              </div>
          )}

          {/* FULL IMAGE (For Zoom mode) */}
          {variant === 'zoom' && (
              <img 
                  src={definition.image_url} 
                  alt={definition.name}
                  className="w-full h-auto rounded-2xl shadow-2xl border-2 border-white/10"
              />
          )}

          {/* HUD OVERLAY (Stats, keywords, etc) - Rendered over art if not zoom */}
          {variant !== 'zoom' && (
              <div className={`absolute inset-0 flex flex-col justify-end pointer-events-none z-20 
                  ${variant === 'battlefield' ? 'p-0.5' : 'p-1.5'}
              `}>
                  {/* NAME OVERLAY (Only if not battlefield/zoom) */}
                  {variant !== 'battlefield' && (
                      <div className={`absolute top-0 inset-x-0 flex items-center justify-between gap-1 p-1 shadow-sm border-b
                          ${headerClass}
                      `}>
                          <h3 className={`font-black leading-tight tracking-tighter drop-shadow-md truncate flex-1 min-w-0
                              ${definition.name.length > 20 ? 'text-[8px]' : definition.name.length > 15 ? 'text-[9px]' : 'text-[10px]'}
                          `}>
                              {formatName(definition.name)}
                          </h3>
                          {variant !== 'tiny' && (
                              <div className="shrink-0">
                                  <ManaSymbols cost={definition.manaCost} />
                              </div>
                          )}
                      </div>
                  )}

                  {/* MIDDLE: KEYWORDS & STATUS */}
                  <div className="flex flex-col gap-1 items-start mt-1">
                      <div className="flex flex-wrap gap-0.5">
                          {(stats?.keywords || []).map(k => <KeywordIcon key={k} keyword={k} />)}
                          {summoningSickness && !isTapped && variant === 'battlefield' && (
                              <div title="Summoning Sickness" className="w-4 h-4 bg-indigo-600/80 rounded flex items-center justify-center text-[8px] animate-pulse shadow-sm">
                                  💤
                              </div>
                          )}
                      </div>
                  </div>

                  {/* BOTTOM: P/T or LOYALTY */}
                  <div className="flex justify-between items-end">
                      <div className="flex flex-col-reverse gap-0.5">
                          {Object.entries(counters).map(([type, val]) => val > 0 && (
                              <div key={type} className="bg-emerald-500 text-black text-[8px] font-black px-1 rounded shadow-lg border border-white/20">
                                  {type === '+1/+1' ? `+${val}` : `${val} ${type}`}
                              </div>
                          ))}
                      </div>

                      {isCreature && (
                          <div className={`bg-black shadow-2xl z-30 flex items-center justify-center
                              ${variant === 'battlefield' ? 'absolute bottom-0 right-0 px-2 py-0.5 border-t border-l border-white/30 rounded-tl-md' : 'rounded-lg p-1.5 border border-white/40'}
                          `}>
                              <div className="flex items-center gap-1">
                                  <span className={`font-black tracking-normal ${variant === 'battlefield' ? 'text-xs' : 'text-sm'} ${stats?.power !== parseInt(definition.power || '0') ? 'text-emerald-400' : 'text-white'}`}>
                                      {stats?.power ?? definition.power}
                                  </span>
                                  <span className="text-[10px] text-white/40 font-bold">/</span>
                                  <span className={`font-black tracking-normal ${variant === 'battlefield' ? 'text-xs' : 'text-sm'} ${damageMarked > 0 ? 'text-red-400' : stats?.toughness !== parseInt(definition.toughness || '0') ? 'text-emerald-400' : 'text-white'}`}>
                                      {(stats?.toughness ?? parseInt(definition.toughness || '0')) - damageMarked}
                                  </span>
                              </div>
                          </div>
                      )}

                      {isPlaneswalker && (
                          <div className="bg-indigo-900 border border-indigo-400 rounded-md px-1.5 py-0.5 flex items-center gap-1 shadow-2xl">
                              <Zap className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                              <span className="text-xs font-black text-white px-0.5">
                                  {counters.loyalty || 0}
                              </span>
                          </div>
                      )}
                  </div>
              </div>
          )}
        </div>
      </motion.div>

      {/* TAP ICON OVERLAY (Centered) - Outside filter to stay vibrant */}
      {isActuallyTapped && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center translate-y-5 pointer-events-none animate-in scale-in-95 fade-in duration-300">
             <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-90 drop-shadow-[0_0_20px_rgba(0,0,0,0.9)]">
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                <path d="M21 3v5h-5" />
             </svg>
          </div>
      )}

      {/* GLOBAL BADGES (Only for non-zoom) */}
      {variant !== 'zoom' && (
        <>
            {stackSize > 1 && (
                <div className="absolute -top-2 -right-2 bg-slate-950 border border-white/20 px-2 py-0.5 rounded-full shadow-2xl z-[60]">
                    <span className="text-[10px] font-black text-white italic">x{stackSize}</span>
                </div>
            )}

            {(obj as any).isRevealed && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
                    <Box className="w-12 h-12 text-purple-400" />
                </div>
            )}
        </>
      )}
    </motion.div>
  );
});
