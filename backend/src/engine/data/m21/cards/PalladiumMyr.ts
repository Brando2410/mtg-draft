import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const PalladiumMyr: Record<string, ImplementableCard> = {
    "Palladium Myr": {
        name: "Palladium Myr",
        manaCost: "{3}",
        oracleText: "{T}: Add {C}{C}.",
        colors: [],
        supertypes: [],
        types: ["Artifact", "Creature"],
        subtypes: ["Myr"],
        power: "2",
        toughness: "2",
        keywords: [],
        abilities: [
            {
                id: "palladium_myr_mana",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Tap', value: null }],
                isManaAbility: true,
                effects: [{
                    type: EffectType.AddMana,
                    value: 'C',
                    amount: 2,
                    targetMapping: 'CONTROLLER'
                }]
            }
        ]
    }
};
