import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';
    export const LeechCollectorBloodletting: CardDefinition = {
    name: "Leech Collector // Bloodletting",
    manaCost: "{1}{B}",
    colors: ["B"],
    types: ["Creature"],
    subtypes: ["Human", "Warlock"],
    keywords: ["Prepared"],
    oracleText: "Whenever you gain life for the first time each turn, this creature becomes prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
    power: "2",
    toughness: "2",
    image_url: "https://cards.scryfall.io/png/front/c/7/c715fe4c-c0e7-4342-811f-b74687851097.png?1775937525",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.LifeGain,
            limitPerTurn: 1,
            condition: (state: any, event: any, trigger: any) => {
                return event.playerId === trigger.controllerId;
            },
            effects: [
                {
                    type: EffectType.Prepare,
                    targetMapping: TargetType.Self
                }
            ]
        }
    ],
    preparedFace: {
        name: "Bloodletting",
        image_url: "https://cards.scryfall.io/png/front/c/7/c715fe4c-c0e7-4342-811f-b74687851097.png?1775937525",
        manaCost: "{B}",
        colors: ["B"],
        types: ["Sorcery"],
        oracleText: "Each opponent loses 2 life.",
        abilities: [
            {
                type: AbilityType.Spell,
                effects: [
                    {
                        type: EffectType.LoseLife,
                        amount: 2,
                        targetMapping: TargetMapping.EachOpponent
                    }
                ]
            }
        ]
    }
};
    