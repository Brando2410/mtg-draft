import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const EagerFirstYear: CardDefinition = {
    name: 'Eager First-Year',
    manaCost: '{1}{W}',
    colors: ['W'],
    types: ['Creature'],
    subtypes: ['Human', 'Wizard'],
    power: "2",
    toughness: "2",
    oracleText: 'Magecraft — Whenever you cast or copy an instant or sorcery spell, Eager First-Year gets +1/+0 until end of turn.',
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Magecraft,
            effects: [{ type: EffectType.ApplyContinuousEffect, targetMapping: TargetMapping.Self, duration: 'UNTIL_END_OF_TURN', powerModifier: 1 }]
        }
    ]
  };

