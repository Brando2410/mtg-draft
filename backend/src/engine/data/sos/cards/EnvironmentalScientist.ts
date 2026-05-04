import { AbilityType, CardDefinition, EffectType, Restriction, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const EnvironmentalScientist: CardDefinition = {
    name: "Environmental Scientist",
    manaCost: "{1}{G}",
    scryfall_id: "f2bf6b36-43e4-49d9-98b2-cbb4304c248b",
    rarity: "uncommon",
    image_url: "https://cards.scryfall.io/normal/front/f/2/f2bf6b36-43e4-49d9-98b2-cbb4304c248b.jpg?1775938001",
    colors: [
        "G"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Human",
        "Druid"
    ],
    keywords: [],
    power: "2",
    toughness: "2",
    oracleText: "When this creature enters, you may search your library for a basic land card, reveal it, put it into your hand, then shuffle.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.SearchLibrary,
                    targetDefinitions: [{
                        type: TargetType.Land,
                        count: 1,
                        optional: true,
                        restrictions: [Restriction.Basic]
                    }],
                    zone: Zone.Hand,
                    reveal: true,
                    shuffle: true
                }
            ]
        }
    ]
};
