import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const RestorationSeminar: CardDefinition = {
    "name": "Restoration Seminar",
    "manaCost": "{5}{W}{W}",
    "colors": [
        "W"
    ],
    "types": [
        "Sorcery"
    ],
    "subtypes": [
        "Lesson"
    ],
    "oracleText": "Return target nonland permanent card from your graveyard to the battlefield.\nParadigm (Then exile this spell. After you first resolve a spell with this name, you may cast a copy of it from exile without paying its mana cost at the beginning of each of your first main phases.)",
    "abilities": [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.CardInGraveyard,
                count: 1,
                restrictions: ['nonland', 'Permanent']
            },
            effects: [
                {
                    type: EffectType.PutOnBattlefield,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.Paradigm,
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ]
};



