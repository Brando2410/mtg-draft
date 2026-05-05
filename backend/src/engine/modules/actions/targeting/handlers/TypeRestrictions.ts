import { CardType, GameObject, Restriction, StackObject, Targetable, Zone } from "@shared/engine_types";
import { RuleUtils } from "../../../../utils/RuleUtils";
import { IRestrictionHandler } from "../IRestrictionHandler";
import { gameObjectRestriction, isGameObject, isPlayerState, isStackObject } from "./HandlerUtils";

const PERMANENT_MASK = CardType.Artifact | CardType.Creature | CardType.Enchantment | CardType.Land | CardType.Planeswalker | CardType.Battle;
const ANY_TARGET_MASK = CardType.Creature | CardType.Planeswalker | CardType.Player;

export const TypeRestrictions: Record<string, IRestrictionHandler> = {
    "TOKEN": gameObjectRestriction((state, obj) => !!obj.isToken),
    "NON_TOKEN": gameObjectRestriction((state, obj) => !obj.isToken),
    "LEGENDARY": gameObjectRestriction((state, obj) => RuleUtils.hasSupertype(obj, "legendary")),
    "BASIC": gameObjectRestriction((state, obj) => RuleUtils.hasSupertype(obj, "basic")),
    "NON_BASIC": gameObjectRestriction((state, obj) => !RuleUtils.hasSupertype(obj, "basic")),
    "PERMANENT": gameObjectRestriction((state, obj) => {
        const mask = obj.typeMask || 0;
        return (mask & PERMANENT_MASK) !== 0;
    }),
    "SPELL": {
        matches(state, targetObj: Targetable) {
            // SPELL can be a GameObject (Card on Stack) or a StackObject (Copy)
            if (isGameObject(targetObj) && targetObj.zone === Zone.Stack) return true;
            if (isStackObject(targetObj)) return targetObj.type === 'Spell';
            return false;
        }
    },
    "ABILITY": {
        matches(state, targetObj: Targetable) {
            if (isStackObject(targetObj)) {
                return targetObj.type.includes('Ability');
            }
            return false;
        }
    },
    "ARTIFACT_OR_CREATURE": gameObjectRestriction((state, obj) => {
        const mask = obj.typeMask || 0;
        return (mask & (CardType.Artifact | CardType.Creature)) !== 0;
    }),
    "INSTANT_OR_SORCERY": gameObjectRestriction((state, obj) => {
        const mask = obj.typeMask || 0;
        return (mask & (CardType.Instant | CardType.Sorcery)) !== 0;
    }),
    "CREATURE_OR_PLANESWALKER": gameObjectRestriction((state, obj) => {
        const mask = obj.typeMask || 0;
        return (mask & (CardType.Creature | CardType.Planeswalker)) !== 0;
    }),
    "ANY_TARGET": {
        matches(state, targetObj: Targetable, r, context) {
            if (TypeRestrictions.PLAYER.matches(state, targetObj, r, context)) return true;
            if (!isGameObject(targetObj)) return false;
            const mask = targetObj.typeMask || 0;
            return (mask & (CardType.Creature | CardType.Planeswalker)) !== 0;
        }
    },
    "CREATURE_OR_LAND": gameObjectRestriction((state, obj) => {
        const mask = obj.typeMask || 0;
        return (mask & (CardType.Creature | CardType.Land)) !== 0;
    }),
    "ARTIFACT_OR_ENCHANTMENT": gameObjectRestriction((state, obj) => {
        const mask = obj.typeMask || 0;
        return (mask & (CardType.Artifact | CardType.Enchantment)) !== 0;
    }),
    "CARD_IN_GRAVEYARD": gameObjectRestriction((state, obj) => obj.zone === Zone.Graveyard),
    "GRAVEYARD": gameObjectRestriction((state, obj) => obj.zone === Zone.Graveyard),
    "CARD": {
        matches(state, targetObj: Targetable) {
            return !!targetObj.id && !state.players[targetObj.id];
        }
    },
    "CARD_IN_EXILE": gameObjectRestriction((state, obj) => obj.zone === Zone.Exile),
    "CARD_IN_HAND": gameObjectRestriction((state, obj) => obj.zone === Zone.Hand),
    "NON_LAND_PERMANENT": gameObjectRestriction((state, obj) => {
        const mask = obj.typeMask || 0;
        return !(mask & CardType.Land) && (mask & PERMANENT_MASK) !== 0;
    }),
    "NON_AURA": gameObjectRestriction((state, obj) => !RuleUtils.hasSubtype(obj, "aura"))
};

// Common base types mapper
const typeToMask: Record<string, number> = {
    [Restriction.Creature]: CardType.Creature,
    [Restriction.Planeswalker]: CardType.Planeswalker,
    [Restriction.Land]: CardType.Land,
    [Restriction.Artifact]: CardType.Artifact,
    [Restriction.Enchantment]: CardType.Enchantment,
    [Restriction.Instant]: CardType.Instant,
    [Restriction.Sorcery]: CardType.Sorcery,
    [Restriction.Player]: CardType.Player,
    'battle': CardType.Battle,
    'tribal': CardType.Tribal
};

Object.entries(typeToMask).forEach(([type, bit]) => {
    const upperType = type.toUpperCase();
    
    // Positive check
    TypeRestrictions[upperType] = {
        matches(state, targetObj: Targetable) {
            if (bit === CardType.Player) {
                return !!state.players[targetObj.id];
            }
            if (isGameObject(targetObj)) {
                if (targetObj.typeMask !== undefined) {
                    return (targetObj.typeMask & bit) !== 0;
                }
                // Fallback for tests/uninitialized objects
                return RuleUtils.isType(targetObj, type);
            }
            return false;
        }
    };

    // Negative check
    TypeRestrictions[`NON_${upperType}`] = {
        matches(state, targetObj: Targetable) {
            if (bit === CardType.Player) {
                return !state.players[targetObj.id];
            }
            if (isGameObject(targetObj)) {
                if (targetObj.typeMask !== undefined) {
                    return (targetObj.typeMask & bit) === 0;
                }
                // Fallback for tests/uninitialized objects
                return !RuleUtils.isType(targetObj, type);
            }
            return false;
        }
    };
});
