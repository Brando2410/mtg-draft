import { CardDefinition, AbilityType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const EchocastingSymposium: CardDefinition = {
    "name": "Echocasting Symposium",
    "manaCost": "{4}{U}{U}",
    "colors": [
        "U"
    ],
    "types": [
        "Sorcery"
    ],
    "subtypes": [
        "Lesson"
    ],
    "oracleText": "Target player creates a token that's a copy of target creature you control.\nParadigm (Then exile this spell. After you first resolve a spell with this name, you may cast a copy of it from exile without paying its mana cost at the beginning of each of your first main phases.)",
    "abilities": [
        {
            type: AbilityType.Spell,
            targetDefinition: [
                { type: TargetType.Player, count: 1 },
                { type: TargetType.Permanent, count: 1, restrictions: ['Creature', 'YouControl'] }
            ],
            effects: [
                { 
                    type: EffectType.CreateTokenCopy, 
                    targetMapping: TargetMapping.Target1, // Player
                    target2Mapping: TargetMapping.Target2 // Creature to copy
                },
                { type: EffectType.Paradigm }
            ]
        }
    ]
};
