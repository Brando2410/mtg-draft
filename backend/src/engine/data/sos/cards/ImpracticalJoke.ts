import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping } from '@shared/engine_types';
    export const ImpracticalJoke: CardDefinition = {
    name: "Impractical Joke",
    manaCost: "{R}",
    colors: [
        "R"
    ],
    types: [
        "Sorcery"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Damage can't be prevented this turn. Impractical Joke deals 3 damage to up to one target creature or planeswalker.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: DurationType.Permanent,
                count: 1,
                optional: true,
                restrictions: [
                { type: 'Type', value: 'Creature' },
                { type: 'Type', value: 'Planeswalker' }
            ]
            },
            effects: [
                {
                    type: EffectType.DisableDamagePrevention
                },
                {
                    type: EffectType.DealDamage,
                    amount: 3,
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};
    