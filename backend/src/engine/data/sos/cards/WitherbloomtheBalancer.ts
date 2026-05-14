import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping } from "@shared/engine_types";

export const WitherbloomtheBalancer: CardDefinition = {
    name: "Witherbloom the Balancer",
    manaCost: "{6}{B}{G}",
    colors: ["B", "G"],
    types: ["Creature"],
    subtypes: ["Elder", "Dragon"],
    power: "5",
    toughness: "5",
    keywords: ["Affinity for creatures", "Flying", "Deathtouch"],
    oracleText: "Affinity for creatures (This spell costs {1} less to cast for each creature you control.)\nFlying, deathtouch\nInstant and sorcery spells you cast have affinity for creatures.",
    abilities: [
        {
            type: AbilityType.Static,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    targetMapping: TargetMapping.Controller,
                    abilitiesToAdd: ["Affinity for creatures"],
                    restrictions: [Restriction.InstantOrSorcery]
                }
            ]
        }
    ],
    image_url: "https://cards.scryfall.io/normal/front/d/a/da336d33-3d33-4d33-9d33-da336d33da33.jpg"
};

