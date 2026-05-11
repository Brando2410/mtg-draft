import { ITargetMappingHandler, TargetMappingContext } from "../TargetMappingRegistry";
import { RuleUtils } from "../../../../utils/RuleUtils";
import {
    GameObject,
    PlayerId,
    Restriction,
    TargetMapping,
    Zone,
    TargetMapping as TargetMappingEnum
} from "@shared/engine_types";
import { TargetValidator } from "../TargetValidator";

/**
 * Handles Complex Pool-based Mappings (ALL_CREATURES, MATCHING_PERMANENTS, REMAINDER_OF_POOL, etc.)
 */
export class PoolMappingHandler implements ITargetMappingHandler {
    resolve(ctx: TargetMappingContext): string[] {
        const { state, mapping, context, effect } = ctx;
        const { controllerId, stackObject, lookingCards, parentContext } = context;

        const m = mapping.toUpperCase();

        // 1. Remainder Logic
        if (m === TargetMapping.RemainderOfPool || m === TargetMapping.RemainderOfLookingCards) {
            const pool = (lookingCards ||
                parentContext?.lookingCards ||
                stackObject?.lookingCards ||
                state.pendingAction?.data?.lookingCards ||
                []) as GameObject[];

            return pool
                .filter((c) => c.zone === Zone.Library || c.zone === Zone.Exile)
                .map((c) => c.id);
        }

        // 2. Matching Logic
        const finalRestrictions: string[] = [];
        const restrictions = (effect as any)?.restrictions || [];
        finalRestrictions.push(...restrictions);

        // Determine Implicit Restrictions from Mapping String
        if (m.includes('CREATURE_AND_PLANESWALKER')) {
            finalRestrictions.push(Restriction.Creature);
            finalRestrictions.push(Restriction.Planeswalker);
        } else if (m.includes('CREATURE')) {
            finalRestrictions.push(Restriction.Creature);
        } else if (m.includes('PERMANENT')) {
            finalRestrictions.push(Restriction.Permanent);
        } else if (m.includes('PLANESWALKER')) {
            finalRestrictions.push(Restriction.Planeswalker);
        } else if (m.includes('LAND')) {
            finalRestrictions.push(Restriction.Land);
        }

        if (m.includes('SPIRIT')) finalRestrictions.push('spirit');
        if (m.includes('FRACTAL')) finalRestrictions.push('fractal');
        if (m.includes('OTHER')) finalRestrictions.push(Restriction.Other);

        // Handle Control
        let controllerIdToMatch = controllerId;
        if (m.includes('CONTROLLED_BY_TARGET1')) {
            const actualTargets = context.targets || [];
            controllerIdToMatch = actualTargets[0] as PlayerId;
        }

        if (m.includes('YOU_CONTROL')) {
            finalRestrictions.push(Restriction.YouControl);
        } else if (m.includes('OPPONENT_CREATURE') || m.includes('OPPONENT_CONTROL') || m.includes('OPPONENTS_CONTROL') || m.includes('NOT_CONTROLLED')) {
            finalRestrictions.push(Restriction.OpponentControl);
        }

        // Determine Source Zones
        const isMatchingType = m.includes('MATCHING');
        const sourceZones = effect?.sourceZones;
        const effectiveSourceZones = sourceZones || (isMatchingType
            ? [Zone.Battlefield, Zone.Graveyard, Zone.Hand, Zone.Exile, Zone.Library]
            : [Zone.Battlefield]);

        const pool: string[] = [];
        effectiveSourceZones.forEach((z: Zone) => {
            // Optimization: Permanents can only be on the battlefield
            if (finalRestrictions.includes(Restriction.Permanent) && z !== Zone.Battlefield) return;

            if (z === Zone.Battlefield) pool.push(...state.battlefield.map(o => o.id));
            else if (z === Zone.Exile) pool.push(...state.exile.map(o => o.id));
            else if (z === Zone.Stack) pool.push(...state.stack.map(s => s.id));
            else {
                Object.values(state.players).forEach(p => {
                    if (z === Zone.Hand) pool.push(...p.hand.map(c => c.id));
                    else if (z === Zone.Graveyard) pool.push(...p.graveyard.map(c => c.id));
                    else if (z === Zone.Library) pool.push(...p.library.map(c => c.id));
                });
            }
        });

        // Use the context controller for "You Control" checks
        const effectiveContext = { ...context, controllerId: controllerIdToMatch };

        return pool.filter(tid => {
            const obj = RuleUtils.findObject(state, tid);
            return obj && TargetValidator.matchesRestrictions(state, obj, finalRestrictions, effectiveContext);
        });
    }
}
