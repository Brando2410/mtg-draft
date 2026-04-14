import { CardDefinition, AbilityType, EffectType, TargetMapping, DurationType } from '@shared/engine_types';

export const DuelTactics: CardDefinition = {
    "name": "Duel Tactics",
    "manaCost": "{R}",
    "colors": [
        "R"
    ],
    "types": [
        "Sorcery"
    ],
    "subtypes": [],
    "keywords": [
        "Flashback"
    ],
    "flashbackCost": "{1}{R}",
    "oracleText": "Duel Tactics deals 1 damage to target creature. It can't block this turn.\nFlashback {1}{R} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
    "abilities": [
        {
            type: AbilityType.Spell,
            flashbackCost: "{1}{R}",
            targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature'] },
            effects: [
                { type: EffectType.DealDamage, amount: 1, targetMapping: TargetMapping.Target1 },
                {
                    type: EffectType.ApplyContinuousEffect,
                    duration: { type: DurationType.UntilEndOfTurn },
                    restrictions: [{ type: 'CannotBlock' }],
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};
