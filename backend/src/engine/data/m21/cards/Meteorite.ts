import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType, TriggerEvent } from "@shared/engine_types";

export const Meteorite: CardDefinition = {

    name: "Meteorite",
    manaCost: "{5}",
    scryfall_id: "ec3a2c95-4e7a-43c5-90bd-6f1de7c82a5c",
    image_url: "https://cards.scryfall.io/normal/front/e/c/ec3a2c95-4e7a-43c5-90bd-6f1de7c82a5c.jpg?1594737513",
    oracleText: "When this artifact enters, it deals 2 damage to any target.\n{T}: Add one mana of any color.",
    colors: [],
    supertypes: [],
    types: ["Artifact"],
    subtypes: [],
    keywords: [],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            targetDefinition: { type: TargetType.AnyTarget, count: 1 },
            effects: [{
                type: EffectType.DealDamage,
                amount: 2,
                targetMapping: TargetMapping.Target1
            }]
        },
        {

            type: AbilityType.Activated,
            costs: [{ type: CostType.Tap }],
            isManaAbility: true,
            effects: [{
                type: EffectType.AddMana,
                value: '{ANY}',
                amount: 1,
                targetMapping: TargetMapping.Controller
            }]
        }
    ]

};



