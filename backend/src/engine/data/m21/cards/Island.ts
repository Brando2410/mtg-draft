import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const Island: Record<string, ImplementableCard> = {
    "Island": {
        name: "Island",
        manaCost: "",
        oracleText: "({T}: Add {U}.)",
        colors: [],
        supertypes: ["Basic"],
        types: ["Land"],
        subtypes: ["Island"],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "island_mana",
                type: AbilityType.Activated,
                activeZone: Zone.Battlefield,
                isManaAbility: true,
                costs: [{ type: 'Tap', targetMapping: 'SELF' }],
                effects: [{ type: EffectType.AddMana, value: '{U}' }]
            }
        ]
    }
};
