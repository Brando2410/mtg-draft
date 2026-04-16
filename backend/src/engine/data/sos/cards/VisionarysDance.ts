import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';
export const VisionarysDance = {
    name: "Visionary's Dance",
    manaCost: "{5}{U}{R}",
    colors: [
        "R",
        "U"
    ],
    types: [
        "Sorcery"
    ],
    subtypes: [],
    keywords: [
        'Flying'
    ],
    oracleText: "Create two 3/3 blue and red Elemental creature tokens with flying.\n{2}, Discard this card: Look at the top two cards of your library. Put one of them into your hand and the other into your graveyard.",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.CreateToken,
                    amount: 2,
                    tokenBlueprint: {
                        name: 'Elemental',
                        colors: [
                            'U',
                            'R'
                        ],
                        types: [
                            'Creature'
                        ],
                        subtypes: [
                            'Elemental'
                        ],
                        power: 3,
                        toughness: 3,

                        image_url: 'https://cards.scryfall.io/png/front/3/d/3d0b9b88-705e-4df0-8a93-3e240b81355b.png?1682693891'
                    }
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [
                {
                    type: CostType.Mana,
                    value: '{2}'
                },
                {
                    type: CostType.Discard,
                    targetMapping: TargetType.Self
                }
            ],
            effects: [
                {
                    type: EffectType.LookAtTopAndPick,
                    fromTop: 2,
                    amount: 1,
                    zone: Zone.Hand,
                    remainderZone: Zone.Graveyard,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};
