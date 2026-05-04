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
                    type: EffectType.GainControl,
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
    ]
};
