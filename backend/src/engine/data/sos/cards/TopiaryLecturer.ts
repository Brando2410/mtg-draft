import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent, DynamicAmount, ConditionType } from '@shared/engine_types';

export const TopiaryLecturer: CardDefinition = {
    "name": "Topiary Lecturer",
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
    "keywords": ["Increment"],
    "oracleText": "Increment (Whenever you cast a spell, if the amount of mana you spent is greater than this creature's power or toughness, put a +1/+1 counter on this creature.)\n{T}: Add an amount of {G} equal to this creature's power.",
    "abilities": [
        {
            type: AbilityType.Activated,
            costs: [
                {
                    type: 'Tap'
                }
            ],
            isManaAbility: true,
            effects: [
                {
                    type: EffectType.AddMana,
                    manaType: 'G',
                    amount: DynamicAmount.SourcePower
                }
            ]
        }
    ],
    "power": "1",
    "toughness": "2"
};


