import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TriggerEvent } from "@shared/engine_types";

export const LlanowarVisionary: CardDefinition = {
    name: "Llanowar Visionary",
    manaCost: "{2}{G}",
    scryfall_id: "d6e23afa-7e08-4049-baf0-d4d0134ba2c8",
    image_url: "https://cards.scryfall.io/normal/front/d/6/d6e23afa-7e08-4049-baf0-d4d0134ba2c8.jpg?1594737093",
    oracleText: "When this creature enters, draw a card.\n{T}: Add {G}.",
    colors: ["G"],
    types: ["Creature"],
    subtypes: ["Elf", "Druid"],
    power: "2",
    toughness: "2",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            condition: 'IS_SOURCE',
            effects: [{ type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Controller }]
        },
        {
            type: AbilityType.Activated,
            isManaAbility: true,
            costs: [{ type: CostType.Tap }],
            effects: [{ type: EffectType.AddMana, manaType: 'G' }]
        }
    ]
};
