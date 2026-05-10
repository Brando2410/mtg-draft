import { AbilityType, CardDefinition, EffectType, TargetMapping } from "@shared/engine_types";

export const AzusaLostButSeeking: CardDefinition = {
    name: "Azusa, Lost but Seeking",
    manaCost: "{2}{G}",

    oracleText: "You may play two additional lands on each of your turns.",
    colors: ["G"],
    supertypes: ["Legendary"],
    types: ["Creature"],
    subtypes: ["Human", "Monk"],
    power: "1",
    toughness: "2",
    abilities: [
        {
            type: AbilityType.Static,
            effects: [{
                type: EffectType.AdditionalLandPlays,
                amount: 2,
                targetMapping: TargetMapping.Controller
            }]
        }
    ],
    scryfall_id: "0b8aff2c-1f7b-4507-b914-53f8c4706b3d",
    image_url: "https://cards.scryfall.io/normal/front/0/b/0b8aff2c-1f7b-4507-b914-53f8c4706b3d.jpg?1596259277",
    rarity: "rare"
};

