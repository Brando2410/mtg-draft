import type { SimplifiedCard } from './scryfall';

const API_URL = import.meta.env.VITE_API_URL || '';

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
        notFound.push(name);
      }
    }
  });

  const enrichedMatches = await enrichCardsWithScryfall(registryMatches);
  const found = enrichedMatches.map(mapRegistryToSimplified);

  return { found, notFound };
};

export const enrichCardsWithScryfall = async (cards: RegistryCard[]): Promise<RegistryCard[]> => {
  const cardsToFetch = cards.filter(c => !c.image_url);
  if (cardsToFetch.length === 0) return cards;

  // Use Scryfall collection API for batch enrichment
  const names = cardsToFetch.map(c => c.name);
  try {
    const scryfallRes = await fetch('https://api.scryfall.com/cards/collection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifiers: names.map(name => ({ name }))
      })
    });

    if (scryfallRes.ok) {
      const data = await scryfallRes.json();
      const scryfallMap = new Map();
      data.data?.forEach((sc: any) => {
        if (sc && sc.name) {
          scryfallMap.set(sc.name.toLowerCase(), {
            image_url: sc.image_uris?.normal || sc.card_faces?.[0]?.image_uris?.normal,
            back_image_url: sc.card_faces?.[1]?.image_uris?.normal,
            scryfall_id: sc.id
          });
        }
      });

      return cards.map(c => {
        const enriched = scryfallMap.get(c.name.toLowerCase());
        if (enriched) {
          return {
            ...c,
            image_url: c.image_url || enriched.image_url,
            back_image_url: c.back_image_url || enriched.back_image_url,
            scryfall_id: c.scryfall_id || enriched.scryfall_id
          };
        }
        return c;
      });
    }
  } catch (err) {
    console.error('Error enriching with Scryfall:', err);
  }
  return cards;
};
