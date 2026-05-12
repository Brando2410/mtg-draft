import { memo } from 'react';
import { Reorder } from 'framer-motion';
import { GripVertical } from 'lucide-react';
import { GameCard } from '../../arena/objects/GameCard';

interface TriggerOrderViewProps {
  orderedTriggers: any[];
  setOrderedTriggers: (vals: any[]) => void;
}

export const TriggerOrderView = memo(({ orderedTriggers, setOrderedTriggers }: TriggerOrderViewProps) => {
  return (
    <div className="flex flex-col items-center w-full px-12 py-4">
        <div className="w-full flex justify-between px-4 mb-12 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 relative">
             <div className="absolute left-0 right-0 h-px bg-white/10 top-1/2 -z-10" />
             <span className="bg-[#0b0f1a] px-6 text-indigo-400">Resolves Last</span>
             <span className="bg-[#0b0f1a] px-6 text-amber-400">Resolves First</span>
        </div>
        <Reorder.Group axis="x" values={orderedTriggers} onReorder={setOrderedTriggers} className="flex flex-row justify-center gap-12 w-full py-8">
            {orderedTriggers.map((trigger, idx) => (
                <Reorder.Item key={trigger.id || `trigger-${idx}`} value={trigger} className="relative group/trigger cursor-grab active:cursor-grabbing">
                    <div className="relative transform transition-transform group-hover/trigger:scale-[1.05] scale-100">
                        <GameCard obj={{ id: trigger.id, definition: trigger.definition || { name: trigger.name, image_url: trigger.image_url, types: ['Ability'] } } as any} variant="small" />
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 p-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 opacity-0 group-hover/trigger:opacity-100 transition-all shadow-xl">
                          <GripVertical className="w-4 h-4 text-indigo-400" />
                        </div>
                    </div>
                    <div className="mt-8 text-xs font-black italic text-slate-500 group-hover/trigger:text-indigo-400 transition-colors uppercase tracking-[0.2em]">
                        Step {orderedTriggers.indexOf(trigger) + 1}
                    </div>
                </Reorder.Item>
            ))}
        </Reorder.Group>
    </div>
  );
});
