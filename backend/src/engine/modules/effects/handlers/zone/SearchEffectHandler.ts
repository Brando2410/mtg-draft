import { ActionType, EffectDefinition, EffectType, GameObject, GameState, MoveEffect, PlayerId, EngineFrame, SearchEffect, SelectionType, TargetDefinition, TargetMapping, TargetType, Zone } from '@shared/engine_types';
import { LogCategory } from '../../../../utils/EngineLogger';
import { getProcessors } from '../../../ProcessorRegistry';
import { ChoiceGenerator } from '../../ChoiceGenerator';
import { IEffectHandler } from '../../IEffectHandler';

export const SearchEffectHandler: IEffectHandler<SearchEffect> = {
    handle(state, effect, context) {
        const { logger, targeting: TP } = getProcessors(state);
        const { controllerId, stackObject, targets = [] } = context;
        
        // CR 701.19: The player who is searching is the one who makes the choices.
        // We resolve the affected player from targets (e.g. "Target opponent searches") 
        // or fall back to the effect controller.
        const affectedPlayerId = (targets.find(tid => state.players[tid as PlayerId]) as PlayerId) || controllerId;
        const player = state.players[affectedPlayerId];
        if (!player) return;

        const sourceZones = effect.sourceZones || [Zone.Library];
        const pool: GameObject[] = [];

        sourceZones.forEach((z: Zone) => {
            if (z === Zone.Library) pool.push(...player.library);
            if (z === Zone.Graveyard) pool.push(...player.graveyard);
            if (z === Zone.Hand) pool.push(...player.hand);
        });

        const sourceId = context.sourceId || stackObject?.id || "";

        const getRestrictions = (td: any) => {
            if (!td) return [];
            const res = [...(td.restrictions || [])];
            const typeStr = td.type as string;
            if (typeStr && !([TargetType.Any, TargetType.Card, TargetType.Player, TargetType.Opponent, TargetType.AnyTarget, TargetType.CardInGraveyard, TargetType.CardInHand, TargetType.CardInLibrary, TargetType.Self] as TargetType[]).includes(typeStr as TargetType)) {
                res.push(typeStr);
            }
            return res;
        };

        const targetRestrictions = Array.isArray(effect.targetDefinitions)
            ? (effect.targetDefinitions as TargetDefinition[]).flatMap(getRestrictions)
            : getRestrictions(effect.targetDefinitions);

        const searchRestrictions = [
            ...(effect.restrictions || []),
            ...targetRestrictions,
        ];

        const validCandidates = pool.filter(c =>
            TP.matchesRestrictions(state, c, searchRestrictions, { sourceId, controllerId, stackObject, effects: [], targets: [] })
        );

        if (validCandidates.length === 0) {
            logger.info(state, LogCategory.ACTION, `[INFO] SearchEffectHandler: No valid objects found. Auto-skipping search.`);
            if (effect.shuffle) {
                getProcessors(state).effect.injectPostEffect(context, {
                    type: EffectType.Shuffle,
                    targetMapping: TargetMapping.Controller,
                } as EffectDefinition);
            }
            return;
        }

        state.pendingAction = ChoiceGenerator.createCardChoice(state, pool, {
            label: `${effect.label || "Search your library"}`,
            playerId: affectedPlayerId,
            sourceId: sourceId,
            restrictions: searchRestrictions,
            reveal: effect.reveal,
            optional: effect.optional || effect.selectionType === SelectionType.ANY,
            filterSelectable: true,
            minChoices: effect.selectionType === SelectionType.ANY || effect.amount === "ANY" || sourceZones.includes(Zone.Library) ? 0 : 1,
            maxChoices: effect.selectionType === SelectionType.ANY || effect.amount === "ANY"
                ? pool.length
                : (effect.amount as number) || TP.calculateTotalCounts(effect.targetDefinitions || [], 0).maxCount || 1,
            actionType: effect.optional || effect.selectionType === SelectionType.ANY
                ? ActionType.OptionalAction
                : ActionType.ResolutionChoice,
            onSelected: (c: GameObject) => {
                const subEffects: EffectDefinition[] = [];
                const zone = effect.zone || Zone.Hand;
                subEffects.push({
                    type: EffectType.MoveToZone,
                    effectIndex: context.effectIndex,
                    targetIds: [c.id],
                    targetPlayerId: controllerId,
                    zone: zone,
                    tapped: effect.tapped,
                    position: effect.position,
                    reveal: effect.reveal,
                    effects: effect.effects,
                } as MoveEffect);
                return subEffects;
            },
            onNone: () => [],
            stackObj: stackObject,
            parentContext: context,
            targets: targets,
        });

        if (effect.shuffle && context.effects) {
            context.effects.splice((context.effectIndex ?? 0) + 1, 0, {
                type: EffectType.Shuffle,
                targetMapping: TargetMapping.Controller,
            } as EffectDefinition);
        }
    }
};

