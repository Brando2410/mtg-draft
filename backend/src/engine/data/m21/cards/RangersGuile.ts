import { AbilityType, CardDefinition, DurationType, EffectType, Restriction, TargetMapping, TargetType } from "@shared/engine_types";

export const RangersGuile: CardDefinition = {
    name: "Ranger's Guile",
    manaCost: "{G}",

    oracleText: "Target creature you control gets +1/+1 and gains hexproof until end of turn. (It can't be the target of spells or abilities your opponents control.)",
    colors: ["G"],
    types: ["Instant"],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                type: TargetType.Creature,
                count: 1,
                restrictions: [Restriction.YouControl]
            }],
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    layer: 7,
                    powerModifier: 1,
                    toughnessModifier: 1,
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.ApplyContinuousEffect,
                    layer: 6,
                    abilitiesToAdd: ['Hexproof'],
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ],
    scryfall_id: "02392840-f0c4-462e-84ce-9a7cdd9f5efb",
    image_url: "https://cards.scryfall.io/normal/front/0/2/02392840-f0c4-462e-84ce-9a7cdd9f5efb.jpg?1594737163",
    rarity: "common"
};

