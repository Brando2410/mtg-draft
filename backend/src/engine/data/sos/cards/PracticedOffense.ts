import { CardDefinition, AbilityType, EffectType, TargetMapping, TargetType, DurationType } from '@shared/engine_types';

export const PracticedOffense: CardDefinition = {
    "name": "Practiced Offense",
    "manaCost": "{2}{W}",
    "colors": [
        "W"
    ],
    "types": [
        "Sorcery"
    ],
    "subtypes": [],
    "keywords": ["Flashback"],
    "flashbackCost": "{1}{W}",
    "oracleText": "Put a +1/+1 counter on each creature target player controls. Target creature gains your choice of double strike or lifelink until end of turn.\nFlashback {1}{W} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
    "abilities": [
        {
            type: AbilityType.Spell,
            targetDefinition: [
                {
                    type: TargetType.Player,
                    count: 1,
                    label: "Target player"
                },
                {
                    type: TargetType.Creature,
                    count: 1,
                    label: "Target creature"
                }
            ],
            effects: [
                {
                    type: EffectType.AddCounters,
                    counterType: 'p1p1',
                    amount: 1,
                    targetMapping: 'ALL_CREATURES_CONTROLLED_BY_TARGET_1'
                },
                {
                    type: EffectType.Choice,
                    label: "Choose a keyword",
                    targetMapping: 'CONTROLLER',
                    choices: [
                        {
                            label: "Double Strike",
                            effects: [
                                {
                                    type: EffectType.ApplyContinuousEffect,
                                    duration: DurationType.UntilEndOfTurn,
                                    abilitiesToAdd: ['double strike'],
                                    targetMapping: TargetMapping.Target2
                                }
                            ]
                        },
                        {
                            label: "Lifelink",
                            effects: [
                                {
                                    type: EffectType.ApplyContinuousEffect,
                                    duration: DurationType.UntilEndOfTurn,
                                    abilitiesToAdd: ['lifelink'],
                                    targetMapping: TargetMapping.Target2
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ],
};


