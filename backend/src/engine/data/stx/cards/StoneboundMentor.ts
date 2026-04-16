import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const StoneboundMentor: CardDefinition = {
    name: 'Stonebound Mentor',
    manaCost: '{1}{R}{W}',
    colors: ['R', 'W'],
    types: ['Creature'],
    subtypes: ['Spirit', 'Advisor'],
    power: '3',
    toughness: '3',
    oracleText: 'Whenever one or more cards leave your graveyard, scry 1. This ability triggers only once each turn.',
    abilities: [
      {
        type: AbilityType.Triggered,
                    eventMatch: 'ON_LEAVE_GRAVEYARD',
        maxTriggersPerTurn: 1,
        effects: [{ type: EffectType.Scry, amount: 1 }]
      }
    ]
  };


