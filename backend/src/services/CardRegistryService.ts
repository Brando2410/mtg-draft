import { Card, Player, Room } from '@shared/types';
import { CardDefinition } from '@shared/engine_types';
import { m21 } from '../engine/data/m21';
import { sos } from '../engine/data/sos';
import { stx } from '../engine/data/stx';
import { RuleUtils } from '../engine/utils/RuleUtils';

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
  types?: string[];
  supertypes?: string[];
}

export class CardRegistryService {
  private static allCards: RegistryCard[] = [];

  /**
   * Standardizes a card object from any source (engine data, scryfall, etc) 
   * into the unified Card interface used by the frontend and persistence.
   */
  static standardizeCard(raw: any): Card {
    const name = raw.name || 'Unknown Card';
    const scryfall_id = raw.scryfall_id || raw.id || '';
    const manaCost = (raw.manaCost || raw.mana_cost || '').trim();
    const image_url = raw.image_url || raw.image_uris?.normal || raw.image_uris?.large || '';
    const back_image_url = raw.back_image_url || raw.card_faces?.[1]?.image_uris?.normal || '';
    const keywords = raw.keywords || [];

    // Resolve Type Components
    const typeLine = raw.typeLine || raw.type_line || '';
    const parts = RuleUtils.getTypeLineParts(typeLine);

    const types = raw.types || parts.types;
    const subtypes = raw.subtypes || parts.subtypes;
    const supertypes = raw.supertypes || parts.supertypes;

    // Resolve Colors and CMC
    const colors = raw.colors || (manaCost ? RuleUtils.getColorsFromManaCost(manaCost) : []);
    const cmc = typeof raw.cmc === 'number' ? raw.cmc : (manaCost ? RuleUtils.getManaValue(manaCost) : 0);

    return {
      id: raw.id || `${scryfall_id}-${Math.random().toString(36).substring(2, 9)}`,
      scryfall_id,
      name,
      image_url,
      back_image_url,
      rarity: raw.rarity || 'unknown',
      manaCost,
      cmc,
      colors,
      typeLine,
      oracleText: raw.oracleText || raw.oracle_text || '',
      power: raw.power?.toString(),
      toughness: raw.toughness?.toString(),
      loyalty: raw.loyalty?.toString(),
      keywords,
      types,
      subtypes,
      supertypes
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
