import { AbilityType, CardDefinition, DurationType, EffectType, Restriction, TargetMapping, TargetType } from '@shared/engine_types';

export const FeatofResistance: CardDefinition = {
    name: "Feat of Resistance",
    manaCost: "{1}{W}",

    oracleText: "Put a +1/+1 counter on target creature you control. It gains protection from the color of your choice until end of turn. (It can't be blocked, targeted, dealt damage, enchanted, or equipped by anything of that color.)",
    colors: ["W"],
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
                { type: EffectType.AddCounters, amount: 1, counterType: 'p1p1', targetMapping: TargetMapping.Target1 },
                {
                    type: EffectType.Choice,
                    label: 'Choose a color',
                    choices: [
                        { label: 'White', effects: [{ type: EffectType.ApplyContinuousEffect, duration: { type: DurationType.UntilEndOfTurn }, abilitiesToAdd: ['Protection from White'], layer: 6, targetMapping: TargetMapping.Target1 }] },
                        { label: 'Blue', effects: [{ type: EffectType.ApplyContinuousEffect, duration: { type: DurationType.UntilEndOfTurn }, abilitiesToAdd: ['Protection from Blue'], layer: 6, targetMapping: TargetMapping.Target1 }] },
                        { label: 'Black', effects: [{ type: EffectType.ApplyContinuousEffect, duration: { type: DurationType.UntilEndOfTurn }, abilitiesToAdd: ['Protection from Black'], layer: 6, targetMapping: TargetMapping.Target1 }] },
                        { label: 'Red', effects: [{ type: EffectType.ApplyContinuousEffect, duration: { type: DurationType.UntilEndOfTurn }, abilitiesToAdd: ['Protection from Red'], layer: 6, targetMapping: TargetMapping.Target1 }] },
                        { label: 'Green', effects: [{ type: EffectType.ApplyContinuousEffect, duration: { type: DurationType.UntilEndOfTurn }, abilitiesToAdd: ['Protection from Green'], layer: 6, targetMapping: TargetMapping.Target1 }] }
                    ]
                }
            ]
        }
    ],
    scryfall_id: "73148b3b-73d3-4f57-8b67-1e91fbe112b9",
    image_url: "https://cards.scryfall.io/normal/front/7/3/73148b3b-73d3-4f57-8b67-1e91fbe112b9.jpg?1594640319",
    rarity: "common"
};

