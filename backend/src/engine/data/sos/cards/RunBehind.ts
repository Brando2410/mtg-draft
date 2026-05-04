import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const RunBehind: CardDefinition = {
    name: "Run Behind",
    manaCost: "{3}{U}",
    colors: ["U"],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    oracleText: "This spell costs {1} less to cast if it targets an attacking creature.\nTarget creature's owner puts it on their choice of the top or bottom of their library.",
    abilities: [
        {
            type: AbilityType.Static,
            activeZone: Zone.Hand,
            effects: [
                {
                    type: EffectType.CostReduction,
                    amount: 1,
                    targetMapping: TargetMapping.Self,
                    condition: ConditionType.Target1Matches + ':attacking'
                }
            ]
        },
        {
            type: AbilityType.Spell,
            targetDefinitions: [{ type: TargetType.Creature }],
            effects: [
                {
                    type: EffectType.Choice,
                    targetMapping: TargetMapping.Target1Owner,
                    choices: [
                        {
                            label: "Put on top of library",
                            effects: [
                                {
                                    type: EffectType.MoveToZone,
                                    zone: Zone.Library,
                                    libraryPosition: 'top',
                                    targetMapping: TargetMapping.Target1
                                }
                            ]
                        },
                        {
                            label: "Put on bottom of library",
                            effects: [
                                {
                                    type: EffectType.MoveToZone,
                                    zone: Zone.Library,
                                    libraryPosition: 'bottom',
                                    targetMapping: TargetMapping.Target1
                                }
                            ]
                        }
                    ]
    }
            ]
        }
    ]
};
