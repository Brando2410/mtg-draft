import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
    export const Pterafractyl: CardDefinition = {
    name: "Pterafractyl",
    manaCost: "{X}{G}{U}",
    colors: [
        "G",
        "U"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Dinosaur",
        "Fractal"
    ],
    keywords: ["Flying"],
    oracleText: "Flying\nThis creature enters with X +1/+1 counters on it.\nWhen this creature enters, you gain 2 life.",
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.GainLife,
                    amount: 2,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ],
    power: "1",
    toughness: "0",
    entersWithXCounters: true //specificare +1/+1 counters?
};
    