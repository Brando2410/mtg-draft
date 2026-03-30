import { GameEngine } from '../engine/GameEngine';
import { Phase, Step, Zone } from '@shared/engine_types';
import { ValidationProcessor } from '../engine/modules/state/ValidationProcessor';
import { DamageProcessor } from '../engine/modules/combat/DamageProcessor';

async function testEnginePhase2() {
    console.log("--- STARTING ENGINE PHASE 2 VERIFICATION ---");
    
    const engine = new GameEngine(['player1', 'player2'], {}, { 'player1': 'Alice', 'player2': 'Bob' });
    const state = engine.getState();

    // 1. TEST: INDESTRUCTIBILE
    const creature = (engine as any).createGameObject('player1', { 
        name: 'Indestructible Golem', 
        type_line: 'Creature — Golem', 
        power: '3', 
        toughness: '3', 
        keywords: ['Indestructible'] 
    }, 1);
    creature.zone = Zone.Battlefield;
    state.battlefield.push(creature);
    
    console.log("Applying 5 damage to Indestructible Golem...");
    creature.damageMarked = 5;
    (engine as any).checkStateBasedActions();
    
    if (state.battlefield.some(o => o.id === creature.id)) {
        console.log("SUCCESS: Indestructible Golem survived lethal damage.");
    } else {
        console.log("FAILURE: Indestructible Golem was destroyed.");
    }

    // 2. TEST: PLANESWALKER LOYALTY
    const basri = (engine as any).createGameObject('player1', { 
        name: 'Basri Ket', 
        type_line: 'Planeswalker — Basri', 
        loyalty: '3'
    }, 2);
    basri.zone = Zone.Battlefield;
    state.battlefield.push(basri);
    console.log(`Basri Ket entered with loyalty: ${basri.counters['loyalty']}`);
    
    basri.counters['loyalty'] = 0;
    (engine as any).checkStateBasedActions();
    
    if (!state.battlefield.some(o => o.id === basri.id)) {
        console.log("SUCCESS: Basri Ket moved to graveyard at 0 loyalty.");
    } else {
        console.log("FAILURE: Basri Ket stayed on battlefield at 0 loyalty.");
    }

    // 3. TEST: PROTECTION
    const slayer = (engine as any).createGameObject('player1', { 
        name: 'Baneslayer Angel', 
        type_line: 'Creature — Angel', 
        keywords: ['Protection from Demons'] 
    }, 3);
    slayer.zone = Zone.Battlefield;
    const demon = (engine as any).createGameObject('player2', { 
        name: 'Pit Lord', 
        type_line: 'Creature — Demon', 
        card_colors: ['B'] 
    }, 4);
    demon.zone = Zone.Battlefield;
    state.battlefield.push(slayer, demon);

    const isLegalTarget = ValidationProcessor.isLegalTarget(state, demon.id, slayer.id);
    console.log(`Can Demon target Baneslayer Angel? ${isLegalTarget}`);
    
    if (!isLegalTarget) {
        console.log("SUCCESS: Protection from Demons prevented targeting.");
    } else {
        console.log("FAILURE: Protection from Demons failed to prevent targeting.");
    }

    console.log("Demon trying to deal damage to Baneslayer...");
    DamageProcessor.dealDamage(state, demon.id, slayer.id, 5, false, console.log);
    
    if (slayer.damageMarked === 0) {
        console.log("SUCCESS: Protection from Demons prevented damage.");
    } else {
        console.log("FAILURE: Protection from Demons failed to prevent damage.");
    }
}

testEnginePhase2().catch(console.error);
