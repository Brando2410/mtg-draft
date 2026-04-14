import { CardDefinition, AbilityType, EffectType, TriggerEvent, TargetMapping } from '@shared/engine_types';

export const InklingMascot: CardDefinition = {
    "name": "Inkling Mascot",
    "manaCost": "{W}{B}",
    "colors": [
        "B",
        "W"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Inkling",
        "Cat"
    ],
    "oracleText": "Repartee — Whenever you cast an instant or sorcery spell that targets a creature, this creature gains flying until end of turn. Surveil 1. (Look at the top card of your library. You may put it into your graveyard.)",
    "abilities": [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastSpell,
            triggerCondition: 'REPARTEE_TRIGGER',
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    keywords: ["Flying"],
                    duration: "UNTIL_END_OF_TURN",
                    targetMapping: TargetMapping.Self
                },
                {
                    type: EffectType.Scry,
                    amount: 1,
                    destination: "graveyard",
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ],
    "power": "2",
    "toughness": "2"
};
