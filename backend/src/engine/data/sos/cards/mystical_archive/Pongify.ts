import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const Pongify: CardDefinition = {
    name: "Pongify",
    manaCost: "{U}",
    colors: ["U"],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    oracleText: "Destroy target creature. It can't be regenerated. Its controller creates a 3/3 green Ape creature token.",
    set: "soa",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                type: TargetType.Creature,
                count: 1
            }],
            effects: [
                {
                    type: EffectType.Destroy
                },
                {
                    type: EffectType.CreateToken,
                    targetMapping: TargetMapping.Controller,
                    amount: 1,
                    tokenBlueprint: {
                        name: "Ape",
                        colors: ["G"],
                        types: ["Creature"],
                        subtypes: ["Ape"],
                        power: 3,
                        toughness: 3,
                        image_url: "https://cards.scryfall.io/normal/front/1/7/17d45763-7182-446a-8b83-9dd2511a07f2.jpg?1562639691"
                    }
                }
            ]
        }
    ],
    scryfall_id: "4131fa63-5afc-4b63-a4b4-f47b4bced87f",
    image_url: "https://cards.scryfall.io/normal/front/4/1/4131fa63-5afc-4b63-a4b4-f47b4bced87f.jpg?1743206367",
    rarity: "uncommon"
};

