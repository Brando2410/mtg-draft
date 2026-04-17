import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, DurationType } from '@shared/engine_types';

export const SymmetrySage: CardDefinition = {
    name: 'Symmetry Sage',
    manaCost: '{U}',
    colors: ['U'],
    types: ['Creature'],
    subtypes: ['Human', 'Wizard'],
    power: "0",
    toughness: "2",
    keywords: ['Flying'],
    oracleText: 'Flying\nMagecraft — Whenever you cast or copy an instant or sorcery spell, target creature you control has base power 2 until end of turn.',
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Magecraft,
            targetDefinition: { count: 1, type: TargetType.Creature, restrictions: ['youcontrol'] },
            effects: [{ type: EffectType.ApplyContinuousEffect, targetMapping: TargetMapping.Target1, duration: { type: DurationType.UntilEndOfTurn }, powerSet: 2 }]
        }
    ]
};


