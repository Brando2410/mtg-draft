import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const StoneriseSpirit: CardDefinition = {
    name: 'Stonerise Spirit',
    manaCost: '{1}{W}',
    colors: ['W'],
    types: ['Creature'],
    subtypes: ['Spirit', 'Bird'],
    power: "1",
    toughness: "2",
    keywords: ['Flying'],
    oracleText: 'Flying\n{4}, Exile Stonerise Spirit from your graveyard: Target creature gains flying until end of turn.',
    abilities: [
        {
            type: AbilityType.Activated,
            activeZone: Zone.Graveyard,
            costs: [{ type: 'Mana', value: '{4}' }, { type: 'Exile', targetMapping: TargetMapping.Self }],
            targetDefinition: { count: 1, type: TargetType.Permanent, restrictions: [{ type: 'Type', value: 'Creature' }] },
            effects: [{ type: EffectType.ApplyContinuousEffect, targetMapping: TargetMapping.Target1, duration: 'UNTIL_END_OF_TURN', abilitiesToAdd: ['Flying'] }]
        }
    ]
  };
