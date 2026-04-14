import { CardDefinition, AbilityType, EffectType, Zone, TargetType, TriggerEvent, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const STX_Batch_9_Final_Synergies: CardDefinition[] = [
  {
    name: 'Humiliate',
    manaCost: '{W}{B}',
    colors: ['W', 'B'],
    types: ['Sorcery'],
    oracleText: 'Target opponent reveals their hand. You choose a nonland card from it. That player discards that card. Put a +1/+1 counter on a creature you control.',
    abilities: [
      {
        type: AbilityType.Spell,
        targetDefinition: {
            count: 1,
            type: TargetType.Player,
            restrictions: [{ type: 'Opponent' }]
        },
        effects: [
          {
            type: EffectType.Choice,
            label: "Choose a nonland card to discard",
            targetIdMapping: 'TARGET_1_HAND_REVEAL_PICK',
            restrictions: [{ type: 'Not', restriction: { type: 'Type', value: 'Land' } }],
            effects: [{ type: EffectType.MoveToZone, zone: Zone.Graveyard, isDiscard: true }]
          },
          {
              type: EffectType.AddCounters,
              counterType: 'P1P1',
              amount: 1,
              targetDefinition: {
                  count: 1,
                  type: TargetType.Permanent,
                  restrictions: [{ type: 'Type', value: 'Creature' }, { type: 'Source', value: 'CONTROLLER' }]
              },
              targetMapping: TargetMapping.Target1
          }
        ]
      }
    ]
  },
  {
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
              amount: '{2}',
              condition: 'LifeGainedThisTurn'
          }]
      },
      {
        type: AbilityType.Spell,
        targetDefinition: {
            count: 1,
            type: TargetType.Permanent,
            restrictions: [
                { type: 'Not', restriction: { type: 'Type', value: 'Land' } }
            ]
        },
        effects: [{ type: EffectType.Destroy, targetMapping: TargetMapping.Target1 }]
      }
    ]
  },
  {
    name: 'Bury in Books',
    manaCost: '{4}{U}',
    colors: ['U'],
    types: ['Instant'],
    oracleText: 'Put target creature into its owner\'s library second from the top. It costs {2} less to cast this spell if it targets a creature with mana value 4 or greater.',
    abilities: [
        {
            type: AbilityType.Static,
            effects: [{
                type: EffectType.CostReduction,
                amount: '{2}',
                condition: 'TargetsManaValue4OrGreater'
            }]
        },
        {
            type: AbilityType.Spell,
            targetDefinition: {
                count: 1,
                type: TargetType.Permanent,
                restrictions: [{ type: 'Type', value: 'Creature' }]
            },
            effects: [{ type: EffectType.MoveToZone, zone: Zone.Library, libraryPosition: 'top', fromTop: 1, targetMapping: TargetMapping.Target1 }]
        }
    ]
  },
  {
    name: 'Rise of Extus',
    manaCost: '{4}{B/G}{B/G}',
    colors: ['B', 'G'],
    types: ['Sorcery'],
    oracleText: 'Exile target creature or planeswalker. Learn.',
    abilities: [
      {
        type: AbilityType.Spell,
        targetDefinition: {
            count: 1,
            type: TargetType.Permanent,
            restrictions: [{ type: 'Any', restrictions: [{ type: 'Type', value: 'Creature' }, { type: 'Type', value: 'Planeswalker' }] }]
        },
        effects: [
            { type: EffectType.Exile, targetMapping: TargetMapping.Target1 },
            { type: EffectType.Learn }
        ]
      }
    ]
  },
  {
    name: 'Frost Trickster',
    manaCost: '{2}{U}',
    colors: ['U'],
    types: ['Creature'],
    subtypes: ['Bird', 'Wizard'],
    power: '2',
    toughness: '2',
    keywords: ['Flying'],
    oracleText: 'Flying\nWhen Frost Trickster enters the battlefield, tap target creature an opponent controls. It doesn\'t untap during its controller\'s next untap step.',
    abilities: [
      {
        type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
        targetDefinition: {
            count: 1,
            type: TargetType.Permanent,
            restrictions: [{ type: 'Type', value: 'Creature' }, { type: 'OpponentControl' }]
        },
        effects: [
          { type: EffectType.Tap, targetMapping: TargetMapping.Target1 },
          { type: EffectType.ApplyContinuousEffect, effects: [{ type: 'Freeze' }], duration: 'NEXT_UNTAP', targetMapping: TargetMapping.Target1 }
        ]
      }
    ]
  },
  {
    name: 'Spectacle Mage',
    manaCost: '{1}{U}{R}',
    colors: ['U', 'R'],
    types: ['Creature'],
    subtypes: ['Human', 'Wizard'],
    power: '2',
    toughness: '2',
    keywords: ['Flying'],
    oracleText: 'Flying\nSpells you cast with mana value 5 or greater cost {1} less to cast.',
    abilities: [
      {
        type: AbilityType.Static,
        effects: [{
            type: EffectType.CostReduction,
            amount: '{1}',
            restriction: { type: 'Attribute', attribute: 'ManaValue', value: 5, comparison: 'GE' }
        }]
      }
    ]
  },
  {
    name: 'Blood-Age General',
    manaCost: '{1}{R}',
    colors: ['R'],
    types: ['Creature'],
    subtypes: ['Spirit', 'Warrior'],
    power: '2',
    toughness: '2',
    oracleText: 'Whenever Blood-Age General attacks, other Spirits you control get +1/+0 until end of turn.',
    abilities: [
      {
        type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Attack,
        effects: [{
            type: EffectType.ApplyContinuousEffect,
            powerModifier: 1,
            duration: 'UNTIL_END_OF_TURN',
            targetMapping: TargetMapping.OtherCreaturesYouControl,
            restrictions: [{ type: 'Subtype', value: 'Spirit' }]
        }]
      }
    ]
  },
  {
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
  },
  {
    name: 'Bayou Groff',
    manaCost: '{1}{G}',
    colors: ['G'],
    types: ['Creature'],
    subtypes: ['Dog', 'Plant'],
    power: '5',
    toughness: '4',
    oracleText: 'As an additional cost to cast this spell, sacrifice a creature or pay {3}.',
    abilities: [
      {
          type: AbilityType.Spell,
          additionalCosts: [
              {
                  label: "As an additional cost to cast this spell, sacrifice a creature or pay {3}.",
                  type: 'Choice',
                  choices: [
                      { label: 'Sacrifice a creature', costs: [{ type: 'Sacrifice', targetMapping: TargetMapping.Target1, targetDefinition: { count: 1, type: TargetType.Permanent, restrictions: [{ type: 'Type', value: 'Creature' }] } }] },
                      { label: 'Pay {3}', costs: [{ type: 'Mana', value: '{3}' }] }
                  ]
              }
          ]
      }
    ]
  },
  {
    name: 'Spiteful Squad',
    manaCost: '{3}{B}',
    colors: ['B'],
    types: ['Creature'],
    subtypes: ['Human', 'Warrior'],
    power: '3',
    toughness: '2',
    keywords: ['Deathtouch'],
    oracleText: 'Deathtouch\nWhen Spiteful Squad dies, put its +1/+1 counters on target creature you control.',
    abilities: [
      {
        type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Death,
        targetDefinition: {
            count: 1,
            type: TargetType.Permanent,
            restrictions: [{ type: 'Type', value: 'Creature' }, { type: 'Source', value: 'CONTROLLER' }]
        },
        effects: [{ type: EffectType.AddCounters, counterType: 'P1P1', amount: DynamicAmount.SourceCountersP1P1, targetMapping: TargetMapping.Target1 }]
      }
    ]
  }
];

