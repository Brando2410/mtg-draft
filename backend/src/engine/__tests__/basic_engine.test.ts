import { EngineTestHarness } from './utils/EngineTestHarness';
import { Zone } from '@shared/engine_types';

describe('GameEngine - Core Loop & Spells', () => {
    let harness: EngineTestHarness;

    beforeEach(() => {
        harness = new EngineTestHarness();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should initialize completely and set starting life to 20', () => {
        const { p1, p2 } = harness.setupGame();
        
        expect(p1.life).toBe(20);
        expect(p2.life).toBe(20);
        expect(harness.engine.getState().activePlayerId).toBe('Player1');
    });

    it('should allow casting a basic spell and resolving the stack headless', () => {
        const { state, p1, p2 } = harness.setupGame();

        // 1. Give player mana and a card
        harness.addMana('Player1', { R: 1 });
        const spell = harness.putCardInZone('Player1', 'Shock', Zone.Hand);

        if (!spell) throw new Error('Card not found in logic map');

        // 2. Play the card targeting Player2
        harness.castSpell('Player1', spell.id, ['Player2']);

        // Assert spell is on the stack
        expect(state.stack.length).toBe(1);
        expect(state.stack[0].card?.definition.name).toBe('Shock');

        // 3. Auto-resolve the stack
        harness.resolveStack();

        // Assert damage was done, stack is cleared, and spell is in graveyard
        expect(state.stack.length).toBe(0);
        expect(p2.life).toBe(18); // Shock deals 2 damage
        expect(p1.graveyard.length).toBe(1);
        expect(p1.graveyard[0].definition.name).toBe('Shock');
    });

    it('should pause resolution when choice/interaction is required', () => {
        const { state, p1 } = harness.setupGame();

        // Witherbloom Charm requires a choice for its modes.
        harness.addMana('Player1', { B: 1, G: 1 });
        const charm = harness.putCardInZone('Player1', 'Witherbloom Charm', Zone.Hand);
        
        if (!charm) throw new Error('Card not found in logic map');

        // Cast it
        harness.castSpell('Player1', charm.id, []);

        // Assert that the engine correctly stopped at a pending action (Modal choice for mode)
        expect(state.pendingAction).toBeDefined();
        // The modal should ask which mode to choose
        expect(['MODAL_SELECTION', 'RESOLUTION_CHOICE']).toContain(state.pendingAction!.type);
    });
});
