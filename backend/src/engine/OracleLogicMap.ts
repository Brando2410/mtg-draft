import { m21 } from './data/m21';
import { random } from './data/random';
import { stx } from './data/stx';

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
    // Load Dedicated Set Logic
    [m21, random, stx].forEach(setRegistry => {
        Object.keys(setRegistry).forEach(name => {
            const enriched = {
                ...setRegistry[name],
                status: 'IMPLEMENTED'
            };
            this.registry.set(name.toLowerCase(), enriched);
        });
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
