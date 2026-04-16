import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';

export const GeometersArthropod: CardDefinition = {
    "name": "Geometer's Arthropod",
    "manaCost": "{G}{U}",
    "colors": [
        "G",
        "U"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Fractal",
        "Crab"
    ],
    "oracleText": "Whenever you cast a spell with {X} in its mana cost, look at the top X cards of your library. Put one of them into your hand and the rest on the bottom of your library in a random order.",
    "abilities": [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastSpell,
            condition: 'PLAYER_IS_CONTROLLER && EVENT_OBJECT_HAS_X',
            effects: [
                {
                    type: EffectType.LookAtTopAndPick,
                    fromTop: DynamicAmount.X, // In this context, the engine should resolve X from the event object
                    targetMapping: TargetMapping.Controller,
                    remainderZone: Zone.Library,
                    remainderPosition: 'bottom'
                }
            ]
        }
    ],
    "power": "1",
    "toughness": "4"
};





