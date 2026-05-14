import { AbilityType, CardDefinition, ConditionType, CostType, CounterType, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const TesteroftheTangential: CardDefinition = {
    name: "Tester of the Tangential",
    manaCost: "{1}{U}",
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
                    optional: true,
                    choices: [
                        {
                            label: "Pay {X} to move X +1/+1 counters from this creature onto another target creature",
                            costs: [{ type: CostType.Mana, value: '{X}' }],
                            effects: [
                                {
                                    type: EffectType.MoveCounters,
                                    counterType: CounterType.P1P1,
                                    amount: 'X',
                                    targetDefinitions: [{
                                        type: TargetType.Creature,
                                        restrictions: [Restriction.Other],
                                        count: 1
                                    }],
                                    targetMapping: TargetMapping.Target1
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ],
    scryfall_id: "bbd708ec-eef4-4f45-99dd-60e1cec4b991",
    image_url: "https://cards.scryfall.io/normal/front/b/b/bbd708ec-eef4-4f45-99dd-60e1cec4b991.jpg?1775937389",
    rarity: "uncommon"
};

