import { memo, useMemo, useState, useEffect } from 'react';
import { Heart, Library, Trash2, XCircle, X as CloseIcon, Zap, RefreshCw } from 'lucide-react';
import { type PlayerState, type GameObject } from '@shared/engine_types';
import { motion, AnimatePresence } from 'framer-motion';

// --- ARROWS COMPONENT ---
const CombatArrows = memo(({ combat, battlefield }: { 
  combat?: BattlefieldProps['combat'], 
  battlefield: GameObject[] 
}) => {
  const [coords, setCoords] = useState<{ x1: number, y1: number, x2: number, y2: number, color: string }[]>([]);

  useEffect(() => {
    const update = () => {
      const bf = document.getElementById('battlefield-center')?.getBoundingClientRect();
      if (!bf || !combat) {
        setCoords([]);
        return;
      }

      const newCoords: any[] = [];
      
      // Attackers -> Target (Direct to Player or Planeswalker)
      combat.attackers.forEach(a => {
        const el = document.getElementById(`card-${a.attackerId}`);
        // First try to find card element (for PW targets), then fall back to player life element
        const targetEl = document.getElementById(`card-${a.targetId}`) || document.getElementById(`player-HP-${a.targetId}`); 
        
        if (el) {
          const r = el.getBoundingClientRect();
          let x2 = 60; 
          let y2 = bf.height / 4;

          if (targetEl) {
            const tr = targetEl.getBoundingClientRect();
            x2 = tr.left + tr.width/2 - bf.left;
            y2 = tr.top + tr.height/2 - bf.top;
          }

          newCoords.push({
            x1: r.left + r.width/2 - bf.left,
            y1: r.top + r.height/2 - bf.top,
            x2, 
            y2, 
            color: '#ef4444' 
          });
        }
      });

      // Blockers -> Attackers
      combat.blockers.forEach(b => {
        const elB = document.getElementById(`card-${b.blockerId}`);
        const elA = document.getElementById(`card-${b.attackerId}`);
        if (elB && elA) {
          const rB = elB.getBoundingClientRect();
          const rA = elA.getBoundingClientRect();
          newCoords.push({
            x1: rB.left + rB.width/2 - bf.left,
            y1: rB.top + rB.height/2 - bf.top,
            x2: rA.left + rA.width/2 - bf.left,
            y2: rA.top + rA.height/2 - bf.top,
            color: '#fbbf24'
          });
        }
      });

      setCoords(newCoords);
    };

    update();
    const interval = setInterval(update, 200);
    window.addEventListener('resize', update);
    return () => { clearInterval(interval); window.removeEventListener('resize', update); };
  }, [combat, battlefield]);

  return (
    <svg className="absolute inset-0 pointer-events-none z-[60]" style={{ width: '100%', height: '100%' }}>
      <defs>
        <marker id="head-red" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 Z" fill="#ef4444" />
        </marker>
        <marker id="head-yellow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 Z" fill="#fbbf24" />
        </marker>
      </defs>
      {coords.map((c, i) => (
        <line
          key={i}
          x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2}
          stroke={c.color}
          strokeWidth="3"
          markerEnd={c.color === '#ef4444' ? 'url(#head-red)' : 'url(#head-yellow)'}
          opacity="0.6"
        />
      ))}
    </svg>
  );
});

interface BattlefieldProps {
  me: PlayerState | undefined;
  opponent: PlayerState | null | undefined;
  battlefield: GameObject[];
  stack: any[];
  onTapCard?: (cardId: string) => void;
  onHoverStart?: (obj: GameObject) => void;
  onHoverEnd?: () => void;
  combat?: {
    attackers: { attackerId: string, targetId: string }[];
    blockers: { blockerId: string, attackerId: string }[];
  };
}

// 1. Card Component
const BattlefieldCard = memo(({ 
  obj, 
  onTapCard, 
  size = 'normal',
  isTargetable = false,
  isSelected = false,
  onHoverStart,
  onHoverEnd,
  me
}: { 
  obj: GameObject, 
  onTapCard?: (id: string) => void,
  size?: 'normal' | 'small' | 'tiny',
  isTargetable?: boolean,
  isSelected?: boolean,
  onHoverStart?: (obj: GameObject) => void,
  onHoverEnd?: () => void,
  me?: PlayerState
}) => {
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
      layoutId={obj.id}
      id={`card-${obj.id}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ 
        scale: isSelected ? 1.1 : 1, 
        opacity: 1, 
        rotate: obj.isTapped ? 90 : 0,
        filter: `${obj.isTapped ? 'brightness(0.7)' : 'brightness(1)'} ${obj.isPhasedOut ? 'grayscale(1) opacity(0.2) blur(1px)' : ''}`,
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
      
      {/* KEYWORD BAR */}
      <div className="absolute top-1 left-1 flex flex-col gap-0.5 z-20">
          {stats?.keywords.includes('Flying') && <div title="Flying" className="w-4 h-4 bg-blue-500/80 rounded shadow-lg flex items-center justify-center text-[8px] font-bold">🕊️</div>}
          {stats?.keywords.includes('Reach') && <div title="Reach" className="w-4 h-4 bg-emerald-600/80 rounded shadow-lg flex items-center justify-center text-[8px] font-bold">🏹</div>}
          {stats?.keywords.includes('Deathtouch') && <div title="Deathtouch" className="w-4 h-4 bg-purple-900/80 rounded shadow-lg flex items-center justify-center text-[8px] font-bold">☠️</div>}
          {stats?.keywords.includes('Trample') && <div title="Trample" className="w-4 h-4 bg-orange-700/80 rounded shadow-lg flex items-center justify-center text-[8px] font-bold">🐘</div>}
          {stats?.keywords.includes('Menace') && <div title="Menace" className="w-4 h-4 bg-red-900/80 rounded shadow-lg flex items-center justify-center text-[8px] font-bold">🎭</div>}
          {stats?.keywords.includes('Indestructible') && <div title="Indestructible" className="w-4 h-4 bg-amber-500/80 rounded shadow-lg flex items-center justify-center text-[8px] font-bold">🛡️</div>}
          {stats?.keywords.includes('Lifelink') && <div title="Lifelink" className="w-4 h-4 bg-red-500/80 rounded shadow-lg flex items-center justify-center text-[8px] font-bold">❤️</div>}
      </div>

      {/* P/T INDICATOR (Bottom Right) - Live calculation to ensure counters are visible */}
      {obj.definition.types.some(t => t.toLowerCase() === 'creature') && (
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

      {/* LOYALTY INDICATOR (Bottom Right) */}
      {obj.definition.types.some(t => t.toLowerCase() === 'planeswalker') && (
        <div className="absolute bottom-1 right-1 bg-indigo-900 border border-indigo-400/80 rounded shadow-[0_0_10px_rgba(0,0,0,0.8)] px-2 py-1 flex items-center justify-center z-50 min-w-[30px]">
            <Zap className="w-2.5 h-2.5 text-amber-400 mr-1" />
            <span className="text-[14px] font-black text-white leading-none">
                {obj.counters.loyalty || 0}
            </span>
        </div>
      )}

      {/* All top badges for counters/damage removed for maximum UI clarity */}
    </motion.div>
  );
});

// 2. Land Stack Component (Stable & Predictable Layout)
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

// 3. Zone Component
const SubZone = memo(({ 
  cards, 
  label, 
  align = 'center', 
  isMine, 
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
  isMine: boolean,
  onTapCard?: (id: string) => void,
  stackLands?: boolean,
  targetableIds?: Set<string>,
  onHoverStart?: (obj: GameObject) => void,
  onHoverEnd?: () => void,
  me?: PlayerState
}) => {
  const groupedContent = useMemo(() => {
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
    
    // Group by name
    const groups: Record<string, GameObject[]> = {};
    cards.forEach(c => {
      const name = c.definition.name;
      if (!groups[name]) groups[name] = [];
      groups[name].push(c);
    });

    return Object.entries(groups).map(([name, group]) => (
      <LandStack key={name} cards={group} onTapCard={onTapCard} targetableIds={targetableIds} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} me={me} />
    ));
  }, [cards, isMine, onTapCard, stackLands, targetableIds, onHoverStart, onHoverEnd, me]);

  return (
    <div className="flex flex-col gap-1 w-full h-full min-w-[100px]">
      <div className={`flex flex-wrap items-center justify-${align} gap-3 p-2 h-full content-center`}>
        <AnimatePresence>
          {groupedContent}
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

export const Battlefield = memo(({ me, opponent, battlefield, stack, onTapCard, onHoverStart, onHoverEnd, combat, pendingAction }: BattlefieldProps & { pendingAction?: any }) => {
  const [inspectingZone, setInspectingZone] = useState<{ cards: GameObject[], label: string } | null>(null);

  const targetableIds = useMemo(() => {
    if (pendingAction?.playerId !== me?.id) return new Set<string>();

    if (pendingAction?.type === 'TARGETING') {
        const set = new Set<string>(pendingAction.data?.legalTargetIds || []);
        // Check if player IDs are in legal targets
        if (pendingAction.data?.legalPlayerIds) {
           pendingAction.data.legalPlayerIds.forEach((id: string) => set.add(id));
        }
        return set;
    }

    // COMBAT HIGHLIGHTING
    if (pendingAction?.type === 'DECLARE_ATTACKERS' && combat?.attackers.length) {
        // Last attacker might need a target? Actually, any opponent PW is a potential target.
        const set = new Set<string>(battlefield.filter(obj => obj.controllerId !== me?.id && obj.definition.types.includes('Planeswalker')).map(o => o.id));
        // Also highlight the opponent player
        if (opponent) set.add(opponent.id);
        return set;
    }

    if (pendingAction?.type === 'DECLARE_BLOCKERS' && pendingAction.sourceId) {
        // We selected a blocker, now highlight legal attackers to block
        return new Set<string>(combat?.attackers.map(a => a.attackerId) || []);
    }

    return new Set<string>();
  }, [pendingAction, me?.id, battlefield, combat]);

  const myZones = useMemo(() => {
    const permanents = battlefield.filter(obj => obj.controllerId === me?.id);
    const getIsType = (o: GameObject, t: string) => {
        const types = (o.definition.types || []).map(x => x.toLowerCase());
        const typeLine = (o.definition.type_line || '').toLowerCase();
        return types.includes(t.toLowerCase()) || typeLine.includes(t.toLowerCase());
    };

    return {
      creatures: permanents.filter(obj => getIsType(obj, 'creature')),
      lands: permanents.filter(obj => getIsType(obj, 'land')),
      planeswalkers: permanents.filter(obj => getIsType(obj, 'planeswalker')),
      nonCreatures: permanents.filter(obj => !getIsType(obj, 'creature') && !getIsType(obj, 'land') && !getIsType(obj, 'planeswalker'))
    };
  }, [battlefield, me?.id]);

  const oppZones = useMemo(() => {
    const permanents = battlefield.filter(obj => obj.controllerId === opponent?.id);
    const getIsType = (o: GameObject, t: string) => {
        const types = (o.definition.types || []).map(x => x.toLowerCase());
        const typeLine = (o.definition.type_line || '').toLowerCase();
        return types.includes(t.toLowerCase()) || typeLine.includes(t.toLowerCase());
    };

    return {
      creatures: permanents.filter(obj => getIsType(obj, 'creature')),
      lands: permanents.filter(obj => getIsType(obj, 'land')),
      planeswalkers: permanents.filter(obj => getIsType(obj, 'planeswalker')),
      nonCreatures: permanents.filter(obj => !getIsType(obj, 'creature') && !getIsType(obj, 'land') && !getIsType(obj, 'planeswalker'))
    };
  }, [battlefield, opponent?.id]);

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
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-black ${amount > 0 ? config[symbol] : 'bg-slate-800/30 text-slate-700 opacity-10'}`}>
        {amount > 0 ? amount : symbol}
      </div>
    );
  };

  const [orderingList, setOrderingList] = useState<string[]>([]);
  useEffect(() => {
    if (pendingAction?.type === 'ORDER_BLOCKERS' || pendingAction?.type === 'ORDER_ATTACKERS') {
      setOrderingList([]);
    }
  }, [pendingAction?.type, pendingAction?.sourceId]);

  const handleOrderClick = (id: string) => {
    if (orderingList.includes(id)) return;
    const newList = [...orderingList, id];
    setOrderingList(newList);
    if (newList.length === (pendingAction?.data?.ids?.length || 0)) {
       onTapCard?.(`ORDER_${newList.join(',')}`);
    }
  };

  return (
    <div className="flex-1 relative flex flex-row bg-[#020617] overflow-hidden">
      
      {/* ORDERING OVERLAY */}
      <AnimatePresence>
          {(pendingAction?.type === 'ORDER_BLOCKERS' || pendingAction?.type === 'ORDER_ATTACKERS') && pendingAction.playerId === me?.id && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
              >
                  <motion.div 
                    initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                    className="bg-slate-900 border border-white/10 p-10 rounded-[3rem] shadow-2xl max-w-4xl w-full flex flex-col items-center gap-8 text-center"
                  >
                        <div className="flex flex-col items-center gap-2">
                           <div className="w-16 h-16 bg-amber-600 rounded-2xl flex items-center justify-center mb-2 shadow-lg ring-4 ring-amber-500/20">
                              <RefreshCw className="w-8 h-8 text-white animate-spin-slow" />
                           </div>
                           <h3 className="text-3xl font-black italic uppercase tracking-tighter">
                              {pendingAction.type === 'ORDER_BLOCKERS' ? "Ordina i Bloccanti" : "Ordina gli Attaccanti"}
                           </h3>
                           <p className="text-slate-400 text-sm font-medium max-w-sm">
                              Seleziona le creature nell'ordine in cui vuoi assegnare il danno (la prima riceve il danno per prima).
                           </p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-6 p-6 bg-black/40 rounded-3xl border border-white/5">
                            {pendingAction.data?.ids?.map((id: string) => {
                                const obj = battlefield.find(o => o.id === id);
                                const orderIdx = orderingList.indexOf(id);
                                return (
                                    <div key={id} className="relative group cursor-pointer" onClick={() => handleOrderClick(id)}>
                                        <div className={`transition-all duration-300 ${orderIdx !== -1 ? 'opacity-40 grayscale scale-95' : 'hover:scale-105'}`}>
                                           {obj && <BattlefieldCard obj={obj} size="normal" />}
                                        </div>
                                        {orderIdx !== -1 && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center border-4 border-white shadow-2xl text-2xl font-black italic">
                                                    {orderIdx + 1}
                                                </div>
                                            </div>
                                        )}
                                        {orderIdx === -1 && (
                                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-indigo-500 text-[10px] font-black px-3 py-1 rounded-full shadow-xl">
                                                SCEGLI POS. {orderingList.length + 1}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex flex-col items-center gap-2">
                           <div className="flex gap-1">
                              {pendingAction.data?.ids?.map((_: any, i: number) => (
                                 <div key={i} className={`w-8 h-1 rounded-full transition-all duration-500 ${i < orderingList.length ? 'bg-indigo-500 w-12' : 'bg-slate-800'}`} />
                              ))}
                           </div>
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                             {orderingList.length} di {pendingAction.data?.ids?.length} selezionati
                           </span>
                        </div>
                  </motion.div>
              </motion.div>
          )}
      </AnimatePresence>

      {/* CHOICE OVERLAY (MODAL) */}
      <AnimatePresence>
          {pendingAction?.type === 'CHOICE' && pendingAction.playerId === me?.id && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
              >
                  <motion.div 
                    initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                    className="bg-slate-900 border border-white/10 p-8 rounded-3xl shadow-2xl max-w-md w-full flex flex-col items-center gap-6 text-center"
                  >
                        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-2 shadow-lg ring-4 ring-indigo-500/20">
                            <span className="text-2xl font-black italic">?</span>
                        </div>
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter">Scegli un'opzione</h3>
                        <div className="grid grid-cols-1 w-full gap-3">
                            {pendingAction.data?.choices?.map((choice: any, idx: number) => (
                                <button 
                                    key={idx}
                                    onClick={() => onTapCard?.(`CHOICE_${idx}`)}
                                    className="w-full p-4 bg-slate-800 hover:bg-indigo-600 rounded-xl border border-white/5 text-sm font-black uppercase italic tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {choice.label}
                                </button>
                            ))}
                        </div>
                  </motion.div>
              </motion.div>
          )}
      </AnimatePresence>

      {/* OPPONENT SIDEBAR (LEFT) */}
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
               <span className="absolute bottom-0 right-0 bg-slate-900 border-l border-t border-white/10 px-1 text-[8px] font-bold">{opponent?.library.length}</span>
            </button>
            <button onClick={() => setInspectingZone({ cards: opponent?.graveyard || [], label: "Opponent Graveyard" })} className="relative w-12 h-16 bg-slate-900 rounded-lg border border-white/5 flex items-center justify-center group">
               <Trash2 className="w-4 h-4 text-white/20 group-hover:text-red-400" />
               <span className="absolute bottom-0 right-0 bg-indigo-600 px-1 text-[8px] font-bold">{opponent?.graveyard.length}</span>
            </button>
            <button onClick={() => setInspectingZone({ cards: [], label: "Global Exile" })} className="relative w-12 h-16 bg-amber-900/10 rounded-lg border border-amber-500/20 flex items-center justify-center group">
               <XCircle className="w-4 h-4 text-amber-500/20 group-hover:text-amber-400" />
               <span className="absolute bottom-0 right-0 bg-amber-600 px-1 text-[8px] font-bold">0</span>
            </button>
         </div>
      </div>

      {/* BATTLEFIELD CENTER */}
      <div className="flex-1 flex flex-col relative overflow-hidden backdrop-blur-3xl" id="battlefield-center">
        <CombatArrows battlefield={battlefield} combat={combat} />
        <div className="w-full h-1/2 flex flex-col relative border-b border-indigo-500/10">
          <div className="h-1/2 flex border-b border-white/[0.01]">
            <SubZone cards={oppZones.lands} label="Opponent Lands" align="start" isMine={false} onTapCard={onTapCard} stackLands={true} targetableIds={targetableIds} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} me={me} />
            <SubZone cards={oppZones.planeswalkers} label="Opponent Planeswalkers" align="center" isMine={false} onTapCard={onTapCard} targetableIds={targetableIds} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} me={me} />
            <SubZone cards={oppZones.nonCreatures} label="Opponent Support" align="end" isMine={false} onTapCard={onTapCard} targetableIds={targetableIds} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} me={me} />
          </div>
          <div className="h-1/2 bg-red-500/[0.005]">
            <SubZone cards={oppZones.creatures} label="Opponent Creatures" isMine={false} onTapCard={onTapCard} targetableIds={targetableIds} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} me={me} />
          </div>
        </div>
        <div className="w-full h-1/2 flex flex-col relative">
          <div className="h-1/2 bg-indigo-500/[0.005] border-b border-white/[0.01]">
            <SubZone cards={myZones.creatures} label="Your Creatures" isMine={true} onTapCard={onTapCard} targetableIds={targetableIds} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} me={me} />
          </div>
          <div className="h-1/2 flex">
            <SubZone cards={myZones.lands} label="Your Lands" align="start" isMine={true} onTapCard={onTapCard} stackLands={true} targetableIds={targetableIds} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} me={me} />
            <SubZone cards={myZones.planeswalkers} label="Your Planeswalkers" align="center" isMine={true} onTapCard={onTapCard} targetableIds={targetableIds} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} me={me} />
            <SubZone cards={myZones.nonCreatures} label="Your Support" align="end" isMine={true} onTapCard={onTapCard} targetableIds={targetableIds} onHoverStart={onHoverStart} onHoverEnd={onHoverEnd} me={me} />
          </div>
        </div>
        <div className="absolute top-1/2 w-full h-[1px] bg-indigo-500/20 z-50 pointer-events-none" />
      </div>

      {/* PLAYER SIDEBAR (RIGHT) */}
      <div className="w-44 border-l border-white/5 bg-slate-950/60 flex flex-col items-center py-6 z-10 shrink-0 px-2 overflow-y-auto custom-scrollbar">
        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-6 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,1)]" />
            Active Stack
        </div>
        <div className="flex-1 w-full flex flex-col-reverse gap-3 items-center mb-6 px-2 overflow-y-auto custom-scrollbar">
            <AnimatePresence>
              {stack.map((sobj, i) => (
                <motion.div 
                  key={sobj.id} 
                  initial={{ x: 20, opacity: 0 }} 
                  animate={{ x: 0, opacity: 1 }} 
                  exit={{ scale: 1.5, opacity: 0 }} 
                  className="relative group w-full flex justify-center"
                >
                  {sobj.card ? (
                    <div className="relative">
                      <BattlefieldCard obj={sobj.card} size="small" />
                      {sobj.type === 'ActivatedAbility' && (
                        <div className="absolute -bottom-1 -left-1 bg-amber-500 rounded-full p-1 border border-white/20 shadow-lg z-30">
                          <Zap className="w-2 h-2 text-white" />
                        </div>
                      )}
                    </div>
                  ) : (
                    /* ABILITY/TRIGGER BLOCK */
                    <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-indigo-500/30 flex flex-col items-center justify-center p-2 text-center shadow-xl ring-2 ring-indigo-500/10">
                        {sobj.type === 'TriggeredAbility' ? (
                          <RefreshCw className="w-4 h-4 text-emerald-400 mb-1 animate-spin-slow" />
                        ) : (
                          <Zap className="w-4 h-4 text-amber-400 mb-1" />
                        )}
                        <span className="text-[7px] font-black uppercase tracking-tighter text-indigo-300 leading-[1] line-clamp-2">
                          {sobj.description || (sobj.type === 'TriggeredAbility' ? 'Innesco' : 'Abilità')}
                        </span>
                    </div>
                  )}
                  {i === stack.length - 1 && (
                    <motion.div 
                      animate={{ x: [-2, 2, -2] }} 
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="absolute -left-6 top-1/2 -translate-y-1/2 text-indigo-400 font-black text-xs"
                    >
                      ▶
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
        </div>

        <div className="mt-auto w-full flex flex-col gap-6 pt-4 border-t border-white/5 items-center">
             <div className="flex flex-col items-center gap-3 w-full">
                <div className="flex flex-wrap justify-center gap-1 bg-black/40 p-1.5 rounded-xl border border-white/5">
                    {['W', 'U', 'B', 'R', 'G', 'C'].map(c => (
                      <ManaSymbol key={c} symbol={c} amount={(me?.manaPool as any)?.[c] || 0} />
                    ))}
                </div>
                <div 
                  id={me ? `player-HP-${me.id}` : undefined}
                  className="flex items-center gap-4 bg-indigo-600/90 px-5 py-2.5 rounded-xl border border-indigo-400/30">
                  <Heart className="w-4 h-4 text-white animate-pulse" />
                  <span className="text-xl font-black italic text-white">{me?.life ?? 20}</span>
                </div>
             </div>
             <div className="flex gap-4 items-center justify-center">
                <button onClick={() => setInspectingZone({ cards: me?.library || [], label: "Your Library" })} className="relative w-11 h-15 bg-blue-900/10 rounded border border-white/5 flex items-center justify-center group overflow-hidden">
                  <Library className="w-4 h-4 text-white/10 group-hover:text-indigo-400" />
                  <span className="absolute bottom-0 right-0 bg-indigo-600 px-1 text-[8px] font-bold">{me?.library.length}</span>
                </button>
                <button onClick={() => setInspectingZone({ cards: me?.graveyard || [], label: "Your Graveyard" })} className="relative w-11 h-15 bg-slate-900 rounded border border-white/5 flex items-center justify-center group">
                  <Trash2 className="w-4 h-4 text-white/10 group-hover:text-red-400" />
                  <span className="absolute bottom-0 right-0 bg-indigo-600 px-1 text-[8px] font-bold">{me?.graveyard.length}</span>
                </button>
                <button onClick={() => setInspectingZone({ cards: [], label: "Global Exile" })} className="relative w-11 h-15 bg-amber-900/10 rounded border border-amber-500/20 flex items-center justify-center group">
                  <XCircle className="w-4 h-4 text-amber-500/20 group-hover:text-amber-400" />
                  <span className="absolute bottom-0 right-0 bg-amber-600 px-1 text-[8px] font-bold">0</span>
                </button>
             </div>
        </div>
      </div>
      
      {/* CARD ZOOM OVERLAY REMOVED (Now in GameView) */}

      {/* ZONE INSPECTOR OVERLAY */}
      <AnimatePresence>
        {inspectingZone && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col p-10 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-600 p-2 rounded-lg"><Library className="w-6 h-6" /></div>
                <h2 className="text-4xl font-black italic uppercase italic tracking-tighter text-white">{inspectingZone.label}</h2>
                <span className="bg-white/10 px-3 py-1 rounded-full text-sm font-mono text-slate-400">{inspectingZone.cards.length} cards</span>
              </div>
              <button 
                onClick={() => setInspectingZone(null)}
                className="p-3 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
              >
                <CloseIcon className="w-8 h-8" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
              {inspectingZone.cards.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4">
                  <XCircle className="w-16 h-16 opacity-20" />
                  <p className="text-xl font-bold uppercase tracking-widest opacity-20">This zone is empty</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6 p-4">
                  {inspectingZone.cards.map((card, idx) => (
                    <div key={card.id + idx} className="flex flex-col gap-2 group">
                      <BattlefieldCard obj={card} />
                      <div className="text-[10px] font-bold text-center text-slate-400 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                        {card.definition.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
