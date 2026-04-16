import { CardDefinition, AbilityType, EffectType, TargetType, TargetMapping, DurationType } from '@shared/engine_types';

export const HonorboundPageForumsFavor: CardDefinition = {
    name: "Honorbound Page // Forum's Favor",
    manaCost: "{3}{W}",
    colors: ["W"],
    types: ["Creature"],
    subtypes: ["Cat", "Cleric"],
    power: "3",
    toughness: "3",
    keywords: ["First strike", "Prepared"],
    oracleText: "First strike\nThis creature enters prepared.",
    entersPrepared: true,
    image_url: "https://cards.scryfall.io/png/front/7/9/79a70863-860f-4a7b-9cb2-d3546b689d44.png?1775937039",

    preparedFace: {
        name: "Forum's Favor",
        image_url: "https://cards.scryfall.io/png/front/7/9/79a70863-860f-4a7b-9cb2-d3546b689d44.png?1775937039",
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
