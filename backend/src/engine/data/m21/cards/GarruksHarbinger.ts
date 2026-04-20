import { AbilityType, CardDefinition, ConditionType, EffectType, Restriction, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';

export const GarruksHarbinger: CardDefinition = {
    name: "Garruk's Harbinger",
    manaCost: "{1}{G}{G}",
    scryfall_id: "9e0fa0b6-5f3f-4669-84e8-2c38c9593d88",
    image_url: "https://cards.scryfall.io/normal/front/9/e/9e0fa0b6-5f3f-4669-84e8-2c38c9593d88.jpg?1595022082",
    oracleText: "Hexproof from black\nWhenever this creature deals combat damage to a player or planeswalker, look at that many cards from the top of your library. You may reveal a creature card or Garruk planeswalker card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.",
    colors: ["G"],
    types: ["Creature"],
    subtypes: ["Beast"],
    power: "4",
    toughness: "3",
    keywords: ["Hexproof from black"],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CombatDamagePlayer,
            condition: ConditionType.EventObjectIsTriggerSource,
            effects: [
                {
                    type: EffectType.LookAtTopAndPick,
                    amount: 'EVENT_DAMAGE_AMOUNT',
                    pickCount: 1,
                    optional: true,
                    reveal: true,
                    restrictions: [
                        {
                            type: Restriction.Any,
                            restrictions: [
                                Restriction.Creature,
                                {
                                    type: Restriction.All,
                                    restrictions: [
                                        Restriction.Planeswalker,
                                        Restriction.Garruk
                                    ]
                                }
                            ]
                        }
                    ],
                    remainderZone: Zone.Library,
                    remainderPosition: 'bottom',
                    random: true,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};
