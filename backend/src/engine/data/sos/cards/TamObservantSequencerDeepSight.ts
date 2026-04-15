import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const TamObservantSequencerDeepSight: CardDefinition = {
    name: "Tam, Observant Sequencer",
    manaCost: "{2}{G}{U}",
    colors: ["G", "U"],
    supertypes: ["Legendary"],
    types: ["Creature"],
    subtypes: ["Gorgon", "Wizard"],
    power: "4",
    toughness: "3",
    oracleText: "Landfall — Whenever a land you control enters, Tam becomes prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
    entersPrepared: false,
    abilities: [
        {
            type: AbilityType.Triggered,
            id: 'Landfall',
            eventMatch: TriggerEvent.EnterBattlefieldOther,
            restrictions: [
                {
                    type: 'Type',
                    value: 'Land'
                }
            ],
            condition: 'PLAYER_IS_CONTROLLER',
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
