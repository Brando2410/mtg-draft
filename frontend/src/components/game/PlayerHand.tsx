import { type GameObject } from '@shared/engine_types';
import { motion, Reorder } from 'framer-motion';
import { useState, useEffect } from 'react';

interface PlayerHandProps {
  hand: GameObject[];
  onPlayCard?: (cardId: string) => void;
}

export const PlayerHand = ({ hand, onPlayCard }: PlayerHandProps) => {
  const [items, setItems] = useState<GameObject[]>(hand);

  // Sync with prop when server updates
  useEffect(() => {
    setItems(hand);
  }, [hand]);

  return (
    <div className="h-52 bg-slate-900/90 border-t border-white/10 backdrop-blur-xl flex items-center justify-center z-20 overflow-visible">
      {items.length === 0 ? (
        <div className="text-slate-600 font-black uppercase text-[10px] tracking-widest italic">La tua mano è vuota</div>
      ) : (
        <Reorder.Group 
          axis="x" 
          values={items} 
          onReorder={setItems}
          className="flex items-center justify-center px-10 h-full w-full gap-2"
        >
          {items.map((card) => (
            <Reorder.Item
              key={card.id}
              value={card}
              layoutId={card.id}
              className="relative shrink-0 z-10"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              whileHover={{ y: -40, scale: 1.1, zIndex: 100 }}
              style={{ cursor: 'grab' }}
            >
               <motion.div
                  drag="y"
                  dragConstraints={{ bottom: 0, top: -1000 }}
                  dragElastic={0.4}
                  whileDrag={{ scale: 1.2, zIndex: 1000 }}
                  onDragEnd={(_, info) => {
                     // Se trascinata in alto di oltre 120 pixel, la giochiamo
                     if (info.offset.y < -120) {
                        onPlayCard?.(card.id);
                     }
                  }}
                  className="relative group h-full"
               >
                  <img 
                    src={card.definition.image_url} 
                    alt={card.definition.name}
                    className="w-32 h-44 object-cover rounded-xl shadow-2xl border border-white/10 select-none pointer-events-none group-hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] transition-all"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://gamepedia.cursecdn.com/mtgsalvation_gamepedia/f/f8/Magic_card_back.jpg';
                    }}
                  />
                  {/* HINT PER PLAY */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-600 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter text-white whitespace-nowrap pointer-events-none">
                     Trascina per lanciare
                  </div>
               </motion.div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}
    </div>
  );
};
