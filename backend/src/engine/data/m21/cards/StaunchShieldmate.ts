import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const StaunchShieldmate: Record<string, ImplementableCard> = {
    "Staunch Shieldmate": {
        name: "Staunch Shieldmate",
        manaCost: "{W}",
        oracleText: "",
        colors: ["white"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Dwarf","Soldier"],
        power: "1",
        toughness: "3",
        keywords: [],
        abilities: [] // Vanilla
    }
};
