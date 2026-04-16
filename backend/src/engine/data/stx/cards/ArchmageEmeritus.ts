import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const ArchmageEmeritus: CardDefinition = {
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
  };


