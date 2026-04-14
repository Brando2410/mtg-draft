import { CardDefinition, AbilityType, EffectType, Zone, TargetType, TriggerEvent, TargetMapping } from '@shared/engine_types';

export const STX_Batch_8_Mystical_Archive: CardDefinition[] = [
  {
    name: 'Duress',
    manaCost: '{B}',
    colors: ['B'],
    types: ['Sorcery'],
    oracleText: 'Target opponent reveals their hand. You choose a noncreature, nonland card from it. That player discards that card.',
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
            label: "Choose a noncreature, nonland card to discard",
            targetIdMapping: TargetMapping.Target1HandRevealPick,
            restrictions: [
                {
                    type: 'Not',
                    restriction: { type: 'Any', restrictions: [{ type: 'Type', value: 'Creature' }, { type: 'Type', value: 'Land' }] }
                }
            ],
            effects: [{ type: EffectType.MoveToZone, zone: Zone.Graveyard, isDiscard: true }]
          }
        ]
      }
    ]
  },
  {
    name: 'Village Rites',
    manaCost: '{B}',
    colors: ['B'],
    types: ['Instant'],
    oracleText: 'As an additional cost to cast this spell, sacrifice a creature.\nDraw two cards.',
    abilities: [
      {
        type: AbilityType.Spell,
        additionalCosts: [
            {
                type: 'Sacrifice',
                restriction: { type: 'Type', value: 'Creature' }
            }
        ],
        effects: [{ type: EffectType.DrawCards, amount: 2 }]
      }
    ]
  },
  {
    name: 'Shock',
    manaCost: '{R}',
    colors: ['R'],
    types: ['Instant'],
    oracleText: 'Shock deals 2 damage to any target.',
    abilities: [
      {
        type: AbilityType.Spell,
        targetDefinition: {
            count: 1,
            type: TargetType.AnyTarget
        },
        effects: [{ type: EffectType.DealDamage, amount: 2, targetMapping: TargetMapping.Target1 }]
      }
    ]
  },
  {
    name: 'Claim the Firstborn',
    manaCost: '{R}',
    colors: ['R'],
    types: ['Sorcery'],
    oracleText: 'Gain control of target creature with mana value 3 or less until end of turn. Untap that creature. It gains haste until end of turn.',
    abilities: [
      {
        type: AbilityType.Spell,
        targetDefinition: {
            count: 1,
            type: TargetType.Permanent,
            restrictions: [
                { type: 'Type', value: 'Creature' },
                { type: 'Attribute', attribute: 'ManaValue', value: 3, comparison: 'LE' }
            ]
        },
        effects: [
          { type: EffectType.ApplyContinuousEffect, duration: 'UNTIL_END_OF_TURN', effects: [{ type: 'GainControl' }], targetMapping: TargetMapping.Target1 },
          { type: EffectType.Untap, targetMapping: TargetMapping.Target1 },
          { type: EffectType.ApplyContinuousEffect, duration: 'UNTIL_END_OF_TURN', effects: [{ type: 'GainKeyword', keyword: 'Haste' }], targetMapping: TargetMapping.Target1 }
        ]
      }
    ]
  },
  {
    name: 'Opt',
    manaCost: '{U}',
    colors: ['U'],
    types: ['Instant'],
    oracleText: 'Scry 1.\nDraw a card.',
    abilities: [
      {
        type: AbilityType.Spell,
        effects: [
          { type: EffectType.Scry, amount: 1 },
          { type: EffectType.DrawCards, amount: 1 }
        ]
      }
    ]
  },
  {
    name: 'Strategic Planning',
    manaCost: '{1}{U}',
    colors: ['U'],
    types: ['Sorcery'],
    oracleText: 'Look at the top three cards of your library. Put one of them into your hand and the rest into your graveyard.',
    abilities: [
      {
        type: AbilityType.Spell,
        effects: [
          {
            type: EffectType.LookAtTopAndPick,
            fromTop: 3,
            amount: 1,
            destination: Zone.Hand,
            remainderZone: Zone.Graveyard
          }
        ]
      }
    ]
  },
  {
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
  },
  {
    name: 'Defiant Strike',
    manaCost: '{W}',
    colors: ['W'],
    types: ['Instant'],
    oracleText: 'Target creature gets +1/+0 until end of turn.\nDraw a card.',
    abilities: [
      {
        type: AbilityType.Spell,
        targetDefinition: {
            count: 1,
            type: TargetType.Permanent,
            restrictions: [{ type: 'Type', value: 'Creature' }]
        },
        effects: [
          { type: EffectType.ApplyContinuousEffect, duration: 'UNTIL_END_OF_TURN', powerModifier: 1, targetMapping: TargetMapping.Target1 },
          { type: EffectType.DrawCards, amount: 1 }
        ]
      }
    ]
  },
  {
    name: 'Revitalize',
    manaCost: '{1}{W}',
    colors: ['W'],
    types: ['Instant'],
    oracleText: 'You gain 3 life.\nDraw a card.',
    abilities: [
      {
        type: AbilityType.Spell,
        effects: [
          { type: EffectType.GainLife, amount: 3 },
          { type: EffectType.DrawCards, amount: 1 }
        ]
      }
    ]
  }
];
