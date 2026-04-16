import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const SpectacleMage: CardDefinition = {
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
  };

