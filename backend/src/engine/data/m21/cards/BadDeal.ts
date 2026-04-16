import { AbilityType, ZoneRequirement, CardDefinition, EffectType, TargetMapping } from '@shared/engine_types';

export const BadDeal: CardDefinition = {

    name: "Bad Deal",
    manaCost: "{4}{B}{B}",
    oracleText: "You draw two cards and each opponent discards two cards. Each player loses 2 life.",
    colors: ["B"],
    supertypes: [],
    types: ["Sorcery"],
    subtypes: [],
    keywords: [],
    abilities: [
        {
            id: "bad_deal_spell",
            type: AbilityType.Spell,
            activeZone: ZoneRequirement.Stack,
            effects: [
                { type: EffectType.DrawCards, amount: 2, targetMapping: TargetMapping.Controller },
                { type: EffectType.DiscardCards, amount: 2, targetMapping: TargetMapping.AllOpponents },
                { type: EffectType.LoseLife, amount: 2, targetMapping: TargetMapping.EachPlayer }
            ]
        }
    ]

};
