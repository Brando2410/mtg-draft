import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping } from '@shared/engine_types';

export const PickYourPoison: CardDefinition = {
    name: "Pick Your Poison",
    manaCost: "{G}",
    colors: ["G"],
    types: ["Sorcery"],
    subtypes: [],
    keywords: [],
    oracleText: "Choose one —\n• Each opponent sacrifices an artifact of their choice.\n• Each opponent sacrifices an enchantment of their choice.\n• Each opponent sacrifices a creature with flying of their choice.",
    set: "soa",
    abilities: [
        {
            type: AbilityType.Spell,
            isModal: true,
            modes: [
                {
                    label: "Each opponent sacrifices an artifact",
                    effects: [
                        {
                            type: EffectType.Sacrifice,
                            targetMapping: TargetMapping.EachOpponent,
                            amount: 1,
                            restrictions: [Restriction.Artifact]
                        }
                    ]
                },
                {
                    label: "Each opponent sacrifices an enchantment",
                    effects: [
                        {
                            type: EffectType.Sacrifice,
                            targetMapping: TargetMapping.EachOpponent,
                            amount: 1,
                            restrictions: [Restriction.Enchantment]
                        }
                    ]
                },
                {
                    label: "Each opponent sacrifices a creature with flying",
                    effects: [
                        {
                            type: EffectType.Sacrifice,
                            targetMapping: TargetMapping.EachOpponent,
                            amount: 1,
                            restrictions: [Restriction.Creature, Restriction.Flying]
                        }
                    ]
                }
            ]
        }
    ],
    scryfall_id: "a11f1013-d747-4cf2-bbf5-0bd68a949ddf",
    image_url: "https://cards.scryfall.io/normal/front/a/1/a11f1013-d747-4cf2-bbf5-0bd68a949ddf.jpg?1775936770",
    rarity: "uncommon"
};

