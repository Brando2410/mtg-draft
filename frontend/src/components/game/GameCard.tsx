import { memo } from 'react';
import { type GameObject } from '@shared/engine_types';
import { motion } from 'framer-motion';
import { Zap, Eye } from 'lucide-react';

export interface GameCardProps {
  obj: GameObject;
  variant?: 'battlefield' | 'hand' | 'stack' | 'zoom' | 'tiny' | 'small' | 'full';
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
  pendingAction?: any;
  disableHoverAnim?: boolean;
  damagePreview?: number;
  hideHeader?: boolean;
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
  isOpponent = false,
  pendingAction,
  disableHoverAnim = false,
  damagePreview = 0,
  hideHeader = false
}: GameCardProps) => {
  const { definition, effectiveStats, counters = {}, isTapped, isPhasedOut, damageMarked = 0, summoningSickness, isPrepared } = obj;
  const stats = effectiveStats;
  const isCreature = definition.types?.includes('Creature') || false;
  const isPlaneswalker = definition.types?.includes('Planeswalker') || false;

  // SOS: Image logic for Prepared spells and DFCs
  let displayImageUrl = definition.image_url;
  let displayName = definition.name;
  let displayManaCost = stats?.manaCost || definition.manaCost;

  // Split name for DFCs: "Creature // Spell" -> "Creature"
  if (displayName.includes(' // ')) {
    const parts = displayName.split(' // ');
    displayName = parts[0];
  }

  if (isPrepared && definition.preparedFace) {
    // PREPARED STATE LOGIC
    // Use the spell face artwork if available
    displayImageUrl = definition.preparedFace.image_url || displayImageUrl;
    
    // Only use the spell name and stats if we are NOT on the battlefield
    // On the battlefield, the object is still the permanent (the creature)
    if (variant !== 'battlefield' && variant !== 'zoom') {
      displayName = definition.preparedFace.name;
      displayManaCost = definition.preparedFace.manaCost;
    }
  } else if (definition.faces && definition.faces.length > 0) {
    // DFC FRONT FACE FALLBACK
    displayImageUrl = definition.image_url || definition.faces[0].image_url;
  }


  const formatName = (name: string) => {
    return name
      .replace(/[^a-zA-Z0-9 ]/g, ' ') // Replace symbols with spaces to prevent merging words
      .split(' ')
      .filter(Boolean) // Remove empty strings from double spaces
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Animation logic: Lunging forward if ATTACKING or BLOCKING
  const isCurrentlyDeclaringAttack = isDeclaringAttacks && isAttacking;
  const lungeDirection = isOpponent ? 1 : -1;
  const verticalShift = (isAttacking || isBlocking) ? (lungeDirection * 30) : 0;
  
  // TAP VISUALS: No rotation, just grayed out + icon
  const rotation = 0;
  const isActuallyTapped = isTapped && variant !== 'zoom';

  // DIMENSIONS (Using CSS variables for global responsiveness)
  const dimensions = {
    battlefield: { width: '100%', height: '100%', rounded: 'rounded-sm' },
    full: { width: '100%', height: '100%', rounded: 'rounded-xl' },
    hand: { width: 'var(--card-w-hand)', height: 'var(--card-h-hand)', rounded: 'rounded-lg' },
    stack: { width: 'calc(var(--u) * 11)', height: 'calc(var(--u) * 15.3)', rounded: 'rounded-lg' },
    small: { width: 'calc(var(--u) * 8.5)', height: 'calc(var(--u) * 11.9)', rounded: 'rounded-md' },
    tiny: { width: 'calc(var(--u) * 5.1)', height: 'calc(var(--u) * 7.2)', rounded: 'rounded-sm' },
    zoom: { 
      width: (definition.faces && definition.faces.length > 1) ? 'calc(var(--u) * 92)' : 'calc(var(--u) * 48)', 
      height: 'auto', 
      rounded: 'rounded-2xl' 
    }
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

  const objColors = definition.colors || [];
  const cardColor = objColors.length > 1 ? 'multicolor' : (objColors[0] || 'colorless');
  const borderClass = colorMap[cardColor] || colorMap.colorless;

  // MANA SYMBOLS (Official Scryfall SVGs)
  const ManaSymbols = ({ cost, variant }: { cost: string, variant: string }) => {
    const isLand = (definition.types || []).includes('Land') || (definition.type_line || '').toLowerCase().includes('land');
    if (!cost || isLand) return null;
    const symbols = cost.match(/\{([^}]+)\}/g)?.map(s => s.slice(1, -1)) || [];
    
    // Scale down if many symbols
    const baseSize = variant === 'zoom' ? 30 : (variant === 'tiny' ? 8 : 13);
    const finalSize = `calc(var(--u) * ${baseSize / 7.5} * var(--local-scale, 1))`;

    return (
      <div className="flex gap-0.5 items-center justify-end shrink-0 ml-auto">
        {symbols.map((s, i) => (
          <img 
            key={i}
            src={`https://svgs.scryfall.io/card-symbols/${s.toUpperCase().replace(/\//g, '')}.svg`}
            alt={s}
            style={{ width: finalSize, height: finalSize }}
            className="drop-shadow-sm select-none shrink-0"
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
      'lifelink': '❤️', 'vigilance': '👁️', 'menace': '🎭', 'haste': '🔥',
      'hexproof': '💠', 'prowess': '💪', 'defender': '🧱', 'first strike': '⚔️',
      'double strike': '⚔️⚔️', 'indestructible': '💎'
    };
    const key = keyword.toLowerCase();
    
    let icon = icons[key];
    if (!icon && key.includes('protection')) icon = '🛡️';
    
    if (!icon) return null;
    return (
        <div title={keyword} className="w-[calc(var(--u)*2.2*var(--local-scale,1))] h-[calc(var(--u)*2.2*var(--local-scale,1))] bg-black/60 backdrop-blur-sm rounded flex items-center justify-center text-[calc(var(--u)*1.1*var(--local-scale,1))] shadow-sm">
            {icon}
        </div>
    );
  };

  const getColorConfig = (color: string) => {
    const config: Record<string, { bg: string, from: string, to: string, border: string, text: string, hex: string }> = {
      white: { bg: 'bg-stone-100/95', from: 'from-stone-100/95', to: 'to-stone-100/95', border: 'border-stone-400', text: 'text-stone-900', hex: '#f5f5f4' },
      blue: { bg: 'bg-blue-900/95', from: 'from-blue-900/95', to: 'to-blue-900/95', border: 'border-blue-400', text: 'text-white', hex: '#1e3a8a' },
      black: { bg: 'bg-slate-900/95', from: 'from-slate-900/95', to: 'to-slate-900/95', border: 'border-slate-700', text: 'text-white', hex: '#0f172a' },
      red: { bg: 'bg-red-900/95', from: 'from-red-900/95', to: 'to-red-900/95', border: 'border-red-500', text: 'text-white', hex: '#7f1d1d' },
      green: { bg: 'bg-emerald-900/95', from: 'from-emerald-900/95', to: 'to-emerald-900/95', border: 'border-emerald-500', text: 'text-white', hex: '#064e3b' },
      colorless: { bg: 'bg-slate-800/95', from: 'from-slate-800/95', to: 'to-slate-800/95', border: 'border-slate-600', text: 'text-white', hex: '#1e293b' },
      multicolor: { bg: 'bg-amber-700/95', from: 'from-amber-700/95', to: 'to-amber-900/95', border: 'border-amber-400', text: 'text-white', hex: '#b45309' },
    };
    return config[color.toLowerCase()] || config.colorless;
  };

  const colors = (definition.colors || [])
    .map(c => c.toLowerCase())
    .sort((a, b) => {
      if (a === 'white') return 1;
      if (b === 'white') return -1;
      return 0; // Retain existing relative order for other colors
    });
  let headerClass = "";
  let borderStyle: any = {};

  if (colors.length === 0) {
    const conf = getColorConfig('colorless');
    headerClass = `${conf.bg} ${conf.border} ${conf.text}`;
  } else if (colors.length === 1) {
    const conf = getColorConfig(colors[0]);
    headerClass = `${conf.bg} ${conf.border} ${conf.text}`;
  } else {
    // MULTICOLOR GRADIENT LOGIC
    const configs = colors.map(c => getColorConfig(c));
    const gradientStops = configs.map(c => c.hex).join(', ');
    const headerGradient = `linear-gradient(to right, ${configs.map((c, i) => `${c.hex} ${(i / (configs.length - 1)) * 100}%`).join(', ')})`;
    
    // Readability check: If any dark colors exist, prioritize white text
    const hasDark = colors.some(c => ['black', 'blue', 'red', 'green'].includes(c));
    const textColor = (colors.includes('white') && !hasDark) ? 'text-stone-900' : 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]';
    
    headerClass = `${textColor} border-amber-400/50`;
    
    if (variant !== 'zoom') {
      borderStyle = {
        background: `linear-gradient(#0f172a, #0f172a) padding-box, linear-gradient(to bottom right, ${gradientStops}) border-box`,
        border: '1.5px solid transparent'
      };
    }
    
    // Overlap the header's background with the gradient
    (borderStyle as any).headerBackground = headerGradient;
  }

  return (
    <motion.div
      id={variant === 'battlefield' ? `game-card-${obj.id}` : undefined}
      initial={false}
      animate={{ 
        scale: isSelected ? 1.05 : 1, 
        opacity: 1, 
        rotate: rotation,
        y: verticalShift,
      }}
      transition={{ 
        type: 'tween', 
        duration: 0.15,
        ease: "easeOut"
      }}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        ...borderStyle
      }}
      whileHover={ (variant === 'small' || variant === 'hand' || variant === 'battlefield' || disableHoverAnim) ? {} : { 
        y: verticalShift,
        scale: 1,
      }}
      onMouseEnter={() => onHoverStart?.(obj)}
      onMouseLeave={() => onHoverEnd?.()}
      onClick={() => onClick?.(obj.id)}
      className={`relative shrink-0 cursor-pointer
        flex flex-col [container-type:inline-size]
        ${dimensions.rounded} ${variant !== 'zoom' ? `border-[1.5px] ${borderClass} shadow-xl` : ''}
        ${variant === 'battlefield' ? 'hover:ring-2 hover:ring-indigo-400/50 hover:shadow-[0_0_20px_rgba(129,140,248,0.4)]' : ''} 
        ${isTargetable ? 'ring-4 ring-red-500 ring-offset-2 ring-offset-slate-900 shadow-[0_0_20px_rgba(239,68,68,0.8)]' : ''} 
        ${(isPlayable && !isOpponent) ? ((isPrepared || (obj as any).isVirtual) ? 'ring-[3px] ring-fuchsia-500 !border !border-fuchsia-400' : 'ring-[3px] ring-cyan-400 !border !border-cyan-400') : ''} 
        ${isSelected ? 'ring-2 ring-yellow-400' : ''}
        ${isCurrentlyDeclaringAttack ? 'ring-4 ring-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.9)] !border-orange-400' : ''}`}
    >
      {/* PLAYABLE GLOW (Isolated to prevent shadow conflicts) */}
      {(isPlayable && !isOpponent) && (
        <motion.div
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute inset-[-3px] z-[-1] rounded-[inherit]
            ${(isPrepared || (obj as any).isVirtual) ? 'bg-fuchsia-500/20 shadow-[0_0_20px_rgba(217,70,239,0.8)]' : 'bg-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.8)]'}
          `}
        />
      )}
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
      {variant === 'battlefield' && !hideHeader && (
        <div 
            style={colors.length > 1 ? { background: (borderStyle as any).headerBackground } : {}}
            className={`flex-none h-[calc(var(--u)*1.8*var(--header-scale,var(--local-scale,1)))] flex items-center px-2 border-b overflow-hidden rounded-t-sm z-30 transition-colors
            ${isCurrentlyDeclaringAttack ? 'bg-orange-600 border-orange-400/50 text-white' : headerClass}
        `}>
            <h3 className={`font-black tracking-tighter truncate flex-1 min-w-0 text-left leading-none
                ${definition.name.length > 25 ? 'text-[calc(var(--u)*0.9*var(--header-scale,var(--local-scale,1)))]' : definition.name.length > 18 ? 'text-[calc(var(--u)*1.1*var(--header-scale,var(--local-scale,1)))]' : 'text-[calc(var(--u)*1.3*var(--header-scale,var(--local-scale,1)))]'}
            `}>
                {formatName(displayName)}
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
                      src={displayImageUrl} 
                      alt={displayName}
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
                          <div className="absolute inset-x-0 top-0 h-4 bg-slate-950/40 z-10" />
                          <div className="absolute inset-x-0 top-0 h-[25%] bg-gradient-to-b from-black/80 via-black/20 to-transparent" />
                      </>
                  )}
              </div>
          )}

          {/* FULL IMAGE (For Zoom mode) */}
          {variant === 'zoom' && (
              <div className={`relative group/zoom flex ${definition.faces && definition.faces.length > 1 ? 'flex-row gap-4 p-4 items-start bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5' : 'flex-col'}`}>
                  {definition.faces && definition.faces.length > 1 ? (
                    definition.faces.map((face, idx) => (
                      <div key={idx} className="flex-1 min-w-0 flex flex-col items-center">
                        <img 
                            src={face.image_url || definition.image_url} 
                            alt={face.name}
                            className="w-full h-auto rounded-xl shadow-2xl border-2 border-white/10"
                        />
                        <div className="mt-2 text-[10px] font-black uppercase text-white/40 tracking-widest">{idx === 0 ? 'Front' : 'Back'}</div>
                      </div>
                    ))
                  ) : (
                    <img 
                        src={definition.image_url} 
                        alt={definition.name}
                        className="w-full h-auto rounded-2xl shadow-2xl border-2 border-white/10"
                    />
                  )}
                  {definition.faces && definition.faces.length > 1 && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg border border-indigo-400/50 uppercase tracking-tighter z-50">
                      Double Faced Card
                    </div>
                  )}
              </div>
          )}

          {/* HUD OVERLAY (Stats, keywords, etc) - Rendered over art if not zoom */}
          {variant !== 'zoom' && (
              <div className={`absolute inset-0 flex flex-col justify-end pointer-events-none z-20 
                  ${variant === 'battlefield' ? 'p-0.5' : 'p-1.5'}
              `}>
                  {/* NAME OVERLAY (Only if not battlefield/zoom) */}
                  {variant !== 'battlefield' && !hideHeader && (
                      <div 
                        style={colors.length > 1 ? { background: (borderStyle as any).headerBackground } : {}}
                        className={`absolute top-0 inset-x-0 flex items-center justify-between gap-1 p-1 shadow-sm border-b
                          ${headerClass}
                      `}>
                          <h3 className={`font-black leading-tight tracking-tighter drop-shadow-md truncate flex-1 min-w-0
                              ${definition.name.length > 20 ? 'text-[calc(var(--u)*1.1)]' : definition.name.length > 15 ? 'text-[calc(var(--u)*1.3)]' : 'text-[calc(var(--u)*1.5)]'}
                          `}>
                              {formatName(displayName)}

                          </h3>
                          {variant !== 'tiny' && (
                              <div className="shrink-0">
                                  <ManaSymbols cost={displayManaCost} variant={variant} />

                              </div>
                          )}
                      </div>
                  )}

                  {/* MIDDLE: KEYWORDS & STATUS - Battlefield only */}
                  {variant === 'battlefield' && (
                    <div className="flex flex-col gap-1 items-start mt-1">
                        <div className="flex flex-wrap gap-0.5">
                            {(stats?.keywords || []).map(k => <KeywordIcon key={k} keyword={k} />)}
                            {summoningSickness && isCreature && !isTapped && (
                                <div title="Summoning Sickness" className="w-4 h-4 bg-indigo-600/80 rounded flex items-center justify-center text-[8px] animate-pulse shadow-sm">
                                    💤
                                </div>
                            )}
                        </div>
                    </div>
                  )}

                  {/* BOTTOM: P/T or LOYALTY - Battlefield only */}
                  <div className="flex justify-between items-end">

                      {isCreature && variant === 'battlefield' && (() => {
                          const origP = parseInt(String(definition.power || '0'));
                          const origT = parseInt(String(definition.toughness || '0'));
                          const currentP = stats?.power ?? origP;
                          const currentT = stats?.toughness ?? origT;
                          const displayT = currentT - damageMarked;

                          const pColor = currentP > origP ? 'text-emerald-400' : currentP < origP ? 'text-red-400' : 'text-white';
                          const previewT = displayT - damagePreview;
                          const tColor = (damagePreview > 0 || damageMarked > 0 || currentT < origT) ? 'text-red-400' : currentT > origT ? 'text-emerald-400' : 'text-white';

                          return (
                              <div className="bg-black shadow-2xl z-30 flex items-center justify-center absolute bottom-0 right-0 px-[6cqw] py-[2.5cqw] border-t-[1.5px] border-l-[1.5px] border-white/30 rounded-tl-[10%] min-w-[38cqw] min-h-[26cqw]">
                                  <div className="flex items-center gap-[3.5cqw]">
                                      <span className={`font-black tracking-tighter text-[10cqw] ${pColor}`}>
                                          {currentP}
                                      </span>
                                      <span className="text-[7.5cqw] text-white/40 font-bold -mx-[0.5cqw]">/</span>
                                      <span className={`font-black tracking-tighter text-[10cqw] ${tColor} ${damagePreview > 0 ? 'drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]' : ''}`}>
                                          {previewT}
                                      </span>
                                  </div>
                              </div>
                          );
                      })()}

                      {isPlaneswalker && variant === 'battlefield' && (
                          <div className={`border rounded-md px-[calc(var(--u)*1.5*var(--local-scale,1))] py-[calc(var(--u)*0.5*var(--local-scale,1))] flex items-center gap-[calc(var(--u)*0.5*var(--local-scale,1))] shadow-2xl
                            ${cardColor === 'white' ? 'bg-stone-100 border-stone-400 text-stone-900' :
                              cardColor === 'blue' ? 'bg-blue-800 border-blue-400 text-white' :
                              cardColor === 'black' ? 'bg-slate-900 border-slate-700 text-white' :
                              cardColor === 'red' ? 'bg-red-800 border-red-500 text-white' :
                              cardColor === 'green' ? 'bg-emerald-800 border-emerald-500 text-white' :
                              cardColor === 'multicolor' ? 'bg-amber-700 border-amber-400 text-white' :
                              'bg-slate-900 border-slate-600 text-white'}
                          `}>
                              <Zap className={`w-[calc(var(--u)*1.2*var(--local-scale,1))] h-[calc(var(--u)*1.2*var(--local-scale,1))] ${cardColor === 'white' ? 'text-stone-900 fill-stone-900' : 'text-amber-400 fill-amber-400'}`} />
                              <span className="text-[calc(var(--u)*1.8*var(--local-scale,1))] font-black px-0.5">
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
          <div className="absolute inset-0 z-[100] flex items-center justify-center translate-y-[2vh] pointer-events-none animate-in scale-in-95 fade-in duration-300">
             <svg width="calc(var(--u)*8.5)" height="calc(var(--u)*8.5)" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-90 drop-shadow-[0_0_20px_rgba(0,0,0,0.9)]">
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                <path d="M21 3v5h-5" />
             </svg>
          </div>
      )}

      {/* GLOBAL BADGES (Only for non-zoom) */}
      {variant !== 'zoom' && (
        <>
            {stackSize > 1 && (
                <div className="absolute -top-[1vh] -right-[1vh] bg-slate-950 border border-white/20 px-[1vh] py-[0.2vh] rounded-full shadow-2xl z-[60]">
                    <span className="text-[calc(var(--u)*1.3)] font-black text-white italic">x{stackSize}</span>
                </div>
            )}

            {(obj as any).isRevealed && (
                <div className="absolute top-[3vh] left-[1vh] z-[60] bg-black/60 backdrop-blur-md rounded-full p-[0.6vh] shadow-lg border border-white/20">
                    <Eye className="w-[1.2vh] h-[1.2vh] text-cyan-400" />
                </div>
            )}
        </>
      )}

      {/* COUNTER BADGES - Top Level (Prevent Clipping) */}
      {variant === 'battlefield' && (
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 flex flex-col gap-[calc(var(--u)*0.5*var(--local-scale,1))] items-center z-[200] group-hover:scale-110 transition-transform">
          {Object.entries(counters).map(([type, val]) => {
              if (val <= 0 || type === 'loyalty') return null;
              
              const isPlus = type === '+1/+1';
              const isMinus = type === '-1/-1';
              
              const gradient = isPlus 
                ? 'radial-gradient(circle at 30% 30%, #60a5fa, #2563eb 60%, #1d4ed8)' 
                : isMinus 
                  ? 'radial-gradient(circle at 30% 30%, #f87171, #dc2626 60%, #b91c1c)'
                  : 'radial-gradient(circle at 30% 30%, #fbbf24, #d97706 60%, #b45309)';

              return (
                <div 
                  key={type}
                  style={{ background: gradient }}
                  className="w-[calc(var(--u)*3*var(--local-scale,1))] h-[calc(var(--u)*3*var(--local-scale,1))] rounded-full flex items-center justify-center border border-white/50 shadow-[0_2px_6px_rgba(0,0,0,0.6),inset_0_-2px_4px_rgba(0,0,0,0.3)]"
                >
                  <span className="text-white text-[calc(var(--u)*1.8*var(--local-scale,1))] font-black drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] select-none">
                    {val}
                  </span>
                </div>
              );
          })}
      </div>
      )}

      {/* CONTEXTUAL ACTION BUTTONS (Safety Step) */}
      {pendingAction?.data?.isContextual && pendingAction.sourceId === obj.id && !isOpponent && (
        <>
          {/* Click-away overlay */}
          <div 
            className="fixed inset-0 z-[290] cursor-default"
            onClick={(e) => {
              e.stopPropagation();
              const cancelIdx = pendingAction.data.choices.findIndex((c: any) => 
                c.value === 'none' || 
                c.label.toLowerCase().includes('cancel') || 
                c.label.toLowerCase().includes('none')
              );
              if (cancelIdx !== -1) onClick?.(`CHOICE_${cancelIdx}`);
            }}
          />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-[1vh] z-[300] flex flex-col gap-[0.5vh] w-[calc(var(--u)*18)] animate-in slide-in-from-bottom-2 fade-in duration-200">
            {pendingAction.data.choices.map((choice: any, idx: number) => {
                const isCancel = choice.value === 'none' || 
                                choice.label.toLowerCase().includes('cancel') || 
                                choice.label.toLowerCase().includes('none');
                
                if (isCancel) return null;

                return (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      onClick?.(`CHOICE_${idx}`);
                    }}
                    className="w-full py-[1vh] px-[1.5vh] rounded-lg font-black text-[calc(var(--u)*1.1)] uppercase tracking-tighter shadow-2xl border-2 transition-all active:scale-95 bg-indigo-600/95 border-indigo-400 text-white hover:bg-indigo-500 hover:scale-105 shadow-indigo-500/20 shadow-lg"
                  >
                    {choice.label}
                  </button>
                );
            })}
          </div>
        </>
      )}
    </motion.div>
  );
});

