import { AbilityType, CardDefinition, ConditionType, CostType, DurationType, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';
export const EnnisDebateModerator: CardDefinition = {
    name: "Ennis, Debate Moderator",
    manaCost: "{1}{W}",
    colors: [
        "W"
    ],
    types: [
        "Legendary",
        "Creature"
    ],
    subtypes: [
        "Human",
        "Cleric"
    ],
    keywords: [],
    power: "1",
    toughness: "1",
    oracleText: "When Ennis enters, exile up to one other target creature you control. Return that card to the battlefield under its owner's control at the beginning of the next end step.\nAt the beginning of your end step, if one or more cards were put into exile this turn, put a +1/+1 counter on Ennis.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            condition: ConditionType.ObjectIsSelf,
            targetDefinition: {
                type: TargetType.Creature,
                restrictions: [
                    "youcontrol",
                    "other"
                ],
                count: 1,
                optional: true,
                zone: Zone.Battlefield
            },
            effects: [
                {
                    type: CostType.Exile,
                    targetMapping: TargetMapping.Target1,
                    returnToBattlefield: true,
                    returnduration: { type: DurationType.NextEndStep }
                }
            ]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EndStep,
            condition: 'OUR_TURN && CARDS_EXILED_THIS_TURN',
            effects: [
                {
                    type: EffectType.AddCounters,
                    targetMapping: TargetMapping.Self,
                    amount: 1,
                    counterType: '+1/+1'
                }
            ]
        }
    ]
};
