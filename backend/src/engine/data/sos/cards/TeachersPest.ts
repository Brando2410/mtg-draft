import { CardDefinition, AbilityType, EffectType, TargetMapping, TriggerEvent, Zone, ZoneRequirement } from '@shared/engine_types';

export const TeachersPest: CardDefinition = {
    "name": "Teacher's Pest",
    "manaCost": "{B}{G}",
    "colors": ["B", "G"],
    "types": ["Creature"],
    "subtypes": ["Pest"],
    "keywords": ["Menace"],
    "power": "1",
    "toughness": "1",
    "oracleText": "Menace\nWhenever this creature attacks, you gain 1 life.\n{B}{G}: Return this card from your graveyard to the battlefield tapped.",
    "abilities": [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Attack,
            effects: [
                { type: EffectType.GainLife, amount: 1, targetMapping: TargetMapping.Controller }
            ]
        },
        {
            type: AbilityType.Activated,
            activeZone: ZoneRequirement.Graveyard,
            costs: [
                { type: 'Mana', value: '{B}{G}' }
            ],
            effects: [
                {
                    type: EffectType.MoveToZone,
                    zone: Zone.Battlefield,
                    targetMapping: TargetMapping.Self,
                    tapped: true
                }
            ]
        }
    ]
};
