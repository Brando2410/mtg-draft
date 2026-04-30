import { DrawEffect, EffectDefinition, GameState, PlayerId, ResolutionContext, Zone } from '@shared/engine_types';
import { getProcessors } from '../../../ProcessorRegistry';
import { ActionProcessor } from '../../../actions/ActionProcessor';

export class MillEffectHandler {
    public static handle(state: GameState, effect: EffectDefinition, context: ResolutionContext) {
        const { effect: EP } = getProcessors(state);
        const { targets, controllerId } = context;
        const millEff = effect as DrawEffect; // Mill often uses amount from DrawEffect or MoveEffect
        
        const playerIds = targets.filter(tid => state.players[tid as PlayerId]) as PlayerId[];
        if (playerIds.length === 0) playerIds.push(controllerId);

        playerIds.forEach(pid => {
            const amount = EP.resolveAmount(state, millEff.amount, context, [pid]);
            this.millCards(state, pid, amount, context, effect);
        });
    }

    private static millCards(state: GameState, playerId: PlayerId, amount: number, context: ResolutionContext, originalEffect: EffectDefinition) {
        const player = state.players[playerId];
        if (!player) return;

        const milledIds: string[] = [];
        for (let i = 0; i < amount && player.library.length > 0; i++) {
            const card = player.library.pop()!;
            milledIds.push(card.id);
            ActionProcessor.moveCard(state, card, Zone.Graveyard, playerId, 'top', false);
        }

        state.turnState.lastMilledIds = milledIds;

        // --- NESTED EFFECTS SUPPORT ---
        if (originalEffect.effects && originalEffect.effects.length > 0) {
            const { effect: EP } = getProcessors(state);
            EP.resolveEffects({
                state,
                effects: originalEffect.effects,
                sourceId: context.stackObject?.sourceId || playerId,
                targets: milledIds,
                startIndex: 0,
                stackObject: context.stackObject,
                parentContext: context,
            });
        }
    }
}
