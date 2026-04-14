import { CardDefinition, AbilityType, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const ProctorsGaze: CardDefinition = {
    "name": "Proctor's Gaze",
    "manaCost": "{2}{G}{U}",
    "colors": [
        "G",
        "U"
    ],
    "types": [
        "Instant"
    ],
    "subtypes": [],
    "oracleText": "Return up to one target nonland permanent to its owner's hand. Search your library for a basic land card, put it onto the battlefield tapped, then shuffle.",
    "abilities": [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Permanent,
                count: 1,
                minCount: 0,
                restrictions: ['NonLand']
            },
            effects: [
                {
                    type: EffectType.ReturnToHand,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.SearchLibrary,
                    targetMapping: TargetMapping.Controller,
                    restrictions: ['Basic', 'Land'],
                    destination: Zone.Battlefield,
                    tapped: true
                },
                {
                    type: EffectType.ShuffleLibrary,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};


