import { AbilityType, Zone, EffectType, CardDefinition, TargetType, TargetMapping } from "@shared/engine_types";

export const MindRot: CardDefinition = {

    name: "Mind Rot",
    manaCost: "{2}{B}",
    oracleText: "Target player discards two cards.",
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
                {
                    type: EffectType.DiscardCards,
                    amount: 2,
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};

