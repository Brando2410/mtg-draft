import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const BitterTriumph: CardDefinition = {
    name: "Bitter Triumph",
    manaCost: "{1}{B}",
    colors: ["B"],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    oracleText: "As an additional cost to cast this spell, discard a card or pay 3 life.\nDestroy target creature or planeswalker.",
    set: "soa",
    abilities: [
        {
            type: AbilityType.Spell,
            minChoices: 1,
            maxChoices: 1,
            modes: [
                {
                    label: "Discard a card",
                    costs: [{ type: CostType.Discard, amount: 1 }],
                    targetDefinitions: [{ count: 1, type: TargetType.CreatureOrPlaneswalker }],
                    effects: [{ type: EffectType.Destroy, targetMapping: TargetMapping.Target1 }]
                },
                {
                    label: "Pay 3 life",
                    costs: [{ type: CostType.PayLife, value: "3" }],
                    targetDefinitions: [{ count: 1, type: TargetType.CreatureOrPlaneswalker }],
                    effects: [{ type: EffectType.Destroy, targetMapping: TargetMapping.Target1 }]
                }
            ]
        }
    ],
    scryfall_id: "db465858-0593-4850-8f1d-400fe230a18d",
    image_url: "https://cards.scryfall.io/normal/front/d/b/db465858-0593-4850-8f1d-400fe230a18d.jpg?1775936553",
    rarity: "uncommon"
};

