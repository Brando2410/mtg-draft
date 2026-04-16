import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const BloodAgeGeneral: CardDefinition = {
    name: 'Blood-Age General',
    manaCost: '{1}{R}',
    colors: ['R'],
    types: ['Creature'],
    subtypes: ['Spirit', 'Warrior'],
    power: '2',
    toughness: '2',
    oracleText: 'Whenever Blood-Age General attacks, other Spirits you control get +1/+0 until end of turn.',
    abilities: [
      {
        type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Attack,
        effects: [{
            type: EffectType.ApplyContinuousEffect,
            powerModifier: 1,
            duration: 'UNTIL_END_OF_TURN',
            targetMapping: TargetMapping.OtherCreaturesYouControl,
            restrictions: [{ type: 'Subtype', value: 'Spirit' }]
        }]
      }
    ]
  };


