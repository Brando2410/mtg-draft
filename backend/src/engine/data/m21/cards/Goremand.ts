import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';

export const Goremand: CardDefinition = {
    name: "Goremand",
    manaCost: "{4}{B}{B}",
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
            activeZone: Zone.Hand,
            effects: [
                {
                    type: EffectType.AdditionalCost,
                    targetMapping: TargetMapping.Self,
                    additionalCosts: [{ type: CostType.Sacrifice, restrictions: ['Creature'] }]
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
                    restrictions: ['Creature']
                }
            ]
        }
    ]
};
