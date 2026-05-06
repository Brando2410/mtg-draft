import { AbilityType, CardDefinition, ConditionType, EffectType, Restriction, TargetMapping, TargetType } from '@shared/engine_types';

export const MortalitySpear: CardDefinition = {
  name: 'Mortality Spear',
  manaCost: '{2}{B}{G}',
  scryfall_id: "f1f39fe7-dc12-49c9-80ac-4135dc1f8f08",
  image_url: "https://cards.scryfall.io/normal/front/f/1/f1f39fe7-dc12-49c9-80ac-4135dc1f8f08.jpg?1627429727",
  colors: ['B', 'G'],
  types: ['Instant'],
  oracleText: 'This spell costs {2} less to cast if you gained life this turn.\nDestroy target nonland permanent.',
  abilities: [
    {
      type: AbilityType.Static,
      effects: [{
        type: EffectType.CostReduction,
        reductionAmount: '{2}',
        condition: ConditionType.GainLifeThisTurn
      }]
    },
    {
      type: AbilityType.Spell,
      targetDefinitions: [{
        count: 1,
        type: TargetType.NonlandPermanent,
      }],
      effects: [{ type: EffectType.Destroy, targetMapping: TargetMapping.Target1 }]
    }
  ]
};

