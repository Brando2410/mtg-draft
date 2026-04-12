import { AbilityType, ImplementableCard, ZoneRequirement, TriggerEvent, EffectType } from '@shared/engine_types';

export const ArrogantPoet: ImplementableCard = {
    name: 'Arrogant Poet',
    manaCost: '{1}{B}',
    type_line: 'Creature — Human Warlock',
    types: ['Creature'],
    subtypes: ['Human', 'Warlock'],
    power: '2',
    toughness: '1',
    keywords: [],
    colors: ['black'],
    supertypes: [],
    oracleText: 'Whenever Arrogant Poet attacks, you may pay 2 life. If you do, it gains flying until end of turn.',
    abilities: [
        {
            id: 'arrogant_poet_trigger',
            type: AbilityType.Triggered,
            activeZone: ZoneRequirement.Battlefield,
            triggerEvent: TriggerEvent.Attack,
            effects: [
                {
                    type: EffectType.Choice,
                    label: 'Pay 2 life to gain flying?',
                    choices: [
                        { 
                            label: 'Yes (Pay 2 life)', 
                            effects: [
                                { type: EffectType.LoseLife, amount: 2, targetMapping: 'CONTROLLER' },
                                {
                                    type: EffectType.ApplyContinuousEffect,
                                    targetMapping: 'SELF',
                                    duration: 'UNTIL_END_OF_TURN',
                                    abilitiesToAdd: ['Flying']
                                }
                            ]
                        },
                        { label: 'No', effects: [] }
                    ]
                }
            ]
        }
    ]
};
