import { Targetable, Zone, StackObject, PlayerState } from "@shared/engine_types";
import { LayerProcessor } from "../../../state/LayerProcessor";
import { IRestrictionHandler } from "../IRestrictionHandler";
import { RuleUtils } from "../../../../utils/RuleUtils";
import { getProcessors } from "../../../ProcessorRegistry";
import { gameObjectRestriction, isGameObject, isPlayerState, isStackObject } from "./HandlerUtils";

const FROMHAND: IRestrictionHandler = {
    matches(state, targetObj) {
        if (isGameObject(targetObj)) {
            // Virtual IDs (v_...) are used in the tray for non-hand cards.
            // Zaffai's permission is strictly for cards cast from the hand.
            if (targetObj.id.startsWith('v_') || (targetObj as any).isVirtual) return false;
            
            if (targetObj.zone === Zone.Hand) return true;

            // For objects already on the stack, check where they came from via LKI
            const processors = getProcessors(state);
            const lki = processors.lki.getLki(state, targetObj.id, Zone.Hand);
            if (lki) return true;
            
            return false;
        }

        if (isStackObject(targetObj) && targetObj.sourceObject) {
            return targetObj.sourceObject.zone === Zone.Hand || targetObj.sourceObject.lastNonStackZone === Zone.Hand;
        }

        return false;
    }
};

export const SpecializedRestrictions: Record<string, IRestrictionHandler> = {
    "SHARES_COLOR_WITH_SOURCE": gameObjectRestriction((state, obj, r, context) => {
        const { sourceId, stackObject } = context;
        const source = stackObject?.sourceObject || RuleUtils.findObject(state, sourceId);
        if (source && RuleUtils.isEntity(source)) {
            const sourceColors = RuleUtils.getColors(source, state);
            const targetColors = RuleUtils.getColors(obj, state);
            return !!sourceColors.some((c: string) => targetColors.includes(c));
        }
        return false;
    }),
    FROM_HAND: FROMHAND,
    FROMHAND: FROMHAND,
    CAST_FROM_HAND: FROMHAND,
    CASTFROMHAND: FROMHAND,
    "MONOCOLORED": gameObjectRestriction((state, obj, r, context) => {
        const { targeting: TP } = getProcessors(state);
        return !!TP.sourceHasQualities(obj, ['monocolored'], state);
    }),
    "MULTICOLORED": gameObjectRestriction((state, obj, r, context) => {
        const { targeting: TP } = getProcessors(state);
        return !!TP.sourceHasQualities(obj, ['multicolored'], state);
    }),
    "COLORLESS": gameObjectRestriction((state, obj, r, context) => {
        const { targeting: TP } = getProcessors(state);
        return !!TP.sourceHasQualities(obj, ['colorless'], state);
    }),
    "ONEORMORECOLORS": gameObjectRestriction((state, obj, r, context) => {
        const { targeting: TP } = getProcessors(state);
        return !!TP.sourceHasQualities(obj, ['oneormorecolors'], state);
    }),
    "SAMENAMEASSOURCE": gameObjectRestriction((state, obj, r, context) => {
        const { sourceId, stackObject } = context;
        const source = stackObject?.sourceObject || RuleUtils.findObject(state, sourceId);
        if (source && RuleUtils.isEntity(source)) {
            const sourceName = (source as any).definition?.name;
            const targetName = obj.definition.name;
            return sourceName === targetName;
        }
        return false;
    }),
    "HASXINMANACOST": gameObjectRestriction((state, obj) => {
        return (obj.definition.manaCost || "").includes("X");
    }),
    "INSTANT_OR_SORCERY_OR_ABILITY": {
        matches(state, targetObj, r, context) {
            const { targeting: TP } = getProcessors(state);
            return TP.matchesRestrictions(state, targetObj, [{ type: 'any', restrictions: ['instant', 'sorcery', 'ability'] }], context);
        }
    },
    "HAS_SINGLE_TARGET": {
        matches(state, targetObj) {
            return (targetObj as any).targets?.length === 1;
        }
    },
    "ANY": {
        matches() { return true; }
    },
    "ALL": {
        matches() { return true; }
    },
};

// --- KEYWORD CHECK ---
const knownKeywords = ['defender', 'flying', 'haste', 'vigilance', 'lifelink', 'deathtouch', 'trample', 'menace', 'reach', 'first strike', 'double strike', 'indestructible'];
knownKeywords.forEach(kw => {
    const normalizedKw = kw.toUpperCase().replace(/[\s_]/g, '');

    SpecializedRestrictions[normalizedKw] = gameObjectRestriction((state, obj) => {
        return RuleUtils.hasKeyword(obj, kw);
    });

    SpecializedRestrictions[`WITHOUT${normalizedKw}`] = gameObjectRestriction((state, obj) => {
        return !RuleUtils.hasKeyword(obj, kw);
    });
});

// --- COLOR CHECK ---
const colors = ['White', 'Blue', 'Black', 'Red', 'Green'];
colors.forEach(c => {
    SpecializedRestrictions[c.toUpperCase()] = gameObjectRestriction((state, obj) => {
        const { targeting: TP } = getProcessors(state);
        return TP.getColors(obj, state).includes(c.toLowerCase());
    });
    SpecializedRestrictions[`NON${c.toUpperCase()}`] = gameObjectRestriction((state, obj) => {
        const { targeting: TP } = getProcessors(state);
        return !TP.getColors(obj, state).includes(c.toLowerCase());
    });
});

SpecializedRestrictions["NONBASIC"] = gameObjectRestriction((state, obj) => {
    return RuleUtils.isType(obj, 'Land') && !RuleUtils.hasSupertype(obj, 'Basic');
});
SpecializedRestrictions["POWER4ORGREATER"] = gameObjectRestriction((state, obj) => {
    const stats = LayerProcessor.getEffectiveStats(obj, state);
    return (stats.power || 0) >= 4;
});
SpecializedRestrictions["POWER3ORGREATER"] = gameObjectRestriction((state, obj) => {
    const stats = LayerProcessor.getEffectiveStats(obj, state);
    return (stats.power || 0) >= 3;
});
SpecializedRestrictions["POWER_LE_2"] = gameObjectRestriction((state, obj) => {
    const stats = LayerProcessor.getEffectiveStats(obj, state);
    return (stats.power || 0) <= 2;
});
[5, 6].forEach(mv => {
    SpecializedRestrictions[`MV${mv}ORGREATER`] = gameObjectRestriction((state, obj) => {
        const { mana: MP } = getProcessors(state);
        return MP.getManaValue(obj.definition.manaCost || '', obj.xValue || 0) >= mv;
    });
});

[1, 2, 3, 4].forEach(mv => {
    SpecializedRestrictions[`MV_LE_${mv}`] = gameObjectRestriction((state, obj) => {
        const { mana: MP } = getProcessors(state);
        return MP.getManaValue(obj.definition.manaCost || '', obj.xValue || 0) <= mv;
    });
});

SpecializedRestrictions["EXILEDWITHSOURCE"] = gameObjectRestriction((state, obj, r, context) => {
    const { sourceId } = context;
    return obj.exiledBy === sourceId;
});

SpecializedRestrictions["ATTACKING"] = gameObjectRestriction((state, obj) => {
    return !!obj.isAttacking;
});
SpecializedRestrictions["BLOCKING"] = gameObjectRestriction((state, obj) => {
    return !!obj.isBlocking;
});
SpecializedRestrictions["HASCOUNTER_P1P1"] = gameObjectRestriction((state, obj) => {
    return (obj.counters?.['+1/+1'] || 0) > 0;
});
SpecializedRestrictions["WASDEALTDAMAGETHISTURN"] = gameObjectRestriction((state, obj) => {
    return !!obj.dealtDamageThisTurn;
});
SpecializedRestrictions["GREATESTPOWER"] = gameObjectRestriction((state, obj, r, context) => {
    const { targeting: TP } = getProcessors(state);
    const { sourceId, controllerId } = context;
    const targetDefinitions = [{ type: (RuleUtils.isCreature(obj) ? 'Creature' : 'Permanent') }];
    const poolIds = TP.getLegalTargetPool(state, sourceId, targetDefinitions, controllerId);
    const pool = poolIds.map(id => RuleUtils.findObject(state, id)).filter(Boolean);
    const powers = pool.map((o: any) => LayerProcessor.getEffectiveStats(o, state).power || 0);
    const maxPower = powers.length > 0 ? Math.max(...powers) : 0;
    return LayerProcessor.getEffectiveStats(obj, state).power === maxPower;
});

SpecializedRestrictions["CONTROLLED_BY_TARGET_1"] = {
    matches(state, targetObj, r, context) {
        const { targets } = context;
        if (!targets || targets.length === 0) return false;
        const controllerId = isGameObject(targetObj) ? targetObj.controllerId : (isStackObject(targetObj) ? (targetObj as StackObject).controllerId : (isPlayerState(targetObj) ? (targetObj as PlayerState).id : null));
        return controllerId === targets[0];
    }
};

SpecializedRestrictions["OWNED_BY_TARGET_1"] = {
    matches(state, targetObj, r, context) {
        const { targets } = context;
        if (!targets || targets.length === 0) return false;
        const ownerId = isGameObject(targetObj) ? targetObj.ownerId : (isStackObject(targetObj) ? ((targetObj as StackObject).ownerId || (targetObj as StackObject).controllerId) : null);
        return String(ownerId) === String(targets[0]);
    }
};


const subtypesToRegister = ['Liliana', 'Garruk', 'Basri', 'Teferi', 'Chandra', 'Zombie', 'Cat', 'Dog', 'Spirit', 'Shrine', 'Forest', 'Island', 'Mountain', 'Plains', 'Swamp', 'Lesson', 'Pest', 'Bat', 'Insect', 'Snake', 'Spider'];
subtypesToRegister.forEach(st => {
    SpecializedRestrictions[st.toUpperCase()] = gameObjectRestriction((state, obj) => {
        return RuleUtils.hasSubtype(obj, st);
    });
});

