import { AbilityType, ImplementableCard, ZoneRequirement, TriggerEvent, EffectType } from '@shared/engine_types';

export const SpellSatchel: ImplementableCard = {
    name: 'Spell Satchel',
    manaCost: '{2}',
    type_line: 'Artifact',
    types: ['Artifact'],
    subtypes: [],
    keywords: [],
    colors: [],
    supertypes: [],
    oracleText: 'Magecraft — Whenever you cast or copy an instant or sorcery spell, put a book counter on Spell Satchel.\n{T}, Remove a book counter from Spell Satchel: Add {C}.\n{3}, {T}, Remove three book counters from Spell Satchel: Draw a card.',
    abilities: [
        {
            id: 'spell_satchel_magecraft',
            type: AbilityType.Triggered,
            activeZone: ZoneRequirement.Battlefield,
            triggerEvent: TriggerEvent.Magecraft,
            effects: [
                {
                    type: EffectType.AddCounters,
                    targetMapping: 'SELF',
                    amount: 1,
                    value: 'book'
                }
            ]
        },
        {
            id: 'spell_satchel_mana',
            type: AbilityType.Activated,
            activeZone: ZoneRequirement.Battlefield,
            costs: [
                { type: 'Tap' },
                { type: 'RemoveCounter', amount: 1, counterType: 'book' } as any
            ],
            effects: [{ type: 'AddMana', amount: '{C}' }]
        },
        {
            id: 'spell_satchel_draw',
            type: AbilityType.Activated,
            activeZone: ZoneRequirement.Battlefield,
            costs: [
                { type: 'Mana', value: '{3}' },
                { type: 'Tap' },
                { type: 'RemoveCounter', amount: 3, counterType: 'book' } as any
            ],
            effects: [{ type: EffectType.DrawCards, amount: 1, targetMapping: 'CONTROLLER' }]
        }
    ]
};
