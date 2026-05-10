import { AbilityType, CardDefinition, ConditionType, EffectType, Restriction, TargetMapping, TargetType } from '@shared/engine_types';

export const MortalitySpear: CardDefinition = {
  name: 'Mortality Spear',
  manaCost: '{2}{B}{G}',

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
        type: TargetType.NonlandPermanent
      }],
      effects: [{ type: EffectType.Destroy, targetMapping: TargetMapping.Target1 }]
    }
  ],
    scryfall_id: "f6cdff9b-bb09-45b9-aa3c-16a3136d183c",
    image_url: "https://cards.scryfall.io/normal/front/f/6/f6cdff9b-bb09-45b9-aa3c-16a3136d183c.jpg?1775941844",
    rarity: "uncommon"
};

