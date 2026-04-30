import { ActionType, EffectDefinition, EffectType, GameObject, GameState, MoveEffect, ResolutionContext, SearchEffect, SelectionType, TargetMapping, TargetType, Zone } from '@shared/engine_types';
import { LogCategory } from '../../../../utils/EngineLogger';
import { getProcessors } from '../../../ProcessorRegistry';
import { ChoiceGenerator } from '../../ChoiceGenerator';

export class SearchEffectHandler {
    public static handle(state: GameState, effect: EffectDefinition, context: ResolutionContext) {
        const { logger, targeting: TP } = getProcessors(state);
        const { controllerId, stackObject, targets = [] } = context;
        const player = state.players[controllerId];
        if (!player) return;

        const searchEff = effect as SearchEffect;
        const sourceZones = searchEff.sourceZones || [Zone.Library];
        const pool: GameObject[] = [];

        sourceZones.forEach((z: Zone) => {
            if (z === Zone.Library) pool.push(...player.library);
            if (z === Zone.Graveyard) pool.push(...player.graveyard);
            if (z === Zone.Hand) pool.push(...player.hand);
        });

        const sourceId = stackObject?.sourceId || "";

        const getRestrictions = (td: any) => {
            if (!td) return [];
            const res = [...(td.restrictions || [])];
            const typeStr = td.type as string;
            if (typeStr && !([TargetType.Any, TargetType.Card, TargetType.Player, TargetType.Opponent, TargetType.AnyTarget, TargetType.CardInGraveyard, TargetType.CardInHand, TargetType.CardInLibrary, TargetType.Self] as TargetType[]).includes(typeStr as TargetType)) {
                res.push(typeStr);
            }
            return res;
        };

        const targetRestrictions = Array.isArray(searchEff.targetDefinition)
            ? (searchEff.targetDefinition as any[]).flatMap(getRestrictions)
            : getRestrictions(searchEff.targetDefinition);

        const searchRestrictions = [
            ...(effect.restrictions || []),
            ...targetRestrictions,
        ];

        const validCandidates = pool.filter(c =>
            TP.matchesRestrictions(state, c, searchRestrictions, { sourceId, controllerId, stackObject })
        );

        if (validCandidates.length === 0) {
            logger.info(state, LogCategory.ACTION, `[INFO] SearchEffectHandler: No valid objects found. Auto-skipping search.`);
            if (searchEff.shuffle && context.effects) {
                context.effects.splice((context.nextEffectIndex || 0) + 1, 0, {
                    type: EffectType.Shuffle,
                    targetMapping: TargetMapping.Controller,
                } as any);
            }
            return;
        }

        state.pendingAction = ChoiceGenerator.createCardChoice(state, pool, {
            label: `${effect.label || "Search your library"}`,
            playerId: controllerId,
            sourceId: sourceId,
            restrictions: searchRestrictions,
            reveal: searchEff.reveal,
            optional: effect.optional || effect.selectionType === SelectionType.AnyNumber,
            filterSelectable: true,
            minChoices: effect.selectionType === SelectionType.AnyNumber || (effect as any).amount === "ANY" || sourceZones.includes(Zone.Library) ? 0 : 1,
            maxChoices: effect.selectionType === SelectionType.AnyNumber || (effect as any).amount === "ANY"
                ? pool.length
                : (effect as any).amount || TP.calculateTotalCounts(searchEff.targetDefinition, 0).maxCount || 1,
            actionType: effect.optional || effect.selectionType === SelectionType.AnyNumber
                ? ActionType.OptionalAction
                : ActionType.ResolutionChoice,
            onSelected: (c: GameObject) => {
                const subEffects: EffectDefinition[] = [];
                const zone = (searchEff as any).zone || Zone.Hand;
                subEffects.push({
                    type: EffectType.MoveToZone,
                    targetId: c.id,
                    targetPlayerId: controllerId,
                    zone: zone,
                    tapped: (searchEff as any).tapped,
                    libraryPosition: (searchEff as any).libraryPosition,
                    reveal: (searchEff as any).reveal,
                    effects: searchEff.effects,
                } as MoveEffect);
                return subEffects;
            },
            onNone: () => [],
            stackObj: stackObject,
            parentContext: context,
            targets: targets,
        });

        if (searchEff.shuffle && context.effects) {
            context.effects.splice((context.nextEffectIndex || 0) + 1, 0, {
                type: EffectType.Shuffle,
                targetMapping: TargetMapping.Controller,
            } as any);
        }
    }
}
