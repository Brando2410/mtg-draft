import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
    export const HonorboundPageForumsFavor: CardDefinition = {
    name: "Honorbound Page // Forum's Favor",
    manaCost: "{3}{W}",


    colors: ["W"],
    types: ["Creature"],
    subtypes: ["Cat", "Cleric"],
    keywords: ["First strike", "Prepared"],
    oracleText: "First strike\nThis creature enters prepared.",
    power: "3",
    toughness: "3",

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
                targetDefinitions: [{
                    type: TargetType.Creature,
                    count: 1
                }],
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
        ],

    },
    scryfall_id: "79a70863-860f-4a7b-9cb2-d3546b689d44",
    image_url: "https://cards.scryfall.io/png/front/7/9/79a70863-860f-4a7b-9cb2-d3546b689d44.png?1775937039",
    rarity: "common"
};

