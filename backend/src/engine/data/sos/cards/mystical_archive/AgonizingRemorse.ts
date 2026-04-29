import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType } from '@shared/engine_types';

export const AgonizingRemorse: CardDefinition = {
    name: "Agonizing Remorse",
    manaCost: "{1}{B}",
    oracleText: "Target opponent reveals their hand. You choose a nonland card from it or a card from their graveyard. Exile that card. You lose 2 life.",
    colors: ["B"],
    types: ["Sorcery"],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Opponent,
                count: 1
            },
            effects: [
                {
                    type: EffectType.Choice,
                    label: "Exile a card from hand or graveyard",
                    choices: [
                        {
                            label: "Choose from hand",
                            effects: [
                                {
                                    type: EffectType.Choice,
                                    selectionPool: TargetMapping.OpponentHandRevealPick,
                                    restrictions: [Restriction.NonLand],
                                    effects: [{ type: EffectType.Exile, targetMapping: TargetMapping.Target1 }]
                                }
                            ]
                        },
                        {
                            label: "Choose from graveyard",
                            effects: [
                                {
                                    type: EffectType.Choice,
                                    selectionPool: TargetMapping.Target1Graveyard,
                                    effects: [{ type: EffectType.Exile, targetMapping: TargetMapping.Target1 }]
                                }
                            ]
                        }
                    ]
                },
                {
                    type: EffectType.LoseLife,
                    amount: 2,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};
