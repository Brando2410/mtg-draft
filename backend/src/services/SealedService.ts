import { Room, Card, Player } from '@shared/types';
import { sos } from '../engine/data/sos';
import { stx } from '../engine/data/stx';
import { m21 } from '../engine/data/m21';
import { LoggerService } from './LoggerService';

export class SealedService {
    static startSealed(room: Room) {
        LoggerService.info('SEALED', `Starting Sealed for room ${room.id}`);
        
        // 1. Determine the set pool
        const setCode = room.rules.cubeName.toLowerCase().includes('strixhaven') || room.rules.cubeName === 'sos' ? 'sos' : 'sos';
        const cardDefs = setCode === 'sos' ? sos : (setCode === 'stx' ? stx : m21);
        
        // 1.5 Collect all objects that are "preparedFace" sub-properties to exclude them
        const preparedFaces = new Set<any>();
        Object.values(cardDefs).forEach((def: any) => {
            if (def.preparedFace) {
                preparedFaces.add(def.preparedFace);
            }
        });

        // 2. Filter out non-set cards, duplicates, and prepared faces
        const uniqueCards = new Map<string, any>();
        const seenObjects = new Set<any>();
        
        Object.entries(cardDefs).forEach(([name, def]: [string, any]) => {
            // Deduplicate same object under multiple names (Rule 4)
            if (seenObjects.has(def)) return;
            seenObjects.add(def);

            const key = def.scryfall_id || name;
            if (!uniqueCards.has(key)) {
                // Skip prepared faces (Rule 3)
                if (preparedFaces.has(def)) return;

                // Ensure card has an image (Rule 5)
                if (!def.image_url && !def.image_uris) return;
                
                // Strictly cards from the specific set (Rule 2)
                if (def.isMysticalArchive || def.set?.toLowerCase() === 'sta') return;
                
                // If it's a "back face" entry that doesn't have the // in the name,
                // and there's a // version of the same object, skip it
                if (!name.includes(' // ') && Object.keys(cardDefs).some(k => k.startsWith(name + ' // '))) {
                    return; 
                }

                uniqueCards.set(key, def);
            }
        });
        const pool = Array.from(uniqueCards.values());
        
        const { packsPerPlayer = 6, cardsPerPack = 14 } = room.rules;
        
        room.players.forEach((player: Player) => {
            const playerPool: Card[] = [];
            
            for (let i = 0; i < packsPerPlayer; i++) {
                // Generate a pack
                // Since we don't have rarities, we just take random cards
                const pack = this.generatePack(pool, cardsPerPack);
                playerPool.push(...pack);
            }
            
            player.pool = playerPool;
            LoggerService.info('SEALED', `Generated pool of ${playerPool.length} cards for ${player.name}`);
        });
        
        room.status = 'deckbuilding'; 
        room.draftState = {
            round: 1,
            totalPicksInRound: 0,
            unopenedPacks: [],
            queues: room.players.map(() => []),
            playerTimers: {},
            playerTimersRemaining: {},
            isPaused: false,
            timeLeftPaused: null,
            selections: {}
        };
    }

    private static generatePack(pool: any[], _count: number): Card[] {
        // Step 1: Bucket cards by rarity (metadata expected later)
        const mythics = pool.filter(c => c.rarity?.toLowerCase() === 'mythic');
        const rares = pool.filter(c => c.rarity?.toLowerCase() === 'rare');
        const uncommons = pool.filter(c => c.rarity?.toLowerCase() === 'uncommon');
        const commons = pool.filter(c => c.rarity?.toLowerCase() === 'common');
        const lands = pool.filter(c => (c.type_line?.toLowerCase().includes('basic land') || c.types?.includes('Land')));

        // Combined rare/mythic pool (7/8 rare, 1/8 mythic rule)
        const rarePool = [...rares, ...mythics];

        const packDefs: any[] = [];

        // If no rarity metadata exists yet, fallback to random selection to avoid empty packs
        const hasMetadata = pool.some(c => c.rarity);

        if (!hasMetadata) {
            const shuffled = [...pool].sort(() => Math.random() - 0.5);
            packDefs.push(...shuffled.slice(0, 14));
        } else {
            // SLOT 1: Rare/Mythic
            if (rarePool.length > 0) {
                const isMythic = mythics.length > 0 && Math.random() < 0.125;
                const poolToUse = isMythic ? mythics : (rares.length > 0 ? rares : rarePool);
                packDefs.push(this.pickRandom(poolToUse));
            } else {
                packDefs.push(this.pickRandom(pool));
            }

            // SLOTS 2-4: Uncommons
            for (let i = 0; i < 3; i++) {
                packDefs.push(this.pickRandom(uncommons.length > 0 ? uncommons : pool));
            }

            // SLOTS 5-12: Commons (8 cards, no foils)
            for (let i = 0; i < 8; i++) {
                packDefs.push(this.pickRandom(commons.length > 0 ? commons : pool));
            }

            // SLOT 13: Basic Land / Common
            packDefs.push(this.pickRandom(lands.length > 0 ? lands : (commons.length > 0 ? commons : pool)));

            // SLOT 14: Wildcard (Any Rarity)
            packDefs.push(this.pickRandom(pool));
        }

        return packDefs.map(def => ({
            id: `${def.scryfall_id || 'c'}-${Math.random().toString(36).substring(2, 9)}`,
            scryfall_id: def.scryfall_id,
            name: def.name,
            rarity: def.rarity || 'common',
            image_url: def.image_url,
            image_uris: {
                normal: def.image_url || '',
                small: def.image_url || '',
                large: def.image_url || ''
            },
            type_line: def.type_line || def.typeLine,
            cmc: typeof def.cmc === 'number' ? def.cmc : 0, 
            colors: def.colors || def.card_colors || [],
            manaCost: def.manaCost,
            oracleText: def.oracleText,
            power: def.power?.toString(),
            toughness: def.toughness?.toString(),
            keywords: def.keywords || []
        }));
    }

    private static pickRandom(array: any[]): any {
        if (array.length === 0) return null;
        return array[Math.floor(Math.random() * array.length)];
    }
}
