import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
    export const OrysaTideChoreographer: CardDefinition = {
    name: "Orysa, Tide Choreographer",
    manaCost: "{4}{U}",
    colors: [
        "U"
    ],
    types: [
        "Legendary",
        "Creature"
    ],
    subtypes: [
        "Merfolk",
        "Bard"
    ],
    keywords: [],
    oracleText: "This spell costs {3} less to cast if creatures you control have total toughness 10 or greater.\nWhen Orysa enters, draw two cards.",
    abilities: [
        {
            type: AbilityType.Static,
            costReduction: {
                amount: '{3}',
                condition: 'TOTAL_TOUGHNESS_GE:10'
            }
        },
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.DrawCards,
                    amount: 2,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ],
    power: "2",
    toughness: "2"
};
    
