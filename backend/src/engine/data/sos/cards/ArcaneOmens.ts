import { CardDefinition, AbilityType, EffectType, TargetMapping } from '@shared/engine_types';

export const ArcaneOmens: CardDefinition = {
    "name": "Arcane Omens",
    "manaCost": "{4}{B}",
    "colors": [
        "B"
    ],
    "types": [
        "Sorcery"
    ],
    "subtypes": [],
    "oracleText": "Converge — Target player discards X cards, where X is the number of colors of mana spent to cast this spell.",
    "abilities": [
        {
            type: AbilityType.Spell,
            targetDefinition: { type: 'Player' },
            effects: [
                {
                    type: EffectType.DiscardCards,
                    amount: 'CONVERGE_AMOUNT',
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};


