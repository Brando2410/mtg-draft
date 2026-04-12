import { AbilityType, ImplementableCard, ZoneRequirement, TriggerEvent, EffectType } from '@shared/engine_types';

export const CleverLumimancer: ImplementableCard = {
    name: 'Clever Lumimancer',
    manaCost: '{W}',
    type_line: 'Creature — Human Wizard',
    types: ['Creature'],
    subtypes: ['Human', 'Wizard'],
    power: '0',
    toughness: '1',
    keywords: [],
    colors: ['white'],
    supertypes: [],
    oracleText: 'Magecraft — Whenever you cast or copy an instant or sorcery spell, Clever Lumimancer gets +2/+2 until end of turn.',
    abilities: [
        {
            id: 'clever_lumimancer_magecraft',
            type: AbilityType.Triggered,
            activeZone: ZoneRequirement.Battlefield,
            triggerEvent: TriggerEvent.Magecraft,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    targetMapping: 'SELF',
                    duration: 'UNTIL_END_OF_TURN',
                    powerModifier: 2,
                    toughnessModifier: 2
                }
            ]
        }
    ]
};
