import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const GarruksHarbinger: CardDefinition = {
    name: "Garruk's Harbinger",
    manaCost: "{1}{G}{G}",
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
            eventMatch: [TriggerEvent.DamageDealtToPlayer, TriggerEvent.DamageTaken],
            condition: 'SELF_COMBAT_DAMAGE_PLAYER_OR_PLANESWALKER',
            effects: [
                {
                    type: EffectType.LookAtTopAndPick,
                    fromTop: 'EVENT_AMOUNT',
                    amount: 1,
                    optional: true,
                    reveal: true,
                    sourceZones: [Zone.Library],
                    targetDefinition: {
                        type: TargetType.Card,
                        count: 1,
                        restrictions: [
                            {
                                type: 'LogicAny',
                                restrictions: [
                                    { type: 'Type', value: 'Creature' },
                                    {
                                        type: 'LogicAll',
                                        restrictions: [
                                            { type: 'Type', value: 'Planeswalker' },
                                            { type: 'Subtype', value: 'Garruk' }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    zone: Zone.Hand,
                    remainderZone: Zone.Library,
                    remainderPosition: 'bottom',
                    shuffleRemainder: true,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};
