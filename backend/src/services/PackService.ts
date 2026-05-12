import { Card } from '@shared/types';
import { CardRegistryService } from './CardRegistryService';

export class PackService {
    /**
     * Generates a seeded pack from a pool of cards based on rarity.
     * Follows standard MTG distribution: 1 Rare/Mythic, 3 Uncommons, 10 Commons.
     * If a land slot is desired, it replaces one common.
     */
    static generateSeededPack(pool: any[], count: number = 14): Card[] {
        const mythics = pool.filter(c => c.rarity?.toLowerCase() === 'mythic');
        const rares = pool.filter(c => c.rarity?.toLowerCase() === 'rare');
        const uncommons = pool.filter(c => c.rarity?.toLowerCase() === 'uncommon');
        const commons = pool.filter(c => c.rarity?.toLowerCase() === 'common');
        const lands = pool.filter(c => (c.type_line?.toLowerCase().includes('basic land') || c.types?.includes('Land')));

        // Combined rare/mythic pool (1/8 mythic rule)
        const rarePool = [...rares, ...mythics];
        const packDefs: any[] = [];

        // Check if we have enough metadata to seed
        const hasMetadata = pool.some(c => c.rarity);

        if (!hasMetadata || pool.length < count) {
            // Fallback to random if no metadata or pool too small
            const shuffled = [...pool].sort(() => Math.random() - 0.5);
            packDefs.push(...shuffled.slice(0, count));
        } else {
            // 1. Rare/Mythic Slot (Slot 1)
            if (rarePool.length > 0) {
                const isMythic = mythics.length > 0 && Math.random() < 0.125;
                const poolToUse = isMythic ? mythics : (rares.length > 0 ? rares : rarePool);
                packDefs.push(this.pickRandom(poolToUse));
            } else {
                packDefs.push(this.pickRandom(pool));
            }

            // 2. Uncommon Slots (Slots 2-4)
            for (let i = 0; i < 3; i++) {
                packDefs.push(this.pickRandom(uncommons.length > 0 ? uncommons : pool));
            }

            // 3. Land Slot (Slot 5) - replaces a common
            if (lands.length > 0) {
                packDefs.push(this.pickRandom(lands));
            } else {
                packDefs.push(this.pickRandom(commons.length > 0 ? commons : pool));
            }

            // 4. Common Slots (Remaining slots)
            const remaining = count - packDefs.length;
            for (let i = 0; i < remaining; i++) {
                packDefs.push(this.pickRandom(commons.length > 0 ? commons : pool));
            }
        }

        // Standardize and give unique IDs
        return packDefs.filter(d => d !== null).map(def => {
            const standardized = CardRegistryService.standardizeCard(def);
            return {
                ...standardized,
                id: `${standardized.scryfall_id || 'c'}-${Math.random().toString(36).substring(2, 9)}`
            };
        });
    }

    private static pickRandom(array: any[]): any {
        if (array.length === 0) return null;
        return array[Math.floor(Math.random() * array.length)];
    }
}
