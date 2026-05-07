import { DrawEffect, EffectDefinition, GameState, PlayerId, ResolutionContext, Zone } from '@shared/engine_types';
import { LogCategory } from '../../../../utils/EngineLogger';
import { getProcessors } from '../../../ProcessorRegistry';
import { ActionProcessor } from '../../../actions/ActionProcessor';
import { RestrictionValidator } from '../../../core/RestrictionValidator';
import { IEffectHandler } from '../../IEffectHandler';

export const DrawCardsHandler: IEffectHandler<DrawEffect> = {
    handle(state, effect, context) {
        const { effect: EP } = getProcessors(state);
        const { targets, controllerId } = context;
        
        const playerIds = targets.filter(tid => state.players[tid as PlayerId]) as PlayerId[];
        if (playerIds.length === 0) playerIds.push(controllerId);

        playerIds.forEach(pid => {
            const amount = EP.resolveAmount(state, effect.amount, context, [pid]);
            drawCards(state, pid, amount, context, effect);
        });
    }
};

function drawCards(state: GameState, playerId: PlayerId, amount: number, context: ResolutionContext, originalEffect: EffectDefinition) {
    const { logger } = getProcessors(state);
    const player = state.players[playerId];
    if (!player) return;

    // CR 121.2: If a player is forbidden from drawing cards, draw effects are ignored.
    if (!RestrictionValidator.canDrawCards(state, playerId)) {
        logger.info(state, LogCategory.ACTION, `${player.name} cannot draw cards due to a restriction.`);
        return;
    }

    for (let i = 0; i < amount; i++) {
        if (player.library.length === 0) {
            player.hasLostDueToEmptyLibrary = true;
            logger.info(state, LogCategory.ACTION, `${player.name} attempted to draw from an empty library.`);
            break;
        }
        const card = player.library[player.library.length - 1];
        ActionProcessor.removeFromCurrentZone(state, card);
        ActionProcessor.moveCard(state, card, Zone.Hand, playerId, 'top', true);
    }

    // --- NESTED EFFECTS SUPPORT ---
    if (originalEffect.effects && originalEffect.effects.length > 0) {
        const { effect: EP } = getProcessors(state);
        EP.resolveEffects({
            state,
            effects: originalEffect.effects,
            sourceId: context.sourceId || context.stackObject?.id || playerId,
            targets: [playerId], // For draw, usually the player is the target of follow-up effects
            startIndex: 0,
            stackObject: context.stackObject,
            parentContext: context,
        });
    }
}
