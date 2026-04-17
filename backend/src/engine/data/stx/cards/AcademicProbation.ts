import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, DurationType } from '@shared/engine_types';

export const AcademicProbation: CardDefinition = {
    name: "Academic Probation",
    manaCost: "{1}{W}",
    colors: ["W"],
    types: ["Sorcery"],
    subtypes: ["Lesson"],
    oracleText: "Choose one —\n• Choose a nonland card name. Until your next turn, target opponent can't cast spells with the chosen name.\n• Target creature can't block this turn.",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [{
                type: EffectType.Choice,
                label: "Choose a mode",
                choices: [
                    {
                        label: "Restriction",
                        targetDefinition: { count: 1, type: TargetType.Player, restrictions: [{ type: 'Opponent' }] },
                        effects: [
                            { type: EffectType.Choice, label: 'Choose a nonland card name', targetIdMapping: 'NAME_A_CARD', restrictions: [{ type: 'Not', restriction: { type: 'Type', value: 'Land' } }] },
                            {
                                type: EffectType.ApplyContinuousEffect,
                                duration: { type: DurationType.UntilEndOfTurn },
                                restrictions: [{ type: 'CannotCastNamedCard' }],
                                targetMapping: TargetMapping.Target1
                            }
                        ]
                    },
                    {
                        label: "Blocker",
                        targetDefinition: { count: 1, type: TargetType.Creature },
                        effects: [{ type: EffectType.ApplyContinuousEffect, duration: { type: DurationType.UntilEndOfTurn }, restrictions: [{ type: 'CannotBlock' }], targetMapping: TargetMapping.Target1 }]
                    }
                ]
            }]
        }
    ]
};

