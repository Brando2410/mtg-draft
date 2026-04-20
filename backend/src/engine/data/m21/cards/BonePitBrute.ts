import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const BonePitBrute: CardDefinition = {
    name: "Bone Pit Brute",
    manaCost: "{4}{R}{R}",
    scryfall_id: "6075e0a3-a0ab-4a11-8ad2-7dabb071d309",
    image_url: "https://cards.scryfall.io/normal/front/6/0/6075e0a3-a0ab-4a11-8ad2-7dabb071d309.jpg?1594736498",
    oracleText: "Menace (This creature can't be blocked except by two or more creatures.)\nWhen this creature enters, target creature gets +4/+0 until end of turn.",
    colors: ["R"],
    types: ["Creature"],
    subtypes: ["Cyclops"],
    power: "4",
    toughness: "5",
    keywords: ["Menace"],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            targetDefinition: { type: TargetType.Creature, count: 1 },
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                powerModifier: 4,
                toughnessModifier: 0,
                duration: { type: DurationType.UntilEndOfTurn },
                layer: 7,
                targetMapping: TargetMapping.Target1
            }]
        }
    ]
};
