import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType, Zone } from "@shared/engine_types";

export const EpitaphGolem: CardDefinition = {
    name: "Epitaph Golem",
    manaCost: "{5}",
    scryfall_id: "7988fd09-32a4-406b-8e7f-e77393d680a7",
    image_url: "https://cards.scryfall.io/normal/front/7/9/7988fd09-32a4-406b-8e7f-e77393d680a7.jpg?1594737486",
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
