import { useMemo } from 'react';
import { type GameObject } from '@shared/engine_types';

export const useCardDisplayData = (obj: GameObject, variant: string) => {
  const { definition, effectiveStats, isPrepared } = obj;

  const displayData = useMemo(() => {
    let imageUrl = definition.image_url;
    let name = definition.name;
    let manaCost = effectiveStats?.manaCost || definition.manaCost;

    // Handle Prepared face
    if (isPrepared && definition.preparedFace) {
      imageUrl = definition.preparedFace.image_url || imageUrl;
      if (variant !== 'battlefield' && variant !== 'zoom') {
        name = definition.preparedFace.name;
        manaCost = definition.preparedFace.manaCost;
      }
    } else if (definition.faces && definition.faces.length > 0) {
      imageUrl = definition.image_url || definition.faces[0].image_url;
    }

    // Split name for DFCs
    if (name.includes(' // ')) {
      name = name.split(' // ')[0];
    }

    // Format name
    const formattedName = name
      .replace(/[^a-zA-Z0-9 ]/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    return { imageUrl, name: formattedName, manaCost };
  }, [definition, effectiveStats, isPrepared, variant]);

  const colorConfig = useMemo(() => {
    const config: Record<string, { bg: string, from: string, to: string, border: string, text: string, hex: string, borderClass: string }> = {
      white: { bg: 'bg-stone-100/95', from: 'from-stone-100/95', to: 'to-stone-100/95', border: 'border-stone-400', text: 'text-stone-900', hex: '#f5f5f4', borderClass: 'border-slate-200 shadow-white/5' },
      blue: { bg: 'bg-blue-900/95', from: 'from-blue-900/95', to: 'to-blue-900/95', border: 'border-blue-400', text: 'text-white', hex: '#1e3a8a', borderClass: 'border-blue-500 shadow-blue-500/10' },
      black: { bg: 'bg-slate-900/95', from: 'from-slate-900/95', to: 'to-slate-900/95', border: 'border-slate-700', text: 'text-white', hex: '#0f172a', borderClass: 'border-slate-800 shadow-black/40' },
      red: { bg: 'bg-red-900/95', from: 'from-red-900/95', to: 'to-red-900/95', border: 'border-red-500', text: 'text-white', hex: '#7f1d1d', borderClass: 'border-red-600 shadow-red-600/10' },
      green: { bg: 'bg-emerald-900/95', from: 'from-emerald-900/95', to: 'to-emerald-900/95', border: 'border-emerald-500', text: 'text-white', hex: '#064e3b', borderClass: 'border-emerald-600 shadow-emerald-500/10' },
      colorless: { bg: 'bg-slate-800/95', from: 'from-slate-800/95', to: 'to-slate-800/95', border: 'border-slate-600', text: 'text-white', hex: '#1e293b', borderClass: 'border-slate-500 shadow-slate-500/5' },
      multicolor: { bg: 'bg-amber-700/95', from: 'from-amber-700/95', to: 'to-amber-900/95', border: 'border-amber-400', text: 'text-white', hex: '#b45309', borderClass: 'border-amber-400 shadow-amber-400/10' },
    };

    const objColors = definition.colors || [];
    const colors = objColors.map(c => c.toLowerCase()).sort((a, b) => (a === 'white' ? 1 : b === 'white' ? -1 : 0));
    const cardColor = colors.length > 1 ? 'multicolor' : (colors[0] || 'colorless');
    const mainConf = config[cardColor] || config.colorless;

    let headerClass = `${mainConf.bg} ${mainConf.border} ${mainConf.text}`;
    let borderStyle: any = {};

    if (colors.length > 1) {
      const configs = colors.map(c => config[c] || config.colorless);
      const gradientStops = configs.map(c => c.hex).join(', ');
      const headerGradient = `linear-gradient(to right, ${configs.map((c, i) => `${c.hex} ${(i / (configs.length - 1)) * 100}%`).join(', ')})`;
      const hasDark = colors.some(c => ['black', 'blue', 'red', 'green'].includes(c));
      const textColor = (colors.includes('white') && !hasDark) ? 'text-stone-900' : 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]';

      headerClass = `${textColor} border-amber-400/50`;
      if (variant !== 'zoom') {
        borderStyle = {
          background: `linear-gradient(#0f172a, #0f172a) padding-box, linear-gradient(to bottom right, ${gradientStops}) border-box`,
          border: '1.5px solid transparent'
        };
      }
      borderStyle.headerBackground = headerGradient;
    }

    return { headerClass, borderStyle, borderClass: mainConf.borderClass, cardColor };
  }, [definition.colors, variant]);

  const sizing = useMemo(() => {
    const headerHeight = {
      hand: 'calc(var(--u) * 3.6)',
      stack: 'calc(var(--u) * 2.4)',
      small: 'calc(var(--u) * 2.2)',
      tiny: 'calc(var(--u) * 1.7)',
      full: 'calc(var(--u) * 2.8)',
      zoom: '0',
      battlefield: `calc(var(--u) * 2.2 * var(--header-scale, var(--local-scale, 1)))`
    }[variant];

    const shroudHeight = {
      hand: 'calc(var(--u) * 3.4)',
      stack: 'calc(var(--u) * 2.8)',
      small: 'calc(var(--u) * 2.5)',
      tiny: 'calc(var(--u) * 2.0)',
      full: 'calc(var(--u) * 3.4)',
      battlefield: '0',
      zoom: '0'
    }[variant];

    const nameLen = displayData.name.length;
    const baseFontSize = nameLen > 25 ? 0.8 : nameLen > 18 ? 1.0 : 1.2;
    const variantScale = {
      hand: 1.8, stack: 1.1, small: 1.0, tiny: 0.8, full: 1.2, zoom: 2.5, battlefield: 1.4
    }[variant];
    const contextScale = variant === 'battlefield' ? 'var(--header-scale, var(--local-scale, 1))' : '1';
    const headerFontSize = `calc(var(--u) * ${baseFontSize * (variantScale || 1)} * ${contextScale})`;

    return { headerHeight, shroudHeight, headerFontSize };
  }, [variant, displayData.name]);

  return { ...displayData, ...colorConfig, ...sizing };
};
