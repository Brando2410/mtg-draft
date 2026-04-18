import { AbilityType, CardDefinition, EffectType, TargetMapping } from '@shared/engine_types';
    export const MusesEncouragement: CardDefinition = {
    name: "Muse's Encouragement",
    manaCost: "{4}{U}",
    scryfall_id: "c59e0004-1d6a-42a1-8ce4-31da2af2e1bf",
    rarity: "common",
    image_url: "https://cards.scryfall.io/normal/front/c/5/c59e0004-1d6a-42a1-8ce4-31da2af2e1bf.jpg?1775937336",
    colors: [
        "U"
    ],
    types: [
        "Instant"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Create a 3/3 blue and red Elemental creature token with flying.\nSurveil 2. (Look at the top two cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.CreateToken,
                    tokenBlueprint: {
                        name: "Elemental",
                        colors: ["U", "R"],
                        types: ["Creature"],
                        subtypes: ["Elemental"],
                        power: "3",
                        toughness: "3",
                        abilities: [
                            {
                                type: AbilityType.Static,
                                keyword: 'Flying'
                            }
                        ]
                    },
                    targetMapping: TargetMapping.Controller
                },
                {
                    type: EffectType.Surveil,
                    amount: 2,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};
    
