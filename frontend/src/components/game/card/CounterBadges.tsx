import { memo } from 'react';

interface CounterBadgesProps {
  counters: Record<string, number>;
}

export const CounterBadges = memo(({ counters }: CounterBadgesProps) => {
  return (
    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 flex flex-col gap-[calc(var(--u)*0.5*var(--local-scale,1))] items-center z-[200] group-hover:scale-110 transition-transform">
      {Object.entries(counters).map(([type, val]) => {
        if (val <= 0 || type === 'loyalty') return null;

        const isPlus = type === '+1/+1';
        const isMinus = type === '-1/-1';

        const gradient = isPlus
          ? 'radial-gradient(circle at 30% 30%, #60a5fa, #2563eb 60%, #1d4ed8)'
          : isMinus
            ? 'radial-gradient(circle at 30% 30%, #f87171, #dc2626 60%, #b91c1c)'
            : 'radial-gradient(circle at 30% 30%, #fbbf24, #d97706 60%, #b45309)';

        return (
          <div
            key={type}
            style={{ background: gradient }}
            className="w-[calc(var(--u)*3*var(--local-scale,1))] h-[calc(var(--u)*3*var(--local-scale,1))] rounded-full flex items-center justify-center border border-white/50 shadow-[0_2px_6px_rgba(0,0,0,0.6),inset_0_-2px_4px_rgba(0,0,0,0.3)]"
          >
            <span className="text-white text-[calc(var(--u)*1.8*var(--local-scale,1))] font-black drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] select-none">
              {val}
            </span>
          </div>
        );
      })}
    </div>
  );
});
