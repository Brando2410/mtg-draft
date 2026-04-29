import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const BasrisLieutenant: CardDefinition = {
    name: "Basri's Lieutenant",
    manaCost: "{3}{W}",
    scryfall_id: "74b1eae0-1bf8-4922-a9e3-45c01ece9005",
    image_url: "https://cards.scryfall.io/normal/front/7/4/74b1eae0-1bf8-4922-a9e3-45c01ece9005.jpg?1594734796",
    oracleText: "Vigilance, protection from multicolored.\nWhen Basri's Lieutenant enters the battlefield, put a +1/+1 counter on target creature you control.\nWhenever Basri's Lieutenant or another creature you control dies, if it had a +1/+1 counter on it, create a 2/2 white Knight creature token with vigilance.",
    colors: ["W"],
    types: ["Creature"],
    subtypes: ["Human", "Knight"],
    power: "3",
    toughness: "4",
    keywords: ["Vigilance", "Protection from multicolored"],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            targetDefinition: { type: TargetType.Creature, count: 1, restrictions: [Restriction.YouControl] },
            effects: [{ type: EffectType.AddCounters, counterType: '+1/+1', amount: 1, targetMapping: TargetMapping.Target1 }]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Death,
            condition: 'PLAYER_IS_CONTROLLER_AND_OBJECT_HAD_P1P1_COUNTER',
            effects: [
                {
                    type: EffectType.CreateToken,
                    tokenBlueprint: {
                        name: 'Knight',
                        power: "2",
                        toughness: "2",
                        colors: ['W'],
                        types: ['Creature'],
                        subtypes: ['Knight'],
                        keywords: ['Vigilance'],
                        image_url: 'https://cards.scryfall.io/large/front/e/0/e0da097d-69fa-47de-bacc-3918451f7bb9.jpg?1594733534'
                    },
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};
