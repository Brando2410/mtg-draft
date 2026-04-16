import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

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
    additionalCosts: [
        {
            type: EffectType.Sacrifice,
            targetDefinition: {
                type: TargetType.Creature,
                count: 1,
            }
        }
    ],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            activeZone: Zone.Battlefield,
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



