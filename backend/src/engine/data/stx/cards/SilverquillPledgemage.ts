import { AbilityType, ImplementableCard, ZoneRequirement, TriggerEvent, EffectType } from '@shared/engine_types';

export const SilverquillPledgemage: ImplementableCard = {
    name: 'Silverquill Pledgemage',
    manaCost: '{1}{WB}{WB}',
    type_line: 'Creature — Vampire Cleric',
    types: ['Creature'],
    subtypes: ['Vampire', 'Cleric'],
    power: '3',
    toughness: '1',
    keywords: [],
    colors: ['white', 'black'],
    supertypes: [],
    oracleText: 'Magecraft — Whenever you cast or copy an instant or sorcery spell, Silverquill Pledgemage gains your choice of flying or lifelink until end of turn.',
    abilities: [
        {
            id: 'silverquill_pledgemage_magecraft',
            type: AbilityType.Triggered,
            activeZone: ZoneRequirement.Battlefield,
            triggerEvent: TriggerEvent.Magecraft,
            effects: [
                {
                    type: EffectType.Choice,
                    label: 'Choose a keyword',
                    choices: [
                        { label: 'Flying', effects: [{ type: EffectType.ApplyContinuousEffect, duration: 'UNTIL_END_OF_TURN', abilitiesToAdd: ['Flying'], targetMapping: 'SELF' }] },
                        { label: 'Lifelink', effects: [{ type: EffectType.ApplyContinuousEffect, duration: 'UNTIL_END_OF_TURN', abilitiesToAdd: ['Lifelink'], targetMapping: 'SELF' }] }
                    ]
                } as any
            ]
        }
    ]
};
