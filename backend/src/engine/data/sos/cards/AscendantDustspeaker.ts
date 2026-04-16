import { AbilityType, CardDefinition, ConditionType, CostType, EffectType, Restriction, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';
    export const AscendantDustspeaker: CardDefinition = {
    name: "Ascendant Dustspeaker",
    manaCost: "{4}{W}",
    colors: [
        "W"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Orc",
        "Cleric"
    ],
    keywords: ["Flying"],
    oracleText: "Flying\nWhen this creature enters, put a +1/+1 counter on another target creature you control.\nAt the beginning of combat on your turn, exile up to one target card from a graveyard.",
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
            targetDefinition: { 
                type: 'Creature', 
                restrictions: [{ type: 'NotSelf' }, { type: 'Controller', value: Restriction.Player }] 
            },
            effects: [
                { 
                    type: EffectType.AddCounters, 
                    amount: 1, 
                    counterType: '+1/+1', 
                    targetMapping: TargetMapping.Target1 
                }
            ]
        },
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.BeginningOfCombatStep,
            condition: ConditionType.IsYourTurn,
            targetDefinition: { 
                type: 'Card', 
                zone: Zone.Graveyard, 
                optional: true,
                maxSelections: 1,
                restrictions: []
            },
            effects: [
                { 
                    type: CostType.Exile, 
                    targetMapping: TargetMapping.Target1 
                }
            ]
        }
    ],
    power: "3",
    toughness: "4"
};
    