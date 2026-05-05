import { ActivatedAbility, EffectDefinition, GameState, PreventionEffect, ReplacementEffect, ResolutionContext, TargetMapping, TriggeredAbility } from "@shared/engine_types";
import { IndexedTargetHandler } from "./mappings/IndexedTargetHandler";
import { SystemMappingHandler } from "./mappings/SystemMappingHandler";
import { PlayerMappingHandler } from "./mappings/PlayerMappingHandler";

export interface TargetMappingContext {
    state: GameState;
    mapping: string;
    context: ResolutionContext;
    effect?: Partial<EffectDefinition> | ActivatedAbility | TriggeredAbility | ReplacementEffect | PreventionEffect;
    targetOffset?: number;
    targetDefinitions?: any[];
}

export interface ITargetMappingHandler {
    resolve(ctx: TargetMappingContext): string[];
}

export const TargetMappingRegistry: Record<string, ITargetMappingHandler> = {};

/**
 * Register a target mapping handler.
 */
export function registerTargetMapping(mapping: string | string[], handler: ITargetMappingHandler) {
    if (Array.isArray(mapping)) {
        mapping.forEach(m => registerTargetMapping(m, handler));
        return;
    }
    TargetMappingRegistry[mapping.toUpperCase()] = handler;
}

// Initial Registration
registerTargetMapping(
    [
        TargetMapping.Target1, TargetMapping.Target2, TargetMapping.Target3, TargetMapping.Target4, 
        TargetMapping.Target5, TargetMapping.Target6, TargetMapping.Target7, TargetMapping.Target8
    ], 
    new IndexedTargetHandler()
);

registerTargetMapping(
    [
        TargetMapping.This, TargetMapping.Source, TargetMapping.SourceObject, TargetMapping.Self, 
        TargetMapping.LastMilledIds, TargetMapping.LastMilled, TargetMapping.LastDiscardedIds, 
        TargetMapping.AttachedTo, TargetMapping.EnchantedPermanent, TargetMapping.EnchantedCreature
    ],
    new SystemMappingHandler()
);

registerTargetMapping(
    [
        TargetMapping.Controller, TargetMapping.Opponent, TargetMapping.TargetOpponent, 
        TargetMapping.TargetPlayer, TargetMapping.ControllerHand, TargetMapping.ControllerGraveyard, 
        TargetMapping.OpponentHand
    ],
    new PlayerMappingHandler()
);
