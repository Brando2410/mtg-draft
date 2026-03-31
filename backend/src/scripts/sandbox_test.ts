import { LayerProcessor } from '../engine/modules/state/LayerProcessor';
import { oracle } from '../engine/OracleLogicMap';
import { GameObject, GameState, Zone, Phase, Step, DurationType } from '@shared/engine_types';

/**
 * MTG RULES ENGINE SANDBOX
 * Use this to test complex interactions (Layers, Triggers, Costs) 
 */

async function runSandbox() {
    console.log("--- MTG ENGINE SANDBOX ---");

    const emptyPool = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 };
    
    const createPlayer = (id: string, name: string) => ({
        id, name, life: 20, poisonCounters: 0,
        library: [], hand: [], graveyard: [],
        manaPool: { ...emptyPool },
        hasPlayedLandThisTurn: false,
        fullControl: false,
        maxHandSize: 7,
        pendingDiscardCount: 0,
        manaCheat: false
    });

    const state: GameState = {
        players: {
            'player1': createPlayer('player1', 'Alice'),
            'player2': createPlayer('player2', 'Bob')
        },
        activePlayerId: 'player1',
        priorityPlayerId: 'player1',
        currentPhase: Phase.PreCombatMain,
        currentStep: Step.Main,
        turnNumber: 1,
        battlefield: [],
        stack: [],
        exile: [],
        ruleRegistry: {
            continuousEffects: [],
            activatedAbilities: [],
            triggeredAbilities: [],
            restrictions: []
        },
        consecutivePasses: 0,
        logs: [],
        turnState: {
            permanentReturnedToHandThisTurn: false,
            noncombatDamageDealtToOpponents: 0,
            creaturesAttackedThisTurn: 0,
            lastDamageAmount: 0,
            lastLifeGainedAmount: 0,
            lastCardsDrawnAmount: 0
        }
    };

    // 2. Spawn Objects (Using M21 Oracle)
    const spawnCard = (name: string, controllerId: string): GameObject => {
        const def = oracle.getCard(name);
        if (!def) throw new Error(`Card not found: ${name}`);
        
        return {
            id: `obj_${Math.random().toString(36).substr(2, 9)}`,
            controllerId,
            ownerId: controllerId,
            definition: {
                name: def.name,
                manaCost: def.manaCost,
                colors: def.colors,
                supertypes: [],
                types: def.typeLine.split(' — ')[0].split(' '),
                subtypes: def.typeLine.split(' — ')[1]?.split(' ') || [],
                power: def.power,
                toughness: def.toughness,
                keywords: def.keywords || [],
                oracleText: def.oracleText,
            },
            zone: Zone.Battlefield,
            counters: {},
            keywords: [],
            isTapped: false,
            damageMarked: 0,
            deathtouchMarked: false,
            isPhasedOut: false,
            summoningSickness: true,
            abilitiesUsedThisTurn: 0,
            faceDown: false
        };
    };

    const bear = spawnCard("Alpine Watchdog", "player1");
    state.battlefield.push(bear);

    console.log(`\nSpawned: ${bear.definition.name} (Base: ${bear.definition.power}/${bear.definition.toughness})`);

    // 3. Test Layer 6 & 7 (Humility Path)
    console.log("\nApplying 'Humility' effect (Lose all abilities, become 1/1)...");
    state.ruleRegistry.continuousEffects.push({
        id: 'humility_eff_1',
        sourceId: 'global',
        controllerId: 'player1',
        layer: 6,
        removeAllAbilities: true,
        activeZones: [Zone.Battlefield],
        targetControllerId: 'ALL',
        duration: { type: DurationType.Permanent },
        timestamp: Date.now()
    });
    state.ruleRegistry.continuousEffects.push({
        id: 'humility_eff_2',
        sourceId: 'global',
        controllerId: 'player1',
        layer: 7, 
        powerSet: 1,
        toughnessSet: 1,
        activeZones: [Zone.Battlefield],
        targetControllerId: 'ALL',
        duration: { type: DurationType.Permanent },
        timestamp: Date.now()
    });

    let stats = LayerProcessor.getEffectiveStats(bear, state);
    console.log(`Result: ${stats.power}/${stats.toughness}, Keywords: [${stats.keywords.join(', ')}]`);

    // 4. Test Layer 7c (Giant Growth)
    console.log("\nApplying '+3/+3' modifier (Giant Growth)...");
    state.ruleRegistry.continuousEffects.push({
        id: 'gg_eff',
        sourceId: 'floating',
        controllerId: 'player1',
        layer: 7,
        powerModifier: 3,
        toughnessModifier: 3,
        activeZones: [Zone.Battlefield],
        targetIds: [bear.id],
        duration: { type: DurationType.UntilEndOfTurn },
        timestamp: Date.now() + 1
    });

    stats = LayerProcessor.getEffectiveStats(bear, state);
    console.log(`Final Result: ${stats.power}/${stats.toughness} (Correct MTG result: 4/4)`);

    console.log("\n--- SANDBOX FINISHED ---");
}

runSandbox().catch(console.error);
