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
  };
  mana_cost?: string;
  card_faces?: { // Per carte bifronte (Modal Double Faced Layout)
    image_uris?: {
      normal: string;
    };
    colors?: string[];
    type_line: string;
    mana_cost?: string;
  }[];
}

export interface SimplifiedCard {
  scryfall_id: string;
  name: string;
  rarity: string;
  color: string[];
  image_url: string;
  cmc: number;
  type_line: string;
  mana_cost: string;
}

// 1. Usa la search di Scryfall per ottenere metadati (rarità, costo) già nel dropdown
// Ora rispetta rigorosamente la lingua selezionata (EN o IT) senza forzare conversioni
export const fetchSearchCards = async (query: string, lang: 'en' | 'it' = 'en'): Promise<ScryfallCard[]> => {
  if (!query || query.length < 2) return [];
  try {
    // Cerchiamo specificatamente nella lingua scelta. Scryfall tradurrà internamente se usiamo fuzzy o oracle, 
    // ma qui vogliamo i risultati nella lingua dell'input dell'utente.
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

// 2. Fetch della carta esatta (ora mantiene la lingua scelta dall'utente)
export const fetchExactCard = async (exactName: string, lang: 'en' | 'it' = 'en'): Promise<SimplifiedCard | null> => {
  try {
    // Usiamo il parametro lang esplicito di Scryfall per ottenere l'edizione localizzata corretta
    const queryParam = lang === 'en' ? `exact=${encodeURIComponent(exactName)}&lang=en` : `fuzzy=${encodeURIComponent(exactName)}&lang=it`;
    const res = await fetch(`https://api.scryfall.com/cards/named?${queryParam}`);
    if (!res.ok) return null;
    let card: any = await res.json();
    
    const imageUrl = card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || '';
    const colors = card.colors || card.card_faces?.[0]?.colors || [];
    const typeLine = card.type_line || card.card_faces?.[0]?.type_line || '';
    const manaCost = card.mana_cost || card.card_faces?.[0]?.mana_cost || '';

    return {
      scryfall_id: card.id,
      name: card.name,
      rarity: card.rarity,
      color: colors,
      image_url: imageUrl,
      cmc: card.cmc,
      type_line: typeLine,
      mana_cost: manaCost
    };
  } catch (err) {
    console.error('Fetch card error:', err);
    return null;
  }
};
