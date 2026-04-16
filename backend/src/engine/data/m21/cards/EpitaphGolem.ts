import { CardDefinition, AbilityType, Zone, EffectType, TargetType, TargetMapping, Restriction } from "@shared/engine_types";

export const EpitaphGolem: CardDefinition = {
    name: "Epitaph Golem",
    manaCost: "{5}",
    oracleText: "{2}: Put target card from your graveyard on the bottom of your library.",
    colors: [],
    types: ["Artifact", "Creature"],
    subtypes: ["Golem"],
    power: "3",
    toughness: "5",
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [
                { type: 'Mana', value: "{2}" }
            ],
            targetDefinition: {
                type: TargetType.Card,
                count: 1,
                restrictions: [Restriction.Graveyard, Restriction.Yours]
            },
            effects: [
                {
                    type: EffectType.MoveToZone,
                    zone: Zone.Library,
                    libraryPosition: "bottom",
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};
