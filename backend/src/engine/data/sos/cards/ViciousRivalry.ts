import { AbilityType, CardDefinition, EffectType, TargetMapping } from '@shared/engine_types';

export const ViciousRivalry: CardDefinition = {
    "name": "Vicious Rivalry",
    "manaCost": "{2}{B}{G}",
    "colors": [
        "B",
        "G"
    ],
    "types": [
        "Sorcery"
    ],
    "subtypes": [],
    "oracleText": "As an additional cost to cast this spell, pay X life.\nDestroy all artifacts and creatures with mana value X or less.",
    "abilities": [
        {
            type: AbilityType.Spell,
            additionalCosts: [
                { type: 'PayLife', value: 'X' } as any
            ],
            effects: [
                {
                    type: EffectType.Destroy,
                    selectionType: 'All' as any,
                    restrictions: [
                        { type: 'ManaValueLessOrEqual', amount: 'X' },
                        { type: 'Type', value: 'Artifact' },
                        { type: 'Type', value: 'Creature', isOr: true }
                    ],
                    targetMapping: 'MATCHING_PERMANENTS'
                }
            ]
        }
    ]
};



