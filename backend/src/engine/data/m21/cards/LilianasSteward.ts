import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const LilianasSteward: CardDefinition = {
    name: "Liliana's Steward",
    manaCost: "{B}",
    scryfall_id: "1945fc78-8aa4-46fb-9571-eaa1c4729e3d",
    image_url: "https://cards.scryfall.io/normal/front/1/9/1945fc78-8aa4-46fb-9571-eaa1c4729e3d.jpg?1594736251",
    oracleText: "{T}, Sacrifice this creature: Target opponent discards a card. Activate only as a sorcery.",
    colors: ["B"],
    types: ["Creature"],
    subtypes: ["Zombie"],
    power: "1",
    toughness: "2",
    abilities: [
        {
            type: AbilityType.Activated,
            activatedOnlyAsSorcery: true,
            costs: [
                { type: CostType.Tap },
                { type: CostType.SacrificeSelf }
            ],
            targetDefinitions: [{ type: TargetType.Opponent, count: 1 }],
            effects: [{ type: EffectType.DiscardCards, amount: 1, targetMapping: TargetMapping.Target1 }]
        }
    ]
};
