import { TargetMapping, AbilityType, CardDefinition, ConditionType, EffectType, TargetType, TriggerEvent } from '@shared/engine_types';
export const MoltenCoreMaestro: CardDefinition = {
    name: "Molten-Core Maestro",
    manaCost: "{1}{R}",
    colors: [
        "R"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Goblin",
        "Bard"
    ],
    keywords: ["Menace"],
    oracleText: "Menace\nOpus — Whenever you cast an instant or sorcery spell, put a +1/+1 counter on this creature. If five or more mana was spent to cast that spell, add an amount of {R} equal to this creature's power.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastInstantOrSorcery,
            condition: ConditionType.PlayerIsController,
            effects: [
                {
                    type: EffectType.AddCounters,
                    amount: 1,
                    counterType: '+1/+1',
                    targetMapping: TargetMapping.Self
                },
                {
                    type: EffectType.AddMana,
                    condition: 'SPENT_MANA_GE:5',
                    manaType: 'R',
                    amount: 'POWER'
                }
            ]
        }
    ],
    power: "2",
    toughness: "2"
};

