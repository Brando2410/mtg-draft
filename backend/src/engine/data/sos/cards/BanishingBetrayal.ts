import { CardDefinition, AbilityType, EffectType, TargetMapping, Zone } from '@shared/engine_types';

export const BanishingBetrayal: CardDefinition = {
    "name": "Banishing Betrayal",
    "manaCost": "{1}{U}",
    "colors": [
        "U"
    ],
    "types": [
        "Instant"
    ],
    "subtypes": [],
    "oracleText": "Return target nonland permanent to its owner's hand. Surveil 1. (Look at the top card of your library. You may put it into your graveyard.)",
    "abilities": [
        {
            type: AbilityType.Spell,
            targetDefinition: { 
                type: 'Permanent', 
                restrictions: [{ type: 'Nonland' }] 
            },
            effects: [
                { 
                    type: EffectType.MoveToZone, 
                    zone: Zone.Hand, 
                    targetMapping: TargetMapping.Target1 
                },
                { 
                    type: 'Surveil', 
                    amount: 1 
                }
            ]
        }
    ]
};


