import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const SilverquillPledgemage: CardDefinition = {
    name: 'Silverquill Pledgemage',
    manaCost: '{1}{W/B}{W/B}',
    colors: ['W', 'B'],
    types: ['Creature'],
    subtypes: ['Vampire', 'Cleric'],
    power: '3',
    toughness: '1',
    oracleText: 'Magecraft — Whenever you cast or copy an instant or sorcery spell, Silverquill Pledgemage gains flying or lifelink until end of turn.',
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Magecraft,
            effects: [
                {
                    type: EffectType.Choice,
                    label: "Choose an ability for Silverquill Pledgemage",
                    choices: [
                        { label: 'Flying', effects: [{ type: EffectType.ApplyContinuousEffect, duration: 'UNTIL_END_OF_TURN', abilitiesToAdd: ['Flying'], targetMapping: TargetMapping.Self }] },
                        { label: 'Lifelink', effects: [{ type: EffectType.ApplyContinuousEffect, duration: 'UNTIL_END_OF_TURN', abilitiesToAdd: ['Lifelink'], targetMapping: TargetMapping.Self }] }
                    ]
                }
            ]
        }
    ]
  };


