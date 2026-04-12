import { AbilityType, ImplementableCard, ZoneRequirement, TriggerEvent, EffectType } from '@shared/engine_types';

export const SymmetrySage: ImplementableCard = {
    name: 'Symmetry Sage',
    manaCost: '{U}',
    type_line: 'Creature — Human Wizard',
    types: ['Creature'],
    subtypes: ['Human', 'Wizard'],
    power: '0',
    toughness: '2',
    keywords: ['Flying'],
    colors: ['blue'],
    supertypes: [],
    oracleText: 'Flying\nMagecraft — Whenever you cast or copy an instant or sorcery spell, target creature you control has base power 2 until end of turn.',
    abilities: [
        {
            id: 'symmetry_sage_magecraft',
            type: AbilityType.Triggered,
            activeZone: ZoneRequirement.Battlefield,
            triggerEvent: TriggerEvent.Magecraft,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    targetMapping: 'TARGET_1',
                    duration: 'UNTIL_END_OF_TURN',
                    powerSet: 2 // Base power 2
                }
            ],
            targetDefinition: {
                type: 'Permanent',
                count: 1,
                restrictions: ['Creature', 'YOU_CONTROL']
            }
        }
    ]
};
