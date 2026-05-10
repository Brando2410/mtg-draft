import { AbilityType, CardDefinition, EffectType, Restriction, TargetType, Zone } from '@shared/engine_types';
export const StudiousFirstYearRampantGrowth: CardDefinition = {
    name: "Studious First-Year // Rampant Growth",
    manaCost: "{G}",
    colors: ["G"],
    types: ["Creature"],
    subtypes: ["Bear", "Wizard"],
    keywords: ["Prepared"],
    oracleText: "This creature enters prepared.",
    power: "1",
    toughness: "1",

    entersPrepared: true,

    preparedFace: {
        name: "Rampant Growth",

        manaCost: "{1}{G}",
        colors: ["G"],
        types: ["Sorcery"],
        oracleText: "Search your library for a basic land card, put that card onto the battlefield tapped, then shuffle.",
        abilities: [
            {
                type: AbilityType.Spell,
                effects: [
                    {
                        type: EffectType.SearchLibrary,
                        targetDefinitions: [{
                            type: TargetType.Land,
                            count: 1,
                            restrictions: [Restriction.Basic]
                        }],
                        zone: Zone.Battlefield,
                        tapped: true
                    }
                ]
            }
        ],

    },
    scryfall_id: "24f888dd-785c-4089-a89c-03f9080130ed",
    image_url: "https://cards.scryfall.io/png/front/2/4/24f888dd-785c-4089-a89c-03f9080130ed.png?1775938109",
    rarity: "common"
};

