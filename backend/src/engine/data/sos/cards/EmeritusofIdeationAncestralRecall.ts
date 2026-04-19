import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
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
                    type: CostType.Choice,
                    label: "Exile eight cards from your graveyard?",
                    choices: [
                        {
                            label: "Exile 8 cards",
                            condition: 'GRAVEYARD_COUNT_GE:8',
                            effects: [
                                {
                                    type: CostType.Choice,
                                    label: "Select 8 cards to exile",
                                    targetIdMapping: 'CONTROLLER_GRAVEYARD',
                                    minChoices: 8,
                                    maxChoices: 8,
                                    effects: [
                                        { type: CostType.Exile }
                                    ]
                                },
                                {
                                    type: EffectType.Prepare,
                                    targetMapping: TargetMapping.Self
                                }
                            ]
                        },
                        {
                            label: "Decline",
                            effects: []
                        }
                    ]
                }
            ]
        }
    ],
    preparedFace: {
        name: "Ancestral Recall",
        //    image_url: "https://cards.scryfall.io/png/front/2/3/2398892d-28e9-4009-81ec-0d544af79d2b.png?1614638829",
        image_url: "https://cards.scryfall.io/normal/front/7/5/75961d36-acf6-425f-9698-0bf52af74f31.jpg?1775937223",
        manaCost: "{U}",
        colors: ["U"],
        types: ["Instant"],
        oracleText: "Target player draws three cards.",
        abilities: [
            {
                type: AbilityType.Spell,
                targetDefinition: {
                    type: 'Player',
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

