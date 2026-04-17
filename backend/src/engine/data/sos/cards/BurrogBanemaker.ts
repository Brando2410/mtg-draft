import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, CostType } from '@shared/engine_types';

export const BurrogBanemaker: CardDefinition = {
    name: "Burrog Banemaker",
    manaCost: "{B}",
    colors: [
        "B"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Frog",
        "Warlock"
    ],
    power: "1",
    toughness: "1",
    keywords: ["Deathtouch"],
    oracleText: "Deathtouch\n{1}{B}: This creature gets +1/+1 until end of turn.",
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Mana, value: '{1}{B}' }],
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    sublayer: '7',
                    powerModifier: 1,
                    toughnessModifier: 1,
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ],
};



