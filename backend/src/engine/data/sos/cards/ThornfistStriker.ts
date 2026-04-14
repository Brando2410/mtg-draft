import { AbilityType, CardDefinition, EffectType, TargetMapping, ConditionType } from '@shared/engine_types';

export const ThornfistStriker: CardDefinition = {
    "name": "Thornfist Striker",
    "manaCost": "{2}{G}",
    "colors": [
        "G"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Elf",
        "Druid"
    ],
    "oracleText": "Ward {1} (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {1}.)\nInfusion — Creatures you control get +1/+0 and have trample as long as you gained life this turn.",
    "keywords": [
        "Ward {1}"
    ],
    "abilities": [
        {
            type: AbilityType.Static,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    layer: 7,
                    powerModifier: 1,
                    toughnessModifier: 0,
                    abilitiesToAdd: [
                        "Trample"
                    ],
                    condition: ConditionType.GainedLifeThisTurn,
                    targetMapping: TargetMapping.AllCreaturesYouControl
                }
            ]
        }
    ],
    "power": "3",
    "toughness": "3"
};


