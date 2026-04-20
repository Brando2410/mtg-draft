import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType } from '@shared/engine_types';

export const StandUpforYourself: CardDefinition = {
    name: "Stand Up for Yourself",
    manaCost: "{2}{W}",
    colors: ["W"],
    types: ["Instant"],
    oracleText: "Destroy target creature with power 3 or greater.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Creature,
                restrictions: [Restriction.Power3OrGreater]
            },
            effects: [
                {
                    type: EffectType.Destroy,
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};
