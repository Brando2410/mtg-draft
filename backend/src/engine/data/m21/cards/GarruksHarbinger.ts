import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const GarruksHarbinger: Record<string, ImplementableCard> = {
    "Garruk's Harbinger": {
        name: "Garruk's Harbinger",
        manaCost: "{1}{G}{G}",
        oracleText: "Hexproof from black\nWhenever this creature deals combat damage to a player or planeswalker, look at that many cards from the top of your library. You may reveal a creature card or Garruk planeswalker card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.",
        colors: ["green"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Beast"],
        power: "4",
        toughness: "3",
        keywords: ["Hexproof"],
        abilities: [
            {
                id: "harbinger_trigger",
                type: AbilityType.Triggered,
                activeZone: ZoneRequirement.Battlefield,
                    eventMatch: ['ON_DAMAGE_TAKED', 'ON_DAMAGE_PLAYER'],
                condition: (state: any, event: any, t: any) => {
                    // Deal combat damage to player or planeswalker
                    if (event.sourceId !== t.sourceId || !event.data?.isCombat) return false;

                    const target = state.players[event.targetId] || state.battlefield.find((o: any) => o.id === event.targetId);
                    if (!target) return false;

                    if (state.players[event.targetId]) return true; // It's a player
                    return (target as any).definition.types.some((type: string) => type.toLowerCase() === 'planeswalker');
                },
                effects: [
                    {
                        type: EffectType.LookAtTopAndPick,
                        amount: 'EVENT_AMOUNT',
                        targetMapping: 'CONTROLLER',
                        reveal: true,
                        optional: true,
                        hideUndo: true,
                        restrictions: [
                            'creature',
                            { types: ['planeswalker'], nameIncludes: 'Garruk' }
                        ],
                        remainderZone: Zone.Library,
                        libraryPosition: 'bottom',
                        shuffleRemainder: true
                    }
                ]
            }
        ]
    }
};


