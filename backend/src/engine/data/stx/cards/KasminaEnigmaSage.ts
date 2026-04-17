import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, Zone, CostType } from '@shared/engine_types';

export const KasminaEnigmaSage: CardDefinition = {
    name: "Kasmina, Enigma Sage",
    manaCost: "{1}{G}{U}",
    colors: ["G", "U"],
    supertypes: ["Legendary"],
    types: ["Planeswalker"],
    subtypes: ["Kasmina"],
    loyalty: "2",
    oracleText: "Each other planeswalker you control has the loyalty abilities of Kasmina, Enigma Sage. +2: Scry 1. -X: Create a 0/0 green and blue Fractal creature token. Put X +1/+1 counters on it. -8: Search your library for an instant or sorcery card that shares a color with this planeswalker, exile that card, then shuffle. You may cast that card without paying its mana cost.",
    abilities: [
        {
            type: AbilityType.Static,
            effects: [{
                type: EffectType.AddActivatedAbility,
                targetMapping: TargetMapping.OtherPlaneswalkersYouControl,
                abilitiesToAdd: [
                    {
                        id: 'kasmina_granted_1',
                        type: AbilityType.Activated,
                        costs: [{ type: CostType.Loyalty, value: '+2' }],
                        effects: [{ type: EffectType.Scry, amount: 1 }]
                    },
                    {
                        id: 'kasmina_granted_2',
                        type: AbilityType.Activated,
                        costs: [{ type: CostType.Loyalty, value: '-X' }],
                        effects: [{ type: EffectType.CreateToken, tokenBlueprint: { name: 'Fractal', power: "0", toughness: "0", colors: ['G', 'U'], types: ['Creature'], subtypes: ['Fractal'] }, startingCounters: { type: 'P1P1', amount: DynamicAmount.X } }]
                    },
                    {
                        id: 'kasmina_granted_3',
                        type: AbilityType.Activated,
                        costs: [{ type: CostType.Loyalty, value: '-8' }],
                        effects: [{ type: EffectType.SearchLibrary, zone: Zone.Stack, isFreeCast: true, restrictions: ['instant_or_sorcery', 'shares_color_with_source'] }]
                    }
                ]
            }]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Loyalty, value: '+2' }],
            effects: [{ type: EffectType.Scry, amount: 1 }]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Loyalty, value: '-X' }],
            effects: [{
                type: EffectType.CreateToken,
                tokenBlueprint: { name: 'Fractal', power: "0", toughness: "0", colors: ['G', 'U'], types: ['Creature'], subtypes: ['Fractal'] },
                startingCounters: { type: 'P1P1', amount: DynamicAmount.X }
            }]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Loyalty, value: '-8' }],
            effects: [{
                type: EffectType.SearchLibrary,
                zone: Zone.Stack,
                isFreeCast: true,
                restrictions: ['instant_or_sorcery', 'shares_color_with_source']
            }]
        }
    ]
};

