import { AbilityType, CardDefinition, ConditionType, CostType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';
    export const StartledRelicSloth: CardDefinition = {
    name: "Startled Relic Sloth",
    manaCost: "{2}{R}{W}",
    colors: [
        "R",
        "W"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Sloth",
        "Beast"
    ],
    keywords: [
        "Trample",
        "Lifelink"
    ],
    oracleText: "Trample, lifelink\nAt the beginning of combat on your turn, exile up to one target card from a graveyard.",
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.BeginningOfCombatStep,
            condition: ConditionType.IsYourTurn,
            targetDefinition: {
                type: TargetType.CardInGraveyard,
                count: 1,
                optional: true
            },
            effects: [
                {
                    type: CostType.Exile,
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ],
    power: "4",
    toughness: "4"
};
    