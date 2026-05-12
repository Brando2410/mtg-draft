import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, LayoutPanelLeft, Home, Trophy, Users, Eye, ArrowLeft } from 'lucide-react';
import { PageLayout } from '../../../components/shared/PageLayout';
import { DeckReviewView } from '../../deck-builder/DeckReviewView';

interface LimitedEventOverProps {
  room: any;
  playerId: string;
  onBack: () => void;
  onViewTournament?: () => void;
}

const ColumnContainer = ({ color, colorNames, items, onZoomStart, onZoomEnd }: { color: string, colorNames: any, items: any[], onZoomStart: (card: any) => void, onZoomEnd: () => void }) => {
  const columnRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!columnRef.current) return;
    setIsDragging(true);
    setStartY(e.clientY);
    setScrollTop(columnRef.current.scrollTop);
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => {
    setIsDragging(false);
    onZoomEnd();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !columnRef.current) return;
    e.preventDefault();
    const y = e.clientY;
    const walk = (y - startY) * 1.5;
    columnRef.current.scrollTop = scrollTop - walk;
  };

  return (
    <div key={color} className="flex flex-col gap-6 w-48 sm:w-64 h-full shrink-0">
      <div className="flex items-center justify-between px-4 bg-slate-900/80 rounded-2xl py-3 border border-white/10 shadow-xl backdrop-blur-md shrink-0">
        <span className="text-white font-black text-[10px] sm:text-xs uppercase tracking-[0.2em]">
          {colorNames[color]}
        </span>
        <div className="px-3 py-1 bg-indigo-500/20 rounded-full border border-indigo-500/30">
          <span className="text-indigo-400 font-black text-[10px]">
            {items.reduce((acc, curr) => acc + curr.count, 0)}
          </span>
        </div>
      </div>
      
      <div 
        ref={columnRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onDragStart={(e) => e.preventDefault()}
        className={`flex-1 overflow-y-auto custom-scrollbar relative px-4 pb-20 flex flex-col gap-6 ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
      >
        {items.map((item, i) => (
          <motion.div 
            key={`${color}-${item.card.name}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onMouseEnter={() => onZoomStart(item.card)}
            onMouseLeave={onZoomEnd}
            className={`relative group shrink-0 ${isDragging ? 'pointer-events-none' : 'cursor-pointer'}`}
          >
            <div className="relative">
              <img 
                src={item.card.image_url} 
                alt={item.card.name} 
                draggable="false"
                className="w-full rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] border border-white/10 group-hover:scale-105 transition-transform duration-300 group-hover:shadow-[0_20px_60px_rgba(99,102,241,0.4)]"
              />
              {item.count > 1 && (
                <div className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs font-black px-3 py-1.5 rounded-xl border-2 border-slate-950 shadow-2xl z-30 transform group-hover:scale-125 transition-transform">
                  x{item.count}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export const LimitedEventOver: React.FC<LimitedEventOverProps> = ({
  room,
  playerId,
  onBack,
  onViewTournament
}) => {
  const [selectedPlayerForPool, setSelectedPlayerForPool] = useState<any | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // ZOOM LOGIC
  const [zoomCard, setZoomCard] = useState<any | null>(null);
  const zoomTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleZoomStart = (card: any) => {
    if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current);
    zoomTimerRef.current = setTimeout(() => {
      setZoomCard(card);
    }, 1000);
  };

  const handleZoomEnd = () => {
    if (zoomTimerRef.current) {
      clearTimeout(zoomTimerRef.current);
      zoomTimerRef.current = null;
    }
    setZoomCard(null);
  };

  const isSealed = room?.rules?.isSealed;
  const eventTitle = isSealed ? 'Evento Sealed' : 'Evento Draft';
   const myPlayer = room?.players?.find((p: any) => p.playerId === playerId);
  
  React.useEffect(() => {
    if (!room || room.status !== 'completed') return;
    
    const historyKey = 'mtg_draft_history';
    const saved = localStorage.getItem(historyKey);
    let history = [];
    if (saved) {
      try { history = JSON.parse(saved); } catch (e) {}
    }
    
    // Check if this room is already in history
    if (history.some((h: any) => h.roomId === room.id && h.type === 'tournament')) return;
    
    const newRecord = {
      id: `tourney_${room.id}_${Date.now()}`,
      roomId: room.id,
      date: new Date().toISOString(),
      cubeName: room.rules?.cubeName || (isSealed ? 'Sealed Tournament' : 'Draft Tournament'),
      type: 'tournament',
      roomSnapshot: room,
      playerPool: myPlayer?.pool || [],
      playerCount: room.players.length,
    };
    
    const updatedHistory = [newRecord, ...history].slice(0, 50);
    localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
  }, [room, myPlayer, isSealed]);

  return (
    <PageLayout variant="slate" className="overflow-y-auto custom-scrollbar">
      <div className="max-w-6xl mx-auto py-20 px-6 space-y-16">
        
        {/* HEADER SECTION */}
        <div className="text-center space-y-6 relative">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-24 h-24 bg-indigo-600/10 rounded-3xl border border-indigo-500/20 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-600/10"
          >
             <CheckCircle2 className="w-12 h-12 text-indigo-400" />
          </motion.div>
          
          <div className="space-y-2">
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-5xl sm:text-7xl font-black text-white uppercase italic tracking-tighter leading-none"
            >
              {eventTitle} <span className="text-indigo-500">Concluso</span>
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-slate-400 font-bold uppercase tracking-[0.4em] text-xs"
            >
              L'evento è terminato. Tutti i mazzi sono stati salvati.
            </motion.p>
          </div>
        </div>

        {/* PRIMARY ACTIONS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <motion.button
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsReviewOpen(true)}
            className="flex flex-col items-center justify-center gap-4 p-8 bg-indigo-600 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-600/30 group transition-all"
          >
            <LayoutPanelLeft className="w-8 h-8 group-hover:rotate-12 transition-transform" />
            <span className="font-black uppercase tracking-widest text-xs">Il Mio Mazzo</span>
          </motion.button>

          {onViewTournament && (
            <motion.button
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={onViewTournament}
              className="flex flex-col items-center justify-center gap-4 p-8 bg-slate-900 border border-white/10 rounded-[2.5rem] text-white group transition-all hover:bg-slate-800"
            >
              <Trophy className="w-8 h-8 text-yellow-500 group-hover:scale-110 transition-transform" />
              <span className="font-black uppercase tracking-widest text-xs">Tabellone Finale</span>
            </motion.button>
          )}

          <motion.button
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="flex flex-col items-center justify-center gap-4 p-8 bg-slate-900 border border-white/10 rounded-[2.5rem] text-white group transition-all hover:bg-slate-800"
          >
            <Home className="w-8 h-8 text-slate-400 group-hover:text-white transition-colors" />
            <span className="font-black uppercase tracking-widest text-xs">Torna alla Home</span>
          </motion.button>
        </div>

        {/* PLAYERS LIST SECTION */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-white/5 pb-6">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                  <Users className="w-5 h-5 text-slate-400" />
               </div>
               <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Partecipanti</h2>
            </div>
            <span className="px-4 py-2 bg-white/5 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest border border-white/5">
              {room?.players?.length} Giocatori
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {room?.players?.map((player: any) => (
              <div 
                key={player.playerId}
                className={`p-6 rounded-[2rem] border transition-all ${
                  player.playerId === playerId 
                  ? 'bg-indigo-600/10 border-indigo-500/30' 
                  : 'bg-slate-900/50 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <img src={`/avatars/${player.avatar || 'ajani.png'}`} alt="" className="w-10 h-10 rounded-full border border-white/10" />
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-white uppercase tracking-tight truncate max-w-[120px]">
                        {player.name}
                      </span>
                      {player.playerId === playerId && (
                        <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest italic">Tu</span>
                      )}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setSelectedPlayerForPool(player)}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 hover:text-white transition-all  tracking-widest"
                  >
                    <Eye className="w-3 h-3" /> Cards Pool
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* POOL PREVIEW MODAL */}
      <AnimatePresence>
        {selectedPlayerForPool && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-2 sm:p-6 backdrop-blur-3xl bg-slate-950/80">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-[98vw] h-[95vh] bg-slate-900 rounded-[3rem] border border-white/10 shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between shrink-0">
                 <div className="flex items-center gap-6">
                    <img src={`/avatars/${selectedPlayerForPool.avatar || 'ajani.png'}`} alt="" className="w-16 h-16 rounded-full border-2 border-indigo-500" />
                    <div className="space-y-1">
                      <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">{selectedPlayerForPool.name}'s Pool</h3>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">{selectedPlayerForPool.pool?.length} Total Cards</p>
                    </div>
                 </div>
                 <button 
                    onClick={() => setSelectedPlayerForPool(null)}
                    className="w-14 h-14 bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-slate-400 rounded-full flex items-center justify-center border border-white/5 transition-all"
                 >
                    <ArrowLeft className="w-6 h-6" />
                 </button>
              </div>
              <div
                className="flex-1 p-4 sm:p-8 overflow-x-auto overflow-y-hidden custom-scrollbar bg-slate-950/50"
              >
                {(() => {
                  const pool = selectedPlayerForPool.pool || [];
                  const getColorGroup = (card: any) => {
                    const typeLine = card.typeLine || card.type_line || '';
                    const types = card.types || [];
                    if (typeLine.includes('Land') || types.includes('Land')) return 'L';
                    const colors = card.colors || card.card_colors || [];
                    if (colors.length > 1) return 'M';
                    if (colors.length === 1) return colors[0].toUpperCase();
                    return 'C';
                  };

                  const colorOrder = ['W', 'U', 'B', 'R', 'G', 'M', 'C', 'L'];
                  const colorNames: Record<string, string> = {
                    'W': 'White', 'U': 'Blue', 'B': 'Black', 'R': 'Red', 'G': 'Green',
                    'M': 'Multicolor', 'C': 'Colorless', 'L': 'Lands'
                  };

                  const groups: Record<string, Map<string, { card: any, count: number }>> = {};
                  colorOrder.forEach(c => { groups[c] = new Map(); });

                  pool.forEach((card: any) => {
                    const groupKey = getColorGroup(card);
                    const existing = groups[groupKey].get(card.name);
                    if (existing) {
                      existing.count++;
                    } else {
                      groups[groupKey].set(card.name, { card, count: 1 });
                    }
                  });

                  return (
                    <div className="flex gap-8 sm:gap-12 min-w-max h-full items-start">
                      {colorOrder.map(color => {
                        const items = Array.from(groups[color].values());
                        if (items.length === 0) return null;

                        items.sort((a, b) => (a.card.cmc || 0) - (b.card.cmc || 0));

                        // Usiamo un componente interno per gestire il ref di ogni colonna
                        return <ColumnContainer 
                          key={color} 
                          color={color} 
                          colorNames={colorNames} 
                          items={items} 
                          onZoomStart={handleZoomStart}
                          onZoomEnd={handleZoomEnd}
                        />;
                      })}
                    </div>
                  );
                })()}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ZOOM OVERLAY */}
      <AnimatePresence>
        {zoomCard && (
          <motion.div 
            initial={{ opacity: 0, x: -50, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.8 }}
            className="fixed bottom-10 left-10 z-[2000] pointer-events-none"
          >
            <div className="relative w-96 sm:w-[28rem] aspect-[2/3] z-10">
              <img 
                src={zoomCard.image_url} 
                alt={zoomCard.name} 
                className="w-full h-full object-contain rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.9)]"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MY DECK REVIEW MODAL */}
      <AnimatePresence>
        {isReviewOpen && (
          <DeckReviewView 
            pool={myPlayer?.pool || []}
            onClose={() => setIsReviewOpen(false)}
            onUpdatePool={() => {}}
            isPaused={false}
            timeLeft={null}
            isHost={false}
            onTogglePause={() => {}}
          />
        )}
      </AnimatePresence>

    </PageLayout>
  );
};
