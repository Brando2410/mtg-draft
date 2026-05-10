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
        Object.keys(setRegistry).forEach(key => {
            const card = setRegistry[key] as CardLogic;
            const enriched = {
                ...card,
                status: 'IMPLEMENTED'
            };
            
            // 1. Index by the key used in the registry (the canonical full name)
            this.registry.set(key.toLowerCase(), enriched as CardLogic);

            // 2. Index by the internal card name if different
            if (card.name && card.name.toLowerCase() !== key.toLowerCase()) {
                this.registry.set(card.name.toLowerCase(), enriched as CardLogic);
            }

            // 3. Handle Split/MDFC/Prepared names automatically
            if (card.name && card.name.includes(' // ')) {
                const faces = card.name.split(' // ');
                faces.forEach(face => {
                    if (!this.registry.has(face.toLowerCase())) {
                        this.registry.set(face.toLowerCase(), enriched as CardLogic);
                    }
                });
            }

            // 4. Specifically index preparedFace name if it exists (for SOS cards)
            if ((card as any).preparedFace && (card as any).preparedFace.name) {
                const faceName = (card as any).preparedFace.name;
                if (!this.registry.has(faceName.toLowerCase())) {
                    this.registry.set(faceName.toLowerCase(), enriched as CardLogic);
                }
            }
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
