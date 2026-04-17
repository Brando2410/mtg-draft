import { TargetMapping, AbilityType, CardDefinition, ConditionType, DurationType, EffectType, TargetType, TriggerEvent } from '@shared/engine_types';
    export const ColorstormStallion: CardDefinition = {
    name: "Colorstorm Stallion",
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
        "Horse"
    ],
    keywords: ["Ward {1}", "Haste"],
    oracleText: "Ward {1}, haste\nOpus — Whenever you cast an instant or sorcery spell, this creature gets +1/+1 until end of turn. If five or more mana was spent to cast that spell, create a token that's a copy of this creature.",
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
                    toughnessModifier: 1,
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetMapping.Self
                },
                {
                    type: EffectType.CreateTokenCopy,
                    condition: 'SPENT_MANA_GE:5',
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ],
    power: "3",
    toughness: "3"
};
    

