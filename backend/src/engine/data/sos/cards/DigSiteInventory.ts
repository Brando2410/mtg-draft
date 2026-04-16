import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping } from '@shared/engine_types';
    export const DigSiteInventory: CardDefinition = {
    name: "Dig Site Inventory",
    manaCost: "{W}",
    colors: [
        "W"
    ],
    types: [
        "Sorcery"
    ],
    subtypes: [],
    keywords: [
        "Flashback"
    ],
    oracleText: "Put a +1/+1 counter on target creature you control. It gains vigilance until end of turn.\nFlashback {W} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
    flashbackCost: "{W}",
    abilities: [
        {
            type: AbilityType.Spell,
            flashbackCost: "{W}",
            targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature', 'YouControl'] },
            effects: [
                {
                    type: EffectType.AddCounters,
                    amount: 1,
                    startingCounters: { type: 'p1p1', amount: 1 },
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.ApplyContinuousEffect,
                    duration: { type: DurationType.UntilEndOfTurn },
                    abilitiesToAdd: ['Vigilance'],
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};
    