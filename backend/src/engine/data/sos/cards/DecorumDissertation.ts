import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
export const DecorumDissertation: CardDefinition = {
    name: "Decorum Dissertation",
    manaCost: "{2}{U}",


    colors: ["U"],
    types: ["Sorcery"],
    subtypes: [],
    keywords: ["Paradigm"],
    oracleText: "Target player draws two cards and loses 2 life. \nParadigm",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{ type: TargetType.Player, count: 1 }],
            effects: [
                { type: EffectType.DrawCards, amount: 2, targetMapping: TargetMapping.Target1 },
                { type: EffectType.DealDamage, amount: 2, targetMapping: TargetMapping.Target1 }
            ]
        }
    ],
    scryfall_id: "f4ab2d9b-c73d-478d-aac7-4d3bb24296d2",
    image_url: "https://cards.scryfall.io/normal/front/f/4/f4ab2d9b-c73d-478d-aac7-4d3bb24296d2.jpg?1775937454",
    rarity: "mythic"
};

