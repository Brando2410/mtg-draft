import { AbilityType, Zone, CardDefinition, EffectType, TargetMapping } from "@shared/engine_types";

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
    keywords: [],
    abilities: [
        {
            id: "azusa_extra_lands",
            type: AbilityType.Static,
            activeZone: Zone.Battlefield,
            effects: [{
                type: EffectType.AdditionalLandPlays,
                amount: 2,
                targetMapping: TargetMapping.Controller
            }]
        }
    ]

};
