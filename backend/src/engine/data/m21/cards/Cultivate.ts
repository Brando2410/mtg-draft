import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const Cultivate: CardDefinition = {

    name: "Cultivate",
    manaCost: "{2}{G}",
    oracleText: "Search your library for up to two basic land cards, reveal those cards, put one onto the battlefield tapped and the other into your hand, then shuffle.",
    colors: ["G"],
    supertypes: [],
    types: ["Sorcery"],
    subtypes: [],
    keywords: [],
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.SearchLibrary,
                    targetDefinition: {
                        type: TargetType.Land,
                        count: 1,
                        minCount: 0,
                        restrictions: [
                { type: 'Type', value: 'Basic' }
            ]
                    },
                    zone: Zone.Battlefield,
                    tapped: true,
                    reveal: true,
                    targetMapping: TargetMapping.Controller
                },
                {
                    type: EffectType.SearchLibrary,
                    targetDefinition: {
                        type: TargetType.Land,
                        count: 1,
                        minCount: 0,
                        restrictions: [
                { type: 'Type', value: 'Basic' }
            ]
                    },
                    zone: Zone.Hand,
                    reveal: true,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};

