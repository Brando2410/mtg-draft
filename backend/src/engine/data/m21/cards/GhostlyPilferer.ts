import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const GhostlyPilferer: Record<string, ImplementableCard> = {
    "Ghostly Pilferer": {
        name: "Ghostly Pilferer",
        manaCost: "{1}{U}",
        oracleText: "Whenever this creature becomes untapped, you may pay {2}. If you do, draw a card.\nWhenever an opponent casts a spell from anywhere other than their hand, draw a card.\nDiscard a card: This creature can't be blocked this turn.",
        colors: ["blue"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Spirit","Rogue"],
        power: "2",
        toughness: "1",
        keywords: [],
        abilities: [
            {
                id: "ghostly_pilferer_untap_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_UNTAP',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => event.playerId !== source.controllerId,
                effects: [{ type: 'Choice', label: 'Pay {2} to draw?', costs: [{ type: 'Mana', value: '{2}' }], effects: [{ type: 'DrawCards', amount: 1, targetMapping: 'CONTROLLER' }] }]
            },
            {
                id: "ghostly_pilferer_cast_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_OPPONENT_CAST_NON_HAND',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => event.playerId !== source.controllerId,
                effects: [{ type: 'DrawCards', amount: 1, targetMapping: 'CONTROLLER' }]
            }
        ]
    }
};
