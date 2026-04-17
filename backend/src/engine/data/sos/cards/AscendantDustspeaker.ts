import { AbilityType, CardDefinition, ConditionType, CostType, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const AscendantDustspeaker: CardDefinition = {
    name: "Ascendant Dustspeaker",
    manaCost: "{4}{W}",
    scryfall_id: "de3de40b-a7ac-455e-add2-4e451b602d17",
    image_url: "https://cards.scryfall.io/normal/front/d/e/de3de40b-a7ac-455e-add2-4e451b602d17.jpg?1776000359",
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
                type: TargetType.Creature,
                restrictions: ["other", "youcontrol"]
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
                type: TargetType.CardInGraveyard,
                optional: true,
                count: 1,
                minCount: 0
            },
            effects: [
                {
                    type: EffectType.Exile,
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ],
    power: "3",
    toughness: "4"
};
