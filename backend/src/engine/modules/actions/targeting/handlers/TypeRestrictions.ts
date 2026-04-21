import { Zone } from "@shared/engine_types";
import { IRestrictionHandler } from "../IRestrictionHandler";

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
            const types = (targetObj.definition?.supertypes || []).map((t: string) => t.toLowerCase());
            return types.includes("legendary");
        }
    },
    "BASIC": {
        matches(state, targetObj: any) {
            const types = (targetObj.definition?.supertypes || []).map((t: string) => t.toLowerCase());
            return types.includes("basic");
        }
    },
    "NONBASIC": {
        matches(state, targetObj: any) {
            const types = (targetObj.definition?.supertypes || []).map((t: string) => t.toLowerCase());
            return !types.includes("basic");
        }
    },
    "PERMANENT": {
        matches(state, targetObj: any) {
            const definition = targetObj.definition || targetObj.card?.definition || (targetObj as any).cardData?.definition;
            const types = (definition?.types || []).map((t: string) => t.toLowerCase());
            const permTypes = ['artifact', 'creature', 'enchantment', 'land', 'planeswalker'];
            return types.some((t: string) => permTypes.includes(t));
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
            const types = (targetObj.definition?.types || []).map((t: string) => t.toLowerCase());
            return types.includes('artifact') || types.includes('creature');
        }
    },
    "INSTANTORSORCERY": {
        matches(state, targetObj: any) {
            const types = (targetObj.definition?.types || []).map((t: string) => t.toLowerCase());
            return types.includes('instant') || types.includes('sorcery');
        }
    },
    "INSTANT_OR_SORCERY": {
        matches(state, targetObj: any) {
            const types = (targetObj.definition?.types || []).map((t: string) => t.toLowerCase());
            return types.includes('instant') || types.includes('sorcery');
        }
    },
    "CREATUREORPLANESWALKER": {
        matches(state, targetObj: any) {
            const types = (targetObj.definition?.types || []).map((t: string) => t.toLowerCase());
            return types.includes('creature') || types.includes('planeswalker');
        }
    },
    "CREATURE_OR_PLANESWALKER": {
        matches(state, targetObj: any) {
            const types = (targetObj.definition?.types || []).map((t: string) => t.toLowerCase());
            return types.includes('creature') || types.includes('planeswalker');
        }
    },
    "CREATUREORLAND": {
        matches(state, targetObj: any) {
            const types = (targetObj.definition?.types || []).map((t: string) => t.toLowerCase());
            return types.includes('creature') || types.includes('land');
        }
    },
    "CREATURE_OR_LAND": {
        matches(state, targetObj: any) {
            const types = (targetObj.definition?.types || []).map((t: string) => t.toLowerCase());
            return types.includes('creature') || types.includes('land');
        }
    },
    "ARTIFACTORENCHANTMENT": {
        matches(state, targetObj: any) {
            const types = (targetObj.definition?.types || []).map((t: string) => t.toLowerCase());
            return types.includes('artifact') || types.includes('enchantment');
        }
    },
    "ARTIFACT_OR_ENCHANTMENT": {
        matches(state, targetObj: any) {
            const types = (targetObj.definition?.types || []).map((t: string) => t.toLowerCase());
            return types.includes('artifact') || types.includes('enchantment');
        }
    },
    "CARD_IN_GRAVEYARD": {
        matches(state, targetObj: any) {
            return targetObj.zone === Zone.Graveyard;
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
            const types = (targetObj.definition?.types || []).map((t: string) => t.toLowerCase());
            return !types.includes('land') && ['artifact', 'creature', 'enchantment', 'planeswalker'].some(t => types.includes(t));
        }
    },
    "CARD": {
        matches() { return true; }
    },
    "ANY": {
        matches() { return true; }
    },
    "ANYTARGET": {
        matches() { return true; }
    },
    "ANY_TARGET": {
        matches() { return true; }
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

// Common base types mapper (Positive and Negative)
const baseTypes = ['creature', 'planeswalker', 'land', 'artifact', 'enchantment', 'instant', 'sorcery', 'player'];

baseTypes.forEach(type => {
    const upperType = type.toUpperCase();
    
    // Positive check (e.g., CREATURE)
    TypeRestrictions[upperType] = {
        matches(state, targetObj: any) {
            const types = (targetObj.definition?.types || []).map((t: string) => t.toLowerCase());
            return types.includes(type) || (type === 'player' && !!state.players[targetObj.id]);
        }
    };

    // Negative check (e.g., NONCREATURE)
    TypeRestrictions[`NON${upperType}`] = {
        matches(state, targetObj: any, r, context) {
            return !TypeRestrictions[upperType].matches(state, targetObj, "", context);
        }
    };
});
