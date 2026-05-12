import { AbilityType, CardDefinition, EffectType, TargetMapping } from '@shared/engine_types';
export const StrifeScholarAwakentheAges: CardDefinition = {
    name: "Strife Scholar // Awaken the Ages",
    manaCost: "{2}{R}",
    colors: ["R"],
    types: ["Creature"],
    subtypes: ["Orc", "Sorcerer"],
    keywords: ["Ward—Pay 2 life", "Prepared"],
    oracleText: "Ward—Pay 2 life.\nThis creature enters prepared.",
    power: "3",
    toughness: "2",
    entersPrepared: true,
    preparedFace: {
        name: "Awaken the Ages",
        manaCost: "{5}{R}",
        colors: ["R"],
        types: ["Sorcery"],
        oracleText: "Create two 2/2 red and white Spirit creature tokens.",
        abilities: [{
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.CreateToken,
                    amount: 2,
                    tokenBlueprint: {
                        name: "Spirit",
                        colors: ["R", "W"],
                        types: ["Creature"],
                        subtypes: ["Spirit"],
                        power: "2",
                        toughness: "2",
                        image_url: "https://cards.scryfall.io/normal/front/8/7/877f7ddb-ed70-41a0-b845-d9bf8ac65f9b.jpg?1775828448"
                    },
                    targetMapping: TargetMapping.Controller
                }
            ]
        }],

    },
    scryfall_id: "8de79312-2046-425e-9919-49afe19be81b",
    image_url: "https://cards.scryfall.io/png/front/8/d/8de79312-2046-425e-9919-49afe19be81b.png?1775937883",
    rarity: "common"
};

