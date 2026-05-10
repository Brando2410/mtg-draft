import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType } from '@shared/engine_types';
export const GrapplewithDeath: CardDefinition = {
    name: "Grapple with Death",
    manaCost: "{1}{G}{B}",


    colors: ["G", "B"],
    types: ["Sorcery"],
    subtypes: [],
    keywords: [],
    oracleText: "Destroy target artifact or creature. You gain 1 life.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                type: TargetType.Permanent,
                count: 1,
                restrictions: [Restriction.ArtifactOrCreature]
            }],
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
    ],
    scryfall_id: "62842fb4-8bd3-4d80-b4f9-5bc3c5cebd3a",
    image_url: "https://cards.scryfall.io/normal/front/6/2/62842fb4-8bd3-4d80-b4f9-5bc3c5cebd3a.jpg?1775938332",
    rarity: "common"
};

