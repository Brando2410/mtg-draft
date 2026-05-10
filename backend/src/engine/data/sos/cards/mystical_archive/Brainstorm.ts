import { AbilityType, CardDefinition, EffectType, SelectionType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const Brainstorm: CardDefinition = {
    name: "Brainstorm",
    manaCost: "{U}",
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
                    position: 'top',
                    selectionType: SelectionType.Target,
                    targetDefinitions: [{
                        type: TargetType.CardInHand,
                        count: 2
                    }],
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ],
    scryfall_id: "8beb987c-1b67-4a4e-ae71-58547afad2a0",
    image_url: "https://cards.scryfall.io/normal/front/8/b/8beb987c-1b67-4a4e-ae71-58547afad2a0.jpg?1726284649",
    rarity: "common"
};

