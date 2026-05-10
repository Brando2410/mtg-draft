import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const DaybreakCharger: CardDefinition = {
    name: "Daybreak Charger",
    manaCost: "{1}{W}",

    oracleText: "When this creature enters, target creature gets +2/+0 until end of turn.",
    colors: ["W"],
    types: ["Creature"],
    subtypes: ["Unicorn"],
    power: "3",
    toughness: "1",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            targetDefinitions: [{ type: TargetType.Creature, count: 1 }],
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                duration: { type: DurationType.UntilEndOfTurn },
                powerModifier: 2,
                toughnessModifier: 0,
                layer: 7,
                targetMapping: TargetMapping.Target1
            }]
        }
    ],
    scryfall_id: "ff87a671-054f-4357-8a62-450d36559a1b",
    image_url: "https://cards.scryfall.io/normal/front/f/f/ff87a671-054f-4357-8a62-450d36559a1b.jpg?1594734866",
    rarity: "common"
};

