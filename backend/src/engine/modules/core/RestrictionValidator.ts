import { GameObject, GameState, PlayerId, RestrictionObject, RestrictionType } from "@shared/engine_types";
import { RuleUtils } from "../../utils/RuleUtils";
import { getProcessors } from "../ProcessorRegistry";
import { ConditionProcessor } from "./logic/ConditionProcessor";

/**
 * Rules Engine Module: Object & Player Restrictions (Rule 613/701)
 * Evaluates structured RestrictionObjects to determine if actions are permitted.
 */
export class RestrictionValidator {
    /**
     * Checks if a creature can attack based on its current restrictions.
     */
    public static canAttack(state: GameState, obj: GameObject): boolean {
        const { layer: LayerProcessor } = getProcessors(state);
        const stats = LayerProcessor.getEffectiveStats(obj, state);

        // 1. Check Keywords (Defender restriction with "as though" override)
        if (RuleUtils.hasKeyword(obj, 'defender')) {
            const canAttackWithDefender = (stats.restrictions || []).some((r: any) => r.type === RestrictionType.CanAttackWithDefender);
            if (!canAttackWithDefender) {
                return false;
            }
        }

        if (RuleUtils.hasKeyword(obj, 'cannotattack')) {
            return false;
        }

        // 2. Check structured Restrictions
        if (stats.restrictions) {
            for (const restriction of stats.restrictions) {
                if (restriction.type === RestrictionType.CannotAttack) {
                    if (this.isRestrictionActive(state, obj, restriction)) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    /**
     * Checks if a creature can block.
     */
    public static canBlock(state: GameState, obj: GameObject): boolean {
        const { layer: LayerProcessor } = getProcessors(state);
        const stats = LayerProcessor.getEffectiveStats(obj, state);

        if (RuleUtils.hasKeyword(obj, 'cannotblock')) {
            return false;
        }

        if (stats.restrictions) {
            for (const restriction of stats.restrictions) {
                if (restriction.type === RestrictionType.CannotBlock) {
                    if (this.isRestrictionActive(state, obj, restriction)) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    /**
     * Checks if an object can activate abilities.
     */
    public static canActivateAbilities(state: GameState, obj: GameObject, isManaAbility: boolean = false): boolean {
        const { layer: LayerProcessor } = getProcessors(state);
        const stats = LayerProcessor.getEffectiveStats(obj, state);

        if (stats.restrictions) {
            for (const restriction of stats.restrictions) {
                if (restriction.type === RestrictionType.CannotActivateAbilities) {
                    if (this.isRestrictionActive(state, obj, restriction)) return false;
                }
                if (!isManaAbility && restriction.type === RestrictionType.CannotActivateNonManaAbilities) {
                    if (this.isRestrictionActive(state, obj, restriction)) return false;
                }
            }
        }

        return true;
    }

    /**
     * Evaluates if a specific restriction is currently active based on its condition.
     */
    private static isRestrictionActive(state: GameState, obj: GameObject, restriction: RestrictionObject): boolean {
        if (!restriction.condition) return true;

        // If condition is a string or object, use ConditionProcessor
        return ConditionProcessor.matchesCondition(state, restriction.condition, {
            sourceId: obj.id,
            controllerId: obj.controllerId
        });
    }

    /**
     * Checks if an action is prevented by a broader rule (e.g. Cannot Untap).
     */
    public static isRestricted(state: GameState, obj: GameObject, type: RestrictionType): boolean {
        const { layer: LayerProcessor } = getProcessors(state);
        const stats = LayerProcessor.getEffectiveStats(obj, state);

        if (stats.restrictions) {
            return stats.restrictions.some((r: RestrictionObject) => r.type === type && this.isRestrictionActive(state, obj, r));
        }

        return false;
    }

    /**
     * PLAYER-LEVEL RESTRICTIONS
     */

    public static canGainLife(state: GameState, playerId: PlayerId): boolean {
        const playerRestrictions = this.getPlayerRestrictions(state, playerId);
        return !playerRestrictions.some(r => r.type === RestrictionType.CannotGainLife && this.isPlayerRestrictionActive(state, playerId, r));
    }

    public static canDrawCards(state: GameState, playerId: PlayerId): boolean {
        const playerRestrictions = this.getPlayerRestrictions(state, playerId);
        return !playerRestrictions.some(r => r.type === RestrictionType.CannotDrawCards && this.isPlayerRestrictionActive(state, playerId, r));
    }

    public static canCastSpells(state: GameState, playerId: PlayerId, card?: GameObject): boolean {
        // 1. Split Second (Rule 702.61)
        if (this.handleSplitSecond(state)) return false;

        const playerRestrictions = this.getPlayerRestrictions(state, playerId);
        
        // General cast permission
        const isGenerallyRestricted = playerRestrictions.some(r => r.type === RestrictionType.CannotCastSpells && this.isPlayerRestrictionActive(state, playerId, r));
        if (isGenerallyRestricted) return false;

        // Specific card restrictions
        if (card) {
            for (const r of playerRestrictions) {
                if (r.type === RestrictionType.CannotCastPermanentSpells) {
                    if (RuleUtils.isPermanent(card) && this.isPlayerRestrictionActive(state, playerId, r)) return false;
                }

                if (r.type === RestrictionType.CannotCastNamedCard) {
                    const namedCardName = state.turnState.namedCards?.[r.sourceId || ""] || (r as any).value;
                    if (namedCardName && card.definition.name.toLowerCase() === namedCardName.toLowerCase() && this.isPlayerRestrictionActive(state, playerId, r)) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    public static canActivateAbility(state: GameState, playerId: PlayerId, ability: any, obj: GameObject): boolean {
        // 1. Split Second (Rule 702.61)
        if (!ability.isManaAbility && this.handleSplitSecond(state)) return false;

        const playerRestrictions = this.getPlayerRestrictions(state, playerId);

        // General ability activation permission
        if (!ability.isManaAbility && playerRestrictions.some(r => r.type === RestrictionType.CannotActivateNonManaAbilities && this.isPlayerRestrictionActive(state, playerId, r))) {
            return false;
        }

        // Permanent-specific restrictions
        if (this.isRestricted(state, obj, RestrictionType.CannotActivateAbilities)) return false;

        return true;
    }

    private static handleSplitSecond(state: GameState): boolean {
        // CR 702.61a: While a spell with split second is on the stack, players can't cast spells or activate nonmana abilities.
        return state.stack.some(s => RuleUtils.hasKeyword(s.sourceObject, 'Split Second'));
    }

    private static getPlayerRestrictions(state: GameState, playerId: PlayerId): RestrictionObject[] {
        // Player restrictions can come from global static effects targeting the player
        const effects = state.ruleRegistry.continuousEffects || [];
        const { layer: LayerProcessor } = getProcessors(state);

        return effects
            .filter(e => LayerProcessor.isTarget(state, e, playerId))
            .flatMap(e => e.restrictions || [])
            .map((r: string | RestrictionObject) => typeof r === 'string' ? { type: r } : r);
    }

    private static isPlayerRestrictionActive(state: GameState, playerId: PlayerId, restriction: RestrictionObject): boolean {
        if (!restriction.condition) return true;
        return ConditionProcessor.matchesCondition(state, restriction.condition, {
            sourceId: "global",
            controllerId: playerId
        });
    }
}
