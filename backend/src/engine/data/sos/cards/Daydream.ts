import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

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
    "keywords": ["Flashback"],
    "oracleText": "Exile target creature you control, then return that card to the battlefield under its owner's control with a +1/+1 counter on it.\nFlashback {2}{W} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
    "flashbackCost": "{2}{W}",
    "abilities": [
        {
            type: AbilityType.Spell,
            flashbackCost: "{2}{W}",
            targetDefinition: { type: TargetType.Creature, count: 1, restrictions: ['YouControl'] },
            effects: [
                {
                    type: EffectType.Exile,
                    targetMapping: TargetMapping.Target1,
                    next: {
                        type: EffectType.PutOnBattlefield,
                        targetMapping: TargetMapping.Target1,
                        startingCounters: { counterType: 'P1P1', amount: 1 }
                    }
                }
            ]
        }
    ]
};



