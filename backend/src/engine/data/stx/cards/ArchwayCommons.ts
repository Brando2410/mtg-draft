import { AbilityType, ImplementableCard, ZoneRequirement, TriggerEvent, EffectType } from '@shared/engine_types';

export const ArchwayCommons: ImplementableCard = {
    name: 'Archway Commons',
    manaCost: '',
    type_line: 'Land',
    types: ['Land'],
    subtypes: [],
    keywords: [],
    colors: [],
    supertypes: [],
    oracleText: 'Archway Commons enters tapped.\nWhen Archway Commons enters, sacrifice it unless you pay {1}.\n{T}: Add one mana of any color.',
    entersTapped: true,
    abilities: [
        {
            id: 'archway_commons_etb_trigger',
            type: AbilityType.Triggered,
            activeZone: ZoneRequirement.Battlefield,
            triggerEvent: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.Choice,
                    label: 'Pay {1} or sacrifice Archway Commons?',
                    choices: [
                        { label: 'Pay {1}', costs: [{ type: 'Mana', value: '{1}' }], effects: [] },
                        { label: 'Sacrifice', costs: [], effects: [{ type: EffectType.Sacrifice, targetMapping: 'SELF' }] }
                    ]
                } as any
            ]
        },
        {
            id: 'archway_commons_mana',
            type: AbilityType.Activated,
            isManaAbility: true,
            activeZone: ZoneRequirement.Battlefield,
            costs: [{ type: 'Tap' }],
            effects: [{ type: 'AddMana', amount: '{ANY}' }]
        }
    ]
};
