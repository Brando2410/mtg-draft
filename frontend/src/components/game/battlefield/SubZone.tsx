import { memo, useMemo } from 'react';
import { type GameObject } from '@shared/engine_types';
import { AnimatePresence } from 'framer-motion';
import { GameCard } from '../GameCard';

export const CardStack = memo(({ 
  cards, 
  onTapCard,
  targetableIds = new Set(),
  onHoverStart,
  onHoverEnd,
  variant = 'battlefield',
  pendingAction
}: { 
  cards: GameObject[], 
  onTapCard?: (id: string) => void,
  targetableIds?: Set<string>,
  onHoverStart?: (obj: GameObject) => void,
  onHoverEnd?: (id: string) => void,
  variant?: 'battlefield' | 'tiny',
  pendingAction?: any
}) => {
  if (cards.length === 0) return null;
  
  const untaped = cards.filter(c => !c.isTapped);
  const tapped = cards.filter(c => c.isTapped);

  const renderPile = (stack: GameObject[]) => {
    if (stack.length === 0) return null;
    const visibleDepth = Math.min(stack.length, 4);
    
    return (
        <div className="relative" style={{ width: 'var(--card-w)', height: 'var(--card-h)' }}>
            {Array.from({ length: visibleDepth }).map((_, i) => (
                <div 
                    key={stack[i].id + i}
                    className="absolute inset-0"
                    style={{ 
                        transform: `translate(${i * 12}px, ${-i * 12}px)`,
                        zIndex: i
                    }}
                >
                    <GameCard 
                        obj={stack[0]}
                        stackSize={1}
                        variant={variant}
                        onClick={onTapCard}
                        isTargetable={stack.some(c => targetableIds.has(c.id))}
                        onHoverStart={onHoverStart}
                        onHoverEnd={onHoverEnd}
                        pendingAction={pendingAction}
                    />
                </div>
            ))}
            
            {stack.length > 1 && (
                <div 
                    className="absolute -top-4 -right-4 z-[10] bg-black/80 border-2 border-white/40 px-2.5 py-1 rounded-lg shadow-2xl skew-x-[-12deg]"
                    style={{ transform: `translate(${(visibleDepth-1) * 12}px, ${-(visibleDepth-1) * 12}px)` }}
                >
                    <span className="text-xs font-black text-white italic tracking-tighter">x{stack.length}</span>
                </div>
            )}
        </div>
    );
  };

  return (
    <div className="flex gap-[8vh]">
        {renderPile(untaped)}
        {renderPile(tapped)}
    </div>
  );
});

export const SubZone = memo(({ 
  cards, 
  allBattlefieldCards,
  label, 
  align = 'center', 
  onTapCard, 
  stackSameName = false, 
  targetableIds = new Set(),
  onHoverStart,
  onHoverEnd,
  currentStep,
  combat,
  isOpponent,
  pendingAction
}: { 
  cards: GameObject[], 
  allBattlefieldCards: GameObject[],
  label: string, 
  align?: 'start' | 'center' | 'end',
  onTapCard?: (id: string) => void,
  stackSameName?: boolean,
  targetableIds?: Set<string>,
  onHoverStart?: (obj: GameObject) => void,
  onHoverEnd?: (id: string) => void,
  currentStep?: string,
  combat?: any,
  isOpponent?: boolean,
  pendingAction?: any
}) => {
  const isDeclaringAttacks = ['DeclareAttackers', 'DeclareBlockers', 'FirstStrikeDamage', 'CombatDamage'].includes(currentStep || '');
  const attackers = useMemo(() => new Set(combat?.attackers?.map((a: any) => a.attackerId) || []), [combat]);
  const blockers = useMemo(() => new Set(combat?.blockers?.map((b: any) => b.blockerId) || []), [combat]);
  
  const content = useMemo(() => {
    const rootCards = cards.filter(c => !(c as any).attachedTo);

    return rootCards.map(obj => {
        let element;
        if (!stackSameName) {
            element = (
                <>
                    <GameCard 
                        obj={obj} 
                        variant="battlefield"
                        onClick={onTapCard} 
                        isTargetable={targetableIds.has(obj.id)}
                        onHoverStart={onHoverStart}
                        onHoverEnd={onHoverEnd}
                        isPlayable={obj.effectiveStats?.isPlayable}
                        isAttacking={attackers.has(obj.id)}
                        isBlocking={blockers.has(obj.id)}
                        isDeclaringAttacks={isDeclaringAttacks}
                        isOpponent={isOpponent}
                        isSelected={obj.id === pendingAction?.sourceId}
                        pendingAction={pendingAction}
                    />
                    {allBattlefieldCards.filter(a => (a as any).attachedTo === obj.id).map((aura, i) => (
                        <div 
                            key={aura.id || `aura-${i}`} 
                            className="absolute -top-4 -right-2 z-10 hover:z-50 transition-all cursor-pointer"
                            style={{ transform: `translateX(${i * 10}px)` }}
                            onClick={(e) => { e.stopPropagation(); onTapCard?.(aura.id); }}
                        >
                            <GameCard obj={aura} variant="tiny" />
                        </div>
                    ))}
                </>
            );
        } else {
             const name = obj.definition.name;
             const group = rootCards.filter(c => c.definition.name === name);
             if (rootCards.findIndex(c => c.definition.name === name) !== rootCards.indexOf(obj)) return null;
             element = <CardStack cards={group} onTapCard={onTapCard} targetableIds={targetableIds} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} pendingAction={pendingAction} />;
        }
        return { id: obj.id, element, isSelected: obj.id === pendingAction?.sourceId };
    }).filter(Boolean);

  }, [cards, allBattlefieldCards, onTapCard, stackSameName, targetableIds, onHoverStart, onHoverEnd, isDeclaringAttacks, attackers, pendingAction]);

  const visibleCount = content.length;
  const isWrapped = visibleCount > 6;
  const wrapScale = isWrapped ? 0.55 : 1;
  const internalScale = (visibleCount > 5 && !isWrapped) ? Math.max(0.2, 1 - (visibleCount - 5) * 0.08) : 1;

  const zoneStyle = {
    '--card-w': `calc(var(--u) * 20 * ${internalScale * wrapScale})`,
    '--card-h': `calc(var(--u) * 14.4 * ${internalScale * wrapScale})`,
    '--card-gap': isWrapped ? '1vh' : '2.5vh',
  } as React.CSSProperties;

  return (
    <div className={`flex flex-col h-full w-full relative ${align === 'start' ? 'items-start' : align === 'end' ? 'items-end' : 'items-center'} justify-center select-none`} style={zoneStyle}>
      <div className={`flex ${isWrapped ? 'flex-wrap' : 'flex-nowrap'} gap-y-2 ${align === 'start' ? 'justify-start' : align === 'end' ? 'justify-end' : 'justify-center'} items-center h-full max-h-full w-full px-[2.5vh] py-0 overflow-visible`}>
        <AnimatePresence>
          {content.map((item: any, idx: number) => (
             <div 
                key={item.id || `battle-item-${idx}`} 
                className={`relative group/card-container flex items-center justify-center min-w-0 flex-none max-h-[var(--card-h)] transition-[z-index] duration-0
                    ${item.isSelected ? 'z-[500]' : 'z-10'}`} 
                style={{ 
                    width: `calc(100% / ${Math.min(content.length, isWrapped ? Math.ceil(content.length / 2) : content.length)} - (var(--card-gap, 2.5vh)))`,
                    height: isWrapped ? '45%' : '90%',
                    maxWidth: 'var(--card-w)',
                    maxHeight: 'var(--card-h)',
                    marginRight: 'var(--card-gap)'
                }}
             >
                <div className="w-full h-full aspect-[1.38/1] flex items-center justify-center">
                    {item.element}
                </div>
             </div>
          ))}
        </AnimatePresence>
        {cards.length === 0 && (
          <div className="text-[10px] font-black uppercase text-white/5 tracking-[0.4em] pointer-events-none select-none italic text-center w-full">
            {label}
          </div>
        )}
      </div>
    </div>
  );
});
