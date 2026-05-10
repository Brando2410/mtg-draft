import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from "@shared/engine_types";

export const FinishingBlow: CardDefinition = {
    name: "Finishing Blow",
    manaCost: "{4}{B}",

    oracleText: "Destroy target creature or planeswalker.",
    colors: ["B"],
    types: ["Instant"],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                type: TargetType.CreatureOrPlaneswalker,
                count: 1
            }],
            effects: [{ type: EffectType.Destroy, targetMapping: TargetMapping.Target1 }]
        }
    ],
    scryfall_id: "2b85a552-2119-4d9c-b7c1-c09c2d9f2f38",
    image_url: "https://cards.scryfall.io/normal/front/2/b/2b85a552-2119-4d9c-b7c1-c09c2d9f2f38.jpg?1594736130",
    rarity: "common"
};

