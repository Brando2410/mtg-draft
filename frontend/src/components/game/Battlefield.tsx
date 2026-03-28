import { memo, useMemo, useState, useEffect } from 'react';
import { Heart, Library, Trash2, XCircle, X as CloseIcon } from 'lucide-react';
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
      
      // Attackers -> Opponent (Direct)
      combat.attackers.forEach(a => {
        const el = document.getElementById(`card-${a.attackerId}`);
        if (el) {
          const r = el.getBoundingClientRect();
          newCoords.push({
            x1: r.left + r.width/2 - bf.left,
            y1: r.top + r.height/2 - bf.top,
            x2: 60, // Side zone
            y2: bf.height / 4, 
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
  combat?: {
    attackers: { attackerId: string, targetId: string }[];
    blockers: { blockerId: string, attackerId: string }[];
  };
}

// 1. Card Component
const BattlefieldCard = memo(({ 
  obj, 
  onTapCard, 
  isMine,
  size = 'normal' 
}: { 
  obj: GameObject, 
  onTapCard?: (id: string) => void,
  isMine: boolean,
  size?: 'normal' | 'small' | 'tiny' 
}) => {
  const width = size === 'tiny' ? 'w-10' : size === 'small' ? 'w-16' : 'w-24';
  const height = size === 'tiny' ? 'h-14' : size === 'small' ? 'h-22' : 'h-34';

  return (
    <motion.div
      layoutId={obj.id}
      id={`card-${obj.id}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1, 
        rotate: obj.isTapped ? 90 : 0,
        filter: obj.isTapped ? 'brightness(0.7)' : 'brightness(1)'
      }}
      whileHover={{ scale: 1.05, zIndex: 10 }}
      onClick={() => {
        // Rule: Can tap my own cards OR tap opponent cards if we are in a targeting phase (like combat)
        onTapCard?.(obj.id);
      }}
      className={`relative shrink-0 shadow-2xl rounded-lg cursor-pointer transition-all ${width} ${height}`}
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
      {obj.damageMarked > 0 && (
        <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-white/20 shadow-lg">
          {obj.damageMarked}
        </div>
      )}
    </motion.div>
  );
});

// 2. Land Stack Component (MTG Arena Style)
const LandStack = memo(({ 
  cards, 
  onTapCard, 
  isMine 
}: { 
  cards: GameObject[], 
  onTapCard?: (id: string) => void,
  isMine: boolean
}) => {
  if (cards.length === 0) return null;
  
  return (
    <div className="flex flex-col gap-1 items-center group/stack">
      <div className="flex -space-x-20 hover:space-x-2 transition-all duration-500 items-center p-2">
        {cards.map((obj, idx) => (
          <div key={obj.id} style={{ zIndex: idx }} className="transition-transform hover:-translate-y-6">
            <BattlefieldCard obj={obj} isMine={isMine} onTapCard={onTapCard} size="small" />
          </div>
        ))}
      </div>
      <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest opacity-40 group-hover/stack:opacity-100 transition-opacity">
        {cards[0].definition.name} ({cards.length})
      </span>
    </div>
  );
});

// 3. Zone Component
const SubZone = memo(({ cards, label, align = 'center', isMine, onTapCard, stackLands = false }: { 
  cards: GameObject[], 
  label: string, 
  align?: 'start' | 'center' | 'end',
  isMine: boolean,
  onTapCard?: (id: string) => void,
  stackLands?: boolean
}) => {
  const groupedContent = useMemo(() => {
    if (!stackLands) return cards.map(obj => <BattlefieldCard key={obj.id} obj={obj} isMine={isMine} onTapCard={onTapCard} />);
    
    // Group by name
    const groups: Record<string, GameObject[]> = {};
    cards.forEach(c => {
      const name = c.definition.name;
      if (!groups[name]) groups[name] = [];
      groups[name].push(c);
    });

    return Object.entries(groups).map(([name, group]) => (
      <LandStack key={name} cards={group} isMine={isMine} onTapCard={onTapCard} />
    ));
  }, [cards, isMine, onTapCard, stackLands]);

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

export const Battlefield = memo(({ me, opponent, battlefield, stack, onTapCard, combat }: BattlefieldProps) => {
  const [inspectingZone, setInspectingZone] = useState<{ cards: GameObject[], label: string } | null>(null);

  const myZones = useMemo(() => {
    const permanents = battlefield.filter(obj => obj.controllerId === me?.id);
    return {
      creatures: permanents.filter(obj => (obj.definition.type_line || '').toLowerCase().includes('creature')),
      lands: permanents.filter(obj => (obj.definition.type_line || '').toLowerCase().includes('land')),
      nonCreatures: permanents.filter(obj => {
        const type = (obj.definition.type_line || '').toLowerCase();
        return !type.includes('land') && !type.includes('creature');
      })
    };
  }, [battlefield, me?.id]);

  const oppZones = useMemo(() => {
    const permanents = battlefield.filter(obj => obj.controllerId === opponent?.id);
    return {
      creatures: permanents.filter(obj => (obj.definition.type_line || '').toLowerCase().includes('creature')),
      lands: permanents.filter(obj => (obj.definition.type_line || '').toLowerCase().includes('land')),
      nonCreatures: permanents.filter(obj => {
        const type = (obj.definition.type_line || '').toLowerCase();
        return !type.includes('land') && !type.includes('creature');
      })
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

  return (
    <div className="flex-1 relative flex flex-row bg-[#020617] overflow-hidden">
      
      {/* OPPONENT SIDEBAR (LEFT) */}
      <div className="w-32 border-r border-white/5 flex flex-col items-center py-6 gap-6 bg-slate-950/40 shrink-0 px-2 overflow-y-auto custom-scrollbar">
         <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 bg-slate-900 px-4 py-2 rounded-xl border border-white/10 shadow-2xl">
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
            <SubZone cards={oppZones.lands} label="Opponent Lands" align="start" isMine={false} onTapCard={onTapCard} stackLands={true} />
            <SubZone cards={oppZones.nonCreatures} label="Opponent Support" align="end" isMine={false} onTapCard={onTapCard} />
          </div>
          <div className="h-1/2 bg-red-500/[0.005]">
            <SubZone cards={oppZones.creatures} label="Opponent Creatures" isMine={false} onTapCard={onTapCard} />
          </div>
        </div>
        <div className="w-full h-1/2 flex flex-col relative">
          <div className="h-1/2 bg-indigo-500/[0.005] border-b border-white/[0.01]">
            <SubZone cards={myZones.creatures} label="Your Creatures" isMine={true} onTapCard={onTapCard} />
          </div>
          <div className="h-1/2 flex">
            <SubZone cards={myZones.lands} label="Your Lands" align="start" isMine={true} onTapCard={onTapCard} stackLands={true} />
            <SubZone cards={myZones.nonCreatures} label="Your Support" align="end" isMine={true} onTapCard={onTapCard} />
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
        <div className="flex-1 w-full flex flex-col-reverse gap-3 items-center mb-6">
            <AnimatePresence>
              {stack.map((sobj, i) => (
                <motion.div key={sobj.id} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ scale: 1.5, opacity: 0 }} className="relative">
                  {sobj.card && <BattlefieldCard obj={sobj.card} size="small" isMine={false} />}
                  {i === stack.length -1 && <div className="absolute -left-5 top-1/2 -translate-y-1/2 text-indigo-400 font-black">▶</div>}
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
                <div className="flex items-center gap-4 bg-indigo-600/90 px-5 py-2.5 rounded-xl border border-indigo-400/30">
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
                      <BattlefieldCard obj={card} isMine={false} />
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
