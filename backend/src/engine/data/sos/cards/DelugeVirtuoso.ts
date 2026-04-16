import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const DelugeVirtuoso: CardDefinition = {
    "name": "Deluge Virtuoso",
    "manaCost": "{1}{U}{R}",
    "colors": [
        "R",
        "U"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Efreet",
        "Wizard"
    ],
    "keywords": [
        "Prowess"
    ],
    "oracleText": "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)\nWhenever you cast an instant or sorcery spell, target creature an opponent controls gets -1/-1 until end of turn.",
    "abilities": [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.CastInstantOrSorcery,
            condition: 'PLAYER_IS_CONTROLLER',
            targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature', 'OpponentControl'] },
            effects: [
                { type: EffectType.ApplyContinuousEffect, sublayer: 'Stats', powerModifier: -1, toughnessModifier: -1, duration: { type: DurationType.UntilEndOfTurn }, targetMapping: TargetMapping.Target1 }
            ]
        }
    ],
    "power": "2",
    "toughness": "3"
};





