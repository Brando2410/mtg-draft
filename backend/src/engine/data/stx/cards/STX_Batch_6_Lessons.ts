import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const STX_Batch_6_Lessons: CardDefinition[] = [
  {
    name: 'Environmental Sciences',
    manaCost: '{2}',
    colors: [],
    types: ['Sorcery'],
    subtypes: ['Lesson'],
    oracleText: 'Search your library for a basic land card, reveal it, put it into your hand, then shuffle. You gain 2 life.',
    abilities: [
      {
        type: AbilityType.Spell,
        effects: [
          {
            type: EffectType.SearchLibrary,
            targetDefinition: {
              type: TargetType.Land,
              count: 1,
              restrictions: ['Basic']
            },
            zone: Zone.Hand,
            reveal: true,
            targetMapping: TargetMapping.Controller
          },
          { type: EffectType.GainLife, amount: 2 }
        ]
      }
    ]
  },
  {
    name: 'Introduction to Prophecy',
    manaCost: '{3}',
    colors: [],
    types: ['Sorcery'],
    subtypes: ['Lesson'],
    oracleText: 'Scry 2, then draw a card.',
    abilities: [
      {
        type: AbilityType.Spell,
        effects: [
          { type: EffectType.Scry, amount: 2 },
          { type: EffectType.DrawCards, amount: 1 }
        ]
      }
    ]
  },
  {
    name: 'Introduction to Annihilation',
    manaCost: '{5}',
    colors: [],
    types: ['Sorcery'],
    subtypes: ['Lesson'],
    oracleText: 'Exile target nonland permanent. Its controller draws a card.',
    abilities: [
      {
        type: AbilityType.Spell,
        targetDefinition: {
          count: 1,
          type: TargetType.NonlandPermanent,
        },
        effects: [
          { type: EffectType.Exile, targetMapping: TargetMapping.Target1 },
          { type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Target1Controller }
        ]
      }
    ]
  },
  {
    name: 'Expanded Anatomy',
    manaCost: '{3}',
    colors: [],
    types: ['Sorcery'],
    subtypes: ['Lesson'],
    oracleText: 'Put two +1/+1 counters on target creature. It gains vigilance until end of turn.',
    abilities: [
      {
        type: AbilityType.Spell,
        targetDefinition: {
          count: 1,
          type: TargetType.Creature,
        },
        effects: [
          { type: EffectType.AddCounters, counterType: 'P1P1', amount: 2, targetMapping: TargetMapping.Target1 },
          { type: EffectType.ApplyContinuousEffect, duration: 'UNTIL_END_OF_TURN', abilitiesToAdd: ['Vigilance'], targetMapping: TargetMapping.Target1 }
        ]
      }
    ]
  },
  {
    name: 'Fractal Summoning',
    manaCost: '{X}{G/U}',
    colors: ['G', 'U'],
    types: ['Sorcery'],
    subtypes: ['Lesson'],
    oracleText: 'Create a 0/0 green and blue Fractal creature token. Put X +1/+1 counters on it.',
    abilities: [
      {
        type: AbilityType.Spell,
        effects: [
          {
            type: EffectType.CreateToken,
            tokenBlueprint: {
              name: 'Fractal',
              manaCost: '',
              colors: ['G', 'U'],
              types: ['Creature', 'Token'],
              subtypes: ['Fractal'],
              power: "0",
              toughness: "0",
              image_url: 'https://cards.scryfall.io/large/front/9/1/910f48ab-b04e-4874-b31d-a86a7bc5af14.jpg?1682693894'
            },
            amount: 1,
            startingCounters: { type: 'P1P1', amount: DynamicAmount.X },
            targetMapping: TargetMapping.Controller
          }
        ]
      }
    ]
  },
  {
    name: 'Elemental Summoning',
    manaCost: '{3}{U/R}{U/R}',
    colors: ['U', 'R'],
    types: ['Sorcery'],
    subtypes: ['Lesson'],
    oracleText: 'Create a 4/4 blue and red Elemental creature token.',
    abilities: [
      {
        type: AbilityType.Spell,
        effects: [
          {
            type: EffectType.CreateToken,
            tokenBlueprint: {
              name: 'Elemental',
              manaCost: '',
              colors: ['U', 'R'],
              types: ['Creature', 'Token'],
              subtypes: ['Elemental'],
              power: "4",
              toughness: "4",
              image_url: 'https://cards.scryfall.io/large/front/3/d/3d0b9b88-705e-4df0-8a93-3e240b81355b.jpg?1682693891'
            },
            amount: 1,
            targetMapping: TargetMapping.Controller
          }
        ]
      }
    ]
  },
  {
    name: 'Inkling Summoning',
    manaCost: '{1}{W/B}{W/B}',
    colors: ['W', 'B'],
    types: ['Sorcery'],
    subtypes: ['Lesson'],
    oracleText: 'Create a 2/1 white and black Inkling creature token with flying.',
    abilities: [
      {
        type: AbilityType.Spell,
        effects: [
          {
            type: EffectType.CreateToken,
            tokenBlueprint: {
              name: 'Inkling',
              manaCost: '',
              colors: ['W', 'B'],
              types: ['Creature', 'Token'],
              subtypes: ['Inkling'],
              power: "2",
              toughness: "1",
              keywords: ['Flying'],
              image_url: 'https://cards.scryfall.io/large/front/c/9/c9deae5c-80d4-4701-b425-91853b7ee03b.jpg?1682693898'
            },
            amount: 1,
            targetMapping: TargetMapping.Controller
          }
        ]
      }
    ]
  },
  {
    name: 'Pest Summoning',
    manaCost: '{1}{B/G}{B/G}',
    colors: ['B', 'G'],
    types: ['Sorcery'],
    subtypes: ['Lesson'],
    oracleText: 'Create two 1/1 black and green Pest creature tokens with "When this creature dies, you gain 1 life."',
    abilities: [
      {
        type: AbilityType.Spell,
        effects: [
          {
            type: EffectType.CreateToken,
            tokenBlueprint: {
              name: 'Pest',
              manaCost: '',
              colors: ['B', 'G'],
              types: ['Creature', 'Token'],
              subtypes: ['Pest'],
              power: "1",
              toughness: "1",
              image_url: 'https://cards.scryfall.io/large/front/d/0/d0ddbe3e-4a66-494d-9304-7471232549bf.jpg?1682693901',
              oracleText: 'When this creature dies, you gain 1 life.',
              abilities: [{
                type: AbilityType.Triggered,
                eventMatch: TriggerEvent.Death,
                effects: [{ type: EffectType.GainLife, amount: 1, targetMapping: TargetMapping.Controller }]
              }]
            },
            amount: 2,
            targetMapping: TargetMapping.Controller
          }
        ]
      }
    ]
  },
  {
    name: 'Spirit Summoning',
    manaCost: '{1}{R/W}{R/W}',
    colors: ['R', 'W'],
    types: ['Sorcery'],
    subtypes: ['Lesson'],
    oracleText: 'Create a 3/2 red and white Spirit creature token.',
    abilities: [
      {
        type: AbilityType.Spell,
        effects: [
          {
            type: EffectType.CreateToken,
            tokenBlueprint: {
              name: 'Spirit',
              manaCost: '',
              colors: ['R', 'W'],
              types: ['Creature', 'Token'],
              subtypes: ['Spirit'],
              power: "3",
              toughness: "2",
              image_url: 'https://cards.scryfall.io/large/front/f/9/f98c0167-7434-4607-87c4-315fa8b6972e.jpg?1682693862'
            },
            amount: 1,
            targetMapping: TargetMapping.Controller
          }
        ]
      }
    ]
  }
];


