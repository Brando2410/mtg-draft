import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const DefiantStrike: CardDefinition = {
    name: "Defiant Strike",
    manaCost: "{W}",

    oracleText: "Target creature gets +1/+0 until end of turn.\nDraw a card.",
    colors: ["W"],
    types: ["Instant"],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{ type: TargetType.Creature, count: 1 }],
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    powerModifier: 1,
                    toughnessModifier: 0,
                    duration: { type: DurationType.UntilEndOfTurn },
                    layer: 7,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.DrawCards,
                    amount: 1,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ],
    scryfall_id: "5c23869b-c99a-49dd-9e29-fcc0eb63fad1",
    image_url: "https://cards.scryfall.io/normal/front/5/c/5c23869b-c99a-49dd-9e29-fcc0eb63fad1.jpg?1594734879",
    rarity: "common"
};

