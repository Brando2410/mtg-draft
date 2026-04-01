import { memo, useMemo, useState, useEffect } from 'react';
import { Heart, Library, Trash2, XCircle } from 'lucide-react';
import { type PlayerState, type GameObject, type StackObject } from '@shared/engine_types';
import { AnimatePresence, motion } from 'framer-motion';

// Modular Components
import { BattlefieldCard } from './BattlefieldCard';
import { CombatArrows } from './CombatArrows';
import { StackView } from './StackView';
import { ChoiceModal } from './modals/ChoiceModal';
import { OrderingModal } from './modals/OrderingModal';
import { ZoneInspector } from './modals/ZoneInspector';

// --- HELPER: Land Stack ---
const LandStack = memo(({ 
  cards, 
  onTapCard,
  targetableIds = new Set(),
  onHoverStart,
  onHoverEnd,
  me
}: { 
  cards: GameObject[], 
  onTapCard?: (id: string) => void,
  targetableIds?: Set<string>,
  onHoverStart?: (obj: GameObject) => void,
  onHoverEnd?: () => void,
  me?: PlayerState
}) => {
  if (cards.length === 0) return null;
  
  return (
    <div className="flex flex-col gap-1 items-center">
      <div className="flex -space-x-14 px-8 items-center h-28">
        {cards.map((obj, idx) => (
          <motion.div 
            key={obj.id} 
            style={{ zIndex: idx }} 
            whileHover={{ y: -15, scale: 1.1, zIndex: 100 }}
            className="relative cursor-pointer transition-all duration-300"
          >
            <BattlefieldCard 
              obj={obj} 
              onTapCard={onTapCard} 
              size="small" 
              isTargetable={targetableIds.has(obj.id)}
              onHoverStart={onHoverStart}
              onHoverEnd={onHoverEnd}
              me={me}
            />
          </motion.div>
        ))}
      </div>
      <span className="text-[10px] font-black uppercase text-indigo-400 bg-slate-900/80 px-2 py-0.5 rounded border border-white/10 shadow-lg">
        {cards[0].definition.name} ({cards.length})
      </span>
    </div>
  );
});

// --- HELPER: SubZone ---
const SubZone = memo(({ 
  cards, 
  label, 
  align = 'center', 
  onTapCard, 
  stackLands = false, 
  targetableIds = new Set(),
  onHoverStart,
  onHoverEnd,
  me
}: { 
  cards: GameObject[], 
  label: string, 
  align?: 'start' | 'center' | 'end',
  onTapCard?: (id: string) => void,
  stackLands?: boolean,
  targetableIds?: Set<string>,
  onHoverStart?: (obj: GameObject) => void,
  onHoverEnd?: () => void,
  me?: PlayerState
}) => {
  const content = useMemo(() => {
    if (!stackLands) return cards.map(obj => (
      <BattlefieldCard 
        key={obj.id} 
        obj={obj} 
        onTapCard={onTapCard} 
        isTargetable={targetableIds.has(obj.id)}
        onHoverStart={onHoverStart}
        onHoverEnd={onHoverEnd}
        me={me}
      />
    ));
    
    const groups: Record<string, GameObject[]> = {};
    cards.forEach(c => {
      const name = c.definition.name;
      if (!groups[name]) groups[name] = [];
      groups[name].push(c);
    });

    return Object.entries(groups).map(([name, group]) => (
      <LandStack key={name} cards={group} onTapCard={onTapCard} targetableIds={targetableIds} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} me={me} />
    ));
  }, [cards, onTapCard, stackLands, targetableIds, onHoverStart, onHoverEnd, me]);

  return (
    <div className="flex flex-col gap-1 w-full h-full min-w-[100px]">
      <div className={`flex flex-wrap items-center justify-${align} gap-3 p-2 h-full content-center`}>
        <AnimatePresence>
          {content}
        </AnimatePresence>
        {cards.length === 0 && (
          <div className="text-[8px] font-black uppercase text-white/5 tracking-widest pointer-events-none select-none">
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
  onTapCard: (id: string) => void;
  onHoverStart?: (obj: GameObject) => void;
  onHoverEnd?: () => void;
  pendingAction?: any;
}

export const Battlefield = ({ 
  me, opponent, battlefield, stack, combat, pendingAction, exile, onTapCard, onHoverStart, onHoverEnd 
}: BattlefieldProps) => {
  const [inspectingZone, setInspectingZone] = useState<{ cards: GameObject[], label: string } | null>(null);
  const [orderingList, setOrderingList] = useState<string[]>([]);

  // --- DERIVED STATE ---
  const targetableIds = useMemo(() => {
    if (pendingAction?.playerId !== me?.id) return new Set<string>();
    if (pendingAction?.type === 'TARGETING') {
        const set = new Set<string>(pendingAction.data?.legalTargetIds || []);
        if (pendingAction.data?.legalPlayerIds) pendingAction.data.legalPlayerIds.forEach((id: string) => set.add(id));
        return set;
    }
    if (pendingAction?.type === 'DECLARE_ATTACKERS' && combat?.attackers.length) {
        const set = new Set<string>(battlefield.filter(obj => obj.controllerId !== me?.id && obj.definition.types.includes('Planeswalker')).map(o => o.id));
        if (opponent) set.add(opponent.id);
        return set;
    }
    if (pendingAction?.type === 'DECLARE_BLOCKERS' && pendingAction.sourceId) {
        return new Set<string>(combat?.attackers.map((a: any) => a.attackerId) || []);
    }
    return new Set<string>();
  }, [pendingAction, me?.id, battlefield, combat, opponent]);

  const zones = useMemo(() => {
    const filter = (pid: string | undefined) => {
      const permanents = battlefield.filter(o => o.controllerId === pid);
      const isType = (o: GameObject, t: string) => {
          const tl = (o.definition.type_line || '').toLowerCase();
          const ts = (o.definition.types || []).map(x => x.toLowerCase());
          return ts.includes(t.toLowerCase()) || tl.includes(t.toLowerCase());
      };
      return {
        creatures: permanents.filter(o => isType(o, 'creature')),
        lands: permanents.filter(o => isType(o, 'land')),
        planeswalkers: permanents.filter(o => isType(o, 'planeswalker')),
        support: permanents.filter(o => !isType(o, 'creature') && !isType(o, 'land') && !isType(o, 'planeswalker'))
      };
    };
    return { me: filter(me?.id), opp: filter(opponent?.id) };
  }, [battlefield, me?.id, opponent?.id]);

  // --- ACTIONS ---
  const handleOrderClick = (id: string) => {
    if (orderingList.includes(id)) return;
    const newList = [...orderingList, id];
    setOrderingList(newList);
    if (newList.length === (pendingAction?.data?.ids?.length || 0)) {
       onTapCard?.(`ORDER_${newList.join(',')}`);
    }
  };

  useEffect(() => {
    if (pendingAction?.type === 'ORDER_BLOCKERS' || pendingAction?.type === 'ORDER_ATTACKERS') {
      setOrderingList([]);
    }
  }, [pendingAction?.type, pendingAction?.sourceId]);

  // --- AUTO-OPEN ZONE ON TARGETING ---
  const [hasAutoOpened, setHasAutoOpened] = useState<string | null>(null);
  useEffect(() => {
    if (pendingAction?.type === 'TARGETING' && pendingAction.playerId === me?.id) {
        if (hasAutoOpened === pendingAction.id) return;
        const targetDef = pendingAction.data?.targetDefinition;
        if (targetDef?.type === 'CardInGraveyard') {
            const myTargetable = me?.graveyard.some(c => targetableIds.has(c.id));
            const oppTargetable = opponent?.graveyard.some(c => targetableIds.has(c.id));
            if (myTargetable) setInspectingZone({ cards: me?.graveyard || [], label: 'Your Graveyard' });
            else if (oppTargetable) setInspectingZone({ cards: opponent?.graveyard || [], label: "Opponent's Graveyard" });
            setHasAutoOpened(pendingAction.id);
        } else if (targetDef?.type === 'CardInLibrary') {
            setInspectingZone({ cards: (me as any)?.library || [], label: 'Your Library' });
            setHasAutoOpened(pendingAction.id);
        }
    } else {
        setHasAutoOpened(null);
    }
  }, [pendingAction?.type, pendingAction?.id, me?.id, me?.graveyard, opponent?.graveyard, targetableIds]);

  const ManaSymbol = ({ symbol, amount }: { symbol: string, amount: number }) => {
    const config: Record<string, string> = {
      W: 'bg-[#f8f6d8] text-[#9b8d1a] border-[#e5e1b5]',
      U: 'bg-[#b3ceea] text-[#1a5b9b] border-[#89b2d8]',
      B: 'bg-[#a69191] text-[#2a1a1a] border-[#7d6b6b]',
      R: 'bg-[#f4aaaa] text-[#a61a1a] border-[#d88989]',
      G: 'bg-[#bcd6ba] text-[#1a5b1a] border-[#91b88e]',
      C: 'bg-[#ccc2c0] text-[#4d4d4d] border-[#a69c9b]',
    };
    return (
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-black ${
        amount > 0 ? config[symbol] : 'bg-slate-800/30 text-slate-700 opacity-10 border-transparent'
      }`}>
        {amount > 0 ? amount : symbol}
      </div>
    );
  };

  return (
    <div className="flex-1 relative flex flex-row bg-[#020617] overflow-hidden">
      
      {/* MODALS */}
      <OrderingModal pendingAction={pendingAction} me={me} battlefield={battlefield} orderingList={orderingList} onOrderClick={handleOrderClick} />
      <ChoiceModal pendingAction={pendingAction} me={me} onTapCard={onTapCard} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} />
      <ZoneInspector 
        inspectingZone={inspectingZone} 
        onClose={() => setInspectingZone(null)} 
        onTapCard={onTapCard} 
        targetableIds={targetableIds} 
        onHoverStart={onHoverStart} 
        onHoverEnd={onHoverEnd} 
        me={me} 
      />

      {/* OPPONENT SIDEBAR */}
      <div className="w-32 border-r border-white/5 flex flex-col items-center py-6 gap-6 bg-slate-950/40 shrink-0 px-2 overflow-y-auto custom-scrollbar">
         <div className="flex flex-col items-center gap-4">
            <div 
              id={opponent ? `player-HP-${opponent.id}` : undefined}
              onClick={() => onTapCard?.(opponent?.id || '')}
              className={`flex items-center gap-3 bg-slate-900 px-4 py-2 rounded-xl border shadow-2xl transition-all cursor-pointer hover:scale-105 active:scale-95
                ${targetableIds.has(opponent?.id || '') ? 'ring-4 ring-red-500 animate-pulse border-red-500' : 'border-white/10'}`}
            >
              <Heart className="w-4 h-4 text-red-500 fill-red-500/20" />
              <span className="text-xl font-black italic text-white">{opponent?.life ?? 20}</span>
            </div>
            <div className="flex flex-wrap justify-center gap-1 bg-black/40 p-1.5 rounded-xl border border-white/5">
                {['W', 'U', 'B', 'R', 'G', 'C'].map(c => (
                  <ManaSymbol key={c} symbol={c} amount={(opponent?.manaPool as any)?.[c] || 0} />
                ))}
            </div>
         </div>
         <div className="w-full h-px bg-white/5" />
         <div className="flex flex-col gap-4 items-center">
            <button onClick={() => setInspectingZone({ cards: opponent?.library || [], label: "Opponent Library" })} className="relative w-12 h-16 bg-blue-900/10 rounded-lg border border-white/5 flex items-center justify-center group overflow-hidden">
               <Library className="w-4 h-4 text-white/20 group-hover:text-blue-400" />
               <span className="absolute bottom-0 right-0 bg-slate-900 border-l border-t border-white/10 px-1 text-[8px] font-bold text-white">{opponent?.library.length}</span>
            </button>
            <button 
                onClick={() => setInspectingZone({ cards: opponent?.graveyard || [], label: "Opponent Graveyard" })} 
                className={`relative w-12 h-16 bg-slate-900 rounded-lg border flex items-center justify-center group transition-all
                  ${opponent?.graveyard.length && opponent?.graveyard.some(c => targetableIds.has(c.id)) ? 'ring-2 ring-red-500 animate-pulse border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'border-white/5'}`}
            >
               <Trash2 className="w-4 h-4 text-white/20 group-hover:text-red-400" />
               <span className="absolute bottom-0 right-0 bg-indigo-600 px-1 text-[8px] font-bold text-white">{opponent?.graveyard.length}</span>
            </button>
            <button 
                onClick={() => setInspectingZone({ cards: exile, label: "Global Exile" })} 
                className={`relative w-12 h-16 bg-amber-900/10 rounded-lg border flex items-center justify-center group transition-all
                  ${exile.some(c => targetableIds.has(c.id)) ? 'ring-2 ring-amber-500 animate-pulse border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'border-amber-500/20'}`}
            >
               <XCircle className="w-4 h-4 text-amber-500/20 group-hover:text-amber-400" />
               <span className="absolute bottom-0 right-0 bg-amber-600 px-1 text-[8px] font-bold text-white">{exile.length}</span>
            </button>
         </div>
      </div>

      {/* BATTLEFIELD CENTER */}
      <div className="flex-1 flex flex-col relative overflow-hidden backdrop-blur-3xl" id="battlefield-center">
        <CombatArrows battlefield={battlefield} combat={combat} />
        
        {/* OPPONENT SIDE */}
        <div className="w-full h-1/2 flex flex-col relative border-b border-indigo-500/10">
          <div className="h-1/2 flex border-b border-white/[0.01]">
            <SubZone cards={zones.opp.lands} label="Opponent Lands" align="start" onTapCard={onTapCard} stackLands={true} targetableIds={targetableIds} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} me={me} />
            <SubZone cards={zones.opp.planeswalkers} label="Opponent Planeswalkers" align="center" onTapCard={onTapCard} targetableIds={targetableIds} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} me={me} />
            <SubZone cards={zones.opp.support} label="Opponent Support" align="end" onTapCard={onTapCard} targetableIds={targetableIds} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} me={me} />
          </div>
          <div className="h-1/2 bg-red-500/[0.005]">
            <SubZone cards={zones.opp.creatures} label="Opponent Creatures" onTapCard={onTapCard} targetableIds={targetableIds} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} me={me} />
          </div>
        </div>

        {/* PLAYER SIDE */}
        <div className="w-full h-1/2 flex flex-col relative">
          <div className="h-1/2 bg-indigo-500/[0.005] border-b border-white/[0.01]">
            <SubZone cards={zones.me.creatures} label="Your Creatures" onTapCard={onTapCard} targetableIds={targetableIds} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} me={me} />
          </div>
          <div className="h-1/2 flex">
            <SubZone cards={zones.me.lands} label="Your Lands" align="start" onTapCard={onTapCard} stackLands={true} targetableIds={targetableIds} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} me={me} />
            <SubZone cards={zones.me.planeswalkers} label="Your Planeswalkers" align="center" onTapCard={onTapCard} targetableIds={targetableIds} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} me={me} />
            <SubZone cards={zones.me.support} label="Your Support" align="end" onTapCard={onTapCard} targetableIds={targetableIds} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} me={me} />
          </div>
        </div>

        <div className="absolute top-1/2 w-full h-[1px] bg-indigo-500/20 z-50 pointer-events-none" />
      </div>

      {/* STACK & PLAYER SIDEBAR */}
      <StackView 
        stack={stack} 
        pendingAction={pendingAction} 
        me={me} 
        exile={exile}
        onTapCard={onTapCard}
        onInspect={setInspectingZone}
        targetableIds={targetableIds}
      />

    </div>
  );
};

