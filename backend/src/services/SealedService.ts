import { Card, Player, Room } from '@shared/types';
import { m21 } from '../engine/data/m21';
import { sos } from '../engine/data/sos';
import { stx } from '../engine/data/stx';
import { LoggerService } from './LoggerService';
import { CardRegistryService } from './CardRegistryService';
import { PackService } from './PackService';

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
                if (!def.image_url) return;
                
                // Strictly cards from the specific set (Rule 2)
                if (def.isMysticalArchive || def.set?.toLowerCase() === 'sta' || def.set?.toLowerCase() === 'soa') return;
                
                // Skip basic lands (Basic Lands are usually provided for free in deckbuilding)
                if (def.supertypes?.includes('Basic') && (def.types?.includes('Land') || def.typeLine?.includes('Land'))) return;
                
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
                // Generate a pack seeded for rarity
                const pack = PackService.generateSeededPack(pool, cardsPerPack);
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
}
