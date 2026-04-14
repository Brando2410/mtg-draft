import { CardDefinition, AbilityType, EffectType, Zone, TriggerEvent, TargetType, TargetMapping } from '@shared/engine_types';

export const STX_Batch_7_Learn_Spells: CardDefinition[] = [
  {
    name: 'Eyetwitch',
    manaCost: '{B}',
    colors: ['B'],
    types: ['Creature'],
    subtypes: ['Eye'],
    power: '1',
    toughness: '1',
    keywords: ['Flying'],
    oracleText: 'Flying\nWhen Eyetwitch dies, learn.',
    abilities: [
      {
        type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Death,
        effects: [{ type: EffectType.Learn }]
      }
    ]
  },
  {
    name: 'Hunt for Specimens',
    manaCost: '{1}{B}',
    colors: ['B'],
    types: ['Sorcery'],
    oracleText: 'Create a 1/1 black and green Pest creature token with "When this creature dies, you gain 1 life."\nLearn.',
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
              oracleText: 'When this creature dies, you gain 1 life.',
              abilities: [{
                  type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Death,
                  effects: [{ type: EffectType.GainLife, amount: 1, targetMapping: TargetMapping.Controller }]
              }]
            },
            amount: 1
          },
          { type: EffectType.Learn }
        ]
      }
    ]
  },
  {
    name: 'Pop Quiz',
    manaCost: '{2}{U}',
    colors: ['U'],
    types: ['Instant'],
    oracleText: 'Draw a card.\nLearn.',
    abilities: [
      {
        type: AbilityType.Spell,
        effects: [
          { type: EffectType.DrawCards, amount: 1 },
          { type: EffectType.Learn }
        ]
      }
    ]
  },
  {
    name: 'Field Trip',
    manaCost: '{2}{G}',
    colors: ['G'],
    types: ['Sorcery'],
    oracleText: 'Search your library for a basic Forest card, reveal it, put it into your hand, then shuffle.\nLearn.',
    abilities: [
      {
        type: AbilityType.Spell,
        effects: [
          {
            type: EffectType.SearchLibrary,
            restrictions: [{ type: 'Type', value: 'Land' }, { type: 'Subtype', value: 'Basic' }, { type: 'Subtype', value: 'Forest' }],
            destination: Zone.Hand,
            reveal: true,
            shuffle: true
          },
          { type: EffectType.Learn }
        ]
      }
    ]
  },
  {
    name: 'Guiding Voice',
    manaCost: '{W}',
    colors: ['W'],
    types: ['Sorcery'],
    oracleText: 'Put a +1/+1 counter on target creature.\nLearn.',
    abilities: [
      {
        type: AbilityType.Spell,
        targetDefinition: {
            count: 1,
            type: TargetType.Permanent,
            restrictions: [{ type: 'Type', value: 'Creature' }]
        },
        effects: [
          { type: EffectType.AddCounters, counterType: 'P1P1', amount: 1, targetMapping: TargetMapping.Target1 },
          { type: EffectType.Learn }
        ]
      }
    ]
  },
  {
    name: 'Cram Session',
    manaCost: '{1}{B/G}',
    colors: ['B', 'G'],
    types: ['Sorcery'],
    oracleText: 'You gain 2 life.\nLearn.',
    abilities: [
      {
        type: AbilityType.Spell,
        effects: [
          { type: EffectType.GainLife, amount: 2, targetMapping: TargetMapping.Controller },
          { type: EffectType.Learn }
        ]
      }
    ]
  },
  {
      name: 'Professor of Symbology',
      manaCost: '{1}{W}',
      colors: ['W'],
      types: ['Creature'],
      subtypes: ['Kor', 'Cleric'],
      power: "2",
      toughness: "1",
      oracleText: "When Professor of Symbology enters the battlefield, learn.",
      abilities: [
          {
              type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
              effects: [{ type: EffectType.Learn }]
          }
      ]
  },
  {
      name: 'Study Break',
      manaCost: '{1}{W}',
      colors: ['W'],
      types: ['Instant'],
      oracleText: "Tap up to two target creatures. Learn.",
      abilities: [
          {
              type: AbilityType.Spell,
              targetDefinition: {
                  count: 2,
                  type: TargetType.Permanent,
                  restrictions: [{ type: 'Type', value: 'Creature' }],
                  minCount: 0
              },
              effects: [
                  { type: EffectType.Tap, targetMapping: TargetMapping.TargetAll },
                  { type: EffectType.Learn }
              ]
          }
      ]
  },
  {
      name: 'Enthusiastic Study',
      manaCost: '{1}{R}',
      colors: ['R'],
      types: ['Instant'],
      oracleText: "Target creature gets +3/+1 and gains trample until end of turn. Learn.",
      abilities: [
          {
              type: AbilityType.Spell,
              targetDefinition: {
                  count: 1,
                  type: TargetType.Permanent,
                  restrictions: [{ type: 'Type', value: 'Creature' }]
              },
              effects: [
                  {
                      type: EffectType.ApplyContinuousEffect,
                      duration: 'UNTIL_END_OF_TURN',
                      powerModifier: 3,
                      toughnessModifier: 1,
                      abilitiesToAdd: ['Trample'],
                      targetMapping: TargetMapping.Target1
                  },
                  { type: EffectType.Learn }
              ]
          }
      ]
  },
  {
    name: 'Containment Breach',
    manaCost: '{2}{G}',
    colors: ['G'],
    types: ['Sorcery'],
    subtypes: ['Lesson'],
    oracleText: 'Exile target artifact or enchantment with mana value 2 or less. Create a 1/1 black and green Pest creature token with "When this creature dies, you gain 1 life."',
    abilities: [
      {
        type: AbilityType.Spell,
        targetDefinition: {
            count: 1,
            type: TargetType.Permanent,
            restrictions: [
                { type: 'Any', restrictions: [{ type: 'Type', value: 'Artifact' }, { type: 'Type', value: 'Enchantment' }] },
                { type: 'Attribute', attribute: 'ManaValue', value: 2, comparison: 'LE' }
            ]
        },
        effects: [
          { type: EffectType.Exile, targetMapping: TargetMapping.Target1 },
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
              oracleText: 'When this creature dies, you gain 1 life.',
              abilities: [{
                  type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Death,
                  effects: [{ type: EffectType.GainLife, amount: 1, targetMapping: TargetMapping.Controller }]
              }]
            },
            amount: 1
          }
        ]
      }
    ]
  },
  {
    name: 'Necrotic Fumes',
    manaCost: '{1}{B}',
    colors: ['B'],
    types: ['Sorcery'],
    subtypes: ['Lesson'],
    oracleText: 'As an additional cost to cast this spell, exile a creature you control.\nExile target creature or planeswalker.',
    abilities: [
      {
          type: AbilityType.Spell,
          additionalCosts: [
              {
                  type: 'Exile', 
                  restriction: { type: 'Type', value: 'Creature', source: 'CONTROLLER' }
              }
          ],
          targetDefinition: {
              count: 1,
              type: TargetType.Permanent,
              restrictions: [{ type: 'Any', restrictions: [{ type: 'Type', value: 'Creature' }, { type: 'Type', value: 'Planeswalker' }] }]
          },
          effects: [{ type: EffectType.Exile, targetMapping: TargetMapping.Target1 }]
      }
    ]
  }
];

