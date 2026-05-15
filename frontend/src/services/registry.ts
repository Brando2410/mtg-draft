import type { SimplifiedCard } from './scryfall';

export const calculateCMC = (manaCost: string): number => {
  const matches = manaCost.match(/\{([^}]+)\}/g) || [];
  let total = 0;
  matches.forEach(m => {
    const sym = m.replace(/[{}]/g, '');
    const num = parseInt(sym);
    if (!isNaN(num)) total += num;
    else if (['W', 'U', 'B', 'R', 'G', 'C', 'S'].includes(sym.toUpperCase())) total += 1;
    else if (sym.includes('/')) total += 1; // Hybrid
  });
  return total;
};

const API_URL = import.meta.env.VITE_API_URL || '';

export interface RegistryCard {
  name: string;
  set: string;
  oracleText?: string;
  manaCost?: string;
  typeLine?: string;
  types?: string[];
  supertypes?: string[];
  cmc?: number;
  colors?: string[];
  keywords?: string[];
  image_url?: string;
  back_image_url?: string;
  scryfall_id?: string;
  rarity?: string;
  subtypes?: string[];
}

export const fetchRegistryCards = async (query?: string): Promise<RegistryCard[]> => {
  try {
    const url = query ? `${API_URL}/api/cards?q=${encodeURIComponent(query)}` : `${API_URL}/api/cards`;
    const res = await fetch(url);
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error('Error fetching registry:', err);
    return [];
  }
};

export const mapRegistryToSimplified = (card: RegistryCard): SimplifiedCard => {
  return {
    id: card.scryfall_id || `local-${card.name}`,
    scryfall_id: card.scryfall_id || `local-${card.name}`,
    name: card.name,
    rarity: card.rarity || 'common',
    colors: card.colors || [],
    image_url: card.image_url || '',
    back_image_url: card.back_image_url,
    cmc: card.cmc ?? calculateCMC(card.manaCost || ''),
    typeLine: card.typeLine || '',
    types: card.types || (card.typeLine ? card.typeLine.split(' — ')[0].split(' ') : []),
    supertypes: card.supertypes || [],
    manaCost: card.manaCost || '',
    subtypes: card.subtypes || [],
    keywords: card.keywords || []
  };
};
export const fetchRegistryCardsBatch = async (names: string[]): Promise<{ found: SimplifiedCard[], notFound: string[] }> => {
  const allCards = await fetchRegistryCards();
  const notFound: string[] = [];
  const cardRegex = /^\s*(?:(\d+)x?\s+)?([^(\r\n]+)(?:\s+\(([^)]+)\)(?:\s+(\d+))?)?.*$/i;
  const registryMatches: RegistryCard[] = [];
  names.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.toLowerCase() === 'deck' || trimmed.toLowerCase() === 'sideboard') return;

    const match = trimmed.match(cardRegex);
    if (match) {
      const name = match[2].trim().toLowerCase();
      const regMatch = allCards.find(c => 
        c.name.toLowerCase() === name || 
        (c.name.includes(' // ') && c.name.split(' // ')[0].toLowerCase() === name)
      );
      if (regMatch) {
        // We store the match and its quantity to process later
        for (let i = 0; i < parseInt(match[1] || '1', 10); i++) {
           registryMatches.push(regMatch);
        }
      } else {
        console.log(`[BATCH] Could not find card in registry: ${name}`);
        notFound.push(name);
      }
    }
  });

  const found = registryMatches.map(mapRegistryToSimplified);
  return { found, notFound };
};
