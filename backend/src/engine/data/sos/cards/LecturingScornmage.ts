import { AbilityType, CardDefinition, EffectType, TargetType, TriggerEvent } from '@shared/engine_types';
    export const LecturingScornmage: CardDefinition = {
    name: "Lecturing Scornmage",
    manaCost: "{B}",
    colors: [
        "B"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Human",
        "Warlock"
    ],
    keywords: ["Repartee"],
    oracleText: "Repartee — Whenever you cast an instant or sorcery spell that targets a creature, put a +1/+1 counter on this creature.",
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.CastSpell,
            condition: 'REPARTEE_TRIGGER',
            effects: [
                {
                    type: EffectType.AddCounters,
                    counterType: '+1/+1',
                    amount: 1,
                    targetMapping: TargetType.Self
                }
            ]
        }
    ],
    power: "1",
    toughness: "1"
};
    