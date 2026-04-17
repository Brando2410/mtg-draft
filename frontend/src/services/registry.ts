import { SimplifiedCard } from './scryfall';

const isDev = window.location.port === '5173';
const API_URL = import.meta.env.VITE_API_URL || (isDev ? 'http://localhost:4000' : window.location.origin);

export interface RegistryCard {
  name: string;
  set: string;
  oracleText?: string;
  manaCost?: string;
  typeLine?: string;
  cmc?: number;
  colors?: string[];
  keywords?: string[];
  image_url?: string;
  back_image_url?: string;
  scryfall_id?: string;
  engineStatus: 'IMPLEMENTED' | 'DATA_ONLY';
  manualStatus: 'VERIFIED' | 'MISSING';
}

export const fetchRegistryCards = async (query?: string): Promise<RegistryCard[]> => {
  try {
    const url = query ? `${API_URL}/api/implemented?q=${encodeURIComponent(query)}` : `${API_URL}/api/implemented`;
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
    scryfall_id: card.scryfall_id || `local-${card.name}`,
    name: card.name,
    rarity: 'common', // Unknown from current registry
    color: card.colors || [],
    image_url: card.image_url || '',
    back_image_url: card.back_image_url,
    cmc: card.cmc || 0,
    type_line: card.typeLine || '',
    mana_cost: card.manaCost || '',
    keywords: card.keywords || []
  };
};
