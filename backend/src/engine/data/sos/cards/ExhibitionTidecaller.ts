import { CardDefinition, AbilityType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const ExhibitionTidecaller: CardDefinition = {
    "name": "Exhibition Tidecaller",
    "manaCost": "{U}",
    "colors": [
        "U"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Djinn",
        "Wizard"
    ],
    "oracleText": "Opus — Whenever you cast an instant or sorcery spell, target player mills three cards. If five or more mana was spent to cast that spell, that player mills ten cards instead.",
    "abilities": [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastSpell,
            targets: [{ type: 'Player' }],
            condition: 'PLAYER_IS_CONTROLLER && (EVENT_OBJECT_MATCHES:Instant || EVENT_OBJECT_MATCHES:Sorcery)',
            effects: [
                {
                    type: EffectType.Mill,
                    amount: 10,
                    condition: 'SPENT_MANA_GE:5',
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.Mill,
                    amount: 3,
                    condition: 'SPENT_MANA_LT:5',
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ],
    "power": "0",
    "toughness": "2"
};
