import { AbilityType, CardDefinition, ConditionType, DurationType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const BoltHound: CardDefinition = {
    name: "Bolt Hound",
    manaCost: "{2}{R}",
    scryfall_id: "9f8cf3f9-4e3b-4af2-b5ef-a97eb1d2b674",
    image_url: "https://cards.scryfall.io/normal/front/9/f/9f8cf3f9-4e3b-4af2-b5ef-a97eb1d2b674.jpg?1594736483",
    oracleText: "Haste (This creature can attack and {T} as soon as it comes under your control.)\nWhenever this creature attacks, other creatures you control get +1/+0 until end of turn.",
    colors: ["R"],
    types: ["Creature"],
    subtypes: ["Elemental", "Dog"],
    power: "2",
    toughness: "2",
    keywords: ["Haste"],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Attack,
            condition: ConditionType.SelfAttacks,
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                powerModifier: 1,
                toughnessModifier: 0,
                duration: { type: DurationType.UntilEndOfTurn },
                layer: 7,
                targetMapping: TargetMapping.OtherCreaturesYouControl
            }]
        }
    ]
};
