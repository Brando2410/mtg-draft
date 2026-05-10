import { AbilityType, CardDefinition, CostType, DurationType, EffectType, Restriction, TargetMapping, TargetType } from '@shared/engine_types';
export const ChelonianTackle: CardDefinition = {
    name: "Chelonian Tackle",
    manaCost: "{2}{G}",


    colors: ["G"],
    types: ["Sorcery"],
    subtypes: [],
    keywords: [],
    oracleText: "Target creature you control gets +0/+10 until end of turn. Then it fights up to one target creature an opponent controls. (Each deals damage equal to its power to the other.)",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                type: TargetType.Creature, count: 1, restrictions: [
                    Restriction.YouControl
                ]
            }],
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
                            targetDefinitions: [{
                                type: TargetType.Creature, count: 1, restrictions: [
                                    Restriction.OpponentControl
                                ]
                            }],
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
    ],
    scryfall_id: "a82a4d8c-4105-4923-85a2-ef58241f725c",
    image_url: "https://cards.scryfall.io/normal/front/a/8/a82a4d8c-4105-4923-85a2-ef58241f725c.jpg?1775937964",
    rarity: "uncommon"
};

