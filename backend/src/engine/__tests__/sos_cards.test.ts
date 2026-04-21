import { EngineTestHarness } from './utils/EngineTestHarness';
import { Phase, Zone } from '@shared/engine_types';

describe('SOS Set - Gray Area Mechanics', () => {
    let harness: EngineTestHarness;

    beforeEach(() => {
        harness = new EngineTestHarness();
        // keep shouldLog = false to avoid test spam unless debugging
        harness.engine.shouldLog = false;
    });

    afterEach(() => {
        
    });

    it('Mind Roots: Resolves target discard, then prompts for Choice from discarded cards', () => {
        const { state, p1, p2, engine } = harness.setupGame();

        // 1. Setup Board
        const mindRoots = harness.putCardInZone('Player1', 'Mind Roots', Zone.Hand);
        
        // Setup Player 2's hand so they have exactly a land and a creature to discard
        harness.putCardInZone('Player2', 'Forest', Zone.Hand);
        harness.putCardInZone('Player2', 'Grizzly Bears', Zone.Hand);
        
        harness.addMana('Player1', { B: 1, G: 1, C: 1 });

        // Move to Main Phase so sorcery can be cast
        state.currentPhase = Phase.PreCombatMain;
        state.currentStep = 'Main' as any;
        engine.resetPriorityToActivePlayer();

        // 2. Cast Mind Roots targeting Player 2
        engine.playCard({
            playerId: p1.id,
            cardId: mindRoots!.id,
            targets: [p2.id]
        });

        // 3. Resolve to the discard action
        harness.resolveStack();

        // Player 2 should be prompted to discard 2 cards
        expect(state.pendingAction).toBeDefined();
        expect(state.pendingAction?.type).toBe('DISCARD');

        // Player2 discards Forest and Grizzly Bears
        const cardsToDiscard = p2.hand.map(c => c.id);
        cardsToDiscard.forEach(cId => {
            engine.discardCard(p2.id, cId);
        });

        // 4. Resolve the rest of the spell which prompts Player 1 to choose a discarded land
        expect(state.pendingAction).toBeDefined();
        expect(state.pendingAction?.type).toBe('MODAL_SELECTION'); // Adjust based on engine implementation
        
        // This is where Mind Roots currently fails: It tries to spawn a targeting choice from the selection pool
        // but loses context of what was discarded.
    });

    it('Vastlands Scavenger // Bind to Life: Resolves Mill, then prompts Choice from milled cards', () => {
         const { state, p1, engine } = harness.setupGame();

         // Setup
         const bindToLife = harness.putCardInZone('Player1', 'Vastlands Scavenger', Zone.Hand); // Usually cast as Prepared Face
         
         // Setup 7 known cards on top of library to mill
         for(let i=0; i<6; i++) {
             harness.putCardInZone('Player1', 'Plains', Zone.Library);
         }
         const bearInLibrary = harness.putCardInZone('Player1', 'Grizzly Bears', Zone.Library);
         
         harness.addMana('Player1', { G: 1, C: 4 });

         state.currentPhase = Phase.PreCombatMain;
         state.currentStep = 'Main' as any;
         engine.resetPriorityToActivePlayer();

         // Cast "Bind to Life" face (assuming playCard supports side selection/Prepared face)
         // In current engine, if you pass options.side = 'preparedFace'
         engine.playCard({
            playerId: p1.id,
            cardId: bindToLife!.id,
            // Mocking casting the alternate face
         });

         harness.resolveStack();
         
         // At this point, the game should pause and ask Player1 to pick a creature from the milled 7 cards
         expect(state.pendingAction).toBeDefined();
         // It should be a TARGET_SELECTION where the valid targets are restricted specifically to the milled items.
    });
});
