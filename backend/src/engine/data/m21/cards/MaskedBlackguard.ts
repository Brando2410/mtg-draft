import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const MaskedBlackguard: Record<string, ImplementableCard> = {
    "Masked Blackguard": {
        name: "Masked Blackguard",
        manaCost: "{1}{B}",
        oracleText: "Flash (You may cast this spell any time you could cast an instant.)\n{2}{B}: This creature gets +1/+1 until end of turn.",
        colors: [],
        supertypes: [],
        types: [],
        subtypes: [],
        power: "2",
        toughness: "1",
        keywords: [],
        abilities: []
    }
};
