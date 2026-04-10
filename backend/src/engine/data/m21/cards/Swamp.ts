import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const Swamp: Record<string, ImplementableCard> = {
    "Swamp": {
        name: "Swamp",
        manaCost: "",
        oracleText: "({T}: Add {B}.)",
        colors: [],
        supertypes: ["Basic"],
        types: ["Land"],
        subtypes: ["Swamp"],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "swamp_mana",
                type: AbilityType.Activated,
                activeZone: Zone.Battlefield,
                isManaAbility: true,
                costs: [{ type: 'Tap', targetMapping: 'SELF' }],
                effects: [{ type: EffectType.AddMana, value: '{B}' }]
            }
        ]
    }
};
