import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const Plains: Record<string, ImplementableCard> = {
    "Plains": {
        name: "Plains",
        manaCost: "",
        oracleText: "({T}: Add {W}.)",
        colors: [],
        supertypes: ["Basic"],
        types: ["Land"],
        subtypes: ["Plains"],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "plains_mana",
                type: AbilityType.Activated,
                activeZone: Zone.Battlefield,
                isManaAbility: true,
                costs: [{ type: 'Tap', targetMapping: 'SELF' }],
                effects: [{ type: EffectType.AddMana, value: '{W}' }]
            }
        ]
    }
};
