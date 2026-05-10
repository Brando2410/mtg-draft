import { AbilityType, CardDefinition, CostType, DurationType, EffectType, Restriction, TargetMapping, TargetType } from '@shared/engine_types';

export const PrimalMight: CardDefinition = {
    name: "Primal Might",
    manaCost: "{X}{G}",

    oracleText: "Target creature you control gets +X/+X until end of turn. Then it fights up to one target creature you don't control. (Each deals damage equal to its power to the other.)",
    colors: ["G"],
    types: ["Sorcery"],
    abilities: [
        {
            type: AbilityType.Spell,
            costs: [{ type: CostType.Mana, value: '{X}{G}' }],
            targetDefinitions: [{
                type: TargetType.Permanent,
                count: 2,
                perTargetRestrictions: [
                    [Restriction.Creature, Restriction.YouControl],
                    [Restriction.Creature, Restriction.OpponentControl]
                ]
            }],
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    duration: { type: DurationType.UntilEndOfTurn },
                    powerModifier: 'X',
                    toughnessModifier: 'X',
                    layer: 7,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.Fight,
                    targetMapping: TargetMapping.Target1,
                    target2Mapping: TargetMapping.Target2
                }
            ]
        }
    ],
    scryfall_id: "69b3f7b9-9499-4883-b5c5-c5474e470b21",
    image_url: "https://cards.scryfall.io/normal/front/6/9/69b3f7b9-9499-4883-b5c5-c5474e470b21.jpg?1775600391",
    rarity: "rare"
};

