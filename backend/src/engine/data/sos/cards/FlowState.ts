import { AbilityType, CardDefinition, ConditionType, EffectType, Zone } from '@shared/engine_types';

export const FlowState: CardDefinition = {
    name: "Flow State",
    manaCost: "{1}{U}",


    colors: ["U"],
    types: ["Sorcery"],
    subtypes: [],
    keywords: [],
    oracleText: "Look at the top three cards of your library. Put one of them into your hand and the rest on the bottom of your library in any order. If there is an instant card and a sorcery card in your graveyard, instead put two of them into your hand and the rest on the bottom of your library in any order.",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.ConditionalEffect,
                    effects: [
                        {
                            condition: ConditionType.HasInstantAndSorceryInGy,
                            type: EffectType.LookAtTopAndPick,
                            fromTop: 3,
                            amount: 2,
                            zone: Zone.Hand,
                            remainderZone: Zone.Library,
                            remainderPosition: 'bottom'
                        },
                        {
                            condition: `!${ConditionType.HasInstantAndSorceryInGy}`,
                            type: EffectType.LookAtTopAndPick,
                            fromTop: 3,
                            amount: 1,
                            zone: Zone.Hand,
                            remainderZone: Zone.Library,
                            remainderPosition: 'bottom'
                        }
                    ]
                }
            ]
        }
    ],
    scryfall_id: "47d6093b-b1b6-4956-8bfd-02cce899f832",
    image_url: "https://cards.scryfall.io/normal/front/4/7/47d6093b-b1b6-4956-8bfd-02cce899f832.jpg?1775937249",
    rarity: "uncommon"
};

