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
            activeZone: Zone.Battlefield,
            condition: (state: any, event: any, source: any) => {
                if (event.sourceId !== source.id || !event.data?.isCombat) return false;
                // Target must be a player OR a planeswalker
                const targetObj = state.battlefield.find((o: any) => o.id === event.targetId);
                const isPlayer = !!state.players[event.targetId];
                const isPlaneswalker = targetObj && targetObj.definition.types.some((t: string) => t.toLowerCase() === 'planeswalker');
                return isPlayer || isPlaneswalker;
            },
            effects: [
                {
                    type: EffectType.LookAtTopAndPick,
                    fromTop: (state: any, event: any) => event.amount,
                    amount: 1,
                    optional: true,
                    reveal: true,
                    targetDefinition: {
                        type: TargetType.Card,
                        count: 1,
                        restrictions: [
                            {
                                type: 'Any',
                                restrictions: [
                                    'Creature',
                                    { type: 'All', restrictions: ['Planeswalker', 'Garruk'] }
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
