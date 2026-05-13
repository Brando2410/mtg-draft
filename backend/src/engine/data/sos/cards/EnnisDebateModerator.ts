import { AbilityType, CardDefinition, ConditionType, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const EnnisDebateModerator: CardDefinition = {
    name: "Ennis, Debate Moderator",
    manaCost: "{1}{W}",
    colors: ["W"],
    types: ["Legendary", "Creature"],
    subtypes: ["Human", "Cleric"],
    keywords: [],
    power: "1",
    toughness: "1",
    oracleText: "When Ennis enters, exile up to one other target creature you control. Return that card to the battlefield under its owner's control at the beginning of the next end step.\nAt the beginning of your end step, if one or more cards were put into exile this turn, put a +1/+1 counter on Ennis.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            targetDefinitions: [{
                type: TargetType.Creature,
                restrictions: [Restriction.YouControl, Restriction.Other],
                count: 1,
                optional: true
            }],
            effects: [
                {
                    type: EffectType.Exile,
                    targetMapping: TargetMapping.Target1,
                    effects: [
                        {
                            type: EffectType.CreateDelayedTrigger,
                            eventMatch: TriggerEvent.EndStep,
                            effects: [{ type: EffectType.PutOnBattlefield, targetMapping: TargetMapping.Target1, ownerControl: true }]
                        }
                    ]
                }
            ]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EndStep,
            condition: `${ConditionType.CardsExiledThisTurn} && ${ConditionType.IsYourTurn}`,
            effects: [
                {
                    type: EffectType.AddCounters,
                    targetMapping: TargetMapping.Self,
                    amount: 1,
                    counterType: '+1/+1'
                }
            ]
        }
    ],
    scryfall_id: "d2ef31b4-24fa-4443-9f05-c8e99c3522e5",
    image_url: "https://cards.scryfall.io/normal/front/d/2/d2ef31b4-24fa-4443-9f05-c8e99c3522e5.jpg?1775937005",
    rarity: "uncommon"
};

