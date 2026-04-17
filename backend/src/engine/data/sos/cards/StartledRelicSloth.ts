import { AbilityType, CardDefinition, ConditionType, EffectType, TargetType, TriggerEvent } from '@shared/engine_types';
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
    power: "4",
    toughness: "4",
    oracleText: "Trample, lifelink\nAt the beginning of combat on your turn, exile up to one target card from a graveyard.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.BeginningOfCombatStep,
            condition: ConditionType.IsYourTurn,
            effects: [
                {
                    type: EffectType.Exile,
                    targetDefinition: {
                        type: TargetType.CardInGraveyard,
                        count: 1,
                        minCount: 0,
                        optional: true,
                        label: "Select up to one card to exile"
                    }
                }
            ]
        }
    ]
};
