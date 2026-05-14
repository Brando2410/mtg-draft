import { DrawEffect, EffectDefinition, GameState, PlayerId, EngineFrame, Zone } from '@shared/engine_types';
import { LogCategory } from '../../../../utils/EngineLogger';
import { getProcessors } from '../../../ProcessorRegistry';
import { ActionProcessor } from '../../../actions/ActionProcessor';
import { RestrictionValidator } from '../../../core/RestrictionValidator';
import { IEffectHandler } from '../../IEffectHandler';

export const DrawCardsHandler: IEffectHandler<DrawEffect> = {
    handle(state, effect, context) {
        const { effect: EP, logger } = getProcessors(state);
        const { targets, controllerId } = context;
        
        const playerIds = targets.filter(tid => state.players[tid as PlayerId]) as PlayerId[];
        if (playerIds.length === 0) playerIds.push(controllerId);

        playerIds.forEach(pid => {
            const amount = EP.resolveAmount(state, effect.amount, context, [pid]);
            
            if (amount > 1) {
                logger.debug(state, LogCategory.ACTION, `[DRAW-DECOMPOSE] Decomposing draw ${amount} into single draws to support interruptions.`);
                // Decompose into N "Draw 1" effects
                // Rule 608.2c: Decomposed effects are added to the list of remaining effects.
                // We add them in reverse order so they resolve 1 by 1 in the correct order?
                // Actually injectPostEffect(context, effect) adds at index+1.
                // If I want 3 draws, I should inject 3 times.
                // Loop 1: i=0. Inject D1 at i+1. [OriginalD3, D1]
                // Loop 2: i=1. Inject D1 at i+1. [OriginalD3, D1, D1]
                // Loop 3: i=2. Inject D1 at i+1. [OriginalD3, D1, D1, D1]
                // After OriginalD3 finishes, it moves to the first D1.
                for (let i = 0; i < amount; i++) {
                    EP.injectPostEffect(context, { ...effect, amount: 1 });
                }
                return;
            }

            drawCards(state, pid, amount, context, effect);
        });
    }
};

function drawCards(state: GameState, playerId: PlayerId, amount: number, context: EngineFrame, originalEffect: EffectDefinition) {
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
            context: EP.createEngineFrame(state, {
                sourceId: context.sourceId || context.stackObject?.id || playerId,
                effects: originalEffect.effects,
                targets: [playerId],
                stackObject: context.stackObject,
                parentContext: context,
            })
        });
    }
}

