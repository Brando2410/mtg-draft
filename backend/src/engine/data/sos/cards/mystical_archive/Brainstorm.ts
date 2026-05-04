import { AbilityType, CardDefinition, EffectType, SelectionType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const Brainstorm: CardDefinition = {
    name: "Brainstorm",
    manaCost: "{U}",
    scryfall_id: "617208ff-dd9b-44fd-a740-d3188081e5cc", // Using the SOA ID if possible, or just a placeholder
    rarity: "rare",
    image_url: "https://cards.scryfall.io/normal/front/b/3/b3da96d0-7389-4074-9f3b-640a23363071.jpg?1775936465",
    colors: ["U"],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    oracleText: "Draw three cards, then put two cards from your hand on top of your library in any order.",
    set: "soa",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.DrawCards,
                    amount: 3
                },
                {
                    type: EffectType.MoveToZone,
                    label: "Put two cards from hand on top of library",
                    zone: Zone.Library,
                    libraryPosition: 'top',
                    selectionType: SelectionType.Target,
                    targetDefinitions: [{
                        type: TargetType.CardInHand,
                        count: 2
                    }],
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};
