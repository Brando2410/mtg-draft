import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';
export const TamObservantSequencerDeepSight: CardDefinition = {
    name: "Tam, Observant Sequencer // Deep Sight",
    manaCost: "{2}{G}{U}",
    colors: ["G", "U"],
    types: ["Creature"],
    subtypes: ["Gorgon", "Wizard"],
    keywords: [],
    oracleText: "Landfall  Whenever a land you control enters, Tam becomes prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
    supertypes: ["Legendary"],
    power: "4",
    toughness: "3",
    entersPrepared: false,
    image_url: "https://cards.scryfall.io/png/front/7/1/7120e71b-2976-451b-89a7-a1665dc6fb6b.png?1775938655",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Landfall,
            effects: [
                {
                    type: EffectType.Prepare,
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ],
    preparedFace: {
        name: "Deep Sight",
        image_url: "https://cards.scryfall.io/png/front/7/1/7120e71b-2976-451b-89a7-a1665dc6fb6b.png?1775938655",
        manaCost: "{G}{U}",
        colors: ["G", "U"],
        types: ["Sorcery"],
        oracleText: "You draw a card and gain 1 life.",
        abilities: [
            {
                type: AbilityType.Spell,
                effects: [
                    {
                        type: EffectType.DrawCards,
                        amount: 1,
                        targetMapping: TargetMapping.Controller
                    },
                    {
                        type: EffectType.GainLife,
                        amount: 1,
                        targetMapping: TargetMapping.Controller
                    }
                ]
            }
        ]
    }
};
