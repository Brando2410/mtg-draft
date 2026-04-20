import { AbilityType, CardDefinition, ConditionType, CostType, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const EmeritusofIdeationAncestralRecall: CardDefinition = {
    name: "Emeritus of Ideation // Ancestral Recall",
    manaCost: "{3}{U}{U}",
    scryfall_id: "75961d36-acf6-425f-9698-0bf52af74f31",
    rarity: "mythic",
    image_url: "https://cards.scryfall.io/normal/front/7/5/75961d36-acf6-425f-9698-0bf52af74f31.jpg?1775937223",
    colors: ["U"],
    types: ["Creature"],
    subtypes: ["Human", "Wizard"],
    keywords: ["Flying", "Ward {2}", "Prepared"],
    oracleText: "Flying, ward {2}\nThis creature enters prepared.\nWhenever this creature attacks, you may exile eight cards from your graveyard. If you do, this creature becomes prepared.",
    power: "5",
    toughness: "5",
    entersPrepared: true,
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Attack,
            effects: [
                {
                    type: EffectType.Choice,
                    label: "Exile eight cards from your graveyard to prepare?",
                    choices: [
                        {
                            label: "Yes",
                            costs: [
                                {
                                    type: CostType.Exile,
                                    amount: 8,
                                    targetDefinition: {
                                        type: TargetType.Card,
                                        zone: Zone.Graveyard,
                                        count: 8,
                                        restrictions: [Restriction.YouOwn]
                                    }
                                }
                            ],
                            effects: [
                                {
                                    type: EffectType.Prepare,
                                    targetMapping: TargetMapping.Self
                                }
                            ]
                        },
                        {
                            label: "No",
                            effects: []
                        }
                    ]
                }
            ]
        }
    ],
    preparedFace: {
        name: "Ancestral Recall",
        image_url: "https://cards.scryfall.io/normal/front/7/5/75961d36-acf6-425f-9698-0bf52af74f31.jpg?1775937223",
        manaCost: "{U}",
        colors: ["U"],
        types: ["Instant"],
        oracleText: "Target player draws three cards.",
        abilities: [
            {
                type: AbilityType.Spell,
                targetDefinition: {
                    type: TargetType.Player,
                    count: 1
                },
                effects: [
                    {
                        type: EffectType.DrawCards,
                        amount: 3,
                        targetMapping: TargetMapping.Target1
                    }
                ]
            }
        ]
    }
};
