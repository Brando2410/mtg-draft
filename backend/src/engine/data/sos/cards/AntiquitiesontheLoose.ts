import { CardDefinition, AbilityType, EffectType, TargetMapping } from '@shared/engine_types';

export const AntiquitiesontheLoose: CardDefinition = {
    "name": "Antiquities on the Loose",
    "manaCost": "{1}{W}{W}",
    "colors": [
        "W"
    ],
    "types": [
        "Sorcery"
    ],
    "subtypes": [],
    "keywords": ["Flashback"],
    "flashbackCost": "{4}{W}{W}",
    "oracleText": "Create two 2/2 red and white Spirit creature tokens. Then if this spell was cast from anywhere other than your hand, put a +1/+1 counter on each Spirit you control.\nFlashback {4}{W}{W} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
    "abilities": [
        {
            type: AbilityType.Spell,
            flashbackCost: '{4}{W}{W}',
            effects: [
                {
                    type: EffectType.CreateToken,
                    blueprint: {
                        name: 'Spirit',
                        types: ['Creature'],
                        subtypes: ['Spirit'],
                        colors: ['W', 'R'],
                        power: '2',
                        toughness: '2'
                    },
                    amount: 2
                },
                {
                    type: 'ConditionalEffect',
                    condition: 'NOT_CAST_FROM_HAND',
                    effects: [
                        {
                            type: EffectType.AddCounters,
                            amount: 1,
                            value: 'p1p1',
                            targetMapping: 'ALL_MATCHING_PERMANENTS_YOU_CONTROL',
                            restrictions: [{ type: 'Subtype', value: 'Spirit' }]
                        }
                    ]
                }
            ]
        }
    ]
};


