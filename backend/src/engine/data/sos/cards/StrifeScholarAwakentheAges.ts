import { CardDefinition, AbilityType, EffectType, TargetMapping } from '@shared/engine_types';

/**
 * SOS Prepared Card: Strife Scholar // Awaken the Ages
 * Using the new streamlined preparedFace schema.
 */
export const StrifeScholarAwakentheAges: CardDefinition = {
    name: "Strife Scholar",
    manaCost: "{2}{R}",
    colors: ["R"],
    types: ["Creature"],
    subtypes: ["Orc", "Sorcerer"],
    power: "3",
    toughness: "2",
    keywords: ["Ward—Pay 2 life", "Prepared"],
    oracleText: "Ward—Pay 2 life.\nThis creature enters prepared.",
    entersPrepared: true,

    // The new streamlined field for SOS Prepared cards
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
                        toughness: "2"
                    },
                    targetMapping: TargetMapping.Controller
                }
            ]
        }]
    }
};
