import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent } from "@shared/engine_types";

export const Pridemalkin: CardDefinition = {
    name: "Pridemalkin",
    manaCost: "{2}{G}",

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
    ],
    scryfall_id: "c56cf35b-ca17-4691-9a1d-3a1a8f569c27",
    image_url: "https://cards.scryfall.io/normal/front/c/5/c56cf35b-ca17-4691-9a1d-3a1a8f569c27.jpg?1682209587",
    rarity: "common"
};

