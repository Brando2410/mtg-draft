import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
    export const BogwaterLumaret: CardDefinition = {
    name: "Bogwater Lumaret",
    manaCost: "{B}{G}",
    colors: [
        "B",
        "G"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Spirit",
        "Frog"
    ],
    keywords: [],
    oracleText: "Whenever this creature or another creature you control enters, you gain 1 life.",
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
            condition: ConditionType.OwnCreatureEnters,
            effects: [
                {
                    type: EffectType.GainLife,
                    amount: 1,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ],
    power: "2",
    toughness: "2"
};
    
