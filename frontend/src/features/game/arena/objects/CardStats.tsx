import { memo } from 'react';
import { Zap } from 'lucide-react';

interface CardStatsProps {
  isCreature: boolean;
  isPlaneswalker: boolean;
  variant: string;
  definition: any;
  stats: any;
  damageMarked: number;
  damagePreview: number;
  counters: Record<string, number>;
  cardColor: string;
}

export const CardStats = memo(({
  isCreature,
  isPlaneswalker,
  variant,
  definition,
  stats,
  damageMarked,
  damagePreview,
  counters,
  cardColor
}: CardStatsProps) => {
  if (variant !== 'battlefield') return null;

  if (isCreature) {
    const origP = parseInt(String(definition.power || '0'));
    const origT = parseInt(String(definition.toughness || '0'));
    const currentP = stats?.power ?? origP;
    const currentT = stats?.toughness ?? origT;
    const displayT = currentT - damageMarked;

    const pColor = currentP > origP ? 'text-emerald-400' : currentP < origP ? 'text-red-400' : 'text-white';
    const previewT = displayT - damagePreview;
    const tColor = (damagePreview > 0 || damageMarked > 0 || currentT < origT) ? 'text-red-400' : currentT > origT ? 'text-emerald-400' : 'text-white';

    return (
      <div className="bg-black shadow-2xl z-30 flex items-center justify-center absolute bottom-0 right-0 px-[6cqw] py-[2.5cqw] border-t-[1.5px] border-l-[1.5px] border-white/30 rounded-tl-[10%] min-w-[38cqw] min-h-[26cqw]">
        <div className="flex items-center gap-[3.5cqw]">
          <span className={`font-black tracking-tighter text-[10cqw] ${pColor}`}>
            {currentP}
          </span>
          <span className="text-[7.5cqw] text-white/40 font-bold -mx-[0.5cqw]">/</span>
          <span className={`font-black tracking-tighter text-[10cqw] ${tColor} ${damagePreview > 0 ? 'drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]' : ''}`}>
            {previewT}
          </span>
        </div>
      </div>
    );
  }

  if (isPlaneswalker) {
    return (
      <div className={`border rounded-md px-[calc(var(--u)*1.5*var(--local-scale,1))] py-[calc(var(--u)*0.5*var(--local-scale,1))] flex items-center gap-[calc(var(--u)*0.5*var(--local-scale,1))] shadow-2xl
                ${cardColor === 'white' ? 'bg-stone-100 border-stone-400 text-stone-900' :
          cardColor === 'blue' ? 'bg-blue-800 border-blue-400 text-white' :
            cardColor === 'black' ? 'bg-slate-900 border-slate-700 text-white' :
              cardColor === 'red' ? 'bg-red-800 border-red-500 text-white' :
                cardColor === 'green' ? 'bg-emerald-800 border-emerald-500 text-white' :
                  cardColor === 'multicolor' ? 'bg-amber-700 border-amber-400 text-white' :
                    'bg-slate-900 border-slate-600 text-white'}
              `}>
        <Zap className={`w-[calc(var(--u)*1.2*var(--local-scale,1))] h-[calc(var(--u)*1.2*var(--local-scale,1))] ${cardColor === 'white' ? 'text-stone-900 fill-stone-900' : 'text-amber-400 fill-amber-400'}`} />
        <span className="text-[calc(var(--u)*1.8*var(--local-scale,1))] font-black px-0.5">
          {counters.loyalty || 0}
        </span>
      </div>
    );
  }

  return null;
});
