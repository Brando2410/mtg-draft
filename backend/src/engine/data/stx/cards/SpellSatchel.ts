import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

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
            id: "{T}, Remove a book counter from Spell Satchel: Add {C}.",
            costs: [{ type: CostType.Tap }, { type: CostType.RemoveCounter, counterType: 'book', amount: 1 }],
            effects: [{ type: EffectType.AddMana, manaType: 'C' }]
        },
        {
            type: AbilityType.Activated,
            id: "{3}, {T}, Remove three book counters from Spell Satchel: Draw a card.",
            costs: [{ type: CostType.Mana, value: '{3}' }, { type: CostType.Tap }, { type: CostType.RemoveCounter, counterType: 'book', amount: 3 }],
            effects: [{ type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Controller }]
        }
    ],
    scryfall_id: "7de826a0-6e68-4d40-a51c-8d6e7a4148d1",
    image_url: "https://cards.scryfall.io/normal/front/7/d/7de826a0-6e68-4d40-a51c-8d6e7a4148d1.jpg?1624740711",
    rarity: "uncommon"
};

