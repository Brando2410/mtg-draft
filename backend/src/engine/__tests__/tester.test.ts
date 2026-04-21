import { EngineTestHarness } from './utils/EngineTestHarness';
import { Phase, Zone } from '@shared/engine_types';

describe('SOS Set - Tester of the Tangential', () => {
    let harness: EngineTestHarness;

    beforeEach(() => {
        harness = new EngineTestHarness();
        // Remove shouldLog = false to see output
        harness.engine.shouldLog = true;
    });

    afterEach(() => {
        
    });

    it('should pay X and move X counters correctly (The Complex Reflexive Choice)', () => {
        const { state, p1, engine } = harness.setupGame();

        // 1. Setup the Board
        const tester = harness.putCardInZone('Player1', 'Tester of the Tangential', Zone.Battlefield);
        if (!tester) throw new Error('Card missing from Oracle');
        tester.counters['+1/+1'] = 4; // Pre-load it

        // Provide a valid target "Other" creature
        const targetGeometer = harness.putCardInZone('Player1', "Geometer's Arthropod", Zone.Battlefield);
        if (!targetGeometer) throw new Error('Card missing from Oracle');

        // Give player Mana to pay for X
        harness.addMana('Player1', { U: 2 });

        // 2. Trigger the Ability (Move to Combat)
        state.currentPhase = Phase.PreCombatMain;
        engine.advanceStep(); // Moves to Beginning of Combat
        
        // Auto-pass priority to let the trigger start resolving
        harness.resolveStack(); 

        // 3. The Engine pauses and waits for the Player to choose if they want to pay
        // Expect a Modal Selection prompt
        expect(state.pendingAction).toBeDefined();
        if (state.pendingAction) {
             expect(['MODAL_SELECTION', 'RESOLUTION_CHOICE']).toContain(state.pendingAction.type);
        }

        // Let's assert the final states!
        // Player selects option 0 ("Pay {X}")
        const successChoice = engine.resolveChoice(p1.id, 0); 
        expect(successChoice).toBe(true);

        // The Engine prompts for the value of {X}
        expect(state.pendingAction).toBeDefined();
        expect(state.pendingAction?.type).toBe('CHOOSE_X');

        const successX = engine.resolveChoice(p1.id, 2); // Choose X=2
        expect(successX).toBe(true);

        // Now it should prompt for Target selection
        expect(state.pendingAction).toBeDefined();
        expect(state.pendingAction?.type).toBe('TARGET_SELECTION'); // Adjust based on actual type, likely TARGET_SELECTION

        const targetSuccess = engine.resolveTargeting(p1.id, targetGeometer.id);
        expect(targetSuccess).toBe(true);
        
        harness.resolveStack();
        expect(tester.counters['+1/+1']).toBe(2);
        expect(targetGeometer.counters['+1/+1']).toBe(2);
    });
});
