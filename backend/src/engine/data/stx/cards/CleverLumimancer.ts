import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const CleverLumimancer: CardDefinition = {
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
  };

