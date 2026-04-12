import { AbilityType, ImplementableCard, ZoneRequirement, TriggerEvent, EffectType } from '@shared/engine_types';

export const SilverquillApprentice: ImplementableCard = {
    name: 'Silverquill Apprentice',
    manaCost: '{W}{B}',
    type_line: 'Creature — Human Warlock',
    types: ['Creature'],
    subtypes: ['Human', 'Warlock'],
    power: '2',
    toughness: '2',
    keywords: [],
    colors: ['white', 'black'],
    supertypes: [],
    oracleText: 'Magecraft — Whenever you cast or copy an instant or sorcery spell, target creature gets +1/+0 until end of turn.',
    abilities: [
        {
            id: 'silverquill_apprentice_magecraft',
            type: AbilityType.Triggered,
            activeZone: ZoneRequirement.Battlefield,
            triggerEvent: TriggerEvent.Magecraft,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    targetMapping: 'TARGET_1',
                    duration: 'UNTIL_END_OF_TURN',
                    powerModifier: 1,
                    layer: 7
                }
            ],
            targetDefinition: {
                type: 'Permanent',
                count: 1,
                restrictions: ['Creature']
            }
        }
    ]
};
