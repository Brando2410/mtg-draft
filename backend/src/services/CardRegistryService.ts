import { CardDefinition } from '@shared/engine_types';
import { m21 } from '../engine/data/m21';
import { sos } from '../engine/data/sos';
import { stx } from '../engine/data/stx';
import { ManaProcessor } from '../engine/modules/magic/ManaProcessor';

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
  rarity?: string;
  subtypes?: string[];
}

export class CardRegistryService {
  private static allCards: RegistryCard[] = [];

  static initialize() {
    const combined: Record<string, { card: CardDefinition, set: string }> = {};

    console.log(`[REGISTRY] Starting initialization. SOS exists: ${!!sos}, M21 exists: ${!!m21}, STX: ${!!stx}`);

    try {
      if (m21) Object.entries(m21).forEach(([name, card]) => { combined[name] = { card, set: 'M21' }; });
      console.log(`[REGISTRY] Loaded M21: ${Object.keys(m21 || {}).length} entries`);
    } catch (e) { console.error('[REGISTRY] Error loading M21', e); }

    try {
      if (sos) Object.entries(sos).forEach(([name, card]) => { combined[name] = { card, set: 'SOS' }; });
      console.log(`[REGISTRY] Loaded SOS: ${Object.keys(sos || {}).length} entries`);
    } catch (e) { console.error('[REGISTRY] Error loading SOS', e); }

    try {
      if (stx) Object.entries(stx).forEach(([name, card]) => { combined[name] = { card, set: 'STX' }; });
      console.log(`[REGISTRY] Loaded STX: ${Object.keys(stx || {}).length} entries`);
    } catch (e) { console.error('[REGISTRY] Error loading STX', e); }

    this.allCards = Object.values(combined).map(({ card, set }) => {
      return {
        name: card.name,
        set: set,
        oracleText: card.oracleText,
        manaCost: card.manaCost,
        typeLine: card.type_line,
        cmc: ManaProcessor.getManaValue(card.manaCost),
        colors: card.colors,
        keywords: card.keywords,
        image_url: card.image_url,
        back_image_url: (card as any).back_image_url,
        scryfall_id: card.scryfall_id,
        rarity: (card as any).rarity,
        types: card.types,
        supertypes: (card as any).supertypes,
        subtypes: (card as any).subtypes
      };
    });

    // Deduplicate by name
    const seen = new Set<string>();
    this.allCards = this.allCards.filter(c => {
      if (seen.has(c.name)) return false;
      seen.add(c.name);
      return true;
    });

    console.log(`[REGISTRY] Initialization complete. Total unique cards: ${this.allCards.length}`);
  }

  static getAllCards(): RegistryCard[] {
    if (this.allCards.length === 0) {
      this.initialize();
    }
    return this.allCards;
  }

  static searchCards(query: string): RegistryCard[] {
    const cards = this.getAllCards();
    if (!query) return cards;
    const q = query.toLowerCase();
    return cards.filter(c => c.name.toLowerCase().includes(q));
  }
}
