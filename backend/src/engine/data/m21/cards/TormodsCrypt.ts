import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const TormodsCrypt: CardDefinition = {
    name: "Tormod's Crypt",
    manaCost: "{0}",
    scryfall_id: "9c224af7-efcc-44fe-8910-c0201948833b",
    image_url: "https://cards.scryfall.io/normal/front/9/c/9c224af7-efcc-44fe-8910-c0201948833b.jpg?1594737582",
    oracleText: "{T}, Sacrifice Tormod's Crypt: Exile all cards from target player's graveyard.",
    colors: [],
    types: ["Artifact"],
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [
                { type: CostType.Tap },
                { type: CostType.SacrificeSelf }
            ],
            targetDefinitions: [{ type: TargetType.Player, count: 1 }],
            effects: [{ type: EffectType.ExileAllCards, targetMapping: TargetMapping.Target1 }]
        }
    ]
};
