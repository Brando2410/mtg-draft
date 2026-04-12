import { AbilityType, ImplementableCard, ZoneRequirement, TriggerEvent, EffectType, Zone } from '@shared/engine_types';

export const PillardropRescuer: ImplementableCard = {
    name: 'Pillardrop Rescuer',
    manaCost: '{4}{W}',
    type_line: 'Creature — Spirit Cleric',
    types: ['Creature'],
    subtypes: ['Spirit', 'Cleric'],
    power: '2',
    toughness: '2',
    keywords: ['Flying'],
    colors: ['white'],
    supertypes: [],
    oracleText: 'Flying. When Pillardrop Rescuer enters, return target creature card with mana value 3 or less from your graveyard to your hand.',
    abilities: [
        {
            id: 'pillardrop_rescuer_etb',
            type: AbilityType.Triggered,
            activeZone: ZoneRequirement.Battlefield,
            triggerEvent: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.MoveToZone,
                    targetMapping: 'TARGET_1',
                    destination: Zone.Hand
                }
            ],
            targetDefinition: {
                type: 'CardInGraveyard',
                count: 1,
                restrictions: ['Creature', { type: 'ManaValue', value: 3, comparison: 'LessOrEqual' }]
            }
        }
    ]
};
