import { AbilityType, CardDefinition, EffectType, TargetMapping, Zone } from '@shared/engine_types';

export const BadDeal: CardDefinition = {

    name: "Bad Deal",
    manaCost: "{4}{B}{B}",
    scryfall_id: "7a3f8bc2-ef66-474f-92a3-9c4df1670cec",
    image_url: "https://cards.scryfall.io/normal/front/7/a/7a3f8bc2-ef66-474f-92a3-9c4df1670cec.jpg?1594735984",
    oracleText: "You draw two cards and each opponent discards two cards. Each player loses 2 life.",
    colors: ["B"],
    supertypes: [],
    types: ["Sorcery"],
    subtypes: [],
    keywords: [],
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                { type: EffectType.DrawCards, amount: 2, targetMapping: TargetMapping.Controller },
                { type: EffectType.DiscardCards, amount: 2, targetMapping: TargetMapping.AllOpponents },
                { type: EffectType.LoseLife, amount: 2, targetMapping: TargetMapping.EachPlayer }
            ]
        }
    ]

};

