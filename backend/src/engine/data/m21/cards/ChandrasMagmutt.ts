import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const ChandrasMagmutt: CardDefinition = {
    name: "Chandra's Magmutt",
    manaCost: "{1}{R}",
    scryfall_id: "91d3e366-4da5-42c8-bbd5-a0c178c0da28",
    image_url: "https://cards.scryfall.io/normal/front/9/1/91d3e366-4da5-42c8-bbd5-a0c178c0da28.jpg?1594736548",
    oracleText: "{T}: This creature deals 1 damage to target player or planeswalker.",
    colors: ["R"],
    types: ["Creature"],
    subtypes: ["Elemental", "Dog"],
    power: "2",
    toughness: "2",
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Tap }],
            targetDefinition: {
                type: TargetType.PlayerOrPlaneswalker,
                count: 1
            },
            effects: [{
                type: EffectType.DealDamage,
                amount: 1,
                targetMapping: TargetMapping.Target1
            }]
        }
    ]
};
