import { AbilityType, CardDefinition, CostType, EffectType, Restriction, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';

export const Goremand: CardDefinition = {
    name: "Goremand",
    manaCost: "{4}{B}{B}",
    scryfall_id: "c9cd537c-e40e-438f-a751-e0ad8f6e6283",
    image_url: "https://cards.scryfall.io/normal/front/c/9/c9cd537c-e40e-438f-a751-e0ad8f6e6283.jpg?1594736154",
    oracleText: "As an additional cost to cast this spell, sacrifice a creature.\nFlying\nTrample\nWhen this creature enters, each opponent sacrifices a creature.",
    colors: ["B"],
    types: ["Creature"],
    subtypes: ["Demon"],
    power: "5",
    toughness: "5",
    keywords: ["Flying", "Trample"],
    abilities: [
        {
            type: AbilityType.Static,
            effects: [
                {
                    type: EffectType.AdditionalCost,
                    targetMapping: TargetMapping.Self,
                    additionalCosts: [{
                        type: CostType.Sacrifice,
                        restrictions: [Restriction.Creature]
                    }]
                }
            ]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.Sacrifice,
                    targetMapping: TargetMapping.EachOpponent,
                    restrictions: [Restriction.Creature]
                }
            ]
        }
    ]
};
