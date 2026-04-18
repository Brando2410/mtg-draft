import { AbilityType, CardDefinition, CostType, DurationType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
export const ChelonianTackle: CardDefinition = {
    name: "Chelonian Tackle",
    manaCost: "{2}{G}",
    scryfall_id: "a82a4d8c-4105-4923-85a2-ef58241f725c",
    rarity: "uncommon",
    image_url: "https://cards.scryfall.io/normal/front/a/8/a82a4d8c-4105-4923-85a2-ef58241f725c.jpg?1775937964",
    colors: [
        "G"
    ],
    types: [
        "Sorcery"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Target creature you control gets +0/+10 until end of turn. Then it fights up to one target creature an opponent controls. (Each deals damage equal to its power to the other.)",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Creature, count: 1, restrictions: [
                    "youcontrol"
                ]
            },
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    sublayer: 'Stats',
                    toughnessModifier: 10,
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: CostType.Choice,
                    label: "Fight up to one target creature an opponent controls?",
                    choices: [
                        {
                            label: "Yes",
                            targetDefinition: {
                                type: TargetType.Creature, count: 1, restrictions: [
                                    "opponentcontrol"
                                ]
                            },
                            effects: [
                                {
                                    type: EffectType.Fight,
                                    targetMapping: TargetMapping.Target1,
                                    target2Mapping: TargetMapping.Target2
                                }
                            ]
                        },
                        { label: "No", effects: [] }
                    ]
                }
            ]
        }
    ]
};
