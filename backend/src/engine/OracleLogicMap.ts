import m21Data from './data/m21_parsed.json';
import { M21_LOGIC } from './data/m21_logic';

/**
 * The Rules Oracle
 * Maps card names to their full engine-ready definitions.
 */
class OracleLogicMap {
  private registry: Map<string, any> = new Map();

  constructor() {
    this.initialize();
  }

  private initialize() {
    // 1. Load Raw JSON as baseline
    m21Data.forEach(card => {
        const text = (card.oracleText || (card as any).oracle_text || "").toLowerCase();
        const keywords: string[] = ((card as any).keywords && (card as any).keywords.length > 0) ? (card as any).keywords : [];
        
        if (keywords.length === 0) {
            // Extracted keywords from oracle text
            if (text.includes("flying")) keywords.push("Flying");
            if (text.includes("trample")) keywords.push("Trample");
            if (text.includes("vigilance")) keywords.push("Vigilance");
            if (text.includes("reach")) keywords.push("Reach");
            if (text.includes("deathtouch")) keywords.push("Deathtouch");
            if (text.includes("lifelink")) keywords.push("Lifelink");
            if (text.includes("haste")) keywords.push("Haste");
            if (text.includes("menace")) keywords.push("Menace");
            if (text.includes("indestructible")) keywords.push("Indestructible");
            if (text.includes("first strike")) keywords.push("First strike");
            if (text.includes("double strike")) keywords.push("Double strike");
            if (text.includes("hexproof")) keywords.push("Hexproof");
        }

        this.registry.set(card.name.toLowerCase(), {
            ...card,
            keywords: keywords,
            status: 'DATA_ONLY',
            abilities: [] // Parsed abilities are unreliable, reset them
        });
    });

    // 2. Load Consolidated Logic (Primary Source of Truth)
    Object.keys(M21_LOGIC).forEach(name => {
        const enriched = {
            ...M21_LOGIC[name],
            status: 'IMPLEMENTED'
        };
        this.registry.set(name.toLowerCase(), enriched);
    });
  }

  public getCard(name: string): any | undefined {
    return this.registry.get(name.toLowerCase());
  }

  public getAllCards(): any[] {
    return Array.from(this.registry.values());
  }
}

export const oracle = new OracleLogicMap();
