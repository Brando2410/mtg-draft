import { AbilityType, CardDefinition, ConditionType, DurationType, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const CombatProfessor: CardDefinition = {
    name: 'Combat Professor',
    manaCost: '{3}{W}',
    scryfall_id: "3f669ac4-98ed-4e23-91a9-281f8277ab04",
    image_url: "https://cards.scryfall.io/normal/front/3/f/3f669ac4-98ed-4e23-91a9-281f8277ab04.jpg?1624589275",
    colors: ['W'],
    types: ['Creature'],
    subtypes: ['Bird', 'Cleric'],
    power: "2",
    toughness: "3",
    keywords: ['Flying'],
    oracleText: 'Flying\nAt the beginning of combat on your turn, target creature you control gets +1/+0 and gains vigilance until end of turn.',
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.BeginningOfCombatStep,
            condition: ConditionType.IsYourTurn,
            targetDefinition: {
                count: 1,
                type: TargetType.Creature,
                restrictions: [Restriction.YouControl]
            },
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                targetMapping: TargetMapping.Target1,
                duration: { type: DurationType.UntilEndOfTurn },
                powerModifier: 1,
                abilitiesToAdd: ['Vigilance']
            }]
        }
    ]
};
