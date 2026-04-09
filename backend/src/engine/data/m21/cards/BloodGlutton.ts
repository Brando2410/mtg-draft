import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const BloodGlutton: Record<string, ImplementableCard> = {
    "Blood Glutton": {
        name: "Blood Glutton",
        manaCost: "{4}{B}",
        oracleText: "Lifelink (Damage dealt by this creature also causes you to gain that much life.)",
        colors: ["black"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Vampire"],
        power: "4",
        toughness: "3",
        keywords: ["Lifelink"],
        abilities: []
    }
};
