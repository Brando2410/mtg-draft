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
                if (card.preparedFace && card.preparedFace.name) {
                    const faceName = card.preparedFace.name;
                    if (!this.registry.has(faceName.toLowerCase())) {
                        this.registry.set(faceName.toLowerCase(), enriched as CardLogic);
                    }
                }
            });
        });
        console.log(`[ORACLE-DEBUG] Registry initialized with ${this.registry.size} card names.`);
    }

    public getCard(name: string): CardLogic | undefined {
        if (!name) return undefined;
        const lower = name.toLowerCase();
        let card = this.registry.get(lower);

        if (!card) {
            // 1. Try removing common punctuation
            const normalized = lower.replace(/[,']/g, '');
            card = this.registry.get(normalized);
        }

        if (!card) {
            // 2. "Super-Normalization" fallback: Remove ALL non-alphanumeric characters
            // This ensures "Witherbloom, the Balancer" matches "Witherbloom the Balancer" or "WitherbloomtheBalancer"
            const superNormalized = lower.replace(/[^a-z0-9]/g, '');
            for (const [key, value] of this.registry.entries()) {
                if (key.replace(/[^a-z0-9]/g, '') === superNormalized) {
                    return value;
                }
            }
        }

        if (!card && lower.includes(' // ')) {
            // 3. Try first face only if full name fails
            card = this.registry.get(lower.split(' // ')[0].trim());
        }

        return card;
    }

    public getAllCards(): CardLogic[] {
        return Array.from(this.registry.values());
    }
}

export const oracle = new OracleLogicMap();
