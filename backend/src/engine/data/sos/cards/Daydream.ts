import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
export const Daydream: CardDefinition = {
    name: "Daydream",
    manaCost: "{W}",
    scryfall_id: "e2b16cb2-b8b2-45df-9695-3c16e9d89e28",
    rarity: "uncommon",
    image_url: "https://cards.scryfall.io/normal/front/e/2/e2b16cb2-b8b2-45df-9695-3c16e9d89e28.jpg?1775936973",
    colors: [
        "W"
    ],
    types: [
        "Sorcery"
    ],
    subtypes: [],
    keywords: ["Flashback"],
    oracleText: "Exile target creature you control, then return that card to the battlefield under its owner's control with a +1/+1 counter on it.\nFlashback {2}{W} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
    flashbackCost: "{2}{W}",
    abilities: [
        {
            type: AbilityType.Spell,
            flashbackCost: "{2}{W}",
            targetDefinition: {
                type: TargetType.Creature, count: 1, restrictions: [
                    "youcontrol"
                ]
            },
            effects: [
                {
                    type: CostType.Exile,
                    targetMapping: TargetMapping.Target1,
                    next: {
                        type: EffectType.PutOnBattlefield,
                        targetMapping: TargetMapping.Target1,
                        startingCounters: { counterType: 'p1p1', amount: 1 }
                    }
                }
            ]
        }
    ]
};
