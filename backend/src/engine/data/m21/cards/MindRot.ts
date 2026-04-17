import { AbilityType, Zone, EffectType, CardDefinition, TargetType, TargetMapping } from "@shared/engine_types";

export const MindRot: CardDefinition = {

    name: "Mind Rot",
    manaCost: "{2}{B}",
    scryfall_id: "833a8604-92d5-443b-9bc0-bd91c973ef07",
    image_url: "https://cards.scryfall.io/normal/front/8/3/833a8604-92d5-443b-9bc0-bd91c973ef07.jpg?1594736305",
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

