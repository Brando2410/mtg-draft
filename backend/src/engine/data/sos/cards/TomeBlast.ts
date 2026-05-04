import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
    export const TomeBlast: CardDefinition = {
    name: "Tome Blast",
    manaCost: "{1}{R}",
    colors: [
        "R"
    ],
    types: [
        "Sorcery"
    ],
    subtypes: [],
    keywords: ["Flashback"],
    oracleText: "Tome Blast deals 2 damage to any target.\nFlashback {4}{R} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
    flashbackCost: "{4}{R}",

    abilities: [
        {
            type: AbilityType.Spell,
            flashbackCost: "{4}{R}",
            targetDefinitions: [{ type: TargetType.AnyTarget }],
            effects: [
                {
                    type: EffectType.DealDamage,
                    amount: 2,
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};
    
