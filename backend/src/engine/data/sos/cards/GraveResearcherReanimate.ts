import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';
    export const GraveResearcherReanimate: CardDefinition = {
    name: "Grave Researcher // Reanimate",
    manaCost: "{2}{B} // {B}",
    colors: [
        "B"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Troll",
        "Warlock"
    ],
    keywords: ["Surveil", "Prepared"],
    oracleText: "At the beginning of your upkeep, surveil 1. Then if there are three or more creature cards in your graveyard, this creature becomes prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
    power: "3",
    toughness: "3",
    image_url: "https://cards.scryfall.io/png/front/8/b/8b1e10e8-ea14-4761-910b-4072e2a18456.png?1775937504",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Upkeep,
            effects: [
                { type: EffectType.Surveil, amount: 1, targetMapping: TargetMapping.Controller },
                {
                    type: EffectType.ConditionalEffect,
                    condition: 'GRAVEYARD_CREATURE_COUNT_GE' as any,
                    restrictions: ['3'],
                    effects: [{ type: EffectType.Prepare, targetMapping: TargetType.Self }]
                }
            ]
        }
    ],
    preparedFace: {
        name: "Reanimate",
        image_url: "https://cards.scryfall.io/png/front/3/6/368b6903-5fc4-43e7-bd44-46b8107c8bb4.png?1738000013",
        manaCost: "{B}",
        colors: ["B"],
        types: ["Sorcery"],
        oracleText: "Put target creature card from a graveyard onto the battlefield under your control. You lose life equal to that card's mana value.",
        abilities: [
            {
                type: AbilityType.Spell,
                targetDefinition: {
                    type: TargetType.CardInGraveyard,
                    count: 1,
                    restrictions: ['Creature']
                },
                effects: [
                    {
                        type: EffectType.PutOnBattlefield,
                        targetMapping: TargetMapping.Target1
                    },
                    {
                        type: EffectType.LoseLife,
                        targetMapping: TargetMapping.Controller,
                        amount: 'TARGET_1_MANA_VALUE' as any
                    }
                ]
            }
        ]
    }
};
    