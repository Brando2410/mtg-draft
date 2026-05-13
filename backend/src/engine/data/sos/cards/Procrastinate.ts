import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
    export const Procrastinate: CardDefinition = {
    name: 'Procrastinate',
    manaCost: '{X}{U}',


    colors: ['U'],
    types: ['Instant'],
    subtypes: [],
    keywords: [],
    oracleText: 'Tap target creature. Put twice X stun counters on it.',
    abilities: [
    {
      type: AbilityType.Spell,
      targetDefinitions: [{
        type: TargetType.Creature
      }],
      effects: [
        {
          type: EffectType.Tap,
          targetMapping: TargetMapping.Target1
        },
        {
          type: EffectType.AddCounters,
          counterType: 'stun',
          amount: {
            type: 'X_VALUE',
            multiplier: 2
          },
          targetMapping: TargetMapping.Target1
        }
      ]
    }
  ],
    scryfall_id: "1edb449d-620f-4e21-9d76-2c840635eb9d",
    image_url: "https://cards.scryfall.io/normal/front/1/e/1edb449d-620f-4e21-9d76-2c840635eb9d.jpg?1775937356",
    rarity: "common"
};

