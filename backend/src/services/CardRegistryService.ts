import { Card, Player, Room } from '@shared/types';
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

  /**
   * Standardizes a card object from any source (engine data, scryfall, etc) 
   * into the unified Card interface used by the frontend and persistence.
   */
  static standardizeCard(raw: any): Card {
    const types = raw.types || [];
    const subtypes = raw.subtypes || [];
    const supertypes = raw.supertypes || [];

    // Construct typeLine if missing
    let typeLine = raw.typeLine || raw.type_line || '';
    if (!typeLine && types.length > 0) {
      const parts = [];
      if (supertypes.length > 0) parts.push(supertypes.join(' '));
      parts.push(types.join(' '));
      if (subtypes.length > 0) {
        parts.push('—');
        parts.push(subtypes.join(' '));
      }
      typeLine = parts.join(' ');
    }

    return {
      id: raw.id || `${raw.scryfall_id || 'c'}-${Math.random().toString(36).substring(2, 9)}`,
      scryfall_id: raw.scryfall_id || '',
      name: raw.name || 'Unknown Card',
      image_url: raw.image_url || raw.image_uris?.normal || '',
      back_image_url: raw.back_image_url || (raw as any).card_faces?.[1]?.image_uris?.normal,
      rarity: raw.rarity || 'common',
      manaCost: raw.manaCost || raw.mana_cost || '',
      cmc: typeof raw.cmc === 'number' ? raw.cmc : (raw.manaCost ? ManaProcessor.getManaValue(raw.manaCost) : 0),
      colors: raw.colors || raw.card_colors || [],
      typeLine: typeLine,
      oracleText: raw.oracleText || '',
      power: raw.power?.toString(),
      toughness: raw.toughness?.toString(),
      loyalty: raw.loyalty?.toString(),
      keywords: raw.keywords || [],
      types: types,
      supertypes: supertypes
    };
  }

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
      const standardized = this.standardizeCard(card);
      return {
        ...standardized,
        set: set,
        subtypes: (card as any).subtypes
      } as RegistryCard;
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
