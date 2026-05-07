import { DrawEffect, EffectType, PlayerId } from '@shared/engine_types';
import { getProcessors } from '../../../ProcessorRegistry';
import { ChoiceGenerator } from '../../ChoiceGenerator';
import { IEffectHandler } from '../../IEffectHandler';

export const ScrySurveilHandler: IEffectHandler<DrawEffect> = {
    handle(state, effect, context) {
        const { effect: EP } = getProcessors(state);
        const { targets, controllerId, stackObject, parentContext } = context;
        
        const amount = EP.resolveAmount(state, (effect.amount || 1), context, targets);
        const affectedPlayerId = (targets.find(tid => state.players[tid as PlayerId]) as PlayerId) || controllerId;
        const player = state.players[affectedPlayerId];
        if (!player) return;

        // Pop from library to temporary 'Looking' pool
        const cards = [];
        for (let i = 0; i < amount && player.library.length > 0; i++) {
            const card = player.library[player.library.length - 1];
            const { action: ActionProcessor } = getProcessors(state);
            ActionProcessor.removeFromCurrentZone(state, card);
            cards.push(card);
        }

        if (cards.length === 0) return;

        if (effect.type === EffectType.Scry) {
            state.pendingAction = ChoiceGenerator.createScryChoice(state, cards, {
                label: `Scry ${cards.length}`,
                playerId: affectedPlayerId,
                sourceId: context.sourceId || stackObject?.id || "",
                stackObj: stackObject,
                parentContext: parentContext,
                isSpellCasting: !!effect.isSpellCasting,
                isFreeCast: !!effect.isFreeCast,
            });
        } else if (effect.type === EffectType.Surveil) {
            state.pendingAction = ChoiceGenerator.createSurveilChoice(state, cards, {
                label: `Surveil ${cards.length}`,
                playerId: affectedPlayerId,
                sourceId: context.sourceId || stackObject?.id || "",
                stackObj: stackObject,
                parentContext: parentContext,
                isSpellCasting: !!effect.isSpellCasting,
                isFreeCast: !!effect.isFreeCast,
            });
        }
    }
};
