import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType, SelectionType } from '@shared/engine_types';
export const LoreholdCharm: CardDefinition = {
    name: "Lorehold Charm",
    manaCost: "{R}{W}",
    scryfall_id: "5fe70295-e550-4577-a341-dab6c25aabfd",
    rarity: "uncommon",
    image_url: "https://cards.scryfall.io/normal/front/5/f/5fe70295-e550-4577-a341-dab6c25aabfd.jpg?1775938389",
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
                    optional: true,
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
                            label: "Return artifact or creature with MV 2 or less from your graveyard",
                            effects: [
                                {
                                    type: EffectType.PutOnBattlefield,
                                    selectionType: SelectionType.Search,
                                    targetDefinition: {
                                        type: TargetType.CardInGraveyard,
                                        count: 1,
                                        restrictions: [
                                            "ArtifactOrCreature",
                                            "mv <= 2",
                                            "Yours"
                                        ]
                                    }
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
