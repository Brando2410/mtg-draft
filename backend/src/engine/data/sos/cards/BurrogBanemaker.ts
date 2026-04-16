import { AbilityType, CardDefinition, CostType, DurationType, EffectType, TargetType } from '@shared/engine_types';
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
    keywords: ["Deathtouch"],
    oracleText: "Deathtouch\n{1}{B}: This creature gets +1/+1 until end of turn.",
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Mana, value: '{1}{B}' }],
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    sublayer: 'Stats',
                    powerModifier: 1,
                    toughnessModifier: 1,
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetType.Self
                }
            ]
        }
    ],
    power: "1",
    toughness: "1"
};
    