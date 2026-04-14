import { CardDefinition, AbilityType, EffectType, TargetMapping, DurationType } from '@shared/engine_types';

export const AncestralAnger: CardDefinition = {
    "name": "Ancestral Anger",
    "manaCost": "{R}",
    "colors": [
        "R"
    ],
    "types": [
        "Sorcery"
    ],
    "subtypes": [],
    "oracleText": "Target creature gains trample and gets +X/+0 until end of turn, where X is 1 plus the number of cards named Ancestral Anger in your graveyard.\nDraw a card.",
    "abilities": [
        {
            type: AbilityType.Spell,
            targetDefinition: { type: 'Creature' },
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    targetMapping: TargetMapping.Target1,
                    abilitiesToAdd: ['Trample'],
                    powerModifier: 'GRAVEYARD_NAME_COUNT_PLUS_1',
                    duration: DurationType.UntilEndOfTurn
                },
                {
                    type: EffectType.DrawCards,
                    amount: 1,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};


