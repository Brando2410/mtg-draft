import { AbilityType, ImplementableCard, ZoneRequirement, TriggerEvent, EffectType } from '@shared/engine_types';

export const PrismariPledgemage: ImplementableCard = {
    name: 'Prismari Pledgemage',
    manaCost: '{UR}{UR}',
    type_line: 'Creature — Orc Wizard',
    types: ['Creature'],
    subtypes: ['Orc', 'Wizard'],
    power: '3',
    toughness: '3',
    keywords: ['Defender'],
    colors: ['blue', 'red'],
    supertypes: [],
    oracleText: 'Defender\nMagecraft — Whenever you cast or copy an instant or sorcery spell, Prismari Pledgemage can attack this turn as though it didn’t have defender.',
    abilities: [
        {
            id: 'prismari_pledgemage_magecraft',
            type: AbilityType.Triggered,
            activeZone: ZoneRequirement.Battlefield,
            triggerEvent: TriggerEvent.Magecraft,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    targetMapping: 'SELF',
                    duration: 'UNTIL_END_OF_TURN',
                    abilitiesToRemove: ['Defender'] // Simple way to allow attack
                }
            ]
        }
    ]
};
