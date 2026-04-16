import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const ProfessorDellianFel: CardDefinition = {
  name: 'Professor Dellian Fel',
  manaCost: '{2}{W}{B}',
  colors: ['W', 'B'],
  types: ['Legendary', 'Planeswalker'],
  subtypes: ['Dellian'],
  oracleText: '+2: You gain 3 life.\n0: Draw a card and you lose 1 life.\n−3: Destroy target creature.\n−6: You get an emblem with "Whenever you gain life, target opponent loses that much life."',
  loyalty: '5',
  abilities: [
    {
      type: AbilityType.Activated,
      costs: [{ type: 'Loyalty', value: '+2' }],
      effects: [
        {
          type: EffectType.GainLife,
          amount: 3,
          targetMapping: TargetMapping.Controller
        }
      ]
    },
    {
      type: AbilityType.Activated,
      costs: [{ type: 'Loyalty', value: '0' }],
      effects: [
        {
          type: EffectType.DrawCards,
          amount: 1,
          targetMapping: TargetMapping.Controller
        },
        {
          type: EffectType.LoseLife,
          amount: 1,
          targetMapping: TargetMapping.Controller
        }
      ]
    },
    {
      type: AbilityType.Activated,
      costs: [{ type: 'Loyalty', value: '-3' }],
      targetDefinition: {
        type: TargetType.Creature,
      },
      effects: [
        {
          type: EffectType.Destroy,
          targetMapping: TargetMapping.Target1
        }
      ]
    },
    {
      type: AbilityType.Activated,
      costs: [{ type: 'Loyalty', value: '-6' }],
      effects: [
        {
          type: EffectType.CreateEmblem,
          emblemBlueprint: {
            name: "Professor Dellian Fel Emblem",
            oracleText: "Whenever you gain life, target opponent loses that much life.",
            abilities: [
              {
                type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.LifeGain,
                condition: ConditionType.PlayerIsController,
                targetDefinition: {
                  type: TargetType.Player,
                  restrictions: ['opponent'],
                  mapping: TargetMapping.Target1
                },
                effects: [
                  {
                    type: EffectType.LoseLife,
                    amount: 'EVENT_AMOUNT',
                    targetMapping: TargetMapping.Target1
                  }
                ]
              }
            ]
          }
        }
      ]
    }
  ]
};




