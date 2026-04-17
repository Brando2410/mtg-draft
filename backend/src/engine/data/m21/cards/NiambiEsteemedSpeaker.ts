import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const NiambiEsteemedSpeaker: CardDefinition = {
    name: "Niambi, Esteemed Speaker",
    manaCost: "{W}{U}",
    oracleText: "Flash\nWhen Niambi enters, you may return another target creature you control to its owner's hand. If you do, you gain life equal to that creature's mana value.\n{1}{W}{U}, {T}, Discard a legendary card: Draw two cards.",
    colors: ["W", "U"],
    supertypes: ["Legendary"],
    types: ["Creature"],
    subtypes: ["Human", "Cleric"],
    power: "2",
    toughness: "1",
    keywords: [],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            targetDefinition: {
                type: TargetType.Creature,
                count: 1,
                minCount: 0,
                restrictions: [
                { type: 'Control', value: 'YouControl' },
                { type: 'Identity', value: 'Other' }
            ]
            },
            effects: [
                {
                    type: EffectType.ReturnToHand,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.GainLife,
                    amount: 'TARGET_1_CMC',
                    targetMapping: TargetMapping.Controller
                }
            ],
        },
        {
            type: AbilityType.Activated,
            activeZone: Zone.Battlefield,
            costs: [
                { type: CostType.Mana, value: '{1}{W}{U}' },
                { type: CostType.Tap },
                { type: CostType.Discard, restrictions: [
                { type: 'Type', value: 'Legendary' }
            ] }],
            effects: [{ type: EffectType.DrawCards, amount: 2, targetMapping: TargetMapping.Controller }]
        }
    ]
};




