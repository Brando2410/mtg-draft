import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const Eliminate: CardDefinition = {
    name: "Eliminate",
    manaCost: "{1}{B}",
    oracleText: "Destroy target creature or planeswalker with mana value 3 or less.",
    colors: ["B"],
    types: ["Instant"],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.CreatureOrPlaneswalker,
                count: 1,
                restrictions: [
                    { type: 'Attribute', attribute: 'ManaValue', value: 3, comparison: 'LE' }
                ]
            },
            effects: [{ type: EffectType.Destroy, targetMapping: TargetMapping.Target1 }]
        }
    ]
};


