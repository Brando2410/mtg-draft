import { CardDefinition, AbilityType, EffectType, TargetMapping, DurationType, TriggerEvent, Zone } from '@shared/engine_types';

export const Daydream: CardDefinition = {
    "name": "Daydream",
    "manaCost": "{W}",
    "colors": [
        "W"
    ],
    "types": [
        "Sorcery"
    ],
    "subtypes": [],
    "oracleText": "Exile target creature you control, then return that card to the battlefield under its owner's control with a +1/+1 counter on it.\nFlashback {2}{W} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
    "flashbackCost": "{2}{W}",
    "abilities": [
        {
            type: AbilityType.Spell,
            targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature', 'YouControl'] },
            effects: [
                {
                    type: EffectType.Exile,
                    targetMapping: TargetMapping.Target1,
                    next: {
                        type: EffectType.PutOnBattlefield,
                        targetMapping: TargetMapping.Target1,
                        startingCounters: { type: '+1/+1', amount: 1 }
                    }
                }
            ]
        }
    ]
};
