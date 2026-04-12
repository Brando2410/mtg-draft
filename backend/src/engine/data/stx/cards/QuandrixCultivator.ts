import { AbilityType, ImplementableCard, ZoneRequirement, EffectType, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const QuandrixCultivator: ImplementableCard = {
    name: 'Quandrix Cultivator',
    manaCost: '{1}{G/U}{G/U}{G}',
    type_line: 'Creature — Turtle Shaman',
    types: ['Creature'],
    subtypes: ['Turtle', 'Shaman'],
    power: '3',
    toughness: '4',
    keywords: [],
    colors: ['green', 'blue'],
    supertypes: [],
    oracleText: 'When Quandrix Cultivator enters the battlefield, you may search your library for a basic Forest or Island card, put it onto the battlefield tapped, then shuffle.',
    abilities: [
        {
            id: 'quandrix_cultivator_etb',
            type: AbilityType.Triggered,
            activeZone: ZoneRequirement.Battlefield,
            triggerEvent: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.MoveToZone,
                    targetMapping: 'CONTROLLER',
                    optional: true,
                    selectionType: 'Search',
                    sourceZones: [Zone.Library],
                    zone: Zone.Battlefield,
                    tapped: true,
                    shuffle: true,
                    // Basic Forest or Island
                    restrictions: [
                        { types: ['Land'], supertypes: ['Basic'], subtypes: ['Forest'] },
                        { types: ['Land'], supertypes: ['Basic'], subtypes: ['Island'] }
                    ]
                }
            ]
        }
    ]
};
