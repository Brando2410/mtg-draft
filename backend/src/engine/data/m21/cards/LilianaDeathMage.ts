import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const LilianaDeathMage: CardDefinition = {
    name: "Liliana, Death Mage",
    manaCost: "{4}{B}{B}",
    oracleText: "+1: Return up to one target creature card from your graveyard to your hand.\n −3: Destroy target creature. Its controller loses 2 life.\n −7: Target opponent loses 2 life for each creature card in their graveyard.",
    colors: ["B"],
    supertypes: ["Legendary"],
    types: ["Planeswalker"],
    subtypes: ["Liliana"],
    loyalty: "4",
    abilities: [
        {
            type: AbilityType.Activated,
            activeZone: Zone.Battlefield,
            costs: [{ type: CostType.Loyalty, value: '1' }],

            targetDefinition: {
                type: TargetType.CardInGraveyard,
                count: 1,
                optional: true,
                restrictions: ['Creature', 'YouControl']
            },
            effects: [{
                type: EffectType.ReturnToHand,
                targetMapping: TargetMapping.Target1
            }]
        },
        {
            type: AbilityType.Activated,
            activeZone: Zone.Battlefield,
            costs: [{ type: CostType.Loyalty, value: '-3' }],

            targetDefinition: {
                type: TargetType.Creature,
                count: 1,
            },
            effects: [
                {
                    type: EffectType.Destroy,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.LoseLife,
                    amount: 2,
                    targetMapping: TargetMapping.Target1Controller
                }
            ]
        },
        {
            type: AbilityType.Activated,
            activeZone: Zone.Battlefield,
            costs: [{ type: CostType.Loyalty, value: '-7' }],

            targetDefinition: {
                type: TargetType.Opponent,
                count: 1,
            },
            effects: [{
                type: EffectType.LoseLife,
                amount: 'TARGET_1_GRAVEYARD_CREATURE_COUNT_X2',

                targetMapping: TargetMapping.Target1
            }]
        }
    ]
};



