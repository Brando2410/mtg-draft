import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const FeatofResistance: CardDefinition = {
    name: "Feat of Resistance",
    manaCost: "{1}{W}",
    scryfall_id: "73148b3b-73d3-4f57-8b67-1e91fbe112b9",
    image_url: "https://cards.scryfall.io/normal/front/7/3/73148b3b-73d3-4f57-8b67-1e91fbe112b9.jpg?1595640319",
    oracleText: "Put a +1/+1 counter on target creature you control. It gains protection from the color of your choice until end of turn. (It can't be blocked, targeted, dealt damage, enchanted, or equipped by anything of that color.)",
    colors: ["W"],
    supertypes: [],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Creature, count: 1, restrictions: [
                    { type: 'Control', value: 'YouControl' }
                ]
            },
            effects: [
                { type: EffectType.AddCounters, amount: 1, counterType: 'p1p1', targetMapping: TargetMapping.Target1 },
                {
                    type: 'Choice', label: 'Choose a color', targetMapping: TargetMapping.Target1, choices: [
                        { label: 'White', effects: [{ type: EffectType.ApplyContinuousEffect, duration: { type: DurationType.UntilEndOfTurn }, abilitiesToAdd: ['Protection from White'], layer: 6, targetMapping: TargetMapping.Target1 }] },
                        { label: 'Blue', effects: [{ type: EffectType.ApplyContinuousEffect, duration: { type: DurationType.UntilEndOfTurn }, abilitiesToAdd: ['Protection from Blue'], layer: 6, targetMapping: TargetMapping.Target1 }] },
                        { label: 'Black', effects: [{ type: EffectType.ApplyContinuousEffect, duration: { type: DurationType.UntilEndOfTurn }, abilitiesToAdd: ['Protection from Black'], layer: 6, targetMapping: TargetMapping.Target1 }] },
                        { label: 'Red', effects: [{ type: EffectType.ApplyContinuousEffect, duration: { type: DurationType.UntilEndOfTurn }, abilitiesToAdd: ['Protection from Red'], layer: 6, targetMapping: TargetMapping.Target1 }] },
                        { label: 'Green', effects: [{ type: EffectType.ApplyContinuousEffect, duration: { type: DurationType.UntilEndOfTurn }, abilitiesToAdd: ['Protection from Green'], layer: 6, targetMapping: TargetMapping.Target1 }] }
                    ]
                }
            ]
        }
    ]
};


