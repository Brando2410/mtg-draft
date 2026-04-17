import { AbilityType, CardDefinition, CostType, EffectType, Restriction, SelectionType, TargetMapping, TargetType, Zone } from '@shared/engine_types';
    export const HarmonizedTrioBrainstorm: CardDefinition = {
    name: "Harmonized Trio // Brainstorm",
    manaCost: "{U}",
    colors: ["U"],
    types: ["Creature"],
    subtypes: ["Merfolk", "Bard", "Wizard"],
    keywords: ["Prepared"],
    oracleText: "{T}, Tap two untapped creatures you control: This creature becomes prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
    power: "1",
    toughness: "1",
    image_url: "https://cards.scryfall.io/png/front/6/1/617208ff-dd9b-44fd-a740-d3188081e5cc.png",
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [
                { type: CostType.TapSelection, value: 2, restrictions: [
                { type: 'Type', value: 'Creature' },
                { type: 'State', value: 'Untapped' },
                { type: 'Control', value: 'YouControl' },
                { type: 'Identity', value: 'Other' }
            ] },
                { type: CostType.Tap }
            ],
            effects: [
                {
                    type: EffectType.Prepare,
                    targetMapping: TargetType.Self
                }
            ]
        }
    ],
    preparedFace: {
        name: "Brainstorm",
        manaCost: "{U}",
        colors: ["U"],
        types: ["Instant"],
        type_line: "Instant",
        image_url: "https://cards.scryfall.io/png/front/8/b/8beb987c-1b67-4a4e-ae71-58547afad2a0.png?1726284649",
        oracleText: "Draw three cards, then put two cards from your hand on top of your library in any order.",
        abilities: [
            {
                type: AbilityType.Spell,
                effects: [
                    {
                        type: EffectType.DrawCards,
                        amount: 3,
                        targetMapping: TargetMapping.Controller
                    },
                    {
                        type: EffectType.MoveToZone,
                        label: "Put two cards from hand on top of library (2nd selected goes on top of 1st)",
                        zone: Zone.Library,
                        libraryPosition: 'top',
                        selectionType: SelectionType.Target,
                        targetDefinition: {
                            type: TargetType.CardInHand,
                            count: 2,
                            restrictions: [
                Restriction.YouControl
            ]
                        },
                        targetMapping: TargetMapping.Controller
                    }
                ]
            }
        ]
    }
};
    