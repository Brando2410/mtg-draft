import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent } from "@shared/engine_types";

export const Pridemalkin: CardDefinition = {
    name: "Pridemalkin",
    manaCost: "{2}{G}",
    scryfall_id: "df520254-0c72-496b-9222-263ca9d3c5d5",
    image_url: "https://cards.scryfall.io/normal/front/d/f/df520254-0c72-496b-9222-263ca9d3c5d5.jpg?1594737133",
    oracleText: "When this creature enters, put a +1/+1 counter on target creature you control. Each creature you control with a +1/+1 counter on it has trample.",
    colors: ["G"],
    types: ["Creature"],
    subtypes: ["Cat"],
    power: "2",
    toughness: "1",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            targetDefinitions: [{
                type: TargetType.Creature,
                count: 1,
                restrictions: [Restriction.YouControl]
            }],
            effects: [{
                type: EffectType.AddCounters,
                counterType: '+1/+1',
                amount: 1,
                targetMapping: TargetMapping.Target1
            }]
        },
        {
            type: AbilityType.Static,
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                layer: 6,
                abilitiesToAdd: ['Trample'],
                targetMapping: TargetMapping.AllMatchingPermanentsYouControl,
                restrictions: [Restriction.Creature, Restriction.HasP1P1Counter]
            }]
        }
    ]
};
