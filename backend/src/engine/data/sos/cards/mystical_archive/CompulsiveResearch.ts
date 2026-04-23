import { AbilityType, CardDefinition, EffectType, TargetType, TargetMapping, Restriction, Zone } from '@shared/engine_types';

export const CompulsiveResearch: CardDefinition = {
    name: "Compulsive Research",
    manaCost: "{2}{U}",
    oracleText: "Target player draws three cards. Then that player discards two cards unless they discard a land card.",
    colors: ["U"],
    types: ["Sorcery"],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Player,
                count: 1
            },
            effects: [
                {
                    type: EffectType.DrawCards,
                    amount: 3,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.Choice,
                    label: "Discard two cards unless you discard a land card",
                    // The player chosen as target is the one who makes the choice
                    targetMapping: TargetMapping.Target1, 
                    choices: [
                        {
                            label: "Discard a land card",
                            condition: {
                                type: "HasInZone",
                                zone: Zone.Hand,
                                restrictions: [Restriction.Land]
                            },
                            effects: [
                                {
                                    type: EffectType.DiscardCards,
                                    amount: 1,
                                    restrictions: [Restriction.Land]
                                }
                            ]
                        },
                        {
                            label: "Discard two cards",
                            effects: [
                                {
                                    type: EffectType.DiscardCards,
                                    amount: 2
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};
