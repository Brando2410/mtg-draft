import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const SpellSatchel: CardDefinition = {
    name: 'Spell Satchel',
    manaCost: '{2}',
    scryfall_id: "cd8acc65-c7e0-4ba5-b956-af0679ffb830",
    image_url: "https://cards.scryfall.io/normal/front/c/d/cd8acc65-c7e0-4ba5-b956-af0679ffb830.jpg?1681159425",
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
            costs: [{ type: CostType.Tap }, { type: 'RemoveCounter', counterType: 'book', amount: 1 }],
            effects: [{ type: EffectType.AddMana, amount: '{C}' }]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Mana, value: '{3}' }, { type: CostType.Tap }, { type: 'RemoveCounter', counterType: 'book', amount: 3 }],
            effects: [{ type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Controller }]
        }
    ]
};


