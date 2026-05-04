import {
    AbilityDefinition,
    AbilityType,
    CardLogic,
    GameObject,
    GameState,
    StackObject,
    TargetDefinition,
    EffectDefinition
} from '@shared/engine_types';
import { oracle } from '../OracleLogicMap';

/**
 * RegistryUtils: Centralized logic for interpreting card definitions and merging Oracle data.
 * This utility ensures a single source of truth for "what a card does" across the engine.
 */
export class RegistryUtils {
    /**
     * Retrieves the base effective logic for a card, merging Oracle data and instance state.
     */
    public static getEffectiveLogic(state: GameState, obj: GameObject | StackObject): CardLogic {
        const definition = obj.definition;
        const oracleLogic = oracle.getCard(definition.name);

        // Merge instance definition with oracle data (oracle takes precedence for engine logic)
        return {
            ...definition,
            ...oracleLogic,
        };
    }

    /**
     * Helper to find a modal ability in a card's logic or definition.
     */
    public static getModalAbility(logic: CardLogic, objDefinition?: any): AbilityDefinition | undefined {
        return (logic.abilities?.find((a): a is AbilityDefinition => typeof a !== 'string' && !!a.modes) ||
            objDefinition?.abilities?.find((a: any): a is AbilityDefinition => typeof a !== 'string' && !!a.modes));
    }

    /**
     * Helper to find the explicit "Spell" ability in a list of abilities.
     */
    public static getSpellAbility(abs: (AbilityDefinition | string)[] | undefined): AbilityDefinition | undefined {
        return abs?.find((a): a is AbilityDefinition => typeof a !== 'string' && a.type === AbilityType.Spell);
    }

    /**
     * Extracts the effective payload (effects and targets) for a spell or ability.
     * Handles Oracle fallbacks, spell-ability nesting, and Modal Mode merging.
     */
    public static getEffectivePayload(state: GameState, obj: GameObject | StackObject): {
        effects: EffectDefinition[],
        targetDefinitions: TargetDefinition[]
    } {
        const logic = this.getEffectiveLogic(state, obj);

        // 0. Handle Activated/Triggered abilities via abilityIndex
        const abilityIndex = (obj as StackObject).abilityIndex;
        if (abilityIndex !== undefined) {
            const ability = logic.abilities?.[abilityIndex] ||
                obj.definition.abilities?.[abilityIndex];
            if (ability && typeof ability !== 'string') {
                return {
                    effects: ability.effects || [],
                    targetDefinitions: (Array.isArray(ability.targetDefinitions) ? ability.targetDefinitions : (ability.targetDefinitions ? [ability.targetDefinitions] : [])) as TargetDefinition[]
                };
            }
        }

        const lastChosenModeIndex = state.interaction?.lastChosenModeIndex;
        const hasPreSelectedMode = lastChosenModeIndex !== undefined;

        // 1. Initial extraction from root or spell ability
        let targetDefinitions = logic.targetDefinitions ||
            this.getSpellAbility(logic.abilities)?.targetDefinitions ||
            obj.definition.targetDefinitions ||
            this.getSpellAbility(obj.definition.abilities)?.targetDefinitions || [];

        let effects = logic.effects ||
            this.getSpellAbility(logic.abilities)?.effects ||
            this.getSpellAbility(obj.definition.abilities)?.effects || [];

        // 2. Override with Modal Choice if selections exist
        if (hasPreSelectedMode) {
            const modalAbility = (logic.abilities?.find((a): a is AbilityDefinition => typeof a !== 'string' && !!a.modes) ||
                obj.definition.abilities?.find((a): a is AbilityDefinition => typeof a !== 'string' && !!a.modes));

            if (modalAbility?.modes) {
                const indices = Array.isArray(lastChosenModeIndex) ? lastChosenModeIndex : [lastChosenModeIndex];
                const combinedTargets: TargetDefinition[] = [];
                const combinedEffects: EffectDefinition[] = [];

                let currentTargetOffset = 0;
                indices.forEach(idx => {
                    const mode = modalAbility.modes![idx as number];
                    if (!mode) return;

                    if (mode.targetDefinitions) {
                        const modeTargets = Array.isArray(mode.targetDefinitions) ? mode.targetDefinitions : [mode.targetDefinitions];
                        combinedTargets.push(...modeTargets);
                    }

                    if (mode.effects) {
                        // Inject targetOffset so effects know which target indices to look at
                        const modeEffects = mode.effects.map((e: EffectDefinition) => ({
                            ...e,
                            targetOffset: currentTargetOffset
                        }));
                        combinedEffects.push(...modeEffects);
                    }

                    // Calculate offset for next mode using a placeholder xValue (or 0)
                    // Note: xValue is handled during finalization, here we just need the structure
                    if (mode.targetDefinitions) {
                        const modeTargets = Array.isArray(mode.targetDefinitions) ? mode.targetDefinitions : [mode.targetDefinitions];
                        // We use 0 as a default for structural offset calculation
                        // Actual resolution will re-calculate counts if X is involved
                        currentTargetOffset += modeTargets.length; 
                    }
                });

                if (combinedTargets.length > 0) targetDefinitions = combinedTargets;
                if (combinedEffects.length > 0) effects = combinedEffects;
            }
        }

        return { effects, targetDefinitions };
    }
}
