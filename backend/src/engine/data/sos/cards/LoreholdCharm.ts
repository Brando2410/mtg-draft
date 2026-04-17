import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
export const LoreholdCharm: CardDefinition = {
    name: "Lorehold Charm",
    manaCost: "{R}{W}",
    colors: ["R", "W"],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    oracleText: "Choose one —\n• Each opponent sacrifices a nontoken artifact.\n• Return target artifact or creature card with mana value 2 or less from your graveyard to the battlefield.\n• Creatures you control get +1/+1 and gain trample until end of turn.",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: CostType.Choice,
                    choices: [
                        {
                            label: "Each opponent sacrifices a nontoken artifact",
                            effects: [
                                {
                                    type: CostType.Sacrifice,
                                    targetMapping: TargetMapping.EachOpponent,
                                    restrictions: [
                                        "Artifact",
                                        "nontoken"
                                    ]
                                }
                            ]
                        },
                        {
                            label: "Return target artifact or creature with MV 2 or less from graveyard",
                            targetDefinition: {
                                type: TargetType.CardInGraveyard,
                                count: 1,
                                restrictions: [
                                    "ArtifactOrCreature",
                                    "mv <= 2"
                                ]
                            },
                            effects: [
                                {
                                    type: EffectType.PutOnBattlefield,
                                    targetMapping: TargetMapping.Target1
                                }
                            ]
                        },
                        {
                            label: "Creatures you control get +1/+1 and trample",
                            effects: [
                                {
                                    type: EffectType.ApplyContinuousEffect,
                                    sublayer: 'Stats',
                                    powerModifier: 1,
                                    toughnessModifier: 1,
                                    abilitiesToAdd: ['Trample'],
                                    duration: { type: 'UNTIL_END_OF_TURN' as any },
                                    targetMapping: TargetMapping.AllCreaturesYouControl
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};
