import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
export const GrapplewithDeath: CardDefinition = {
    name: "Grapple with Death",
    manaCost: "{1}{B}{G}",
    colors: [
        "B",
        "G"
    ],
    types: [
        "Sorcery"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Destroy target artifact or creature. You gain 1 life.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Permanent,
                count: 1,
                restrictions: [
                    "ArtifactOrCreature"
                ]
            },
            effects: [
                {
                    type: EffectType.Destroy,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.GainLife,
                    targetMapping: TargetMapping.Controller,
                    amount: 1
                }
            ]
        }
    ]
};
