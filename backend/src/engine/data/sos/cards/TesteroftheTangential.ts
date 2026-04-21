import { AbilityType, CardDefinition, CostType, ConditionType, DynamicAmount, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const TesteroftheTangential: CardDefinition = {
    name: "Tester of the Tangential",
    manaCost: "{1}{U}",
    scryfall_id: "71f760e9-b541-477a-b911-45186b520ae1", // placeholder
    colors: ["U"],
    types: ["Creature"],
    subtypes: ["Djinn", "Wizard"],
    power: "1",
    toughness: "1",
    keywords: ["Increment"],
    oracleText: "Increment (Whenever you cast a spell, if the amount of mana you spent is greater than this creature's power or toughness, put a +1/+1 counter on this creature.)\nAt the beginning of combat on your turn, you may pay {X}. When you do, move X +1/+1 counters from this creature onto another target creature.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.BeginningOfCombatStep,
            condition: ConditionType.IsYourTurn,
            effects: [
                {
                    type: EffectType.Choice,
                    label: "Pay {X} to move X +1/+1 counters onto another target creature?",
                    choices: [
                        {
                            label: "Pay {X}",
                            costs: [{ type: CostType.Mana, value: '{X}' }],
                            effects: [
                                {
                                    type: EffectType.MoveCounters,
                                    counterType: '+1/+1',
                                    amount: 'X',
                                    targetDefinition: {
                                        type: TargetType.Creature,
                                        restrictions: [Restriction.Other],
                                        count: 1
                                    },
                                    targetMapping: TargetMapping.Target1
                                }
                            ]
                        },
                        { label: "Decline", effects: [] }
                    ]
                }
            ]
        }
    ]
};
