import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const InfusewithVitality: CardDefinition = {
    name: 'Infuse with Vitality',
    manaCost: '{B}{G}',
    colors: ['B', 'G'],
    types: ['Instant'],
    oracleText: 'Until end of turn, target creature gains deathtouch and "When this creature dies, return it to the battlefield tapped under its owner\'s control and you gain 2 life."',
    abilities: [
      {
        type: AbilityType.Spell,
        targetDefinition: {
            count: 1,
            type: TargetType.Permanent,
            restrictions: [{ type: 'Type', value: 'Creature' }]
        },
        effects: [
          { type: EffectType.ApplyContinuousEffect, duration: 'UNTIL_END_OF_TURN', effects: [{ type: 'GainKeyword', keyword: 'Deathtouch' }], targetMapping: TargetMapping.Target1 },
          {
              type: EffectType.ApplyContinuousEffect,
              duration: 'UNTIL_END_OF_TURN',
              abilitiesToAdd: [{
                  id: 'infuse_vitality_death_trigger',
                  type: AbilityType.Triggered,
                  eventMatch: TriggerEvent.Death,
                  effects: [
                      { type: EffectType.MoveToZone, zone: Zone.Battlefield, entersTapped: true, targetMapping: TargetMapping.Self },
                      { type: EffectType.GainLife, amount: 2, targetMapping: TargetMapping.Controller }
                  ]
              }]
          }
        ]
      }
    ]
  };
