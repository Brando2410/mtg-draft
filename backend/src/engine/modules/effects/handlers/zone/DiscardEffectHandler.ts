import { EffectDefinition, GameState, PlayerId, ResolutionContext } from '@shared/engine_types';
import { getProcessors } from '../../../ProcessorRegistry';
import { ChoiceGenerator } from '../../ChoiceGenerator';

export class DiscardEffectHandler {
    public static handle(state: GameState, effect: EffectDefinition, context: ResolutionContext) {
        const { effect: EP } = getProcessors(state);
        const { targets, controllerId, stackObject, parentContext } = context;
        const discardEff = effect as any;
        
        const targetIds = effect.targetId ? [effect.targetId] : targets;
        const finalTargetIds = targetIds.length === 0 && !parentContext ? stackObject?.targets || [] : targetIds;

        const playerIds = finalTargetIds.filter(id => state.players[id as PlayerId]) as PlayerId[];
        if (playerIds.length === 0 && !effect.targetDefinition && !effect.targetMapping) playerIds.push(controllerId);

        const amount = (typeof discardEff.amount === "number" || typeof discardEff.amount === "string") ? discardEff.amount : 1;
        
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
}
