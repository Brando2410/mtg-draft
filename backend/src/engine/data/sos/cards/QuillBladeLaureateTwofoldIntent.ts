import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
export const QuillBladeLaureateTwofoldIntent: CardDefinition = {
    name: "Quill-Blade Laureate // Twofold Intent",
    manaCost: "{1}{W}",
    colors: ["W"],
    types: ["Creature"],
    subtypes: ["Human", "Cleric"],
    keywords: ["Double strike", "Prepared"],
    oracleText: "Double strike\nThis creature enters prepared.",
    power: "1",
    toughness: "1",
    entersPrepared: true,
    preparedFace: {
        name: "Twofold Intent",
        manaCost: "{1}{W}",
        colors: ["W"],
        types: ["Sorcery"],
        type_line: "Sorcery",
        oracleText: "Target creature gets +1/+0 and gains double strike until end of turn.",
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
                        abilitiesToAdd: ["Double strike"],
                        duration: { type: DurationType.UntilEndOfTurn },
                        targetMapping: TargetMapping.Target1
                    }
                ]
            }
        ],

    },
    scryfall_id: "62a47835-5719-48c4-a740-a0c5f00dce11",
    image_url: "https://cards.scryfall.io/png/front/6/2/62a47835-5719-48c4-a740-a0c5f00dce11.png?1775937102",
    rarity: "uncommon"
};

