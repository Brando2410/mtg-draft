import { AbilityType, CardDefinition, EffectType, TargetMapping, Zone, ZoneRequirement } from '@shared/engine_types';

export const VisionarysDance: CardDefinition = {
    "name": "Visionary's Dance",
    "manaCost": "{5}{U}{R}",
    "colors": [
        "R",
        "U"
    ],
    "types": [
        "Sorcery"
    ],
    "subtypes": [],
    "oracleText": "Create two 3/3 blue and red Elemental creature tokens with flying.\n{2}, Discard this card: Look at the top two cards of your library. Put one of them into your hand and the other into your graveyard.",
    "abilities": [
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
                        keywords: [
                            'Flying'
                        ]
                    }
                }
            ]
        },
        {
            type: AbilityType.Activated,
            activeZone: ZoneRequirement.Hand,
            costs: [
                {
                    type: 'Mana',
                    value: '{2}'
                },
                {
                    type: 'Discard',
                    targetMapping: TargetMapping.Self
                }
            ],
            effects: [
                {
                    type: EffectType.LookAtTopAndPick,
                    fromTop: 2,
                    maxChoices: 1,
                    destination: Zone.Hand,
                    remainderZone: Zone.Graveyard,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};


