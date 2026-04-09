import { PersistenceService } from './src/services/PersistenceService';
import path from 'path';

async function test() {
    PersistenceService.init();
    console.log('Cubes Dir:', (PersistenceService as any).CUBES_DIR);
    const cubes = await PersistenceService.listCubes();
    console.log('Cubes found:', cubes);
    
    const decks = await PersistenceService.listDecks();
    console.log('Decks found:', decks);
}

test();
