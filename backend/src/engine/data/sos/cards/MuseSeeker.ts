import { CardDefinition, AbilityType, TriggerEvent, EffectType, TargetMapping } from '@shared/engine_types';

export const MuseSeeker: CardDefinition = {
    "name": "Muse Seeker",
    "manaCost": "{1}{U}",
    "colors": [
        "U"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Elf",
        "Wizard"
    ],
    "oracleText": "Opus — Whenever you cast an instant or sorcery spell, draw a card. Then discard a card unless five or more mana was spent to cast that spell.",
    "keywords": ["Opus"],
    "abilities": [
        {
            type: AbilityType.Triggered,
            name: "Opus",
                    eventMatch: TriggerEvent.CastSpell,
            condition: 'ON_CAST_INSTANT_SORCERY',
            effects: [
                {
                    type: EffectType.DrawCards,
                    amount: 1,
                    targetMapping: TargetMapping.Controller
                },
                {
                    type: EffectType.DiscardCards,
                    amount: 1,
                    targetMapping: TargetMapping.Controller,
                    condition: {
                        type: 'NOT',
                        inner: {
                            type: 'SPENT_MANA_GE',
                            param: '5'
                        }
                    }
                }
            ]
        }
    ],
    "power": "1",
    "toughness": "2"
};





