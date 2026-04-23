import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const SneeringShadewriter: CardDefinition = {
    name: "Sneering Shadewriter",
    manaCost: "{4}{B}",
    colors: ["B"],
    types: ["Creature"],
    subtypes: ["Vampire", "Warlock"],
    keywords: ["Flying"],
    power: "3",
    toughness: "3",
    oracleText: "Flying\nWhen this creature enters, each opponent loses 2 life and you gain 2 life.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.LoseLife,
                    amount: 2,
                    targetMapping: TargetMapping.EachOpponent
                },
                {
                    type: EffectType.GainLife,
                    amount: 2,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};
