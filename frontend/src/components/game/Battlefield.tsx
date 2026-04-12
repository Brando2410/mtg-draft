import { memo, useMemo, useState } from 'react';
import { type PlayerState, type GameObject, type StackObject } from '@shared/engine_types';
import { AnimatePresence } from 'framer-motion';

// Modular Components
import { GameCard } from './GameCard';
import { CombatArrows } from './CombatArrows';
import { StackView } from './StackView';
import { ChoiceModal } from './modals/ChoiceModal';
import { ZoneInspector } from './modals/ZoneInspector';
import { XSelectionModal } from './modals/XSelectionModal';

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
  pendingAction?: any
}) => {
  if (cards.length === 0) return null;
  
  const untaped = cards.filter(c => !c.isTapped);
  const tapped = cards.filter(c => c.isTapped);

  const renderPile = (stack: GameObject[], isTappedStack: boolean) => {
    if (stack.length === 0) return null;
    
    const visibleDepth = Math.min(stack.length, 4);
    
    return (
        <div className={`relative ${isTappedStack ? 'mt-8' : ''}`} style={{ width: '6rem', height: '8rem' }}>
            {Array.from({ length: visibleDepth }).map((_, i) => (
                <div 
                    key={stack[i].id + i}
                    className="absolute inset-0"
                    style={{ 
                        transform: `translate(${i * 6}px, ${-i * 6}px)`,
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
                    style={{ transform: `translate(${(visibleDepth-1) * 6}px, ${-(visibleDepth-1) * 6}px)` }}
                >
                    <span className="text-xs font-black text-white italic tracking-tighter">x{stack.length}</span>
                </div>
            )}
        </div>
    );
  };

  return (
    <div className="flex gap-12">
        {renderPile(untaped, false)}
        {renderPile(tapped, true)}
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

    if (!stackSameName) {
        return rootCards.map(obj => (
            <div key={obj.id} className="relative group/card-container">
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
            </div>
        ));
    }

    const groups: Record<string, GameObject[]> = {};
    rootCards.forEach(c => {
      const name = c.definition.name;
      if (!groups[name]) groups[name] = [];
      groups[name].push(c);
    });

    return Object.entries(groups).map(([name, group]) => (
      <CardStack key={name} cards={group} onTapCard={onTapCard} targetableIds={targetableIds} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} pendingAction={pendingAction} />
    ));
  }, [cards, allBattlefieldCards, onTapCard, stackSameName, targetableIds, onHoverStart, onHoverEnd, isDeclaringAttacks, attackers, pendingAction]);

  return (
    <div className="flex-1 flex flex-col gap-1 w-full h-full min-w-[100px]">
      <div className={`flex flex-wrap items-center justify-${align} gap-4 p-4 h-full content-center`}>
        <AnimatePresence>
          {content}
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
  onTapCard: (id: string) => void;
  onChoiceResolve: (payload: any) => void;
  onHoverStart?: (obj: GameObject) => void;
  onHoverEnd?: () => void;
  pendingAction?: any;
}

export const Battlefield = ({ 
  me, opponent, battlefield, stack, combat, exile, currentStep, pendingAction, onTapCard,
  onChoiceResolve,
  onHoverStart,
  onHoverEnd 
}: BattlefieldProps) => {
  const [inspectingZone, setInspectingZone] = useState<{ cards: GameObject[], label: string } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const planningArrow = useMemo(() => {
    if (pendingAction?.type === 'DECLARE_BLOCKERS' && pendingAction.sourceId) {
        const el = document.getElementById(`card-${pendingAction.sourceId}`);
        const bf = document.getElementById('battlefield-center')?.getBoundingClientRect();
        if (el && bf) {
            const r = el.getBoundingClientRect();
            return {
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
        creatures: perms.filter(o => o.definition.types.includes('Creature')).sort((a, b) => {
            const aCombat = combatants.has(a.id);
            const bCombat = combatants.has(b.id);
            if (aCombat && !bCombat) return -1;
            if (!aCombat && bCombat) return 1;
            if (aCombat && bCombat) {
                // Align by attackerId
                const aRef = (combat?.attackers?.find((att: any) => att.attackerId === a.id) || 
                              combat?.blockers?.find((blk: any) => blk.blockerId === a.id))?.attackerId || a.id;
                const bRef = (combat?.attackers?.find((att: any) => att.attackerId === b.id) || 
                              combat?.blockers?.find((blk: any) => blk.blockerId === b.id))?.attackerId || b.id;
                return aRef.localeCompare(bRef);
            }
            return 0;
        }),
        nonCreatures: perms.filter(o => !o.definition.types.includes('Creature') && !o.definition.types.includes('Land')),
        lands: perms.filter(o => o.definition.types.includes('Land')),
      };
    };
    return { me: filter(me?.id), opp: filter(opponent?.id) };
  }, [battlefield, me?.id, opponent?.id, combatants, combat]);

  return (
    <div className="flex-1 relative flex flex-col bg-transparent overflow-hidden">
      
      {/* MODALS */}
      <ChoiceModal pendingAction={pendingAction} me={me} onTapCard={onTapCard} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} />
      <XSelectionModal pendingAction={pendingAction} me={me} onResolve={onChoiceResolve} />
      <ZoneInspector 
        inspectingZone={inspectingZone} onClose={() => setInspectingZone(null)} 
        onTapCard={onTapCard} targetableIds={targetableIds} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} 
      />

      <div 
        className="flex-1 flex flex-col relative overflow-hidden" 
        id="battlefield-center"
        onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
      >
        <CombatArrows battlefield={battlefield} combat={combat} planningArrow={planningArrow} />
        
        {/* OPPONENT SIDE */}
        <div className="w-full h-1/2 flex flex-col-reverse relative border-b border-white/5">
           <div className="h-1/2">
                <SubZone cards={zones.opp.creatures} allBattlefieldCards={battlefield} label="Opponent Creatures" onTapCard={onTapCard} targetableIds={targetableIds} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} currentStep={currentStep} combat={combat} isOpponent={true} pendingAction={pendingAction} />
           </div>
           <div className="h-1/2 flex border-b border-white/5 bg-black/5">
                <SubZone cards={zones.opp.lands} allBattlefieldCards={battlefield} label="Lands" align="start" onTapCard={onTapCard} stackSameName={true} targetableIds={targetableIds} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} currentStep={currentStep} combat={combat} isOpponent={true} pendingAction={pendingAction} />
                <SubZone cards={zones.opp.nonCreatures} allBattlefieldCards={battlefield} label="Support" align="end" onTapCard={onTapCard} targetableIds={targetableIds} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} currentStep={currentStep} combat={combat} isOpponent={true} pendingAction={pendingAction} />
           </div>
        </div>

        {/* PLAYER SIDE */}
        <div className="w-full h-1/2 flex flex-col relative">
           <div className="h-1/2 border-b border-white/5">
                <SubZone cards={zones.me.creatures} allBattlefieldCards={battlefield} label="Your Creatures" onTapCard={onTapCard} targetableIds={targetableIds} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} currentStep={currentStep} combat={combat} isOpponent={false} pendingAction={pendingAction} />
           </div>
           <div className="h-1/2 flex bg-black/5">
                <SubZone cards={zones.me.lands} allBattlefieldCards={battlefield} label="Your Lands" align="start" onTapCard={onTapCard} stackSameName={true} targetableIds={targetableIds} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} currentStep={currentStep} combat={combat} isOpponent={false} pendingAction={pendingAction} />
                <SubZone cards={zones.me.nonCreatures} allBattlefieldCards={battlefield} label="Your Support" align="end" onTapCard={onTapCard} targetableIds={targetableIds} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} currentStep={currentStep} combat={combat} isOpponent={false} pendingAction={pendingAction} />
           </div>
        </div>

        {/* STACK OVERLAY */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 z-50">
            <StackView 
                stack={stack} pendingAction={pendingAction} me={me} exile={exile}
                onTapCard={onTapCard} onInspect={setInspectingZone} targetableIds={targetableIds}
            />
        </div>
      </div>
    </div>
  );
};
