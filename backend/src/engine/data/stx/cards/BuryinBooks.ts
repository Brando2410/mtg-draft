import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const BuryinBooks: CardDefinition = {
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
  };
