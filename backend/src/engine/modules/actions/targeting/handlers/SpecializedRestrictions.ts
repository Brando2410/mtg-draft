import { Zone } from "@shared/engine_types";
import { IRestrictionHandler } from "../IRestrictionHandler";
import { LayerProcessor } from "../../../state/LayerProcessor";

const FROMHAND: IRestrictionHandler = {
    matches(state, targetObj: any) {
        const zone = targetObj.zone || targetObj.card?.zone;
        const lastZone = targetObj.lastNonStackZone || targetObj.card?.lastNonStackZone;
        return zone === Zone.Hand || lastZone === Zone.Hand;
    }
};

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
    FROMHAND,
    CASTFROMHAND: FROMHAND,
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
    },
    "SAMENAMEASSOURCE": {
        matches(state, targetObj: any, r, context) {
            const { sourceId } = context;
            const { TargetValidator } = require("../TargetValidator");
            const source = TargetValidator.findObjectInAnyZone(state, sourceId);
            if (source) {
                const sourceName = source.definition.name;
                const targetName = targetObj.definition?.name || targetObj.card?.definition?.name;
                return sourceName === targetName;
            }
            return false;
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

// --- COLOR CHECK ---
const colors = ['White', 'Blue', 'Black', 'Red', 'Green'];
colors.forEach(c => {
    SpecializedRestrictions[c.toUpperCase()] = {
        matches(state, targetObj: any) {
            const { TargetValidator } = require("../TargetValidator");
            return TargetValidator.getColors(targetObj, state).includes(c.toLowerCase());
        }
    };
    SpecializedRestrictions[`NON${c.toUpperCase()}`] = {
        matches(state, targetObj: any) {
            const { TargetValidator } = require("../TargetValidator");
            return !TargetValidator.getColors(targetObj, state).includes(c.toLowerCase());
        }
    };
});

SpecializedRestrictions["NONBASIC"] = {
    matches(state, targetObj: any) {
        const definition = targetObj.definition || targetObj.card?.definition;
        if (!definition) return false;
        return (definition.types || []).includes('Land') && !(definition.supertypes || []).includes('Basic');
    }
};
SpecializedRestrictions["POWER4ORGREATER"] = {
    matches(state, targetObj: any) {
        const stats = LayerProcessor.getEffectiveStats(targetObj, state);
        return (stats.power || 0) >= 4;
    }
};
[5, 6].forEach(mv => {
    SpecializedRestrictions[`MV${mv}ORGREATER`] = {
        matches(state, targetObj: any) {
            const definition = targetObj.definition || targetObj.card?.definition;
            if (!definition) return false;
            const { ManaProcessor } = require("../../../magic/ManaProcessor");
            return ManaProcessor.getManaValue(definition.manaCost || '') >= mv;
        }
    };
});


[1, 2, 3, 4].forEach(mv => {
    SpecializedRestrictions[`MV_LE_${mv}`] = {
        matches(state, targetObj: any) {
            const definition = targetObj.definition || targetObj.card?.definition;
            if (!definition) return false;
            const { ManaProcessor } = require("../../../magic/ManaProcessor");
            return ManaProcessor.getManaValue(definition.manaCost || '') <= mv;
        }
    };
});

SpecializedRestrictions["EXILEDWITHSOURCE"] = {
    matches(state, targetObj: any, r, context) {
        const { sourceId } = context;
        return targetObj.exiledBy === sourceId;
    }
};

SpecializedRestrictions["ATTACKING"] = {
    matches(state, targetObj: any) {
        return !!targetObj.attacking;
    }
};
SpecializedRestrictions["BLOCKING"] = {
    matches(state, targetObj: any) {
        return !!targetObj.blocking;
    }
};
SpecializedRestrictions["HASCOUNTER_P1P1"] = {
    matches(state, targetObj: any) {
        return (targetObj.counters?.['P1P1'] || 0) > 0;
    }
};
SpecializedRestrictions["WASDEALTDAMAGETHISTURN"] = {
    matches(state, targetObj: any) {
        return !!targetObj.dealtDamageThisTurn;
    }
};
SpecializedRestrictions["GREATESTPOWER"] = {
    matches(state, targetObj: any, r, context) {
        const { TargetValidator } = require("../TargetValidator");
        const pool = TargetValidator.getLegalTargetPool(state, { type: targetObj.type || (targetObj.card?.definition?.types?.includes('Creature') ? 'Creature' : 'Permanent') }, context);
        const powers = pool.map((o: any) => LayerProcessor.getEffectiveStats(o, state).power || 0);
        const maxPower = powers.length > 0 ? Math.max(...powers) : 0;
        return LayerProcessor.getEffectiveStats(targetObj, state).power === maxPower;
    }
};

SpecializedRestrictions["CONTROLLED_BY_TARGET_1"] = {
    matches(state, targetObj: any, r, context) {
        const { targets } = context;
        if (!targets || targets.length === 0) return false;
        return targetObj.controllerId === targets[0];
    }
};

// --- SUBTYPE CHECK (Planeswalkers and others) ---
const subtypesToRegister = ['Liliana', 'Garruk', 'Basri', 'Teferi', 'Chandra', 'Zombie', 'Cat', 'Dog', 'Spirit', 'Shrine', 'Forest', 'Island', 'Mountain', 'Plains', 'Swamp', 'Lesson', 'Pest', 'Bat', 'Insect', 'Snake', 'Spider'];
subtypesToRegister.forEach(st => {
    SpecializedRestrictions[st.toUpperCase()] = {
        matches(state, targetObj: any) {
            const definition = targetObj.definition || targetObj.card?.definition;
            if (!definition) return false;
            return (definition.subtypes || []).includes(st);
        }
    };
});
