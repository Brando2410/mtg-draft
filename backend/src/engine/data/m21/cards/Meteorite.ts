import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType, TriggerEvent } from "@shared/engine_types";

export const Meteorite: CardDefinition = {
    name: "Meteorite",
    manaCost: "{5}",

    oracleText: "When this artifact enters, it deals 2 damage to any target.\n{T}: Add one mana of any color.",
    colors: [],
    types: ["Artifact"],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            targetDefinitions: [{ type: TargetType.AnyTarget, count: 1 }],
            effects: [{
                type: EffectType.DealDamage,
                amount: 2,
                targetMapping: TargetMapping.Target1
            }]
        },
        {
            id: "{T}: Add one mana of any color.",
            type: AbilityType.Activated,
            costs: [{ type: CostType.Tap }],
            isManaAbility: true,
            effects: [{
                type: EffectType.AddMana,
                manaType: 'ANY'
            }]
        }
    ],
    scryfall_id: "33eb2032-50af-4fd6-bdc7-7cae2211956c",
    image_url: "https://cards.scryfall.io/normal/front/3/3/33eb2032-50af-4fd6-bdc7-7cae2211956c.jpg?1677542216",
    rarity: "common"
};

