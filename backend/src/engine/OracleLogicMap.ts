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
        this.registry.set(card.name.toLowerCase(), {
            ...card,
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
