import { AbilityType, CardDefinition, ConditionType, CostType, DurationType, DynamicAmount, EffectType, Restriction, TargetMapping, TargetType } from '@shared/engine_types';
export const BurrogBarrage: CardDefinition = {
    name: "Burrog Barrage",
    manaCost: "{1}{G}",


    colors: ["G"],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    oracleText: "Target creature you control gets +1/+0 until end of turn if you've cast another instant or sorcery spell this turn. Then it deals damage equal to its power to up to one target creature an opponent controls.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{ type: TargetType.Creature, count: 1, restrictions: [Restriction.YouControl] }],
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    sublayer: 'Stats',
                    powerModifier: 1,
                    duration: { type: DurationType.UntilEndOfTurn },
                    condition: ConditionType.CastInstantSorceryThisTurn,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: CostType.Choice,
                    label: "Deal damage to up to one target creature an opponent controls?",
                    choices: [
                        {
                            label: "Yes",
                            targetDefinitions: [{ type: TargetType.Creature, count: 1, restrictions: [Restriction.OpponentControl] }],
                            effects: [
                                {
                                    type: EffectType.DealDamage,
                                    amount: DynamicAmount.Target1Power,
                                    sourceMapping: TargetMapping.Target1,
                                    targetMapping: TargetMapping.Target2
                                }
                            ]
                        },
                        { label: "No", effects: [] }
                    ]
                }
            ]
        }
    ],
    scryfall_id: "95d5b0a8-2b66-418e-9e5e-ecf7b304c31e",
    image_url: "https://cards.scryfall.io/normal/front/9/5/95d5b0a8-2b66-418e-9e5e-ecf7b304c31e.jpg?1775937957",
    rarity: "common"
};

