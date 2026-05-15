import type { Card } from '../../../shared/types';

export interface ScryfallCard {
  id: string;
  name: string;
  rarity: string;
  colors: string[];
  cmc: number;
  type_line: string;
  image_uris?: {
    normal: string;
    small?: string;
    bottom?: string;
  };
  mana_cost?: string;
  card_faces?: {
    image_uris?: {
      normal: string;
    };
    colors?: string[];
    type_line: string;
    mana_cost?: string;
  }[];
}

export type SimplifiedCard = Card;

export const fetchSearchCards = async (query: string, lang: 'en' | 'it' = 'en'): Promise<ScryfallCard[]> => {
  if (!query || query.length < 2) return [];
  try {
    const queryString = `name%3A/${encodeURIComponent(query)}/+lang%3A${lang}`;

    const res = await fetch(`https://api.scryfall.com/cards/search?q=${queryString}&unique=oracle`);
    if (!res.ok) return [];

    const data = await res.json();
    return (data.data || []).slice(0, 8);
  } catch (err) {
    console.error('Search error:', err);
    return [];
  }
};

export const fetchExactCard = async (exactName: string, lang: 'en' | 'it' = 'en'): Promise<SimplifiedCard | null> => {
  try {
    const queryParam = lang === 'en' ? `exact=${encodeURIComponent(exactName)}&lang=en` : `fuzzy=${encodeURIComponent(exactName)}&lang=it`;
    const res = await fetch(`https://api.scryfall.com/cards/named?${queryParam}`);
    if (!res.ok) return null;
    let card: any = await res.json();

    const imageUrl = card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || '';
    const backImageUrl = (card.card_faces && card.card_faces[1]?.image_uris?.normal) || undefined;

    const colors = card.colors || card.card_faces?.[0]?.colors || [];
    const typeLine = card.type_line || card.card_faces?.[0]?.type_line || '';
    const manaCost = card.mana_cost || card.card_faces?.[0]?.mana_cost || '';

    return {
      id: card.id,
      scryfall_id: card.id,
      name: card.name,
      rarity: card.rarity,
      colors: colors,
      image_url: imageUrl,
      back_image_url: backImageUrl,
      cmc: card.cmc,
      typeLine: typeLine,
      types: typeLine.split(' — ')[0].split(' '),
      supertypes: [],
      subtypes: typeLine.includes(' — ') ? typeLine.split(' — ')[1].split(' ') : [],
      manaCost: manaCost,
      power: card.power || card.card_faces?.[0]?.power,
      toughness: card.toughness || card.card_faces?.[0]?.toughness,
      keywords: card.keywords || []
    };
  } catch (err) {
    console.error('Fetch card error:', err);
    return null;
  }
};
export const fetchCardsBatch = async (lines: string[]): Promise<{ found: SimplifiedCard[], notFound: string[] }> => {
  const found: SimplifiedCard[] = [];
  const notFound: string[] = [];

  const cardRegex = /^\s*(?:(\d+)x?\s+)?([^(\r\n]+)(?:\s+\(([^)]+)\)(?:\s+(\d+))?)?.*$/i;

  const identifiers: { name: string, qty: number }[] = [];

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.toLowerCase() === 'deck' || trimmed.toLowerCase() === 'sideboard' || trimmed.toLowerCase() === 'about' || trimmed.startsWith('Name ')) return;

    const match = trimmed.match(cardRegex);
    if (match) {
      const qty = parseInt(match[1] || '1', 10);
      const name = match[2].trim();
      if (name) identifiers.push({ name, qty });
    }
  });

  if (identifiers.length === 0) return { found, notFound };

  try {
    const batchSize = 75;
    // Scryfall collection API accetta max 75 identificatori
    for (let i = 0; i < identifiers.length; i += batchSize) {
      const currentBatch = identifiers.slice(i, i + batchSize);
      const res = await fetch('https://api.scryfall.com/cards/collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifiers: currentBatch.map(id => ({ name: id.name }))
        })
      });

      if (!res.ok) {
        notFound.push(...currentBatch.map(id => id.name));
        continue;
      }

      const data = await res.json();

      if (data.data) {
        data.data.forEach((card: any) => {
          if (card && card.id) {
            const idMapObj = currentBatch.find(id => id.name.toLowerCase() === card.name.toLowerCase() || (card.name.includes(' // ') && id.name.toLowerCase() === card.name.split(' // ')[0].toLowerCase()));
            const qty = idMapObj ? idMapObj.qty : 1;

            const imageUrl = card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || '';
            const backImageUrl = (card.card_faces && card.card_faces[1]?.image_uris?.normal) || undefined;
            const colors = card.colors || card.card_faces?.[0]?.colors || [];
            const typeLine = card.type_line || card.card_faces?.[0]?.type_line || '';
            const manaCost = card.mana_cost || card.card_faces?.[0]?.mana_cost || '';

            const simplified: SimplifiedCard = {
              id: card.id,
              scryfall_id: card.id,
              name: card.name,
              rarity: card.rarity,
              colors: colors,
              image_url: imageUrl,
              back_image_url: backImageUrl,
              cmc: card.cmc,
              typeLine: typeLine,
              types: typeLine.split(' — ')[0].split(' '),
              supertypes: [],
              subtypes: typeLine.includes(' — ') ? typeLine.split(' — ')[1].split(' ') : [],
              manaCost: manaCost,
              power: card.power || card.card_faces?.[0]?.power,
              toughness: card.toughness || card.card_faces?.[0]?.toughness,
              keywords: card.keywords || []
            };

            for (let k = 0; k < qty; k++) {
              found.push({ ...simplified });
            }
          }
        });
      }

      if (data.not_found && Array.isArray(data.not_found)) {
        data.not_found.forEach((item: any) => {
          if (item.name) notFound.push(item.name);
        });
      }

      if (i + batchSize < identifiers.length) {
        await new Promise(r => setTimeout(r, 100));
      }
    }

    return { found, notFound };
  } catch (err) {
    console.error('Batch fetch error:', err);
    return { found, notFound: identifiers.map(id => id.name) };
  }
};
