import { TargetMapping, AbilityType, CardDefinition, ConditionType, DurationType, EffectType, TargetType, TriggerEvent } from '@shared/engine_types';
    export const ElementalMascot: CardDefinition = {
    name: "Elemental Mascot",
    manaCost: "{1}{U}{R}",
    colors: [
        "R",
        "U"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Elemental",
        "Bird"
    ],
    keywords: [
        "Flying",
        "Vigilance"
    ],
    oracleText: "Flying, vigilance\nOpus — Whenever you cast an instant or sorcery spell, this creature gets +1/+0 until end of turn. If five or more mana was spent to cast that spell, exile the top card of your library. You may play that card until the end of your next turn.",
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.CastInstantOrSorcery,
            condition: ConditionType.PlayerIsController,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    sublayer: 'Stats',
                    powerModifier: 1,
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetMapping.Self
                },
                {
                    type: EffectType.ExileTopCard,
                    condition: 'SPENT_MANA_GE:5',
                    canPlayExiled: true,
                    duration: { type: DurationType.UntilEndOfYourNextTurn }
                }
            ]
        }
    ],
    power: "1",
    toughness: "4"
};
    

