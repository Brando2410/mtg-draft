import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from "@shared/engine_types";

export const Cancel: CardDefinition = {
    name: "Cancel",
    manaCost: "{1}{U}{U}",
    scryfall_id: "59e14910-ee2e-49ae-855e-46a8ab6cad82",
    image_url: "https://cards.scryfall.io/normal/front/5/9/59e14910-ee2e-49ae-855e-46a8ab6cad82.jpg?1594735420",
    oracleText: "Counter target spell.",
    colors: ["U"],
    types: ["Instant"],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: { type: TargetType.Spell, count: 1 },
            effects: [{ type: EffectType.CounterSpell, targetMapping: TargetMapping.Target1 }]
        }
    ]
};
