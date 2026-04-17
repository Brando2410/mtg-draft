import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';
    export const ChoreographedSparks: CardDefinition = {
    name: "Choreographed Sparks",
    manaCost: "{R}{R}",
    colors: [
        "R"
    ],
    types: [
        "Instant"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "This spell can't be copied.\nChoose one or both —\n• Copy target instant or sorcery spell you control. You may choose new targets for the copy.\n• Copy target creature spell you control. The copy gains haste and \"At the beginning of the end step, sacrifice this token.\"",
    abilities: [
        {
            type: AbilityType.Spell,
            isModal: true,
            minChoices: 1,
            maxChoices: 2,
            modes: [
                {
                    label: "Copy target instant or sorcery spell you control",
                    targetDefinition: { type: AbilityType.Spell, count: 1, restrictions: [
                { type: 'Type', value: 'InstantOrSorcery' },
                { type: 'Control', value: 'YouControl' }
            ] },
                    effects: [
                        { type: EffectType.CopySpellOnStack, chooseNewTargets: true, targetMapping: TargetMapping.Target1 }
                    ]
                },
                {
                    label: "Copy target creature spell you control",
                    targetDefinition: { type: AbilityType.Spell, count: 1, restrictions: [
                { type: 'Type', value: 'Creature' },
                { type: 'Control', value: 'YouControl' }
            ] },
                    effects: [
                        { 
                            type: EffectType.CopySpellOnStack, 
                            targetMapping: TargetMapping.Target1,
                            keywordsToAdd: ['Haste'],
                            abilitiesToAdd: [
                                {
                                    type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EndStep,
                                    effects: [{ type: CostType.Sacrifice, targetMapping: TargetType.Self }]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};
    