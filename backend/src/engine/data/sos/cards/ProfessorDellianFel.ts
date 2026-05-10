import { AbilityType, CardDefinition, ConditionType, CostType, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';
export const ProfessorDellianFel: CardDefinition = {
  name: 'Professor Dellian Fel',
  manaCost: '{2}{W}{B}',
  colors: ['W', 'B'],
  types: ['Legendary', 'Planeswalker'],
  subtypes: ['Dellian'],
  keywords: [],
  oracleText: '+2: You gain 3 life.\n0: Draw a card and you lose 1 life.\n−3: Destroy target creature.\n−6: You get an emblem with "Whenever you gain life, target opponent loses that much life."',
  loyalty: '5',
  abilities: [
    {
      type: AbilityType.Activated,
      costs: [{ type: CostType.Loyalty, value: '+2' }],
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
      costs: [{ type: CostType.Loyalty, value: '0' }],
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
      costs: [{ type: CostType.Loyalty, value: '-3' }],
      targetDefinitions: [{
        type: TargetType.Creature
      }],
      effects: [
        {
          type: EffectType.Destroy,
          targetMapping: TargetMapping.Target1
        }
      ]
    },
    {
      type: AbilityType.Activated,
      costs: [{ type: CostType.Loyalty, value: '-6' }],
      effects: [
        {
          type: EffectType.CreateEmblem,
          emblemBlueprint: {
            name: "Professor Dellian Fel Emblem",
            oracleText: "Whenever you gain life, target opponent loses that much life.",
            image_url: "https://cards.scryfall.io/normal/front/5/c/5c6b6131-482f-48d8-99cc-652309ec9880.jpg?1775828531",
            abilities: [
              {
                type: AbilityType.Triggered,
                eventMatch: TriggerEvent.LifeGain,
                condition: ConditionType.PlayerIsController,
                targetDefinitions: [{
                  type: TargetType.Player,
                  restrictions: [Restriction.Opponent],
                  mapping: TargetMapping.Target1
                }],
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
  ],
  scryfall_id: "6ff3b4d8-1271-4c5d-8834-7662244f173d",
  image_url: "https://cards.scryfall.io/normal/front/6/f/6ff3b4d8-1271-4c5d-8834-7662244f173d.jpg?1775938486",
  rarity: "mythic"
};

