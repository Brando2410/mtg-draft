import { AbilityType, CardDefinition, EffectType, TargetMapping } from '@shared/engine_types';

export const RainofRevelation: CardDefinition = {
    name: "Rain of Revelation",
    manaCost: "{3}{U}",
    oracleText: "Draw three cards, then discard a card.",
    colors: ["U"],
    supertypes: [],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                { type: EffectType.DrawCards, amount: 3, targetMapping: TargetMapping.Controller },
                { type: EffectType.DiscardCards, amount: 1, targetMapping: TargetMapping.Controller }
            ]
        }
    ]
};


