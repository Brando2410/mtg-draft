import { CardLogic } from '@shared/engine_types';
import { m21 } from './data/m21';
import { random } from './data/random';
import { sos } from './data/sos';
import { stx } from './data/stx';

/**
 * The Rules Oracle
 * Maps card names to their full engine-ready definitions.
 */
class OracleLogicMap {
  private registry: Map<string, CardLogic> = new Map();

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Load Dedicated Set Logic
    [m21, random, stx, sos].forEach(setRegistry => {
        Object.keys(setRegistry).forEach(name => {
            const enriched = {
                ...setRegistry[name],
                status: 'IMPLEMENTED'
            };
            this.registry.set(name.toLowerCase(), enriched as CardLogic);
        });
    });
  }

  public getCard(name: string): CardLogic | undefined {
    return this.registry.get(name.toLowerCase());
  }

  public getAllCards(): CardLogic[] {
    return Array.from(this.registry.values());
  }
}

export const oracle = new OracleLogicMap();
