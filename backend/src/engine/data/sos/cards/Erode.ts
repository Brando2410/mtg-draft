import { CardDefinition, AbilityType, EffectType, TargetType, Zone } from '@shared/engine_types';

export const Erode: CardDefinition = {
    "name": "Erode",
    "manaCost": "{W}",
    "colors": [
        "W"
    ],
    "types": [
        "Instant"
    ],
    "subtypes": [],
    "oracleText": "Destroy target creature or planeswalker. Its controller may search their library for a basic land card, put it onto the battlefield tapped, then shuffle.",
    "abilities": [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Permanent,
                count: 1,
                restrictions: ['Creature', 'Planeswalker']
            },
            effects: [
                {
                    type: EffectType.Destroy,
                    targetMapping: 'TARGET_1'
                },
                {
                    type: EffectType.Choice,
                    label: 'Search for a basic land?',
                    targetMapping: 'TARGET_1_CONTROLLER',
                    optional: true,
                    choices: [
                        {
                            label: 'Search',
                            effects: [
                                {
                                    type: EffectType.SearchLibrary,
                                    targetDefinition: {
                                        type: TargetType.Card,
                                        zone: Zone.Library,
                                        count: 1,
                                        restrictions: ['Basic', 'Land']
                                    },
                                    effects: [
                                        {
                                            type: EffectType.PutOnBattlefield,
                                            targetMapping: 'TARGET_1',
                                            tapped: true
                                        }
                                    ]
                                },
                                {
                                    type: EffectType.ShuffleLibrary
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};


