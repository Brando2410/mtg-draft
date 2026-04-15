import { CardDefinition, AbilityType, EffectType, TargetType, TargetMapping } from '@shared/engine_types';

export const InfirmaryHealerStreamofLife: CardDefinition = {
    name: "Infirmary Healer",
    manaCost: "{1}{G}",
    colors: ["G"],
    types: ["Creature"],
    subtypes: ["Cat", "Cleric"],
    power: "2",
    toughness: "3",
    keywords: ["Prepared"],
    oracleText: "This creature enters prepared.",
    entersPrepared: true,

    preparedFace: {
        name: "Stream of Life",
        manaCost: "{X}{G}",
        colors: ["G"],
        types: ["Sorcery"],
        oracleText: "Target player gains X life.",
        abilities: [
            {
                type: AbilityType.Spell,
                targetDefinition: {
                    type: TargetType.Player,
                    count: 1
                },
                effects: [
                    {
                        type: EffectType.GainLife,
                        amount: "X",
                        targetMapping: TargetMapping.Target1
                    }
                ]
            }
        ]
    }
};
