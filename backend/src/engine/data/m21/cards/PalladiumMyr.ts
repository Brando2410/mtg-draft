import { AbilityType, ZoneRequirement, CardDefinition, EffectType, TargetMapping } from "@shared/engine_types";

export const PalladiumMyr: CardDefinition = {

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
            type: AbilityType.Activated,
            activeZone: ZoneRequirement.Battlefield,
            costs: [{ type: 'Tap' }],
            isManaAbility: true,
            effects: [{
                type: EffectType.AddMana,
                value: 'C',
                amount: 2,
                targetMapping: TargetMapping.Controller
            }]
        }
    ]
};
