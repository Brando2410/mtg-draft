import { AbilityType, CardDefinition, CounterType, CostType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const RequisitionRaid: CardDefinition = {
    name: "Requisition Raid",
    manaCost: "{W}",


    colors: ["W"],
    types: ["Sorcery"],
    subtypes: [],
    keywords: ["Spree"],
    oracleText: "Spree (Choose one or more additional costs.)\n+ {1} — Destroy target artifact.\n+ {1} — Destroy target enchantment.\n+ {1} — Put a +1/+1 counter on each creature target player controls.",
    set: "soa",
    abilities: [
        {
            type: AbilityType.Spell,
            minChoices: 1,
            maxChoices: 3,
            modes: [
                {
                    label: "Destroy target artifact",
                    costs: [{ type: CostType.Mana, value: "{1}" }],
                    targetDefinitions: [{ count: 1, type: TargetType.Artifact }],
                    effects: [{ type: EffectType.Destroy, targetMapping: TargetMapping.Target1 }]
                },
                {
                    label: "Destroy target enchantment",
                    costs: [{ type: CostType.Mana, value: "{1}" }],
                    targetDefinitions: [{ count: 1, type: TargetType.Enchantment }],
                    effects: [{ type: EffectType.Destroy, targetMapping: TargetMapping.Target1 }]
                },
                {
                    label: "Put a +1/+1 counter on each creature target player controls",
                    costs: [{ type: CostType.Mana, value: "{1}" }],
                    targetDefinitions: [{ count: 1, type: TargetType.Player }],
                    effects: [{
                        type: EffectType.AddCounters,
                        counterType: CounterType.P1P1,
                        amount: 1,
                        targetMapping: TargetMapping.EachCreatureControlledByTarget1
                    }]
                }
            ]
        }
    ],
    scryfall_id: "6d9efae9-365d-46c8-be92-d4a3038f0414",
    image_url: "https://cards.scryfall.io/normal/front/6/d/6d9efae9-365d-46c8-be92-d4a3038f0414.jpg?1775936425",
    rarity: "uncommon"
};

