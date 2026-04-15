import { CardDefinition, AbilityType, EffectType, TargetMapping, TargetType, DurationType } from '@shared/engine_types';

export const QuillBladeLaureateTwofoldIntent: CardDefinition = {
    name: "Quill-Blade Laureate",
    manaCost: "{1}{W}",
    colors: ["W"],
    types: ["Creature"],
    subtypes: ["Human", "Cleric"],
    power: "1",
    toughness: "1",
    keywords: ["Double strike", "Prepared"],
    oracleText: "Double strike\nThis creature enters prepared.",
    entersPrepared: true,

    preparedFace: {
        name: "Twofold Intent",
        manaCost: "{1}{W}",
        colors: ["W"],
        types: ["Sorcery"],
        oracleText: "Target creature gets +1/+0 and gains double strike until end of turn.",
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
                        abilitiesToAdd: ["Double strike"],
                        duration: { type: DurationType.UntilEndOfTurn },
                        targetMapping: TargetMapping.Target1
                    }
                ]
            }
        ]
    }
};
