import { AbilityType, CardDefinition, EffectType, TargetType, TargetMapping } from '@shared/engine_types';

export const PeerintotheAbyss: CardDefinition = {
    name: "Peer into the Abyss",
    manaCost: "{4}{B}{B}{B}",
    oracleText: "Target player draws cards equal to half the number of cards in their library and loses half their life. Round up each time.",
    colors: ["B"],
    supertypes: [],
    types: ["Sorcery"],
    subtypes: [],
    keywords: [],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: { type: TargetType.Player, count: 1 },
            effects: [
                { type: EffectType.DrawCards, amount: 'HALF_LIBRARY_ROUND_UP', targetMapping: TargetMapping.Target1 },
                { type: EffectType.LoseLife, amount: 'HALF_LIFE_ROUND_UP', targetMapping: TargetMapping.Target1 }
            ]
        }
    ]
};


