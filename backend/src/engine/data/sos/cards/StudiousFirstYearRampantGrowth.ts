import { AbilityType, CardDefinition, EffectType, TargetType, Zone } from '@shared/engine_types';
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
    image_url: "https://cards.scryfall.io/png/front/2/4/24f888dd-785c-4089-a89c-03f9080130ed.png?1775938109",
    preparedFace: {
        name: "Rampant Growth",
        image_url: "https://cards.scryfall.io/png/front/d/e/de3f130e-5303-49d9-9366-fbae90d97031.png?1712354645",
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
                        targetDefinition: {
                            type: TargetType.Land,
                            count: 1,
                            restrictions: [
                { type: 'Type', value: 'Basic' }
            ]
                        },
                        zone: Zone.Battlefield,
                        tapped: true
                    }
                ]
            }
        ]
    }
};
    