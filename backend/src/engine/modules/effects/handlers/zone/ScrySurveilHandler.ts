import { DrawEffect, EffectDefinition, EffectType, GameState, PlayerId, ResolutionContext, Zone } from '@shared/engine_types';
import { getProcessors } from '../../../ProcessorRegistry';
import { ChoiceGenerator } from '../../ChoiceGenerator';

export class ScrySurveilHandler {
    public static handle(state: GameState, effect: EffectDefinition, log: (m: string) => void, context: ResolutionContext) {
        const { effect: EP } = getProcessors(state);
        const { targets, controllerId, stackObject, parentContext } = context;
        const amountEff = effect as DrawEffect;
        
        const amount = EP.resolveAmount(state, (amountEff.amount || 1), context, targets);
        const affectedPlayerId = (targets.find(tid => state.players[tid as PlayerId]) as PlayerId) || controllerId;
        const player = state.players[affectedPlayerId];
        if (!player) return;

        // Pop from library to temporary 'Looking' pool
        const cards = [];
        for (let i = 0; i < amount && player.library.length > 0; i++) {
            cards.push(player.library.pop()!);
        }

        if (cards.length === 0) return;

        if (effect.type === EffectType.Scry) {
            state.pendingAction = ChoiceGenerator.createScryChoice(state, cards, {
                label: `Scry ${cards.length}`,
                playerId: affectedPlayerId,
                sourceId: stackObject?.sourceId || "",
                stackObj: stackObject,
                parentContext: parentContext,
                isSpellCasting: !!(effect as any).isSpellCasting,
                isFreeCast: !!(effect as any).isFreeCast,
            });
        } else if (effect.type === EffectType.Surveil) {
            state.pendingAction = ChoiceGenerator.createSurveilChoice(state, cards, {
                label: `Surveil ${cards.length}`,
                playerId: affectedPlayerId,
                sourceId: stackObject?.sourceId || "",
                stackObj: stackObject,
                parentContext: parentContext,
                isSpellCasting: !!(effect as any).isSpellCasting,
                isFreeCast: !!(effect as any).isFreeCast,
            });
        }
    }
}
