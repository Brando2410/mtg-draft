import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const TormodsCrypt: CardDefinition = {
    name: "Tormod's Crypt",
    manaCost: "{0}",

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
    ],
    scryfall_id: "752bf493-5839-47e8-95f2-6d8201907428",
    image_url: "https://cards.scryfall.io/normal/front/7/5/752bf493-5839-47e8-95f2-6d8201907428.jpg?1675201100",
    rarity: "uncommon"
};

