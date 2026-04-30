import { CardType, Restriction, Zone } from "@shared/engine_types";
import { RuleUtils } from "../../../../utils/RuleUtils";
import { IRestrictionHandler } from "../IRestrictionHandler";

const PERMANENT_MASK = CardType.Artifact | CardType.Creature | CardType.Enchantment | CardType.Land | CardType.Planeswalker | CardType.Battle;
const ANY_TARGET_MASK = CardType.Creature | CardType.Planeswalker | CardType.Player;

export const TypeRestrictions: Record<string, IRestrictionHandler> = {
    "TOKEN": {
        matches(state, targetObj: any) {
            return !!targetObj.isToken;
        }
    },
    "NON_TOKEN": {
        matches(state, targetObj: any) {
            return !targetObj.isToken;
        }
    },
    "LEGENDARY": {
        matches(state, targetObj: any) {
            return RuleUtils.hasSupertype(targetObj, "legendary");
        }
    },
    "BASIC": {
        matches(state, targetObj: any) {
            return RuleUtils.hasSupertype(targetObj, "basic");
        }
    },
    "NON_BASIC": {
        matches(state, targetObj: any) {
            return !RuleUtils.hasSupertype(targetObj, "basic");
        }
    },
    "PERMANENT": {
        matches(state, targetObj: any) {
            const mask = targetObj.typeMask || 0;
            return (mask & PERMANENT_MASK) !== 0;
        }
    },
    "SPELL": {
        matches(state, targetObj: any) {
            return targetObj.type === 'Spell' || targetObj.zone === Zone.Stack;
        }
    },
    "ABILITY": {
        matches(state, targetObj: any) {
            const type = (targetObj as any).type || '';
            return type.includes('Ability');
        }
    },
    "ARTIFACT_OR_CREATURE": {
        matches(state, targetObj: any) {
            const mask = targetObj.typeMask || 0;
            return (mask & (CardType.Artifact | CardType.Creature)) !== 0;
        }
    },
    "INSTANT_OR_SORCERY": {
        matches(state, targetObj: any) {
            const mask = targetObj.typeMask || 0;
            return (mask & (CardType.Instant | CardType.Sorcery)) !== 0;
        }
    },
    "CREATURE_OR_PLANESWALKER": {
        matches(state, targetObj: any) {
            const mask = targetObj.typeMask || 0;
            return (mask & (CardType.Creature | CardType.Planeswalker)) !== 0;
        }
    },
    "ANY_TARGET": {
        matches(state, targetObj: any) {
            const mask = targetObj.typeMask || 0;
            return (mask & ANY_TARGET_MASK) !== 0;
        }
    },
    "CREATURE_OR_LAND": {
        matches(state, targetObj: any) {
            const mask = targetObj.typeMask || 0;
            return (mask & (CardType.Creature | CardType.Land)) !== 0;
        }
    },
    "ARTIFACT_OR_ENCHANTMENT": {
        matches(state, targetObj: any) {
            const mask = targetObj.typeMask || 0;
            return (mask & (CardType.Artifact | CardType.Enchantment)) !== 0;
        }
    },
    "CARD_IN_GRAVEYARD": {
        matches(state, targetObj: any) {
            return targetObj.zone === Zone.Graveyard;
        }
    },
    "GRAVEYARD": {
        matches(state, targetObj: any) {
            return targetObj.zone === Zone.Graveyard;
        }
    },
    "CARD": {
        matches(state, targetObj: any) {
            return !!targetObj.id && !state.players[targetObj.id];
        }
    },
    "CARD_IN_EXILE": {
        matches(state, targetObj: any) {
            return targetObj.zone === Zone.Exile;
        }
    },
    "CARD_IN_HAND": {
        matches(state, targetObj: any) {
            return targetObj.zone === Zone.Hand;
        }
    },
    "NON_LAND_PERMANENT": {
        matches(state, targetObj: any) {
            const mask = targetObj.typeMask || 0;
            return !(mask & CardType.Land) && (mask & PERMANENT_MASK) !== 0;
        }
    },
    "NON_AURA": {
        matches(state, targetObj: any) {
            return !RuleUtils.hasSubtype(targetObj, "aura");
        }
    }
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
        matches(state, targetObj: any) {
            if (bit === CardType.Player) {
                return !!state.players[targetObj.id];
            }
            return (targetObj.typeMask & bit) !== 0;
        }
    };

    // Negative check
    TypeRestrictions[`NON_${upperType}`] = {
        matches(state, targetObj: any) {
            if (bit === CardType.Player) {
                return !state.players[targetObj.id];
            }
            return (targetObj.typeMask & bit) === 0;
        }
    };
});
