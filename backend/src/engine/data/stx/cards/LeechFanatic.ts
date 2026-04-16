import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const LeechFanatic: CardDefinition = {
    name: 'Leech Fanatic',
    manaCost: '{1}{B}',
    colors: ['B'],
    types: ['Creature'],
    subtypes: ['Human', 'Warlock'],
    power: "2",
    toughness: "2",
    oracleText: 'Whenever Leech Fanatic attacks, you may pay 2 life. If you do, it gains lifelink until end of turn.',
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Attack,
            condition: 'SelfAttacking',
            effects: [{
                type: EffectType.Choice,
                label: "Pay 2 life for lifelink?",
                optional: true,
                choices: [{
                    label: "Pay 2 Life",
                    costs: [{ type: 'Life', value: 2 }],
                    effects: [{ type: EffectType.ApplyContinuousEffect, targetMapping: TargetMapping.Self, duration: 'UNTIL_END_OF_TURN', abilitiesToAdd: ['Lifelink'] }]
                }]
            }]
        }
    ]
  };


