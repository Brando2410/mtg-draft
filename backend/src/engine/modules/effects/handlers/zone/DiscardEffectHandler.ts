import { EffectDefinition, PlayerId } from '@shared/engine_types';
import { getProcessors } from '../../../ProcessorRegistry';
import { ChoiceGenerator } from '../../ChoiceGenerator';
import { IEffectHandler } from '../../IEffectHandler';

export const DiscardEffectHandler: IEffectHandler<EffectDefinition> = {
    handle(state, effect, context) {
        const { effect: EP } = getProcessors(state);
        const { targets, controllerId, stackObject, parentContext } = context;
        
        const targetIds = effect.targetId ? [effect.targetId] : targets;
        const finalTargetIds = targetIds.length === 0 && !parentContext ? stackObject?.targets || [] : targetIds;

        const playerIds = finalTargetIds.filter(id => state.players[id as PlayerId]) as PlayerId[];
        if (playerIds.length === 0 && !effect.targetDefinitions && !effect.targetMapping) playerIds.push(controllerId);

        const amount = (typeof effect.amount === "number" || typeof effect.amount === "string") ? effect.amount : 1;
        
        if (playerIds.length > 0) {
            state.pendingAction = ChoiceGenerator.createDiscardChoice(
                state,
                playerIds,
                stackObject?.sourceId || "",
                amount,
                effect.label || "Choose a card to discard",
                stackObject,
                parentContext,
                effect.effects,
            );
        }
    }
};
