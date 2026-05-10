import { memo } from 'react';
import { type GameObject } from '@shared/engine_types';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import { ManaSymbols, KeywordIcon } from './card/CardIcons';
import { CardStats } from './card/CardStats';
import { CounterBadges } from './card/CounterBadges';
import { ContextualActions } from './card/ContextualActions';
import { useCardDisplayData } from '../../hooks/game/useCardDisplayData';
import { useCardDimensions } from '../../hooks/game/useCardDimensions';

export interface GameCardProps {
  obj: GameObject;
  variant?: 'battlefield' | 'hand' | 'stack' | 'zoom' | 'tiny' | 'small' | 'full';
  onClick?: (id: string) => void;
  isTargetable?: boolean;
  isSelected?: boolean;
  isPlayable?: boolean;
  onHoverStart?: (obj: GameObject) => void;
  onHoverEnd?: (id: string) => void;
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
  const isCreature = definition.types?.includes('Creature') || false;
  const isPlaneswalker = definition.types?.includes('Planeswalker') || false;

  const {
    imageUrl, name, manaCost,
    headerClass, borderStyle, borderClass, cardColor,
    headerHeight, shroudHeight, headerFontSize
  } = useCardDisplayData(obj, variant);

  const dimensions = useCardDimensions(variant, definition);

  // Animation logic
  const isCurrentlyDeclaringAttack = isDeclaringAttacks && isAttacking;
  const lungeDirection = isOpponent ? 1 : -1;
  const verticalShift = (isAttacking || isBlocking) ? (lungeDirection * 30) : 0;
  const isActuallyTapped = isTapped && variant !== 'zoom';

  const handleChoice = (choice: string) => onClick?.(choice);

  return (
    <motion.div
      id={variant === 'battlefield' ? `game-card-${obj.id}` : undefined}
      initial={false}
      animate={{
        scale: isSelected ? 1.05 : 1,
        opacity: 1,
        rotate: 0,
        y: verticalShift,
      }}
      transition={{ type: 'tween', duration: 0.15, ease: "easeOut" }}
      style={{ width: dimensions.width, height: dimensions.height, ...borderStyle }}
      whileHover={(variant === 'small' || variant === 'hand' || variant === 'battlefield' || disableHoverAnim) ? {} : {
        y: verticalShift, scale: 1,
      }}
      onMouseEnter={() => onHoverStart?.(obj)}
      onMouseLeave={() => onHoverEnd?.(obj.id)}
      onClick={() => onClick?.(obj.id)}
      className={`relative shrink-0 cursor-pointer flex flex-col overflow-hidden [container-type:inline-size] ${dimensions.rounded}
        ${(variant !== 'zoom' && variant !== 'full') ? `border-[1.5px] ${borderClass} shadow-xl` : ''}
        ${variant === 'battlefield' ? 'hover:ring-2 hover:ring-indigo-400/50 hover:shadow-[0_0_20px_rgba(129,140,248,0.4)]' : ''} 
        ${isTargetable ? 'ring-4 ring-red-500 ring-offset-2 ring-offset-slate-900 shadow-[0_0_20px_rgba(239,68,68,0.8)]' : ''} 
        ${(isPlayable && !isOpponent) ? (
          (isPrepared || obj.isVirtual) ? 'ring-[3px] ring-fuchsia-500 !border !border-fuchsia-400' :
            (effectiveStats?.isPermissionPlay) ? 'ring-[3px] ring-orange-500 !border !border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.5)]' :
              'ring-[3px] ring-cyan-400 !border !border-cyan-400'
        ) : ''} 
        ${isSelected ? 'ring-2 ring-yellow-400' : ''}
        ${isCurrentlyDeclaringAttack ? 'ring-4 ring-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.9)] !border-orange-400' : ''} shadow-lg`}
    >
      {/* PLAYABLE GLOW */}
      {(isPlayable && !isOpponent) && (
        <motion.div
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute inset-[-3px] z-[-1] rounded-[inherit]
            ${(isPrepared || obj.isVirtual) ? 'bg-fuchsia-500/20 shadow-[0_0_20px_rgba(217,70,239,0.8)]' :
              (effectiveStats?.isPermissionPlay) ? 'bg-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.8)]' :
                'bg-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.8)]'}
          `}
        />
      )}

      {/* ARENA ATTACK ARROW */}
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

      {/* BATTLEFIELD HEADER */}
      {variant === 'battlefield' && !hideHeader && (
        <div
          style={{ ...(borderStyle?.headerBackground ? { background: borderStyle.headerBackground } : {}), height: headerHeight }}
          className={`flex-none flex items-center px-2 border-b overflow-hidden rounded-t-sm z-30 transition-colors
            ${isCurrentlyDeclaringAttack ? 'bg-orange-600 border-orange-400/50 text-white' : headerClass}
        `}>
          <h3 style={{ fontSize: headerFontSize }} className="font-black tracking-tighter truncate flex-1 min-w-0 text-left leading-none">
            {name}
          </h3>
        </div>
      )}

      <motion.div
        className="relative flex-1 flex flex-col items-stretch overflow-hidden"
        animate={{ filter: isActuallyTapped ? 'grayscale(0.95) brightness(0.4)' : (isPhasedOut ? 'grayscale(0.8) opacity(0.5) blur(1px)' : 'grayscale(0) brightness(1)') }}
      >
        <div className={`${(variant === 'battlefield' || variant === 'zoom') ? 'relative flex-1' : 'absolute inset-0'} overflow-hidden ${dimensions.rounded}`}>
          {variant !== 'zoom' && (
            <div className={`absolute inset-0 w-full h-full overflow-hidden z-0 bg-slate-900`}>
              <img
                src={imageUrl} alt={name}
                className={`w-full h-full object-cover select-none pointer-events-none transition-opacity duration-300 ${variant === 'battlefield' ? 'opacity-100' : 'opacity-95'}`}
                style={{
                  objectPosition: variant === 'battlefield' ? 'center 22%' : 'center 20%',
                  transform: variant === 'battlefield' ? 'scale(1.35)' : 'none'
                }}
                loading="lazy"
              />
              {variant !== 'battlefield' && variant !== 'full' && (
                <>
                  <div className="absolute inset-x-0 top-0 bg-slate-950/80 z-10" style={{ height: shroudHeight }} />
                  <div className="absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-black/90 via-black/30 to-transparent" />
                </>
              )}
            </div>
          )}

          {variant === 'zoom' && (
            <div className={`relative group/zoom flex ${definition.faces && definition.faces.length > 1 ? 'flex-row gap-4 p-4 items-start bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5' : 'flex-col'}`}>
              {definition.faces && definition.faces.length > 1 ? (
                definition.faces.map((face, idx) => (
                  <div key={idx} className="flex-1 min-w-0 flex flex-col items-center">
                    <img src={face.image_url || definition.image_url} alt={face.name} className="w-full h-auto rounded-xl shadow-2xl border-2 border-white/10" />
                    <div className="mt-2 text-[10px] font-black uppercase text-white/40 tracking-widest">{idx === 0 ? 'Front' : 'Back'}</div>
                  </div>
                ))
              ) : (
                <img src={definition.image_url} alt={definition.name} className="w-full h-auto rounded-2xl shadow-2xl border-2 border-white/10" />
              )}
              {definition.faces && definition.faces.length > 1 && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg border border-indigo-400/50 uppercase tracking-tighter z-50">
                  Double Faced Card
                </div>
              )}
            </div>
          )}

          {variant !== 'zoom' && (
            <div className={`absolute inset-0 flex flex-col justify-end pointer-events-none z-20 ${variant === 'battlefield' ? 'p-0.5' : 'p-1.5'}`}>
              {variant !== 'battlefield' && !hideHeader && (
                <div
                  style={{ ...(borderStyle?.headerBackground ? { background: borderStyle.headerBackground } : {}), height: headerHeight }}
                  className={`absolute top-0 inset-x-0 flex items-center justify-between gap-1 px-[calc(var(--u)*0.8)] shadow-sm border-b ${headerClass}`}
                >
                  <h3 style={{ fontSize: headerFontSize }} className="font-black leading-tight tracking-tighter drop-shadow-md truncate flex-1 min-w-0">
                    {name}
                  </h3>
                  {variant !== 'tiny' && <ManaSymbols cost={manaCost} variant={variant} />}
                </div>
              )}

              {variant === 'battlefield' && (
                <div className="flex flex-col gap-1 items-start mt-1">
                  <div className="flex flex-wrap gap-0.5">
                    {(effectiveStats?.keywords || []).map(k => <KeywordIcon key={k} keyword={k} />)}
                    {summoningSickness && isCreature && !isTapped && (
                      <div title="Summoning Sickness" className="w-4 h-4 bg-indigo-600/80 rounded flex items-center justify-center text-[8px] animate-pulse shadow-sm">💤</div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-end">
                <CardStats
                  isCreature={isCreature} isPlaneswalker={isPlaneswalker} variant={variant}
                  definition={definition} stats={effectiveStats} damageMarked={damageMarked}
                  damagePreview={damagePreview} counters={counters} cardColor={cardColor}
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {isActuallyTapped && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center translate-y-[2vh] pointer-events-none animate-in scale-in-95 fade-in duration-300">
          <svg width="calc(var(--u)*8.5)" height="calc(var(--u)*8.5)" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-90 drop-shadow-[0_0_20px_rgba(0,0,0,0.9)]">
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M21 3v5h-5" />
          </svg>
        </div>
      )}

      {variant !== 'zoom' && (
        <>
          {stackSize > 1 && (
            <div className="absolute -top-[1vh] -right-[1vh] bg-slate-950 border border-white/20 px-[1vh] py-[0.2vh] rounded-full shadow-2xl z-[60]">
              <span className="text-[calc(var(--u)*1.6)] font-black text-white italic">x{stackSize}</span>
            </div>
          )}
          {obj.isRevealed && (
            <div className="absolute top-[3vh] left-[1vh] z-[60] bg-black/60 backdrop-blur-md rounded-full p-[0.6vh] shadow-lg border border-white/20">
              <Eye className="w-[1.2vh] h-[1.2vh] text-cyan-400" />
            </div>
          )}
        </>
      )}

      <CounterBadges counters={counters} />
      <ContextualActions pendingAction={pendingAction} objId={obj.id} onChoice={handleChoice} />
    </motion.div>
  );
}, (prevProps, nextProps) => {
  if (prevProps.variant !== nextProps.variant) return false;
  if (prevProps.isTargetable !== nextProps.isTargetable) return false;
  if (prevProps.isSelected !== nextProps.isSelected) return false;
  if (prevProps.isPlayable !== nextProps.isPlayable) return false;
  if (prevProps.stackSize !== nextProps.stackSize) return false;
  if (prevProps.isAttacking !== nextProps.isAttacking) return false;
  if (prevProps.isDeclaringAttacks !== nextProps.isDeclaringAttacks) return false;
  if (prevProps.isBlocking !== nextProps.isBlocking) return false;
  if (prevProps.isOpponent !== nextProps.isOpponent) return false;
  if (prevProps.damagePreview !== nextProps.damagePreview) return false;
  if (prevProps.hideHeader !== nextProps.hideHeader) return false;
  if (prevProps.disableHoverAnim !== nextProps.disableHoverAnim) return false;

  const pPending = prevProps.pendingAction;
  const nPending = nextProps.pendingAction;
  if (pPending?.sourceId !== nPending?.sourceId) return false;
  if (pPending?.data?.isContextual !== nPending?.data?.isContextual) return false;

  const pObj = prevProps.obj;
  const nObj = nextProps.obj;
  if (pObj.id !== nObj.id) return false;
  if (pObj.isTapped !== nObj.isTapped) return false;
  if (pObj.isPhasedOut !== nObj.isPhasedOut) return false;
  if (pObj.damageMarked !== nObj.damageMarked) return false;
  if (pObj.summoningSickness !== nObj.summoningSickness) return false;
  if (pObj.isPrepared !== nObj.isPrepared) return false;
  if (pObj.isRevealed !== nObj.isRevealed) return false;
  if (pObj.isVirtual !== nObj.isVirtual) return false;

  const pStats = pObj.effectiveStats;
  const nStats = nObj.effectiveStats;
  if (!!pStats !== !!nStats) return false;
  if (pStats && nStats) {
    if (pStats.power !== nStats.power) return false;
    if (pStats.toughness !== nStats.toughness) return false;
    if (pStats.isPlayable !== nStats.isPlayable) return false;
    if (pStats.isPermissionPlay !== nStats.isPermissionPlay) return false;
    if (pStats.keywords?.length !== nStats.keywords?.length) return false;
  }

  const pC = pObj.counters || {};
  const nC = nObj.counters || {};
  const cKeys = new Set([...Object.keys(pC), ...Object.keys(nC)]);
  for (let k of cKeys) {
    if (pC[k as keyof typeof pC] !== nC[k as keyof typeof nC]) return false;
  }

  return true;
});

