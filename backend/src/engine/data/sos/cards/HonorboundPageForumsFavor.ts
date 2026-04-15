import { CardDefinition, AbilityType, EffectType, TargetType, TargetMapping, DurationType } from '@shared/engine_types';

export const HonorboundPageForumsFavor: CardDefinition = {
    name: "Honorbound Page",
    manaCost: "{3}{W}",
    colors: ["W"],
    types: ["Creature"],
    subtypes: ["Cat", "Cleric"],
    power: "3",
    toughness: "3",
    keywords: ["First strike", "Prepared"],
    oracleText: "First strike\nThis creature enters prepared.",
    entersPrepared: true,

    preparedFace: {
        name: "Forum's Favor",
        manaCost: "{W}",
        colors: ["W"],
        types: ["Sorcery"],
        oracleText: "Target creature gets +1/+0 and gains flying until end of turn.",
        abilities: [
            {
                type: AbilityType.Spell,
                targetDefinition: {
                    type: TargetType.Creature,
                    count: 1
                },
                effects: [
                    {
                        type: EffectType.ApplyContinuousEffect,
                        powerModifier: 1,
                        toughnessModifier: 0,
                        abilitiesToAdd: ["Flying"],
                        duration: { type: DurationType.UntilEndOfTurn },
                        targetMapping: TargetMapping.Target1
                    }
                ]
            }
        ]
    }
};
