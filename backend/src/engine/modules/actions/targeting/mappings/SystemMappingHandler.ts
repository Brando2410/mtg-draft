import { ITargetMappingHandler, TargetMappingContext } from "../TargetMappingRegistry";
import { TargetMapping } from "@shared/engine_types";
import { RuleUtils } from "../../../../utils/RuleUtils";

/**
 * Handles system-level mappings (THIS, SOURCE, LAST_MILLED_IDS, etc.)
 */
export class SystemMappingHandler implements ITargetMappingHandler {
    resolve(ctx: TargetMappingContext): string[] {
        const { state, mapping, context, effect } = ctx;

        const m = mapping.toUpperCase();
        switch (m) {
            case TargetMapping.This:
            case TargetMapping.Source:
            case TargetMapping.SourceObject:
            case TargetMapping.Self:
                return context.sourceId ? [context.sourceId] : [];

            case TargetMapping.LastMilledIds:
            case TargetMapping.LastMilled:
                return state.turnState.lastMilledIds || [];

            case TargetMapping.LastDiscardedIds:
            case TargetMapping.LastDiscardedCards:
                return state.turnState.lastDiscardedIds || [];

            case TargetMapping.LinkedObject: {
                const linkKey = effect?.linkKey || 'linkedId';
                const lSource = RuleUtils.findObject(state, context.sourceId);
                if (RuleUtils.isEntity(lSource)) {
                    const data = lSource.data;
                    const val = data ? data[linkKey] : undefined;
                    return val ? [val] : [];
                }
                return [];
            }

            case TargetMapping.LastCreatedToken:
                return state.turnState.lastCreatedTokenId ? [state.turnState.lastCreatedTokenId] : [];

            case TargetMapping.LastExiledIds:
            case TargetMapping.LastExiledObject:
                return state.turnState.lastExiledIds || [];

            case TargetMapping.ParentContextExiledIds: {
                const result = (context.exiledIds && context.exiledIds.length > 0)
                    ? context.exiledIds
                    : (context.stackObject?.exiledIds && context.stackObject.exiledIds.length > 0)
                        ? context.stackObject.exiledIds
                        : (context.parentContext?.exiledIds || []);
                return result;
            }

            case TargetMapping.ParentContextExiledIdsOwners: {
                const ids = (context.exiledIds && context.exiledIds.length > 0)
                    ? context.exiledIds
                    : (context.stackObject?.exiledIds && context.stackObject.exiledIds.length > 0)
                        ? context.stackObject.exiledIds
                        : (context.parentContext?.exiledIds || []);
                const owners = ids
                    .map(id => RuleUtils.findObject(state, id)?.ownerId)
                    .filter((id): id is string => !!id);
                return [...new Set(owners)];
            }

            case TargetMapping.TriggerEventSource:
            case TargetMapping.EventSource:
            case TargetMapping.TriggerSource: {
                const eData = context.event;
                const sourceIdFromPayload = RuleUtils.getSource(eData);
                if (sourceIdFromPayload) return [sourceIdFromPayload];

                const obj = RuleUtils.getEventObject(eData, state);
                return obj ? [obj.id] : [];
            }

            case TargetMapping.TriggerTarget:
            case TargetMapping.EventTarget: {
                const eData = context.event;
                const obj = RuleUtils.getEventObject(eData, state);
                return obj ? [obj.id] : [];
            }

            case TargetMapping.EventPlayer: {
                const eData = context.event;
                const pId = eData?.payload?.playerId || eData?.playerId;
                return pId ? [pId as string] : [];
            }

            case TargetMapping.EventObjectController: {
                const eData = context.event;
                const obj = RuleUtils.getEventObject(eData, state);
                return obj ? [RuleUtils.getController(obj)] : [];
            }

            case TargetMapping.TriggerTargetController: {
                const eData = context.event;
                const obj = RuleUtils.getEventObject(eData, state);
                return obj ? [RuleUtils.getController(obj)] : [];
            }

            case TargetMapping.AttachedTo:
            case TargetMapping.EnchantedPermanent:
            case TargetMapping.EnchantedCreature: {
                const aura = RuleUtils.findObject(state, context.sourceId);
                if (RuleUtils.isGameObject(aura)) {
                    return aura.attachedTo ? [aura.attachedTo] : [];
                }
                return [];
            }

            default:
                return [];
        }
    }
}
