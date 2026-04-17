import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';
export const ProctorsGaze: CardDefinition = {
    name: "Proctor's Gaze",
    manaCost: "{2}{G}{U}",
    colors: ["G", "U"],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    oracleText: "Return up to one target nonland permanent to its owner's hand. Search your library for a basic land card, put it onto the battlefield tapped, then shuffle.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.NonlandPermanent,
                count: 1,
                minCount: 0
            },
            effects: [
                {
                    type: EffectType.ReturnToHand,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.SearchLibrary,
                    targetMapping: TargetMapping.Controller,
                    targetDefinition: {
                        type: TargetType.Land,
                        count: 1,
                        restrictions: ["Basic"]
                    },
                    zone: Zone.Battlefield,
                    tapped: true
                }
            ]
        }
    ]
};
