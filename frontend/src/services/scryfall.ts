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
  back_image_url?: string; // Nuova proprietà per le carte bifronte
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
    
    // Logica per le immagini: Scryfall mette 'image_uris' a root per carte monofaccia, 
    // ma dentro 'card_faces' per le bifronte (transform, MDFC)
    const imageUrl = card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || '';
    const backImageUrl = (card.card_faces && card.card_faces[1]?.image_uris?.normal) || undefined;
    
    // Per le bifronte, sommiamo i colori o prendiamo quelli della prima faccia
    const colors = card.colors || card.card_faces?.[0]?.colors || [];
    const typeLine = card.type_line || card.card_faces?.[0]?.type_line || '';
    const manaCost = card.mana_cost || card.card_faces?.[0]?.mana_cost || '';

    return {
      scryfall_id: card.id,
      name: card.name,
      rarity: card.rarity,
      color: colors,
      image_url: imageUrl,
      back_image_url: backImageUrl,
      cmc: card.cmc,
      type_line: typeLine,
      mana_cost: manaCost
    };
  } catch (err) {
    console.error('Fetch card error:', err);
    return null;
  }
};
// 3. Fetch bulk di carte tramite l'endpoint collection di Scryfall (più efficiente per import massivi)
export const fetchCardsBatch = async (names: string[]): Promise<{ found: SimplifiedCard[], notFound: string[] }> => {
  const found: SimplifiedCard[] = [];
  const notFound: string[] = [];
  
  try {
    const batchSize = 75;
    for (let i = 0; i < names.length; i += batchSize) {
      const currentBatch = names.slice(i, i + batchSize);
      const res = await fetch('https://api.scryfall.com/cards/collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifiers: currentBatch.map(name => ({ name }))
        })
      });

      if (!res.ok) {
        // Se il batch intero fallisce, aggiungiamo tutti questi nomi ai non trovati
        notFound.push(...currentBatch);
        continue;
      }

      const data = await res.json();
      
      // Mappiamo i risultati trovati
      if (data.data) {
        data.data.forEach((card: any) => {
          if (card && card.id) {
            const imageUrl = card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || '';
            const backImageUrl = (card.card_faces && card.card_faces[1]?.image_uris?.normal) || undefined;
            
            const colors = card.colors || card.card_faces?.[0]?.colors || [];
            const typeLine = card.type_line || card.card_faces?.[0]?.type_line || '';
            const manaCost = card.mana_cost || card.card_faces?.[0]?.mana_cost || '';

            found.push({
              scryfall_id: card.id,
              name: card.name,
              rarity: card.rarity,
              color: colors,
              image_url: imageUrl,
              back_image_url: backImageUrl,
              cmc: card.cmc,
              type_line: typeLine,
              mana_cost: manaCost
            });
          }
        });
      }

      // I nomi non trovati sono indicati esplicitamente da Scryfall
      if (data.not_found && Array.isArray(data.not_found)) {
        data.not_found.forEach((item: any) => {
          if (item.name) notFound.push(item.name);
        });
      }
      
      if (i + batchSize < names.length) {
        await new Promise(r => setTimeout(r, 100));
      }
    }

    return { found, notFound };
  } catch (err) {
    console.error('Batch fetch error:', err);
    return { found, notFound: names };
  }
};
