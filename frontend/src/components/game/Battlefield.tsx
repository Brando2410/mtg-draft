import { memo, useMemo, useState } from 'react';
import { type PlayerState, type GameObject, type StackObject, ActionType } from '@shared/engine_types';
import { motion, AnimatePresence } from 'framer-motion';

// Modular Components
import { GameCard } from './GameCard';
import { CombatArrows } from './CombatArrows';
import { StackView } from './StackView';
import { TargetingArrows } from './TargetingArrows';
import { ChoiceModal } from './modals/ChoiceModal';
import { XSelectionModal } from './modals/XSelectionModal';
import { ZonePile } from './ZonePile';
import { Avatar } from './Avatar';

const CardStack = memo(({ 
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
  onHoverEnd?: () => void,
  variant?: 'battlefield' | 'tiny',
  pendingAction?: any,
  planningArrow?: { x1: number, y1: number, x2: number, y2: number, sourceId?: string } | null;
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
                    className="absolute -top-4 -left-4 z-[10] bg-black/80 border-2 border-white/40 px-2.5 py-1 rounded-lg shadow-2xl skew-x-[-12deg]"
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

// --- HELPER: SubZone ---
const SubZone = memo(({ 
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
  onHoverEnd?: () => void,
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
                            key={aura.id} 
                            className="absolute -top-4 -right-2 z-10 hover:z-50 hover:scale-150 transition-all cursor-pointer"
                            style={{ transform: `translateX(${i * 10}px)` }}
                            onClick={(e) => { e.stopPropagation(); onTapCard?.(aura.id); }}
                        >
                            <GameCard obj={aura} variant="tiny" />
                        </div>
                    ))}
                </>
            );
        } else {
             // For stacked cards, we use the name as key but we still want to detect selection if any card in stack is selected
             const name = obj.definition.name;
             const group = rootCards.filter(c => c.definition.name === name);
             // Prevent returning multiple elements for the same name in stack mode
             if (rootCards.findIndex(c => c.definition.name === name) !== rootCards.indexOf(obj)) return null;

             element = <CardStack cards={group} onTapCard={onTapCard} targetableIds={targetableIds} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} pendingAction={pendingAction} />;
        }

        return { id: obj.id, element, isSelected: obj.id === pendingAction?.sourceId };
    }).filter(Boolean);

  }, [cards, allBattlefieldCards, onTapCard, stackSameName, targetableIds, onHoverStart, onHoverEnd, isDeclaringAttacks, attackers, pendingAction]);

  const isWrapped = content.length > 6;
  const wrapScale = isWrapped ? 0.55 : 1;
  const count = cards.length;
  const internalScale = (count > 5 && !isWrapped) ? Math.max(0.2, 1 - (count - 5) * 0.08) : 1;

  const zoneStyle = {
    '--card-w': `calc(var(--u) * 20 * ${internalScale * wrapScale})`,
    '--card-h': `calc(var(--u) * 14.4 * ${internalScale * wrapScale})`,
    '--card-gap': isWrapped ? '1vh' : '2.5vh',
  } as React.CSSProperties;

  return (
    <div className={`flex flex-col h-full w-full relative ${align === 'start' ? 'items-start' : align === 'end' ? 'items-end' : 'items-center'} justify-center select-none`} style={zoneStyle}>
      <div className={`flex ${isWrapped ? 'flex-wrap' : 'flex-nowrap'} gap-y-2 ${align === 'start' ? 'justify-start' : align === 'end' ? 'justify-end' : 'justify-center'} items-center h-full max-h-full w-full px-[2.5vh] py-0 overflow-visible`}>
        <AnimatePresence>
          {content.map((item: any) => (
             <div 
                key={item.id} 
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

interface BattlefieldProps {
  me: PlayerState | undefined;
  opponent: PlayerState | null | undefined;
  battlefield: GameObject[];
  stack: StackObject[];
  combat: any;
  exile: any[];
  currentStep: string;
  currentPhase: string;
  onTapCard: (id: string) => void;
  onChoiceResolve: (payload: any) => void;
  hoveredCardId?: string;
  onHoverStart?: (obj: GameObject) => void;
  onHoverEnd?: () => void;
  pendingAction?: any;
  onInspectZone: (zone: { label: string, cards: GameObject[], type: 'graveyard' | 'exile', isMe: boolean }) => void;
  onToggleStop: (step: string) => void;
  onAvatarClick: (isOpponent: boolean) => void;
  scrySurveilResult?: any;
  activePlayerId: string;
  priorityPlayerId: string | null;
}

export const Battlefield = ({ 
  me, opponent, battlefield, stack, combat, exile, currentStep, currentPhase, pendingAction, onTapCard,
  onChoiceResolve,
  hoveredCardId,
  onHoverStart,
  onHoverEnd,
  onInspectZone,
  onToggleStop,
  onAvatarClick,
  scrySurveilResult,
  activePlayerId,
  priorityPlayerId
}: BattlefieldProps) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const planningArrow = useMemo(() => {
    if ((pendingAction?.type === 'DECLARE_BLOCKERS' || pendingAction?.type === ActionType.DeclareBlockers) && pendingAction.sourceId) {
        const el = document.getElementById(`game-card-${pendingAction.sourceId}`);
        const bf = document.getElementById('battlefield-center')?.getBoundingClientRect();
        if (el && bf) {
            const r = el.getBoundingClientRect();
            return {
                sourceId: pendingAction.sourceId,
                x1: r.left + r.width/2 - bf.left,
                y1: r.top + r.height/2 - bf.top,
                x2: mousePos.x - bf.left,
                y2: mousePos.y - bf.top
            };
        }
    }
    return null;
  }, [pendingAction, mousePos]);

  const combatants = useMemo(() => {
    const set = new Set<string>();
    if (combat?.attackers) combat.attackers.forEach((a: any) => set.add(a.attackerId));
    if (combat?.blockers) combat.blockers.forEach((b: any) => set.add(b.blockerId));
    return set;
  }, [combat]);

  const targetableIds = useMemo(() => {
    if (pendingAction?.playerId !== me?.id) return new Set<string>();
    if (pendingAction?.type === 'TARGETING') {
        const set = new Set<string>(pendingAction.data?.legalTargetIds || []);
        if (pendingAction.data?.legalPlayerIds) pendingAction.data.legalPlayerIds.forEach((id: string) => set.add(id));
        return set;
    }
    return new Set<string>();
  }, [pendingAction, me?.id]);

  const zones = useMemo(() => {
    const filter = (pid: string | undefined) => {
      const perms = battlefield.filter(o => o.controllerId === pid);
      
      return {
        creatures: perms.filter(o => o.definition.types.includes('Creature')),
        nonCreatures: perms.filter(o => !o.definition.types.includes('Creature') && !o.definition.types.includes('Land')),
        lands: perms.filter(o => o.definition.types.includes('Land')),
      };
    };
    return { me: filter(me?.id), opp: filter(opponent?.id) };
  }, [battlefield, me?.id, opponent?.id, combatants, combat]);

  return (
    <div className="flex-1 relative flex flex-col bg-transparent overflow-hidden">
      
      {/* MODALS */}
      <ChoiceModal 
        pendingAction={pendingAction} 
        me={me} 
        opponent={opponent}
        battlefield={battlefield}
        stack={stack}
        exile={exile}
        onTapCard={onTapCard} 
        onHoverStart={onHoverStart} 
        onHoverEnd={onHoverEnd} 
      />
      <XSelectionModal pendingAction={pendingAction} me={me} onResolve={onChoiceResolve} />


      <div 
        className="flex-1 flex flex-col relative overflow-hidden" 
        id="battlefield-center"
        onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
      >
        <CombatArrows battlefield={battlefield} combat={combat} planningArrow={planningArrow} />
        <TargetingArrows stack={stack} battlefield={battlefield} pendingAction={pendingAction} hoveredCardId={hoveredCardId} />
        
        {/* OPPONENT SIDE */}
        <div className="w-full h-1/2 flex flex-col relative overflow-hidden">
           {/* BACK ROW: PILES */}
           <div className="h-[30%] flex items-center justify-end px-[0.5vw] bg-black/40 border-b border-white/5 shrink-0 overflow-hidden">
                <div className="flex gap-[2vh] h-[85%] items-center">
                    {(exile || []).filter(o => o.ownerId === opponent?.id).length > 0 && (
                        <ZonePile label="exile" count={(exile || []).filter(o => o.ownerId === opponent?.id).length} cards={(exile || []).filter(o => o.ownerId === opponent?.id)} type="exile" onClick={() => onInspectZone({ label: "Enemy Exile", cards: (exile || []).filter(o => o.ownerId === opponent?.id), type: 'exile', isMe: false })} />
                    )}
                    <ZonePile label="grave" count={opponent?.graveyard.length || 0} cards={opponent?.graveyard} type="graveyard" onClick={() => onInspectZone({ label: "Enemy Graveyard", cards: opponent?.graveyard || [], type: 'graveyard', isMe: false })} />
                    <ZonePile label="lib" count={opponent?.library.length || 0} type="library" />
                </div>
           </div>

           {/* MIDDLE ROW: LANDS & SUPPORT */}
           <div className="h-[35%] grid grid-cols-[1fr,12vh,1fr] border-b border-white/5 bg-black/20 px-[0.5vw] relative shrink-0">
                <div className="h-full border-r border-white/5 overflow-hidden">
                    <SubZone cards={zones.opp.lands} allBattlefieldCards={battlefield} label="Lands" align="start" onTapCard={onTapCard} stackSameName={true} targetableIds={targetableIds} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} currentStep={currentStep} combat={combat} isOpponent={true} pendingAction={pendingAction} />
                </div>
                
                {/* OPPONENT AVATAR CENTERPIECE */}
                <div className="h-full flex items-center justify-center shrink-0 bg-black/10 z-10">
                    {opponent && (
                        <Avatar 
                            player={opponent} 
                            isOpponent isActive={opponent.id === activePlayerId} 
                            isPriority={opponent.id === priorityPlayerId || (pendingAction?.playerId === opponent.id)}
                            onToggleStop={onToggleStop}
                            viewerStops={me?.stops}
                            currentStep={currentStep as any}
                            currentPhase={currentPhase as any}
                            scrySurveilResult={scrySurveilResult}
                            onClick={() => onAvatarClick(true)}
                        />
                    )}
                </div>

                <div className="h-full border-l border-white/5 overflow-hidden">
                    <SubZone cards={zones.opp.nonCreatures} allBattlefieldCards={battlefield} label="Support" align="end" onTapCard={onTapCard} targetableIds={targetableIds} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} currentStep={currentStep} combat={combat} isOpponent={true} pendingAction={pendingAction} />
                </div>
           </div>

           {/* FRONT ROW: CREATURES */}
           <div className="h-[35%] relative shrink-0 px-[0.5vw]">
                <SubZone cards={zones.opp.creatures} allBattlefieldCards={battlefield} label="Opponent Creatures" onTapCard={onTapCard} targetableIds={targetableIds} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} currentStep={currentStep} combat={combat} isOpponent={true} pendingAction={pendingAction} />
           </div>
        </div>

        {/* MIDDLE DIVIDER GAP */}
        <div className="w-full h-[3vh] border-y border-white/5 bg-white/[0.01] relative z-10 flex items-center justify-center py-[0.5vh] shrink-0">
            <AnimatePresence>
                {pendingAction && (
                    <motion.div 
                        key={pendingAction.type + (pendingAction.playerId === me?.id ? 'me' : 'opp')}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="pointer-events-none flex flex-col items-center"
                    >
                        {/* HIDE FOR SELECTOR (they have the modal), SHOW FOR OPPONENT */}
                        {pendingAction.playerId !== me?.id ? (
                            <div className="flex flex-col items-center">
                                <h2 className="relative text-3xl font-black text-white/40 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] tracking-tight italic uppercase leading-none">
                                    {pendingAction.type === ActionType.Discard ? 'Opponent is discarding...' : 'Opponent is making a choice...'}
                                </h2>
                                {pendingAction.data?.label && (
                                    <span className="relative text-[10px] text-indigo-400 font-bold uppercase tracking-[0.3em] mt-2 block">{pendingAction.data.label}</span>
                                )}
                            </div>
                        ) : (
                            /* MY ACTION (Only if NOT a modal choice) */
                            !([ActionType.Choice, ActionType.ResolutionChoice, ActionType.ModalSelection, ActionType.OptionalAction, ActionType.Scry, ActionType.Surveil, ActionType.ChooseX] as any[]).includes(pendingAction.type) && (
                                <div className="flex flex-col items-center">
                                    <h2 className="relative text-3xl font-black text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] tracking-tight italic uppercase leading-none">
                                        {pendingAction.type === ActionType.DeclareAttackers ? 'Declare Attackers' :
                                        pendingAction.type === ActionType.DeclareBlockers ? 'Declare Blockers' :
                                        pendingAction.type === ActionType.OrderAttackers ? 'Order Blockers' :
                                        pendingAction.type === ActionType.Discard ? `Discard ${pendingAction.count || 1} card${(pendingAction.count || 1) > 1 ? 's' : ''}` :
                                        pendingAction.type === ActionType.Targeting ? (pendingAction.data?.prompt || 'Select targets') :
                                        (pendingAction.data?.label || 'Make a choice')}
                                    </h2>
                                </div>
                            )
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* PLAYER SIDE */}
        <div className="w-full h-1/2 flex flex-col relative overflow-hidden">
           {/* FRONT ROW: CREATURES */}
           <div className="h-[35%] border-b border-white/5 shrink-0 px-[0.5vw]">
                <SubZone cards={zones.me.creatures} allBattlefieldCards={battlefield} label="Your Creatures" onTapCard={onTapCard} targetableIds={targetableIds} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} currentStep={currentStep} combat={combat} isOpponent={false} pendingAction={pendingAction} />
           </div>

           {/* MIDDLE ROW: LANDS & SUPPORT */}
           <div className="h-[35%] grid grid-cols-[1fr,12vh,1fr] bg-black/20 border-b border-white/5 px-[0.5vw] relative shrink-0">
                <div className="h-full border-r border-white/5 overflow-hidden">
                    <SubZone cards={zones.me.lands} allBattlefieldCards={battlefield} label="Your Lands" align="start" onTapCard={onTapCard} stackSameName={true} targetableIds={targetableIds} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} currentStep={currentStep} combat={combat} isOpponent={false} pendingAction={pendingAction} />
                </div>

                {/* PLAYER AVATAR CENTERPIECE */}
                <div className="h-full flex items-center justify-center shrink-0 bg-black/10 z-10">
                    {me && (
                        <Avatar 
                            player={me} 
                            isActive={me.id === activePlayerId}
                            isPriority={me.id === priorityPlayerId || (pendingAction?.playerId === me.id)}
                            onToggleStop={onToggleStop}
                            viewerStops={me.stops}
                            currentStep={currentStep as any}
                            currentPhase={currentPhase as any}
                            scrySurveilResult={scrySurveilResult}
                            onClick={() => onAvatarClick(false)}
                        />
                    )}
                </div>

                <div className="h-full border-l border-white/5 overflow-hidden">
                    <SubZone cards={zones.me.nonCreatures} allBattlefieldCards={battlefield} label="Your Support" align="end" onTapCard={onTapCard} targetableIds={targetableIds} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} currentStep={currentStep} combat={combat} isOpponent={false} pendingAction={pendingAction} />
                </div>
           </div>

           {/* BACK ROW: PILES */}
           <div className="h-[30%] flex items-center justify-start px-[0.5vw] bg-black/40 shrink-0 overflow-hidden">
                <div className="flex gap-[2vh] h-[85%] items-center">
                    <ZonePile label="lib" count={me?.library.length || 0} type="library" />
                    <ZonePile label="grave" count={me?.graveyard.length || 0} cards={me?.graveyard} type="graveyard" onClick={() => onInspectZone({ label: "Your Graveyard", cards: me?.graveyard || [], type: 'graveyard', isMe: true })} />
                    {(exile || []).filter(o => o.ownerId === me?.id).length > 0 && (
                        <ZonePile label="exile" count={(exile || []).filter(o => o.ownerId === me?.id).length} cards={(exile || []).filter(o => o.ownerId === me?.id)} type="exile" onClick={() => onInspectZone({ label: "Your Exile", cards: (exile || []).filter(o => o.ownerId === me?.id), type: 'exile', isMe: true })} />
                    )}
                </div>
           </div>
        </div>

        {/* STACK OVERLAY */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 z-50">
            <StackView 
                stack={stack} pendingAction={pendingAction} me={me} exile={exile} battlefield={battlefield}
                onTapCard={onTapCard} targetableIds={targetableIds}
                onHoverStart={onHoverStart} onHoverEnd={onHoverEnd}
            />
        </div>
      </div>
    </div>
  );
};
