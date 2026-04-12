import { AbilityType, ImplementableCard, ZoneRequirement, TriggerEvent, EffectType } from '@shared/engine_types';

export const LeoninLightscribe: ImplementableCard = {
    name: 'Leonin Lightscribe',
    manaCost: '{1}{W}',
    type_line: 'Creature — Cat Cleric',
    types: ['Creature'],
    subtypes: ['Cat', 'Cleric'],
    power: '2',
    toughness: '2',
    keywords: [],
    colors: ['white'],
    supertypes: [],
    oracleText: 'Magecraft — Whenever you cast or copy an instant or sorcery spell, creatures you control get +1/+1 until end of turn.',
    abilities: [
        {
            id: 'leonin_lightscribe_magecraft',
            type: AbilityType.Triggered,
            activeZone: ZoneRequirement.Battlefield,
            triggerEvent: TriggerEvent.Magecraft,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    targetMapping: 'ALL_CREATURES_YOU_CONTROL',
                    duration: 'UNTIL_END_OF_TURN',
                    powerModifier: 1,
                    toughnessModifier: 1
                }
            ]
        }
    ]
};
