import { GameState } from "@shared/engine_types";
import type { ActionProcessor } from "./actions/ActionProcessor";
import type { DamageProcessor } from "./combat/DamageProcessor";
import type { ChoiceProcessor } from "./actions/ChoiceProcessor";
import type { PlayerActionProcessor } from "./actions/PlayerActionProcessor";
import type { SpellProcessor } from "./actions/spells/SpellProcessor";
import type { TargetingProcessor } from "./actions/targeting/TargetingProcessor";
import type { CombatProcessor } from "./combat/CombatProcessor";
import type { ConditionProcessor } from "./core/logic/ConditionProcessor";
import type { RegistryProcessor } from "./core/RegistryProcessor";
import type { RestrictionValidator } from "./core/RestrictionValidator";
import type { StackProcessor } from "./core/stack/StackProcessor";
import type { PriorityProcessor } from "./core/turn/PriorityProcessor";
import type { TurnProcessor } from "./core/turn/TurnProcessor";
import type { EffectProcessor } from "./effects/EffectProcessor";
import type { TriggerProcessor } from "./effects/triggers/TriggerProcessor";
import type { ManaProcessor } from "./magic/ManaProcessor";
import type { LayerProcessor } from "./state/LayerProcessor";
import type { StateBasedActionsProcessor } from "./state/StateBasedActionsProcessor";

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
    trigger: typeof TriggerProcessor;
    turn: typeof TurnProcessor;
    targeting: typeof TargetingProcessor;
    layer: typeof LayerProcessor;
    sba: typeof StateBasedActionsProcessor;
    restriction: typeof RestrictionValidator;
    mana: typeof ManaProcessor;
    registry: typeof RegistryProcessor;
    effect: typeof EffectProcessor;
    condition: typeof ConditionProcessor;
}

/**
 * Service Locator for engine processors.
 * Centralizes the logic for retrieving processors from the game state.
 * This resolves the "state as any" smell by encapsulating registry access.
 */
export function getProcessors(state: GameState): ProcessorRegistry {
    const engine = (state as any).gameEngine;
    if (engine && engine.processors) {
        return engine.processors as ProcessorRegistry;
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
        get trigger() { return require("./effects/triggers/TriggerProcessor").TriggerProcessor; },
        get turn() { return require("./core/turn/TurnProcessor").TurnProcessor; },
        get targeting() { return require("./actions/targeting/TargetingProcessor").TargetingProcessor; },
        get layer() { return require("./state/LayerProcessor").LayerProcessor; },
        get sba() { return require("./state/StateBasedActionsProcessor").StateBasedActionsProcessor; },
        get restriction() { return require("./core/RestrictionValidator").RestrictionValidator; },
        get mana() { return require("./magic/ManaProcessor").ManaProcessor; },
        get registry() { return require("./core/RegistryProcessor").RegistryProcessor; },
        get effect() { return require("./effects/EffectProcessor").EffectProcessor; },
        get condition() { return require("./core/logic/ConditionProcessor").ConditionProcessor; },
    } as unknown as ProcessorRegistry;
}
