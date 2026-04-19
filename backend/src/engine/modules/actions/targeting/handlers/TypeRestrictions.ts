import { GameState, GameObject, TargetingContext, Zone } from "@shared/engine_types";
import { IRestrictionHandler } from "../IRestrictionHandler";
import { LayerProcessor } from "../../../state/LayerProcessor";

export const TypeRestrictions: Record<string, IRestrictionHandler> = {
    "NONLAND": {
        matches(state, targetObj: any) {
            const types = (targetObj.definition?.types || []).map((t: string) => t.toLowerCase());
            return !types.includes("land");
        }
    },
    "NONCREATURE": {
        matches(state, targetObj: any) {
            const types = (targetObj.definition?.types || []).map((t: string) => t.toLowerCase());
            return !types.includes("creature");
        }
    },
    "NONARTIFACT": {
        matches(state, targetObj: any) {
            const types = (targetObj.definition?.types || []).map((t: string) => t.toLowerCase());
            return !types.includes("artifact");
        }
    },
    "NONENCHANTMENT": {
        matches(state, targetObj: any) {
            const types = (targetObj.definition?.types || []).map((t: string) => t.toLowerCase());
            return !types.includes("enchantment");
        }
    },
    "NONPLANESWALKER": {
        matches(state, targetObj: any) {
            const types = (targetObj.definition?.types || []).map((t: string) => t.toLowerCase());
            return !types.includes("planeswalker");
        }
    },
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
    "PERMANENT": {
        matches(state, targetObj: any) {
            const types = (targetObj.definition?.types || []).map((t: string) => t.toLowerCase());
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
    }
};

// Common base types mapper
const baseTypes = ['creature', 'planeswalker', 'land', 'artifact', 'enchantment', 'instant', 'sorcery', 'player'];
baseTypes.forEach(type => {
    TypeRestrictions[type.toUpperCase()] = {
        matches(state, targetObj: any) {
            const types = (targetObj.definition?.types || []).map((t: string) => t.toLowerCase());
            return types.includes(type) || (type === 'player' && !!state.players[targetObj.id]);
        }
    };
});

