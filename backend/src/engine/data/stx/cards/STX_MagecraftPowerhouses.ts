import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const STX_MagecraftPowerhouses: CardDefinition[] = [
  {
    name: 'Storm-Kiln Artist',
    manaCost: '{3}{R}',
    colors: ['R'],
    types: ['Creature'],
    subtypes: ['Dwarf', 'Shaman'],
    power: '2',
    toughness: '2',
    oracleText: "Storm-Kiln Artist gets +1/+0 for each artifact you control.\nMagecraft — Whenever you cast or copy an instant or sorcery spell, create a Treasure token.",
    abilities: [
        {
            type: AbilityType.Static,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    targetMapping: TargetMapping.Self,
                    // COUNT_MATCHING usually implies a DynamicAmount or custom string
                    powerModifier: 'COUNT_MATCHING:Artifact,YouControl',
                    layer: 7
                }
            ]
        },
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Magecraft,
            effects: [
                {
                    type: EffectType.CreateToken,
                    tokenBlueprint: {
                        name: 'Treasure',
                        types: ['Artifact', 'Token'],
                        subtypes: ['Treasure'],
                        oracleText: '{T}, Sacrifice this artifact: Add one mana of any color.',
                        abilities: [
                            {
                                type: AbilityType.Activated,
                                costs: [{ type: 'Tap' }, { type: 'Sacrifice', targetMapping: TargetMapping.Self }],
                                effects: [{ type: EffectType.AddMana, manaType: 'ANY', amount: 1 }]
                            }
                        ]
                    }
                }
            ]
        }
    ]
  },
  {
    name: 'Archmage Emeritus',
    manaCost: '{2}{U}{U}',
    colors: ['U'],
    types: ['Creature'],
    subtypes: ['Human', 'Wizard'],
    power: '2',
    toughness: '2',
    oracleText: "Magecraft — Whenever you cast or copy an instant or sorcery spell, draw a card.",
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Magecraft,
            effects: [
                {
                    type: EffectType.DrawCards,
                    targetMapping: TargetMapping.Controller,
                    amount: 1
                }
            ]
        }
    ]
  },
  {
    name: 'Clever Lumimancer',
    manaCost: '{W}',
    colors: ['W'],
    types: ['Creature'],
    subtypes: ['Human', 'Wizard'],
    power: '0',
    toughness: '1',
    oracleText: "Magecraft — Whenever you cast or copy an instant or sorcery spell, Clever Lumimancer gets +2/+2 until end of turn.",
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Magecraft,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    targetMapping: TargetMapping.Self,
                    duration: 'UNTIL_END_OF_TURN',
                    powerModifier: 2,
                    toughnessModifier: 2
                }
            ]
        }
    ]
  },
  {
    name: 'Dragonsguard Elite',
    manaCost: '{1}{G}',
    colors: ['G'],
    types: ['Creature'],
    subtypes: ['Human', 'Druid'],
    power: '2',
    toughness: '2',
    oracleText: "Magecraft — Whenever you cast or copy an instant or sorcery spell, put a +1/+1 counter on Dragonsguard Elite.\n{4}{G}{G}: Double the number of +1/+1 counters on Dragonsguard Elite.",
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Magecraft,
            effects: [
                {
                    type: EffectType.AddCounters,
                    targetMapping: TargetMapping.Self,
                    counterType: 'P1P1',
                    amount: 1
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: 'Mana', value: '{4}{G}{G}' }],
            effects: [
                {
                    type: EffectType.AddCounters,
                    targetMapping: TargetMapping.Self,
                    counterType: 'P1P1',
                    amount: DynamicAmount.SourceCountersP1P1
                }
            ]
        }
    ]
  }
];

