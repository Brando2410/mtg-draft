import { AbilityType, ImplementableCard, ZoneRequirement, TriggerEvent, EffectType } from '@shared/engine_types';

export const ArchmageEmeritus: ImplementableCard = {
    name: 'Archmage Emeritus',
    manaCost: '{2}{U}{U}',
    type_line: 'Creature — Human Wizard',
    types: ['Creature'],
    subtypes: ['Human', 'Wizard'],
    power: '2',
    toughness: '2',
    keywords: [],
    colors: ['blue'],
    supertypes: [],
    oracleText: 'Magecraft — Whenever you cast or copy an instant or sorcery spell, draw a card.',
    abilities: [
        {
            id: 'archmage_emeritus_magecraft',
            type: AbilityType.Triggered,
            activeZone: ZoneRequirement.Battlefield,
            triggerEvent: TriggerEvent.Magecraft,
            effects: [
                {
                    type: EffectType.DrawCards,
                    amount: 1,
                    targetMapping: 'CONTROLLER'
                }
            ]
        }
    ]
};
