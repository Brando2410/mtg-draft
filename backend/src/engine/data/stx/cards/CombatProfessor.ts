import { AbilityType, ImplementableCard, ZoneRequirement, TriggerEvent, EffectType } from '@shared/engine_types';

export const CombatProfessor: ImplementableCard = {
    name: 'Combat Professor',
    manaCost: '{3}{W}',
    type_line: 'Creature — Bird Cleric',
    types: ['Creature'],
    subtypes: ['Bird', 'Cleric'],
    power: '2',
    toughness: '3',
    keywords: ['Flying'],
    colors: ['white'],
    supertypes: [],
    oracleText: 'Flying. At the beginning of combat on your turn, target creature you control gets +1/+0 and gains vigilance until end of turn.',
    abilities: [
        {
            id: 'combat_professor_trigger',
            type: AbilityType.Triggered,
            activeZone: ZoneRequirement.Battlefield,
            triggerEvent: TriggerEvent.StartOfCombat,
            triggerCondition: 'YOUR_TURN',
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    targetMapping: 'TARGET',
                    duration: 'UNTIL_END_OF_TURN',
                    powerModifier: 1,
                    toughnessModifier: 0,
                    abilitiesToAdd: ['Vigilance']
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
