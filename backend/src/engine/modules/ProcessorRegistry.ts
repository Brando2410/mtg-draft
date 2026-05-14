import { GameState } from "@shared/engine_types";
import type { ActionProcessor } from "./actions/ActionProcessor";
import type { ChoiceProcessor } from "./actions/ChoiceProcessor";
import type { PlayerActionProcessor } from "./actions/PlayerActionProcessor";
import type { SpellProcessor } from "./actions/spells/SpellProcessor";
import type { TargetingProcessor } from "./actions/targeting/TargetingProcessor";
import type { TargetingDispatcher } from "./actions/targeting/TargetingDispatcher";
import type { CombatProcessor } from "./combat/CombatProcessor";
import type { DamageProcessor } from "./combat/DamageProcessor";
import type { ConditionProcessor } from "./core/logic/ConditionProcessor";
import type { RegistryProcessor } from "./core/RegistryProcessor";
import type { RestrictionValidator } from "./core/RestrictionValidator";
import type { StackProcessor } from "./core/stack/StackProcessor";
import type { ResolutionManager } from "./core/stack/ResolutionManager";
import type { PriorityProcessor } from "./core/turn/PriorityProcessor";
import type { TurnProcessor } from "./core/turn/TurnProcessor";
import type { EffectProcessor } from "./effects/EffectProcessor";
import type { ReplacementProcessor as ReplacementProcessorType } from "./effects/replacements/ReplacementProcessor";
import type { TriggerProcessor } from "./effects/triggers/TriggerProcessor";
import type { ChoiceGenerator } from "./effects/ChoiceGenerator";
import type { CostProcessor } from "./magic/CostProcessor";
import { ManaProcessor } from "./magic/ManaProcessor";
import { SpellValidator } from "./actions/spells/SpellValidator";
import { SpellCostCalculator } from "./actions/spells/SpellCostCalculator";
import { SpellInteractiveManager } from "./actions/spells/SpellInteractiveManager";
import type { LayerProcessor } from "./state/LayerProcessor";
import type { LkiProcessor } from "./state/LkiProcessor";
import type { StateBasedActionsProcessor } from "./state/StateBasedActionsProcessor";
import type { MulliganProcessor } from "./core/MulliganProcessor";
import { EngineLogger } from "../utils/EngineLogger";
import type { oracle as oracleInstance } from "../OracleLogicMap";
import type { EngineContext } from "../interfaces/EngineContext";
import { NullEngineContext } from "../interfaces/NullEngineContext";

/**
 * ProcessorRegistry: Standardized interface for accessing core engine modules
 * without direct imports to avoid circular dependencies.
 */
export interface ProcessorRegistry {
    action: typeof ActionProcessor;
    playerAction: typeof PlayerActionProcessor;
    combat: typeof CombatProcessor;
    damage: typeof DamageProcessor;
    choice: typeof ChoiceProcessor;
    priority: typeof PriorityProcessor;
    spell: typeof SpellProcessor;
    stack: typeof StackProcessor;
    resolution: typeof ResolutionManager;
    trigger: typeof TriggerProcessor;
    turn: typeof TurnProcessor;
    targeting: typeof TargetingProcessor;
    targetingDispatcher: typeof TargetingDispatcher;
    layer: typeof LayerProcessor;
    lki: typeof LkiProcessor;
    sba: typeof StateBasedActionsProcessor;
    restriction: typeof RestrictionValidator;
    mana: typeof ManaProcessor;
    cost: typeof CostProcessor;
    registry: typeof RegistryProcessor;
    effect: typeof EffectProcessor;
    condition: typeof ConditionProcessor;
    replacement: typeof ReplacementProcessorType;
    choiceGenerator: typeof ChoiceGenerator;
    spellValidator: typeof SpellValidator;
    spellCostCalculator: typeof SpellCostCalculator;
    spellInteractiveManager: typeof SpellInteractiveManager;
    logger: typeof EngineLogger;
    oracle: typeof oracleInstance;
    mulligan: typeof MulliganProcessor;
}

/**
 * Service Locator for engine processors.
 * Centralizes the logic for retrieving processors from the game state.
 * This resolves the "state as any" smell by encapsulating registry access.
 */
export function getProcessors(state: GameState): ProcessorRegistry {
    const engine = getEngine(state);
    if (engine.processors) {
        return engine.processors;
    }

    /**
     * Fallback locator (legacy/standalone mode).
     * Used only when the GameState is not attached to a GameEngine instance.
     * We use dynamic getters to lazily load modules only when accessed.
     */
    return {
        get action() { return require("./actions/ActionProcessor").ActionProcessor; },
        get playerAction() { return require("./actions/PlayerActionProcessor").PlayerActionProcessor; },
        get combat() { return require("./combat/CombatProcessor").CombatProcessor; },
        get damage() { return require("./combat/DamageProcessor").DamageProcessor; },
        get choice() { return require("./actions/ChoiceProcessor").ChoiceProcessor; },
        get priority() { return require("./core/turn/PriorityProcessor").PriorityProcessor; },
        get spell() { return require("./actions/spells/SpellProcessor").SpellProcessor; },
        get stack() { return require("./core/stack/StackProcessor").StackProcessor; },
        get resolution() { return require("./core/stack/ResolutionManager").ResolutionManager; },
        get trigger() { return require("./effects/triggers/TriggerProcessor").TriggerProcessor; },
        get turn() { return require("./core/turn/TurnProcessor").TurnProcessor; },
        get targeting() { return require("./actions/targeting/TargetingProcessor").TargetingProcessor; },
        get targetingDispatcher() { return require("./actions/targeting/TargetingDispatcher").TargetingDispatcher; },
        get layer() { return require("./state/LayerProcessor").LayerProcessor; },
        get lki() { return require("./state/LkiProcessor").LkiProcessor; },
        get sba() { return require("./state/StateBasedActionsProcessor").StateBasedActionsProcessor; },
        get restriction() { return require("./core/RestrictionValidator").RestrictionValidator; },
        get mana() { return require("./magic/ManaProcessor").ManaProcessor; },
        get cost() { return require("./magic/CostProcessor").CostProcessor; },
        get registry() { return require("./core/RegistryProcessor").RegistryProcessor; },
        get effect() { return require("./effects/EffectProcessor").EffectProcessor; },
        get condition() { return require("./core/logic/ConditionProcessor").ConditionProcessor; },
        get replacement() { return require("./effects/replacements/ReplacementProcessor").ReplacementProcessor; },
        get choiceGenerator() { return require("./effects/ChoiceGenerator").ChoiceGenerator; },
        get spellValidator() { return require("./actions/spells/SpellValidator").SpellValidator; },
        get spellCostCalculator() { return require("./actions/spells/SpellCostCalculator").SpellCostCalculator; },
        get spellInteractiveManager() { return require("./actions/spells/SpellInteractiveManager").SpellInteractiveManager; },
        get logger() { return require("../utils/EngineLogger").EngineLogger; },
        get oracle() { return require("../OracleLogicMap").oracle; },
        get mulligan() { return require("./core/MulliganProcessor").MulliganProcessor; },
    } as unknown as ProcessorRegistry;
}

/**
 * Service Locator for the Game Orchestrator.
 * Returns the attached GameEngine or a safe NullEngineContext fallback.
 */
export function getEngine(state: GameState): EngineContext {
    return (state as { gameEngine?: EngineContext }).gameEngine || NullEngineContext.getInstance();
}
