import { DrawEffect, EffectDefinition, GameState, PlayerId, ResolutionContext, Zone } from '@shared/engine_types';
import { getProcessors } from '../../../ProcessorRegistry';
import { ActionProcessor } from '../../../actions/ActionProcessor';
import { IEffectHandler } from '../../IEffectHandler';

export const MillEffectHandler: IEffectHandler<DrawEffect> = {
    handle(state, effect, context) {
        const { effect: EP } = getProcessors(state);
        const { targets, controllerId } = context;
        
        const playerIds = targets.filter(tid => state.players[tid as PlayerId]) as PlayerId[];
        if (playerIds.length === 0) playerIds.push(controllerId);

        playerIds.forEach(pid => {
            const amount = EP.resolveAmount(state, effect.amount, context, [pid]);
            millCards(state, pid, amount, context, effect);
        });
    }
};

function millCards(state: GameState, playerId: PlayerId, amount: number, context: ResolutionContext, originalEffect: EffectDefinition) {
    const player = state.players[playerId];
    if (!player) return;

    const milledIds: string[] = [];
    for (let i = 0; i < amount && player.library.length > 0; i++) {
        const card = player.library[player.library.length - 1];
        ActionProcessor.removeFromCurrentZone(state, card);
        milledIds.push(card.id);
        ActionProcessor.moveCard(state, card, Zone.Graveyard, playerId, 'top', false);
    }

    state.turnState.lastMilledIds = milledIds;
    context.lastMilledIds = milledIds;

    // --- NESTED EFFECTS SUPPORT ---
    if (originalEffect.effects && originalEffect.effects.length > 0) {
        const { effect: EP } = getProcessors(state);
        EP.resolveEffects({
            state,
            effects: originalEffect.effects,
            sourceId: context.sourceId || context.stackObject?.id || playerId,
            targets: milledIds,
            startIndex: 0,
            stackObject: context.stackObject,
            parentContext: context,
        });
    }
}
