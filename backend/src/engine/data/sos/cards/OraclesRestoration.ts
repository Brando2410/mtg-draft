import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
export const OraclesRestoration: CardDefinition = {
    name: "Oracle's Restoration",
    manaCost: "{G}",
    scryfall_id: "0863a19d-4511-4a78-98dd-d194afd1c39b",
    image_url: "https://cards.scryfall.io/normal/front/0/8/0863a19d-4511-4a78-98dd-d194afd1c39b.jpg?1775938067",
    colors: [
        "G"
    ],
    types: [
        "Sorcery"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Target creature you control gets +1/+1 until end of turn. You draw a card and gain 1 life.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Creature,
                count: 1,
                restrictions: [
                    "youcontrol"
                ]
            },
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    sublayer: 'Stats',
                    powerModifier: 1,
                    toughnessModifier: 1,
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetMapping.Target1
                },
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
};
