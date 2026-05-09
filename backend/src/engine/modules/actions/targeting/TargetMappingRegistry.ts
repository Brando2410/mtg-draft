import { ActivatedAbility, EffectDefinition, GameState, PreventionEffect, ReplacementEffect, EngineFrame, TargetMapping, TriggeredAbility } from "@shared/engine_types";
import { IndexedTargetHandler } from "./mappings/IndexedTargetHandler";
import { SystemMappingHandler } from "./mappings/SystemMappingHandler";
import { PlayerMappingHandler } from "./mappings/PlayerMappingHandler";
import { PoolMappingHandler } from "./mappings/PoolMappingHandler";

export interface TargetMappingContext {
    state: GameState;
    mapping: string;
    context: EngineFrame;
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

// --- HANDLER INSTANCES ---
const indexedHandler = new IndexedTargetHandler();
const systemHandler = new SystemMappingHandler();
const playerHandler = new PlayerMappingHandler();
const poolHandler = new PoolMappingHandler();

// --- INITIAL REGISTRATION ---

registerTargetMapping(
    [
        TargetMapping.Target1, TargetMapping.Target2, TargetMapping.Target3, TargetMapping.Target4, 
        TargetMapping.Target5, TargetMapping.Target6, TargetMapping.Target7, TargetMapping.Target8,
        TargetMapping.Target1Owner, TargetMapping.SelfAndTarget1, TargetMapping.TargetAll,
        TargetMapping.Target1Controller, TargetMapping.SelectedCard, TargetMapping.SelectedCards,
        TargetMapping.AnyTarget
    ], 
    indexedHandler
);

registerTargetMapping(
    [
        TargetMapping.This, TargetMapping.Source, TargetMapping.SourceObject, TargetMapping.Self, 
        TargetMapping.LastMilledIds, TargetMapping.LastMilled, TargetMapping.LastDiscardedIds,
        TargetMapping.LastDiscardedCards, TargetMapping.AttachedTo, TargetMapping.EnchantedPermanent, 
        TargetMapping.EnchantedCreature, TargetMapping.LinkedObject, TargetMapping.LastCreatedToken,
        TargetMapping.LastExiledIds, TargetMapping.LastExiledObject, TargetMapping.ParentContextExiledIds,
        TargetMapping.ParentContextExiledIdsOwners, TargetMapping.TriggerEventSource, TargetMapping.EventSource,
        TargetMapping.TriggerSource, TargetMapping.TriggerTarget, TargetMapping.EventTarget,
        TargetMapping.EventPlayer, TargetMapping.EventObjectController, TargetMapping.TriggerTargetController
    ],
    systemHandler
);

registerTargetMapping(
    [
        TargetMapping.Controller, TargetMapping.Opponent, TargetMapping.TargetOpponent, 
        TargetMapping.TargetPlayer, TargetMapping.ControllerHand, TargetMapping.ControllerGraveyard, 
        TargetMapping.OpponentHand, TargetMapping.EachOpponent, TargetMapping.Opponents,
        TargetMapping.Opponent1, TargetMapping.EachPlayer, TargetMapping.AllPlayers,
        TargetMapping.ControllerGraveyardAndLibrary
    ],
    playerHandler
);

registerTargetMapping(
    [
        TargetMapping.AllPlaneswalkersYouControl, TargetMapping.AllCreaturesYouControl,
        TargetMapping.EachCreatureYouControl, TargetMapping.OtherCreaturesYouControl,
        TargetMapping.OtherSpiritsYouControl, TargetMapping.AllPermanentsYouControl,
        TargetMapping.AllLandsYouControl, TargetMapping.AllFractalsYouControl,
        TargetMapping.OtherCreatures, TargetMapping.AllOtherCreatures,
        TargetMapping.EachOpponentCreature, TargetMapping.AllCreaturesControlledByTarget1,
        TargetMapping.OtherCreaturesAndPlaneswalkers, TargetMapping.AllCreaturesAndPlaneswalkers,
        TargetMapping.OtherPlaneswalkersYouControl, TargetMapping.AllMatchingCards,
        TargetMapping.MatchingCards, TargetMapping.MatchingPermanents,
        TargetMapping.AllMatchingPermanents, TargetMapping.MatchingPermanentsYouControl,
        TargetMapping.AllMatchingPermanentsYouControl, TargetMapping.RemainderOfPool,
        TargetMapping.RemainderOfLookingCards
    ],
    poolHandler
);

