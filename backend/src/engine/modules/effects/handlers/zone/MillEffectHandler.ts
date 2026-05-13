import { DrawEffect, EffectDefinition, GameState, PlayerId, EngineFrame, Zone, TriggerEvent } from '@shared/engine_types';
import { getProcessors } from '../../../ProcessorRegistry';
import { ActionProcessor } from '../../../actions/ActionProcessor';
import { IEffectHandler } from '../../IEffectHandler';
import { LogCategory } from '../../../../utils/EngineLogger';

export const MillEffectHandler: IEffectHandler<DrawEffect> = {
    handle(state, effect, context) {
        const { effect: EP, logger } = getProcessors(state);
        const { targets, controllerId } = context;

        logger.debug(state, LogCategory.ACTION, `[MILL-HANDLER] Resolving for ${context.sourceId}. Mapping Targets: ${targets?.join(', ')}`);

        const playerIds = targets.filter(tid => state.players[tid as PlayerId]) as PlayerId[];
        if (playerIds.length === 0) {
            logger.warn(state, LogCategory.ACTION, `[MILL-HANDLER] No valid target players found in context targets. Falling back to controller ${controllerId}.`);
            playerIds.push(controllerId);
        }

        playerIds.forEach(pid => {
            const amount = EP.resolveAmount(state, effect.amount, context, [pid]);
            logger.info(state, LogCategory.ACTION, `[MILL] ${state.players[pid]?.name || pid} milling ${amount} cards.`);
            millCards(state, pid, amount, context, effect);
        });
    }
};

function millCards(state: GameState, playerId: PlayerId, amount: number, context: EngineFrame, originalEffect: EffectDefinition) {
    const { logger, trigger: TriggerProcessor } = getProcessors(state);
    const player = state.players[playerId];
    if (!player) return;

    const milledIds: string[] = [];
    let actualAmount = 0;

    for (let i = 0; i < amount && player.library.length > 0; i++) {
        const card = player.library[player.library.length - 1];
        // ActionProcessor.removeFromCurrentZone(state, card); // Redundant, moveCard handles this
        const result = ActionProcessor.moveCard(state, card, Zone.Graveyard, playerId, 'top', false);
        if (result.success) {
            milledIds.push(card.id);
            actualAmount++;
        }
    }

    state.turnState.lastMilledIds = milledIds;
    context.lastMilledIds = milledIds;

    if (actualAmount > 0) {
        TriggerProcessor.onEvent(state, {
            type: TriggerEvent.Mill,
            playerId: playerId,
            payload: {
                amount: actualAmount,
                targetIds: milledIds,
                sourceId: context.sourceId
            }
        });
    }

    // --- NESTED EFFECTS SUPPORT ---
    if (originalEffect.effects && originalEffect.effects.length > 0) {
        const { effect: EP } = getProcessors(state);
        EP.resolveEffects({
            state,
            context: EP.createEngineFrame(state, {
                sourceId: context.sourceId || context.stackObject?.id || playerId,
                effects: originalEffect.effects,
                targets: milledIds,
                stackObject: context.stackObject,
                parentContext: context,
            })
        });
    }
}

