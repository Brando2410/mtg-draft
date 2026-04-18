import { AbilityType, CardDefinition, EffectType, TargetMapping } from '@shared/engine_types';
/**
* SOS Prepared Card: Strife Scholar // Awaken the Ages
* Using the new streamlined preparedFace schema.
*/
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
    image_url: "https://cards.scryfall.io/png/front/8/d/8de79312-2046-425e-9919-49afe19be81b.png?1775937883",
    entersPrepared: true,
    // The new streamlined field for SOS Prepared cards
    preparedFace: {
        name: "Awaken the Ages",
        image_url: "https://cards.scryfall.io/png/front/8/d/8de79312-2046-425e-9919-49afe19be81b.png?1775937883",
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
                        image_url: "https://cards.scryfall.io/png/front/f/9/f98c0167-7434-4607-87c4-315fa8b6972e.png?1682693862"
                    },
                    targetMapping: TargetMapping.Controller
                }
            ]
        }]
    }
};

