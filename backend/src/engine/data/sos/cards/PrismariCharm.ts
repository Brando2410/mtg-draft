import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
export const PrismariCharm: CardDefinition = {
  name: 'Prismari Charm',
  manaCost: '{U}{R}',


  colors: ['U', 'R'],
  types: ['Instant'],
  subtypes: [],
  keywords: [],
  oracleText: 'Choose one —\n• Surveil 2, then draw a card.\n• Prismari Charm deals 1 damage to each of one or two targets.\n• Return target nonland permanent to its owner\'s hand.',
  abilities: [
    {
      type: AbilityType.Spell,
      modes: [
        {
          label: 'Surveil 2, then draw a card',
          effects: [
            { type: EffectType.Surveil, amount: 2 },
            { type: EffectType.DrawCards, amount: 1 }
          ]
        },
        {
          label: 'Deal 1 damage to each of one or two targets',
          targetDefinitions: [{
            count: 2,
            minCount: 1,
            type: TargetType.AnyTarget
          }],
          effects: [
            {
              type: EffectType.DealDamage,
              amount: 1,
              targetMapping: TargetMapping.TargetAll
            }
          ]
        },
        {
          label: 'Return target nonland permanent to its owner\'s hand',
          targetDefinitions: [{
            type: TargetType.NonlandPermanent,
            count: 1
          }],
          effects: [
            {
              type: EffectType.ReturnToHand,
              targetMapping: TargetMapping.Target1
            }
          ]
        }
      ]
    }
  ],
    scryfall_id: "8f6c2a5e-fe13-407c-aadd-c9caf2884ff1",
    image_url: "https://cards.scryfall.io/normal/front/8/f/8f6c2a5e-fe13-407c-aadd-c9caf2884ff1.jpg?1775938465",
    rarity: "uncommon"
};

