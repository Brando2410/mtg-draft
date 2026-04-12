import { AbilityType, ImplementableCard, ZoneRequirement, TriggerEvent, EffectType } from '@shared/engine_types';

export const LoreholdPledgemage: ImplementableCard = {
    name: 'Lorehold Pledgemage',
    manaCost: '{1}{RW}{RW}',
    type_line: 'Creature — Kor Shaman',
    types: ['Creature'],
    subtypes: ['Kor', 'Shaman'],
    power: '2',
    toughness: '2',
    keywords: ['First strike'],
    colors: ['red', 'white'],
    supertypes: [],
    oracleText: 'First strike\nMagecraft — Whenever you cast or copy an instant or sorcery spell, Lorehold Pledgemage gets +1/+0 until end of turn.',
    abilities: [
        {
            id: 'lorehold_pledgemage_magecraft',
            type: AbilityType.Triggered,
            activeZone: ZoneRequirement.Battlefield,
            triggerEvent: TriggerEvent.Magecraft,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    targetMapping: 'SELF',
                    duration: 'UNTIL_END_OF_TURN',
                    powerModifier: 1,
                    toughnessModifier: 0
                }
            ]
        }
    ]
};
