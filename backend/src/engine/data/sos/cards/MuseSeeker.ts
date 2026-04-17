import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
export const MuseSeeker: CardDefinition = {
    name: "Muse Seeker",
    manaCost: "{1}{U}",
    colors: [
        "U"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Elf",
        "Wizard"
    ],
    keywords: ["Opus"],
    oracleText: "Opus — Whenever you cast an instant or sorcery spell, draw a card. Then discard a card unless five or more mana was spent to cast that spell.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastInstantOrSorcery,
            condition: ConditionType.PlayerIsController,
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
                    condition: 'SPENT_MANA_LT:5',
                }
            ]
        }
    ],
    power: "1",
    toughness: "2"
};
