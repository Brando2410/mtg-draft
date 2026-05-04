import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const Counterspell: CardDefinition = {
    name: "Counterspell",
    manaCost: "{U}{U}",
    oracleText: "Counter target spell.",
    colors: ["U"],
    types: ["Instant"],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                type: TargetType.Spell,
                count: 1
            }],
            effects: [
                {
                    type: EffectType.CounterSpell,
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};
