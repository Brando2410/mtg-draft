import { useMemo } from 'react';

export const useCardDimensions = (variant: string, definition: any) => {
  return useMemo(() => {
    const config = {
      battlefield: { width: '100%', height: '100%', rounded: 'rounded-sm' },
      full: { width: '100%', height: '100%', rounded: 'rounded-xl' },
      hand: { width: 'var(--card-w-hand)', height: 'var(--card-h-hand)', rounded: 'rounded-lg' },
      stack: { width: 'calc(var(--u) * 11)', height: 'calc(var(--u) * 15.3)', rounded: 'rounded-lg' },
      small: { width: 'calc(var(--u) * 8.5)', height: 'calc(var(--u) * 11.9)', rounded: 'rounded-md' },
      tiny: { width: 'calc(var(--u) * 5.1)', height: 'calc(var(--u) * 7.2)', rounded: 'rounded-sm' },
      zoom: {
        width: (definition?.faces && definition.faces.length > 1) ? 'calc(var(--u) * 92)' : 'calc(var(--u) * 48)',
        height: 'auto',
        rounded: 'rounded-2xl'
      }
    };
    return (config as any)[variant] || config.battlefield;
  }, [variant, definition?.faces]);
};
