import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const DoubleMajor: CardDefinition = {
    name: "Double Major",
    manaCost: "{G}{U}",
    colors: ['G', 'U'],
    types: ["Instant"],
    oracleText: "Copy target creature spell you control, except the copy isn't legendary if the spell is legendary.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Creature,
                count: 1,
                restrictions: ['youcontrol']
            },
            effects: [{
                type: EffectType.CopySpellOnStack,
                targetMapping: TargetMapping.Target1,
                isLegendary: false
            }]
        }
    ]
};
