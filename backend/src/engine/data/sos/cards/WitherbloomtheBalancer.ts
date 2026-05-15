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
    image_url: "https://cards.scryfall.io/normal/front/e/d/ed7b2361-97c6-49e2-bf0b-4770f4ffe2f0.jpg?1775938710"
};

