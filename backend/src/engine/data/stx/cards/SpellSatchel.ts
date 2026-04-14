import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const SpellSatchel: CardDefinition = {
    name: 'Spell Satchel',
    manaCost: '{2}',
    colors: [],
    types: ['Artifact'],
    oracleText: 'Magecraft — Whenever you cast or copy an instant or sorcery spell, put a book counter on Spell Satchel.\n{T}, Remove a book counter from Spell Satchel: Add {C}.\n{3}, {T}, Remove three book counters from Spell Satchel: Draw a card.',
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Magecraft,
            effects: [{ type: EffectType.AddCounters, counterType: 'book', amount: 1, targetMapping: TargetMapping.Self }]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: 'Tap' }, { type: 'RemoveCounter', counterType: 'book', amount: 1 }],
            effects: [{ type: EffectType.AddMana, amount: '{C}' }]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: 'Mana', value: '{3}' }, { type: 'Tap' }, { type: 'RemoveCounter', counterType: 'book', amount: 3 }],
            effects: [{ type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Controller }]
        }
    ]
  };

