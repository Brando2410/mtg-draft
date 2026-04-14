import { CardDefinition, AbilityType, EffectType, TriggerEvent, TargetMapping } from '@shared/engine_types';

export const InkshapeDemonstrator: CardDefinition = {
    "name": "Inkshape Demonstrator",
    "manaCost": "{3}{W}",
    "colors": [
        "W"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Elephant",
        "Cleric"
    ],
    "oracleText": "Ward {2} (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {2}.)\nRepartee — Whenever you cast an instant or sorcery spell that targets a creature, this creature gets +1/+0 and gains lifelink until end of turn.",
    "keywords": ["Ward {2}"],
    "abilities": [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.CastSpell,
            condition: 'REPARTEE_TRIGGER',
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    powerModifier: 1,
                    abilitiesToAdd: ["Lifelink"],
                    duration: "UNTIL_END_OF_TURN",
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ],
    "power": "3",
    "toughness": "4"
};




