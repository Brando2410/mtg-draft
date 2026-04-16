import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const LoreholdPledgemage: CardDefinition = {
    name: 'Lorehold Pledgemage',
    manaCost: '{1}{R/W}{R/W}', // Scryfall: {1}{R/W}{R/W}
    colors: ['R', 'W'],
    types: ['Creature'],
    subtypes: ['Rhino', 'Cleric'],
    power: '2',
    toughness: '2',
    keywords: ['First strike'],
    oracleText: 'First strike\nMagecraft — Whenever you cast or copy an instant or sorcery spell, Lorehold Pledgemage gets +1/+1 until end of turn.',
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Magecraft,
            effects: [{ type: EffectType.ApplyContinuousEffect, powerModifier: 1, toughnessModifier: 1, duration: 'UNTIL_END_OF_TURN', targetMapping: TargetMapping.Self }]
        }
    ]
  };


