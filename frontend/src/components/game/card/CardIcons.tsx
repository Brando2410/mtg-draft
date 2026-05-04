import { memo } from 'react';

interface ManaSymbolsProps {
  cost: string;
  variant: string;
}

export const ManaSymbols = memo(({ cost, variant }: ManaSymbolsProps) => {
  if (!cost) return null;
  const symbols = cost.match(/\{([^}]+)\}/g)?.map(s => s.slice(1, -1)) || [];

  const baseSize = variant === 'zoom' ? 30 : (variant === 'tiny' ? 8 : 13);
  const finalSize = `calc(var(--u) * ${baseSize / 7.5} * var(--local-scale, 1))`;

  return (
    <div className="flex gap-0.5 items-center justify-end shrink-0 ml-auto">
      {symbols.map((s, i) => (
        <img
          key={i}
          src={`https://svgs.scryfall.io/card-symbols/${s.toUpperCase().replace(/\//g, '')}.svg`}
          alt={s}
          style={{ width: finalSize, height: finalSize }}
          className="drop-shadow-sm select-none shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ))}
    </div>
  );
});

interface KeywordIconProps {
  keyword: string;
}

export const KeywordIcon = memo(({ keyword }: KeywordIconProps) => {
  const icons: Record<string, string> = {
    'flying': '🕊️', 'reach': '🏹', 'trample': '🐘', 'deathtouch': '☠️',
    'lifelink': '❤️', 'vigilance': '👁️', 'menace': '🎭', 'haste': '🔥',
    'hexproof': '💠', 'prowess': '💪', 'defender': '🧱', 'first strike': '⚔️',
    'double strike': '⚔️⚔️', 'indestructible': '💎'
  };
  const key = keyword.toLowerCase();

  let icon = icons[key];
  if (!icon && key.includes('protection')) icon = '🛡️';

  if (!icon) return null;
  return (
    <div title={keyword} className="w-[calc(var(--u)*2.2*var(--local-scale,1))] h-[calc(var(--u)*2.2*var(--local-scale,1))] bg-black/60 backdrop-blur-sm rounded flex items-center justify-center text-[calc(var(--u)*1.1*var(--local-scale,1))] shadow-sm">
      {icon}
    </div>
  );
});
