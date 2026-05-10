import { AbilityType, CardDefinition, CostType, EffectType, Restriction, TargetMapping, TargetType } from "@shared/engine_types";

export const Miscast: CardDefinition = {
    name: "Miscast",
    manaCost: "{U}",

    oracleText: "Counter target instant or sorcery spell unless its controller pays {3}.",
    colors: ["U"],
    types: ["Instant"],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                type: TargetType.Spell,
                restrictions: [Restriction.InstantOrSorcery]
            }],
            effects: [
                {
                    type: EffectType.Choice,
                    targetMapping: TargetMapping.Target1Controller,
                    choices: [
                        {
                            label: "Pay {3}",
                            costs: [{ type: CostType.Mana, value: '{3}' }]
                        },
                        {
                            label: "Don't Pay",
                            effects: [{ type: EffectType.CounterSpell, targetMapping: TargetMapping.Target1 }]
                        }
                    ]
                }
            ]
        }
    ],
    scryfall_id: "033afbd5-9937-4957-98ba-48e469a490bb",
    image_url: "https://cards.scryfall.io/normal/front/0/3/033afbd5-9937-4957-98ba-48e469a490bb.jpg?1594735579",
    rarity: "uncommon"
};

