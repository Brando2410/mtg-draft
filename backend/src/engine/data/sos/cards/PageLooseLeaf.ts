import { AbilityType, CardDefinition, CostType, EffectType, Restriction, TargetMapping, Zone } from '@shared/engine_types';

export const PageLooseLeaf: CardDefinition = {
    name: "Page, Loose Leaf",
    manaCost: "{2}",
    scryfall_id: "8c6fecfd-8241-4cf0-b1eb-19472b99e0ed",
    rarity: "common",
    image_url: "https://cards.scryfall.io/normal/front/8/c/8c6fecfd-8241-4cf0-b1eb-19472b99e0ed.jpg?1775938744",
    colors: [],
    types: [
        "Legendary",
        "Artifact",
        "Creature"
    ],
    subtypes: [
        "Construct"
    ],
    keywords: [],
    oracleText: "{T}: Add {C}.\nGrandeur — Discard another card named Page, Loose Leaf: Reveal cards from the top of your library until you reveal an instant or sorcery card. Put that card into your hand and the rest on the bottom of your library in a random order.",
    power: "0",
    toughness: "2",
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Tap }],
            effects: [{ type: EffectType.AddMana, manaType: 'C' }],
            isManaAbility: true
        },
        {
            type: AbilityType.Activated,
            costs: [
                {
                    type: CostType.Discard,
                    restrictions: [Restriction.Other, Restriction.SameNameAsSource]
                }
            ],
            effects: [
                {
                    type: EffectType.RevealUntilCondition,
                    restrictions: [
                        Restriction.InstantOrSorcery
                    ],
                    zone: Zone.Hand,
                    remainderZone: Zone.Library,
                    remainderPosition: 'bottom',
                    shuffleRemainder: true,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};
