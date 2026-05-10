import { AbilityType, CardDefinition, DurationType, EffectType, Restriction, TargetMapping, TargetType } from '@shared/engine_types';

export const ClaimTheFirstborn: CardDefinition = {
    name: "Claim the Firstborn",
    manaCost: "{R}",
    oracleText: "Gain control of target creature with mana value 3 or less until end of turn. Untap that creature. It gains haste until end of turn.",
    colors: ["R"],
    types: ["Sorcery"],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                type: TargetType.Creature,
                count: 1,
                restrictions: [Restriction.ManaValue3OrLess]
            }],
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    layer: 2,
                    targetControllerMapping: TargetMapping.Controller,
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.Untap,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.ApplyContinuousEffect,
                    abilitiesToAdd: ["Haste"],
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ],
    scryfall_id: "feaf1e6c-c7d9-4ac7-9aeb-c4b5d61548ec",
    image_url: "https://cards.scryfall.io/normal/front/f/e/feaf1e6c-c7d9-4ac7-9aeb-c4b5d61548ec.jpg?1572490317",
    rarity: "uncommon"
};

