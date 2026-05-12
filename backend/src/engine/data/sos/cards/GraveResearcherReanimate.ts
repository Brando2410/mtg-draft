import { AbilityType, CardDefinition, ConditionType, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const GraveResearcherReanimate: CardDefinition = {
    name: "Grave Researcher // Reanimate",
    manaCost: "{2}{B} // {B}",
    colors: ["B"],
    types: ["Creature"],
    subtypes: ["Troll", "Warlock"],
    keywords: ["Prepared"],
    oracleText: "At the beginning of your upkeep, surveil 1. Then if there are three or more creature cards in your graveyard, this creature becomes prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
    power: "3",
    toughness: "3",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Upkeep,
            condition: ConditionType.IsYourTurn,
            effects: [
                {
                    type: EffectType.Surveil,
                    amount: 1,
                    targetMapping: TargetMapping.Controller
                },
                {
                    type: EffectType.ConditionalEffect,
                    condition: ConditionType.GraveyardCreatureCountGe3,
                    effects: [{ type: EffectType.Prepare, targetMapping: TargetMapping.Self }]
                }
            ]
        }
    ],
    preparedFace: {
        name: "Reanimate",

        manaCost: "{B}",
        colors: ["B"],
        types: ["Sorcery"],
        oracleText: "Put target creature card from a graveyard onto the battlefield under your control. You lose life equal to that card's mana value.",
        abilities: [
            {
                type: AbilityType.Spell,
                targetDefinitions: [{
                    type: TargetType.CardInGraveyard,
                    count: 1,
                    restrictions: [Restriction.Creature]
                }],
                effects: [
                    {
                        type: EffectType.PutOnBattlefield,
                        targetMapping: TargetMapping.Target1
                    },
                    {
                        type: EffectType.LoseLife,
                        targetMapping: TargetMapping.Controller,
                        amount: 'TARGET_1_MANA_VALUE'
                    }
                ]
            }
        ],

    },
    scryfall_id: "8b1e10e8-ea14-4761-910b-4072e2a18456",
    image_url: "https://cards.scryfall.io/normal/front/8/b/8b1e10e8-ea14-4761-910b-4072e2a18456.jpg?1778165067",
    rarity: "rare"
};

