import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const Cultivate: CardDefinition = {
    name: "Cultivate",
    manaCost: "{2}{G}",
    scryfall_id: "4a433310-3fe2-4156-864d-7a6b2638340b",
    image_url: "https://cards.scryfall.io/normal/front/4/a/4a433310-3fe2-4156-864d-7a6b2638340b.jpg?1594736923",
    oracleText: "Search your library for up to two basic land cards, reveal those cards, put one onto the battlefield tapped and the other into your hand, then shuffle.",
    colors: ["G"],
    types: ["Sorcery"],
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.SearchLibrary,
                    label: "Put one basic land card onto the battlefield tapped",
                    targetDefinitions: [{
                        type: TargetType.Land,
                        count: 1,
                        minCount: 0,
                        restrictions: [Restriction.Basic]
                    }],
                    zone: Zone.Battlefield,
                    tapped: true,
                    reveal: true,
                    targetMapping: TargetMapping.Controller
                },
                {
                    type: EffectType.SearchLibrary,
                    label: "Put the other basic land card into your hand",
                    targetDefinitions: [{
                        type: TargetType.Land,
                        count: 1,
                        minCount: 0,
                        restrictions: [Restriction.Basic]
                    }],
                    zone: Zone.Hand,
                    reveal: true,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};
