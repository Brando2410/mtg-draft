import { GameState, GameObject, TargetingContext, Zone } from "@shared/engine_types";
import { IRestrictionHandler } from "../IRestrictionHandler";
import { LayerProcessor } from "../../../state/LayerProcessor";

export const SpecializedRestrictions: Record<string, IRestrictionHandler> = {
    "SHARES_COLOR_WITH_SOURCE": {
        matches(state, targetObj: any, r, context) {
            const { sourceId } = context;
            const { TargetValidator } = require("../TargetValidator");
            const source = TargetValidator.findObjectInAnyZone(state, sourceId);
            if (source) {
                const sourceColors = source.definition.colors || [];
                const targetColors = targetObj.definition.colors || [];
                return !!sourceColors.some((c: string) => targetColors.includes(c));
            }
            return false;
        }
    },
    "FROMHAND": {
        matches(state, targetObj: any) {
            const zone = targetObj.zone || targetObj.card?.zone;
            const lastZone = targetObj.lastNonStackZone || targetObj.card?.lastNonStackZone;
            return zone === Zone.Hand || lastZone === Zone.Hand;
        }
    },
    "CASTFROMHAND": {
        matches(state, targetObj: any, r, context) {
            return SpecializedRestrictions["FROMHAND"].matches(state, targetObj, "", {} as any);
        }
    },
    "MONOCOLORED": {
        matches(state, targetObj: any, r, context) {
            const { TargetValidator } = require("../TargetValidator");
            return !!TargetValidator.sourceHasQualities(targetObj, ['monocolored'], state);
        }
    },
    "MULTICOLORED": {
        matches(state, targetObj: any, r, context) {
            const { TargetValidator } = require("../TargetValidator");
            return !!TargetValidator.sourceHasQualities(targetObj, ['multicolored'], state);
        }
    },
    "COLORLESS": {
        matches(state, targetObj: any, r, context) {
            const { TargetValidator } = require("../TargetValidator");
            return !!TargetValidator.sourceHasQualities(targetObj, ['colorless'], state);
        }
    },
    "ONEORMORECOLORS": {
        matches(state, targetObj: any, r, context) {
            const { TargetValidator } = require("../TargetValidator");
            return !!TargetValidator.sourceHasQualities(targetObj, ['oneormorecolors'], state);
        }
    }
};

// --- KEYWORD CHECK ---
const knownKeywords = ['defender', 'flying', 'haste', 'vigilance', 'lifelink', 'deathtouch', 'trample', 'menace', 'reach', 'first strike', 'double strike', 'indestructible'];
knownKeywords.forEach(kw => {
    // Generate a normalized key (e.g., 'FIRSTSTRIKE', 'WITHOUTFLYING') to match toUpperCase() lookups
    const normalizedKw = kw.toUpperCase().replace(/[\s_]/g, '');
    
    SpecializedRestrictions[normalizedKw] = {
        matches(state, targetObj: any) {
            const stats = LayerProcessor.getEffectiveStats(targetObj, state);
            return !!stats.keywords.some((k: string) => k.toLowerCase() === kw);
        }
    };
    
    SpecializedRestrictions[`WITHOUT${normalizedKw}`] = {
        matches(state, targetObj: any) {
            const stats = LayerProcessor.getEffectiveStats(targetObj, state);
            return !stats.keywords.some((k: string) => k.toLowerCase() === kw);
        }
    };
});

