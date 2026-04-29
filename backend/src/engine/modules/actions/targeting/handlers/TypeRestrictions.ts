import { Zone, CardType } from "@shared/engine_types";
import { IRestrictionHandler } from "../IRestrictionHandler";

const PERMANENT_MASK = CardType.Artifact | CardType.Creature | CardType.Enchantment | CardType.Land | CardType.Planeswalker | CardType.Battle;
const ANY_TARGET_MASK = CardType.Creature | CardType.Planeswalker | CardType.Player;

export const TypeRestrictions: Record<string, IRestrictionHandler> = {
    "TOKEN": {
        matches(state, targetObj: any) {
            return !!targetObj.isToken;
        }
    },
    "NONTOKEN": {
        matches(state, targetObj: any) {
            return !targetObj.isToken;
        }
    },
    "LEGENDARY": {
        matches(state, targetObj: any) {
            const supertypes = (targetObj.definition?.supertypes || []).map((t: string) => t.toLowerCase());
            return supertypes.includes("legendary");
        }
    },
    "BASIC": {
        matches(state, targetObj: any) {
            const supertypes = (targetObj.definition?.supertypes || []).map((t: string) => t.toLowerCase());
            return supertypes.includes("basic");
        }
    },
    "NONBASIC": {
        matches(state, targetObj: any) {
            const supertypes = (targetObj.definition?.supertypes || []).map((t: string) => t.toLowerCase());
            return !supertypes.includes("basic");
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
    "ARTIFACTORCREATURE": {
        matches(state, targetObj: any) {
            const mask = targetObj.typeMask || 0;
            return (mask & (CardType.Artifact | CardType.Creature)) !== 0;
        }
    },
    "INSTANTORSORCERY": {
        matches(state, targetObj: any) {
            const mask = targetObj.typeMask || 0;
            return (mask & (CardType.Instant | CardType.Sorcery)) !== 0;
        }
    },
    "INSTANT_OR_SORCERY": {
        matches(state, targetObj: any) {
            const mask = targetObj.typeMask || 0;
            return (mask & (CardType.Instant | CardType.Sorcery)) !== 0;
        }
    },
    "CREATUREORPLANESWALKER": {
        matches(state, targetObj: any) {
            const mask = targetObj.typeMask || 0;
            return (mask & (CardType.Creature | CardType.Planeswalker)) !== 0;
        }
    },
    "CREATURE_OR_PLANESWALKER": {
        matches(state, targetObj: any) {
            const mask = targetObj.typeMask || 0;
            return (mask & (CardType.Creature | CardType.Planeswalker)) !== 0;
        }
    },
    "ANYTARGET": {
        matches(state, targetObj: any) {
            const mask = targetObj.typeMask || 0;
            return (mask & ANY_TARGET_MASK) !== 0;
        }
    },
    "ANY_TARGET": {
        matches(state, targetObj: any) {
            const mask = targetObj.typeMask || 0;
            return (mask & ANY_TARGET_MASK) !== 0;
        }
    },
    "CREATUREORLAND": {
        matches(state, targetObj: any) {
            const mask = targetObj.typeMask || 0;
            return (mask & (CardType.Creature | CardType.Land)) !== 0;
        }
    },
    "CREATURE_OR_LAND": {
        matches(state, targetObj: any) {
            const mask = targetObj.typeMask || 0;
            return (mask & (CardType.Creature | CardType.Land)) !== 0;
        }
    },
    "ARTIFACTORENCHANTMENT": {
        matches(state, targetObj: any) {
            const mask = targetObj.typeMask || 0;
            return (mask & (CardType.Artifact | CardType.Enchantment)) !== 0;
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
    "NONLANDPERMANENT": {
        matches(state, targetObj: any) {
            const mask = targetObj.typeMask || 0;
            return !(mask & CardType.Land) && (mask & PERMANENT_MASK) !== 0;
        }
    },
    "NONAURA": {
        matches(state, targetObj: any) {
            const subtypes = (targetObj.definition?.subtypes || []).map((s: string) => s.toLowerCase());
            return !subtypes.includes("aura");
        }
    },
    "NOT_AURA": {
        matches(state, targetObj: any) {
            const subtypes = (targetObj.definition?.subtypes || []).map((s: string) => s.toLowerCase());
            return !subtypes.includes("aura");
        }
    }
};

// Common base types mapper
const typeToMask: Record<string, number> = {
    'creature': CardType.Creature,
    'planeswalker': CardType.Planeswalker,
    'land': CardType.Land,
    'artifact': CardType.Artifact,
    'enchantment': CardType.Enchantment,
    'instant': CardType.Instant,
    'sorcery': CardType.Sorcery,
    'player': CardType.Player,
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
    TypeRestrictions[`NON${upperType}`] = {
        matches(state, targetObj: any) {
            if (bit === CardType.Player) {
                return !state.players[targetObj.id];
            }
            return (targetObj.typeMask & bit) === 0;
        }
    };
});
