import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const Mountain: Record<string, ImplementableCard> = {
    "Mountain": {
        name: "Mountain",
        manaCost: "",
        oracleText: "({T}: Add {R}.)",
        colors: [],
        supertypes: ["Basic"],
        types: ["Land"],
        subtypes: ["Mountain"],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "mountain_mana",
                type: AbilityType.Activated,
                activeZone: Zone.Battlefield,
                isManaAbility: true,
                costs: [{ type: 'Tap', targetMapping: 'SELF' }],
                effects: [{ type: EffectType.AddMana, value: '{R}' }]
            }
        ]
    }
};
